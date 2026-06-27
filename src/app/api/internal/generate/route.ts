import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { runStoryPipeline } from '@/lib/ai/pipeline/orchestrator'

export async function POST(req: Request) {
  // Internal-only endpoint — no fallback key; missing env var = always rejected
  const requiredKey = process.env.INTERNAL_API_KEY
  const internalKey = req.headers.get('x-internal-key')
    || req.headers.get('authorization')?.replace('Bearer ', '')
  if (!requiredKey || internalKey !== requiredKey) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { jobId, storyId, childId, goals, style, dialect, wordCountTarget, advisorChallenge } = body

  const supabase = await createAdminClient()

  // Mark job as processing
  await supabase
    .from('generation_jobs')
    .update({ status: 'processing', started_at: new Date().toISOString(), current_stage: 'تحليل شخصية طفلك', progress: 5 })
    .eq('id', jobId)

  try {
    // Fetch child
    const { data: child } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .single()

    if (!child) throw new Error('Child not found')

    // Run the pipeline
    const result = await runStoryPipeline({
      child,
      goals,
      style,
      dialect,
      wordCountTarget: wordCountTarget || 1200,
      advisorChallenge,
      onProgress: async (stage, progress) => {
        await supabase
          .from('generation_jobs')
          .update({ current_stage: stage, progress })
          .eq('id', jobId)
      },
    })

    // Save story assets (illustrations)
    const assetInserts = [
      ...(result.coverUrl ? [{
        story_id: storyId,
        type: 'cover',
        page_num: 0,
        url: result.coverUrl,
        alt_text: `غلاف قصة ${child.name}`,
      }] : []),
      ...result.pageUrls.map(page => ({
        story_id: storyId,
        type: 'page' as const,
        page_num: page.pageNum,
        url: page.url,
        alt_text: page.arabicCaption,
      })),
    ]

    if (assetInserts.length > 0) {
      await supabase.from('story_assets').insert(assetInserts)
    }

    // Save parent guide
    await supabase.from('parent_guides').insert({
      story_id: storyId,
      lesson_summary: result.parentGuide.lessonSummary,
      discussion_questions: result.parentGuide.discussionQuestions,
      family_activities: result.parentGuide.familyActivities.map(a => `${a.title}: ${a.description}`),
      reinforcement_tips: result.parentGuide.reinforcementTips,
      parenting_advice: result.parentGuide.parentingAdvice,
    })

    // Update story to complete
    await supabase
      .from('stories')
      .update({
        title: result.title,
        subtitle: result.subtitle,
        body: result.body,
        word_count: result.body.split(/\s+/).length,
        cover_url: result.coverUrl,
        status: 'complete',
        pipeline_metadata: {
          qualityScore: result.qaScore,
          tokensUsed: result.tokensUsed,
          costUsd: result.costUsd,
          agentScores: {},
          durationMs: Date.now() - new Date(body.startedAt || Date.now()).getTime(),
          revisionsCount: 0,
        },
      })
      .eq('id', storyId)

    // Mark job complete
    await supabase
      .from('generation_jobs')
      .update({
        status: 'complete',
        progress: 100,
        current_stage: 'مكتمل',
        completed_at: new Date().toISOString(),
        tokens_used: result.tokensUsed,
        cost_usd: result.costUsd,
        agent_log: result.agentLog,
      })
      .eq('id', jobId)

    return NextResponse.json({ success: true, storyId })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Pipeline failed'

    await supabase
      .from('stories')
      .update({ status: 'failed' })
      .eq('id', storyId)

    await supabase
      .from('generation_jobs')
      .update({ status: 'failed', error_message: message, completed_at: new Date().toISOString() })
      .eq('id', jobId)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
