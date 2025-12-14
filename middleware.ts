'use server'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const protectedPaths = ['/generator']

  // 排除 /admin 路由，不需要认证
  if (pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // 重定向逻辑：访问根路径时重定向到 /en
  if (pathname === '/') {
    // 检查是否有语言偏好cookie
    const languagePreference = req.cookies.get('language')?.value
    const preferredLocale = languagePreference || 'en' // 默认英语

    const url = req.nextUrl.clone()
    url.pathname = `/${preferredLocale}`
    return NextResponse.redirect(url)
  }

  if (protectedPaths.some(p => pathname.startsWith(p))) {
    let authed = false
    try {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET })
      authed = !!token
    } catch {}

    const sessionCookie = req.cookies.get('next-auth.session-token') ?? req.cookies.get('__Secure-next-auth.session-token')
    const localAuth = req.cookies.get('auth')?.value === 'true'
    authed = authed || !!sessionCookie || localAuth

    if (!authed) {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('redirect', pathname)
      url.searchParams.set('login', '1')
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/generator']
}
