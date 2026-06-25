'use client'

import { useWizardStore } from '@/stores/wizard-store'
import { GoalStep } from './_steps/GoalStep'
import { ChildStep } from './_steps/ChildStep'
import { StyleStep } from './_steps/StyleStep'
import { GeneratingStep } from './_steps/GeneratingStep'
import { AdvisorStep } from './_steps/AdvisorStep'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const STEP_LABELS = ['المستشار', 'الأهداف', 'عن طفلك', 'أسلوب القصة', 'الإنشاء']

function CreateStoryContent() {
  const { currentStep, setChildField, reset } = useWizardStore()
  const searchParams = useSearchParams()
  const childId = searchParams.get('childId')
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    reset()

    if (!childId) return

    fetch(`/api/children/${childId}`)
      .then(r => r.json())
      .then(({ data }) => {
        if (!data) return
        setChildField('childId', data.id)
        setChildField('childName', data.name)
        setChildField('childAge', data.age)
        setChildField('childGender', data.gender)
        setChildField('childCountry', data.country || '')
        setChildField('childHobbies', data.hobbies || [])
        setChildField('childFavoriteColor', data.favorite_color || '')
        setChildField('childFavoriteAnimal', data.favorite_animal || '')
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
            <BookOpen className="w-5 h-5" />
            <span className="font-bold text-indigo-600">حكايتي</span>
          </Link>
          <span className="text-slate-500 text-sm">إنشاء قصة جديدة</span>
        </div>
      </header>

      {currentStep < 5 && (
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              {STEP_LABELS.slice(0, 4).map((label, i) => (
                <div key={i} className="flex items-center gap-1 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                    i + 1 < currentStep
                      ? 'bg-indigo-600 text-white'
                      : i + 1 === currentStep
                      ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {i + 1 < currentStep ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs hidden sm:block ${i + 1 === currentStep ? 'text-indigo-700 font-medium' : 'text-slate-400'}`}>
                    {label}
                  </span>
                  {i < 3 && <div className={`h-px flex-1 ${i + 1 < currentStep ? 'bg-indigo-300' : 'bg-slate-200'}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-6">
        {currentStep === 1 && <AdvisorStep />}
        {currentStep === 2 && <GoalStep />}
        {currentStep === 3 && <ChildStep />}
        {currentStep === 4 && <StyleStep />}
        {currentStep === 5 && <GeneratingStep />}
      </main>
    </div>
  )
}

export default function CreateStoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="text-slate-400">جاري التحميل...</div></div>}>
      <CreateStoryContent />
    </Suspense>
  )
}
