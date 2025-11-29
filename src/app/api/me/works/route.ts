'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const email = token?.email as string | undefined
    if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL) as string
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || '') as string
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || process.env.my_app_SUPABASE_ANON_KEY || '') as string
    if (!baseUrl || !anonKey) return NextResponse.json({ error: 'config' }, { status: 500 })
    const bearer = serviceKey || anonKey

    const userRes = await fetch(`${baseUrl}/rest/v1/users?select=id&email=eq.${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey,
      }
    })
    const users = await userRes.json()
    const userId = users?.[0]?.id
    if (!userId) return NextResponse.json({ items: [] })

    const worksRes = await fetch(`${baseUrl}/rest/v1/models?user_id=eq.${encodeURIComponent(userId)}&select=id,title,created_at&order=created_at.desc`, {
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey,
      }
    })
    const data = await worksRes.json()
    const items = Array.isArray(data)
      ? data.map((w: { id: string; title: string }) => ({ id: w.id, title: w.title, href: `/gallery/${w.id}` }))
      : []
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const email = token?.email as string | undefined
    if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const title = (body?.title as string | undefined) || '未命名作品'
    const model_url = (body?.model_url as string | undefined) || undefined
    const model_file_name = (body?.model_file_name as string | undefined) || undefined
    let slugBase = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
    if (!slugBase) slugBase = 'work'

    const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL) as string
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || '') as string
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || process.env.my_app_SUPABASE_ANON_KEY || '') as string
    if (!baseUrl || !anonKey) return NextResponse.json({ error: 'config' }, { status: 500 })
    const bearer = serviceKey || anonKey

    const userRes = await fetch(`${baseUrl}/rest/v1/users?select=id&email=eq.${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey,
      }
    })
    const users = await userRes.json()
    const userId = users?.[0]?.id
    if (!userId) return NextResponse.json({ error: 'user' }, { status: 404 })

    const modelInsertRes = await fetch(`${baseUrl}/rest/v1/models`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([{ user_id: userId, title, description: null, tags: [], is_public: false }])
    })
    const modelIns = await modelInsertRes.json().catch(() => null)
    const modelId = Array.isArray(modelIns) ? modelIns[0]?.id : null
    if (!modelId) return NextResponse.json({ error: 'insert_model' }, { status: 500 })

    if (model_url) {
      await fetch(`${baseUrl}/rest/v1/model_files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearer}`,
          'apikey': anonKey,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify([{ model_id: modelId, file_url: model_url, thumbnail_url: null, format: (model_file_name?.split('.').pop() || 'glb'), size_bytes: 0, storage_path: model_file_name || 'model.glb', is_primary: true }])
      })
    }

    return NextResponse.json({ id: modelId, title, href: `/gallery/${modelId}` })
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}
