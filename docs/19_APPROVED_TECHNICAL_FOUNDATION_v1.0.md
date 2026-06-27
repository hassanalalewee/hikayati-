# Approved Technical Foundation v1.0
## Hikayati Platform — Single Source of Truth

**Document ID:** ATF-v1.0  
**Date:** 2026-06-26  
**Status:** APPROVED  
**Authors:** Engineering Leadership (Post-Adversarial Review)  
**Supersedes:** Documents 01 through 18 in /docs  
**Review Basis:** Full codebase + all 18 prior documents + independent adversarial audit  

---

> **BINDING RULE:**  
> No implementation may violate this document.  
> Any deviation requires a new Architecture Decision Record (ADR-013+).  
> All ADRs are appended to this document when approved.

---

## Chapter 1: What Hikayati Is

Hikayati (حكايتي) is an AI-powered SaaS platform that generates personalized Arabic children's stories. A parent provides their child's profile and a developmental goal. A 6-agent AI pipeline produces a complete illustrated story with a parent guide — in under 90 seconds.

**Primary market:** Arabic-speaking families in GCC countries.  
**Secondary market:** Pan-Arab diaspora globally.  
**Revenue model:** Freemium subscription (Free / Premium $14.99 / Family $24.99 / Professional $79).  
**North star metric:** Stories generated per month.

---

## Chapter 2: Approved Technology Stack

| Layer | Technology | Version | Justification |
|-------|-----------|---------|--------------|
| Framework | Next.js App Router | 15.x | SSR + API routes in one codebase, Vercel-native |
| Language | TypeScript | 5.x | Type safety across frontend and backend |
| Styling | Tailwind CSS + shadcn/ui | 3.x | RTL support, rapid development |
| State | Zustand | 5.x | Lightweight wizard state only |
| Data fetching | React Query (TanStack) | 5.x | Caching, background refresh for lists |
| Database | Supabase (PostgreSQL 15) | Latest | RLS, Auth, Realtime, Storage in one platform |
| Auth | Supabase Auth + SSR | 0.5.x | Browser-direct, server session refresh |
| Job Queue | Inngest | Latest | Durable async jobs, step-level retry, serverless |
| AI Text | Groq (LLaMA 3.3 70B + 3.1 8B) | API | Speed + cost; OpenAI GPT-4o as fallback |
| AI Images | OpenAI DALL-E 3 | API | Best-in-class image quality |
| Email | Resend | API | Simple, React Email templates, Arabic support |
| Payments | Stripe | 17.x | Industry standard, regional currency support |
| Rate Limiting | Upstash Redis | API | Serverless-compatible, per-IP and per-user |
| Error Tracking | Sentry | SDK | Full stack, source maps, alerting |
| Storage | Supabase Storage | Included | Story assets, PDFs, audio |
| Hosting | Vercel Pro | Latest | 300s function timeout, global CDN |

**What is NOT used (and why):**
- BullMQ: Requires persistent Redis worker, not serverless-compatible
- NextAuth: Supabase Auth is more capable for this use case
- Prisma: Supabase JS SDK handles all DB access; Prisma adds unnecessary abstraction
- Redis (self-hosted): Replaced by Upstash Redis (serverless)

---

## Chapter 3: Approved Architecture

