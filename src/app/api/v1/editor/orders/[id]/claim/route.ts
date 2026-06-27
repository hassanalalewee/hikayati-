import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function ok(data: unknown) {
  return NextResponse.json({ ok: true, data })
}
function err(message: string, code: string, status: number) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status })
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('Unauthorized', 'unauthorized', 401)

  const { data: profile } = await supabase
    .from('user_profiles').select('role').eq('id', user.id).single()
  if (!profile || !['editor', 'admin'].includes(profile.role)) {
    return err('Forbidden', 'forbidden', 403)
  }

  const admin = await createAdminClient()

  // Atomic claim: UPDATE only succeeds if status=draft_ready AND assigned_editor_id IS NULL
  // This prevents race conditions where two editors claim the same order simultaneously
  const { data: updated, error } = await admin
    .from('orders')
    .update({
      assigned_editor_id: user.id,
      status:             'under_review',
      review_started_at:  new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'draft_ready')
    .is('assigned_editor_id', null)
    .select('id')
    .single()

  if (error || !updated) {
    // Either order doesn't exist, wrong status, or already claimed by another editor
    const { data: order } = await admin
      .from('orders').select('status, assigned_editor_id').eq('id', id).single()
    if (!order) return err('Order not found', 'not_found', 404)
    if (order.assigned_editor_id) return err('Order already claimed', 'already_claimed', 409)
    return err('Order is not ready for review', 'invalid_status', 409)
  }

  await admin.from('order_events').insert({
    order_id:    id,
    actor_id:    user.id,
    actor_type:  'editor',
    event_type:  'claimed',
    from_status: 'draft_ready',
    to_status:   'under_review',
  })

  return ok({ claimed: true })
}
