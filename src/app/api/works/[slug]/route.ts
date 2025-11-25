'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) as string
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.my_app_SUPABASE_SERVICE_ROLE_KEY) as string
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY) as string
    if (!baseUrl || !serviceKey || !anonKey) return NextResponse.json({ error: 'config' }, { status: 500 })

    const { slug } = await context.params
    const res = await fetch(`${baseUrl}/rest/v1/works?slug=eq.${encodeURIComponent(slug)}&select=id,title,slug,model_url,model_file_name,created_at&limit=1`, {
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': anonKey,
      }
    })
    const data = await res.json().catch(() => [])
    const item = Array.isArray(data) ? data[0] : null
    if (!item) return NextResponse.json({ error: 'not_found' }, { status: 404 })
    return NextResponse.json({ id: item.id, title: item.title, slug: item.slug, model_url: item.model_url ?? null, model_file_name: item.model_file_name ?? null })
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}
