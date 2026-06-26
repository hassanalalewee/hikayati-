import { groqWithRetry, AI_MODELS } from '../models'
import type { PipelineContext } from '../pipeline/types'

const DIALECT_INSTRUCTIONS: Record<string, string> = {
  gulf: 'استخدم المفردات والتعبيرات الخليجية مع الإبقاء على الفصحى المبسطة. أمثلة: "يا ولدي"، "زين"، "وايد"، مشاعر الصحراء والبحر والنخيل.',
  levantine: 'استخدم نكهة شامية مع الفصحى. أمثلة: "يلا"، "كتير"، الجبال والزيتون والكنافة والدفء العائلي.',
  egyptian: 'استخدم نكهة مصرية مع الفصحى. أمثلة: "يا حبيبي"، روح النيل والقاهرة والعائلة الكبيرة.',
  msa: 'فصحى مبسطة ومشرقة، مفهومة لجميع أطفال العرب دون لهجة إقليمية.',
  maghrebi: 'فصحى مبسطة مع نكهة مغاربية. الأطلس والمدينة القديمة وأرض المغرب.',
}

const AGE_INSTRUCTIONS: Record<string, string> = {
  '3-4': 'جمل قصيرة جداً (5-8 كلمات). مفردات بسيطة جداً. الكثير من الأصوات والحركة. تكرار محبب.',
  '5-7': 'جمل متوسطة (8-12 كلمة). مفردات مألوفة مع 5-10 كلمات جديدة. صور مجازية بسيطة.',
  '8-10': 'جمل أطول وأكثر تعقيداً. مفردات أغنى. حبكة ذات أبعاد متعددة.',
  '11-13': 'لغة رصينة. استعارات أدبية. حبكة نفسية أعمق. حوار واقعي.',
}

export async function runStoryGeneratorAgent(ctx: PipelineContext): Promise<string> {
  const { child, dialect, wordCountTarget } = ctx.input
  const blueprint = ctx.blueprint!
  const insights = ctx.insights!
  const start = Date.now()

  const ageGroup = child.age <= 4 ? '3-4' : child.age <= 7 ? '5-7' : child.age <= 10 ? '8-10' : '11-13'

  const systemPrompt = `أنت كاتب قصص أطفال عربي من الدرجة الأولى. قصصك تُنشر في أرقى دور النشر العربية.

قواعدك الذهبية:
1. ${child.name} هو/هي البطل الحقيقي — اسمه يظهر بشكل طبيعي كل 3-4 فقرات
2. الدرس يُعاش لا يُقال — لا وعظ مباشر أبداً
3. كل جملة تحمل إيقاعها الموسيقي الخاص
4. الصور البلاغية تُحرّك العقل والقلب
5. النهاية دائماً إيجابية ومُلهِمة
6. ${DIALECT_INSTRUCTIONS[dialect] || DIALECT_INSTRUCTIONS.gulf}
7. ${AGE_INSTRUCTIONS[ageGroup]}

ممنوع: الجمل الروبوتية، العظة المباشرة، الخوف كأداة تعليم.`

  const userPrompt = `اكتب القصة الكاملة وفق الهيكل التالي:

عنوان القصة: ${blueprint.title}

هيكل المشاهد:
${blueprint.acts.map(act => `المرحلة ${act.actNumber} — ${act.actName}: ${act.summary} | اللحظة المحورية: ${act.keyMoment}`).join('\n')}

البطل: ${child.name}، ${child.age} سنوات، ${child.gender === 'male' ? 'ولد' : 'بنت'}
صفاته: ${insights.personalizationBrief.heroTraits.join('، ')}
الرفيق: ${blueprint.companion.name} (${blueprint.companion.type})
المكان: ${blueprint.settingDescription}
الهدف التربوي المضمّن: ${blueprint.embeddedLesson}

طول القصة: ${wordCountTarget} كلمة تقريباً
ابدأ مباشرة بالقصة دون مقدمات.`

  const response = await groqWithRetry({
    model: AI_MODELS.GROQ_LARGE,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })

  const text = response.choices[0].message.content || ''
  if (!text) throw new Error('Story generator: empty response')

  ctx.agentLog.push({
    agentId: 'story-generator',
    stage: 'كتابة القصة',
    durationMs: Date.now() - start,
    tokensUsed: response.usage?.total_tokens || 0,
  })
  ctx.tokensUsed += response.usage?.total_tokens || 0

  return text
}
