'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useWizardStore } from '@/stores/wizard-store'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'

const GENERATION_STAGES = [
  { id: 'تحليل شخصية طفلك', label: 'تحليل شخصية طفلك', progress: 10 },
  { id: 'تصميم هيكل القصة', label: 'تصميم هيكل القصة', progress: 25 },
  { id: 'كتابة القصة', label: 'كتابة القصة', progress: 50 },
  { id: 'إنشاء الرسوم التوضيحية', label: 'إنشاء الرسوم التوضيحية', progress: 70 },
  { id: 'إعداد دليل الوالدين', label: 'إعداد دليل الوالدين', progress: 85 },
  { id: 'مراجعة الجودة', label: 'مراجعة الجودة', progress: 95 },
]

export function GeneratingStep() {
  const router = useRouter()
  const store = useWizardStore()
  const [status, setStatus] = useState<'idle' | 'generating' | 'complete' | 'error'>('idle')
  const [currentStage, setCurrentStage] = useState('')
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [completedStages, setCompletedStages] = useState<string[]>([])
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    startGeneration()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function startGeneration() {
    setStatus('generating')

    try {
      // Validate required fields before calling API
      if (!store.storyStyle) throw new Error(`يرجى العودة واختيار أسلوب القصة (storyStyle=${store.storyStyle})`)
      if (!store.selectedGoals.length) throw new Error('يرجى العودة واختيار هدف واحد على الأقل')
      if (!store.childId && !store.childName) throw new Error('يرجى العودة وتعبئة بيانات الطفل')

      // Use existing child if already set (e.g. came from dashboard)
      let childId = store.childId

      if (!childId) {
        const res = await fetch('/api/children', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: store.childName,
            age: store.childAge,
            gender: store.childGender,
            country: store.childCountry,
            hobbies: store.childHobbies,
            favorite_color: store.childFavoriteColor,
            favorite_animal: store.childFavoriteAnimal,
            favorite_activities: store.childFavoriteActivities,
          }),
        })
        const text = await res.text()
        let data: { error?: string; data?: { id: string } } = {}
        try { data = JSON.parse(text) } catch { throw new Error(`Server error: ${text.slice(0, 150)}`) }
        if (!res.ok) throw new Error(data.error || 'فشل حفظ ملف الطفل')
        childId = data.data!.id
        store.setChildField('childId', childId)
      }

      // Trigger story generation
      const genRes = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          goals: store.selectedGoals,
          style: store.storyStyle,
          dialect: store.dialect,
          wordCountTarget: store.wordCountTarget,
          advisorChallenge: store.advisorChallenge || undefined,
        }),
      })

      const genText = await genRes.text()
      let genData: { error?: string; data?: { jobId: string; storyId: string } } = {}
      try { genData = JSON.parse(genText) } catch { throw new Error(`Server error: ${genRes.status} - ${genText.slice(0, 300)}`) }

      if (!genRes.ok) {
        if (genData.error === 'free_limit_reached') {
          router.push('/upgrade?reason=free_limit')
          return
        }
        throw new Error(genData.error || 'فشل بدء الإنشاء')
      }

      const { jobId, storyId } = genData.data!
      store.setJobId(jobId)
      store.setStoryId(storyId)

      // Poll via SSE
      const eventSource = new EventSource(`/api/stories/generate/status/${jobId}`)

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.type === 'progress') {
          setCurrentStage(data.stage)
          setProgress(data.progress)
          if (data.stage) {
            setCompletedStages(prev => {
              const idx = GENERATION_STAGES.findIndex(s => s.id === data.stage)
              if (idx > 0) return GENERATION_STAGES.slice(0, idx).map(s => s.id)
              return prev
            })
          }
        }

        if (data.type === 'complete') {
          eventSource.close()
          setProgress(100)
          setStatus('complete')
          setTimeout(() => {
            router.push(`/stories/${data.storyId}`)
          }, 1500)
        }

        if (data.type === 'error') {
          eventSource.close()
          setStatus('error')
          setErrorMessage(data.message || 'حدث خطأ أثناء الإنشاء')
        }
      }

      eventSource.onerror = () => {
        eventSource.close()
        // Fallback: poll manually if SSE fails
        pollJobStatus(jobId, storyId)
      }

    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'حدث خطأ غير متوقع')
    }
  }

  async function pollJobStatus(jobId: string, storyId: string) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/stories/generate/poll/${jobId}`)
        const data = await res.json()
        if (data.status === 'complete') {
          clearInterval(interval)
          setProgress(100)
          setStatus('complete')
          setTimeout(() => router.push(`/stories/${storyId}`), 1500)
        }
        if (data.status === 'failed') {
          clearInterval(interval)
          setStatus('error')
          setErrorMessage(data.error_message || 'فشل الإنشاء')
        }
        if (data.current_stage) setCurrentStage(data.current_stage)
        if (data.progress) setProgress(data.progress)
      } catch {
        clearInterval(interval)
      }
    }, 3000)
  }

  if (status === 'complete') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">القصة جاهزة! 🎉</h2>
        <p className="text-slate-500">جاري الانتقال إلى قصة {store.childName}...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">حدث خطأ</h2>
        <p className="text-slate-500 mb-6">{errorMessage}</p>
        <button
          onClick={() => { startedRef.current = false; startGeneration() }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
        >
          حاول مجدداً
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center py-8 text-center">
      {/* Animated Hero Illustration */}
      <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-8 animate-pulse">
        <span className="text-6xl">📖</span>
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        جاري إنشاء قصة {store.childName}...
      </h2>
      <p className="text-slate-500 mb-8 text-sm">
        {currentStage || 'نبدأ الآن...'}
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-3 mb-8">
        <div
          className="bg-gradient-to-l from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage Checklist */}
      <div className="w-full space-y-3 text-right">
        {GENERATION_STAGES.map(stage => {
          const isDone = completedStages.includes(stage.id)
          const isActive = currentStage === stage.id

          return (
            <div key={stage.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
              isActive ? 'bg-indigo-50' : isDone ? 'bg-green-50' : 'bg-slate-50'
            }`}>
              <div className="flex-1 text-sm font-medium text-right text-slate-700">
                {stage.label}
              </div>
              {isDone && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
              {isActive && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin flex-shrink-0" />}
              {!isDone && !isActive && <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex-shrink-0" />}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-slate-400 mt-8">
        يتم إنشاء قصتك بعناية فائقة — تقدير الوقت: 60-90 ثانية
      </p>
    </div>
  )
}
