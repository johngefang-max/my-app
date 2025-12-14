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

  console.log('GET /api/me/user called for email:', email)

  if (!email) {
    console.error('No email found in token')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!baseUrl || !anonKey) {
    console.error('Missing database configuration')
    return NextResponse.json({ error: 'config' }, { status: 500 })
  }
  const bearer = serviceKey || anonKey

  const checkResponse = await fetch(`${baseUrl}/rest/v1/users?select=*&email=eq.${encodeURIComponent(email)}`, {
    headers: { 'Authorization': `Bearer ${bearer}`, 'apikey': anonKey }
  })

  const responseText = await checkResponse.text()
  console.log('GET response status:', checkResponse.status, 'response:', responseText)

  if (!checkResponse.ok) {
    console.error('GET request failed:', responseText)
    return NextResponse.json({ error: 'request_failed', details: responseText }, { status: checkResponse.status })
  }

  const arr = await checkResponse.json()
  const row = Array.isArray(arr) && arr.length > 0 ? arr[0] : null
  if (!row) {
    console.error('User not found in database')
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  console.log('User found:', { id: row.id, email: row.email, points: row.points })
  return NextResponse.json({ user: row })
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
  const email = token?.email as string | undefined
  const name = token?.name as string | undefined
  const image = (token as any)?.picture as string | undefined
  const { baseUrl, serviceKey, anonKey } = env()

  console.log('POST /api/me/user called:', { email, name, hasImage: !!image })

  if (!email) {
    console.error('No email found in token')
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!baseUrl || !anonKey) {
    console.error('Missing database configuration')
    return NextResponse.json({ error: 'config' }, { status: 500 })
  }
  const bearer = serviceKey || anonKey

  // 首先检查用户是否已存在
  const checkResponse = await fetch(`${baseUrl}/rest/v1/users?select=*&email=eq.${encodeURIComponent(email)}`, {
    headers: { 'Authorization': `Bearer ${bearer}`, 'apikey': anonKey }
  })

  if (checkResponse.ok) {
    const existingUsers = await checkResponse.json()
    const existingUser = Array.isArray(existingUsers) && existingUsers.length > 0 ? existingUsers[0] : null

    if (existingUser) {
      console.log('User already exists, returning existing user:', { id: existingUser.id, email: existingUser.email, points: existingUser.points })
      return NextResponse.json({ user: existingUser })
    }
  }

  const baseName = (name || email.split('@')[0] || '').toLowerCase().replace(/[^a-z0-9\-_.]/g, '-')
  const username = baseName || `user-${Math.random().toString(36).slice(2,8)}`

  // 只有新用户才获得10积分
  const body = [{
    email,
    username,
    avatar_url: image ?? null,
    plan: 'free',
    usage_count: 0,
    storage_used_bytes: 0,
    max_storage_bytes: 104857600,  // 使用数据库默认值 100MB
    points: 10,           // 首次注册赠送10积分
    total_points_earned: 10,
    total_points_spent: 0,
  }]

  console.log('Creating new user with body:', body)

  const upsert = await fetch(`${baseUrl}/rest/v1/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearer}`,
      'apikey': anonKey,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(body)
  })

  const responseText = await upsert.text()
  console.log('Create response status:', upsert.status, 'response:', responseText)

  if (!upsert.ok) {
    console.error('Failed to create user:', responseText)
    return NextResponse.json({ error: 'create_failed', details: responseText }, { status: upsert.status })
  }

  const rep = JSON.parse(responseText)
  const row = Array.isArray(rep) ? rep[0] : null
  if (!row) {
    console.error('No user returned from create')
    return NextResponse.json({ error: 'create_failed', details: 'No user returned' }, { status: 500 })
  }

  console.log('New user created successfully:', { id: row.id, email: row.email, points: row.points })
  return NextResponse.json({ user: row })
}

