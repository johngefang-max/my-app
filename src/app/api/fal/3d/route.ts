'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { fal } from '@fal-ai/client'

type TextureSize = '512' | '1024' | '2048'
type TrellisMultiInputShape = { image_urls: string[]; texture_size?: TextureSize; mesh_simplify?: number }
type Hunyuan3dV21InputShape = { image_urls: string[]; texture_size?: TextureSize; mesh_simplify?: number }

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const provider = url.searchParams.get('provider') || 'free'
    const body = await req.json().catch(() => ({}))
    const image_urls = Array.isArray(body?.image_urls) ? body.image_urls as string[] : []
    const texture_size = body?.texture_size as number | string | undefined
    const mesh_simplify = body?.mesh_simplify as number | undefined
    if (!process.env.FAL_KEY) return NextResponse.json({ error: 'config' }, { status: 500 })
    if (image_urls.length === 0) return NextResponse.json({ error: 'input' }, { status: 400 })
    fal.config({ credentials: process.env.FAL_KEY })
    const modelId = provider === 'pro' ? 'fal-ai/hunyuan3d-v21' : 'fal-ai/trellis/multi'
    const input: TrellisMultiInputShape | Hunyuan3dV21InputShape = { image_urls }
    const tsStr = texture_size ? String(texture_size) : undefined
    if (tsStr === '512' || tsStr === '1024' || tsStr === '2048') input.texture_size = tsStr
    if (typeof mesh_simplify === 'number') input.mesh_simplify = mesh_simplify
    const submit = await fal.queue.submit(modelId, { input })
    const result = await fal.queue.result(modelId, { requestId: submit.request_id as string })
    const mesh = result?.data?.model_mesh
    const urlOut = (mesh?.url as string | undefined) || null
    return NextResponse.json({ model_url: urlOut, raw: result?.data })
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}
