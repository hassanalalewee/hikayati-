import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET /api/v1/story/[id] — returns story draft content for delivered orders
// Parent can read their own delivered story
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()

  // Verify order belongs to this parent and is delivered
  const { data: order } = await admin
    .from('orders')
    .select('id, parent_id, status, story_goal, children(name, age)')
    .eq('id', orderId)
    .single()

  if (!order) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 })
  if (order.parent_id !== user.id) return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  if (order.status !== 'delivered') return NextResponse.json({ ok: false, error: 'Not delivered yet' }, { status: 403 })

  // Get the active draft
  const { data: draft } = await admin
    .from('story_drafts')
    .select('id, title, content, edited_content, word_count, created_at')
    .eq('order_id', orderId)
    .eq('is_active', true)
    .single()

  return NextResponse.json({ ok: true, data: draft })
}
