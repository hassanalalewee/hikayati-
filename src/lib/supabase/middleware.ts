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

  // Check for Supabase auth cookie (sb-*-auth-token)
  const hasSession = request.cookies.getAll().some(c => c.name.includes('-auth-token'))

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
