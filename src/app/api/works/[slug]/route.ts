'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function GET(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL) as string
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || '') as string
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || process.env.my_app_SUPABASE_ANON_KEY || '') as string
    if (!baseUrl || !anonKey) return NextResponse.json({ error: 'config' }, { status: 500 })
    const bearer = serviceKey || anonKey

    const { slug } = await context.params
    const res = await fetch(`${baseUrl}/rest/v1/models?id=eq.${encodeURIComponent(slug)}&select=id,title,created_at&limit=1`, {
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey,
      }
    })
    const modelArr = await res.json().catch(() => [])
    const model = Array.isArray(modelArr) ? modelArr[0] : null
    if (!model) return NextResponse.json({ error: 'not_found' }, { status: 404 })
    const filesRes = await fetch(`${baseUrl}/rest/v1/model_files?model_id=eq.${encodeURIComponent(model.id)}&select=file_url,storage_path,is_primary,format&order=is_primary.desc`, {
      headers: { 'Authorization': `Bearer ${bearer}`, 'apikey': anonKey }
    })
    const files = await filesRes.json().catch(() => [])
    const primary = Array.isArray(files) ? files[0] : null
    return NextResponse.json({ id: model.id, title: model.title, model_url: primary?.file_url ?? null, model_file_name: primary?.storage_path ?? null })
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}
