import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function err(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

// GET /api/v1/admin/overview — metrics + orders list
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('Unauthorized', 401)

  const { data: profile } = await supabase
    .from('user_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return err('Forbidden', 403)

  const admin = await createAdminClient()

  // Fetch all orders
  const { data: orders, error: ordersError } = await admin
    .from('orders')
    .select(`
      id, status, story_goal, dialect, age_group,
      created_at, delivered_at, parent_id,
      children ( name, age )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100)

  if (ordersError) console.error('[admin GET] orders error:', ordersError.message)

  // Fetch parent profiles separately to avoid FK join issues
  const parentIds = [...new Set((orders || []).map(o => o.parent_id))]
  const { data: profiles } = parentIds.length > 0
    ? await admin.from('user_profiles').select('id, email, full_name').in('id', parentIds)
    : { data: [] }

  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))

  const all = (orders || []).map(o => ({
    ...o,
    user_profiles: profileMap[o.parent_id] || null,
  }))

  // Simple metrics
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const metrics = {
    total:      all.length,
    today:      all.filter(o => new Date(o.created_at) >= today).length,
    pending:    all.filter(o => ['pending', 'draft_generating'].includes(o.status)).length,
    in_review:  all.filter(o => ['draft_ready', 'under_review'].includes(o.status)).length,
    delivered:  all.filter(o => o.status === 'delivered').length,
    failed:     all.filter(o => o.status === 'failed').length,
  }

  return NextResponse.json({ ok: true, data: { metrics, orders: all } })
}

// PATCH /api/v1/admin/overview — update order status manually
export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('Unauthorized', 401)

  const { data: profile } = await supabase
    .from('user_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return err('Forbidden', 403)

  const body = await req.json()
  const { order_id, status } = body as { order_id: string; status: string }

  const validStatuses = [
    'pending', 'draft_generating', 'draft_ready',
    'under_review', 'approved', 'delivered', 'cancelled', 'failed',
  ]
  if (!order_id || !validStatuses.includes(status)) {
    return err('Invalid order_id or status', 400)
  }

  const admin = await createAdminClient()
  const update: Record<string, unknown> = { status }
  if (status === 'delivered') update.delivered_at = new Date().toISOString()

  const { error } = await admin.from('orders').update(update).eq('id', order_id)
  if (error) return err(error.message, 500)

  // Log the manual override
  await admin.from('order_events').insert({
    order_id,
    actor_id:   user.id,
    actor_type: 'admin',
    event_type: 'manual_status_update',
    to_status:  status,
    notes:      'Manual update via admin dashboard',
  })

  return NextResponse.json({ ok: true })
}
