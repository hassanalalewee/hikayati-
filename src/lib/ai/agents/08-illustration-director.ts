import { groq, AI_MODELS } from '../models'
import { extractJson } from '../parse-json'
import type { PipelineContext, IllustrationPage } from '../pipeline/types'
import { openai } from '../models'

export async function runIllustrationAgent(ctx: PipelineContext): Promise<IllustrationPage[]> {
  const { child } = ctx.input
  const blueprint = ctx.blueprint!
  const start = Date.now()

  const prompt = `أنت مخرج فني لكتب أطفال عربية راقية.

البطل: ${child.name}، ${child.age} سنوات، ${child.gender === 'male' ? 'ولد' : 'بنت'}.
وصف البطل: ${blueprint.heroDescription}
الرفيق: ${blueprint.companion.name} — ${blueprint.companion.type}

المشاهد للرسم:
${blueprint.acts.map(act => `المشهد ${act.actNumber}: ${act.illustrationCue}`).join('\n')}

أنشئ 7 وصفاً للرسوم التوضيحية (6 مشاهد + 1 غلاف بـ pageNum=0).
لكل رسمة: وصف إنجليزي واضح للرسام + تعليق عربي للقصة.

أخرج JSON فقط — مصفوفة بدون أي نص إضافي:
[
  {
    "pageNum": 0,
    "prompt": "Children's book illustration, warm watercolor style, Arabic cultural setting, [hero details], [scene details], soft edges, professional quality, no text, child-friendly",
    "arabicCaption": "نص عربي قصير يظهر مع الرسمة",
    "emotionalTone": "happy"
  }
]`

  const response = await groq.chat.completions.create({
    model: AI_MODELS.GROQ_LARGE,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.choices[0].message.content || ''
  const pages = extractJson<IllustrationPage[]>(text, true)

  ctx.agentLog.push({
    agentId: 'illustration-director',
    stage: 'تصميم الرسوم',
    durationMs: Date.now() - start,
    tokensUsed: response.usage?.total_tokens || 0,
  })
  ctx.tokensUsed += response.usage?.total_tokens || 0

  return pages
}

export async function generateIllustrationImage(prompt: string): Promise<string> {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
    style: 'vivid',
  })

  const url = response.data?.[0]?.url
  if (!url) throw new Error('No image URL returned from DALL-E')
  return url
}
