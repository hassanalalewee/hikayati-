'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusCircle, BookOpen, Sparkles, Loader2 } from 'lucide-react'
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
      if (!session) {
        window.location.replace('/login')
        return
      }
      const user = session.user

      const [profileRes, childrenRes, storiesRes, subRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('children').select('*').eq('user_id', user.id).eq('is_active', true).order('created_at'),
        supabase.from('stories').select('*, story_assets(url, type, page_num)').eq('user_id', user.id).eq('status', 'complete').order('created_at', { ascending: false }).limit(6),
        supabase.from('subscriptions').select('plan, status').eq('user_id', user.id).single(),
      ])

      setData({
        user,
        profile: profileRes.data,
        children: childrenRes.data || [],
        stories: storiesRes.data || [],
        subscription: subRes.data,
      })
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  const { user, profile, children, stories, subscription } = data
  const displayName = profile?.display_name || profile?.full_name?.split(' ')[0] || 'أهلاً'

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-xl text-slate-900">حكايتي</span>
          </Link>
          <div className="flex items-center gap-3">
            {subscription?.plan === 'free' && (
              <Link href="/upgrade" className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full font-medium hover:bg-amber-100">
                ترقية للمميز ✨
              </Link>
            )}
            <Link href="/settings">
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        <div className="bg-gradient-to-l from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-1">أهلاً {displayName} 👋</h1>
          <p className="text-indigo-100 text-sm mb-4">اجعل طفلك بطل قصته اليوم</p>
          <Link href="/stories/create" className="inline-flex items-center gap-2 bg-white text-indigo-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
            <Sparkles className="w-4 h-4" />
            إنشاء قصة جديدة
          </Link>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">أطفالي</h2>
            <Link href="/children/new" className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700">
              <PlusCircle className="w-4 h-4" />
              أضف طفلاً
            </Link>
          </div>
          {children.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
              <div className="text-4xl mb-3">👶</div>
              <p className="text-slate-600 font-medium mb-1">لم تضف أي طفل بعد</p>
              <p className="text-slate-400 text-sm mb-4">أضف ملف طفلك لإنشاء قصص مخصصة</p>
              <Link href="/children/new" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700">
                <PlusCircle className="w-4 h-4" />
                أضف طفلك الأول
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {children.map(child => (
                <ChildProfileCard key={child.id} child={child} />
              ))}
              <Link href="/children/new" className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-4 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors min-h-[120px]">
                <PlusCircle className="w-6 h-6" />
                <span className="text-xs font-medium">أضف طفلاً</span>
              </Link>
            </div>
          )}
        </section>

        {stories.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">آخر القصص</h2>
              <Link href="/stories" className="text-sm text-indigo-600 font-medium hover:text-indigo-700">عرض الكل</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stories.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </section>
        )}

        {subscription?.plan === 'free' && stories.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
            <div className="text-3xl">⭐</div>
            <div className="flex-1">
              <p className="font-bold text-amber-900 text-sm">اشترك في Premium</p>
              <p className="text-amber-700 text-xs mt-0.5">قصص غير محدودة + رسوم احترافية + دليل الوالدين</p>
            </div>
            <Link href="/upgrade" className="bg-amber-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-600 whitespace-nowrap">جرّب الآن</Link>
          </div>
        )}
      </main>
    </div>
  )
}
