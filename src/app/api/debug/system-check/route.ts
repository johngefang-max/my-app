import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function POST(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    step: 'start',
    requestHeaders: {},
    envVars: {}
  }

  try {
    // 记录请求头
    debugInfo.step = 'recording_headers'
    debugInfo.requestHeaders = {
      cookie: request.headers.get('cookie') ? 'present' : 'missing',
      contentType: request.headers.get('content-type'),
      authorization: request.headers.get('authorization') ? 'present' : 'missing'
    }

    // 记录环境变量
    debugInfo.step = 'checking_env'
    debugInfo.envVars = {
      my_app_SUPABASE_URL: process.env.my_app_SUPABASE_URL ? 'set' : 'missing',
      my_app_SUPABASE_SERVICE_ROLE_KEY: process.env.my_app_SUPABASE_SERVICE_ROLE_KEY ? 'set (length: ' + process.env.my_app_SUPABASE_SERVICE_ROLE_KEY.length + ')' : 'missing',
      NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY ? 'set (length: ' + process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY.length + ')' : 'missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'set' : 'missing',
      AUTH_SECRET: process.env.AUTH_SECRET ? 'set' : 'missing'
    }

    // 获取 token
    debugInfo.step = 'getting_token'
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
    })

    debugInfo.token = {
      exists: !!token,
      email: token?.email,
      name: token?.name
    }

    if (!token?.email) {
      debugInfo.error = 'No authenticated user found'
      return NextResponse.json({ debugInfo }, { status: 401 })
    }

    // 测试数据库连接
    debugInfo.step = 'testing_db_connection'
    const baseUrl = process.env.my_app_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_my_app_SUPABASE_URL
    const serviceKey = process.env.my_app_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const anonKey = process.env.NEXT_PUBLIC_my_app_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.my_app_SUPABASE_ANON_KEY || ''
    const bearer = serviceKey || anonKey

    debugInfo.dbConfig = {
      baseUrl: baseUrl ? baseUrl.substring(0, 20) + '...' : 'missing',
      hasBearer: !!bearer,
      bearerType: serviceKey ? 'service' : 'anon'
    }

    // 测试简单查询
    debugInfo.step = 'testing_db_query'
    const testResponse = await fetch(`${baseUrl}/rest/v1/users?select=count`, {
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'apikey': anonKey
      }
    })

    debugInfo.testQuery = {
      status: testResponse.status,
      statusText: testResponse.statusText,
      ok: testResponse.ok
    }

    if (!testResponse.ok) {
      const errorText = await testResponse.text()
      debugInfo.testQuery.error = errorText
      debugInfo.error = 'Database query failed'
      return NextResponse.json({ debugInfo }, { status: 500 })
    }

    // 测试表是否存在
    debugInfo.step = 'checking_tables'
    const tables = ['users', 'generations', 'points_transactions']
    const tableChecks: any = {}

    for (const table of tables) {
      try {
        const res = await fetch(`${baseUrl}/rest/v1/${table}?select=count`, {
          headers: {
            'Authorization': `Bearer ${bearer}`,
            'apikey': anonKey
          }
        })
        tableChecks[table] = {
          exists: res.ok,
          status: res.status
        }
      } catch (e) {
        tableChecks[table] = {
          exists: false,
          error: e instanceof Error ? e.message : String(e)
        }
      }
    }

    debugInfo.tableChecks = tableChecks

    debugInfo.step = 'completed'
    return NextResponse.json({ debugInfo, success: true })

  } catch (error) {
    debugInfo.step = 'error'
    debugInfo.error = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: (error as any)?.constructor?.name || 'Unknown'
    }

    return NextResponse.json({ debugInfo }, { status: 500 })
  }
}