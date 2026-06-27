import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generateStoryPDF } from '@/lib/pdf/story'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()

  // Load order — parent can only download their own delivered orders
  const { data: order } = await admin
    .from('orders')
    .select('id, parent_id, status, story_goal, dialect, children(name, age)')
    .eq('id', orderId)
    .single()

  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Admins can download any order; parents only their own delivered orders
  const { data: profile } = await supabase
    .from('user_profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  if (!isAdmin && order.parent_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (!isAdmin && order.status !== 'delivered') {
    return NextResponse.json({ error: 'Not delivered yet' }, { status: 403 })
  }

  // Load draft content
  const { data: draft } = await admin
    .from('story_drafts')
    .select('title, content, edited_content')
    .eq('order_id', orderId)
    .eq('is_active', true)
    .single()

  if (!draft) return NextResponse.json({ error: 'No story draft found' }, { status: 404 })

  const child   = order.children as unknown as { name: string; age: number }
  const title   = draft.title   || `قصة ${child?.name}`
  const content = draft.edited_content || draft.content || ''

  if (!content.trim()) {
    return NextResponse.json({ error: 'Story content is empty' }, { status: 400 })
  }

  try {
    const pdfBuffer = await generateStoryPDF({
      title,
      childName: child?.name || 'طفلنا',
      storyGoal: order.story_goal,
      content,
      dialect: order.dialect,
    })

    const fileName = `hikayati-${child?.name || 'story'}.pdf`
      .replace(/\s+/g, '-')
      .replace(/[^\w\-\.]/g, '')

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control':       'no-store',
      },
    })
  } catch (err) {
    console.error('[pdf] generation error:', err)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}
