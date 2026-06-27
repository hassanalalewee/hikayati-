import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

const PLAN_MAP: Record<string, string> = {
  [process.env.STRIPE_PRICE_PREMIUM_MONTHLY || '']: 'premium',
  [process.env.STRIPE_PRICE_PREMIUM_ANNUAL  || '']: 'premium',
  [process.env.STRIPE_PRICE_FAMILY_MONTHLY  || '']: 'family',
  [process.env.STRIPE_PRICE_FAMILY_ANNUAL   || '']: 'family',
  [process.env.STRIPE_PRICE_PRO_MONTHLY     || '']: 'professional',
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  // Reject immediately if signature header is missing
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  // Idempotency guard — skip if we already processed this event
  const { data: already } = await supabase
    .from('processed_webhook_events')
    .select('id')
    .eq('id', event.id)
    .single()

  if (already) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  // Mark as processed before acting (prevents double-processing on retry)
  await supabase.from('processed_webhook_events').insert({
    id:         event.id,
    event_type: event.type,
  })

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub    = event.data.object as Stripe.Subscription
      const priceId = sub.items.data[0]?.price.id

      // Never default to premium — reject unknown price IDs
      const plan = PLAN_MAP[priceId]
      if (!plan) {
        console.error('[stripe webhook] unknown price ID:', priceId, 'event:', event.id)
        break
      }

      await supabase.from('subscriptions')
        .update({
          plan,
          status:                  sub.status as 'active' | 'canceled' | 'past_due' | 'trialing',
          stripe_subscription_id:  sub.id,
          current_period_start:    new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end:      new Date(sub.current_period_end   * 1000).toISOString(),
          updated_at:              new Date().toISOString(),
        })
        .eq('stripe_customer_id', sub.customer as string)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase.from('subscriptions')
        .update({ plan: 'free', status: 'canceled', updated_at: new Date().toISOString() })
        .eq('stripe_customer_id', sub.customer as string)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await supabase.from('subscriptions')
        .update({ status: 'past_due', updated_at: new Date().toISOString() })
        .eq('stripe_customer_id', invoice.customer as string)
      break
    }
  }

  return NextResponse.json({ received: true })
}
