'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { fal } from '@fal-ai/client'

type ImageItem = { url?: string; data?: string; image?: { url?: string } }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const prompt = body?.prompt as string | undefined
    const num_images = body?.num_images as number | undefined
    const aspect_ratio = body?.aspect_ratio as string | undefined
    const output_format = body?.output_format as string | undefined
    const ar: '1:1' | '21:9' | '4:3' | '3:2' | '2:3' | '5:4' | '4:5' | '3:4' | '16:9' | '9:16' | undefined =
      aspect_ratio &&
      ['1:1','21:9','4:3','3:2','2:3','5:4','4:5','3:4','16:9','9:16'].includes(aspect_ratio)
        ? (aspect_ratio as '1:1' | '21:9' | '4:3' | '3:2' | '2:3' | '5:4' | '4:5' | '3:4' | '16:9' | '9:16')
        : undefined
    const of: 'png' | 'jpeg' | 'webp' = output_format === 'jpeg' || output_format === 'webp' ? output_format : 'png'
    if (!process.env.FAL_KEY) return NextResponse.json({ error: 'config' }, { status: 500 })
    if (!prompt) return NextResponse.json({ error: 'prompt' }, { status: 400 })
    fal.config({ credentials: process.env.FAL_KEY })
    const result = await fal.subscribe('fal-ai/nano-banana', {
      input: {
        prompt,
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