### 3.1 High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS (Browser)                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS
                  ┌────────────▼────────────┐
                  │     Vercel Edge CDN      │
                  │  Static assets | TLS     │
                  └────────────┬────────────┘
                               │
                  ┌────────────▼────────────┐
                  │  Next.js Middleware      │
                  │  1. Session refresh      │
                  │  2. Rate limit (Upstash) │
                  │  3. Admin gate           │
                  └────────────┬────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
     ┌──────▼──────┐  ┌────────▼────────┐  ┌─────▼──────┐
     │Server Pages  │  │   API Routes    │  │  Webhooks  │
     │(RSC + auth) │  │   /api/v1/*     │  │  /stripe   │
     └──────┬───── ┘  └────────┬────────┘  └─────┬──────┘
            │                  │                  │
            └──────────┬───────┘                  │
                       │                          │
          ┌────────────▼────────────┐             │
          │      Supabase           │◄────────────┘
          │  PostgreSQL + Auth      │
          │  Storage + Realtime     │
          └────────────┬────────────┘
                       │
          ┌────────────▼────────────┐
          │     Inngest Platform    │
          │  (outside Vercel)       │
          │  Durable step functions │
          └────────────┬────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    ┌────▼────┐  ┌─────▼────┐  ┌────▼─────┐
    │  Groq   │  │  OpenAI  │  │  Resend  │
    │  API    │  │  API     │  │  Email   │
    └─────────┘  └──────────┘  └──────────┘
```

### 3.2 Story Generation Flow (Approved)

```
1. User submits wizard
   └── POST /api/v1/stories/generate
         ├── Validate (Zod)
         ├── Check auth (401 if not)
         ├── Check ai_consent_at (403 if null)
         ├── Check subscription + monthly limit (402 if exceeded)
         ├── Check idempotency key (return existing job if found)
         ├── createAdminClient() → INSERT story (status=generating)
         ├── createAdminClient() → INSERT generation_job
         ├── inngest.send('hikayati/story.generate', { jobId })
         └── Return 202 { ok: true, data: { jobId, storyId } }

2. Browser subscribes to Supabase Realtime
   └── supabase.channel('job-{jobId}')
         .on('postgres_changes', table: generation_jobs, filter: id=eq.{jobId})
         → Updates progress bar in real time
         → On complete: navigate to /stories/{storyId}
         → On failed: show error + retry button

3. Inngest executes storyGenerationFunction
   ├── step.run('fetch-job', () => getJobFromDB(jobId))
   ├── step.run('agent-insight', () => runParentInsightAgent(ctx))   [retry 3×]
   ├── step.run('agent-architect', () => runStoryArchitectAgent(ctx)) [retry 3×]
   ├── step.run('agent-generator', () => runStoryGeneratorAgent(ctx)) [retry 3×]
   ├── step.run('agent-illustrator', () => runIllustrationAgent(ctx)) [retry 3×]
   ├── step.run('generate-images', () => generateAndPersistImages(ctx)) [retry 2×, no-throw]
   ├── step.run('agent-coach', () => runParentCoachAgent(ctx))       [retry 3×]
   ├── step.run('agent-qa', () => runQAAgent(ctx))                   [retry 2×]
   ├── step.run('generate-pdf', () => generateStoryPDF(ctx))         [retry 2×]
   └── step.run('save-all', () => saveCompleteStoryToDB(ctx))        [retry 5×]
         ├── UPDATE stories SET status=complete, title, body, pdf_url...
         ├── INSERT story_assets (cover + pages)
         ├── INSERT parent_guides
         ├── INSERT development_entries (goals addressed)
         ├── UPDATE generation_jobs SET status=complete, tokens_used, cost_usd
         └── sendStoryReadyEmail(user.email, story.title, storyUrl)
```

### 3.3 Approved AI Agent Design

```
AGENT MODEL ASSIGNMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agent 1: Parent Insight       → llama-3.3-70b-versatile
  Input:  Child profile + goals + advisor challenge
  Output: ParentInsights JSON (personality, challenges, story direction)
  Tokens: ~2,048 max
  
Agent 2: Story Architect      → llama-3.3-70b-versatile  
  Input:  ParentInsights + style + dialect
  Output: StoryBlueprint JSON (6-act structure, characters, setting)
  Tokens: ~2,048 max
  
Agent 3: Story Generator      → llama-3.3-70b-versatile
  Input:  StoryBlueprint + dialect + age instructions
  Output: Full Arabic story text (~1,200 words)
  Tokens: ~4,096 max
  
Agent 4: Illustration Director → llama-3.1-8b-instant
  Input:  StoryBlueprint + story text
  Output: 7 DALL-E prompts (cover + 6 pages) + Arabic captions
  Tokens: ~1,024 max
  
Agent 5: Parent Coach          → llama-3.1-8b-instant
  Input:  Story text + goals + child age
  Output: ParentGuide JSON (lesson, questions, activities, tips)
  Tokens: ~2,048 max
  
Agent 6: QA Reviewer           → llama-3.1-8b-instant
  Input:  Full story + guide + blueprint
  Output: QAReport JSON (scores 0-100, pass/fail, issues)
  Tokens: ~1,024 max
  Threshold: 80 to pass (configurable via QA_THRESHOLD env var)
  Retry: Maximum 1 retry, only if token budget allows
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ESTIMATED COST PER STORY: ~$0.29
  Agents 1-3 (70B): ~14,000 tokens at $0.59/1M = $0.008
  Agents 4-6 (8B):  ~4,000 tokens at $0.06/1M  = $0.0002
  DALL-E 3 (7 img): 7 × $0.04                  = $0.28
  PDF generation:   Negligible                  = $0.001
```

### 3.4 Approved Authentication Flow

```
EMAIL/PASSWORD LOGIN:
  Browser → supabase.auth.signInWithPassword()
  Supabase sets sb-[ref]-auth-token cookie (HttpOnly, SameSite=Lax)
  Browser → navigate to /dashboard
  Middleware: supabase.auth.getUser() refreshes session cookie
  Layout (Server Component): createClient() → getUser() → if null → redirect(/login)
  
GOOGLE OAUTH:
  Browser → GET /api/auth/google
  Server → supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: origin/auth/callback })
  Browser → Google consent → GET /auth/callback?code=xxx
  Server → supabase.auth.exchangeCodeForSession(code) → sets cookies
  Browser → redirect to /dashboard

PROTECTED ROUTE GUARD:
  src/app/(app)/layout.tsx [Server Component]
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  // Pass user to children via React context or props

ADMIN GUARD:
  src/middleware.ts checks /admin/* routes
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await adminClient.from('user_profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')
```

---

## Chapter 4: Approved Database Schema

### 4.1 Complete Table List

**Migration 001** (original — keep as-is):
- user_profiles, subscriptions, children, stories, story_assets
- parent_guides, generation_jobs, development_entries, child_milestones
- advisor_sessions, story_recommendations
- All RLS policies, triggers, indexes from original migration

**Migration 002** (apply immediately):
- `stories.deleted_at TIMESTAMPTZ` — soft delete
- `children.deleted_at TIMESTAMPTZ` — soft delete
- `parent_guides.family_activities` changed to `JSONB`
- `generation_jobs.idempotency_key TEXT UNIQUE`
- `generation_jobs.inngest_event_id TEXT`, `inngest_run_id TEXT`
- `generation_jobs.tokens_by_agent JSONB`, `cost_by_provider JSONB`
- `user_profiles.ai_consent_at TIMESTAMPTZ`, `ai_consent_version TEXT`
- `stories.is_public BOOLEAN DEFAULT FALSE`, `public_slug TEXT UNIQUE`
- `processed_webhook_events(event_id PK, event_type, processed_at)`
- `audit_logs(id, user_id, actor_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent, created_at)`
- All indexes from Section 3.2 of Part 2

### 4.2 Critical Query Patterns

```sql
-- Free tier monthly story check (runs on every generation attempt)
SELECT COUNT(*) FROM stories
WHERE user_id = $1
  AND created_at >= date_trunc('month', NOW())
  AND status != 'failed'
  AND deleted_at IS NULL;
-- Index: idx_stories_monthly_count ON stories(user_id, created_at DESC) WHERE status != 'failed' AND deleted_at IS NULL

-- Dashboard stories (recent 6)
SELECT id, title, cover_url, created_at, goals, style
FROM stories
WHERE user_id = $1 AND status = 'complete' AND deleted_at IS NULL
ORDER BY created_at DESC LIMIT 6;

-- Job status polling (Inngest → DB → Supabase Realtime → browser)
UPDATE generation_jobs
SET current_stage = $2, progress = $3, status = $4
WHERE id = $1;
-- Supabase Realtime triggers browser update automatically
```

### 4.3 Data Retention Policy

| Data | Retention | Deletion Method |
|------|-----------|----------------|
| User account | Until user requests deletion | Hard delete (auth.users CASCADE) |
| Stories | Indefinite (soft delete recoverable 30 days) | Set deleted_at; cron hard-deletes after 30 days |
| Story assets | Same as story | Supabase Storage cleanup when story hard-deleted |
| Generation job logs | 90 days | Cron job purges agent_log column after 90 days |
| Audit logs | 2 years | Archived to cold storage, then purged |
| Advisor sessions | 1 year | Purged after 1 year of inactivity |
| Webhook events | 30 days | Purged after 30 days |

---

## Chapter 5: Approved API Design

### 5.1 Response Envelope (No Exceptions)

```typescript
type ApiSuccess<T> = { ok: true; data: T }
type ApiError = { ok: false; error: { code: string; message: string; details?: unknown } }
type ApiResponse<T> = ApiSuccess<T> | ApiError
```

### 5.2 Complete Route Map

See Section 4.3 of Part 2 for the complete approved route table.

### 5.3 Validation Rules

Every POST/PATCH route validates with Zod. Validation errors return:
```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "بيانات غير صالحة",
    "details": { "field": "goals", "issue": "يجب اختيار هدف واحد على الأقل" }
  }
}
```

### 5.4 Rate Limits (Enforced in Middleware)

| Endpoint Group | Limit | Window | Key |
|---------------|-------|--------|-----|
| /api/auth/google, /auth/callback | 10 | 1 minute | IP |
| /api/v1/stories/generate | 2 | 1 minute | user_id |
| /api/v1/advisor/analyze | 5 | 1 minute | user_id |
| /api/v1/admin/* | 60 | 1 minute | user_id |
| All other /api/v1/* | 60 | 1 minute | IP |

---

## Chapter 6: Security Requirements

### 6.1 Non-Negotiable Security Rules

1. **Every API route must check authentication.** No route returns user data without verifying the session.
2. **Admin routes must check role.** Never default to allowing access on auth error.
3. **Service role key is used only in:** Inngest function, admin routes, webhook handler.
4. **All Stripe webhooks must verify signature** before any processing.
5. **All free-text user input must be sanitized** before insertion into AI prompts.
6. **AI consent must be verified** before every story generation call.
7. **Rate limits are enforced in middleware**, not in individual route handlers.
8. **Webhook events are idempotent** — check processed_webhook_events before processing.

### 6.2 Environment Variables (Required)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
GROQ_API_KEY=
OPENAI_API_KEY=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_PREMIUM_MONTHLY=
STRIPE_PRICE_PREMIUM_ANNUAL=
STRIPE_PRICE_FAMILY_MONTHLY=
STRIPE_PRICE_FAMILY_ANNUAL=
STRIPE_PRICE_PRO_MONTHLY=

# Queue
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Email
RESEND_API_KEY=

# Rate Limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Monitoring
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# App
NEXT_PUBLIC_APP_URL=https://hikayati-nine.vercel.app
INTERNAL_API_KEY=  # DEPRECATED — replaced by Inngest signing key

# AI Config
QA_THRESHOLD=80
```

---

## Chapter 7: Monitoring & Observability

### 7.1 What Must Be Monitored

| Signal | Tool | Alert Threshold |
|--------|------|-----------------|
| Unhandled errors | Sentry | Any new error |
| Story generation failure rate | Custom (DB query) | > 2% in 1 hour |
| Groq API error rate | Sentry breadcrumbs | 5 errors in 5 minutes |
| Vercel function timeouts | Vercel Analytics | Any timeout |
| Database connection exhaustion | Supabase dashboard | > 400 connections |
| Stripe webhook failures | Stripe dashboard | Any 4xx/5xx response |
| Rate limit hit rate | Upstash dashboard | > 50 hits/hour on auth |
| Daily AI cost | Custom (DB query) | > $50/day |
| Platform uptime | Uptime Robot | Any downtime > 2 min |

### 7.2 Admin Dashboard KPIs (Required)

The admin panel must display, updated in real-time or near-real-time:
- Total registered users (all time, last 30 days)
- Paying users by plan (free, premium, family, pro)
- Stories generated today / this month
- Story success rate (complete / total started)
- Average story generation time (p50, p95)
- AI cost today / this month (from generation_jobs.cost_usd)
- MRR (from Stripe API)
- Generation job failures (last 24h, with error messages)

---

## Chapter 8: Compliance Requirements

### 8.1 Required Before Launch

| Requirement | Owner | Status |
|-------------|-------|--------|
| Privacy Policy page at /privacy | Engineering | ❌ Must build |
| Terms of Service page at /terms | Engineering | ❌ Must build |
| Cookie consent banner | Engineering | ❌ Must build |
| AI processing consent at registration | Engineering | ❌ Must build |
| Age verification (18+) at registration | Engineering | ❌ Must build |
| GDPR right to erasure endpoint | Engineering | ❌ Must build |
| GDPR data export endpoint | Engineering | ❌ Must build |
| DPA signed with Groq | Legal/Ops | ❌ Must complete |
| DPA signed with OpenAI | Legal/Ops | ❌ Must complete |
| DPA signed with Supabase | Legal/Ops | ❌ Must complete |

### 8.2 Content Safety Requirements

- All AI-generated story content passes through a safety check before saving
- DALL-E prompts include explicit "children's book, child-safe" safety instruction
- Parent advisor challenge text sanitized before insertion into prompts
- Mechanism for parents to report inappropriate content

---

## Chapter 9: Feature Completion Status

### 9.1 Current State (2026-06-26)

| Feature | Status | Milestone |
|---------|--------|-----------|
| Landing page | ✅ Complete | — |
| Registration + login | ✅ Complete | — |
| Google OAuth | ✅ Complete | — |
| Dashboard | ✅ Functional (needs RSC refactor) | M2 |
| Story creation wizard | ✅ Complete | — |
| Story generation (local) | ✅ Working | — |
| Story generation (Vercel) | ⚠️ Broken (timeout) | M0 |
| Story illustrations | ⚠️ Broken (images expire) | M0 |
| Story view page | ✅ Complete | — |
| Child profile create | ✅ Complete | — |
| Child profile edit | ❌ Missing | M1 |
| Stories list page | ❌ Missing | M1 |
| Settings page | ❌ Missing | M1 |
| PDF download | ❌ Missing (button exists) | M1 |
| Story sharing | ❌ Missing | M2 |
| Admin panel | ❌ Missing | M2 |
| Email notifications | ❌ Missing | M1 |
| Password reset | ❌ Missing | M1 |
| Subscription management | ❌ Missing | M1 |
| Error boundaries | ❌ Missing | M1 |
| Privacy policy + Terms | ❌ Missing | M0 (compliance) |
| AI consent flow | ❌ Missing | M0 (compliance) |
| Rate limiting | ❌ Missing | M0 |
| Inngest queue | ❌ Missing | M0 |
| Supabase Realtime progress | ❌ Missing | M0 |
| Audio narration | ❌ Not started | M3 |
| Child milestones | ❌ Tables exist, no UI | M3 |
| Story recommendations | ❌ Tables exist, no logic | M3 |

---

## Chapter 10: Architecture Decision Log

| ADR | Decision | Status |
|-----|----------|--------|
| ADR-001 | Inngest for job queue | Approved |
| ADR-002 | Supabase Realtime for progress | Approved |
| ADR-003 | Groq primary, OpenAI fallback, model tiering | Approved |
| ADR-004 | Supabase Storage for image persistence | Approved |
| ADR-005 | /api/v1 versioning | Approved |
| ADR-006 | { ok, data, error } response envelope | Approved |
| ADR-007 | Soft deletes on stories and children | Approved |
| ADR-008 | Browser-direct Supabase auth | Approved |
| ADR-009 | Role column + middleware admin gate | Approved |
| ADR-010 | AI consent gate + privacy controls | Approved |
| ADR-011 | QA threshold 80, 1 retry, budget check | Approved |
| ADR-012 | Stripe webhook idempotency table | Approved |

**To propose a new ADR:**  
Create a file `docs/ADR-XXX-title.md` with: Context, Decision, Alternatives, Rationale, Consequences. Present to engineering lead for approval before implementing.

---

## Chapter 11: The 10 Rules of This Codebase

These rules are binding. Violations require a new ADR.

1. **No story generation without Inngest.** No background fetch, no synchronous generation exceeding 30s.
2. **No auth in useEffect.** Auth checks happen in Server Component layouts, not client-side hooks.
3. **No direct DB access without RLS.** The anon client respects RLS. The admin client bypasses it — use admin client only in Inngest functions and admin routes.
4. **No raw SQL strings.** Use Supabase query builder. Complex queries as Postgres functions.
5. **No API route without validation.** Every POST/PATCH body validated with Zod before any logic runs.
6. **No user data in error messages.** Error responses never include emails, names, IDs, or tokens.
7. **No unhandled promise rejections.** Every async operation has a try/catch. Errors logged to Sentry.
8. **No hardcoded secrets.** All keys in environment variables. No defaults in production.
9. **No feature without a test.** Critical paths (generation, payment, auth) have at least one integration test.
10. **No deployment without this document.** Every feature must be traceable to a requirement in this document or an approved ADR.

---

## Appendix A: Current Infrastructure Costs

| Service | Current Plan | Monthly Cost | Required Plan | Required Cost |
|---------|-------------|-------------|--------------|--------------|
| Vercel | Hobby ($0) | $0 | Pro | $20 |
| Supabase | Free | $0 | Pro | $25 |
| Groq | Free | $0 | Developer | ~$30 |
| OpenAI | $0 (no credits) | $0 | Pay-as-you-go | ~$20 |
| Inngest | — | $0 | Free tier | $0 |
| Resend | — | $0 | Free tier | $0 |
| Upstash | — | $0 | Pay-per-use | ~$5 |
| Sentry | — | $0 | Free tier | $0 |
| **Total** | | **$0** | | **~$100/month** |

**Break-even:** 7 paying users at $14.99/month.  
**Current status:** Platform cannot generate more than ~1 story/day at free tier limits.

---

## Appendix B: Known Existing Data Issues

These issues exist in production data as of 2026-06-26 and require remediation:

1. **All story_assets.url values are expired DALL-E URLs.** Stories generated before Milestone 0 completion have no working images. These cannot be recovered unless the stories are regenerated.
2. **Subscription records may be missing for some early users.** Run M0.1 SQL to deploy the trigger, then verify all `auth.users` rows have corresponding `subscriptions` rows.
3. **Vercel env vars were previously set to empty strings.** Resolved on 2026-06-26. All env vars now confirmed present with real values.

---

*Document ATF-v1.0 is complete.*  
*This is the single source of truth for Hikayati platform engineering.*  
*All prior architecture documents are archived as reference only.*  
*No implementation begins until this document is acknowledged by the engineering team.*
