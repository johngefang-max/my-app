'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { fal } from '@fal-ai/client'

type TextureSize = 512 | 1024 | 2048
type TrellisMultiInputShape = { image_urls: string[]; texture_size?: TextureSize; mesh_simplify?: number; multiimage_algo?: 'stochastic' | 'multidiffusion' }
type Hunyuan3dV21InputShape = { image_urls: string[]; texture_size?: TextureSize; mesh_simplify?: number }
type TrellisSingleInputShape = {
  image_url: string
  texture_size?: TextureSize
  mesh_simplify?: number
  ss_guidance_strength?: number
  ss_sampling_steps?: number
  slat_guidance_strength?: number
  slat_sampling_steps?: number
  seed?: number
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const provider = url.searchParams.get('provider') || 'free'
    const body = await req.json().catch(() => ({}))
    const image_urls = Array.isArray(body?.image_urls) ? body.image_urls as string[] : []
    const texture_size = body?.texture_size as number | string | undefined
    const mesh_simplify = body?.mesh_simplify as number | undefined
    const ss_guidance_strength = typeof body?.ss_guidance_strength === 'number' ? body.ss_guidance_strength : undefined
    const ss_sampling_steps = typeof body?.ss_sampling_steps === 'number' ? body.ss_sampling_steps : undefined
    const slat_guidance_strength = typeof body?.slat_guidance_strength === 'number' ? body.slat_guidance_strength : undefined
    const slat_sampling_steps = typeof body?.slat_sampling_steps === 'number' ? body.slat_sampling_steps : undefined
    const seed = typeof body?.seed === 'number' ? body.seed : undefined
    if (!process.env.FAL_KEY) {
      console.error('api/fal/3d', 'config')
      return NextResponse.json({ error: 'config' }, { status: 500 })
    }
    if (image_urls.length === 0) {
      console.error('api/fal/3d', 'input')
      return NextResponse.json({ error: 'input' }, { status: 400 })
    }
    fal.config({ credentials: process.env.FAL_KEY })
    const modelId = provider === 'pro' ? 'fal-ai/hunyuan3d-v21' : 'fal-ai/trellis'
    const toBinary = (dataUri: string) => {
      const m = dataUri.match(/^data:(.*?);base64,(.*)$/)
      if (!m) return null
      const mime = m[1] || 'application/octet-stream'
      const b64 = m[2] || ''
      const bin = Buffer.from(b64, 'base64')
      return new Blob([bin], { type: mime })
    }
    const getUploadUrl = (r: unknown): string | null => {
      if (!r) return null
      if (typeof r === 'string') return r
      const maybe = (r as { url?: string }).url
      if (typeof maybe === 'string') return maybe
      const s = String(r)
      if (/^https?:\/\//i.test(s)) return s
      return null
    }
    const logFalError = (stage: string, err: unknown) => {
      const e = err as { status?: number; body?: unknown; requestId?: string; message?: string }
      console.error('api/fal/3d', stage, e?.status ?? '', e?.requestId ?? '', e?.message ?? '')
      try { console.error('api/fal/3d', stage, 'body', JSON.stringify(e?.body)) } catch {}
    }
    let input: TrellisSingleInputShape | TrellisMultiInputShape | Hunyuan3dV21InputShape
    if (provider === 'free') {
      const u0 = image_urls[0]
      let remote: string
      if (typeof u0 === 'string' && u0.startsWith('data:')) {
        const f = toBinary(u0)
        if (!f) return NextResponse.json({ error: 'image' }, { status: 400 })
        try {
          const r = await fal.storage.upload(f as never)
          const url = getUploadUrl(r)
          if (!url) {
            console.error('api/fal/3d', 'upload-url', r)
            return NextResponse.json({ error: 'upload-url' }, { status: 422 })
          }
          remote = url
        } catch (err) {
          console.error('api/fal/3d', 'upload', err)
          return NextResponse.json({ error: 'upload' }, { status: 422 })
        }
      } else {
        try {
          const resp = await fetch(u0)
          const blob = await resp.blob()
          const r = await fal.storage.upload(blob as never)
          const url = getUploadUrl(r)
          if (!url) {
            console.error('api/fal/3d', 'upload-url', r)
            return NextResponse.json({ error: 'upload-url' }, { status: 422 })
          }
          remote = url
        } catch (err) {
          console.error('api/fal/3d', 'upload', err)
          return NextResponse.json({ error: 'upload' }, { status: 422 })
        }
      }
      input = { image_url: remote }
    } else {
      const urls = await Promise.all(
        image_urls.map(async (u) => {
          if (u.startsWith('data:')) {
            const f = toBinary(u)
            if (f) {
              try {
                const r = await fal.storage.upload(f as never)
                const url = getUploadUrl(r)
                return url ?? u
              } catch {
                return u
              }
            }
          }
          return u
        })
      )
      input = { image_urls: urls }
    }
    const tsNum = typeof texture_size === 'number' ? texture_size : (texture_size ? parseInt(String(texture_size), 10) : undefined)
    if (tsNum === 512 || tsNum === 1024 || tsNum === 2048) input.texture_size = tsNum as TextureSize
    if (typeof mesh_simplify === 'number') input.mesh_simplify = Math.max(0.9, Math.min(1, mesh_simplify))
    if (provider === 'free') {
      const singleInput = input as TrellisSingleInputShape
      if (ss_guidance_strength !== undefined) singleInput.ss_guidance_strength = ss_guidance_strength
      if (ss_sampling_steps !== undefined) singleInput.ss_sampling_steps = ss_sampling_steps
      if (slat_guidance_strength !== undefined) singleInput.slat_guidance_strength = slat_guidance_strength
      if (slat_sampling_steps !== undefined) singleInput.slat_sampling_steps = slat_sampling_steps
      if (seed !== undefined) singleInput.seed = seed
    }
    let result
    try {
      result = await fal.subscribe(modelId, { input: input as never, logs: true })
    } catch (err) {
      logFalError('subscribe', err)
      const status = (err as { status?: number }).status ?? 500
      const msg = (err as { message?: string }).message ?? 'server'
      return NextResponse.json({ error: msg }, { status })
    }
    const mesh = result?.data?.model_mesh
    const urlOut = (mesh?.url as string | undefined) || null
    return NextResponse.json({ model_url: urlOut, raw: result?.data })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'server'
    console.error('api/fal/3d', msg, e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
