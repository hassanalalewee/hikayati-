'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusCircle, BookOpen, PenLine, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { StoryCard } from '@/components/story/StoryCard'
import { ChildProfileCard } from '@/components/child/ChildProfileCard'

import type { Child } from '@/types'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    user: { email?: string } | null
    profile: { display_name?: string; full_name?: string } | null
    children: Child[]
    stories: { id: string; title: string; cover_url: string | null; child_id: string; created_at: string; goals: string[]; story_assets?: { url: string; type: string; page_num: number | null }[] }[]
    subscription: { plan: string; status: string } | null
  }>({ user: null, profile: null, children: [], stories: [], subscription: null })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.replace('/login'); return }
      const user = session.user
      const [profileRes, childrenRes, storiesRes, subRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('children').select('*').eq('user_id', user.id).eq('is_active', true).order('created_at'),
        supabase.from('stories').select('*, story_assets(url, type, page_num)').eq('user_id', user.id).eq('status', 'complete').order('created_at', { ascending: false }).limit(6),
        supabase.from('subscriptions').select('plan, status').eq('user_id', user.id).single(),
      ])
      setData({ user, profile: profileRes.data, children: childrenRes.data || [], stories: storiesRes.data || [], subscription: subRes.data })
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A84C]" />
      </div>
    )
  }

  const { user, profile, children, stories, subscription } = data
  const displayName = profile?.display_name || profile?.full_name?.split(' ')[0] || 'أهلاً'
  const initial = (profile?.full_name || user?.email || 'U')[0].toUpperCase()

  return (
    <div className="min-h-screen bg-paper-50" dir="rtl">

      {/* Header */}
      <header className="bg-white border-b border-paper-300 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#C9A84C]" />
            <span className="font-bold text-xl">
              <span className="text-[#C9A84C]">ح</span>
              <span className="text-ink-950">كايتي</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {subscription?.plan === 'free' && (
              <Link href="/upgrade" className="text-xs bg-gold-100 text-[#4B4640] border border-gold-border px-3 py-1.5 rounded-full font-medium hover:bg-[#EDE8DC] transition-colors">
                ترقية للمميز ✨
              </Link>
            )}
            <Link href="/settings">
              <div className="w-9 h-9 rounded-full bg-paper-200 flex items-center justify-center text-ink-800 font-bold text-sm border border-paper-300">
                {initial}
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">

        {/* Hero card */}
        <div className="bg-ink-950 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-1">أهلاً {displayName} 👋</h1>
          <p className="text-[#9B9590] text-sm mb-4">اطلب قصة جديدة لطفلك اليوم</p>
          <Link
            href="/stories/create"
            className="inline-flex items-center gap-2 bg-[#C9A84C] text-ink-950 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#D9BC76] transition-colors"
          >
            <PenLine className="w-4 h-4" />
            اطلب قصة جديدة
          </Link>
        </div>

        {/* Children */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-ink-950">أطفالي</h2>
            <Link href="/children/new" className="text-sm text-teal-600 font-medium flex items-center gap-1 hover:text-teal-500 transition-colors">
              <PlusCircle className="w-4 h-4" />
              أضف طفلاً
            </Link>
          </div>

          {children.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-paper-300 p-8 text-center">
              <div className="text-4xl mb-3">👶</div>
              <p className="text-ink-600 font-medium mb-1">لم تضف أي طفل بعد</p>
              <p className="text-ink-200 text-sm mb-4">أضف ملف طفلك لإنشاء قصص مخصصة</p>
              <Link
                href="/children/new"
                className="inline-flex items-center gap-2 bg-ink-950 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-ink-800 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                أضف طفلك الأول
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {children.map(child => (
                <ChildProfileCard key={child.id} child={child} />
              ))}
              <Link
                href="/children/new"
                className="bg-white rounded-2xl border-2 border-dashed border-paper-300 p-4 flex flex-col items-center justify-center gap-2 text-ink-200 hover:border-teal-600 hover:text-teal-600 transition-colors min-h-[120px]"
              >
                <PlusCircle className="w-6 h-6" />
                <span className="text-xs font-medium">أضف طفلاً</span>
              </Link>
            </div>
          )}
        </section>

        {/* Recent stories */}
        {stories.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-ink-950">آخر القصص</h2>
              <Link href="/stories" className="text-sm text-teal-600 font-medium hover:text-teal-500 transition-colors">عرض الكل</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stories.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </section>
        )}

        {/* Upgrade prompt */}
        {subscription?.plan === 'free' && stories.length > 0 && (
          <div className="bg-gold-100 border border-gold-border rounded-2xl p-5 flex items-center gap-4">
            <div className="text-3xl">⭐</div>
            <div className="flex-1">
              <p className="font-bold text-ink-800 text-sm">اشترك في Premium</p>
              <p className="text-ink-400 text-xs mt-0.5">قصص غير محدودة + رسوم احترافية + دليل الوالدين</p>
            </div>
            <Link
              href="/upgrade"
              className="bg-[#C9A84C] text-ink-950 px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#D9BC76] transition-colors whitespace-nowrap"
            >
              جرّب الآن
            </Link>
          </div>
        )}

      </main>
    </div>
  )
}
