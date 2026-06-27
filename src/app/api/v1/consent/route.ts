import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function err(message: string, code: string, status: number) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status })
}

// GET /api/v1/consent — check if user has given consent
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('Unauthorized', 'unauthorized', 401)

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('ai_consent, consent_at')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ ok: true, data: { ai_consent: profile?.ai_consent ?? false } })
}

// POST /api/v1/consent — record AI consent for authenticated user
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('Unauthorized', 'unauthorized', 401)

  let body: { ai_consent?: boolean }
  try { body = await req.json() } catch { return err('Invalid JSON', 'invalid_body', 400) }

  if (body.ai_consent !== true) {
    return err('ai_consent must be true', 'validation_error', 400)
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({ ai_consent: true, consent_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return err('Failed to save consent', 'db_error', 500)

  return NextResponse.json({ ok: true, data: { ai_consent: true } })
}
