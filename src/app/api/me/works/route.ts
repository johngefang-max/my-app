'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    const email = token?.email as string | undefined
    if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) as string
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.my_app_SUPABASE_SERVICE_ROLE_KEY) as string
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY) as string
    if (!baseUrl || !serviceKey || !anonKey) return NextResponse.json({ error: 'config' }, { status: 500 })

    const userRes = await fetch(`${baseUrl}/rest/v1/users?select=id&email=eq.${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': anonKey,
      }
    })
    const users = await userRes.json()
    const userId = users?.[0]?.id
    if (!userId) return NextResponse.json({ items: [] })

    const worksRes = await fetch(`${baseUrl}/rest/v1/works?user_id=eq.${encodeURIComponent(userId)}&select=id,title,slug,created_at&order=created_at.desc`, {
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': anonKey,
      }
    })
    const data = await worksRes.json()
    const items = Array.isArray(data)
      ? data.map((w: { id: string; title: string; slug: string }) => ({ id: w.id, title: w.title, href: `/gallery/${w.slug}` }))
      : []
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    const email = token?.email as string | undefined
    if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const title = (body?.title as string | undefined) || '未命名作品'
    let slugBase = title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
    if (!slugBase) slugBase = 'work'

    const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) as string
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.my_app_SUPABASE_SERVICE_ROLE_KEY) as string
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY) as string
    if (!baseUrl || !serviceKey || !anonKey) return NextResponse.json({ error: 'config' }, { status: 500 })

    const userRes = await fetch(`${baseUrl}/rest/v1/users?select=id&email=eq.${encodeURIComponent(email)}`, {
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': anonKey,
      }
    })
    const users = await userRes.json()
    const userId = users?.[0]?.id
    if (!userId) return NextResponse.json({ error: 'user' }, { status: 404 })

    let slug = `${slugBase}-${Date.now().toString(36)}`
    for (let i = 0; i < 2; i++) {
      const check = await fetch(`${baseUrl}/rest/v1/works?slug=eq.${encodeURIComponent(slug)}&select=id`, {
        headers: { 'Authorization': `Bearer ${serviceKey}`, 'apikey': anonKey }
      })
      const exists = await check.json()
      if (!Array.isArray(exists) || exists.length === 0) break
      slug = `${slugBase}-${Math.random().toString(36).slice(2, 8)}`
    }

    const insertRes = await fetch(`${baseUrl}/rest/v1/works`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': anonKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify([{ user_id: userId, title, slug }])
    })
    const created = await insertRes.json()
    const item = Array.isArray(created) ? created[0] : null
    if (!item) return NextResponse.json({ error: 'insert' }, { status: 500 })
    return NextResponse.json({ id: item.id, title: item.title, href: `/gallery/${item.slug}` })
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}
