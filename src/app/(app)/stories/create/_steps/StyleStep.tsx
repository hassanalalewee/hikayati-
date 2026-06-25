'use client'

import { useWizardStore } from '@/stores/wizard-store'
import { Button } from '@/components/ui/button'
import { STORY_STYLES, DIALECTS } from '@/lib/constants'
import type { StoryStyle, Dialect } from '@/types'

export function StyleStep() {
  const { storyStyle, dialect, setStoryStyle, setDialect, nextStep, prevStep, selectedGoals, childName } = useWizardStore()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">أسلوب القصة</h2>
        <p className="text-slate-500 mt-1">اختر العالم الذي ستدور فيه مغامرة {childName || 'طفلك'}</p>
      </div>

      {/* Story Styles */}
      <div className="grid grid-cols-2 gap-3">
        {STORY_STYLES.map(style => (
          <button
            key={style.id}
            onClick={() => setStoryStyle(style.id as StoryStyle)}
            className={`p-4 rounded-xl border-2 text-right transition-all ${
              storyStyle === style.id
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30'
            }`}
          >
            <div className="text-3xl mb-2">{style.icon}</div>
            <div className="font-bold text-slate-800 text-sm">{style.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{style.description}</div>
            {storyStyle === style.id && <div className="mt-1 text-xs text-indigo-600 font-medium">✓ محدد</div>}
          </button>
        ))}
      </div>

      {/* Dialect */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-800 mb-3">اللهجة</h3>
        <div className="grid grid-cols-2 gap-2">
          {DIALECTS.map(d => (
            <button
              key={d.id}
              onClick={() => setDialect(d.id as Dialect)}
              className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${
                dialect === d.id
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-indigo-200'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Card */}
      {storyStyle && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-5">
          <h3 className="font-bold text-indigo-800 mb-2">✨ ملخص قصتك</h3>
          <div className="text-sm text-indigo-700 space-y-1">
            <p>البطل: <strong>{childName || 'طفلك'}</strong></p>
            <p>الأهداف: <strong>{selectedGoals.map(g => g).join(' • ')}</strong></p>
            <p>الأسلوب: <strong>{STORY_STYLES.find(s => s.id === storyStyle)?.label}</strong></p>
            <p>اللهجة: <strong>{DIALECTS.find(d => d.id === dialect)?.label}</strong></p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="flex-1">السابق</Button>
        <Button
          onClick={nextStep}
          disabled={!storyStyle}
          className="flex-1 bg-gradient-to-l from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-base py-3"
        >
          ✨ ابدأ إنشاء القصة
        </Button>
      </div>
    </div>
  )
}
