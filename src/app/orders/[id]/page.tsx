'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface OrderStatus {
  id: string
  status: string
  story_goal: string
  dialect: string
  age_group: string
  special_notes: string | null
  created_at: string
  delivered_at: string | null
  sla_deadline: string
  message: { ar: string; en: string }
  children: { name: string; age: number } | null
}

// 3-step progress mapped from order status
function getStep(status: string): 0 | 1 | 2 {
  if (status === 'pending') return 0
  if (status === 'delivered') return 2
  return 1
}

const STEPS = [
  { ar: 'تم استلام الطلب', en: 'Order received' },
  { ar: 'فريقنا يُعدّ القصة', en: 'Our team is preparing' },
  { ar: 'قصتك جاهزة!', en: 'Your story is ready!' },
]

const GOAL_LABELS: Record<string, string> = {
  courage: 'الشجاعة', honesty: 'الأمانة', sharing: 'التعاون',
  friendship: 'الصداقة', patience: 'الصبر', responsibility: 'المسؤولية',
  kindness: 'اللطف', self_confidence: 'الثقة بالنفس', respect: 'الاحترام',
  gratitude: 'الامتنان', discipline: 'الانضباط', forgiveness: 'التسامح',
  creativity: 'الإبداع', problem_solving: 'حل المشكلات', resilience: 'المرونة',
  islamic_values: 'القيم الإسلامية',
}

export default function OrderStatusPage() {
  const params  = useParams()
  const orderId = params.id as string

  const [order, setOrder]   = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await fetch(`/api/v1/orders/${orderId}`)
    if (res.ok) {
      const json = await res.json()
      setOrder(json.data)
    }
    setLoading(false)
  }, [orderId])

  useEffect(() => {
    load()

    // Realtime: refresh when order status changes
    const supabase = createClient()
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        () => load()
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [orderId, load])

  if (loading) return (
    <div dir="rtl" className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="text-[#6B6560]">جاري التحميل...</div>
    </div>
  )

  if (!order) return (
    <div dir="rtl" className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="text-center">
        <p className="text-[#6B6560] mb-4">لم يُعثر على الطلب</p>
        <Link href="/dashboard" className="text-[#1A1814] underline">العودة للوحة التحكم</Link>
      </div>
    </div>
  )

  const step     = getStep(order.status)
  const child    = order.children
  const delivered = order.status === 'delivered'

  return (
    <div dir="rtl" className="min-h-screen bg-[#FAFAF8] py-12">
      <div className="max-w-2xl mx-auto px-4">

        {/* Back */}
        <Link href="/dashboard" className="text-sm text-[#6B6560] hover:text-[#1A1814] mb-8 inline-flex items-center gap-1">
          ← طلباتي
        </Link>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[#1A1814] mt-4 mb-2">
          {delivered ? `🎉 قصة ${child?.name} جاهزة!` : `قصة ${child?.name}`}
        </h1>

        {/* Status message */}
        <div className={`rounded-xl p-5 mb-8 ${delivered ? 'bg-green-50 border border-green-200' : 'bg-white border border-[#E8E4DC]'}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">{delivered ? '✓' : '✎'}</span>
            <div>
              <p className="font-medium text-[#1A1814] text-lg leading-snug">
                {order.message.ar}
              </p>
              {!delivered && (
                <p className="text-sm text-[#6B6560] mt-1">
                  {order.message.en}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Progress steps */}
        <div className="relative mb-8">
          <div className="absolute top-4 right-4 left-4 h-0.5 bg-[#E8E4DC] -z-0" />
          <div
            className="absolute top-4 right-4 h-0.5 bg-[#1A1814] transition-all duration-700 -z-0"
            style={{ width: step === 0 ? '0%' : step === 1 ? '50%' : '100%' }}
          />
          <div className="relative z-10 flex justify-between">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-1/3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${i <= step ? 'bg-[#1A1814] text-white' : 'bg-white border-2 border-[#E8E4DC] text-[#9B9590]'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <div className="text-center">
                  <div className={`text-xs font-medium ${i <= step ? 'text-[#1A1814]' : 'text-[#9B9590]'}`}>
                    {s.ar}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivered: CTAs */}
        {delivered && (
          <div className="space-y-3 mb-8">
            <Link
              href={`/stories/order/${orderId}`}
              className="w-full block text-center bg-[#1A1814] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#2A2820] transition-colors"
            >
              📖 اقرأ القصة الآن
            </Link>
            <div className="grid grid-cols-2 gap-3">
              <button className="py-3 border border-[#E8E4DC] rounded-xl text-sm text-[#1A1814] hover:bg-white transition-colors">
                ↓ تنزيل PDF
              </button>
              <button className="py-3 border border-[#E8E4DC] rounded-xl text-sm text-[#1A1814] hover:bg-white transition-colors">
                ↗ مشاركة مع العائلة
              </button>
            </div>
          </div>
        )}

        {/* Order summary */}
        <div className="bg-white rounded-xl border border-[#E8E4DC] p-5">
          <h3 className="font-bold text-[#1A1814] mb-4">ملخص طلبك</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B6560]">الطفل</span>
              <span className="text-[#1A1814] font-medium">{child?.name}، {child?.age} سنوات</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B6560]">الهدف التربوي</span>
              <span className="text-[#1A1814] font-medium">{GOAL_LABELS[order.story_goal] || order.story_goal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B6560]">اللهجة</span>
              <span className="text-[#1A1814] font-medium">
                {{ msa: 'فصيح', gulf: 'خليجي', levantine: 'شامي', egyptian: 'مصري', maghrebi: 'مغاربي' }[order.dialect] || order.dialect}
              </span>
            </div>
            {order.special_notes && (
              <div className="pt-2 border-t border-[#E8E4DC]">
                <div className="text-[#6B6560] mb-1">ملاحظاتك</div>
                <div className="text-[#4B4640] bg-[#FAFAF8] rounded-lg p-2">"{order.special_notes}"</div>
              </div>
            )}
          </div>
        </div>

        {/* Trust signal */}
        {!delivered && (
          <div className="mt-6 bg-[#F5F0E8] border border-[#C9A84C] rounded-xl p-4 text-center">
            <p className="text-sm font-medium text-[#4B4640]">
              ✓ راجعها فريقنا التحريري كل كلمة
            </p>
            <p className="text-xs text-[#6B6560] mt-1">
              Reviewed by our editorial team — every word, every time
            </p>
          </div>
        )}

        {/* While waiting */}
        {!delivered && (
          <div className="mt-6 text-center">
            <p className="text-xs text-[#9B9590]">
              عادةً خلال 4–8 ساعات • ستصلك رسالة بمجرد اكتمال القصة
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
