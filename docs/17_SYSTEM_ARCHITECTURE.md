# Complete System Architecture — Hikayati Platform
**Version:** 1.0  
**Date:** 2026-06-26  
**Status:** Design Approved — Pending Implementation

---

## 1. Architecture Overview

Hikayati uses a **serverless-first, event-driven architecture** optimized for AI workloads with variable latency (15–300 seconds per generation job). The design separates the synchronous request path (fast user-facing API calls) from the asynchronous generation path (slow AI pipeline) via a durable job queue.

### 1.1 Architecture Principles

1. **Separation of concerns** — Request handling, job orchestration, and AI execution are independent layers
2. **Fail gracefully** — No single AI provider failure should crash a user's story
3. **Security by default** — Every layer authenticated; child data never leaves the security boundary without disclosure
4. **Observable** — Every generation job, API call, and AI token tracked and queryable
5. **Cost-aware** — AI costs tracked in real-time; circuit breakers prevent runaway billing

---

## 2. Production Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET / USERS                               │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ HTTPS
                     ┌─────────────▼─────────────┐
                     │        Vercel Edge CDN      │
                     │   (Global PoP Network)      │
                     │  - Static assets cached     │
                     │  - TLS termination          │
                     │  - DDoS mitigation          │
                     └─────────────┬───────────────┘
                                   │
                     ┌─────────────▼───────────────┐
                     │     Next.js App (Vercel)     │
                     │                             │
                     │  ┌──────────────────────┐   │
                     │  │  Middleware Layer      │   │
                     │  │  - Session refresh    │   │
                     │  │  - Rate limiting      │   │
                     │  │  - Auth check         │   │
                     │  └──────────────────────┘   │
                     │                             │
                     │  ┌──────────┐ ┌──────────┐  │
                     │  │  Pages   │ │   API    │  │
                     │  │  (RSC)   │ │ Routes   │  │
                     │  └──────────┘ └─────┬────┘  │
                     └───────────────────────┬──────┘
                                             │
           ┌─────────────────────────────────┼──────────────────────────────┐
           │                                 │                              │
┌──────────▼──────────┐         ┌────────────▼──────────┐     ┌────────────▼────────┐
│   Supabase Platform  │         │     Inngest (Queue)    │     │   Stripe Platform   │
│                      │         │                       │     │                     │
│  ┌─────────────────┐ │         │  - Durable job queue  │     │  - Checkout         │
│  │  PostgreSQL 15  │ │         │  - Retry with backoff │     │  - Subscriptions    │
│  │  (RLS enabled)  │ │         │  - Step functions     │     │  - Webhooks         │
│  └─────────────────┘ │         │  - Observability      │     │  - Customer portal  │
│                      │         └────────────┬──────────┘     └─────────────────────┘
│  ┌─────────────────┐ │                      │
│  │  Supabase Auth  │ │         ┌────────────▼──────────┐
│  │  (JWT + OAuth)  │ │         │   AI Pipeline Workers  │
│  └─────────────────┘ │         │   (Inngest Functions)  │
│                      │         │                       │
│  ┌─────────────────┐ │         │  Agent 1: Insight     │──► Groq API
│  │  Supabase       │ │         │  Agent 2: Architect   │──► Groq API
│  │  Storage        │ │         │  Agent 3: Generator   │──► Groq API
│  │  (PDFs, Audio)  │ │         │  Agent 4: Illustrator │──► Groq + DALL-E
│  └─────────────────┘ │         │  Agent 5: Coach       │──► Groq API
└──────────────────────┘         │  Agent 6: QA          │──► Groq API
                                 └───────────────────────┘
                                             │
                         ┌───────────────────┼───────────────────┐
                         │                   │                   │
              ┌──────────▼──────┐  ┌─────────▼───────┐  ┌───────▼────────┐
              │   Groq API       │  │  OpenAI API     │  │  Resend (Email)│
              │  (LLM text gen) │  │  (DALL-E images)│  │                │
              └─────────────────┘  └─────────────────┘  └────────────────┘


Observability Layer (Cross-Cutting):
┌─────────────────────────────────────────────────────────┐
│  Sentry (errors) + Vercel Analytics + Inngest Dashboard │
└─────────────────────────────────────────────────────────┘

