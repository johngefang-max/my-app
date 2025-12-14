import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  try {
    // 获取当前用户的 token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET
    })

    if (!token) {
      return NextResponse.json({ error: 'No token found' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      token: token,
      // 注意：不要在生产环境中返回完整的 token
      // 这里只是为了调试
    })

  } catch (error) {
    console.error('Token error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}