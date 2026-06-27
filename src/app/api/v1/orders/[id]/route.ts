import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function ok(data: unknown) {
  return NextResponse.json({ ok: true, data })
}
function err(message: string, code: string, status: number) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status })
}

// Customer-facing status messages — never mention AI
const STATUS_MESSAGES: Record<string, { ar: string; en: string }> = {
  pending:             { ar: 'تم استلام طلبك — فريقنا يبدأ العمل الآن',         en: 'Order received — our team is starting now' },
  draft_generating:    { ar: 'فريقنا التحريري يُعدّ القصة',                    en: 'Our editorial team is preparing the story' },
  draft_ready:         { ar: 'فريقنا التحريري يُعدّ القصة',                    en: 'Our editorial team is preparing the story' },
  under_review:        { ar: 'المراجعة التحريرية جارية — نتحقق من الجودة',       en: 'Editorial review in progress' },
  revision_requested:  { ar: 'فريقنا يُدخل تحسينات أخيرة على القصة',           en: 'Our team is making final improvements' },
  approved:            { ar: 'اكتملت مراجعة الجودة — القصة في مرحلة التجهيز',   en: 'Quality check complete — story being prepared' },
  packaging:           { ar: 'قصتك تُجهَّز للتسليم — لحظات أخيرة!',            en: 'Your story is being prepared for delivery' },
  delivered:           { ar: 'قصتك جاهزة! 🎉',                                  en: 'Your story is ready! 🎉' },
  failed:              { ar: 'فريقنا يضع لمسات إضافية على القصة',              en: 'Our team is adding extra care to the story' },
  cancelled:           { ar: 'تم إلغاء الطلب',                                  en: 'Order cancelled' },
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return err('Unauthorized', 'unauthorized', 401)

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, status, story_goal, dialect, age_group,
      special_notes, created_at, delivered_at, sla_deadline,
      parent_id,
      children ( name, age )
    `)
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!order) return err('Order not found', 'not_found', 404)

  // Explicit ownership check — defence-in-depth on top of RLS
  if (order.parent_id !== user.id) return err('Order not found', 'not_found', 404)

  const message = STATUS_MESSAGES[order.status] ?? STATUS_MESSAGES.pending

  return ok({ ...order, message })
}
