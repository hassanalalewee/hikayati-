import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { runStoryPipeline } from '@/lib/ai/pipeline/orchestrator'
import { validateEnv } from '@/lib/env'

// Auth guard: internal key only — no fallback; missing key = always rejected
function isAuthorized(req: Request) {
  const requiredKey = process.env.INTERNAL_API_KEY
  if (!requiredKey) return false  // reject if env var not set
  const provided = req.headers.get('authorization')?.replace('Bearer ', '')
    || req.headers.get('x-internal-key')
  return provided === requiredKey
}

export async function POST(req: Request) {
  validateEnv()

  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { order_id, revision_brief } = body as { order_id: string; revision_brief?: string }

  if (!order_id) {
    return NextResponse.json({ error: 'order_id required' }, { status: 400 })
  }

  const supabase = await createAdminClient()

  // Load order + child
  const { data: order } = await supabase
    .from('orders')
    .select('id, child_id, story_goal, dialect, age_group, special_notes, revision_count, parent_id')
    .eq('id', order_id)
    .single()

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const { data: child } = await supabase
    .from('children')
    .select('*')
    .eq('id', order.child_id)
    .single()

  if (!child) {
    return NextResponse.json({ error: 'Child not found' }, { status: 404 })
  }

  // Mark order as generating
  await supabase.from('orders').update({ status: 'draft_generating' }).eq('id', order_id)
  await supabase.from('order_events').insert({
    order_id,
    actor_id:   null,
    actor_type: 'system',
    event_type: 'draft_generating',
    from_status: order.revision_count > 0 ? 'revision_requested' : 'pending',
    to_status:   'draft_generating',
    metadata:    { revision_brief: revision_brief || null },
  })

  // Map age_group to word count target
  const wordCountByAge: Record<string, number> = {
    '2-4':  450,
    '5-7':  800,
    '8-12': 1200,
  }
  const wordCountTarget = wordCountByAge[order.age_group] || 800

  try {
    const startedAt = Date.now()

    const result = await runStoryPipeline({
      child,
      goals:           [order.story_goal],
      style:           'adventure',        // MVP: single style
      dialect:         order.dialect,
      wordCountTarget,
      advisorChallenge: revision_brief || order.special_notes || undefined,
      onProgress:      async () => {},     // No SSE for order-based flow
    })

    const durationMs = Date.now() - startedAt

    // Deactivate any existing active draft before inserting new one
    await supabase.from('story_drafts')
      .update({ is_active: false })
      .eq('order_id', order_id)
      .eq('is_active', true)

    // Version = count of existing drafts + 1
    const { count: existingDraftCount } = await supabase
      .from('story_drafts')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', order_id)
    const nextVersion = (existingDraftCount ?? 0) + 1

    // Insert story draft (active)
    const { data: draft } = await supabase.from('story_drafts').insert({
      order_id,
      version:           nextVersion,
      is_active:         true,
      title:             result.title,
      content:           result.body,
      word_count:        result.body.split(/\s+/).length,
      qa_score:          result.qaScore,
      qa_flags:          [],  // QA flags not exposed by current pipeline — editor sees qa_score
      model_used:        'groq/llama-3.3-70b',
      prompt_tokens:     result.tokensUsed,
      completion_tokens: 0,
      generation_ms:     durationMs,
    }).select('id').single()

    if (!draft) throw new Error('Failed to insert story draft')

    // Store illustration prompts if pipeline exposes them (future)
    // Currently the pipeline generates images internally — prompts not separately exposed
    // illustration_prompts table will be populated when AI service layer is upgraded

    // Store generated images permanently in Supabase Storage
    // Download from DALL-E URL immediately — never store the expiring URL
    const imageInserts: Array<{ order_id: string; draft_id: string; asset_type: string; scene_index: number; storage_path: string }> = []

    const allImages = [
      ...(result.coverUrl ? [{ url: result.coverUrl, sceneIndex: 0, type: 'cover' }] : []),
      ...result.pageUrls.map((p: { url: string; pageNum: number }) => ({ url: p.url, sceneIndex: p.pageNum, type: 'illustration' })),
    ]

    await Promise.all(
      allImages.map(async (img) => {
        try {
          // Only accept URLs from known DALL-E Azure blob storage host
          const allowedHost = '.blob.core.windows.net'
          const imgHost = new URL(img.url).hostname
          if (!imgHost.endsWith(allowedHost)) {
            console.error(`[generate-order] rejected image URL from unknown host: ${imgHost}`)
            return
          }

          // Fetch with timeout — prevent hanging on slow upstream
          const controller = new AbortController()
          const timeout = setTimeout(() => controller.abort(), 30_000)
          const response = await fetch(img.url, { signal: controller.signal })
          clearTimeout(timeout)

          if (!response.ok) return

          // Validate MIME type before downloading body
          const contentType = response.headers.get('content-type') || ''
          if (!contentType.startsWith('image/')) {
            console.error(`[generate-order] rejected non-image content-type: ${contentType}`)
            return
          }

          // Enforce 10 MB max file size
          const MAX_BYTES = 10 * 1024 * 1024
          const contentLength = response.headers.get('content-length')
          if (contentLength && parseInt(contentLength) > MAX_BYTES) {
            console.error(`[generate-order] rejected oversized image: ${contentLength} bytes`)
            return
          }

          const buffer = await response.arrayBuffer()
          if (buffer.byteLength > MAX_BYTES) return  // double-check after download

          // Validate scene index is in safe range to prevent path traversal
          const safeIndex = Math.max(0, Math.min(99, img.sceneIndex))
          const storagePath = `stories/${order_id}/${img.type}_${safeIndex}.png`

          const { error: uploadError } = await supabase.storage
            .from('story-assets')
            .upload(storagePath, buffer, {
              contentType: 'image/png',
              upsert:      true,
            })

          if (!uploadError) {
            imageInserts.push({
              order_id,
              draft_id:     draft.id,
              asset_type:   img.type,
              scene_index:  safeIndex,
              storage_path: storagePath,
            })
          }
        } catch (e) {
          console.error(`[generate-order] image upload failed for scene ${img.sceneIndex}`, e)
        }
      })
    )

    if (imageInserts.length > 0) {
      // Store image records in illustration_prompts table using draft_id
      // (avoids story_assets FK constraint which references stories table, not orders)
      await supabase.from('illustration_prompts').insert(
        imageInserts.map(a => ({
          draft_id:    draft.id,
          scene_index: a.scene_index,
          prompt_text: `${a.asset_type} image`,
          style_notes: supabase.storage.from('story-assets').getPublicUrl(a.storage_path).data.publicUrl,
        }))
      )
    }

    // Mark order as draft_ready, set SLA deadline
    await supabase.from('orders').update({
      status:         'draft_ready',
      draft_ready_at: new Date().toISOString(),
      sla_deadline:   new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    }).eq('id', order_id)

    await supabase.from('order_events').insert({
      order_id,
      actor_id:    null,
      actor_type:  'system',
      event_type:  'draft_ready',
      from_status: 'draft_generating',
      to_status:   'draft_ready',
      metadata:    { qa_score: result.qaScore, draft_id: draft.id, duration_ms: durationMs },
    })

    return NextResponse.json({ ok: true, draft_id: draft.id })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Pipeline failed'
    console.error('[generate-order] pipeline error', message)

    await supabase.from('orders').update({ status: 'failed' }).eq('id', order_id)
    await supabase.from('order_events').insert({
      order_id,
      actor_id:    null,
      actor_type:  'system',
      event_type:  'generation_failed',
      from_status: 'draft_generating',
      to_status:   'failed',
      notes:       message,
    })

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
