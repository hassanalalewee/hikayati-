import { groqWithRetry, AI_MODELS } from '../models'
import { extractJson } from '../parse-json'
import type { PipelineContext, StoryBlueprint } from '../pipeline/types'

const AGE_GROUP_LABEL: Record<string, string> = {
  '3-4': 'من 3 إلى 4 سنوات',
  '5-7': 'من 5 إلى 7 سنوات',
  '8-10': 'من 8 إلى 10 سنوات',
  '11-13': 'من 11 إلى 13 سنوات',
}

export async function runStoryArchitectAgent(ctx: PipelineContext): Promise<StoryBlueprint> {
  const { child, goals, style } = ctx.input
  const insights = ctx.insights!
  const start = Date.now()

  const ageGroup = child.age <= 4 ? '3-4' : child.age <= 7 ? '5-7' : child.age <= 10 ? '8-10' : '11-13'

  const prompt = `
أنت مهندس قصص أطفال من الطراز الأول. مهمتك تصميم هيكل قصة مغامرة رائعة.

البطل: ${child.name} (${child.age} سنة، ${child.gender === 'male' ? 'ولد' : 'بنت'})
الأهداف التربوية: ${goals.join('، ')}
أسلوب القصة: ${style}
الفئة العمرية: ${AGE_GROUP_LABEL[ageGroup]}

ملف الشخصية من المحلل:
- صفات البطل: ${insights.personalizationBrief.heroTraits.join('، ')}
- قوى البطل: ${insights.personalizationBrief.heroStrengths.join('، ')}
- رحلة النمو: ${insights.personalizationBrief.heroGrowthArc}
- أفكار الأماكن: ${insights.personalizationBrief.settingIdeas.join('، ')}
- الرفيق المقترح: ${insights.personalizationBrief.companionIdea}
- الدرس المضمّن: ${insights.storyDirection.recommendedTheme}

صمم القصة على 6 مراحل (Introduction, Challenge, Discovery, Growth, Resolution, Transformation).
القصة يجب أن تُعلّم بالتجربة لا بالكلام المباشر.
اسم ${child.name} يظهر في كل مشهد بشكل طبيعي.

أخرج JSON فقط بدون أي نص إضافي:
{
  "title": "عنوان القصة بالعربية (جذاب وقصير)",
  "subtitle": "جملة تشويقية قصيرة",
  "heroDescription": "وصف مرئي تفصيلي للبطل للرسام",
  "settingDescription": "وصف المكان الرئيسي بتفاصيل حسية",
  "companion": {
    "name": "اسم الرفيق",
    "type": "نوعه (حيوان/صديق/شخصية سحرية)",
    "role": "دوره في القصة"
  },
  "acts": [
    { "actNumber": 1, "actName": "البداية", "summary": "ملخص المشهد", "keyMoment": "اللحظة المحورية", "illustrationCue": "وصف المشهد المرئي" },
    { "actNumber": 2, "actName": "التحدي", "summary": "...", "keyMoment": "...", "illustrationCue": "..." },
    { "actNumber": 3, "actName": "الاكتشاف", "summary": "...", "keyMoment": "...", "illustrationCue": "..." },
    { "actNumber": 4, "actName": "النمو", "summary": "...", "keyMoment": "...", "illustrationCue": "..." },
    { "actNumber": 5, "actName": "الحل", "summary": "...", "keyMoment": "...", "illustrationCue": "..." },
    { "actNumber": 6, "actName": "التحول", "summary": "...", "keyMoment": "...", "illustrationCue": "..." }
  ],
  "embeddedLesson": "كيف يُضمَّن الدرس في القصة دون وعظ مباشر",
  "pageCount": 10
}
`

  const response = await groqWithRetry({
    model: AI_MODELS.GROQ_LARGE,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.choices[0].message.content || ''
  const blueprint = extractJson<StoryBlueprint>(text)

  ctx.agentLog.push({
    agentId: 'story-architect',
    stage: 'تصميم هيكل القصة',
    durationMs: Date.now() - start,
    tokensUsed: response.usage?.total_tokens || 0,
  })
  ctx.tokensUsed += response.usage?.total_tokens || 0

  return blueprint
}
