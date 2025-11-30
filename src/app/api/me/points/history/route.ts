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

    const userRes = await fetch(`${baseUrl}/rest/v1/users?select=id&email=eq.${encodeURIComponent(email)}`, {
      headers: { 'Authorization': `Bearer ${bearer}`, 'apikey': anonKey }
    })
    const uArr = await userRes.json().catch(() => [])
    const userId = Array.isArray(uArr) ? uArr[0]?.id : null
    if (!userId) return NextResponse.json({ items: [] })

    const txRes = await fetch(`${baseUrl}/rest/v1/points_transactions?user_id=eq.${encodeURIComponent(userId)}&select=id,amount,type,description,related_generation_id,balance_before,balance_after,created_at&order=created_at.desc`, {
      headers: { 'Authorization': `Bearer ${bearer}`, 'apikey': anonKey }
    })
    const txArr = await txRes.json().catch(() => [])
    const items = Array.isArray(txArr) ? txArr.map((t: any) => ({
      id: t.id,
      amount: Number(t.amount) || 0,
      type: String(t.type || ''),
      description: String(t.description || ''),
      created_at: t.created_at,
      balance_before: Number(t.balance_before) || 0,
      balance_after: Number(t.balance_after) || 0,
      related_generation_id: t.related_generation_id || null,
    })) : []
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}

