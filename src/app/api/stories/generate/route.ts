import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const generateSchema = z.object({
  childId: z.string().uuid(),
  goals: z.array(z.string()).min(1).max(3),
  style: z.string(),
  dialect: z.string(),
  includeAudio: z.boolean().default(false),
  wordCountTarget: z.number().min(600).max(2000).default(1200),
  advisorChallenge: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const admin = await createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .single()

    if (!sub || sub.status !== 'active') {
      return NextResponse.json({ error: 'No active subscription' }, { status: 403 })
    }

    if (sub.plan === 'free') {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      const { count } = await supabase
        .from('stories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'complete')
        .gte('created_at', startOfMonth.toISOString())
      if ((count ?? 0) >= 1) {
        return NextResponse.json(
          { error: 'free_limit_reached', message: 'لقد استخدمت قصتك المجانية لهذا الشهر' },
          { status: 402 }
        )
      }
    }

    const body = await req.json()
    const parsed = generateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { childId, goals, style, dialect, wordCountTarget, advisorChallenge } = parsed.data

    const { data: child } = await supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .eq('user_id', user.id)
      .single()

    if (!child) return NextResponse.json({ error: 'Child not found' }, { status: 404 })

    const { data: story, error: storyError } = await admin
      .from('stories')
      .insert({
        user_id: user.id,
        child_id: childId,
        title: `قصة ${child.name}`,
        body: '',
        goals,
        style,
        dialect,
        age_group: child.age <= 4 ? '3-4' : child.age <= 7 ? '5-7' : child.age <= 10 ? '8-10' : '11-13',
        status: 'generating',
      })
      .select()
      .single()

    if (!story) {
      return NextResponse.json({ error: `Failed to create story: ${storyError?.message}` }, { status: 500 })
    }

    const { data: job, error: jobError } = await admin
      .from('generation_jobs')
      .insert({
        user_id: user.id,
        child_id: childId,
        story_id: story.id,
        status: 'queued',
      })
      .select()
      .single()

    if (!job) {
      await admin.from('stories').delete().eq('id', story.id)
      return NextResponse.json({ error: `Failed to create job: ${jobError?.message}` }, { status: 500 })
    }

    await admin.from('stories').update({ generation_job_id: job.id }).eq('id', story.id)

    // Detect base URL from request to avoid hardcoded port issues
    const reqUrl = new URL(req.url)
    const baseUrl = `${reqUrl.protocol}//${reqUrl.host}`

    fetch(`${baseUrl}/api/internal/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-key': process.env.INTERNAL_API_KEY || 'dev-secret-key-change-in-prod',
      },
      body: JSON.stringify({ jobId: job.id, storyId: story.id, childId, goals, style, dialect, wordCountTarget, advisorChallenge, userId: user.id }),
    }).catch(console.error)

    return NextResponse.json({ data: { jobId: job.id, storyId: story.id, estimatedSeconds: 75 } })

  } catch (e) {
    console.error('GENERATE ERROR:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
