'use client'

import { useWizardStore } from '@/stores/wizard-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { COUNTRIES, COLORS, ANIMALS } from '@/lib/constants'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function ChildStep() {
  const store = useWizardStore()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const {
    childName, childAge, childGender, childCountry,
    childFavoriteColor, childFavoriteAnimal, childHobbies,
    setChildField, nextStep, prevStep
  } = store

  const isValid = childName.trim().length >= 2 && childAge >= 3 && childCountry

  const toggleHobby = (hobby: string) => {
    const current = childHobbies
    if (current.includes(hobby)) {
      setChildField('childHobbies', current.filter(h => h !== hobby))
    } else if (current.length < 4) {
      setChildField('childHobbies', [...current, hobby])
    }
  }

  const HOBBY_OPTIONS = ['رسم', 'موسيقى', 'رياضة', 'قراءة', 'ألعاب', 'طبخ', 'سباحة', 'بناء وتركيب']

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">عن طفلك</h2>
        <p className="text-slate-500 mt-1">كلما أخبرتنا أكثر، كانت القصة أجمل</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        {/* Name */}
        <div>
          <Label htmlFor="childName" className="text-slate-700 font-medium">اسم الطفل *</Label>
          <Input
            id="childName"
            value={childName}
            onChange={e => setChildField('childName', e.target.value)}
            placeholder="مثال: أحمد"
            className="mt-1 text-lg"
          />
        </div>

        {/* Age + Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-slate-700 font-medium">العمر *</Label>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setChildField('childAge', Math.max(3, childAge - 1))}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-lg hover:bg-slate-50"
              >−</button>
              <div className="flex-1 text-center py-2 font-bold text-xl text-slate-900">{childAge}</div>
              <button
                onClick={() => setChildField('childAge', Math.min(14, childAge + 1))}
                className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-lg hover:bg-slate-50"
              >+</button>
            </div>
          </div>

          <div>
            <Label className="text-slate-700 font-medium">الجنس *</Label>
            <div className="flex gap-2 mt-1">
              {[{ id: 'male', label: 'ولد' }, { id: 'female', label: 'بنت' }].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setChildField('childGender', opt.id)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                    childGender === opt.id
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:border-indigo-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Country */}
        <div>
          <Label className="text-slate-700 font-medium">الدولة *</Label>
          <div className="relative mt-1">
            <select
              value={childCountry}
              onChange={e => setChildField('childCountry', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 appearance-none bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">اختر الدولة</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Advanced Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full text-indigo-600 text-sm font-medium flex items-center justify-center gap-1 py-2 hover:text-indigo-700"
        >
          ✨ اجعل القصة أكثر خصوصية (اختياري)
          <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {showAdvanced && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            {/* Hobbies */}
            <div>
              <Label className="text-slate-700 font-medium">الهوايات (حتى 4)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {HOBBY_OPTIONS.map(hobby => (
                  <button
                    key={hobby}
                    onClick={() => toggleHobby(hobby)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      childHobbies.includes(hobby)
                        ? 'bg-indigo-100 border-indigo-400 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                    }`}
                  >
                    {hobby}
                  </button>
                ))}
              </div>
            </div>

            {/* Favorite Color */}
            <div>
              <Label className="text-slate-700 font-medium">اللون المفضل</Label>
              <div className="flex gap-3 mt-2">
                {COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setChildField('childFavoriteColor', color.label)}
                    title={color.label}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      childFavoriteColor === color.label ? 'border-slate-800 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Favorite Animal */}
            <div>
              <Label className="text-slate-700 font-medium">الحيوان المفضل</Label>
              <div className="relative mt-1">
                <select
                  value={childFavoriteAnimal}
                  onChange={e => setChildField('childFavoriteAnimal', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 appearance-none bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">اختر حيواناً</option>
                  {ANIMALS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <ChevronDown className="absolute left-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={prevStep} className="flex-1">السابق</Button>
        <Button
          onClick={nextStep}
          disabled={!isValid}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
        >
          التالي: أسلوب القصة
        </Button>
      </div>
    </div>
  )
}
