'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BookOpen, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [error, setError]         = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [aiConsent, setAiConsent] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!aiConsent) {
      setError('يجب الموافقة على معالجة البيانات للمتابعة')
      setLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const email    = formData.get('email')    as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes('already')) {
        setError('هذا البريد الإلكتروني مسجل بالفعل — جرّب تسجيل الدخول')
      } else {
        setError('حدث خطأ في التسجيل: ' + signUpError.message)
      }
      setLoading(false)
      return
    }

    // Record AI consent
    await fetch('/api/v1/consent', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ai_consent: true }),
    })

    // If session exists immediately — email confirmation is OFF, go straight to dashboard
    if (data.session) {
      window.location.replace('/dashboard')
      return
    }

    // Email confirmation is ON — show confirmation message
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-paper-50 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-2xl border border-paper-300 p-8 text-center shadow-card">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-ink-950 mb-3">تحقق من بريدك الإلكتروني</h2>
          <p className="text-ink-600 text-sm leading-relaxed mb-6">
            أرسلنا لك رابط تأكيد على بريدك الإلكتروني. افتح البريد وانقر على الرابط لتفعيل حسابك.
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
          <p className="text-ink-400 mt-1">قصص عربية مخصصة لطفلك</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-paper-300 p-8">
          <h2 className="text-xl font-bold text-ink-950 mb-2">إنشاء حساب جديد</h2>
          <p className="text-ink-400 text-sm mb-6">اطلب قصتك الأولى اليوم</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-ink-600 font-medium">الاسم الكامل</Label>
              <Input id="fullName" name="fullName" placeholder="مثال: أم أحمد" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="email" className="text-ink-600 font-medium">البريد الإلكتروني</Label>
              <Input id="email" name="email" type="email" placeholder="example@email.com" dir="ltr" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="password" className="text-ink-600 font-medium">كلمة المرور</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" dir="ltr" className="mt-1" minLength={6} required />
            </div>

            {/* AI Consent */}
            <div className="flex items-start gap-3 bg-gold-100 border border-gold-border rounded-xl p-4">
              <input
                id="aiConsent"
                type="checkbox"
                checked={aiConsent}
                onChange={e => setAiConsent(e.target.checked)}
                className="mt-0.5 accent-teal-600 w-4 h-4 shrink-0 cursor-pointer"
              />
              <label htmlFor="aiConsent" className="text-sm text-ink-600 leading-relaxed cursor-pointer">
                أوافق على معالجة بيانات طفلي بواسطة فريقنا لإنشاء القصص الشخصية.{' '}
                <Link href="/privacy" className="text-teal-600 hover:underline">سياسة الخصوصية</Link>
              </label>
            </div>

            {error && (
              <div className="bg-error-50 text-error-600 text-sm rounded-xl px-4 py-3 border border-red-100">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !aiConsent}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              إنشاء الحساب
            </Button>
          </form>

          <p className="text-center text-xs text-ink-200 mt-4">
            بالتسجيل أنت توافق على{' '}
            <Link href="/terms" className="text-teal-600 hover:underline">شروط الخدمة</Link>
          </p>

          <p className="text-center text-sm text-ink-400 mt-4">
            لديك حساب؟{' '}
            <Link href="/login" className="text-teal-600 font-medium hover:underline">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
