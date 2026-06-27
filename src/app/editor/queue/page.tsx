'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface OrderCard {
  id: string
  status: string
  story_goal: string
  dialect: string
  age_group: string
  revision_count: number
  sla_deadline: string
  created_at: string
  assigned_editor_id: string | null
  children: { name: string; age: number } | null
  story_drafts: { qa_score: number | null; qa_flags: string[] }[]
}

const GOAL_LABELS: Record<string, string> = {
  courage: 'الشجاعة', honesty: 'الأمانة', sharing: 'التعاون',
  friendship: 'الصداقة', patience: 'الصبر', responsibility: 'المسؤولية',
  kindness: 'اللطف', self_confidence: 'الثقة بالنفس', respect: 'الاحترام',
  gratitude: 'الامتنان', discipline: 'الانضباط', forgiveness: 'التسامح',
  creativity: 'الإبداع', problem_solving: 'حل المشكلات', resilience: 'المرونة',
  islamic_values: 'القيم الإسلامية',
}

const DIALECT_LABELS: Record<string, string> = {
  msa: 'فصيح', gulf: 'خليجي', levantine: 'شامي', egyptian: 'مصري', maghrebi: 'مغاربي',
}

function SlaCountdown({ deadline }: { deadline: string }) {
  const [remaining, setRemaining] = useState('')
  const [urgent, setUrgent] = useState(false)

  useEffect(() => {
    function update() {
      const ms = new Date(deadline).getTime() - Date.now()
      if (ms <= 0) { setRemaining('انتهى الوقت'); setUrgent(true); return }
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      setRemaining(`${h}س ${m}د`)
      setUrgent(ms < 3600000)
    }
    update()
    const t = setInterval(update, 60000)
    return () => clearInterval(t)
  }, [deadline])

  return (
    <span className={`text-xs font-mono font-semibold ${urgent ? 'text-red-600' : 'text-[#6B6560]'}`}>
      SLA: {remaining}
    </span>
  )
}

function OrderCardItem({ order, onClaim }: { order: OrderCard; onClaim: (id: string) => void }) {
  const activeDraft = order.story_drafts?.[0]
  const qaScore = activeDraft?.qa_score
  const qaFlags = activeDraft?.qa_flags || []
  const lowQa = qaScore !== null && qaScore !== undefined && qaScore < 80
  const isMine = order.status === 'under_review'

  return (
    <div className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow
      ${isMine ? 'border-r-4 border-r-blue-500' : ''}
      ${lowQa ? 'border-r-4 border-r-amber-500' : ''}
    `}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
            ${order.status === 'draft_ready' ? 'bg-green-50 text-green-700' : ''}
            ${order.status === 'under_review' ? 'bg-blue-50 text-blue-700' : ''}
            ${order.status === 'revision_requested' ? 'bg-amber-50 text-amber-700' : ''}
          `}>
            {order.status === 'draft_ready' && 'جاهز للمراجعة'}
            {order.status === 'under_review' && 'قيد المراجعة'}
            {order.status === 'revision_requested' && 'طلب مراجعة'}
          </span>
          {lowQa && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
              ⚠ درجة منخفضة: {qaScore}
            </span>
          )}
        </div>
        <SlaCountdown deadline={order.sla_deadline} />
      </div>

      <h3 className="text-lg font-bold text-[#1A1814] mb-1">
        قصة {order.children?.name || '—'}
      </h3>

      <div className="flex flex-wrap gap-2 text-sm text-[#6B6560] mb-3">
        <span>{order.children?.name}، {order.children?.age} سنوات</span>
        <span>•</span>
        <span>{DIALECT_LABELS[order.dialect] || order.dialect}</span>
        <span>•</span>
        <span>{GOAL_LABELS[order.story_goal] || order.story_goal}</span>
        {qaScore !== null && qaScore !== undefined && (
          <>
            <span>•</span>
            <span>درجة QA: {qaScore}/100</span>
          </>
        )}
      </div>

      {lowQa && qaFlags.length > 0 && (
        <div className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 mb-3">
          {qaFlags.slice(0, 2).map((f, i) => <div key={i}>• {f}</div>)}
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className="text-xs text-[#9B9590]">
          {new Date(order.created_at).toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
        </span>
        {order.status === 'draft_ready' && (
          <button
            onClick={() => onClaim(order.id)}
            className="bg-[#1A1814] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2A2820] transition-colors"
          >
            استلام ومراجعة ←
          </button>
        )}
        {order.status === 'under_review' && (
          <a
            href={`/editor/orders/${order.id}`}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            متابعة المراجعة ←
          </a>
        )}
        {order.status === 'revision_requested' && (
          <span className="text-xs text-[#6B6560]">في انتظار المسودة الجديدة...</span>
        )}
      </div>
    </div>
  )
}

export default function EditorQueuePage() {
  const [tab, setTab] = useState<'ready' | 'mine' | 'revision'>('ready')
  const [data, setData] = useState<{ ready: OrderCard[]; mine: OrderCard[]; revision: OrderCard[] }>({
    ready: [], mine: [], revision: [],
  })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await fetch('/api/v1/editor/queue')
    if (res.ok) {
      const json = await res.json()
      setData(json.data || { ready: [], mine: [], revision: [] })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()

    // Supabase Realtime — refresh queue on any order change
    const supabase = createClient()
    const channel = supabase
      .channel('editor-queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => load())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [load])

  async function handleClaim(orderId: string) {
    const res = await fetch(`/api/v1/editor/orders/${orderId}/claim`, { method: 'POST' })
    if (res.ok) {
      await load()
      window.location.href = `/editor/orders/${orderId}`
    } else {
      const err = await res.json()
      alert(err.error?.message || 'فشل استلام الطلب')
    }
  }

  const tabs = [
    { key: 'ready' as const,    label: 'جاهز للمراجعة',  count: data.ready.length },
    { key: 'mine' as const,     label: 'قيد مراجعتي',    count: data.mine.length },
    { key: 'revision' as const, label: 'طلب مراجعة',     count: data.revision.length },
  ]

  const current = data[tab]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1814] mb-1">طابور المراجعة</h1>
        <p className="text-sm text-[#6B6560]">القصص المنتظرة للمراجعة التحريرية</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E8E4DC] mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
              ${tab === t.key
                ? 'border-[#1A1814] text-[#1A1814]'
                : 'border-transparent text-[#6B6560] hover:text-[#1A1814]'
              }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="mr-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs bg-[#1A1814] text-white">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-[#6B6560] py-16">جاري التحميل...</div>
      ) : current.length === 0 ? (
        <div className="text-center text-[#6B6560] py-16 bg-white rounded-xl border border-[#E8E4DC]">
          {tab === 'ready'    && 'لا توجد قصص تنتظر المراجعة'}
          {tab === 'mine'     && 'لا توجد قصص تحت مراجعتك'}
          {tab === 'revision' && 'لا توجد قصص في طور المراجعة'}
        </div>
      ) : (
        <div className="grid gap-4">
          {current.map(order => (
            <OrderCardItem
              key={order.id}
              order={order}
              onClaim={handleClaim}
            />
          ))}
        </div>
      )}
    </div>
  )
}
