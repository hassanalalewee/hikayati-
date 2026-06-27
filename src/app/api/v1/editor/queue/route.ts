import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function ok(data: unknown) {
  return NextResponse.json({ ok: true, data })
}
function err(message: string, code: string, status: number) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status })
}

async function requireEditor() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, profile: null, supabase }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return { user, profile, supabase }
}

export async function GET() {
  const { user, profile } = await requireEditor()
  if (!user) return err('Unauthorized', 'unauthorized', 401)
  if (!profile || !['editor', 'admin'].includes(profile.role)) {
    return err('Forbidden', 'forbidden', 403)
  }

  const admin = await createAdminClient()

  const { data: orders } = await admin
    .from('orders')
    .select(`
      id, status, story_goal, dialect, age_group,
      revision_count, sla_deadline, created_at, draft_ready_at,
      review_started_at, assigned_editor_id,
      children ( name, age, personality ),
      story_drafts ( id, qa_score, qa_flags, is_active )
    `)
    .in('status', ['draft_ready', 'under_review', 'revision_requested'])
    .is('deleted_at', null)
    .order('sla_deadline', { ascending: true })

  // Separate into tabs
  const ready      = (orders || []).filter(o => o.status === 'draft_ready' && !o.assigned_editor_id)
  const mine       = (orders || []).filter(o => o.status === 'under_review' && o.assigned_editor_id === user.id)
  const revision   = (orders || []).filter(o => o.status === 'revision_requested')

  return ok({ ready, mine, revision })
}
