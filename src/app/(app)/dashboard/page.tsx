'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusCircle, BookOpen, PenLine, Loader2, Clock, CheckCircle, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { StoryCard } from '@/components/story/StoryCard'
import { ChildProfileCard } from '@/components/child/ChildProfileCard'
import { getGoalColor } from '@/lib/constants'

import type { Child } from '@/types'

interface Order {
  id: string
  status: string
  story_goal: string
  dialect: string
  age_group: string
  created_at: string
  delivered_at: string | null
  children: { name: string; age: number } | null
}

const STATUS_LABELS: Record<string, { ar: string; color: string; icon: string }> = {
  pending:            { ar: 'في الانتظار',           color: 'bg-paper-100 text-ink-400',      icon: '⏳' },
  draft_generating:   { ar: 'فريقنا يُعدّ القصة',    color: 'bg-paper-100 text-ink-400',      icon: '✍️' },
  draft_ready:        { ar: 'قيد المراجعة التحريرية', color: 'bg-teal-50 text-teal-600',       icon: '👁' },
  under_review:       { ar: 'قيد المراجعة التحريرية', color: 'bg-teal-50 text-teal-600',       icon: '👁' },
  revision_requested: { ar: 'تحسينات أخيرة',          color: 'bg-amber-50 text-amber-700',     icon: '🔄' },
  approved:           { ar: 'تمت الموافقة',            color: 'bg-green-50 text-green-700',     icon: '✓' },
  packaging:          { ar: 'يُجهَّز للتسليم',         color: 'bg-green-50 text-green-700',     icon: '📦' },
  delivered:          { ar: 'جاهزة! 🎉',               color: 'bg-green-50 text-green-700',     icon: '📖' },
  failed:             { ar: 'يعمل عليها فريقنا',       color: 'bg-paper-100 text-ink-400',      icon: '⏳' },
}

const GOAL_LABELS: Record<string, string> = {
  courage: 'الشجاعة', honesty: 'الأمانة', sharing: 'التعاون',
  friendship: 'الصداقة', patience: 'الصبر', responsibility: 'المسؤولية',
  kindness: 'اللطف', self_confidence: 'الثقة بالنفس', respect: 'الاحترام',
  gratitude: 'الامتنان', discipline: 'الانضباط', forgiveness: 'التسامح',
  creativity: 'الإبداع', problem_solving: 'حل المشكلات', resilience: 'المرونة',
  islamic_values: 'القيم الإسلامية',
}

