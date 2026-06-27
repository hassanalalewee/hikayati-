'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'

interface Order {
  id: string
  status: string
  story_goal: string
  dialect: string
  age_group: string
  special_notes: string | null
  revision_count: number
  sla_deadline: string
  assigned_editor_id: string | null
  children: { name: string; age: number; personality: string[]; gender: string } | null
}

interface Draft {
  id: string
  version: number
  title: string | null
  content: string | null
  word_count: number | null
  qa_score: number | null
  qa_flags: string[]
  editor_notes: string | null
  edited_content: string | null
  edited_at: string | null
  model_used: string | null
  created_at: string
}

interface IllustrationPrompt {
  id: string
  scene_index: number
  prompt_text: string
  style_notes: string | null
}

// 17-point quality checklist matching 23_EDITORIAL_DASHBOARD.md
const CHECKLIST_ITEMS = [
  { id: 'grammar',      section: 'اللغة',       label: 'القواعد النحوية صحيحة' },
  { id: 'vocab',        section: 'اللغة',       label: 'مفردات مناسبة للعمر' },
  { id: 'dialect',      section: 'اللغة',       label: 'اللهجة متسقة طوال القصة' },
  { id: 'flow',         section: 'اللغة',       label: 'تدفق طبيعي وسلس' },
  { id: 'cultural',     section: 'الثقافة',     label: 'المراجع الثقافية أصيلة' },
  { id: 'no_western',   section: 'الثقافة',     label: 'لا افتراضات ثقافية غربية' },
  { id: 'values',       section: 'الثقافة',     label: 'القيم محترمة ومناسبة' },
  { id: 'no_fear',      section: 'الأمان',      label: 'لا محتوى مخيف للطفل' },
  { id: 'resolution',   section: 'الأمان',      label: 'نهاية إيجابية ومحفزة' },
  { id: 'age_conflict', section: 'الأمان',      label: 'الصراع مناسب للعمر' },
  { id: 'name_natural', section: 'التخصيص',    label: 'اسم الطفل يظهر بشكل طبيعي' },
  { id: 'personality',  section: 'التخصيص',    label: 'شخصية الطفل ظاهرة في الأحداث' },
  { id: 'parent_notes', section: 'التخصيص',    label: 'ملاحظات الوالدين مدمجة' },
  { id: 'arc',          section: 'السرد',       label: 'بداية وحبكة ونهاية واضحة' },
  { id: 'hero',         section: 'السرد',       label: 'الطفل هو البطل ويقود الأحداث' },
  { id: 'read_aloud',   section: 'السرد',       label: 'القصة ممتعة للقراءة بصوت عالٍ' },
  { id: 'goal',         section: 'السرد',       label: 'الهدف التربوي واضح وغير مباشر' },
]

const SECTIONS = [...new Set(CHECKLIST_ITEMS.map(i => i.section))]

const GOAL_LABELS: Record<string, string> = {
  courage: 'الشجاعة', honesty: 'الأمانة', sharing: 'التعاون',
  friendship: 'الصداقة', patience: 'الصبر', responsibility: 'المسؤولية',
  kindness: 'اللطف', self_confidence: 'الثقة بالنفس', respect: 'الاحترام',
  gratitude: 'الامتنان', discipline: 'الانضباط', forgiveness: 'التسامح',
  creativity: 'الإبداع', problem_solving: 'حل المشكلات', resilience: 'المرونة',
  islamic_values: 'القيم الإسلامية',
}

