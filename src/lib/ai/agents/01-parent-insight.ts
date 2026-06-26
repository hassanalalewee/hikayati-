import { groqWithRetry, AI_MODELS } from '../models'
import { extractJson } from '../parse-json'
import type { PipelineContext, ParentInsights } from '../pipeline/types'

export async function runParentInsightAgent(ctx: PipelineContext): Promise<ParentInsights> {
  const { child, goals, style, advisorChallenge } = ctx.input
  const start = Date.now()

  const prompt = `
أنت محلل نفسي متخصص في فهم احتياجات الأطفال العرب.

معلومات الطفل:
- الاسم: ${child.name}
- العمر: ${child.age} سنة
- الجنس: ${child.gender === 'male' ? 'ولد' : 'بنت'}
- الدولة: ${child.country || 'غير محدد'}
- الهوايات: ${child.hobbies.join('، ') || 'غير محدد'}
- الحيوان المفضل: ${child.favorite_animal || 'غير محدد'}
- اللون المفضل: ${child.favorite_color || 'غير محدد'}
- الأنشطة المفضلة: ${child.favorite_activities.join('، ') || 'غير محدد'}
- أهداف القصة: ${goals.join('، ')}
- أسلوب القصة: ${style}
${advisorChallenge ? `- تحدي الوالدين: ${advisorChallenge}` : ''}

مهمتك: تحليل شخصية الطفل وبناء ملف تفصيلي يساعد في كتابة قصة مثالية.

أخرج JSON فقط بهذا الهيكل الدقيق بدون أي نص إضافي:
{
  "childPersonality": {
    "traits": ["صفة1", "صفة2", "صفة3"],
    "communicationStyle": "وصف أسلوب التواصل",
    "emotionalProfile": "وصف الملف العاطفي"
  },
  "coreChallenge": {
    "description": "وصف التحدي الأساسي",
    "rootCauses": ["سبب1", "سبب2"],
    "emotionalNeeds": ["احتياج1", "احتياج2"]
  },
  "storyDirection": {
    "primaryGoal": "${goals[0]}",
    "secondaryGoal": "${goals[1] || ''}",
    "recommendedTheme": "الموضوع المقترح للقصة",
    "avoidThemes": ["تجنب1", "تجنب2"]
  },
  "personalizationBrief": {
    "heroTraits": ["صفة بطولية1", "صفة بطولية2", "صفة بطولية3"],
    "heroStrengths": ["قوة1", "قوة2"],
    "heroGrowthArc": "وصف رحلة النمو في القصة",
    "settingIdeas": ["مكان مقترح1", "مكان مقترح2"],
    "companionIdea": "فكرة الشخصية المرافقة"
  }
}
`

  const response = await groqWithRetry({
    model: AI_MODELS.GROQ_LARGE,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.choices[0].message.content || ''
  const insights = extractJson<ParentInsights>(text)

  ctx.agentLog.push({
    agentId: 'parent-insight',
    stage: 'تحليل الوالدين',
    durationMs: Date.now() - start,
    tokensUsed: response.usage?.total_tokens || 0,
  })
  ctx.tokensUsed += response.usage?.total_tokens || 0

  return insights
}
