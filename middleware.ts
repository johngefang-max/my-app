'use server'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const protectedPaths = ['/generator']

  if (protectedPaths.some(p => pathname.startsWith(p))) {
    let authed = false
    try {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
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
  matcher: ['/generator']
}

