import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getInternalApiUrl } from '@/lib/internal-url'

function ok(data: unknown) {
  return NextResponse.json({ ok: true, data })
}
function err(message: string, code: string, status: number) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status })
}

const reviseSchema = z.object({
  revision_brief: z.string().min(20).max(1000),
})

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('Unauthorized', 'unauthorized', 401)

  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
  if (!profile || !['editor', 'admin'].includes(profile.role)) return err('Forbidden', 'forbidden', 403)

  let body: unknown
  try { body = await req.json() } catch { return err('Invalid JSON', 'invalid_body', 400) }
  const parsed = reviseSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0].message, 'validation_error', 400)

  const admin = await createAdminClient()

  const { data: order } = await admin
    .from('orders')
    .select('id, status, assigned_editor_id, revision_count')
    .eq('id', id)
    .single()

  if (!order) return err('Order not found', 'not_found', 404)
  if (order.status !== 'under_review') return err('Order is not under review', 'invalid_status', 409)
  if (order.assigned_editor_id !== user.id && profile.role !== 'admin') {
    return err('Not assigned to this order', 'forbidden', 403)
  }
  if ((order.revision_count ?? 0) >= 2) {
    return err('Maximum revisions reached — please use Editor Rewrite', 'max_revisions', 409)
  }

  // Sanitize brief
  const brief = parsed.data.revision_brief.replace(/<[^>]*>/g, '').trim()

  // Update order status — draft deactivation handled inside generate-order
  await admin.from('orders').update({
    status:          'revision_requested',
    revision_count:  (order.revision_count ?? 0) + 1,
  }).eq('id', id)

  await admin.from('order_events').insert({
    order_id:    id,
    actor_id:    user.id,
    actor_type:  'editor',
    event_type:  'revision_requested',
    from_status: 'under_review',
    to_status:   'revision_requested',
    notes:       brief,
  })

  // Re-trigger generation with revision brief
  try {
    const internalUrl = getInternalApiUrl()
    const res = await fetch(`${internalUrl}/api/internal/generate-order`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
      },
      body: JSON.stringify({ order_id: id, revision_brief: brief }),
    })
    if (!res.ok) console.error('[revise] generation trigger returned', res.status)
  } catch (e) {
    console.error('[revise] failed to trigger regeneration', e)
  }

  return ok({ revision_requested: true, revision_count: (order.revision_count ?? 0) + 1 })
}