function OrderCard({ order }: { order: Order }) {
  const mood    = getGoalColor(order.story_goal)
  const status  = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending
  const delivered = order.status === 'delivered'

  return (
    <div className="bg-white rounded-2xl border overflow-hidden shadow-card hover:shadow-card-hover transition-all"
      style={{ borderColor: mood.border }}>
      {/* Color top bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: mood.accent }} />

      <div className="p-4">
        {/* Status badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
            <span>{status.icon}</span>
            {status.ar}
          </span>
          <span className="text-xs text-ink-200">
            {new Date(order.created_at).toLocaleDateString('ar-SA')}
          </span>
        </div>

        {/* Child + goal */}
        <p className="font-bold text-ink-950 mb-0.5">
          قصة {order.children?.name}
        </p>
        <p className="text-sm text-ink-400">
          {GOAL_LABELS[order.story_goal] || order.story_goal} • {order.children?.age} سنوات
        </p>

        {/* CTA */}
        <div className="mt-3">
          {delivered ? (
            <Link href={`/orders/${order.id}`}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:text-teal-500">
              <Eye className="w-4 h-4" />
              اقرأ القصة
            </Link>
          ) : (
            <Link href={`/orders/${order.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-600">
              <Clock className="w-4 h-4" />
              تابع الحالة
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    user: { email?: string } | null
    profile: { display_name?: string; full_name?: string } | null
    children: Child[]
    orders: Order[]
    stories: { id: string; title: string; cover_url: string | null; child_id: string; created_at: string; goals: string[]; story_assets?: { url: string; type: string; page_num: number | null }[] }[]
    subscription: { plan: string; status: string } | null
  }>({ user: null, profile: null, children: [], orders: [], stories: [], subscription: null })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { window.location.replace('/login'); return }
      const user = session.user
      const [profileRes, childrenRes, ordersRes, storiesRes, subRes] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('children').select('*').eq('user_id', user.id).eq('is_active', true).order('created_at'),
        // New editorial workflow orders
        fetch('/api/v1/orders').then(r => r.json()).catch(() => ({ data: [] })),
        // Old pipeline stories (keep for backward compatibility)
        supabase.from('stories').select('*, story_assets(url, type, page_num)').eq('user_id', user.id).eq('status', 'complete').order('created_at', { ascending: false }).limit(6),
        supabase.from('subscriptions').select('plan, status').eq('user_id', user.id).single(),
      ])
      setData({
        user,
        profile:      profileRes.data,
        children:     childrenRes.data || [],
        orders:       ordersRes.data   || [],
        stories:      storiesRes.data  || [],
        subscription: subRes.data,
      })
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

  const { user, profile, children, orders, stories, subscription } = data
  const displayName = profile?.display_name || profile?.full_name?.split(' ')[0] || 'أهلاً'
  const initial     = (profile?.full_name || user?.email || 'U')[0].toUpperCase()

  const pendingOrders   = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
  const deliveredOrders = orders.filter(o => o.status === 'delivered')

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
            <div className="w-9 h-9 rounded-full bg-paper-200 flex items-center justify-center text-ink-800 font-bold text-sm border border-paper-300">
              {initial}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">

        {/* Hero card */}
        <div className="bg-ink-950 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-1">أهلاً {displayName} 👋</h1>
          <p className="text-[#9B9590] text-sm mb-4">اطلب قصة جديدة — فريقنا يراجع كل قصة قبل تسليمها</p>
          <Link
            href="/order/new"
            className="inline-flex items-center gap-2 bg-[#C9A84C] text-ink-950 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#D9BC76] transition-colors"
          >
            <PenLine className="w-4 h-4" />
            اطلب قصة جديدة
          </Link>
        </div>

        {/* Pending orders — under editorial review */}
        {pendingOrders.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-ink-950 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                قصص قيد التحرير
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pendingOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </section>
        )}

        {/* Delivered orders */}
        {deliveredOrders.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-ink-950 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                قصص جاهزة
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {deliveredOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </section>
        )}

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
              <Link href="/children/new"
                className="inline-flex items-center gap-2 bg-ink-950 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-ink-800 transition-colors">
                <PlusCircle className="w-4 h-4" />
                أضف طفلك الأول
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {children.map(child => (
                <ChildProfileCard key={child.id} child={child} />
              ))}
              <Link href="/children/new"
                className="bg-white rounded-2xl border-2 border-dashed border-paper-300 p-4 flex flex-col items-center justify-center gap-2 text-ink-200 hover:border-teal-600 hover:text-teal-600 transition-colors min-h-[120px]">
                <PlusCircle className="w-6 h-6" />
                <span className="text-xs font-medium">أضف طفلاً</span>
              </Link>
            </div>
          )}
        </section>

        {/* Old stories (legacy pipeline) */}
        {stories.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-ink-950">قصص سابقة</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stories.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {orders.length === 0 && stories.length === 0 && (
          <div className="bg-white rounded-2xl border border-paper-300 p-10 text-center">
            <div className="text-5xl mb-4">📖</div>
            <h3 className="font-bold text-ink-950 text-lg mb-2">لا توجد قصص بعد</h3>
            <p className="text-ink-400 text-sm mb-6">اطلب قصتك الأولى — فريقنا يراجعها قبل تسليمها</p>
            <Link href="/order/new"
              className="inline-flex items-center gap-2 bg-[#C9A84C] text-ink-950 px-6 py-3 rounded-xl font-bold hover:bg-[#D9BC76] transition-colors">
              <PenLine className="w-4 h-4" />
              اطلب قصتك الأولى
            </Link>
          </div>
        )}

      </main>
    </div>
  )
}
