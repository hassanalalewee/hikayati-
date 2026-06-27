# Approved Technical Foundation v1.0
## Part 2: Final Approved Specifications

**Classification:** Internal Engineering — Source of Truth  
**Date:** 2026-06-26

---

## Section 3: Final Approved Database Design

### 3.1 Design Principles
1. Every table has RLS enabled — no exceptions
2. Soft deletes on all user-owned content (stories, children)
3. JSONB used for structured objects with multiple fields; TEXT[] only for flat string arrays
4. Every foreign key has an explicit ON DELETE action
5. Audit trail for all admin and billing actions
6. Idempotency keys on all async operations

### 3.2 Final Schema — Migration 002

```sql
-- ============================================================
-- Migration 002: Schema corrections and additions
-- Apply AFTER 001_initial_schema.sql
-- ============================================================

-- Fix 1: Soft delete on stories
ALTER TABLE stories ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX idx_stories_not_deleted ON stories(user_id, created_at DESC) WHERE deleted_at IS NULL;

-- Fix 2: Soft delete on children (supplement is_active with deleted_at)
ALTER TABLE children ADD COLUMN deleted_at TIMESTAMPTZ;

-- Fix 3: Fix family_activities type (was TEXT[], should be JSONB)
ALTER TABLE parent_guides 
  ALTER COLUMN family_activities TYPE JSONB 
  USING to_jsonb(family_activities);

-- Fix 4: Idempotency key on generation_jobs
ALTER TABLE generation_jobs 
  ADD COLUMN idempotency_key TEXT UNIQUE;
CREATE INDEX idx_jobs_idempotency ON generation_jobs(idempotency_key) 
  WHERE status NOT IN ('failed');

-- Fix 5: Monthly story count index
CREATE INDEX idx_stories_monthly_count 
  ON stories(user_id, created_at DESC) 
  WHERE status != 'failed' AND deleted_at IS NULL;

-- Fix 6: AI consent tracking on user_profiles
ALTER TABLE user_profiles 
  ADD COLUMN ai_consent_at TIMESTAMPTZ,
  ADD COLUMN ai_consent_version TEXT DEFAULT '1.0';

-- Fix 7: Stripe webhook idempotency
CREATE TABLE processed_webhook_events (
  event_id    TEXT PRIMARY KEY,
  event_type  TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fix 8: Audit log table
CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  actor_id     UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,
  entity_type  TEXT NOT NULL,
  entity_id    TEXT,
  old_value    JSONB,
  new_value    JSONB,
  ip_address   TEXT,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id, created_at DESC);

-- Fix 9: Public story sharing
ALTER TABLE stories 
  ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN public_slug TEXT UNIQUE;
CREATE INDEX idx_stories_public_slug ON stories(public_slug) WHERE is_public = TRUE;

-- Fix 10: Story generation token budget tracking
ALTER TABLE generation_jobs 
  ADD COLUMN tokens_by_agent JSONB DEFAULT '{}',
  ADD COLUMN cost_by_provider JSONB DEFAULT '{}',
  ADD COLUMN model_used TEXT DEFAULT 'llama-3.3-70b-versatile';

-- Fix 11: RLS for new tables
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- audit_logs: admins only (service role bypasses this)
CREATE POLICY "admin_read_audit_logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- processed_webhook_events: service role only (no user access)
-- No policy needed — service role bypasses RLS

-- Fix 12: story_assets RLS insert (missing from original)
CREATE POLICY "service_insert_story_assets" ON story_assets
  FOR INSERT WITH CHECK (TRUE); -- Only callable via service role

-- Fix 13: Track which Inngest job ID corresponds to each generation job
ALTER TABLE generation_jobs 
  ADD COLUMN inngest_event_id TEXT,
  ADD COLUMN inngest_run_id TEXT;
```

### 3.3 Final Table Summary

