import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getInternalApiUrl } from '@/lib/internal-url'
import { rateLimit } from '@/lib/rate-limit'

const orderSchema = z.object({
  child_id:         z.string().uuid(),
  story_goal:       z.enum([
    'courage', 'honesty', 'sharing', 'friendship', 'patience',
    'responsibility', 'kindness', 'self_confidence', 'respect',
    'gratitude', 'discipline', 'forgiveness', 'creativity',
    'problem_solving', 'resilience', 'islamic_values',
  ]),
  dialect:          z.enum(['msa', 'gulf', 'levantine', 'egyptian', 'maghrebi']).default('msa'),
  age_group:        z.enum(['2-4', '5-7', '8-12']),
  special_notes:    z.string().max(500).optional().nullable(),
  idempotency_key:  z.string().min(1).max(100),
})

function ok(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, data }, { status })
}
function err(message: string, code: string, status: number) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status })
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('Unauthorized', 'unauthorized', 401)

  // GDPR: verify user has given AI consent before any order is created
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('ai_consent')
    .eq('id', user.id)
    .single()

  if (!profile?.ai_consent) {
    return err(
      'يجب الموافقة على معالجة البيانات قبل طلب القصة',
      'ai_consent_required',
      403
    )
  }

  // Rate limit: 5 orders per hour per user
  const rl = rateLimit(`order:${user.id}`, 5, 60 * 60 * 1000)
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: { code: 'rate_limited', message: 'Too many requests — please try again later' } },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    )
  }

  let body: unknown
  try { body = await req.json() } catch { return err('Invalid JSON', 'invalid_body', 400) }

  const parsed = orderSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0].message, 'validation_error', 400)

  const { child_id, story_goal, dialect, age_group, special_notes, idempotency_key } = parsed.data

  // Verify child belongs to this parent
  const { data: child } = await supabase
    .from('children')
    .select('id, name')
    .eq('id', child_id)
    .eq('user_id', user.id)
    .single()
  if (!child) return err('Child not found', 'child_not_found', 404)

  // Check subscription allows more orders
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan, status, stories_remaining')
    .eq('user_id', user.id)
    .single()

  // No active subscription = treat as free (1 story/month limit)
  const plan   = sub?.plan   || 'free'
  const status = sub?.status || 'active'

  if (status === 'canceled' || status === 'past_due') {
    return err('Your subscription is not active', 'subscription_inactive', 402)
  }

  if (plan === 'free') {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    // Count pending + delivered orders this month (not just complete ones)
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', user.id)
      .not('status', 'eq', 'cancelled')
      .gte('created_at', startOfMonth.toISOString())
    if ((count ?? 0) >= 1) {
      return err('Free plan limit reached — upgrade for more stories', 'free_limit_reached', 402)
    }
  }

  // Idempotency — return existing order if key already used
  const admin = await createAdminClient()
  const { data: existing } = await admin
    .from('orders')
    .select('id, status')
    .eq('idempotency_key', idempotency_key)
    .single()
  if (existing) return ok({ order_id: existing.id, status: existing.status })

  // Sanitize free-text
  const sanitizedNotes = special_notes
    ? special_notes.replace(/<[^>]*>/g, '').replace(/```[\s\S]*?```/g, '').trim()
    : null

  // Create order via service role (bypasses RLS for insert from server)
  const { data: order, error } = await admin.from('orders').insert({
    parent_id:        user.id,
    child_id,
    story_goal,
    dialect,
    age_group,
    special_notes:    sanitizedNotes,
    idempotency_key,
    status:           'pending',
    sla_deadline:     new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
  }).select('id, status').single()

  if (error) {
    console.error('[orders POST]', error)
    return err('Failed to create order', 'db_error', 500)
  }

  // Audit event
  await admin.from('order_events').insert({
    order_id:   order.id,
    actor_id:   user.id,
    actor_type: 'parent',
    event_type: 'order_created',
    to_status:  'pending',
    metadata:   { child_id, story_goal, dialect, age_group },
  })

  // Trigger draft generation — validated internal URL, Bearer auth
  try {
    const internalUrl = getInternalApiUrl()
    const res = await fetch(`${internalUrl}/api/internal/generate-order`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
      },
      body: JSON.stringify({ order_id: order.id }),
    })
    if (!res.ok) {
      console.error('[orders POST] generation trigger returned', res.status)
    }
  } catch (e) {
    // Non-fatal — order is created, editor can manually trigger or generation retried
    console.error('[orders POST] failed to trigger generation', e)
  }

  return ok({ order_id: order.id, status: 'pending' }, 201)
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('Unauthorized', 'unauthorized', 401)

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, status, story_goal, dialect, age_group,
      created_at, delivered_at, sla_deadline,
      children ( name, age )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return ok(orders || [])
}
