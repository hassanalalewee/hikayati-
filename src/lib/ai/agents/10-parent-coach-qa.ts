import { groqWithRetry, AI_MODELS } from '../models'
import { extractJson } from '../parse-json'
import type { PipelineContext, ParentGuideContent, QAReport } from '../pipeline/types'

export async function runParentCoachAgent(ctx: PipelineContext): Promise<ParentGuideContent> {
  const { child, goals } = ctx.input
  const start = Date.now()

  const response = await groqWithRetry({
    model: AI_MODELS.GROQ_LARGE,
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `أنت مدرب تربوي متخصص في الأسرة العربية.

بناءً على قصة ${child.name} (${child.age} سنوات) التي تتناول: ${goals.join('، ')}
هذه القصة: "${ctx.finalStory?.substring(0, 300)}..."

أنشئ دليل الوالدين الكامل بـ JSON فقط بدون أي نص إضافي:
{
  "lessonSummary": "ملخص الدرس الأساسي وكيف ظهر في القصة (فقرة واحدة)",
  "discussionQuestions": ["سؤال1", "سؤال2", "سؤال3", "سؤال4", "سؤال5"],
  "familyActivities": [
    { "title": "اسم النشاط", "description": "وصف النشاط", "duration": "المدة" },
    { "title": "...", "description": "...", "duration": "..." },
    { "title": "...", "description": "...", "duration": "..." }
  ],
  "reinforcementTips": ["نصيحة1", "نصيحة2", "نصيحة3", "نصيحة4"],
  "parentingAdvice": "نصيحة تربوية أعمق للوالدين (فقرة)"
}`,
    }],
  })

  const text = response.choices[0].message.content || ''
  const guide = extractJson<ParentGuideContent>(text)

  ctx.agentLog.push({
    agentId: 'parent-coach',
    stage: 'دليل الوالدين',
    durationMs: Date.now() - start,
    tokensUsed: response.usage?.total_tokens || 0,
  })
  ctx.tokensUsed += response.usage?.total_tokens || 0

  return guide
}

export async function runQAAgent(ctx: PipelineContext): Promise<QAReport> {
  const { child, goals } = ctx.input
  const start = Date.now()

  const response = await groqWithRetry({
    model: AI_MODELS.GROQ_LARGE,
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `أنت محكّم جودة لقصص الأطفال العربية.

قيّم هذه القصة:
"${ctx.finalStory?.substring(0, 1500)}..."

المعايير (كل معيار من 100):
- جودة القصة (السرد، الإيقاع، التشويق)
- جودة اللغة (الطبيعية، الفصحى المناسبة)
- القيمة التعليمية (هل تحقق الهدف: ${goals.join('، ')})
- السلامة العاطفية (إيجابية، آمنة للطفل)
- التخصيص (${child.name} يظهر بشكل طبيعي)
- الأصالة الثقافية

أخرج JSON فقط بدون أي نص إضافي:
{
  "passed": true,
  "overallScore": 90,
  "scores": {
    "storyQuality": 90,
    "languageQuality": 90,
    "educationalValue": 90,
    "emotionalSafety": 90,
    "personalization": 90,
    "culturalAccuracy": 90
  },
  "issues": [],
  "revisionNotes": ""
}

القصة تنجح إذا كان المجموع >= 85.`,
    }],
  })

  const text2 = response.choices[0].message.content || ''
  const report = extractJson<QAReport>(text2)

  ctx.agentLog.push({
    agentId: 'qa-agent',
    stage: 'ضمان الجودة',
    durationMs: Date.now() - start,
    tokensUsed: response.usage?.total_tokens || 0,
  })
  ctx.tokensUsed += response.usage?.total_tokens || 0

  return report
}
