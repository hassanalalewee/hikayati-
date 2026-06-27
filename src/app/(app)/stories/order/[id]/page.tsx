'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'

interface StoryData {
  order: {
    id: string
    story_goal: string
    children: { name: string; age: number } | null
  }
  draft: {
    title: string | null
    edited_content: string | null
    content: string | null
  } | null
}

const GOAL_LABELS: Record<string, string> = {
  courage: 'الشجاعة', honesty: 'الأمانة', sharing: 'التعاون',
  friendship: 'الصداقة', patience: 'الصبر', responsibility: 'المسؤولية',
  kindness: 'اللطف', self_confidence: 'الثقة بالنفس', respect: 'الاحترام',
  gratitude: 'الامتنان', discipline: 'الانضباط', forgiveness: 'التسامح',
  creativity: 'الإبداع', problem_solving: 'حل المشكلات', resilience: 'المرونة',
  islamic_values: 'القيم الإسلامية',
}

export default function StoryReaderPage() {
  const params  = useParams()
  const orderId = params.id as string

  const [data, setData]     = useState<StoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    async function load() {
      // Get order info
      const orderRes = await fetch(`/api/v1/orders/${orderId}`)
      if (!orderRes.ok) { setError('لم يُعثر على القصة'); setLoading(false); return }
      const orderJson = await orderRes.json()

      if (orderJson.data.status !== 'delivered') {
        setError('القصة لم تُسلَّم بعد')
        setLoading(false)
        return
      }

      // Get story draft via admin endpoint (public after delivery)
      const draftRes = await fetch(`/api/v1/story/${orderId}`)
      const draftJson = draftRes.ok ? await draftRes.json() : { data: null }

      setData({ order: orderJson.data, draft: draftJson.data })
      setLoading(false)
    }
    load()
  }, [orderId])

  if (loading) return (
    <div dir="rtl" className="min-h-screen bg-paper-50 flex items-center justify-center">
      <div className="text-ink-400">جاري تحميل القصة...</div>
    </div>
  )

  if (error || !data) return (
    <div dir="rtl" className="min-h-screen bg-paper-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-ink-400 mb-4">{error || 'حدث خطأ'}</p>
        <Link href="/dashboard" className="text-teal-600 underline text-sm">العودة للوحة التحكم</Link>
      </div>
    </div>
  )

  const { order, draft } = data
  const child   = order.children
  const title   = draft?.title || `قصة ${child?.name}`
  const content = draft?.edited_content || draft?.content || ''
  const paragraphs = content.split('\n').filter(p => p.trim())

  return (
    <div dir="rtl" className="min-h-screen bg-paper-50">

      {/* Header */}
      <header className="bg-white border-b border-paper-300 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/orders/${orderId}`}
            className="flex items-center gap-2 text-ink-400 hover:text-ink-950 transition-colors">
            <ArrowRight className="w-5 h-5" />
            <span className="text-sm">رجوع</span>
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#C9A84C]" />
            <span className="text-sm font-medium text-ink-950">{title}</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* Cover */}
        <div className="bg-ink-950 rounded-2xl p-8 text-center mb-8 shadow-modal">
          <div className="text-5xl mb-4">📖</div>
          <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
          {child && (
            <p className="text-[#9B9590] text-sm">
              قصة خاصة لـ {child.name} • {GOAL_LABELS[order.story_goal] || order.story_goal}
            </p>
          )}
          {/* Trust badge */}
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 text-xs text-white/70">
            ✓ راجعها فريقنا التحريري
          </div>
        </div>

        {/* Story content */}
        {paragraphs.length > 0 ? (
          <div className="bg-white rounded-2xl border border-paper-300 p-6 shadow-card space-y-4">
            {paragraphs.map((para, i) => (
              <p key={i} className="story-body text-right leading-loose">
                {para}
              </p>
            ))}
            {/* End */}
            <div className="pt-6 border-t border-paper-300 text-center">
              <p className="text-ink-400 text-sm font-medium">
                ✨ نهاية قصة {child?.name} ✨
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-paper-300 p-8 text-center">
            <p className="text-ink-400">محتوى القصة غير متاح حالياً</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3 flex-wrap">
          <a href={`/api/v1/story/${orderId}/pdf`} target="_blank" rel="noopener noreferrer"
            className="flex-1 border-2 border-[#C9A84C] text-[#C9A84C] py-3 rounded-xl font-bold text-center hover:bg-gold-100 transition-colors text-sm">
            ↓ تنزيل PDF
          </a>
          <Link href="/order/new"
            className="flex-1 bg-[#C9A84C] text-ink-950 py-3 rounded-xl font-bold text-center hover:bg-[#D9BC76] transition-colors text-sm">
            اطلب قصة جديدة
          </Link>
          <Link href="/dashboard"
            className="flex-1 border border-paper-300 text-ink-600 py-3 rounded-xl font-medium text-center hover:bg-paper-100 transition-colors text-sm">
            لوحة التحكم
          </Link>
        </div>
      </main>
    </div>
  )
}
