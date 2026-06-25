'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import Link from 'next/link'

const PLANS = [
  {
    id: 'free',
    name: 'مجاني',
    price: '$0',
    period: '',
    color: 'slate',
    features: ['قصة واحدة / شهر', 'تخصيص أساسي', 'قراءة على الويب', 'PDF بعلامة مائية'],
    missing: ['صوت سرد القصة', 'دليل الوالدين', 'لوحة النمو', 'رسوم بجودة عالية'],
    cta: 'الخطة الحالية',
    ctaAction: null,
    highlight: false,
  },
  {
    id: 'premium_monthly',
    name: 'مميز ⭐',
    price: '$14.99',
    period: '/ شهر',
    color: 'indigo',
    features: [
      'قصص غير محدودة',
      'تخصيص كامل + صورة الطفل',
      'صوت سرد عربي أصيل',
      'رسوم توضيحية بجودة عالية',
      'دليل الوالدين مع كل قصة',
      'مستشار التربية الذكي',
      'لوحة النمو والتطور',
      'تقرير شهري PDF',
      '4 لهجات عربية',
    ],
    missing: [],
    cta: 'ابدأ Premium',
    ctaAction: 'premium_monthly',
    highlight: true,
  },
  {
    id: 'family_monthly',
    name: 'عائلة بلس 👨‍👩‍👧‍👦',
    price: '$24.99',
    period: '/ شهر',
    color: 'purple',
    features: [
      'كل مزايا Premium',
      'حتى 5 ملفات أطفال',
      'مكتبة عائلية مشتركة',
      'تقارير مقارنة متقدمة',
      'تحديات القراءة العائلية',
      'دعم أولوية',
    ],
    missing: [],
    cta: 'ابدأ Family Plus',
    ctaAction: 'family_monthly',
    highlight: false,
  },
]

export default function UpgradePage() {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleSubscribe(plan: string) {
    setLoading(plan)
    try {
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.data?.checkoutUrl) {
        window.location.href = data.data.checkoutUrl
      }
    } catch {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/dashboard" className="text-indigo-600 text-sm font-medium hover:underline mb-4 inline-block">
            ← العودة للرئيسية
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">اختر الخطة المناسبة لعائلتك</h1>
          <p className="text-slate-500">جميع الخطط تشمل قصصاً بجودة كتب الأطفال الاحترافية</p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {PLANS.map(plan => (
            <div key={plan.id} className={`bg-white rounded-2xl p-6 border-2 flex flex-col ${plan.highlight ? 'border-indigo-600 shadow-xl shadow-indigo-100' : 'border-slate-200'}`}>
              {plan.highlight && (
                <div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full self-start mb-3">
                  الأكثر شيوعاً
                </div>
              )}
              <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                <span className="text-slate-500 text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.missing.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-400 line-through">
                    <span className="w-4 h-4 mt-0.5 flex-shrink-0 text-center">✗</span>
                    {f}
                  </li>
                ))}
              </ul>

              {plan.ctaAction ? (
                <button
                  onClick={() => handleSubscribe(plan.ctaAction!)}
                  disabled={loading === plan.ctaAction}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                    plan.highlight
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {loading === plan.ctaAction && <Loader2 className="w-4 h-4 animate-spin" />}
                  {plan.cta}
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl font-bold text-sm text-center bg-slate-50 text-slate-400">
                  {plan.cta}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Trust Signals */}
        <div className="text-center space-y-2 text-sm text-slate-500">
          <p>🔒 دفع آمن بـ Stripe • بدون عقود • إلغاء في أي وقت</p>
          <p>💬 أكثر من 1000 قصة تم إنشاؤها بتقييم 4.8/5</p>
        </div>
      </div>
    </div>
  )
}
