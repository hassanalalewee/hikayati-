'use client'

import { useEffect, useState, useCallback } from 'react'
import { BookOpen, Loader2, RefreshCw, Eye, X, CheckCircle, RotateCcw } from 'lucide-react'

interface Order {
  id: string
  status: string
  story_goal: string
  dialect: string
  created_at: string
  delivered_at: string | null
  children: { name: string; age: number } | null
  user_profiles: { email: string; full_name: string | null } | null
}

interface Draft {
  id: string
  title: string | null
  content: string | null
  edited_content: string | null
  word_count: number | null
  qa_score: number | null
  qa_flags: string[]
  editor_notes: string | null
}

interface Metrics {
  total: number; today: number; pending: number
  in_review: number; delivered: number; failed: number
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:            { label: 'في الانتظار',    color: 'bg-paper-100 text-ink-400' },
  draft_generating:   { label: 'يُنشئ المسودة',  color: 'bg-blue-50 text-blue-600' },
  draft_ready:        { label: 'جاهز للمراجعة', color: 'bg-amber-50 text-amber-700' },
  under_review:       { label: 'قيد المراجعة',   color: 'bg-amber-50 text-amber-700' },
  revision_requested: { label: 'طلب مراجعة',     color: 'bg-orange-50 text-orange-700' },
  approved:           { label: 'معتمدة',         color: 'bg-green-50 text-green-700' },
  packaging:          { label: 'يُجهَّز',         color: 'bg-green-50 text-green-700' },
  delivered:          { label: 'مُسلَّمة ✓',      color: 'bg-green-100 text-green-800' },
  failed:             { label: 'فشل',             color: 'bg-red-50 text-red-600' },
  cancelled:          { label: 'ملغي',            color: 'bg-paper-100 text-ink-200' },
}

const VALID_STATUSES = ['pending','draft_generating','draft_ready','under_review','approved','delivered','cancelled','failed']

const GOAL_LABELS: Record<string, string> = {
  courage:'الشجاعة', honesty:'الأمانة', sharing:'التعاون', friendship:'الصداقة',
  patience:'الصبر', responsibility:'المسؤولية', kindness:'اللطف',
  self_confidence:'الثقة بالنفس', respect:'الاحترام', gratitude:'الامتنان',
  discipline:'الانضباط', forgiveness:'التسامح', creativity:'الإبداع',
  problem_solving:'حل المشكلات', resilience:'المرونة', islamic_values:'القيم الإسلامية',
}

