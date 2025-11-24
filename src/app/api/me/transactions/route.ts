'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    const email = token?.email as string | undefined
    if (!email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
    const serviceKey = process.env.my_app_SUPABASE_SERVICE_ROLE_KEY as string
    const anonKey = process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY as string
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

    const txRes = await fetch(`${baseUrl}/rest/v1/transactions?user_id=eq.${encodeURIComponent(userId)}&select=id,date,item,amount&order=date.desc`, {
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': anonKey,
      }
    })
    const data = await txRes.json()
    const items = Array.isArray(data)
      ? data.map((t: { id: string; date: string; item: string; amount: number }) => ({ id: t.id, date: t.date, item: t.item, amount: t.amount }))
      : []
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ error: 'server' }, { status: 500 })
  }
}
