'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BookOpen, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email    = formData.get('email')    as string
    const password = formData.get('password') as string

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      setLoading(false)
      return
    }

    if (!data.session) {
      setError('لم يتم إنشاء الجلسة — تأكد من تفعيل البريد الإلكتروني')
      setLoading(false)
      return
    }

    window.location.replace('/dashboard')
  }

  function handleGoogleLogin() {
    window.location.href = '/api/auth/google'
  }

  return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">

        {/* Logo */}
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

        <div className="bg-white rounded-2xl shadow-card p-8 border border-paper-300">
          <h2 className="text-xl font-bold text-ink-950 mb-6">تسجيل الدخول</h2>

          {/* Google login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-paper-300 rounded-xl px-4 py-3 text-ink-600 hover:bg-paper-100 transition-colors mb-4 font-medium"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            تسجيل الدخول بـ Google
          </button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-paper-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-ink-200">أو</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-ink-600 font-medium">البريد الإلكتروني</Label>
              <Input id="email" name="email" type="email" placeholder="example@email.com" dir="ltr" className="mt-1" required />
            </div>
            <div>
              <Label htmlFor="password" className="text-ink-600 font-medium">كلمة المرور</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" dir="ltr" className="mt-1" required />
            </div>

            {error && (
              <div className="bg-error-50 text-error-600 text-sm rounded-xl px-4 py-3 border border-red-100">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              تسجيل الدخول
            </Button>
          </form>

          <p className="text-center text-sm text-ink-400 mt-4">
            ليس لديك حساب؟{' '}
            <Link href="/register" className="text-teal-600 font-medium hover:underline">
              سجّل الآن
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
