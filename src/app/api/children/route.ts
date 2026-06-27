import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const childSchema = z.object({
  name: z.string().min(1).max(50),
  age: z.number().int().min(3).max(14),
  gender: z.enum(['male', 'female']),
  country: z.string().optional(),
  hobbies: z.array(z.string()).default([]),
  favorite_color: z.string().optional(),
  favorite_animal: z.string().optional(),
  favorite_activities: z.array(z.string()).default([]),
  photo_url: z.string().url().optional(),
})

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = childSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  // Check subscription limit
  const { data: sub } = await supabase.from('subscriptions').select('plan').eq('user_id', user.id).single()
  const { count } = await supabase.from('children').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_active', true)

  const limits = { free: 3, premium: 3, family: 5, professional: 50 }
  const plan = (sub?.plan || 'free') as keyof typeof limits
  if ((count ?? 0) >= limits[plan]) {
    return NextResponse.json({ error: 'child_limit_reached', plan }, { status: 402 })
  }

  const { data: child, error } = await supabase.from('children').insert({ ...parsed.data, user_id: user.id }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: child }, { status: 201 })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: children } = await supabase.from('children').select('*').eq('user_id', user.id).eq('is_active', true).order('created_at')
  return NextResponse.json({ data: children || [] })
}
