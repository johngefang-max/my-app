import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  try {
    // 检查所有请求头
    const allHeaders: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      allHeaders[key] = value
    })

    // 尝试获取 token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
    })

    // 检查 cookie
    const cookie = request.headers.get('cookie')

    const result = {
      timestamp: new Date().toISOString(),
      headers: {
        hasCookie: !!cookie,
        cookieLength: cookie ? cookie.length : 0,
        cookiePreview: cookie ? cookie.substring(0, 100) + '...' : null
      },
      token: {
        found: !!token,
        email: token?.email,
        name: token?.name,
        exp: token?.exp
      },
      env: {
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'set' : 'missing',
        AUTH_SECRET: process.env.AUTH_SECRET ? 'set' : 'missing'
      },
      allHeaders: allHeaders
    }

    return NextResponse.json(result)

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}