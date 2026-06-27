'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { BookOpen, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }
    if (password !== confirm) {
      setError('كلمتا المرور غير متطابقتين')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError('حدث خطأ — حاول مرة أخرى أو اطلب رابطاً جديداً')
      setLoading(false)
      return
    }

    router.replace('/dashboard')
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
          <h2 className="text-xl font-bold text-ink-950 mb-2">كلمة مرور جديدة</h2>
          <p className="text-ink-400 text-sm mb-6">اختر كلمة مرور جديدة لحسابك.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-ink-600 font-medium">كلمة المرور الجديدة</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="mt-1"
                minLength={6}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirm" className="text-ink-600 font-medium">تأكيد كلمة المرور</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                dir="ltr"
                className="mt-1"
                minLength={6}
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
              تحديث كلمة المرور
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
