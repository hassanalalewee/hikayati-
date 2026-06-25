'use client'

import { useState } from 'react'
import { useWizardStore } from '@/stores/wizard-store'
import { Button } from '@/components/ui/button'
import { Loader2, Sparkles } from 'lucide-react'

const CHALLENGE_EXAMPLES = [
  'طفلي يكذب كثيراً ولا يعترف بأخطائه',
  'طفلي يخاف من النوم وحده',
  'طفلي لا يثق بنفسه ودائماً يقول "لا أستطيع"',
  'طفلي يعاني من التنمر في المدرسة',
  'طفلي يقضي وقتاً طويلاً أمام الشاشات',
]

interface AnalysisResult {
  rootCauses: string[]
  emotionalNeeds: string[]
  recommendedGoals: string[]
  recommendedStyle: string
  briefSummary: string
}

export function AdvisorStep() {
  const { advisorChallenge, setAdvisorChallenge, nextStep } = useWizardStore()
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')

  async function analyzeChallenge() {
    if (!advisorChallenge.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/advisor/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeText: advisorChallenge }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAnalysis(data.data)
    } catch {
      setError('تعذّر التحليل — حاول مجدداً')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 rounded-2xl mb-3">
          <Sparkles className="w-7 h-7 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">مستشار التربية الذكي</h2>
        <p className="text-slate-500 mt-1 text-sm">هل تواجه تحدياً مع طفلك؟ أخبرنا ونصمم القصة المثالية</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <textarea
          value={advisorChallenge}
          onChange={e => setAdvisorChallenge(e.target.value)}
          placeholder="اكتب التحدي بكلماتك الخاصة..."
          rows={4}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400 text-sm leading-relaxed"
        />

        {/* Examples */}
        <div>
          <p className="text-xs text-slate-400 mb-2">أمثلة شائعة:</p>
          <div className="flex flex-wrap gap-2">
            {CHALLENGE_EXAMPLES.map(ex => (
              <button
                key={ex}
                onClick={() => setAdvisorChallenge(ex)}
                className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
              >
                {ex.length > 40 ? ex.substring(0, 40) + '...' : ex}
              </button>
            ))}
          </div>
        </div>

        {advisorChallenge.trim() && !analysis && (
          <Button
            onClick={analyzeChallenge}
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Sparkles className="w-4 h-4 ml-2" />}
            {loading ? 'جاري التحليل...' : 'حلّل التحدي'}
          </Button>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Analysis Result */}
        {analysis && (
          <div className="bg-indigo-50 rounded-xl p-4 space-y-3 border border-indigo-100">
            <h3 className="font-bold text-indigo-800 text-sm">تحليل المستشار الذكي</h3>
            <div>
              <p className="text-xs text-indigo-600 font-medium mb-1">الأسباب المحتملة:</p>
              <ul className="list-disc list-inside text-sm text-slate-700 space-y-0.5">
                {analysis.rootCauses.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
            <div>
              <p className="text-xs text-indigo-600 font-medium mb-1">الأهداف المقترحة:</p>
              <div className="flex flex-wrap gap-2">
                {analysis.recommendedGoals.map(g => (
                  <span key={g} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs">{g}</span>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-600 bg-white rounded-lg p-3">{analysis.briefSummary}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={nextStep}
          className="flex-1 text-slate-500"
        >
          تخطي
        </Button>
        <Button
          onClick={nextStep}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
        >
          التالي: اختر الأهداف
        </Button>
      </div>
    </div>
  )
}
