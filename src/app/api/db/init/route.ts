'use server'

import { NextResponse } from 'next/server'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

function getEnv() {
  const baseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL || '').trim()
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || '').trim()
  const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || '').trim()
  const projectRef = (process.env.SUPABASE_PROJECT_REF || '').trim()
  const accessToken = (process.env.SUPABASE_ACCESS_TOKEN || '').trim()
  return { baseUrl, serviceKey, anonKey, projectRef, accessToken }
}

async function tableExists(baseUrl: string, anonKey: string, bearer: string, table: string) {
  try {
    const res = await fetch(`${baseUrl}/rest/v1/${table}?select=id&limit=1`, {
      headers: { 'Authorization': `Bearer ${bearer}`, 'apikey': anonKey }
    })
    return res.ok
  } catch {
    return false
  }
}

export async function GET() {
  const { baseUrl, serviceKey, anonKey, projectRef, accessToken } = getEnv()
  if (!baseUrl || !anonKey) {
    const missing = [
      !baseUrl ? 'NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or my_app_SUPABASE_URL/NEXT_PUBLIC_my_app_SUPABASE_URL' : null,
      !anonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY/SUPABASE_ANON_KEY or NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY/my_app_SUPABASE_ANON_KEY' : null,
    ].filter(Boolean)
    return NextResponse.json({ status: 'error', message: 'Supabase env missing', missing }, { status: 500 })
  }

  const requiredTables = ['users','models','model_files','model_views','transactions']
  const missing: string[] = []
  const bearer = serviceKey || anonKey
  for (const t of requiredTables) {
    const ok = await tableExists(baseUrl, anonKey, bearer, t)
    if (!ok) missing.push(t)
  }

  if (missing.length === 0) {
    return NextResponse.json({ status: 'ok', message: 'All tables exist', missing })
  }

  // Try to apply migrations via Supabase Management API if credentials provided
  try {
    if (missing.length > 0 && projectRef && accessToken) {
      const migDir = join(process.cwd(), 'supabase', 'migrations')
      const files = readdirSync(migDir).filter(f => f.endsWith('.sql')).sort()
      const sql = files.map(f => readFileSync(join(migDir, f), 'utf-8')).join('\n\n')
      const resp = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/sql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: sql })
      })
      const body = await resp.json().catch(() => ({}))
      if (resp.ok) {
        return NextResponse.json({ status: 'ok', message: 'Applied migrations via Management API', missing, result: body })
      }
      return NextResponse.json({ status: 'error', message: 'Management API failed', missing, result: body }, { status: 500 })
    }
  } catch (e) {
    // fallthrough to guidance
  }

  return NextResponse.json({
    status: 'missing',
    message: 'Tables missing; supply SUPABASE_PROJECT_REF and SUPABASE_ACCESS_TOKEN to auto-apply migrations.',
    missing,
  }, { status: 200 })
}
