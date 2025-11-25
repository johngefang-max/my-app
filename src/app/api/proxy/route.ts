'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url)
    const urlParam = u.searchParams.get('url')
    const filenameParam = u.searchParams.get('filename')
    if (!urlParam) return NextResponse.json({ error: 'missing_url' }, { status: 400 })
    const target = new URL(urlParam)
    if (!['http:', 'https:'].includes(target.protocol)) return NextResponse.json({ error: 'invalid_protocol' }, { status: 400 })

    const res = await fetch(target, { cache: 'no-store' })
    if (!res.ok) return NextResponse.json({ error: 'upstream' }, { status: res.status })

    const contentType = res.headers.get('content-type') || 'application/octet-stream'
    const buf = await res.arrayBuffer()
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=60',
    }
    if (filenameParam) {
      const safe = filenameParam.replace(/[^a-zA-Z0-9._-]/g, '_')
      headers['Content-Disposition'] = `attachment; filename="${safe}"`
    }
    return new NextResponse(Buffer.from(buf), { status: 200, headers })
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}
