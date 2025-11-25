'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { fal } from '@fal-ai/client'

type ImageItem = { url?: string; data?: string; image?: { url?: string } }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const prompt = body?.prompt as string | undefined
    const image_urls = Array.isArray(body?.image_urls) ? body.image_urls as string[] : []
    const num_images = body?.num_images as number | undefined
    const aspect_ratio = body?.aspect_ratio as string | undefined
    const output_format = body?.output_format as string | undefined
    const of: 'png' | 'jpeg' | 'webp' = output_format === 'jpeg' || output_format === 'webp' ? output_format : 'png'
    const falKey = process.env.FAL_KEY || '42b8cb66-d35e-451a-b039-67a52a101810:99ae2ab1190a2a3d88177218a1c96af8'
    if (!falKey) return NextResponse.json({ error: 'config' }, { status: 500 })
    if (!prompt || image_urls.length === 0) return NextResponse.json({ error: 'input' }, { status: 400 })
    fal.config({ credentials: falKey })
    const ar: '1:1' | '21:9' | '4:3' | '3:2' | '2:3' | '5:4' | '4:5' | '3:4' | '16:9' | '9:16' | undefined =
      aspect_ratio &&
      ['1:1','21:9','4:3','3:2','2:3','5:4','4:5','3:4','16:9','9:16'].includes(aspect_ratio)
        ? (aspect_ratio as '1:1' | '21:9' | '4:3' | '3:2' | '2:3' | '5:4' | '4:5' | '3:4' | '16:9' | '9:16')
        : undefined
    const result = await fal.subscribe('fal-ai/nano-banana/edit', {
      input: {
        prompt,
        image_urls,
        num_images: num_images ?? 1,
        ...(ar ? { aspect_ratio: ar } : {}),
        output_format: of
      },
      logs: false
    })
    const images = Array.isArray(result?.data?.images)
      ? result.data.images
          .map((i: ImageItem) => i?.url || i?.data || i?.image?.url)
          .filter((u: string | undefined): u is string => typeof u === 'string')
      : []
    const desc = typeof result?.data?.description === 'string' ? result.data.description : ''
    return NextResponse.json({ images, description: desc })
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}