export default function EditorWorkspacePage() {
  const params = useParams()
  const orderId = params.id as string

  const [order, setOrder]   = useState<Order | null>(null)
  const [draft, setDraft]   = useState<Draft | null>(null)
  const [prompts, setPrompts] = useState<IllustrationPrompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  const [editedContent, setEditedContent] = useState('')
  const [editorNotes, setEditorNotes]     = useState('')
  const [checked, setChecked]             = useState<Record<string, boolean>>({})
  const [revisionBrief, setRevisionBrief] = useState('')

  const [submitting, setSubmitting] = useState<'approve' | 'revise' | null>(null)
  const [saved, setSaved] = useState(false)

  // Refs so auto-save always reads current values without recreating the interval
  const editedContentRef = useRef(editedContent)
  const editorNotesRef   = useRef(editorNotes)
  useEffect(() => { editedContentRef.current = editedContent }, [editedContent])
  useEffect(() => { editorNotesRef.current = editorNotes },     [editorNotes])

  const allChecked = CHECKLIST_ITEMS.every(i => checked[i.id])
  const checkedCount = Object.values(checked).filter(Boolean).length

  const load = useCallback(async () => {
    const res = await fetch(`/api/v1/editor/orders/${orderId}/draft`)
    if (!res.ok) { setError('تعذّر تحميل البيانات'); setLoading(false); return }
    const json = await res.json()
    setOrder(json.data.order)
    setDraft(json.data.draft)
    setPrompts(json.data.illustration_prompts || [])
    if (json.data.draft) {
      setEditedContent(json.data.draft.edited_content || json.data.draft.content || '')
      setEditorNotes(json.data.draft.editor_notes || '')
    }
    setLoading(false)
  }, [orderId])

  useEffect(() => { load() }, [load])

  // Auto-save every 10 seconds using refs — always reads latest values
  useEffect(() => {
    if (!draft) return
    const interval = setInterval(async () => {
      const res = await fetch(`/api/v1/editor/orders/${orderId}/draft`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          edited_content: editedContentRef.current,
          editor_notes:   editorNotesRef.current,
        }),
      })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000) }
    }, 10000)
    return () => clearInterval(interval)
  }, [draft, orderId])

  async function handleApprove() {
    if (!allChecked) return
    setSubmitting('approve')
    const res = await fetch(`/api/v1/editor/orders/${orderId}/approve`, { method: 'POST' })
    if (res.ok) {
      window.location.href = '/editor/queue'
    } else {
      const err = await res.json()
      alert(err.error?.message || 'فشلت الموافقة')
    }
    setSubmitting(null)
  }

  async function handleRevise() {
    if (!revisionBrief.trim() || revisionBrief.length < 20) {
      alert('يرجى كتابة ملاحظات المراجعة (20 حرف على الأقل)')
      return
    }
    setSubmitting('revise')
    const res = await fetch(`/api/v1/editor/orders/${orderId}/revise`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ revision_brief: revisionBrief }),
    })
    if (res.ok) {
      window.location.href = '/editor/queue'
    } else {
      const err = await res.json()
      alert(err.error?.message || 'فشل طلب المراجعة')
    }
    setSubmitting(null)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#6B6560]">جاري التحميل...</div>
  )
  if (error || !order || !draft) return (
    <div className="flex items-center justify-center h-64 text-red-600">{error || 'لم يُعثر على البيانات'}</div>
  )

  const child = order.children

  return (
    <div className="grid grid-cols-[280px_1fr_320px] gap-6 h-[calc(100vh-120px)]">

      {/* ── LEFT PANEL: Context ── */}
      <aside className="overflow-y-auto space-y-4">

        {/* Child profile */}
        <div className="bg-white rounded-xl border border-[#E8E4DC] p-4">
          <h3 className="font-bold text-[#1A1814] mb-3">ملف الطفل</h3>
          <div className="text-lg font-bold text-[#1A1814] mb-1">{child?.name}</div>
          <div className="text-sm text-[#6B6560] mb-3">{child?.age} سنوات • {child?.gender === 'male' ? 'ولد' : 'بنت'}</div>

          <div className="text-xs font-medium text-[#6B6560] mb-1">الشخصية</div>
          <div className="flex flex-wrap gap-1 mb-3">
            {(child?.personality || []).map(p => (
              <span key={p} className="px-2 py-0.5 bg-[#F0EDE8] text-[#4B4640] rounded-full text-xs">{p}</span>
            ))}
          </div>

          <div className="text-xs font-medium text-[#6B6560] mb-1">الهدف التربوي</div>
          <div className="text-sm text-[#1A1814] mb-3">{GOAL_LABELS[order.story_goal] || order.story_goal}</div>

          {order.special_notes && (
            <>
              <div className="text-xs font-medium text-[#6B6560] mb-1">ملاحظات الوالدين</div>
              <div className="text-sm text-[#4B4640] bg-[#FAFAF8] rounded-lg p-2 text-right leading-relaxed">
                "{order.special_notes}"
              </div>
            </>
          )}
        </div>

        {/* QA report */}
        <div className="bg-white rounded-xl border border-[#E8E4DC] p-4">
          <h3 className="font-bold text-[#1A1814] mb-3">تقرير الجودة</h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-2xl font-bold text-[#1A1814]">{draft.qa_score ?? '—'}</div>
            <div className="text-sm text-[#6B6560]">/ 100</div>
          </div>
          {draft.qa_score !== null && (
            <div className="w-full bg-[#E8E4DC] rounded-full h-2 mb-3">
              <div
                className={`h-2 rounded-full ${draft.qa_score >= 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{ width: `${draft.qa_score}%` }}
              />
            </div>
          )}
          {draft.qa_flags?.length > 0 && (
            <div className="space-y-1">
              {draft.qa_flags.map((flag: string, i: number) => (
                <div key={i} className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">⚠ {flag}</div>
              ))}
            </div>
          )}
        </div>

        {/* Order timeline */}
        <div className="bg-white rounded-xl border border-[#E8E4DC] p-4">
          <h3 className="font-bold text-[#1A1814] mb-3">الجدول الزمني</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: 'تم استلام الطلب', done: true },
              { label: 'تم إنشاء المسودة', done: !!draft },
              { label: 'قيد المراجعة', done: order.status === 'under_review' },
              { label: 'تمت الموافقة', done: order.status === 'delivered' },
              { label: 'تم التسليم', done: order.status === 'delivered' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs
                  ${step.done ? 'bg-green-500 text-white' : 'bg-[#E8E4DC] text-[#9B9590]'}`}>
                  {step.done ? '✓' : '○'}
                </span>
                <span className={step.done ? 'text-[#1A1814]' : 'text-[#9B9590]'}>{step.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[#E8E4DC] text-xs text-[#9B9590]">
            المراجعة رقم {order.revision_count + 1} • {order.dialect}
          </div>
        </div>
      </aside>

      {/* ── CENTER: Editorial Canvas ── */}
      <main className="overflow-y-auto flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-[#E8E4DC] overflow-hidden flex-1">
          {/* Header */}
          <div className="border-b border-[#E8E4DC] px-5 py-3 flex items-center justify-between">
            <div>
              <div className="font-bold text-[#1A1814]">
                {draft.title || `قصة ${child?.name}`}
              </div>
              <div className="text-xs text-[#9B9590]">
                مسودة {draft.version} • {draft.word_count} كلمة • {draft.model_used || 'نموذج AI'}
              </div>
            </div>
            {saved && <span className="text-xs text-green-600">✓ تم الحفظ</span>}
          </div>

          {/* Dual view */}
          <div className="grid grid-cols-2 divide-x divide-[#E8E4DC] h-full min-h-[500px]">
            {/* AI draft — read only */}
            <div className="p-5 overflow-y-auto bg-[#F8F6F2]">
              <div className="text-xs font-medium text-[#9B9590] mb-3 text-center">المسودة الأصلية (للقراءة فقط)</div>
              <div className="text-[18px] leading-loose text-[#4B4640] whitespace-pre-wrap text-right" dir="rtl">
                {draft.content || 'لا توجد مسودة'}
              </div>
            </div>

            {/* Editor's copy — editable */}
            <div className="p-5 flex flex-col">
              <div className="text-xs font-medium text-[#9B9590] mb-3 text-center">نسختك المحررة</div>
              <textarea
                value={editedContent}
                onChange={e => setEditedContent(e.target.value)}
                className="flex-1 text-[18px] leading-loose text-[#1A1814] text-right resize-none outline-none bg-transparent min-h-[400px]"
                dir="rtl"
                placeholder="ابدأ التحرير هنا..."
              />
            </div>
          </div>
        </div>

        {/* Editor notes */}
        <div className="bg-white rounded-xl border border-[#E8E4DC] p-4">
          <label className="text-sm font-medium text-[#1A1814] mb-2 block">ملاحظات تحريرية (داخلية)</label>
          <textarea
            value={editorNotes}
            onChange={e => setEditorNotes(e.target.value)}
            rows={2}
            className="w-full text-sm text-[#4B4640] text-right border border-[#E8E4DC] rounded-lg p-2 resize-none outline-none focus:border-[#1A1814]"
            dir="rtl"
            placeholder="ملاحظات للسجل الداخلي (لا تظهر للعميل)..."
          />
        </div>

        {/* Illustration prompts */}
        {prompts.length > 0 && (
          <div className="bg-white rounded-xl border border-[#E8E4DC] p-4">
            <h4 className="text-sm font-bold text-[#1A1814] mb-3">مطالبات الرسوم ({prompts.length})</h4>
            <div className="space-y-2">
              {prompts.map(p => (
                <div key={p.id} className="text-xs text-[#4B4640] bg-[#FAFAF8] rounded p-2">
                  <span className="font-medium text-[#9B9590] ml-2">مشهد {p.scene_index}:</span>
                  {p.prompt_text}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── RIGHT PANEL: Checklist + Actions ── */}
      <aside className="overflow-y-auto space-y-4">

        {/* Quality checklist */}
        <div className="bg-white rounded-xl border border-[#E8E4DC] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#1A1814]">قائمة الجودة</h3>
            <span className={`text-sm font-medium ${allChecked ? 'text-green-600' : 'text-[#6B6560]'}`}>
              {checkedCount} / {CHECKLIST_ITEMS.length}
            </span>
          </div>

          {SECTIONS.map(section => (
            <div key={section} className="mb-4">
              <div className="text-xs font-bold text-[#9B9590] uppercase tracking-wide mb-2">{section}</div>
              <div className="space-y-2">
                {CHECKLIST_ITEMS.filter(i => i.section === section).map(item => (
                  <label key={item.id} className="flex items-start gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!checked[item.id]}
                      onChange={e => setChecked(prev => ({ ...prev, [item.id]: e.target.checked }))}
                      className="mt-0.5 accent-green-600"
                    />
                    <span className={`text-sm leading-snug ${checked[item.id] ? 'line-through text-[#9B9590]' : 'text-[#1A1814]'}`}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Approval actions */}
        <div className="bg-white rounded-xl border border-[#E8E4DC] p-4 space-y-4">
          <h3 className="font-bold text-[#1A1814]">قرارك</h3>

          {/* Approve */}
          <button
            onClick={handleApprove}
            disabled={!allChecked || submitting !== null}
            title={!allChecked ? 'أكمل قائمة الجودة أولاً' : ''}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all
              ${allChecked && submitting === null
                ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                : 'bg-[#E8E4DC] text-[#9B9590] cursor-not-allowed'
              }`}
          >
            {submitting === 'approve' ? 'جاري الموافقة...' : '✓ الموافقة على القصة'}
          </button>

          {!allChecked && (
            <p className="text-xs text-[#9B9590] text-center">
              يرجى إكمال قائمة الجودة للتفعيل
            </p>
          )}

          <hr className="border-[#E8E4DC]" />

          {/* Request revision */}
          {order.revision_count < 2 ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1A1814] block">↻ طلب مراجعة</label>
              <textarea
                value={revisionBrief}
                onChange={e => setRevisionBrief(e.target.value)}
                rows={3}
                className="w-full text-sm text-right border border-[#E8E4DC] rounded-lg p-2 resize-none outline-none focus:border-[#1A1814]"
                dir="rtl"
                placeholder="اكتب ملاحظات المراجعة (20 حرف على الأقل)..."
              />
              <button
                onClick={handleRevise}
                disabled={revisionBrief.length < 20 || submitting !== null}
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all
                  ${revisionBrief.length >= 20 && submitting === null
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-[#E8E4DC] text-[#9B9590] cursor-not-allowed'
                  }`}
              >
                {submitting === 'revise' ? 'جاري الإرسال...' : 'إرسال طلب المراجعة'}
              </button>
              <p className="text-xs text-[#9B9590] text-center">
                متبقٍ {2 - order.revision_count} طلب مراجعة
              </p>
            </div>
          ) : (
            <div className="text-xs text-[#9B9590] bg-[#FAFAF8] rounded-lg p-3 text-center">
              وصلت للحد الأقصى من المراجعات. يرجى إعادة الكتابة يدوياً أو الموافقة.
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
