import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const isAuthRoute = pathname === '/login' || pathname === '/register'
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/stories') ||
    pathname.startsWith('/children') ||
    pathname.startsWith('/upgrade') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/reports')

  // Supabase SSR browser client stores session in cookies named:
  // sb-<project-ref>-auth-token  OR  sb-<project-ref>-auth-token.0 (chunked)
  const allCookies = request.cookies.getAll()
  const hasSession = allCookies.some(
    c => c.name.startsWith('sb-') && c.name.includes('-auth-token')
  )

  if (!hasSession && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (hasSession && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next({ request })
}
