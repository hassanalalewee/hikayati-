'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Loader2, BookOpen } from 'lucide-react'

interface Child {
  id: string
  name: string
  age: number
  gender: string
}

const GOALS = [
  { id: 'courage',         label: 'الشجاعة',        icon: '🦁' },
  { id: 'honesty',         label: 'الأمانة',         icon: '🤝' },
  { id: 'friendship',      label: 'الصداقة',         icon: '👫' },
  { id: 'kindness',        label: 'اللطف',           icon: '❤️' },
  { id: 'resilience',      label: 'الصمود',          icon: '🌳' },
  { id: 'self_confidence', label: 'الثقة بالنفس',    icon: '💪' },
  { id: 'responsibility',  label: 'المسؤولية',       icon: '⚡' },
  { id: 'gratitude',       label: 'الامتنان',        icon: '🙏' },
  { id: 'creativity',      label: 'الإبداع',         icon: '🎨' },
  { id: 'patience',        label: 'الصبر',           icon: '⏰' },
  { id: 'respect',         label: 'الاحترام',        icon: '🌸' },
  { id: 'forgiveness',     label: 'التسامح',         icon: '🕊️' },
  { id: 'sharing',         label: 'التعاون',         icon: '🤲' },
  { id: 'islamic_values',  label: 'القيم الإسلامية', icon: '🕌' },
  { id: 'problem_solving', label: 'حل المشكلات',     icon: '🔍' },
  { id: 'discipline',      label: 'الانضباط',        icon: '🎯' },
]

const DIALECTS = [
  { id: 'gulf',      label: 'خليجي',  desc: 'السعودية، الإمارات، الكويت' },
  { id: 'msa',       label: 'فصيح',   desc: 'مناسب لجميع البلدان' },
  { id: 'levantine', label: 'شامي',   desc: 'لبنان، سوريا، الأردن' },
  { id: 'egyptian',  label: 'مصري',   desc: 'مصر والسودان' },
]

const AGE_GROUPS = [
  { id: '2-4',  label: '٢–٤ سنوات',  desc: 'قصص بسيطة ومتكررة' },
  { id: '5-7',  label: '٥–٧ سنوات',  desc: 'مغامرة ممتعة' },
  { id: '8-12', label: '٨–١٢ سنة',   desc: 'قصة غنية ومفصّلة' },
]