| Table | Purpose | Soft Delete | RLS | Critical Indexes |
|-------|---------|-------------|-----|-----------------|
| user_profiles | User accounts + settings | No (auth cascade) | ✅ | id, role |
| subscriptions | Billing state | No | ✅ | user_id + status |
| children | Child profiles | ✅ (deleted_at + is_active) | ✅ | user_id WHERE active |
| stories | Generated stories | ✅ (deleted_at) | ✅ | user_id + created_at, monthly count, public_slug |
| story_assets | Illustrations/cover | No (cascade) | ✅ | story_id |
| parent_guides | Parenting content (JSONB) | No (cascade) | ✅ | story_id |
| generation_jobs | Async job tracking | No | ✅ | idempotency_key, status |
| development_entries | Child progress | No | ✅ | child_id + category |
| child_milestones | Achievements | No | ✅ | child_id |
| advisor_sessions | AI advisor history | No | ✅ | user_id |
| story_recommendations | Next story suggestions | No | ✅ | child_id + is_used |
| processed_webhook_events | Stripe dedup | N/A | ✅ | event_id (PK) |
| audit_logs | Admin + billing trail | No | ✅ (admin only) | user_id, entity |

---

## Section 4: Final Approved API Design

### 4.1 Universal Response Envelope

All API routes (except webhooks) return:

```typescript
// Success
HTTP 200 / 201 / 202
{ "ok": true, "data": T }

// Client error
HTTP 400 / 401 / 402 / 403 / 404 / 409 / 422 / 429
{ "ok": false, "error": { "code": string, "message": string, "details"?: unknown } }

// Server error
HTTP 500
{ "ok": false, "error": { "code": "INTERNAL_ERROR", "message": "حدث خطأ. يرجى المحاولة مجدداً." } }
```

### 4.2 Standard Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Authenticated but not allowed |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate (e.g., email already registered) |
| `VALIDATION_ERROR` | 422 | Request body failed Zod validation |
| `RATE_LIMITED` | 429 | Too many requests |
| `FREE_LIMIT_REACHED` | 402 | Monthly story limit exceeded |
| `SUBSCRIPTION_REQUIRED` | 402 | Feature requires paid plan |
| `AI_CONSENT_REQUIRED` | 403 | User has not consented to AI processing |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### 4.3 Final API Route Table

```
BASE: /api/v1

AUTH (browser → Supabase directly — no API routes)
  Supabase handles: signInWithPassword, signUp, signInWithOAuth
  Only needed server routes:
  GET  /api/auth/google          → OAuth redirect (keep)
  GET  /auth/callback            → OAuth callback (keep)

CHILDREN
  GET    /api/v1/children              → List user's active children
  POST   /api/v1/children              → Create child (limit checked)
  GET    /api/v1/children/:id          → Get single child
  PATCH  /api/v1/children/:id          → Update child
  DELETE /api/v1/children/:id          → Soft delete (sets deleted_at + is_active=false)

STORIES
  GET    /api/v1/stories               → List stories (paginated, cursor-based)
  GET    /api/v1/stories/:id           → Get story detail
  PATCH  /api/v1/stories/:id           → Update (is_favorite, is_public)
  DELETE /api/v1/stories/:id           → Soft delete
  POST   /api/v1/stories/:id/share     → Generate public_slug, set is_public=true
  GET    /api/v1/stories/:id/pdf       → Get signed PDF download URL

GENERATION
  POST   /api/v1/stories/generate      → Trigger story generation (returns jobId)
  GET    /api/v1/jobs/:jobId           → Get job status (JSON, for polling fallback)

ADVISOR
  POST   /api/v1/advisor/analyze       → Analyze challenge, return goal recommendations

SETTINGS
  GET    /api/v1/settings              → Get user profile + subscription
  PATCH  /api/v1/settings              → Update profile (name, dialect, etc.)

SUBSCRIPTIONS
  POST   /api/v1/subscriptions/checkout → Create Stripe checkout session
  GET    /api/v1/subscriptions/portal   → Get Stripe customer portal URL

ADMIN (role=admin only)
  GET    /api/v1/admin/stats           → Platform overview (users, stories, cost, MRR)
  GET    /api/v1/admin/users           → Paginated user list
  GET    /api/v1/admin/users/:id       → User detail with subscription history
  PATCH  /api/v1/admin/users/:id       → Override subscription plan
  GET    /api/v1/admin/jobs            → Paginated generation job list
  GET    /api/v1/admin/jobs/:id        → Job detail with full agent log
  POST   /api/v1/admin/maintenance     → Toggle maintenance mode

INTERNAL (Inngest only — not publicly accessible)
  POST   /api/inngest                  → Inngest webhook handler

WEBHOOKS (provider-specific format)
  POST   /api/webhooks/stripe          → Stripe events

PUBLIC (no auth)
  GET    /story/:slug                  → Public story view (read-only)
```

