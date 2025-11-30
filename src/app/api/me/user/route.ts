'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

function env() {
  const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL || '').trim()
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || '').trim()
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || process.env.my_app_SUPABASE_ANON_KEY || '').trim()
  return { baseUrl, serviceKey, anonKey }
}

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
  const email = token?.email as string | undefined
  const { baseUrl, serviceKey, anonKey } = env()
  if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (!baseUrl || !anonKey) return NextResponse.json({ error: 'config' }, { status: 500 })
  const bearer = serviceKey || anonKey

  const res = await fetch(`${baseUrl}/rest/v1/users?select=*&email=eq.${encodeURIComponent(email)}`, {
    headers: { 'Authorization': `Bearer ${bearer}`, 'apikey': anonKey }
  })
  const arr = await res.json().catch(() => [])
  const row = Array.isArray(arr) ? arr[0] : null
  if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  return NextResponse.json({ user: row })
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
  const email = token?.email as string | undefined
  const name = token?.name as string | undefined
  const image = (token as any)?.picture as string | undefined
  const { baseUrl, serviceKey, anonKey } = env()
  if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (!baseUrl || !anonKey) return NextResponse.json({ error: 'config' }, { status: 500 })
  const bearer = serviceKey || anonKey

  const baseName = (name || email.split('@')[0] || '').toLowerCase().replace(/[^a-z0-9\-_.]/g, '-')
  const username = baseName || `user-${Math.random().toString(36).slice(2,8)}`

  const body = [{
    email,
    username,
    avatar_url: image ?? null,
    plan: 'free',
    usage_count: 0,
    storage_used_bytes: 0,
    max_storage_bytes: 1073741824,
    points: 10,
    total_points_earned: 10,
    total_points_spent: 0,
  }]

  const upsert = await fetch(`${baseUrl}/rest/v1/users?on_conflict=email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearer}`,
      'apikey': anonKey,
      'Prefer': 'resolution=merge-duplicates,return=representation'
    },
    body: JSON.stringify(body)
  })
  const rep = await upsert.json().catch(() => [])
  const row = Array.isArray(rep) ? rep[0] : null
  if (!row) return NextResponse.json({ error: 'upsert_failed' }, { status: 500 })
  return NextResponse.json({ user: row })
}

