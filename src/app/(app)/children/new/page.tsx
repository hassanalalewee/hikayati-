'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'

const HOBBIES = ['القراءة', 'الرسم', 'الرياضة', 'الموسيقى', 'الطبخ', 'الألعاب', 'السباحة', 'التمثيل']

export default function NewChildPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    hobbies: [] as string[],
    favorite_color: '',
    favorite_animal: '',
  })

  function toggleHobby(h: string) {
    setForm(f => ({
      ...f,
      hobbies: f.hobbies.includes(h) ? f.hobbies.filter(x => x !== h) : [...f.hobbies, h],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.age || !form.gender) {
      setError('يرجى تعبئة الاسم والعمر والجنس')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, age: Number(form.age) }),
      })
      const text = await res.text()
      let data: { error?: string } = {}
      try { data = JSON.parse(text) } catch { throw new Error(`Server error: ${text.slice(0, 100)}`) }
      if (!res.ok) throw new Error(data.error || 'حدث خطأ')
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-700">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-lg text-slate-900">أضف طفلاً جديداً</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-2">اسم الطفل *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="مثال: محمد"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Age + Gender */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">العمر *</label>
              <select
                value={form.age}
                onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">اختر العمر</option>
                {Array.from({ length: 12 }, (_, i) => i + 3).map(a => (
                  <option key={a} value={a}>{a} سنوات</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">الجنس *</label>
              <div className="grid grid-cols-2 gap-3">
                {[{ v: 'male', l: '👦 ولد' }, { v: 'female', l: '👧 بنت' }].map(({ v, l }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, gender: v }))}
                    className={`py-3 rounded-xl border-2 font-medium text-sm transition-colors ${
                      form.gender === v
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hobbies */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-3">الهوايات</label>
            <div className="flex flex-wrap gap-2">
              {HOBBIES.map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => toggleHobby(h)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    form.hobbies.includes(h)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Favorites */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">اللون المفضل</label>
              <input
                type="text"
                value={form.favorite_color}
                onChange={e => setForm(f => ({ ...f, favorite_color: e.target.value }))}
                placeholder="مثال: الأزرق"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">الحيوان المفضل</label>
              <input
                type="text"
                value={form.favorite_animal}
                onChange={e => setForm(f => ({ ...f, favorite_animal: e.target.value }))}
                placeholder="مثال: الأسد"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-base hover:bg-indigo-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'حفظ الملف'}
          </button>
        </form>
      </main>
    </div>
  )
}
