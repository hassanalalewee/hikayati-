'use client'

import { useState } from 'react'
import type { ParentGuide } from '@/types'
import { ChevronDown, MessageCircle, Lightbulb, Heart, Users } from 'lucide-react'

interface Props {
  guide: ParentGuide
  childName: string
}

export function ParentGuideSection({ guide, childName }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900">دليل الوالدين</p>
            <p className="text-xs text-slate-500">اقرأ بعد القصة لتعمّق الأثر</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-slate-100">
          {/* Lesson Summary */}
          {guide.lesson_summary && (
            <div className="pt-4">
              <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                <span className="text-indigo-500">📌</span> ملخص الدرس
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed bg-indigo-50 rounded-xl p-3">
                {guide.lesson_summary}
              </p>
            </div>
          )}

          {/* Discussion Questions */}
          {guide.discussion_questions?.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-purple-500" /> أسئلة للنقاش مع {childName}
              </h4>
              <ul className="space-y-2">
                {guide.discussion_questions.map((q, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-600">
                    <span className="text-purple-400 font-bold flex-shrink-0">{i + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Family Activities */}
          {guide.family_activities?.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-500" /> أنشطة عائلية
              </h4>
              <ul className="space-y-2">
                {guide.family_activities.map((a, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-600">
                    <span className="text-green-400 flex-shrink-0">🎯</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reinforcement Tips */}
          {guide.reinforcement_tips?.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" /> نصائح التعزيز الإيجابي
              </h4>
              <ul className="space-y-2">
                {guide.reinforcement_tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-600">
                    <span className="text-rose-400 flex-shrink-0">💫</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Parenting Advice */}
          {guide.parenting_advice && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-xs text-amber-600 font-medium mb-1">نصيحة تربوية</p>
              <p className="text-sm text-amber-800 leading-relaxed">{guide.parenting_advice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
