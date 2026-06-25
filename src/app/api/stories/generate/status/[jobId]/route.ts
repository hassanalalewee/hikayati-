import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// SSE endpoint: polls job status every 2s and streams updates
export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const encoder = new TextEncoder()
  let closed = false

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        if (closed) return
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      const poll = async () => {
        if (closed) return

        const { data: job } = await supabase
          .from('generation_jobs')
          .select('status, current_stage, progress, story_id, error_message')
          .eq('id', jobId)
          .eq('user_id', user.id)
          .single()

        if (!job) {
          send({ type: 'error', message: 'Job not found' })
          controller.close()
          return
        }

        send({
          type: 'progress',
          stage: job.current_stage,
          progress: job.progress,
          status: job.status,
        })

        if (job.status === 'complete') {
          send({ type: 'complete', storyId: job.story_id })
          controller.close()
          return
        }

        if (job.status === 'failed') {
          send({ type: 'error', message: job.error_message || 'Generation failed' })
          controller.close()
          return
        }

        setTimeout(poll, 2000)
      }

      await poll()
    },
    cancel() {
      closed = true
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