### 4.4 Pagination Contract

All list endpoints support cursor pagination:

```
Request:
  GET /api/v1/stories?limit=12&cursor=<base64_encoded_story_id>

Response:
  {
    "ok": true,
    "data": {
      "items": Story[],
      "nextCursor": "<base64_encoded_last_id> | null",
      "total": number  // only when cheap to compute
    }
  }
```

### 4.5 Rate Limiting Headers

All rate-limited responses include:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1719388800
Retry-After: 45
```

---

## Section 5: Final Approved System Architecture

### 5.1 Infrastructure Stack (Approved)

| Layer | Service | Plan | Monthly Cost |
|-------|---------|------|-------------|
| Hosting | Vercel | Pro ($20) | $20 |
| Database | Supabase | Pro ($25) | $25 |
| Auth | Supabase Auth | Included | $0 |
| Job Queue | Inngest | Free (50k events) | $0 |
| AI Text | Groq | Developer ($0.59/1M tok) | ~$30 |
| AI Images | OpenAI | Pay-as-you-go | ~$20 |
| Email | Resend | Free (3k/month) | $0 |
| Rate Limiting | Upstash Redis | Pay-per-use | ~$5 |
| Error Tracking | Sentry | Free (5k errors) | $0 |
| Storage | Supabase Storage | Included in Pro | $0 |
| **Total** | | | **~$100/month** |

Break-even: **7 paying subscribers** at $14.99/month.

### 5.2 Approved Request Flow

```
[Browser]
    │
    ▼
[Vercel Edge CDN]
    │ Static assets cached at edge
    ▼
