import type { Child, DevelopmentCategory, Dialect, StoryStyle } from '@/types'

export interface PipelineInput {
  child: Child
  goals: DevelopmentCategory[]
  style: StoryStyle
  dialect: Dialect
  wordCountTarget: number
  advisorChallenge?: string
}

export interface ParentInsights {
  childPersonality: {
    traits: string[]
    communicationStyle: string
    emotionalProfile: string
  }
  coreChallenge: {
    description: string
    rootCauses: string[]
    emotionalNeeds: string[]
  }
  storyDirection: {
    primaryGoal: DevelopmentCategory
    secondaryGoal?: DevelopmentCategory
    recommendedTheme: string
    avoidThemes: string[]
  }
  personalizationBrief: {
    heroTraits: string[]
    heroStrengths: string[]
    heroGrowthArc: string
    settingIdeas: string[]
    companionIdea: string
  }
}

export interface StoryBlueprint {
  title: string
  subtitle: string
  heroDescription: string
  settingDescription: string
  companion: {
    name: string
    type: string
    role: string
  }
  acts: {
    actNumber: number
    actName: string
    summary: string
    keyMoment: string
    illustrationCue: string
  }[]
  embeddedLesson: string
  pageCount: number
}

export interface IllustrationPage {
  pageNum: number
  prompt: string
  arabicCaption: string
  emotionalTone: string
}

export interface ParentGuideContent {
  lessonSummary: string
  discussionQuestions: string[]
  familyActivities: {
    title: string
    description: string
    duration: string
  }[]
  reinforcementTips: string[]
  parentingAdvice: string
}

export interface QAReport {
  passed: boolean
  overallScore: number
  scores: {
    storyQuality: number
    languageQuality: number
    educationalValue: number
    emotionalSafety: number
    personalization: number
    culturalAccuracy: number
  }
  issues: string[]
  revisionNotes: string
}

export interface PipelineContext {
  input: PipelineInput
  insights?: ParentInsights
  blueprint?: StoryBlueprint
  rawStory?: string
  finalStory?: string
  illustrations?: IllustrationPage[]
  coverUrl?: string
  pageUrls?: { pageNum: number; url: string }[]
  parentGuide?: ParentGuideContent
  qaReport?: QAReport
  developmentScores?: Partial<Record<DevelopmentCategory, number>>
  tokensUsed: number
  costUsd: number
  startedAt: Date
  agentLog: {
    agentId: string
    stage: string
    durationMs: number
    tokensUsed: number
  }[]
}
