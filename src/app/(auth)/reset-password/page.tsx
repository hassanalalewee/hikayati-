'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { BookOpen, Loader2, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })

    if (resetError) {
      setError('حدث خطأ — تأكد من البريد الإلكتروني وحاول مرة أخرى')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-paper-50 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-2xl border border-paper-300 p-8 text-center shadow-card">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-ink-950 mb-3">تحقق من بريدك الإلكتروني</h2>
          <p className="text-ink-600 text-sm leading-relaxed mb-6">
            أرسلنا لك رابط لإعادة تعيين كلمة المرور على <strong>{email}</strong>. افتح البريد وانقر على الرابط.
          </p>
          <Link href="/login" className="text-teal-600 text-sm font-medium hover:underline">
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-ink-950 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-[#C9A84C]" />
          </div>
          <h1 className="text-3xl font-bold">
            <span className="text-[#C9A84C]">ح</span>
            <span className="text-ink-950">كايتي</span>
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-paper-300 p-8">
          <Link href="/login" className="flex items-center gap-1 text-ink-400 hover:text-ink-950 text-sm mb-6 transition-colors">
            <ArrowRight className="w-4 h-4" />
            رجوع لتسجيل الدخول
          </Link>

          <h2 className="text-xl font-bold text-ink-950 mb-2">نسيت كلمة المرور؟</h2>
          <p className="text-ink-400 text-sm mb-6">
            أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-ink-600 font-medium">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                dir="ltr"
                className="mt-1"
                required
              />
            </div>

            {error && (
              <div className="bg-error-50 text-error-600 text-sm rounded-xl px-4 py-3 border border-red-100">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              إرسال رابط إعادة التعيين
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