export default function NewOrderPage() {
  const router  = useRouter()
  const [step, setStep]           = useState(1)
  const [children, setChildren]   = useState<Child[]>([])
  const [loading, setLoading]     = useState(false)
  const [consentGiven, setConsentGiven]   = useState(false)
  const [checkingConsent, setCheckingConsent] = useState(true)

  useEffect(() => {
    // Check if user already gave consent
    fetch('/api/v1/consent', { method: 'GET' })
      .then(r => r.json())
      .then(d => { setConsentGiven(d.data?.ai_consent === true); setCheckingConsent(false) })
      .catch(() => setCheckingConsent(false))
  }, [])

  async function handleConsent() {
    const res = await fetch('/api/v1/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ai_consent: true }),
    })
    if (res.ok) setConsentGiven(true)
  }

  const [selectedChild,   setSelectedChild]   = useState('')
  const [selectedGoal,    setSelectedGoal]    = useState('')
  const [selectedDialect, setSelectedDialect] = useState('gulf')
  const [selectedAge,     setSelectedAge]     = useState('5-7')
  const [specialNotes,    setSpecialNotes]    = useState('')
  const [submitting,      setSubmitting]      = useState(false)
  const [error,           setError]           = useState('')

  useEffect(() => {
    setLoading(true)
    fetch('/api/children')
      .then(r => r.json())
      .then(d => { setChildren(d.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleSubmit() {
    if (!selectedChild || !selectedGoal) return
    setSubmitting(true)
    setError('')

    const idempotencyKey = `order-${selectedChild}-${selectedGoal}-${Date.now()}`

    // Detect age group from child if not manually set
    const child = children.find(c => c.id === selectedChild)
    let ageGroup = selectedAge
    if (child) {
      if (child.age <= 4)       ageGroup = '2-4'
      else if (child.age <= 7)  ageGroup = '5-7'
      else                      ageGroup = '8-12'
    }

    const res = await fetch('/api/v1/orders', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        child_id:        selectedChild,
        story_goal:      selectedGoal,
        dialect:         selectedDialect,
        age_group:       ageGroup,
        special_notes:   specialNotes.trim() || null,
        idempotency_key: idempotencyKey,
      }),
    })

    const json = await res.json()
    if (!res.ok) {
      setError(json.error?.message || 'حدث خطأ — يرجى المحاولة مرة أخرى')
      setSubmitting(false)
      return
    }

    router.push(`/orders/${json.data.order_id}`)
  }

  if (loading) return (
    <div className="min-h-screen bg-paper-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#C9A84C]" />
    </div>
  )

  return (
    <div className="min-h-screen bg-paper-50" dir="rtl">
      <header className="bg-white border-b border-paper-300 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-ink-400 hover:text-ink-950 transition-colors">
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#C9A84C]" />
            <span className="font-bold text-ink-950">اطلب قصة جديدة</span>
          </div>
          {/* Step indicator */}
          <div className="mr-auto flex items-center gap-1">
            {[1,2,3].map(s => (
              <div key={s} className={`w-2 h-2 rounded-full transition-all ${s <= step ? 'bg-ink-950' : 'bg-paper-300'}`} />
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Step 1 — Choose child */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-ink-950 mb-1">لمن القصة؟</h2>
              <p className="text-sm text-ink-400">اختر طفلك أو أضف ملفاً جديداً</p>
            </div>

            <div className="space-y-3">
              {children.map(child => (
                <button key={child.id} onClick={() => setSelectedChild(child.id)}
                  className={`w-full text-right p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    selectedChild === child.id
                      ? 'border-ink-950 bg-ink-950 text-white'
                      : 'border-paper-300 bg-white text-ink-950 hover:border-paper-400'
                  }`}>
                  <span className="text-3xl">{child.gender === 'male' ? '👦' : '👧'}</span>
                  <div>
                    <p className="font-bold">{child.name}</p>
                    <p className={`text-sm ${selectedChild === child.id ? 'text-white/70' : 'text-ink-400'}`}>
                      {child.age} سنوات
                    </p>
                  </div>
                </button>
              ))}

              <Link href="/children/new"
                className="w-full text-center p-4 rounded-2xl border-2 border-dashed border-paper-300 text-ink-400 hover:border-teal-600 hover:text-teal-600 transition-colors block text-sm font-medium">
                + أضف طفلاً جديداً
              </Link>
            </div>

            <button onClick={() => setStep(2)} disabled={!selectedChild}
              className="w-full bg-[#C9A84C] text-ink-950 py-4 rounded-2xl font-bold disabled:opacity-40 hover:bg-[#D9BC76] transition-colors">
              التالي ←
            </button>
          </div>
        )}

        {/* Step 2 — Choose goal + notes */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-ink-950 mb-1">ماذا تريد أن تتعلم؟</h2>
              <p className="text-sm text-ink-400">اختر الدرس الذي تريد أن تحمله القصة</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {GOALS.map(goal => (
                <button key={goal.id} onClick={() => setSelectedGoal(goal.id)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-2 ${
                    selectedGoal === goal.id
                      ? 'border-ink-950 bg-ink-950 text-white'
                      : 'border-paper-300 bg-white text-ink-600 hover:border-paper-400'
                  }`}>
                  <span>{goal.icon}</span>
                  {goal.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-600 mb-2">
                هل تريد إضافة شيء عن طفلك؟ <span className="font-normal text-ink-200">(اختياري)</span>
              </label>
              <textarea
                value={specialNotes}
                onChange={e => setSpecialNotes(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder={`مثال: "يخاف من الظلام" أو "لديه أخ صغير جديد"`}
                className="w-full border border-paper-300 rounded-xl px-4 py-3 text-ink-950 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-600"
                dir="rtl"
              />
              <p className="text-xs text-ink-200 mt-1">{specialNotes.length}/500</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-2xl border border-paper-300 text-ink-600 font-medium hover:bg-paper-100 transition-colors">
                ← السابق
              </button>
              <button onClick={() => setStep(3)} disabled={!selectedGoal}
                className="flex-1 bg-[#C9A84C] text-ink-950 py-3 rounded-2xl font-bold disabled:opacity-40 hover:bg-[#D9BC76] transition-colors">
                التالي ←
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Dialect + confirm */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-ink-950 mb-1">بأي لهجة؟</h2>
              <p className="text-sm text-ink-400">اختر اللهجة الأقرب لعائلتك</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {DIALECTS.map(d => (
                <button key={d.id} onClick={() => setSelectedDialect(d.id)}
                  className={`p-4 rounded-xl border-2 text-right transition-all ${
                    selectedDialect === d.id
                      ? 'border-ink-950 bg-ink-950 text-white'
                      : 'border-paper-300 bg-white text-ink-950 hover:border-paper-400'
                  }`}>
                  <p className="font-bold">{d.label}</p>
                  <p className={`text-xs mt-0.5 ${selectedDialect === d.id ? 'text-white/70' : 'text-ink-400'}`}>{d.desc}</p>
                </button>
              ))}
            </div>

            {/* Order summary */}
            <div className="bg-white border border-paper-300 rounded-2xl p-4 space-y-2">
              <h3 className="font-bold text-ink-950 mb-3">ملخص طلبك</h3>
              <div className="flex justify-between text-sm">
                <span className="text-ink-400">الطفل</span>
                <span className="font-medium text-ink-950">{children.find(c => c.id === selectedChild)?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-400">الهدف</span>
                <span className="font-medium text-ink-950">{GOALS.find(g => g.id === selectedGoal)?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-ink-400">اللهجة</span>
                <span className="font-medium text-ink-950">{DIALECTS.find(d => d.id === selectedDialect)?.label}</span>
              </div>
              {specialNotes && (
                <div className="pt-2 border-t border-paper-300 text-sm">
                  <span className="text-ink-400">ملاحظاتك: </span>
                  <span className="text-ink-600">{specialNotes}</span>
                </div>
              )}
            </div>

            {/* Trust badge */}
            <div className="bg-gold-100 border border-gold-border rounded-xl p-3 text-sm text-center text-ink-600">
              ✓ ستراجع قصة طفلك محررة متخصصة قبل تسليمها — جاهزة خلال ٤–٨ ساعات
            </div>

            {error && (
              <div className="bg-error-50 border border-red-200 text-error-600 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-2xl border border-paper-300 text-ink-600 font-medium hover:bg-paper-100 transition-colors">
                ← السابق
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 bg-[#C9A84C] text-ink-950 py-4 rounded-2xl font-bold disabled:opacity-60 hover:bg-[#D9BC76] transition-colors flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب ✓'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
