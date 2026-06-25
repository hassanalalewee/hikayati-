import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export const STRIPE_PLANS = {
  premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY!,
  premium_annual: process.env.STRIPE_PRICE_PREMIUM_ANNUAL!,
  family_monthly: process.env.STRIPE_PRICE_FAMILY_MONTHLY!,
  family_annual: process.env.STRIPE_PRICE_FAMILY_ANNUAL!,
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!,
} as const

export const PLAN_NAMES: Record<string, string> = {
  premium_monthly: 'مميز شهري',
  premium_annual: 'مميز سنوي',
  family_monthly: 'عائلة بلس شهري',
  family_annual: 'عائلة بلس سنوي',
  pro_monthly: 'احترافي شهري',
}