Rate Limiting Layer:
┌──────────────────────────────┐
│  Upstash Redis (rate limits)  │
└──────────────────────────────┘
```

---

## 3. Frontend Architecture

### 3.1 Structure

```
Next.js 15 App Router
│
├── Public Routes (no auth)
│   ├── / — Landing page (Static, ISR 24h)
│   ├── /login — Client Component
│   ├── /register — Client Component
│   └── /auth/callback — Route Handler (OAuth)
│
├── Protected Routes (auth required — layout check)
│   ├── /dashboard — Server Component + client hydration
│   ├── /stories — Server Component (list)
│   ├── /stories/[id] — Server Component (detail)
│   ├── /stories/create — Client Component (wizard)
│   ├── /children/new — Client Component
│   ├── /children/[id] — Server Component
│   ├── /settings — Server Component
│   └── /upgrade — Server Component
│
└── Admin Routes (admin role only)
    └── /admin/* — Server Components with role check
```

### 3.2 Auth Guard Strategy

The production architecture uses **layout-level server-side auth checking** — not `useEffect` checks:

```
src/app/(app)/layout.tsx  [Server Component]
│
├── await createClient() → supabase.auth.getUser()
├── If no user → redirect('/login')
└── Render <children> (protected pages)
```

This eliminates the flash of unauthenticated content and reduces round-trips.

### 3.3 Data Fetching Strategy

| Page | Pattern | Rationale |
|------|---------|-----------|
| Dashboard | Server Component + `Promise.all` | Fast initial load, no client JS needed |
| Story detail | Server Component | SEO, fast render |
| Stories list | Server Component + cursor pagination | Large datasets |
| Story creation wizard | Client Component (Zustand) | Multi-step stateful form |
| Settings | Server Component | Auth-sensitive, no interactivity |
| Admin panel | Server Component | No client-side data |

### 3.4 Component Architecture

```
src/components/
├── layout/
│   ├── Header.tsx               — Navigation with user avatar
│   ├── Footer.tsx               — Links, copyright
│   └── Sidebar.tsx              — Mobile slide-out nav
├── story/
│   ├── StoryCard.tsx            — Grid thumbnail
│   ├── StoryReader.tsx          — Full story display
│   ├── ParentGuideSection.tsx   — Collapsible guide
│   └── StoryShareModal.tsx      — Share dialog (public link)
├── child/
│   ├── ChildProfileCard.tsx     — Dashboard grid card
│   ├── ChildForm.tsx            — Create/edit unified form
│   └── DeleteChildButton.tsx    — Confirm + delete
├── wizard/
│   ├── WizardShell.tsx          — Progress bar + step routing
│   ├── AdvisorStep.tsx
│   ├── GoalStep.tsx
│   ├── ChildStep.tsx
│   ├── StyleStep.tsx
│   └── GeneratingStep.tsx
├── admin/
│   ├── StatsCards.tsx           — Users, stories, MRR
│   ├── UsersTable.tsx           — Paginated user list
│   ├── JobsTable.tsx            — Generation job log
│   └── RevenueChart.tsx         — MRR time series
├── ui/                          — shadcn base components
│   ├── button.tsx, input.tsx, label.tsx, toaster.tsx
│   ├── dialog.tsx, select.tsx, tabs.tsx, progress.tsx
│   ├── skeleton.tsx             — Loading skeletons
│   └── error-boundary.tsx       — React error boundary
└── providers.tsx                — React Query + Toaster
```

---

## 4. Backend Architecture

### 4.1 API Route Design

All API responses follow a consistent envelope:

```typescript
// Success
{ "data": T, "error": null }

// Error
{ "data": null, "error": { "code": string, "message": string } }
```

### 4.2 API Route Inventory (Target State)

```
/api/
├── auth/
│   ├── POST   login           — Email/password sign-in
│   ├── POST   register        — New account creation
│   ├── POST   logout          — Sign out
│   ├── GET    google          — OAuth redirect
│   └── GET    callback        — OAuth callback (Supabase)
│
├── children/
│   ├── GET    /               — List user's children
│   ├── POST   /               — Create child
│   ├── GET    /[id]           — Get child
│   ├── PATCH  /[id]           — Update child ← NEW
│   └── DELETE /[id]           — Soft-delete child
│
├── stories/
│   ├── GET    /               — List stories (cursor paginated) ← NEW
│   ├── DELETE /[id]           — Delete story ← NEW
│   └── generate/
│       ├── POST   /           — Trigger generation
│       ├── GET    /status/[jobId]  — SSE progress stream
│       └── GET    /poll/[jobId]    — HTTP fallback
│
├── advisor/
│   └── POST   analyze         — Challenge → goal recommendations
│
├── subscriptions/
│   ├── POST   checkout        — Create Stripe checkout
│   └── GET    portal          — Stripe customer portal ← NEW
│
├── settings/
│   └── PATCH  /               — Update user profile ← NEW
│
├── admin/                     — Admin-only routes ← NEW
│   ├── GET    stats           — Platform overview
│   ├── GET    users           — User list (paginated)
│   ├── GET    jobs            — Generation job log
│   ├── PATCH  users/[id]      — Override subscription
│   └── GET    revenue         — Revenue metrics
│
├── internal/
│   └── POST   generate        — AI pipeline execution
│
└── webhooks/
    └── POST   stripe          — Stripe event handler
```

### 4.3 Middleware Stack

```typescript
// src/middleware.ts — execution order
1. Supabase session refresh (all routes)
2. Rate limiting check (auth + generate routes) — via Upstash
3. Admin role check (/admin/* routes)
4. Request logging (production)
```

---

## 5. Database Architecture

### 5.1 Schema Diagram

```
user_profiles (1)
    │
    ├──── subscriptions (1:1)
    │         └── stripe_customer_id, plan, status, period
    │
    ├──── children (1:N)
    │         ├── hobbies[], favorite_color, favorite_animal
    │         └── is_active (soft delete)
    │
    ├──── stories (1:N)
    │         ├── status: generating | complete | failed
    │         ├── story_assets (1:N) ← illustrations + cover
    │         ├── parent_guides (1:1)
    │         └── generation_jobs (1:1)
    │
    ├──── development_entries (1:N per child)
    │         └── category, score, evidence, recorded_at
    │
    ├──── child_milestones (1:N per child)
    │         └── milestone_type, earned_at
    │
    ├──── advisor_sessions (1:N)
    │         └── challenge_text, analysis_json
    │
    └──── story_recommendations (1:N per child)
              └── recommended_style, reason, is_used
```

### 5.2 Connection Architecture

```
Application Layer (Next.js Serverless)
    │
    ├── createClient()        — Supabase anon key (user RLS-gated)
    │    └── Supabase JS SDK → Supabase REST API → PostgreSQL
    │
    └── createAdminClient()   — Supabase service role (bypasses RLS)
         └── Used only in: internal/generate, admin/* routes
```

**Connection Pool Strategy:**
- Supabase manages connection pooling via PgBouncer (Pro plan)
- Each serverless function creates a new client per invocation
- Supabase Pro: 500 max connections via PgBouncer

### 5.3 Row-Level Security Policy Design

```sql
-- Pattern for all user-owned tables:
CREATE POLICY "Users can only access own data"
  ON table_name
  FOR ALL
  USING (user_id = auth.uid());

-- Admin bypass (via service role — policies don't apply):
-- createAdminClient() uses SUPABASE_SERVICE_ROLE_KEY
```

### 5.4 Database Indexes (Production)

```sql
-- User lookups
CREATE INDEX idx_user_profiles_id ON user_profiles(id);

-- Subscription status checks (subscription gate on every API call)
CREATE INDEX idx_subscriptions_user_status ON subscriptions(user_id, status);

-- Child active filter
CREATE INDEX idx_children_user_active ON children(user_id) WHERE is_active = TRUE;

-- Story list (dashboard + history)
CREATE INDEX idx_stories_user_created ON stories(user_id, created_at DESC);
CREATE INDEX idx_stories_child_created ON stories(child_id, created_at DESC);
CREATE INDEX idx_stories_status ON stories(status) WHERE status = 'generating';

-- Job polling (SSE endpoint polls every 2s)
CREATE INDEX idx_jobs_id_status ON generation_jobs(id, status, progress);

-- Monthly story count (free tier limit check)
CREATE INDEX idx_stories_user_month ON stories(user_id, created_at)
  WHERE status != 'failed';
```

---

## 6. Authentication Architecture

### 6.1 Flow Diagrams

**Email/Password Login:**
```
Browser                    Supabase Auth              Next.js Server
   │                            │                          │
   ├─ POST /auth/v1/token ──────►│                          │
   │◄─── { access_token,        │                          │
   │       refresh_token } ──────┤                          │
   │                            │                          │
   ├─ window.location('/dashboard') ──────────────────────►│
   │  (with sb-[ref]-auth-token cookie)                    │
   │◄────────────── Middleware refreshes session ──────────┤
   │◄────────────── 200 /dashboard (Server Component) ─────┤
```

**Google OAuth:**
```
Browser           Next.js          Supabase          Google
   │                 │                │                 │
   ├──GET /api/auth/google──►│        │                 │
   │                 ├─signInWithOAuth►│                 │
   │                 │◄── OAuth URL ──┤                 │
   │◄── 302 Google OAuth URL ┤        │                 │
   ├───────────────────────────────────────────────────►│
   │◄─────────────── code=xxx ──────────────────────────┤
   ├──GET /auth/callback?code=xxx ──────────────────────►│
   │                 │                ├─exchangeCodeForSession
   │                 │◄───────── session cookies ────────┤
   │◄── 302 /dashboard ──────┤        │                 │
```

### 6.2 Session Management

| Token | Storage | TTL | Purpose |
|-------|---------|-----|---------|
| Access token (JWT) | Cookie (HttpOnly) | 1 hour | API authentication |
| Refresh token | Cookie (HttpOnly) | 60 days | Token renewal |
| Session cookie | Supabase SSR managed | Per refresh | Server-side auth |

Middleware calls `supabase.auth.getUser()` on every request, which silently refreshes the access token when needed.

### 6.3 Admin Authentication

Admin access requires:
1. Valid Supabase session (standard JWT)
2. `user_profiles.role = 'admin'` in the database
3. Middleware check on `/admin/*` routes
4. RLS does NOT restrict admin access (service role used)

---

## 7. Payment Architecture

### 7.1 Subscription Lifecycle

```
User clicks "Upgrade"
    │
    ├── POST /api/subscriptions/checkout { plan: 'premium_monthly' }
    │     ├── Lookup/create Stripe Customer
    │     ├── Create Stripe Checkout Session
    │     └── Return { checkoutUrl }
    │
    ├── Browser redirects to Stripe Checkout
    │
    ├── User completes payment on Stripe
    │
    ├── Stripe → POST /api/webhooks/stripe
    │     └── Event: customer.subscription.created
    │           ├── Verify Stripe signature
    │           ├── Find user by stripe_customer_id
    │           └── UPDATE subscriptions SET plan='premium', status='active'
    │
    └── User redirected to /dashboard?upgraded=true
          └── Shows "Welcome to Premium!" banner
```

### 7.2 Stripe Event Handling

| Event | Action |
|-------|--------|
| `customer.subscription.created` | Set plan + status, store Stripe IDs |
| `customer.subscription.updated` | Sync plan changes (upgrade/downgrade) |
| `customer.subscription.deleted` | Set plan='free', status='canceled' |
| `invoice.payment_succeeded` | Send payment confirmation email |
| `invoice.payment_failed` | Set status='past_due', send email |

### 7.3 Stripe Customer Portal

Users can self-manage subscriptions (cancel, update card) via Stripe's hosted portal:
```
GET /api/subscriptions/portal
  → stripe.billingPortal.sessions.create({ return_url: /settings })
  → Redirect to Stripe portal
```

---

## 8. AI Gateway Architecture

### 8.1 Provider Strategy

| Use Case | Provider | Model | Fallback |
|----------|----------|-------|---------|
| Story text generation | Groq | llama-3.3-70b-versatile | OpenAI GPT-4o |
| Illustration prompts | Groq | llama-3.3-70b-versatile | OpenAI GPT-4o |
| Image generation | OpenAI | DALL-E 3 | Placeholder image |
| Audio narration | ElevenLabs | Arabic voice | None (skip) |
| Parent analysis | Groq | llama-3.3-70b-versatile | OpenAI GPT-4o |

### 8.2 AI Gateway Design

```
Story Request
    │
    └── AI Gateway (src/lib/ai/gateway.ts)
          │
          ├── Rate limiter (Upstash — per-user token budget)
          ├── Circuit breaker (stop if provider down)
          ├── Request logger (tokens, cost, latency)
          │
          ├── Provider: Groq (primary)
          │     └── groqWithRetry() — 4 retries, exponential backoff
          │
          ├── Provider: OpenAI (fallback + images)
          │     └── openaiWithRetry() — same pattern
          │
          └── Cost tracker (accumulate per job, save to DB)
```

### 8.3 Token Budget Management

| Plan | Monthly Token Budget | Daily Limit |
|------|---------------------|-------------|
| Free | 200,000 tokens | 6,700 tokens (~1 story) |
| Premium | 5,000,000 tokens | 167,000 tokens (~10 stories/day) |
| Family | 10,000,000 tokens | 333,000 tokens |
| Pro | Unlimited | Unlimited |

---

## 9. Queue System Architecture

### 9.1 Current State (Broken)

```
/api/stories/generate
    └── background fetch → /api/internal/generate
          PROBLEM: Unreliable, times out, no retry
```

### 9.2 Target State (Inngest)

```
/api/stories/generate
    │
    ├── Create story + job record in DB
    ├── inngest.send({ name: 'story/generate', data: { jobId } })
    └── Return { jobId } immediately (202)

Inngest Platform
    └── Triggers: storyGenerationFunction
          ├── Step 1: runParentInsightAgent()     [retries: 3]
          ├── Step 2: runStoryArchitectAgent()    [retries: 3]
          ├── Step 3: runStoryGeneratorAgent()    [retries: 3]
          ├── Step 4: runIllustrationAgent()      [retries: 3]
          ├── Step 5: generateImages() parallel   [retries: 2, no-throw]
          ├── Step 6: runParentCoachAgent()       [retries: 3]
          ├── Step 7: runQAAgent()                [retries: 2]
          └── Step 8: saveToDatabase()            [retries: 5]
```

**Why Inngest:**
- Each step is independently durable (individual retries, not whole pipeline)
- No timeout limits (Inngest runs functions as long as needed)
- Built-in observability dashboard
- Dead letter queue for permanently failed jobs
- No infrastructure to manage (serverless)

### 9.3 Job Status Flow

```
PENDING → PROCESSING → COMPLETE
                    ↘
                     FAILED (with error_message)
```

SSE endpoint polls `generation_jobs` table every 2 seconds and streams updates to the browser.

---

## 10. Storage Architecture

### 10.1 Asset Storage Strategy

| Asset Type | Storage | Path | Access |
|-----------|---------|------|--------|
| Story illustrations (DALL-E) | Supabase Storage | stories/{story_id}/page-{n}.png | Public read |
| Story cover images | Supabase Storage | stories/{story_id}/cover.png | Public read |
| Story PDFs | Supabase Storage | pdfs/{story_id}/story.pdf | Auth-gated |
| Audio narrations | Supabase Storage | audio/{story_id}/story.mp3 | Auth-gated |
| Child photos | Supabase Storage | avatars/{user_id}/{child_id}.jpg | Auth-gated |

**Current state:** DALL-E images are stored as external URLs (expire in 1 hour). They must be downloaded and re-uploaded to Supabase Storage immediately after generation.

### 10.2 PDF Generation

```
Story complete
    │
    ├── Generate PDF via @react-pdf/renderer
    │     ├── Cover page (title + cover image)
    │     ├── Story pages (Arabic text + illustrations)
    │     └── Parent guide (lesson, questions, activities)
    │
    ├── Upload to Supabase Storage: pdfs/{story_id}/story.pdf
    └── Update stories.pdf_url
```

---

## 11. Caching Architecture

### 11.1 Cache Layers

| Layer | Technology | TTL | What's Cached |
|-------|-----------|-----|--------------|
| Edge (CDN) | Vercel Edge | 24h | Static pages, assets |
| Browser | React Query | 60s | User's stories, children |
| Session | Supabase JWT | 1h | Auth tokens |
| Rate limit counters | Upstash Redis | 60s | Request counts per IP |

### 11.2 Cache Invalidation

- Story list: invalidated when a new story is completed (via React Query `invalidateQueries`)
- Child list: invalidated after add/edit/delete
- Dashboard data: background refetch every 60 seconds

---

## 12. Logging & Monitoring

### 12.1 Logging Strategy

```
Event Source → Structured Log (JSON) → Sink

API Request     → { method, path, status, userId, duration }  → Vercel Logs
AI Agent Call   → { agentId, model, tokens, cost, duration }  → DB + Sentry
Generation Job  → { jobId, stage, status, error }             → DB + Inngest
Stripe Event    → { eventId, type, customerId, amount }       → Vercel Logs
Auth Event      → { userId, action, ip, userAgent }           → Supabase Logs
Error           → { message, stack, userId, context }         → Sentry
```

### 12.2 Monitoring Stack

| Tool | Purpose | Alert Threshold |
|------|---------|-----------------|
| Sentry | Runtime error tracking | Any unhandled error |
| Vercel Analytics | Page performance, LCP | LCP > 2.5s |
| Inngest Dashboard | Job success/failure rate | Failure rate > 2% |
| Upstash Dashboard | Rate limit hit rate | > 100 hits/hour on auth |
| Custom Admin Panel | Business metrics | Daily active story generation |

### 12.3 Alerting

| Alert | Trigger | Channel |
|-------|---------|---------|
| Story generation failure spike | > 5% failure rate in 15 min | Email |
| Groq API down | 5 consecutive 5xx errors | Email |
| Database connection pool exhausted | PgBouncer pool full | Email |
| Stripe webhook failures | Webhook returns non-200 | Stripe Dashboard |
| Cost spike | Daily AI spend > $50 | Email |

---

## 13. CDN & Static Assets

### 13.1 CDN Strategy (Vercel Edge)

| Asset | Cache | Notes |
|-------|-------|-------|
| `/` (landing page) | 24h ISR | Revalidated on deploy |
| `/_next/static/*` | Immutable | Content-hash in filename |
| `/favicon.ico`, `/og-image.png` | 7 days | |
| DALL-E images (external) | None | Must be proxied/re-stored |
| Supabase Storage images | Supabase CDN | Globally distributed |

### 13.2 Image Optimization

All images served through `next/image` which:
- Converts to WebP automatically
- Serves appropriate size per viewport
- Lazy loads by default
- Uses Vercel's image optimization service

---

## 14. Security Architecture

### 14.1 Defense in Depth

```
Layer 1: Network     — Vercel DDoS protection, HTTPS enforced
Layer 2: Edge        — Rate limiting via Upstash Redis (middleware)
Layer 3: Auth        — Supabase JWT, HttpOnly cookies, SameSite=Lax
Layer 4: API         — Zod validation, auth check on every route
Layer 5: Database    — Row-Level Security on all tables
Layer 6: AI          — No child data sent to external APIs without consent disclosure
Layer 7: Payments    — Stripe signature verification on all webhooks
```

### 14.2 Rate Limiting Rules

```typescript
// Login: 5 attempts per IP per minute
// Register: 3 attempts per IP per minute
// Story generate: 3 requests per user per minute
// Admin routes: 30 requests per user per minute
// All other API: 60 requests per IP per minute
```

### 14.3 Secret Management

| Secret | Storage | Rotation |
|--------|---------|---------|
| Supabase anon key | Vercel env var | On project re-key |
| Supabase service role | Vercel env var | On project re-key |
| Stripe secret key | Vercel env var | On key compromise |
| Stripe webhook secret | Vercel env var | On endpoint change |
| Groq API key | Vercel env var | Every 90 days |
| OpenAI API key | Vercel env var | Every 90 days |
| Internal API key | Vercel env var | Replace with Inngest auth |

---

## 15. Backup & Disaster Recovery

### 15.1 Database Backups

| Backup Type | Frequency | Retention | Provider |
|-------------|-----------|-----------|---------|
| Point-in-time recovery | Continuous | 7 days | Supabase Pro |
| Daily snapshot | Daily at 02:00 UTC | 30 days | Supabase Pro |
| Manual export | Before migrations | Indefinite | Manual |

### 15.2 Recovery Time Objectives

| Scenario | RTO | RPO | Recovery Action |
|----------|-----|-----|-----------------|
| Vercel deployment failure | 5 min | 0 | Rollback to previous deployment |
| Database corruption | 1 hour | 1 hour | PITR restore |
| Full region outage | 4 hours | 1 hour | Failover to backup region |
| AI provider outage | 0 min | N/A | Fallback to alternate provider |

### 15.3 Deployment Rollback

```
Issue detected in production
    │
    ├── Vercel Dashboard → Deployments
    ├── Click previous deployment → Promote to Production
    └── DNS cutover: ~30 seconds
```

---

## 16. CI/CD Pipeline

### 16.1 Pipeline Design

```
Developer pushes to GitHub
    │
    ├── GitHub Actions: CI
    │     ├── npm run type-check    (TypeScript)
    │     ├── npm run lint          (ESLint)
    │     └── npm run build         (build validation)
    │
    ├── Vercel: Preview Deployment
    │     ├── Deploys to preview URL
    │     ├── Runs Vercel checks
    │     └── Posts URL to PR
    │
    └── Merge to main
          └── Vercel: Production Deployment
                ├── Build (~40 seconds)
                ├── Deploy to Edge Network
                └── Alias hikayati-nine.vercel.app
```

### 16.2 Environment Strategy

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Development | feature/* | localhost:3000 | Active development |
| Preview | PR branches | *.vercel.app | PR review |
| Production | main | hikayati-nine.vercel.app | Live users |

### 16.3 Database Migration Strategy

```
Migration file: supabase/migrations/XXX_description.sql
    │
    ├── Test locally: supabase db reset
    ├── Review: Manual SQL review before applying
    ├── Apply to staging: supabase db push (preview)
    └── Apply to production: supabase db push (production)
```

---

## 17. Admin Panel Architecture

### 17.1 Access Control

```
/admin/* routes
    │
    ├── Middleware: Check auth.uid() in user_profiles WHERE role = 'admin'
    ├── If not admin: Redirect to /dashboard
    └── Render admin layout
```

### 17.2 Admin Dashboard Sections

```
/admin
    ├── /admin/overview          — KPI cards + charts
    │     ├── Total users (registered, free, paid)
    │     ├── Stories generated today / this month
    │     ├── MRR (fetched from Stripe API)
    │     ├── AI cost today / this month
    │     └── Success rate chart (30-day)
    │
    ├── /admin/users             — User management table
    │     ├── Paginated list (email, plan, stories, joined)
    │     ├── Search by email
    │     └── Override subscription plan
    │
    ├── /admin/jobs              — Generation job log
    │     ├── All jobs with status, duration, cost
    │     ├── Filter by status (failed, complete)
    │     └── View agent_log detail per job
    │
    └── /admin/settings          — Platform settings
          ├── Maintenance mode toggle
          └── Feature flags
```

### 17.3 Data Sources for Admin

| Metric | Source | Query |
|--------|--------|-------|
| Total users | Supabase `user_profiles` | COUNT(*) |
| Paid users | Supabase `subscriptions` | WHERE plan != 'free' AND status = 'active' |
| Stories today | Supabase `stories` | WHERE created_at >= today AND status = 'complete' |
| AI cost today | Supabase `generation_jobs` | SUM(cost_usd) WHERE started_at >= today |
| MRR | Stripe API | `/v1/billing/meters` or subscription aggregation |
| Failure rate | Supabase `generation_jobs` | COUNT(failed) / COUNT(*) |

---

*Architecture document approved for implementation. All findings from Technical Audit (15_TECHNICAL_AUDIT.md) are reflected in this design.*
