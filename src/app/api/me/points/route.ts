'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
    const email = token?.email as string | undefined
    if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL) as string
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || '') as string
    const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || process.env.my_app_SUPABASE_ANON_KEY || '') as string
    if (!baseUrl || !anonKey) return NextResponse.json({ error: 'config' }, { status: 500 })
    const bearer = serviceKey || anonKey

    const res = await fetch(`${baseUrl}/rest/v1/users?select=points,total_points_earned,total_points_spent,email&email=eq.${encodeURIComponent(email)}`, {
      headers: { 'Authorization': `Bearer ${bearer}`, 'apikey': anonKey }
    })
    const arr = await res.json().catch(() => [])
    const row = Array.isArray(arr) ? arr[0] : null
    if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 })
    return NextResponse.json({
      points: row.points ?? 0,
      total_points_earned: row.total_points_earned ?? 0,
      total_points_spent: row.total_points_spent ?? 0,
    })
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}