[Next.js Middleware]
    │ 1. Supabase session refresh (all routes)
    │ 2. Rate limit check (Upstash Redis)
    │ 3. Admin role gate (/admin/*)
    ▼
[Next.js App Router]
    │
    ├── Server Components → createClient() → Supabase (RLS)
    │
    └── API Routes
          │
          ├── /api/v1/* → Business logic → Supabase (RLS)
          │
          ├── /api/v1/stories/generate
          │     │ 1. Validate request
          │     │ 2. Check subscription + monthly limit
          │     │ 3. Check AI consent
          │     │ 4. Check idempotency key
          │     │ 5. Create story record (status=generating)
          │     │ 6. Create generation_job record
          │     │ 7. inngest.send('story/generate', { jobId })
          │     └── Return { ok: true, data: { jobId, storyId } }
          │
          ├── /api/inngest → Inngest webhook → runs storyGenerationFunction
          │
          └── /api/webhooks/stripe → Stripe event handler

[Inngest Platform] (outside Vercel)
    │
    └── storyGenerationFunction
          │ Step 1: fetchJobData (retry 3×)
          │ Step 2: runParentInsightAgent (retry 3×, timeout 30s)
          │ Step 3: runStoryArchitectAgent (retry 3×, timeout 30s)
          │ Step 4: runStoryGeneratorAgent (retry 3×, timeout 60s)
          │ Step 5: runIllustrationAgent (retry 3×, timeout 30s)
          │ Step 6: generateAndPersistImages (retry 2×, no-throw)
          │ Step 7: runParentCoachAgent (retry 3×, timeout 30s)
          │ Step 8: runQAAgent (retry 2×, timeout 30s)
          │ Step 9: generatePDF (retry 2×, timeout 60s)
          │ Step 10: saveAllToDatabase (retry 5×, timeout 30s)
          └── Each step updates generation_jobs.progress in DB

[Browser — Supabase Realtime]
    │
    └── supabase.channel('job-{jobId}')
          .on('postgres_changes', { table: 'generation_jobs' })
          → Receives progress updates instantly as Inngest updates DB
          → On status=complete → redirect to /stories/{storyId}
          → On status=failed → show error with retry option
```

### 5.3 Approved AI Pipeline Design

```
Pipeline Context (passed between all agents):
{
  input: { child, goals, style, dialect, wordCountTarget, advisorChallenge },
  tokenBudget: { usedThisMinute, minuteWindowStart, dailyUsed },
  agentLog: [],
  // Outputs populated as pipeline progresses:
  insights, blueprint, rawStory, finalStory,
  illustrations, coverUrl, pageUrls,
  parentGuide, qaReport
}

Agent Model Assignment:
  - Agent 1 (Parent Insight):     llama-3.3-70b-versatile  [complex reasoning]
  - Agent 2 (Story Architect):    llama-3.3-70b-versatile  [complex structure]
  - Agent 3 (Story Generator):    llama-3.3-70b-versatile  [creative writing]
  - Agent 4 (Illustration Dir):   llama-3.1-8b-instant     [simple formatting]
  - Agent 5 (Parent Coach):       llama-3.1-8b-instant     [structured output]
  - Agent 6 (QA):                 llama-3.1-8b-instant     [scoring only]

Estimated token cost per story:
  - Agents 1-3 (70B): ~14,000 tokens × $0.59/1M = $0.008
  - Agents 4-6 (8B):  ~4,000 tokens  × $0.06/1M = $0.0002
  - DALL-E 3 (7 img): 7 × $0.04 = $0.28
  Total per story: ~$0.29 (vs. $1.26 originally estimated — 77% cheaper)

Provider Fallback:
  groqWithRetry() → on 5xx: openaiWithRetry() → on failure: throw
  Circuit breaker: 5 failures in 60s → pause Groq for 300s

Token Budget Guard (per agent call):
  if (tokensUsedThisMinute + estimatedTokens > 11000):
    sleep until next minute window
    reset tokensUsedThisMinute = 0
```

### 5.4 Approved Real-Time Progress Architecture

**Replace SSE with Supabase Realtime:**

```typescript
// Frontend: GeneratingStep.tsx
const channel = supabase
  .channel(`job-${jobId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'generation_jobs',
    filter: `id=eq.${jobId}`,
  }, (payload) => {
    setProgress(payload.new.progress)
    setStage(payload.new.current_stage)
    if (payload.new.status === 'complete') {
      router.push(`/stories/${storyId}`)
    }
    if (payload.new.status === 'failed') {
      setError(payload.new.error_message)
    }
  })
  .subscribe()

// Cleanup on unmount:
return () => supabase.removeChannel(channel)
```

**Why this is better than SSE:**
- No Vercel connection timeout (Supabase WebSocket, not HTTP)
- No polling overhead (push, not pull)
- Automatic reconnect handled by Supabase client
- Works even if the user closes and reopens the browser tab

---

## Section 6: Architecture Decision Records (ADRs)

### ADR-001: Job Queue — Inngest over BullMQ/Trigger.dev

**Status:** Approved  
**Date:** 2026-06-26  

**Context:** Story generation takes 15–300 seconds. Vercel serverless functions have a maximum timeout (60s Hobby, 300s Pro). A reliable async execution mechanism is required.

**Decision:** Use Inngest as the job queue and step-function runtime.

**Alternatives considered:**
- BullMQ + Redis: Requires self-hosted Redis worker. Adds infrastructure complexity. Not serverless-compatible.
- Trigger.dev: Similar to Inngest but less mature Next.js integration.
- Vercel Background Functions: Beta, not production-ready as of 2026.
- Direct database polling: No durable retry, same timeout problem.

**Rationale:**
- Zero infrastructure (fully managed)
- Native Next.js App Router integration
- Step-level retries (each agent independently retried)
- Observable (dashboard shows every step's status)
- Free tier: 50,000 function runs/month (sufficient for launch)
- If Inngest fails: fallback to synchronous execution with Vercel Pro 300s timeout

**Consequences:**
- Story generation no longer happens in a Vercel function
- `/api/internal/generate` is replaced by an Inngest function
- All existing background fetch code is deleted

---

### ADR-002: Real-Time Updates — Supabase Realtime over SSE

**Status:** Approved  
**Date:** 2026-06-26  

**Context:** Users need to see story generation progress in real time. Current implementation uses Server-Sent Events (SSE) which times out on Vercel.

**Decision:** Use Supabase Realtime postgres_changes subscription.

**Alternatives considered:**
- SSE with keepalive: Still limited by Vercel connection timeout
- HTTP polling every 3s: Simple but adds unnecessary load at scale
- WebSockets (custom): Complex to implement and maintain
- Pusher/Ably: Additional paid service, unnecessary when Supabase Realtime is already available

**Rationale:**
- Already available in Supabase SDK (zero additional cost/infrastructure)
- Push-based (no polling overhead)
- Automatic reconnect
- Works across all browser tabs (if user opens a new tab, progress resumes)

**Consequences:**
- SSE endpoint (`/api/stories/generate/status/[jobId]`) is deprecated
- Poll endpoint (`/api/stories/generate/poll/[jobId]`) kept as fallback
- GeneratingStep.tsx refactored to use Supabase Realtime

---

### ADR-003: AI Provider Strategy — Groq Primary, OpenAI Fallback

**Status:** Approved  
**Date:** 2026-06-26  

**Decision:** Groq LLaMA 3.3 70B for complex agents, Groq LLaMA 3.1 8B for simple agents, OpenAI GPT-4o as fallback on Groq 5xx errors.

**Cost impact:** ~$0.29/story (down from estimated $1.26)

**Model assignment:**
- Complex (Agents 1–3): llama-3.3-70b-versatile
- Simple (Agents 4–6): llama-3.1-8b-instant
- Fallback all: gpt-4o-mini

---

### ADR-004: Image Persistence — Supabase Storage (Immediate Download)

**Status:** Approved  
**Date:** 2026-06-26  

**Decision:** After each DALL-E image is generated, immediately download it and upload to Supabase Storage bucket `story-assets`. Store the permanent Supabase Storage URL.

**Rationale:** DALL-E URLs expire in ~1 hour. All current stories have broken images. This must be fixed in Milestone 0.

**Storage path:** `story-assets/{story_id}/cover.png`, `story-assets/{story_id}/page-{n}.png`

---

### ADR-005: API Versioning — /api/v1 Prefix

**Status:** Approved  
**Date:** 2026-06-26  

**Decision:** All new and refactored API routes use `/api/v1/` prefix. Legacy routes (`/api/auth/login`, `/api/auth/register`) are deleted (dead code). Webhooks at `/api/webhooks/*`. Internal at `/api/inngest`.

---

### ADR-006: Response Envelope — { ok, data, error }

**Status:** Approved  
**Date:** 2026-06-26  

**Decision:** All API responses use `{ ok: boolean, data?: T, error?: { code, message } }`. No exceptions except webhook endpoints.

---

### ADR-007: Soft Deletes — All User-Owned Content

**Status:** Approved  
**Date:** 2026-06-26  

**Decision:** Stories and children use soft deletes (`deleted_at TIMESTAMPTZ`). All queries include `WHERE deleted_at IS NULL`. 30-day recovery window for stories. Children remain queryable for historical story association even after soft delete.

---

### ADR-008: Authentication Flow — Browser-Direct Supabase

**Status:** Approved  
**Date:** 2026-06-26  

**Decision:** Login, register, and OAuth flows call Supabase directly from the browser client. No server-side auth API routes. Middleware handles session refresh via `supabase.auth.getUser()`. Layout-level server auth check for protected routes (not useEffect).

**Rationale:** This is the official Supabase SSR pattern. Custom auth API routes are dead code and create inconsistency.

---

### ADR-009: Admin Access — Role Column + Middleware Gate

**Status:** Approved  
**Date:** 2026-06-26  

**Decision:** Admin role stored in `user_profiles.role`. Middleware checks role from DB on every `/admin/*` request. On any auth check failure (error, null, wrong role), always redirect to `/dashboard` — never default to allowing access.

---

### ADR-010: Child Data Privacy — Consent Gate + Pseudonymization

**Status:** Approved  
**Date:** 2026-06-26  

**Decision:**
1. Explicit AI processing consent required before first story generation
2. Consent stored in `user_profiles.ai_consent_at`
3. Story generation API blocked if `ai_consent_at IS NULL`
4. Groq "no training" API flag enabled on paid tier
5. Child names used in prompts (personalization requirement outweighs pseudonymization benefit — documented in privacy policy)

---

### ADR-011: QA Threshold — 80 with Plan-Based Scaling

**Status:** Approved  
**Date:** 2026-06-26  

**Decision:**
- QA pass threshold: 80 (not 85)
- Maximum 1 retry per story
- Before retry: check if token budget allows (~4,000 tokens for regeneration)
- If budget insufficient: save story as-is with QA score noted in metadata
- Configuration stored in environment variable `QA_THRESHOLD` (default: 80)

---

### ADR-012: Webhook Idempotency — processed_webhook_events Table

**Status:** Approved  
**Date:** 2026-06-26  

**Decision:** Before processing any Stripe webhook event, check `processed_webhook_events` table for the event ID. If found, return 200 without processing. If not found, process and insert event ID atomically.

---

## Section 7: Final Compliance Checklist

### 7.1 GDPR Compliance Requirements

| Requirement | Implementation |
|-------------|---------------|
| Lawful basis for processing | Consent (checkbox at registration) |
| Privacy policy | Create `/privacy` page — required before launch |
| Cookie policy | Create `/cookies` page — required before launch |
| Right to erasure | `DELETE /api/v1/settings/account` — hard-deletes all user data |
| Right to access | `GET /api/v1/settings/export` — returns all user data as JSON |
| Data retention policy | Stories soft-deleted after user request; hard-deleted after 30 days; generation logs archived after 30 days |
| Children's data | Explicit parental consent for AI processing (ai_consent_at) |
| Data processor agreements | Groq DPA, OpenAI DPA, Supabase DPA — all must be signed |

### 7.2 Pre-Launch Legal Checklist

- [ ] Privacy Policy page created and reviewed by legal
- [ ] Terms of Service page created
- [ ] Cookie consent banner implemented
- [ ] GDPR/PDPL consent at registration
- [ ] AI processing consent at registration
- [ ] DPAs signed with Groq, OpenAI, Supabase, Stripe, Vercel
- [ ] Age verification: users must confirm they are 18+

---

## Section 8: Final Implementation Roadmap (Revised)

### Milestone 0 — Critical Blockers (Week 1–2)
All items are BLOCKING. No user acquisition until complete.

| Task | Effort | Blocker |
|------|--------|---------|
| Deploy subscription trigger SQL | 2h | New users have no plan |
| Fix DALL-E image persistence (Supabase Storage) | 1d | All existing stories have broken images |
| Replace background fetch with Inngest | 1d | Stories fail silently on Vercel |
| Replace SSE with Supabase Realtime | 4h | Progress bar broken on Vercel |
| Add rate limiting (Upstash) | 4h | Security vulnerability |
| Add AI consent gate | 4h | GDPR compliance |
| Upgrade Vercel Pro + Groq Developer | 1h | 60s timeout, 1 story/day limit |
| Add OpenAI image credits | 1h | All stories have no illustrations |
| **Total** | **~4 days** | |

### Milestone 1 — Stable MVP (Week 3–6)

| Task | Effort |
|------|--------|
| Stories list page /stories | 1d |
| Settings page /settings | 2d |
| Child profile edit | 4h |
| Password reset flow | 4h |
| React Error Boundaries | 3h |
| Welcome + story-ready emails (Resend) | 1d |
| PDF generation (@react-pdf/renderer) | 2d |
| Story soft delete + recovery | 4h |
| Idempotency key on generation | 4h |
| Privacy policy + Terms pages | 4h |
| **Total** | **~9 days** |

### Milestone 2 — Growth (Week 7–12)

| Task | Effort |
|------|--------|
| Admin panel (overview, users, jobs) | 4d |
| Story sharing (public links) | 2d |
| Story favorites | 4h |
| Dashboard → Server Component refactor | 2d |
| Sentry error tracking | 1d |
| Light model for Agents 4–6 (cost reduction) | 4h |
| Circuit breaker + OpenAI fallback | 1d |
| Prompt versioning system | 3d |
| **Total** | **~14 days** |

### Milestone 3 — Scale (Week 13–20)

| Task | Effort |
|------|--------|
| Child milestone tracking UI | 3d |
| Audio narration (ElevenLabs) | 4d |
| Story recommendations engine | 3d |
| PWA + offline reading | 3d |
| Performance optimization (RSC, React Query) | 3d |
| Monitoring dashboard (custom KPIs) | 2d |
| **Total** | **~18 days** |

### Milestone 4 — Platform (Week 21–30)

| Task | Effort |
|------|--------|
| Referral program | 1w |
| Gift cards (Stripe) | 1w |
| Professional/school plan features | 2w |
| Mobile app (React Native) | 4w |
| English UI option | 2w |
| **Total** | **~10 weeks** |

---

*Part 2 complete. Part 3 contains the master Approved Technical Foundation document.*
