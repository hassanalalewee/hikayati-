'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { BookOpen, Loader2, RefreshCw } from 'lucide-react'

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

interface Metrics {
  total:     number
  today:     number
  pending:   number
  in_review: number
  delivered: number
  failed:    number
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:            { label: 'في الانتظار',      color: 'bg-paper-100 text-ink-400' },
  draft_generating:   { label: 'يُنشئ المسودة',    color: 'bg-blue-50 text-blue-600' },
  draft_ready:        { label: 'جاهز للمراجعة',   color: 'bg-teal-50 text-teal-600' },
  under_review:       { label: 'قيد المراجعة',     color: 'bg-teal-50 text-teal-600' },
  revision_requested: { label: 'طلب مراجعة',       color: 'bg-amber-50 text-amber-700' },
  approved:           { label: 'معتمدة',           color: 'bg-green-50 text-green-700' },
  packaging:          { label: 'يُجهَّز',           color: 'bg-green-50 text-green-700' },
  delivered:          { label: 'مُسلَّمة',          color: 'bg-green-100 text-green-800' },
  failed:             { label: 'فشل',               color: 'bg-red-50 text-red-600' },
  cancelled:          { label: 'ملغي',              color: 'bg-paper-100 text-ink-200' },
}

const VALID_STATUSES = [
  'pending', 'draft_generating', 'draft_ready',
  'under_review', 'approved', 'delivered', 'cancelled', 'failed',
]

const GOAL_LABELS: Record<string, string> = {
  courage: 'الشجاعة', honesty: 'الأمانة', sharing: 'التعاون',
  friendship: 'الصداقة', patience: 'الصبر', responsibility: 'المسؤولية',
  kindness: 'اللطف', self_confidence: 'الثقة بالنفس', respect: 'الاحترام',
  gratitude: 'الامتنان', discipline: 'الانضباط', forgiveness: 'التسامح',
  creativity: 'الإبداع', problem_solving: 'حل المشكلات', resilience: 'المرونة',
  islamic_values: 'القيم الإسلامية',
}

export default function AdminDashboard() {
  const [metrics, setMetrics]   = useState<Metrics | null>(null)
  const [orders, setOrders]     = useState<Order[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res  = await fetch('/api/v1/admin')
    const json = await res.json()
    if (json.ok) {
      setMetrics(json.data.metrics)
      setOrders(json.data.orders)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function updateStatus(orderId: string, status: string) {
    setUpdating(orderId)
    await fetch('/api/v1/admin', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ order_id: orderId, status }),
    })
    await load()
    setUpdating(null)
  }

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter)

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
            <button onClick={load}
              className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-950 transition-colors">
              <RefreshCw className="w-4 h-4" />
              تحديث
            </button>
            <Link href="/editor/queue"
              className="text-sm text-teal-600 hover:text-teal-500 transition-colors">
              لوحة التحرير
            </Link>
            <Link href="/dashboard"
              className="text-sm text-ink-400 hover:text-ink-950 transition-colors">
              الرئيسية
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { label: 'إجمالي الطلبات', value: metrics.total,     color: 'text-ink-950' },
              { label: 'اليوم',           value: metrics.today,     color: 'text-teal-600' },
              { label: 'في الانتظار',     value: metrics.pending,   color: 'text-amber-600' },
              { label: 'قيد المراجعة',   value: metrics.in_review, color: 'text-blue-600' },
              { label: 'مُسلَّمة',        value: metrics.delivered, color: 'text-green-600' },
              { label: 'فشل',             value: metrics.failed,    color: 'text-red-500' },
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
            { id: 'all',        label: 'الكل' },
            { id: 'pending',    label: 'في الانتظار' },
            { id: 'draft_ready', label: 'جاهز للمراجعة' },
            { id: 'under_review', label: 'قيد المراجعة' },
            { id: 'delivered',  label: 'مُسلَّمة' },
            { id: 'failed',     label: 'فشل' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === tab.id
                  ? 'bg-ink-950 text-white'
                  : 'bg-white border border-paper-300 text-ink-600 hover:border-paper-400'
              }`}>
              {tab.label}
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
                    <th className="text-right px-4 py-3 text-ink-400 font-medium">تغيير الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-300">
                  {filtered.map(order => {
                    const s = STATUS_LABELS[order.status] ?? { label: order.status, color: 'bg-paper-100 text-ink-400' }
                    return (
                      <tr key={order.id} className="hover:bg-paper-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-ink-950">
                          {order.children?.name || '—'}
                          <span className="text-ink-200 font-normal mr-1">
                            {order.children?.age ? `(${order.children.age}س)` : ''}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-ink-600">
                          {GOAL_LABELS[order.story_goal] || order.story_goal}
                        </td>
                        <td className="px-4 py-3 text-ink-400 text-xs">
                          {order.user_profiles?.full_name || order.user_profiles?.email || '—'}
                        </td>
                        <td className="px-4 py-3 text-ink-400 text-xs">
                          {new Date(order.created_at).toLocaleDateString('ar-SA', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${s.color}`}>
                            {s.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {updating === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-ink-400" />
                          ) : (
                            <select
                              value={order.status}
                              onChange={e => updateStatus(order.id, e.target.value)}
                              className="text-xs border border-paper-300 rounded-lg px-2 py-1.5 text-ink-600 bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                            >
                              {VALID_STATUSES.map(s => (
                                <option key={s} value={s}>
                                  {STATUS_LABELS[s]?.label || s}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-xs text-ink-200 text-center">
          إجمالي {filtered.length} طلب معروض — آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}
        </p>

      </main>
    </div>
  )
}