export default function AdminDashboard() {
  const [metrics, setMetrics]     = useState<Metrics | null>(null)
  const [orders, setOrders]       = useState<Order[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('all')
  const [updating, setUpdating]   = useState<string | null>(null)

  // Review panel state
  const [reviewOrder, setReviewOrder]   = useState<Order | null>(null)
  const [draft, setDraft]               = useState<Draft | null>(null)
  const [draftLoading, setDraftLoading] = useState(false)
  const [revisionBrief, setRevisionBrief] = useState('')
  const [actionLoading, setActionLoading] = useState<'approve'|'revise'|null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res  = await fetch('/api/v1/admin')
    const json = await res.json()
    if (json.ok) { setMetrics(json.data.metrics); setOrders(json.data.orders) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId)
    await fetch('/api/v1/admin', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, status }),
    })
    await load()
    setUpdating(null)
  }

  async function openReview(order: Order) {
    setReviewOrder(order)
    setDraft(null)
    setRevisionBrief('')
    setDraftLoading(true)

    // Assign + set under_review if needed
    if (order.status === 'draft_ready') {
      await fetch('/api/v1/editor/orders/' + order.id + '/claim', { method: 'POST' })
    }

    // Fetch draft directly from admin endpoint (bypasses status restriction)
    const res  = await fetch('/api/v1/admin/draft/' + order.id)
    const json = await res.json()
    setDraft(json.data || null)
    setDraftLoading(false)
  }

  async function handleApprove() {
    if (!reviewOrder) return
    setActionLoading('approve')
    await fetch('/api/v1/editor/orders/' + reviewOrder.id + '/approve', { method: 'POST' })
    setReviewOrder(null)
    setDraft(null)
    await load()
    setActionLoading(null)
  }

  async function handleRevise() {
    if (!reviewOrder || revisionBrief.length < 10) return
    setActionLoading('revise')
    await fetch('/api/v1/editor/orders/' + reviewOrder.id + '/revise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revision_brief: revisionBrief }),
    })
    setReviewOrder(null)
    setDraft(null)
    await load()
    setActionLoading(null)
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)
  const reviewContent = draft?.edited_content || draft?.content || ''
  const paragraphs = reviewContent.split('\n').filter(p => p.trim())
  const canReview = ['draft_ready','under_review'].includes(reviewOrder?.status || '')

  return (
    <div className="min-h-screen bg-paper-50" dir="rtl">

      {/* Header */}
      <header className="bg-white border-b border-paper-300 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-[#C9A84C]" />
            <span className="font-bold text-ink-950">
              <span className="text-[#C9A84C]">ح</span>كايتي
            </span>
            <span className="text-ink-200 text-sm">— لوحة الإدارة</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-950 transition-colors">
              <RefreshCw className="w-4 h-4" />
              تحديث
            </button>
            <a href="/dashboard" className="text-sm text-ink-400 hover:text-ink-950 transition-colors">الرئيسية</a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { label: 'إجمالي', value: metrics.total,     color: 'text-ink-950' },
              { label: 'اليوم',  value: metrics.today,     color: 'text-teal-600' },
              { label: 'انتظار', value: metrics.pending,   color: 'text-amber-600' },
              { label: 'مراجعة', value: metrics.in_review, color: 'text-blue-600' },
              { label: 'مُسلَّمة', value: metrics.delivered, color: 'text-green-600' },
              { label: 'فشل',    value: metrics.failed,    color: 'text-red-500' },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-2xl border border-paper-300 p-4 text-center shadow-card">
                <div className={`text-3xl font-bold ${m.color}`}>{m.value}</div>
                <div className="text-xs text-ink-400 mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'draft_ready', label: 'تحتاج مراجعة' },
            { id: 'under_review', label: 'قيد المراجعة' },
            { id: 'delivered', label: 'مُسلَّمة' },
            { id: 'pending', label: 'في الانتظار' },
            { id: 'failed', label: 'فشل' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === tab.id ? 'bg-ink-950 text-white' : 'bg-white border border-paper-300 text-ink-600 hover:border-paper-400'
              }`}>
              {tab.label}
              {tab.id === 'draft_ready' && metrics && metrics.in_review + (orders.filter(o=>o.status==='draft_ready').length) > 0 && (
                <span className="mr-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {orders.filter(o=>o.status==='draft_ready').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders table */}
        <div className="bg-white rounded-2xl border border-paper-300 overflow-hidden shadow-card">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#C9A84C]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-ink-200">لا توجد طلبات</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-paper-300 bg-paper-50">
                  <tr>
                    <th className="text-right px-4 py-3 text-ink-400 font-medium">الطفل</th>
                    <th className="text-right px-4 py-3 text-ink-400 font-medium">الهدف</th>
                    <th className="text-right px-4 py-3 text-ink-400 font-medium">المستخدم</th>
                    <th className="text-right px-4 py-3 text-ink-400 font-medium">التاريخ</th>
                    <th className="text-right px-4 py-3 text-ink-400 font-medium">الحالة</th>
                    <th className="text-right px-4 py-3 text-ink-400 font-medium">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-300">
                  {filtered.map(order => {
                    const sl = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-paper-100 text-ink-400' }
                    const needsReview = ['draft_ready','under_review'].includes(order.status)
                    return (
                      <tr key={order.id} className="hover:bg-paper-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-ink-950">
                          {order.children?.name || '—'}
                          <span className="text-ink-200 font-normal mr-1">{order.children?.age ? `(${order.children.age}س)` : ''}</span>
                        </td>
                        <td className="px-4 py-3 text-ink-600">{GOAL_LABELS[order.story_goal] || order.story_goal}</td>
                        <td className="px-4 py-3 text-ink-400 text-xs">{order.user_profiles?.full_name || order.user_profiles?.email || '—'}</td>
                        <td className="px-4 py-3 text-ink-400 text-xs">
                          {new Date(order.created_at).toLocaleDateString('ar-SA', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${sl.color}`}>{sl.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {needsReview && (
                              <button onClick={() => openReview(order)}
                                className="flex items-center gap-1 bg-amber-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-amber-600 transition-colors font-medium">
                                <Eye className="w-3 h-3" />
                                راجع القصة
                              </button>
                            )}
                            {updating === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-ink-400" />
                            ) : (
                              <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                                className="text-xs border border-paper-300 rounded-lg px-2 py-1.5 text-ink-600 bg-white focus:outline-none focus:ring-1 focus:ring-teal-600">
                                {VALID_STATUSES.map(s => (
                                  <option key={s} value={s}>{STATUS_LABELS[s]?.label || s}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── REVIEW PANEL (slide-over) ── */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex" dir="rtl">
          {/* Backdrop */}
          <div className="flex-1 bg-black/40" onClick={() => setReviewOrder(null)} />

          {/* Panel */}
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto flex flex-col shadow-2xl">

            {/* Panel header */}
            <div className="sticky top-0 bg-white border-b border-paper-300 px-5 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-bold text-ink-950">مراجعة قصة {reviewOrder.children?.name}</h2>
                <p className="text-xs text-ink-400 mt-0.5">
                  {GOAL_LABELS[reviewOrder.story_goal]} • {reviewOrder.children?.age} سنوات
                </p>
              </div>
              <button onClick={() => setReviewOrder(null)} className="text-ink-400 hover:text-ink-950 transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panel body */}
            <div className="flex-1 p-5 space-y-5">
              {draftLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-[#C9A84C]" />
                </div>
              ) : !draft ? (
                <div className="text-center py-20">
                  <p className="text-ink-400 mb-2">لا توجد مسودة للقصة بعد</p>
                  <p className="text-xs text-ink-200">قد تكون عملية التوليد لم تكتمل</p>
                </div>
              ) : (
                <>
                  {/* QA score */}
                  {draft.qa_score !== null && (
                    <div className="flex items-center gap-3 bg-paper-50 rounded-xl p-3">
                      <div className={`text-2xl font-bold ${draft.qa_score >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                        {draft.qa_score}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-ink-600">درجة الجودة / 100</div>
                        <div className="w-32 bg-paper-300 rounded-full h-1.5 mt-1">
                          <div className={`h-1.5 rounded-full ${draft.qa_score >= 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                            style={{ width: `${draft.qa_score}%` }} />
                        </div>
                      </div>
                      {draft.qa_flags?.length > 0 && (
                        <div className="flex-1 space-y-1">
                          {draft.qa_flags.map((f: string, i: number) => (
                            <div key={i} className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">⚠ {f}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Story cover */}
                  <div className="bg-ink-950 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-3">📖</div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {draft.title || `قصة ${reviewOrder.children?.name}`}
                    </h3>
                    <p className="text-[#9B9590] text-xs">
                      {GOAL_LABELS[reviewOrder.story_goal]} • {reviewOrder.children?.name}
                    </p>
                  </div>

                  {/* Story text — exactly as customer will see */}
                  <div className="bg-white rounded-2xl border border-paper-300 p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-paper-300">
                      <Eye className="w-4 h-4 text-ink-400" />
                      <span className="text-xs text-ink-400 font-medium">هذا ما سيراه العميل بالضبط</span>
                    </div>
                    {paragraphs.length > 0 ? paragraphs.map((para, i) => (
                      <p key={i} className="text-[17px] leading-loose text-[#2E2A24] text-right"
                        dir="rtl" style={{ fontFamily: 'var(--font-noto-arabic), sans-serif' }}>
                        {para}
                      </p>
                    )) : (
                      <p className="text-ink-400 text-center py-8">لا يوجد محتوى</p>
                    )}
                    {paragraphs.length > 0 && (
                      <div className="pt-4 border-t border-paper-300 text-center">
                        <p className="text-ink-400 text-sm">✨ نهاية القصة ✨</p>
                      </div>
                    )}
                  </div>

                  {/* Revision brief */}
                  {canReview && (
                    <div>
                      <label className="block text-sm font-medium text-ink-600 mb-2">
                        ملاحظات المراجعة (إن أردت طلب تعديل)
                      </label>
                      <textarea
                        value={revisionBrief}
                        onChange={e => setRevisionBrief(e.target.value)}
                        rows={3}
                        placeholder="مثال: الخاتمة تحتاج إلى تعديل، اللغة رسمية جداً..."
                        className="w-full border border-paper-300 rounded-xl px-4 py-3 text-sm text-ink-950 resize-none focus:outline-none focus:ring-2 focus:ring-teal-600"
                        dir="rtl"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Panel footer — action buttons */}
            {canReview && !draftLoading && draft && (
              <div className="sticky bottom-0 bg-white border-t border-paper-300 p-4 flex gap-3">
                <button onClick={handleRevise}
                  disabled={revisionBrief.length < 10 || actionLoading !== null}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-amber-500 text-amber-700 py-3 rounded-xl font-medium text-sm hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  {actionLoading === 'revise' ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  طلب تعديل
                </button>
                <button onClick={handleApprove}
                  disabled={actionLoading !== null}
                  className="flex-1 flex items-center justify-center gap-2 bg-teal-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-teal-500 disabled:opacity-40 transition-colors">
                  {actionLoading === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  موافقة وإرسال للعميل
                </button>
              </div>
            )}

            {!canReview && reviewOrder && (
              <div className="p-4 border-t border-paper-300 text-center text-sm text-ink-400">
                {reviewOrder.status === 'delivered' ? '✓ تم تسليم هذه القصة للعميل' : `الحالة الحالية: ${STATUS_LABELS[reviewOrder.status]?.label}`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
