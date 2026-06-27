import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('user_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })

  const admin = await createAdminClient()

  // Get the active draft — admin can read regardless of order status
  const { data: draft } = await admin
    .from('story_drafts')
    .select('id, title, content, edited_content, word_count, qa_score, qa_flags, editor_notes, created_at')
    .eq('order_id', orderId)
    .eq('is_active', true)
    .single()

  return NextResponse.json({ ok: true, data: draft || null })
}
