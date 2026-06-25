import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // No server-side auth checks here — pages handle their own auth
  // This avoids Edge Runtime issues with Supabase cookie detection
  return NextResponse.next({ request })
}
