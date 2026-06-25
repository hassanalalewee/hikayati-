import { createClient } from '@/lib/supabase/server'
import { stripe, STRIPE_PLANS } from '@/lib/stripe/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const checkoutSchema = z.object({
  plan: z.enum(['premium_monthly', 'premium_annual', 'family_monthly', 'family_annual', 'pro_monthly']),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const { data: profile } = await supabase.from('user_profiles').select('email').eq('id', user.id).single()
  const { data: sub } = await supabase.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).single()

  let customerId = sub?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email || user.email,
      metadata: { supabase_uid: user.id },
    })
    customerId = customer.id
    await supabase.from('subscriptions').update({ stripe_customer_id: customerId }).eq('user_id', user.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: STRIPE_PLANS[parsed.data.plan], quantity: 1 }],
    mode: 'subscription',
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/upgrade`,
    metadata: { user_id: user.id, plan: parsed.data.plan },
    allow_promotion_codes: true,
  })

  return NextResponse.json({ data: { checkoutUrl: session.url } })
}
