export type Dialect = 'msa' | 'gulf' | 'levantine' | 'egyptian' | 'maghrebi'
export type StoryStatus = 'generating' | 'complete' | 'failed'
export type SubscriptionPlan = 'free' | 'premium' | 'family' | 'professional'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'
export type StoryStyle =
  | 'adventure'
  | 'fantasy'
  | 'islamic'
  | 'animals'
  | 'space'
  | 'superhero'
  | 'mystery'
  | 'historical'
  | 'science'
  | 'everyday'
export type DevelopmentCategory =
  | 'honesty'
  | 'responsibility'
  | 'courage'
  | 'self_confidence'
  | 'emotional_intelligence'
  | 'respect'
  | 'kindness'
  | 'discipline'
  | 'gratitude'
  | 'leadership'
  | 'creativity'
  | 'anti_bullying'
  | 'islamic_values'
  | 'problem_solving'
  | 'friendship'
  | 'resilience'
  | 'time_management'
  | 'communication'
  | 'social_skills'
export type AgeGroup = '3-4' | '5-7' | '8-10' | '11-13'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  display_name: string | null
  phone: string | null
  country: string | null
  city: string | null
  dialect: Dialect
  avatar_url: string | null
  role: 'parent' | 'therapist' | 'teacher' | 'admin'
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface Child {
  id: string
  user_id: string
  name: string
  age: number
  gender: 'male' | 'female'
  country: string | null
  city: string | null
  hobbies: string[]
  favorite_color: string | null
  favorite_animal: string | null
  favorite_activities: string[]
  photo_url: string | null
  avatar_description: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Story {
  id: string
  user_id: string
  child_id: string
  title: string
  subtitle: string | null
  body: string
  word_count: number | null
  goals: DevelopmentCategory[]
  style: StoryStyle
  dialect: Dialect
  age_group: AgeGroup
  cover_url: string | null
  pdf_url: string | null
  audio_url: string | null
  status: StoryStatus
  generation_job_id: string | null
  pipeline_metadata: PipelineMetadata | null
  is_favorite: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export interface StoryAsset {
  id: string
  story_id: string
  type: 'cover' | 'page' | 'social' | 'audio'
  page_num: number | null
  url: string
  prompt: string | null
  alt_text: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface ParentGuide {
  id: string
  story_id: string
  lesson_summary: string | null
  discussion_questions: string[]
  family_activities: string[]
  reinforcement_tips: string[]
  parenting_advice: string | null
  development_notes: string | null
  created_at: string
}

export interface GenerationJob {
  id: string
  user_id: string
  child_id: string
  story_id: string | null
  status: 'queued' | 'processing' | 'complete' | 'failed'
  current_stage: string | null
  progress: number
  error_message: string | null
  agent_log: AgentLogEntry[] | null
  tokens_used: number | null
  cost_usd: number | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export interface DevelopmentEntry {
  id: string
  child_id: string
  story_id: string | null
  category: DevelopmentCategory
  score: number
  notes: string | null
  source: 'story' | 'parent' | 'therapist'
  recorded_at: string
}

export interface ChildMilestone {
  id: string
  child_id: string
  title: string
  description: string | null
  badge_type: string | null
  badge_url: string | null
  achieved_at: string
}

export interface PipelineMetadata {
  agentScores: Record<string, number>
  tokensUsed: number
  costUsd: number
  durationMs: number
  qualityScore: number
  revisionsCount: number
}

export interface AgentLogEntry {
  agentId: string
  stage: string
  score: number
  tokensUsed: number
  durationMs: number
  timestamp: string
}

export interface StoryRequest {
  childId: string
  goals: DevelopmentCategory[]
  style: StoryStyle
  dialect: Dialect
  includeAudio: boolean
  advisorSessionId?: string
  wordCountTarget?: number
}
