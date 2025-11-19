import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isStatic = pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/static')
  if (isStatic) return NextResponse.next()

  const isHome = pathname === '/'
  const authed = req.cookies.get('auth')?.value === 'true'

  if (isHome || authed) return NextResponse.next()

  const url = req.nextUrl.clone()
  url.pathname = '/'
  url.searchParams.set('auth_required', '1')
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}