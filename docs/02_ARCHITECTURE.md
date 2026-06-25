# Hikayati — System Architecture

**Version:** 1.0 | **Date:** 2026-06-13

---

## 1. ARCHITECTURE OVERVIEW

Hikayati follows a **cloud-native, serverless-first architecture** designed for global scale, low-latency Arabic content delivery, and cost efficiency at high story generation volumes.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HIKAYATI PLATFORM                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐   │
│  │  Web Client  │    │ Mobile PWA   │    │    Admin Dashboard   │   │
│  │  Next.js 15  │    │  Next.js 15  │    │      Next.js 15      │   │
│  └──────┬───────┘    └──────┬───────┘    └──────────┬───────────┘   │
│         └──────────────────┴─────────────────────────┘               │
│                              │                                        │
│                    ┌─────────▼──────────┐                            │
│                    │   Vercel Edge CDN  │                            │
│                    │  (Global Routing)  │                            │
│                    └─────────┬──────────┘                            │
│                              │                                        │
│          ┌───────────────────┼───────────────────┐                  │
│          │                   │                   │                  │
│  ┌───────▼──────┐  ┌────────▼───────┐  ┌────────▼──────┐          │
│  │  Next.js API │  │  Story Queue   │  │  Webhook      │          │
│  │   Routes     │  │  (BullMQ)      │  │  Handler      │          │
│  │  /api/*      │  │  Redis         │  │  (Stripe etc) │          │
│  └───────┬──────┘  └────────┬───────┘  └───────────────┘          │
│          │                   │                                        │
│  ┌───────▼──────────────────▼──────────┐                           │
│  │         AI ORCHESTRATION LAYER       │                           │
│  │  ┌──────────────────────────────┐   │                           │
│  │  │     12-Agent Pipeline        │   │                           │
│  │  │  (Langchain / Custom)        │   │                           │
│  │  └──────────────────────────────┘   │                           │
│  └──────┬──────────────────────────────┘                           │
│         │                                                             │
│  ┌──────▼──────────────────────────────────────────────────┐       │
│  │                  EXTERNAL AI SERVICES                    │       │
│  │  Claude API │ OpenAI API │ Gemini │ ElevenLabs │ DALL-E  │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │                    DATA LAYER                             │       │
│  │  Supabase PostgreSQL │ Supabase Auth │ Supabase Storage   │       │
│  │  Redis (Upstash) │ Resend (Email) │ Cloudflare R2 (CDN)  │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. COMPONENT ARCHITECTURE

### 2.1 Frontend Layer

**Framework:** Next.js 15 (App Router)

```
Client Architecture:
├── App Shell (Next.js App Router)
│   ├── RTL Provider (dir="rtl")
│   ├── Theme Provider (TailwindCSS)
│   ├── Auth Provider (Supabase Auth)
│   ├── Query Provider (React Query v5)
│   └── Analytics Provider
│
├── Route Groups
│   ├── (marketing) — landing, pricing, blog, SEO pages
│   ├── (auth) — login, register, verify, reset
│   ├── (app) — protected app routes
│   │   ├── dashboard
│   │   ├── children/[id]
│   │   ├── stories/create
│   │   ├── stories/[id]
│   │   ├── reports
│   │   └── settings
│   └── (admin) — admin-only routes
│
└── Shared Components
    ├── RTL-aware UI Components
    ├── Story Viewer
    ├── PDF Reader
    ├── Audio Player
    └── Progress Trackers
```

**State Management:**
- Server state: React Query (TanStack Query v5)
- Client state: Zustand (story creation wizard state)
- Form state: React Hook Form + Zod
- Auth state: Supabase Auth (built-in)

### 2.2 API Layer

**Pattern:** Next.js API Routes + Server Actions

```
API Structure:
/api
├── auth/          — Supabase auth callbacks
├── stories/
│   ├── POST   /generate     — trigger story generation
│   ├── GET    /[id]         — fetch story
│   ├── GET    /             — list user stories
│   └── DELETE /[id]         — delete story
├── children/
│   ├── POST   /             — create child profile
│   ├── PUT    /[id]         — update profile
│   └── GET    /[id]/report  — development report
├── subscriptions/
│   ├── POST   /checkout     — create Stripe session
│   ├── POST   /portal       — customer portal
│   └── GET    /status       — subscription status
├── webhooks/
│   ├── POST   /stripe       — payment events
│   └── POST   /generation   — queue callbacks
├── admin/
│   ├── GET    /metrics      — KPI dashboard
│   ├── GET    /users        — user management
│   └── GET    /stories      — story management
└── internal/
    └── POST   /queue-worker  — story pipeline worker
```

### 2.3 Story Generation Queue

**Pattern:** Job Queue (BullMQ + Redis)

```
Story Generation Flow:

1. API receives request → validates → creates job
2. Job queued in Redis with:
   - jobId, userId, childProfile, goals, storyStyle
   - priority (Premium users get priority queue)
3. Worker picks up job:
   a. Parent Insight Agent
   b. Child Psychology Agent  
   c. Educational Specialist Agent
   d. Story Architect Agent
   e. Text Generation (Claude/GPT-4)
   f. Language Editor Agent
   g. Cultural Sensitivity Agent
   h. Character Consistency Agent
   i. Illustration Director → DALL-E/Flux calls
   j. Cover Design Agent
   k. Parent Coach Agent
   l. QA Agent (auto-retry if score < 90)
   m. Development Planner Agent
4. Assets assembled → uploaded to Supabase Storage
5. Story record created in PostgreSQL
6. PDF generated → stored in R2
7. Webhook notifies client (SSE / WebSocket)
8. User notified (in-app + email)
```

**Queue Configuration:**
```
Queues:
- story:premium    (concurrency: 10, priority: 1)
- story:standard   (concurrency: 20, priority: 2)  
- story:free       (concurrency: 5,  priority: 3)
- pdf:generation   (concurrency: 15)
- audio:generation (concurrency: 8)
- email:delivery   (concurrency: 50)
```

### 2.4 AI Orchestration Layer

**Framework:** Custom TypeScript agent orchestrator

```typescript
// Agent execution model
interface AgentResult {
  agentId: string;
  output: Record<string, unknown>;
  score: number;
  tokensUsed: number;
  durationMs: number;
}

// Pipeline: sequential with feedback loops
async function runStoryPipeline(request: StoryRequest): Promise<StoryPackage> {
  const context = new PipelineContext(request);
  
  // Phase 1: Analysis
  context.insights = await parentInsightAgent(context);
  context.psychology = await childPsychologyAgent(context);
  context.education = await educationalSpecialistAgent(context);
  
  // Phase 2: Creation
  context.blueprint = await storyArchitectAgent(context);
  context.rawStory = await generateStory(context);         // LLM call
  context.story = await languageEditorAgent(context);
  context.story = await culturalSensitivityAgent(context);
  
  // Phase 3: Assets (parallel)
  const [illustrations, cover, audio] = await Promise.all([
    illustrationDirectorAgent(context),
    coverDesignAgent(context),
    context.request.includeAudio ? audioGenerationAgent(context) : null,
  ]);
  
  // Phase 4: Parent Package
  context.parentGuide = await parentCoachAgent(context);
  
  // Phase 5: QA (with retry)
  const qa = await qualityAssuranceAgent(context);
  if (qa.overallScore < 90) {
    context.story = await reviseStory(context, qa.feedback);
  }
  
  // Phase 6: Development Update
  await developmentPlannerAgent(context);
  
  return assemblePackage(context);
}
```

---

## 3. DATABASE SCHEMA

### 3.1 Entity Relationship Overview

```
users (Supabase Auth)
  ↓ 1:many
user_profiles
  ↓ 1:many
children
  ↓ 1:many
stories ─────────────→ story_assets
  ↓                         ↓
story_metrics          (pdf, audio,
  ↓                     illustrations)
development_entries
  ↓
child_milestones
```

### 3.2 Core Tables

```sql
-- Users (extends Supabase Auth)
CREATE TABLE user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id),
  email         TEXT NOT NULL,
  full_name     TEXT,
  display_name  TEXT,
  phone         TEXT,
  country       TEXT,
  city          TEXT,
  dialect       TEXT DEFAULT 'msa', -- msa|gulf|levantine|egyptian|maghrebi
  avatar_url    TEXT,
  role          TEXT DEFAULT 'parent', -- parent|therapist|teacher|admin
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES user_profiles(id) NOT NULL,
  plan                  TEXT NOT NULL, -- free|premium|family|professional
  status                TEXT NOT NULL, -- active|canceled|past_due|trialing
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancel_at_period_end  BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Children Profiles
CREATE TABLE children (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES user_profiles(id) NOT NULL,
  name             TEXT NOT NULL,
  age              INTEGER NOT NULL CHECK (age BETWEEN 3 AND 14),
  gender           TEXT NOT NULL, -- male|female
  country          TEXT,
  city             TEXT,
  hobbies          TEXT[],
  favorite_color   TEXT,
  favorite_animal  TEXT,
  favorite_activities TEXT[],
  photo_url        TEXT,
  avatar_description TEXT, -- AI-generated description from photo
  notes            TEXT,
  is_active        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Stories
CREATE TABLE stories (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES user_profiles(id) NOT NULL,
  child_id          UUID REFERENCES children(id) NOT NULL,
  title             TEXT NOT NULL,
  subtitle          TEXT,
  body              TEXT NOT NULL,
  word_count        INTEGER,
  goals             TEXT[] NOT NULL,
  style             TEXT NOT NULL,
  dialect           TEXT NOT NULL,
  age_group         TEXT NOT NULL, -- 3-4|5-7|8-10|11-13
  cover_url         TEXT,
  pdf_url           TEXT,
  audio_url         TEXT,
  status            TEXT DEFAULT 'generating', -- generating|complete|failed
  generation_job_id TEXT,
  pipeline_metadata JSONB, -- agent scores, tokens, timing
  is_favorite       BOOLEAN DEFAULT FALSE,
  view_count        INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Story Assets (illustrations per page)
CREATE TABLE story_assets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id   UUID REFERENCES stories(id) NOT NULL,
  type       TEXT NOT NULL, -- cover|page|social|audio
  page_num   INTEGER,
  url        TEXT NOT NULL,
  prompt     TEXT,
  alt_text   TEXT,
  metadata   JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parent Guides
CREATE TABLE parent_guides (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id              UUID REFERENCES stories(id) UNIQUE NOT NULL,
  lesson_summary        TEXT,
  discussion_questions  TEXT[],
  family_activities     TEXT[],
  reinforcement_tips    TEXT[],
  parenting_advice      TEXT,
  development_notes     TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Development Tracking
CREATE TABLE development_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     UUID REFERENCES children(id) NOT NULL,
  story_id     UUID REFERENCES stories(id),
  category     TEXT NOT NULL, -- honesty|confidence|empathy|etc
  score        INTEGER CHECK (score BETWEEN 0 AND 100),
  notes        TEXT,
  source       TEXT DEFAULT 'story', -- story|parent|therapist
  recorded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Child Milestones
CREATE TABLE child_milestones (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     UUID REFERENCES children(id) NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  badge_type   TEXT,
  badge_url    TEXT,
  achieved_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Story Generation Jobs (queue tracking)
CREATE TABLE generation_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES user_profiles(id) NOT NULL,
  child_id        UUID REFERENCES children(id) NOT NULL,
  story_id        UUID REFERENCES stories(id),
  status          TEXT DEFAULT 'queued', -- queued|processing|complete|failed
  current_stage   TEXT,
  progress        INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  error_message   TEXT,
  agent_log       JSONB,
  tokens_used     INTEGER,
  cost_usd        NUMERIC(10,6),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Parenting Advisor Sessions
CREATE TABLE advisor_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES user_profiles(id) NOT NULL,
  child_id        UUID REFERENCES children(id),
  challenge_text  TEXT NOT NULL,
  analysis        JSONB, -- root cause, emotional needs, recommendations
  story_id        UUID REFERENCES stories(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Story Recommendations
CREATE TABLE story_recommendations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     UUID REFERENCES children(id) NOT NULL,
  goals        TEXT[],
  style        TEXT,
  reason       TEXT,
  priority     INTEGER,
  is_seen      BOOLEAN DEFAULT FALSE,
  is_used      BOOLEAN DEFAULT FALSE,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Row Level Security Policies

```sql
-- Users can only access their own data
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_profile" ON user_profiles
  USING (id = auth.uid());

ALTER TABLE children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_children" ON children
  USING (user_id = auth.uid());

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_stories" ON stories
  USING (user_id = auth.uid());

-- Admin bypass policy
CREATE POLICY "admin_all_access" ON user_profiles
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));
```

---

## 4. FOLDER STRUCTURE

```
hikayati/
├── apps/
│   ├── web/                          # Next.js 15 frontend
│   │   ├── app/
│   │   │   ├── (marketing)/
│   │   │   │   ├── page.tsx          # Landing page
│   │   │   │   ├── pricing/
│   │   │   │   ├── blog/
│   │   │   │   └── about/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── verify/
│   │   │   ├── (app)/
│   │   │   │   ├── layout.tsx        # Protected layout
│   │   │   │   ├── dashboard/
│   │   │   │   ├── children/
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   ├── page.tsx  # Child profile
│   │   │   │   │   │   ├── stories/
│   │   │   │   │   │   └── report/
│   │   │   │   │   └── new/
│   │   │   │   ├── stories/
│   │   │   │   │   ├── create/
│   │   │   │   │   │   ├── page.tsx  # Multi-step wizard
│   │   │   │   │   │   └── _steps/
│   │   │   │   │   │       ├── AdvisorStep.tsx
│   │   │   │   │   │       ├── GoalStep.tsx
│   │   │   │   │   │       ├── ChildStep.tsx
│   │   │   │   │   │       ├── StyleStep.tsx
│   │   │   │   │   │       └── GeneratingStep.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx  # Story viewer
│   │   │   │   │       ├── pdf/
│   │   │   │   │       └── audio/
│   │   │   │   ├── reports/
│   │   │   │   ├── settings/
│   │   │   │   └── upgrade/
│   │   │   ├── (admin)/
│   │   │   │   ├── admin/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── users/
│   │   │   │   │   ├── stories/
│   │   │   │   │   ├── revenue/
│   │   │   │   │   └── analytics/
│   │   │   └── api/
│   │   │       ├── auth/
│   │   │       ├── stories/
│   │   │       ├── children/
│   │   │       ├── subscriptions/
│   │   │       ├── webhooks/
│   │   │       └── internal/
│   │   ├── components/
│   │   │   ├── ui/                   # Shadcn components
│   │   │   ├── story/
│   │   │   │   ├── StoryViewer.tsx
│   │   │   │   ├── StoryCard.tsx
│   │   │   │   ├── StoryPDF.tsx
│   │   │   │   └── AudioPlayer.tsx
│   │   │   ├── child/
│   │   │   │   ├── ChildProfile.tsx
│   │   │   │   ├── DevelopmentChart.tsx
│   │   │   │   └── GrowthReport.tsx
│   │   │   ├── dashboard/
│   │   │   ├── forms/
│   │   │   ├── marketing/
│   │   │   └── shared/
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts
│   │   │   │   ├── server.ts
│   │   │   │   └── middleware.ts
│   │   │   ├── stripe/
│   │   │   ├── ai/
│   │   │   └── utils/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── types/
│   │   └── styles/
│   │
│   └── admin/                        # Separate admin app (optional)
│
├── packages/
│   ├── ai-agents/                    # AI agent library
│   │   ├── src/
│   │   │   ├── agents/
│   │   │   │   ├── ParentInsightAgent.ts
│   │   │   │   ├── ChildPsychologyAgent.ts
│   │   │   │   ├── EducationalSpecialistAgent.ts
│   │   │   │   ├── StoryArchitectAgent.ts
│   │   │   │   ├── LanguageEditorAgent.ts
│   │   │   │   ├── CulturalSensitivityAgent.ts
│   │   │   │   ├── CharacterConsistencyAgent.ts
│   │   │   │   ├── IllustrationDirectorAgent.ts
│   │   │   │   ├── CoverDesignAgent.ts
│   │   │   │   ├── ParentCoachAgent.ts
│   │   │   │   ├── QualityAssuranceAgent.ts
│   │   │   │   └── DevelopmentPlannerAgent.ts
│   │   │   ├── pipeline/
│   │   │   │   ├── StoryPipeline.ts
│   │   │   │   ├── PipelineContext.ts
│   │   │   │   └── PipelineOrchestrator.ts
│   │   │   ├── prompts/
│   │   │   │   ├── system-prompts/
│   │   │   │   ├── templates/
│   │   │   │   └── few-shots/
│   │   │   └── models/
│   │   │       ├── claude.ts
│   │   │       ├── openai.ts
│   │   │       └── gemini.ts
│   │   └── package.json
│   │
│   ├── database/                     # DB types and migrations
│   │   ├── migrations/
│   │   ├── seeds/
│   │   ├── types/                    # Generated Supabase types
│   │   └── queries/
│   │
│   ├── pdf-generator/               # Story PDF generation
│   │   ├── src/
│   │   │   ├── StoryPDFTemplate.tsx
│   │   │   └── PDFGenerator.ts
│   │   └── package.json
│   │
│   └── shared/                      # Shared types and utilities
│       ├── types/
│       ├── constants/
│       └── utils/
│
├── workers/
│   ├── story-queue/                 # BullMQ worker
│   │   ├── src/
│   │   │   ├── worker.ts
│   │   │   ├── processor.ts
│   │   │   └── handlers/
│   │   └── package.json
│   └── analytics/                   # Analytics aggregation worker
│
├── infrastructure/
│   ├── supabase/
│   │   ├── migrations/
│   │   ├── functions/               # Edge functions
│   │   └── config.toml
│   ├── docker/
│   │   ├── docker-compose.dev.yml
│   │   └── docker-compose.prod.yml
│   └── scripts/
│
├── docs/
│   ├── 01_PRD.md
│   ├── 02_ARCHITECTURE.md
│   ├── 03_DATABASE_SCHEMA.md
│   ├── 04_API_REFERENCE.md
│   ├── 05_UI_UX_WIREFRAMES.md
│   ├── 06_AI_AGENT_ARCHITECTURE.md
│   ├── 07_DEVELOPMENT_ROADMAP.md
│   ├── 08_MVP_PLAN.md
│   ├── 09_GTM_STRATEGY.md
│   ├── 10_FINANCIAL_MODEL.md
│   ├── 11_SUBSCRIPTION_STRATEGY.md
│   ├── 12_INVESTOR_PITCH.md
│   ├── 13_SCALING_PLAN.md
│   └── 14_DEPLOYMENT_PLAN.md
│
├── .env.example
├── package.json                     # Turborepo root
├── turbo.json
└── README.md
```

---

## 5. API ARCHITECTURE

### 5.1 API Design Principles
- REST for CRUD operations, Server Actions for form mutations
- All endpoints require authentication except public marketing pages
- Rate limiting: 100 req/min (free), 1000 req/min (paid)
- Versioning: `/api/v1/` prefix for external-facing endpoints
- Response format: consistent `{ data, error, meta }` envelope
- All responses in Arabic where applicable (i18n keys)

### 5.2 Core API Endpoints

```
POST /api/stories/generate
Body: {
  childId: string,
  goals: string[],
  style: string,
  includeAudio: boolean,
  advisorSessionId?: string
}
Response: {
  data: { jobId: string, estimatedSeconds: number },
  error: null
}

GET /api/stories/[id]
Response: {
  data: {
    story: Story,
    assets: StoryAsset[],
    parentGuide: ParentGuide,
    pdfUrl: string,
    audioUrl?: string
  }
}

GET /api/stories/generate/status/[jobId]   (SSE)
Event stream: {
  stage: string,
  progress: number,
  message: string,
  storyId?: string
}

POST /api/advisor/analyze
Body: { childId: string, challengeText: string }
Response: {
  data: {
    rootCauses: string[],
    emotionalNeeds: string[],
    recommendedGoals: string[],
    recommendedStyle: string,
    recommendedLength: string,
    briefSummary: string
  }
}

GET /api/children/[id]/report
Query: { period: 'monthly'|'quarterly'|'all' }
Response: {
  data: {
    developmentScores: Record<string, number>,
    storiesRead: number,
    topGoals: string[],
    milestones: Milestone[],
    recommendations: Recommendation[],
    pdfUrl: string
  }
}

POST /api/subscriptions/checkout
Body: { plan: string, interval: 'monthly'|'annual' }
Response: { data: { checkoutUrl: string } }
```

### 5.3 Real-Time Architecture

Story generation uses **Server-Sent Events (SSE)** to push progress updates:

```
Client opens SSE connection → /api/stories/generate/status/[jobId]
Worker publishes events to Redis pub/sub channel
SSE handler subscribes and forwards to client

Event types:
- stage_started: { stage, stageIndex, totalStages }
- stage_completed: { stage, score, duration }
- asset_ready: { type, url }
- complete: { storyId }
- error: { code, message }
```

### 5.4 Webhook Architecture

```
Stripe webhooks → /api/webhooks/stripe
Events handled:
- customer.subscription.created → activate subscription
- customer.subscription.updated → update plan
- customer.subscription.deleted → downgrade to free
- invoice.payment_failed → send payment failed email
- invoice.payment_succeeded → send receipt

Generation callbacks → /api/webhooks/generation
Events:
- job.completed → update story status, trigger notification
- job.failed → log error, notify user, refund story credit if applicable
```

---

## 6. INFRASTRUCTURE & DEPLOYMENT

### 6.1 Production Infrastructure

```
Deployment Platform: Vercel (Next.js + Edge Functions)
Database: Supabase Cloud (PostgreSQL 15)
Cache/Queue: Upstash Redis
Storage: Supabase Storage + Cloudflare R2 (CDN)
Email: Resend
Monitoring: Sentry + Vercel Analytics
Error Tracking: Sentry
Background Jobs: Vercel Cron + Upstash QStash
Domain: CloudFlare DNS + SSL
```

### 6.2 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Services
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_AI_API_KEY=
ELEVENLABS_API_KEY=

# Image Generation
OPENAI_IMAGES_API_KEY=
FLUX_API_KEY=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
MOLLIE_API_KEY=

# Infrastructure
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
CLOUDFLARE_R2_ENDPOINT=
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_R2_BUCKET=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://hikayati.ai
NEXT_PUBLIC_APP_NAME=حكايتي
```

### 6.3 Monitoring & Observability

```
Error Tracking: Sentry (frontend + backend)
Performance: Vercel Analytics + Web Vitals
Uptime: Betterstack
AI Cost Tracking: Custom dashboard (tokens/cost per story)
Business Metrics: PostHog (product analytics)
Revenue: Stripe Dashboard + custom MRR tracker
```

---

*Next: See 06_AI_AGENT_ARCHITECTURE.md for detailed agent specifications.*
