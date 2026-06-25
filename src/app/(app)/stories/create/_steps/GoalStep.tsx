'use client'

import { useState } from 'react'
import { useWizardStore } from '@/stores/wizard-store'
import { GOALS } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import type { DevelopmentCategory } from '@/types'

const CATEGORIES = ['الشخصية', 'الاجتماعي', 'العاطفي', 'الإدراكي', 'الروحي']

export function GoalStep() {
  const { selectedGoals, toggleGoal, nextStep, prevStep } = useWizardStore()
  const [activeCategory, setActiveCategory] = useState('الشخصية')

  const filtered = GOALS.filter(g => g.category === activeCategory)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">اختر الهدف التربوي</h2>
        <p className="text-slate-500 mt-1">اختر حتى 3 أهداف لقصة طفلك</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Goal Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.map(goal => {
          const isSelected = selectedGoals.includes(goal.id as DevelopmentCategory)
          const isDisabled = !isSelected && selectedGoals.length >= 3

          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id as DevelopmentCategory)}
              disabled={isDisabled}
              className={`p-4 rounded-xl border-2 text-right transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                  : isDisabled
                  ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              <div className="text-2xl mb-1">{goal.icon}</div>
              <div className="font-bold text-sm">{goal.label}</div>
              {isSelected && (
                <div className="mt-1 text-xs text-indigo-600 font-medium">✓ محدد</div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected Summary */}
      {selectedGoals.length > 0 && (
        <div className="bg-indigo-50 rounded-xl p-4">
          <p className="text-indigo-700 text-sm font-medium">
            المحدد ({selectedGoals.length}/3):{' '}
            {selectedGoals.map(g => GOALS.find(gl => gl.id === g)?.label).join(' • ')}
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={prevStep} className="flex-1">السابق</Button>
        <Button
          onClick={nextStep}
          disabled={selectedGoals.length === 0}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
        >
          التالي: معلومات طفلك
        </Button>
      </div>
    </div>
  )
}
