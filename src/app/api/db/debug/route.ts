'use server'

import { NextResponse } from 'next/server'

function mask(v: string) {
  if (!v) return ''
  if (v.length <= 8) return '***'
  return v.slice(0, 4) + '***' + v.slice(-4)
}

function env() {
  const SUPABASE_URL_RAW = (process.env.SUPABASE_URL || '').trim()
  const MY_APP_SUPABASE_URL_RAW = (process.env.my_app_SUPABASE_URL || '').trim()
  const NEXT_PUBLIC_SUPABASE_URL_RAW = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const NEXT_PUBLIC_MY_APP_SUPABASE_URL_RAW = (process.env.NEXT_PUBLIC_my_app_SUPABASE_URL || '').trim()
  const SUPABASE_URL = SUPABASE_URL_RAW || MY_APP_SUPABASE_URL_RAW
  const NEXT_PUBLIC_SUPABASE_URL = NEXT_PUBLIC_SUPABASE_URL_RAW || NEXT_PUBLIC_MY_APP_SUPABASE_URL_RAW
  const SUPABASE_ANON_KEY_RAW = (process.env.SUPABASE_ANON_KEY || '').trim()
  const MY_APP_SUPABASE_ANON_KEY_RAW = (process.env.my_app_SUPABASE_ANON_KEY || '').trim()
  const NEXT_PUBLIC_SUPABASE_ANON_KEY_RAW = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()
  const NEXT_PUBLIC_MY_APP_SUPABASE_ANON_KEY_RAW = (process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || '').trim()
  const SUPABASE_ANON_KEY = SUPABASE_ANON_KEY_RAW || MY_APP_SUPABASE_ANON_KEY_RAW
  const NEXT_PUBLIC_SUPABASE_ANON_KEY = NEXT_PUBLIC_SUPABASE_ANON_KEY_RAW || NEXT_PUBLIC_MY_APP_SUPABASE_ANON_KEY_RAW
  const SUPABASE_SERVICE_ROLE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  const SUPABASE_PROJECT_REF = (process.env.SUPABASE_PROJECT_REF || '').trim()
  const SUPABASE_ACCESS_TOKEN = (process.env.SUPABASE_ACCESS_TOKEN || '').trim()
  const baseUrl = NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL
  const anonKey = NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY
  const serviceKey = SUPABASE_SERVICE_ROLE_KEY
  return {
    raw: {
      SUPABASE_URL: mask(SUPABASE_URL_RAW),
      my_app_SUPABASE_URL: mask(MY_APP_SUPABASE_URL_RAW),
      NEXT_PUBLIC_SUPABASE_URL: mask(NEXT_PUBLIC_SUPABASE_URL_RAW),
      NEXT_PUBLIC_my_app_SUPABASE_URL: mask(NEXT_PUBLIC_MY_APP_SUPABASE_URL_RAW),
      SUPABASE_ANON_KEY: mask(SUPABASE_ANON_KEY_RAW),
      my_app_SUPABASE_ANON_KEY: mask(MY_APP_SUPABASE_ANON_KEY_RAW),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(NEXT_PUBLIC_SUPABASE_ANON_KEY_RAW),
      NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY: mask(NEXT_PUBLIC_MY_APP_SUPABASE_ANON_KEY_RAW),
      SUPABASE_SERVICE_ROLE_KEY: mask(SUPABASE_SERVICE_ROLE_KEY),
      SUPABASE_PROJECT_REF: SUPABASE_PROJECT_REF,
      SUPABASE_ACCESS_TOKEN: mask(SUPABASE_ACCESS_TOKEN),
    },
    resolved: { baseUrl, anonKey: mask(anonKey), serviceKey: mask(serviceKey) }
  }
}

export async function GET() {
  const e = env()
  const baseUrl = e.resolved.baseUrl
  const anonKey = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || process.env.SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY
    || process.env.my_app_SUPABASE_ANON_KEY
    || ''
  ).trim()
  const bearer = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || anonKey)

  const checks: Record<string, unknown> = { env: e }
  
  if (!baseUrl || !anonKey) {
    const missing = [
      !baseUrl ? 'NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or NEXT_PUBLIC_my_app_SUPABASE_URL/my_app_SUPABASE_URL' : null,
      !anonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY/SUPABASE_ANON_KEY or NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY/my_app_SUPABASE_ANON_KEY' : null,
    ].filter(Boolean)
    return NextResponse.json({ status: 'error', message: 'Supabase env missing', missing, ...checks }, { status: 500 })
  }

  try {
    const ready = await fetch(`${baseUrl}/rest-admin/v1/ready`).then(r => ({ ok: r.ok, status: r.status })).catch(() => ({ ok: false }))
    const authHealth = await fetch(`${baseUrl}/auth/v1/health`).then(r => ({ ok: r.ok, status: r.status })).catch(() => ({ ok: false }))
    checks.connectivity = { ready, authHealth }
  } catch {}

  const tables = ['users','models','model_files','model_views','transactions','generations','points_transactions']
  const tableStatus: Record<string, number> = {}
  for (const t of tables) {
    try {
      const r = await fetch(`${baseUrl}/rest/v1/${t}?select=id&limit=1`, { headers: { 'Authorization': `Bearer ${bearer}`, 'apikey': anonKey }})
      tableStatus[t] = r.status
    } catch {
      tableStatus[t] = 0
    }
  }
  checks.tables = tableStatus

  return NextResponse.json({ status: 'ok', ...checks })
}

