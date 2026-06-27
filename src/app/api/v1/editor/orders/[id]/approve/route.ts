import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendStoryDeliveryEmail } from '@/lib/email/resend'

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

  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
  if (!profile || !['editor', 'admin'].includes(profile.role)) return err('Forbidden', 'forbidden', 403)

  const admin = await createAdminClient()

  const { data: order } = await admin
    .from('orders')
    .select('id, status, assigned_editor_id, parent_id, children ( name )')
    .eq('id', id)
    .single()

  if (!order) return err('Order not found', 'not_found', 404)
  if (order.status !== 'under_review') return err('Order is not under review', 'invalid_status', 409)
  if (order.assigned_editor_id !== user.id && profile.role !== 'admin') {
    return err('Not assigned to this order', 'forbidden', 403)
  }

  // Get active draft (use edited_content if present, else content)
  const { data: draft } = await admin
    .from('story_drafts')
    .select('id, title, content, edited_content')
    .eq('order_id', id)
    .eq('is_active', true)
    .single()

  if (!draft) return err('No active draft', 'not_found', 404)

  const finalContent = draft.edited_content || draft.content

  // Transition: approved → packaging → delivered
  await admin.from('orders').update({
    status:       'approved',
    approved_at:  new Date().toISOString(),
  }).eq('id', id)

  await admin.from('order_events').insert({
    order_id:    id,
    actor_id:    user.id,
    actor_type:  'editor',
    event_type:  'approved',
    from_status: 'under_review',
    to_status:   'approved',
  })

  // Packaging: mark delivered (MVP — no PDF, story text + stored images)
  await admin.from('orders').update({
    status:       'delivered',
    delivered_at: new Date().toISOString(),
  }).eq('id', id)

  await admin.from('order_events').insert({
    order_id:    id,
    actor_id:    null,
    actor_type:  'system',
    event_type:  'delivered',
    from_status: 'approved',
    to_status:   'delivered',
    metadata:    { draft_id: draft.id, word_count: finalContent?.split(/\s+/).length },
  })

  // Send delivery email (non-fatal if it fails)
  try {
    const { data: parent } = await admin
      .from('user_profiles')
      .select('email, full_name')
      .eq('id', order.parent_id)
      .single()

    if (parent?.email) {
      const child = order.children as unknown as { name: string }
      await sendStoryDeliveryEmail({
        to:         parent.email,
        parentName: parent.full_name || '',
        childName:  child?.name || '',
        storyTitle: draft.title || '',
        orderId:    id,
      })
    }
  } catch (e) {
    console.error('[approve] email send failed', e)
  }

  return ok({ delivered: true, order_id: id })
}
