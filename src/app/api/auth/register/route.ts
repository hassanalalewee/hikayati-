import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already')) {
      return NextResponse.json({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' }, { status: 409 })
    }
    return NextResponse.json({ error: 'حدث خطأ أثناء التسجيل' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
