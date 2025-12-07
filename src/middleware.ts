import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const m = pathname.match(/^\/(zh|en)(?:\/(.*))?$/)
  if (m) {
    const lang = m[1]
    const rest = m[2] ? `/${m[2]}` : '/'
    const url = new URL(rest, request.url)
    const response = NextResponse.rewrite(url)
    response.cookies.set('language', lang, { path: '/', sameSite: 'lax' })
    return response
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/zh', '/zh/:path*', '/en', '/en/:path*']
}
