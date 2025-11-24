'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const urlParam = new URL(req.url).searchParams.get('url')
    if (!urlParam) return NextResponse.json({ error: 'missing_url' }, { status: 400 })
    const target = new URL(urlParam)
    if (!['http:', 'https:'].includes(target.protocol)) return NextResponse.json({ error: 'invalid_protocol' }, { status: 400 })

    const res = await fetch(target, { cache: 'no-store' })
    if (!res.ok) return NextResponse.json({ error: 'upstream' }, { status: res.status })

    const contentType = res.headers.get('content-type') || 'application/octet-stream'
    const buf = await res.arrayBuffer()
    return new NextResponse(Buffer.from(buf), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=60',
      },
    })
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}

