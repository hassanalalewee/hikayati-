import type { Child, DevelopmentCategory, Dialect, StoryStyle } from '@/types'
import type { PipelineContext, PipelineInput } from './types'
import { runParentInsightAgent } from '../agents/01-parent-insight'
import { runStoryArchitectAgent } from '../agents/04-story-architect'
import { runStoryGeneratorAgent } from '../agents/05-story-generator'
import { runIllustrationAgent, generateIllustrationImage } from '../agents/08-illustration-director'
import { runParentCoachAgent, runQAAgent } from '../agents/10-parent-coach-qa'

export interface RunPipelineOptions {
  child: Child
  goals: DevelopmentCategory[]
  style: StoryStyle
  dialect: Dialect
  wordCountTarget?: number
  advisorChallenge?: string
  onProgress?: (stage: string, progress: number) => void
}

export interface PipelineResult {
  title: string
  subtitle: string
  body: string
  coverUrl: string | null
  pageUrls: { pageNum: number; url: string; arabicCaption: string }[]
  parentGuide: {
    lessonSummary: string
    discussionQuestions: string[]
    familyActivities: { title: string; description: string; duration: string }[]
    reinforcementTips: string[]
    parentingAdvice: string
  }
  qaScore: number
  tokensUsed: number
  costUsd: number
  agentLog: PipelineContext['agentLog']
}

const STAGES = [
  { name: 'تحليل شخصية طفلك', progress: 10 },
  { name: 'تصميم هيكل القصة', progress: 25 },
  { name: 'كتابة القصة', progress: 50 },
  { name: 'إنشاء الرسوم التوضيحية', progress: 70 },
  { name: 'إعداد دليل الوالدين', progress: 85 },
  { name: 'مراجعة الجودة', progress: 95 },
  { name: 'الانتهاء', progress: 100 },
]

export async function runStoryPipeline(options: RunPipelineOptions): Promise<PipelineResult> {
  const { child, goals, style, dialect, wordCountTarget = 1200, advisorChallenge, onProgress } = options

  const input: PipelineInput = { child, goals, style, dialect, wordCountTarget, advisorChallenge }

  const ctx: PipelineContext = {
    input,
    tokensUsed: 0,
    costUsd: 0,
    startedAt: new Date(),
    agentLog: [],
  }

  // Stage 1: Parent Insight
  onProgress?.(STAGES[0].name, STAGES[0].progress)
  ctx.insights = await runParentInsightAgent(ctx)

  // Stage 2: Story Architect
  onProgress?.(STAGES[1].name, STAGES[1].progress)
  ctx.blueprint = await runStoryArchitectAgent(ctx)

  // Stage 3: Story Generation
  onProgress?.(STAGES[2].name, STAGES[2].progress)
  ctx.rawStory = await runStoryGeneratorAgent(ctx)
  ctx.finalStory = ctx.rawStory

  // Stage 4: Illustrations (parallel image generation)
  onProgress?.(STAGES[3].name, STAGES[3].progress)
  const illustrationPages = await runIllustrationAgent(ctx)
  ctx.illustrations = illustrationPages

  // Generate cover + page images in parallel (with error tolerance)
  const imageResults = await Promise.allSettled(
    illustrationPages.map(page => generateIllustrationImage(page.prompt))
  )

  const pageUrls: { pageNum: number; url: string; arabicCaption: string }[] = []
  let coverUrl: string | null = null

  imageResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const page = illustrationPages[index]
      if (page.pageNum === 0) {
        coverUrl = result.value
      } else {
        pageUrls.push({
          pageNum: page.pageNum,
          url: result.value,
          arabicCaption: page.arabicCaption,
        })
      }
    }
  })

  ctx.coverUrl = coverUrl ?? undefined
  ctx.pageUrls = pageUrls

  // Stage 5: Parent Coach
  onProgress?.(STAGES[4].name, STAGES[4].progress)
  ctx.parentGuide = await runParentCoachAgent(ctx)

  // Stage 6: QA (with one retry if score < 85)
  onProgress?.(STAGES[5].name, STAGES[5].progress)
  ctx.qaReport = await runQAAgent(ctx)

  if (!ctx.qaReport.passed && ctx.qaReport.overallScore < 85) {
    // One revision attempt
    ctx.rawStory = await runStoryGeneratorAgent(ctx)
    ctx.finalStory = ctx.rawStory
    ctx.qaReport = await runQAAgent(ctx)
  }

  // Calculate cost estimate
  const COST_PER_1K_INPUT = 0.003
  const COST_PER_1K_OUTPUT = 0.015
  ctx.costUsd = (ctx.tokensUsed / 1000) * COST_PER_1K_INPUT + (ctx.tokensUsed / 1000) * COST_PER_1K_OUTPUT * 0.3

  onProgress?.(STAGES[6].name, STAGES[6].progress)

  return {
    title: ctx.blueprint.title,
    subtitle: ctx.blueprint.subtitle,
    body: ctx.finalStory!,
    coverUrl,
    pageUrls,
    parentGuide: ctx.parentGuide!,
    qaScore: ctx.qaReport.overallScore,
    tokensUsed: ctx.tokensUsed,
    costUsd: ctx.costUsd,
    agentLog: ctx.agentLog,
  }
}
