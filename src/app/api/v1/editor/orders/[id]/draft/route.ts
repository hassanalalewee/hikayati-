import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function ok(data: unknown) {
  return NextResponse.json({ ok: true, data })
}
function err(message: string, code: string, status: number) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status })
}

async function requireEditor() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, profile: null }
  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single()
  return { user, profile }
}

// GET /api/v1/editor/orders/[id]/draft
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { user, profile } = await requireEditor()
  if (!user) return err('Unauthorized', 'unauthorized', 401)
  if (!profile || !['editor', 'admin'].includes(profile.role)) return err('Forbidden', 'forbidden', 403)

  const admin = await createAdminClient()

  const { data: order } = await admin
    .from('orders')
    .select(`
      id, status, story_goal, dialect, age_group, special_notes,
      revision_count, sla_deadline, assigned_editor_id,
      children ( name, age, personality, gender )
    `)
    .eq('id', id)
    .single()

  if (!order) return err('Order not found', 'not_found', 404)

  const { data: draft } = await admin
    .from('story_drafts')
    .select('id, version, title, content, word_count, qa_score, qa_flags, editor_notes, edited_content, edited_at, model_used, created_at')
    .eq('order_id', id)
    .eq('is_active', true)
    .single()

  const { data: prompts } = await admin
    .from('illustration_prompts')
    .select('id, scene_index, prompt_text, style_notes')
    .eq('draft_id', draft?.id ?? '')
    .order('scene_index')

  return ok({ order, draft, illustration_prompts: prompts || [] })
}

// PATCH /api/v1/editor/orders/[id]/draft — auto-save editor edits
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { user, profile } = await requireEditor()
  if (!user) return err('Unauthorized', 'unauthorized', 401)
  if (!profile || !['editor', 'admin'].includes(profile.role)) return err('Forbidden', 'forbidden', 403)

  let body: { edited_content?: string; editor_notes?: string }
  try { body = await req.json() } catch { return err('Invalid JSON', 'invalid_body', 400) }

  const admin = await createAdminClient()

  // Only assigned editor can save (or admin)
  const { data: order } = await admin.from('orders').select('assigned_editor_id, status').eq('id', id).single()
  if (!order) return err('Order not found', 'not_found', 404)
  if (order.status !== 'under_review') return err('Order is not under review', 'invalid_status', 409)
  if (order.assigned_editor_id !== user.id && profile.role !== 'admin') {
    return err('Not assigned to this order', 'forbidden', 403)
  }

  const { data: draft } = await admin
    .from('story_drafts')
    .select('id')
    .eq('order_id', id)
    .eq('is_active', true)
    .single()

  if (!draft) return err('No active draft found', 'not_found', 404)

  const updates: Record<string, unknown> = { editor_id: user.id }
  if (body.edited_content !== undefined) {
    updates.edited_content = body.edited_content
    updates.edited_at = new Date().toISOString()
  }
  if (body.editor_notes !== undefined) updates.editor_notes = body.editor_notes

  await admin.from('story_drafts').update(updates).eq('id', draft.id)

  return ok({ saved: true })
}
