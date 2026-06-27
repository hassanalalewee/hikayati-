'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BookOpen, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // Consent must be explicitly checked — default false
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
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (signUpError) {
      setError(signUpError.message === 'User already registered'
        ? 'هذا البريد الإلكتروني مسجل بالفعل'
        : 'حدث خطأ في التسجيل')
      setLoading(false)
      return
    }

    // Record AI consent immediately after account creation
    await fetch('/api/v1/consent', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ai_consent: true }),
    })

    window.location.replace('/dashboard')
  }

  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">حكايتي</h1>
          <p className="text-slate-600 mt-1">ابدأ رحلة طفلك مجاناً</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-2">إنشاء حساب جديد</h2>
          <p className="text-slate-500 text-sm mb-6">قصة مجانية كل شهر — بدون بطاقة ائتمانية</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">الاسم الكامل</Label>
              <Input id="fullName" name="fullName" placeholder="أم أحمد" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" name="email" type="email" placeholder="example@email.com" dir="ltr" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" dir="ltr" className="mt-1" minLength={6} required />
            </div>

            {/* AI Consent — required before account creation (GDPR) */}
            <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-4">
              <input
                id="aiConsent"
                type="checkbox"
                checked={aiConsent}
                onChange={e => setAiConsent(e.target.checked)}
                className="mt-0.5 accent-indigo-600 w-4 h-4 shrink-0"
              />
              <label htmlFor="aiConsent" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                أوافق على معالجة بيانات طفلي بواسطة فريقنا لإنشاء القصص الشخصية.{' '}
                <Link href="/privacy" className="text-indigo-600 hover:underline">سياسة الخصوصية</Link>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading || !aiConsent}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              إنشاء الحساب مجاناً
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-4">
            بالتسجيل أنت توافق على{' '}
            <Link href="/terms" className="text-indigo-600 hover:underline">شروط الخدمة</Link>
          </p>

          <p className="text-center text-sm text-slate-600 mt-4">
            لديك حساب؟{' '}
            <Link href="/login" className="text-indigo-600 font-medium hover:underline">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
