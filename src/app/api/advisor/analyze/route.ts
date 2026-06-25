import { anthropic, AI_MODELS } from '@/lib/ai/models'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { challengeText, childId } = await req.json()
  if (!challengeText?.trim()) return NextResponse.json({ error: 'Challenge text required' }, { status: 400 })

  try {
    const message = await anthropic.messages.create({
      model: AI_MODELS.CLAUDE_SONNET,
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `
أنت مستشار تربوي متخصص في الأسرة العربية وعلم نفس الطفولة.

تحدي الوالد: "${challengeText}"

حلل التحدي وأخرج JSON فقط:
{
  "rootCauses": ["سبب محتمل 1", "سبب محتمل 2"],
  "emotionalNeeds": ["احتياج عاطفي 1", "احتياج عاطفي 2"],
  "recommendedGoals": ["الصدق", "الثقة بالنفس"],
  "recommendedStyle": "مغامرة",
  "briefSummary": "جملة أو جملتان تشرح التحليل وتوصي بالقصة المثالية"
}

الأهداف المتاحة: الصدق، المسؤولية، الشجاعة، الامتنان، الانضباط، الصداقة، اللطف، ضد التنمر، القيادة، الاحترام، الثقة بالنفس، الذكاء العاطفي، الصمود، الإبداع، حل المشكلات، القيم الإسلامية
الأساليب المتاحة: مغامرة، خيال، إسلامية، حيوانات، فضاء، بطل خارق، غموض، تاريخية، علمية، يومية
`
      }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response')

    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const analysis = JSON.parse(jsonMatch[0])

    // Save session
    await supabase.from('advisor_sessions').insert({
      user_id: user.id,
      child_id: childId || null,
      challenge_text: challengeText,
      analysis,
    })

    return NextResponse.json({ data: analysis })
  } catch {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
