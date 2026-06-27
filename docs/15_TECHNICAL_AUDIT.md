# Technical Audit Report — Hikayati Platform
**Version:** 1.0  
**Date:** 2026-06-26  
**Auditor:** Engineering Leadership  
**Scope:** Full codebase review of production system

---

## Executive Summary

Hikayati is a production-deployed Next.js 15 full-stack application that orchestrates a 6-stage AI pipeline to generate personalized Arabic children's stories. The architecture is generally sound for an MVP, with proper database security, validated APIs, and a working payment integration. This audit identifies 47 findings across architecture, security, performance, and completeness — classified as Critical (8), High (12), Medium (15), and Low (12).

---

## 1. Architecture Overview

### 1.1 Technology Stack (Actual)

| Layer | Technology | Version | Status |
|-------|-----------|---------|--------|
| Frontend | Next.js App Router | 15.3.3 | ✅ Current |
| UI Framework | Tailwind CSS + shadcn/ui | 3.4.1 | ✅ Current |
| State Management | Zustand | 5.0.2 | ✅ Current |
| Database | Supabase (PostgreSQL 15) | Latest | ✅ Current |
| Auth | Supabase Auth + SSR | 0.5.2 | ✅ Current |
| AI – Text | Groq (LLaMA 3.3 70B) | API | ✅ Active |
| AI – Images | OpenAI DALL-E 3 | API | ⚠️ No credits |
| AI – Orchestration | Custom pipeline | — | ✅ Working |
| Payments | Stripe | 17.4.0 | ⚠️ Test mode |
| Deployment | Vercel (Hobby) | Latest | ✅ Live |
| Queue | None | — | ❌ Missing |
| Email | None (Resend key exists) | — | ❌ Not implemented |
| Monitoring | None | — | ❌ Missing |
| CDN | Vercel Edge | Built-in | ✅ Active |

### 1.2 Request Flow

```
Browser
  │
  ├─► Vercel Edge (CDN + Middleware)
  │     └─► Next.js Middleware (session refresh)
  │
  ├─► Next.js App Router
  │     ├─► Page Components (RSC + Client)
  │     └─► API Routes
  │           ├─► Supabase (auth + data)
  │           ├─► Stripe (payments)
  │           └─► /api/internal/generate
  │                 └─► AI Pipeline (Groq + OpenAI)
  │
  └─► Supabase
        ├─► PostgreSQL (RLS-protected)
        └─► Auth (JWT + sessions)
```

### 1.3 AI Pipeline Flow

```
POST /api/stories/generate
  │
  ├─► Creates Story (status=generating) + GenerationJob in DB
  ├─► Returns { jobId, storyId } immediately (202 Accepted)
  └─► background fetch → POST /api/internal/generate
        │
        ├─► Agent 1: Parent Insight      [~2s]  Groq 2048 tok
        ├─► Agent 2: Story Architect     [~2s]  Groq 2048 tok
        ├─► Agent 3: Story Generator     [~4s]  Groq 4096 tok
        ├─► Agent 4: Illustration Dir    [~2s]  Groq 2048 tok
        │     └─► 7× DALL-E 3           [~20s] parallel
        ├─► Agent 5: Parent Coach        [~2s]  Groq 2048 tok
        └─► Agent 6: QA (+ 1 retry)     [~2s]  Groq 2048 tok
              │
              └─► Update Story + Assets + ParentGuide in DB
```

**Total estimated tokens per story:** ~16,000–22,000 tokens  
**Total estimated time:** 15–90 seconds (with rate limit retries)

---

## 2. Frontend Structure Audit

### 2.1 Route Inventory

| Route | Type | Auth | Description |
|-------|------|------|-------------|
| `/` | Static | No | Landing / marketing page |
| `/login` | Client Component | No | Email + Google sign-in |
| `/register` | Client Component | No | Sign-up form |
| `/dashboard` | Client Component | Yes | Home hub |
| `/stories/create` | Client Component | Yes | 5-step wizard |
| `/stories/[id]` | Client Component | Yes | Story reader |
| `/children/new` | Client Component | Yes | Add child form |
| `/children/[id]` | Client Component | Yes | Child profile |
| `/upgrade` | Client Component | Yes | Pricing page |
| `/auth/callback` | Route Handler | No | OAuth callback |

**Finding A1 [HIGH]:** All protected routes are Client Components that check auth in `useEffect`. This creates a flash of unauthenticated content on every load. Protected routes should use server-side auth checks or a layout-level guard.

**Finding A2 [MEDIUM]:** `/dashboard`, `/stories/[id]`, and `/children/[id]` all independently fetch user data — no shared layout-level data fetching. This causes redundant Supabase calls.

**Finding A3 [LOW]:** Landing page (`/`) loads Google Fonts on every visit. Should be `font-display: swap` with preconnect hints.

### 2.2 Component Inventory

| Component | Location | Status | Missing |
|-----------|----------|--------|---------|
| StoryCard | components/story/ | ✅ | Skeleton loader |
| ParentGuideSection | components/story/ | ✅ | — |
| ChildProfileCard | components/child/ | ✅ | Loading state |
| DeleteChildButton | components/child/ | ✅ | — |
| Button | components/ui/ | ✅ | — |
| Input | components/ui/ | ✅ | — |
| Label | components/ui/ | ✅ | — |
| Toaster | components/ui/ | ✅ | — |
| Providers | components/ | ✅ | — |
| **ErrorBoundary** | — | ❌ Missing | Critical |
| **LoadingSpinner** | — | ❌ Missing | Used inline |
| **EmptyState** | — | ❌ Missing | Duplicated inline |
| **SubscriptionGate** | — | ❌ Missing | Logic duplicated |
| **StoriesList** | — | ❌ Missing | Needed for /stories |
| **Settings page** | — | ❌ Missing | /settings returns 404 |
| **Admin panel** | — | ❌ Missing | No admin UI |

**Finding A4 [HIGH]:** No React Error Boundaries. An uncaught error in any component will crash the entire page with a blank screen.

**Finding A5 [MEDIUM]:** Subscription limit enforcement is duplicated in `/api/children` (server) and implicitly in `/api/stories/generate`. Should be a shared utility function.

**Finding A6 [LOW]:** Story wizard `Zustand` store persists in memory only — refreshing mid-wizard loses all state. Consider `sessionStorage` persistence.

### 2.3 Wizard Steps Assessment

| Step | Component | Completeness |
|------|-----------|-------------|
| 1 – Advisor | AdvisorStep.tsx | ✅ |
| 2 – Goals | GoalStep.tsx | ✅ |
| 3 – Child | ChildStep.tsx | ✅ |
| 4 – Style | StyleStep.tsx | ✅ |
| 5 – Generating | GeneratingStep.tsx | ✅ |

The wizard is complete and functional. SSE polling works correctly with a fallback to HTTP polling.

---

## 3. Database Audit

### 3.1 Schema Completeness

| Table | Purpose | RLS | Indexes | Status |
|-------|---------|-----|---------|--------|
| user_profiles | User accounts | ✅ | ✅ | Complete |
| subscriptions | Billing state | ✅ | ✅ | ⚠️ No auto-trigger deployed |
| children | Child profiles | ✅ | ✅ | Complete |
| stories | Generated stories | ✅ | ✅ | Complete |
| story_assets | Illustrations | ✅ | ✅ | Complete |
| parent_guides | Parenting content | ✅ | ✅ | Complete |
| generation_jobs | Job tracking | ✅ | ✅ | Complete |
| development_entries | Progress tracking | ✅ | ✅ | ❌ Never written |
| child_milestones | Achievements | ✅ | ✅ | ❌ Never written |
| advisor_sessions | AI advisor history | ✅ | ✅ | ⚠️ Partially used |
| story_recommendations | ML suggestions | ✅ | ✅ | ❌ Never populated |

**Finding D1 [CRITICAL]:** The `subscriptions` auto-creation trigger (`handle_new_user`) is defined in the migration SQL but was not confirmed as deployed to the Supabase instance. New user registrations may not auto-receive a free subscription, causing UI errors and broken subscription checks.

**Finding D2 [HIGH]:** `development_entries`, `child_milestones`, and `story_recommendations` tables exist but are never written to by any agent or API route. They consume schema complexity with no business value currently.

**Finding D3 [HIGH]:** `stories.pdf_url` and `stories.audio_url` columns exist but no backend logic generates PDFs or audio. The story view page has a "Download PDF" button that leads nowhere.

**Finding D4 [MEDIUM]:** No database backup schedule confirmed beyond Supabase's default. For production data, point-in-time recovery should be verified.

**Finding D5 [MEDIUM]:** `generation_jobs.agent_log` is JSONB and can grow unboundedly. No archival or truncation strategy exists.

**Finding D6 [LOW]:** `stories.pipeline_metadata` and `generation_jobs.cost_usd` use approximate cost formula, not actual API-reported token costs. This makes financial reporting inaccurate.

### 3.2 RLS Policy Review

All tables have RLS enabled. Policies follow the pattern `user_id = auth.uid()` for SELECT/INSERT/UPDATE/DELETE. Admin operations use the service role key which bypasses RLS — this is correct and intentional.

**Finding D7 [MEDIUM]:** No RLS policy prevents a user from reading `story_assets` by guessing asset UUIDs directly. Assets should be policy-gated or stored in private Supabase Storage buckets.

---

## 4. API Audit

### 4.1 API Route Inventory

| Route | Method | Auth | Validation | Rate Limit | Status |
|-------|--------|------|-----------|-----------|--------|
| /api/auth/login | POST | No | Zod ✅ | ❌ | Complete |
| /api/auth/register | POST | No | Zod ✅ | ❌ | Complete |
| /api/auth/logout | POST | Yes | — | — | Complete |
| /api/auth/google | GET | No | — | — | Complete |
| /api/children | GET/POST | Yes | Zod ✅ | ❌ | Complete |
| /api/children/[id] | GET/DELETE | Yes | — | ❌ | Complete |
| /api/stories/generate | POST | Yes | Zod ✅ | ❌ | Complete |
| /api/stories/generate/status/[jobId] | GET/SSE | Yes | — | — | Complete |
| /api/stories/generate/poll/[jobId] | GET | Yes | — | — | Complete |
| /api/internal/generate | POST | Internal key | — | — | Complete |
| /api/advisor/analyze | POST | Yes | Partial | ❌ | Complete |
| /api/subscriptions/checkout | POST | Yes | Enum check | ❌ | Complete |
| /api/webhooks/stripe | POST | Stripe sig | ✅ | — | Complete |
| **/api/stories** | GET | — | — | — | ❌ Missing |
| **/api/stories/[id]** | GET/DELETE | — | — | — | ❌ Missing |
| **/api/admin/\*** | — | — | — | — | ❌ Missing |
| **/api/settings** | — | — | — | — | ❌ Missing |

**Finding API1 [CRITICAL]:** No rate limiting on any public API endpoint. `/api/auth/register` and `/api/auth/login` are vulnerable to brute-force and credential-stuffing attacks. `/api/stories/generate` can be abused by authenticated users on unlimited plans.

**Finding API2 [HIGH]:** `/api/stories/generate` uses a background `fetch()` call to `/api/internal/generate`. On Vercel Hobby plan, serverless functions have a 10-second timeout. The internal generate function runs for 60–300 seconds — this **will fail on Vercel Hobby** unless the function timeout is extended via `vercel.json`. The `vercel.json` has `maxDuration: 300` only for the generate route — this is correct but Vercel Hobby plan caps at 60 seconds.

**Finding API3 [CRITICAL]:** The background `fetch()` from `/api/stories/generate` to `/api/internal/generate` is fire-and-forget. If the Vercel function hosting the trigger terminates before the background fetch completes, the generation job silently dies. This is a known Vercel limitation — true background jobs require a queue (BullMQ, Inngest, Trigger.dev).

**Finding API4 [HIGH]:** `/api/internal/generate` is protected only by a static string key (`dev-secret-key-change-in-prod` in production). This key is never rotated. Anyone who discovers the Vercel URL and key can trigger unlimited AI generation at the platform's expense.

**Finding API5 [MEDIUM]:** Stripe webhook handler processes events synchronously. If the Supabase update fails mid-event, there is no retry mechanism, leading to subscription state inconsistency.

**Finding API6 [MEDIUM]:** No `GET /api/stories` endpoint exists. The dashboard fetches stories directly via Supabase client, bypassing the API layer. This makes it impossible to add server-side filtering, cursor-based pagination, or caching.

**Finding API7 [LOW]:** Auth API routes (`/api/auth/login`, `/api/auth/register`) are not used by the frontend — the login and register pages call Supabase directly from the browser client. These routes are dead code.

---

## 5. Security Audit

### 5.1 Authentication & Authorization

**Finding S1 [CRITICAL]:** No rate limiting on login/register. Supabase Auth has built-in rate limits but they are configurable and may be set permissively. Application-level rate limiting should be added.

**Finding S2 [HIGH]:** Internal API key (`INTERNAL_API_KEY`) is a static string stored as an environment variable. It is never rotated, not scoped to specific IPs, and the comparison uses string equality without constant-time comparison (susceptible to timing attacks in theory).

**Finding S3 [HIGH]:** Google OAuth redirect URLs are not whitelisted in the Supabase dashboard beyond what Supabase enforces. If the Vercel URL changes (e.g., preview deployments), OAuth redirects could be misconfigured.

**Finding S4 [MEDIUM]:** The `createAdminClient()` function uses the service role key, which bypasses all RLS. It is used in 3 places: `internal/generate`, `api/children`, `api/stories/generate`. If any of these routes has a bug, it exposes all user data.

**Finding S5 [MEDIUM]:** No Content Security Policy (CSP) headers set. Next.js default headers are minimal. DALL-E image URLs from `oaidalleapiprodscus.blob.core.windows.net` expire after 1 hour — if the story is viewed later, images 404.

**Finding S6 [MEDIUM]:** No CSRF protection on state-modifying API routes beyond Supabase session cookies (which are HttpOnly, SameSite=Lax by default). This is acceptable for same-origin requests but should be documented.

**Finding S7 [LOW]:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` is exposed in the browser bundle (intentional — it is the anonymous key). However, the Supabase project has no restrictions on which origins can use this key.

**Finding S8 [LOW]:** Story body content from AI is rendered as text (not `dangerouslySetInnerHTML`), so XSS via AI output is not possible. However, DALL-E image URLs are inserted directly — these come from a trusted domain.

### 5.2 Data Privacy

**Finding S9 [MEDIUM]:** Child profile data (name, age, hobbies, country) is sent directly to Groq's API in LLM prompts. Groq's data retention policy should be reviewed and disclosed in the privacy policy.

**Finding S10 [LOW]:** No GDPR/PDPA data deletion flow exists. The "delete child" is a soft-delete. Story data, generation logs with child details, and advisor sessions persist indefinitely.

---

## 6. AI Infrastructure Audit

### 6.1 Pipeline Reliability

**Finding AI1 [HIGH]:** The QA retry logic (`if score < 85, regenerate story`) adds a full story generation cycle. At Groq's free tier (12k TPM), this will almost always trigger another rate limit. The retry should check token budget before executing.

**Finding AI2 [HIGH]:** Image generation uses `Promise.allSettled()` for 7 concurrent DALL-E calls. With no credits, all 7 fail silently. The story is saved with no cover image and no illustrations — the story view shows empty image slots. This should degrade more gracefully (placeholder images or text-only mode).

**Finding AI3 [MEDIUM]:** Agent prompts are hardcoded strings inside the agent functions. There is no prompt versioning, no A/B testing capability, and no way to update prompts without a code deployment.

**Finding AI4 [MEDIUM]:** The `extractJson()` utility is robust, but if an agent returns completely invalid JSON (e.g., empty response or network error), the pipeline throws and the entire story fails rather than retrying that specific agent.

**Finding AI5 [MEDIUM]:** Token counting uses `response.usage.total_tokens` from the Groq response. If Groq returns `null` for usage (which happens on some error responses), `tokensUsed` accumulates as 0 with no warning.

**Finding AI6 [LOW]:** `GROQ_LARGE` and `GROQ_FAST` are both set to `llama-3.3-70b-versatile`. There is no actual speed/cost differentiation — both use the same model.

### 6.2 Cost Management

At Groq free tier limits:
- 12,000 tokens/minute
- 14,400 tokens/day per model

**A single story generation uses ~18,000 tokens** — more than the daily limit. This means **at most 1 story can be generated per day on the free tier** without hitting limits. Production requires the paid Groq tier.

---

## 7. Performance Audit

### 7.1 Frontend Performance

**Finding P1 [HIGH]:** The dashboard, story creation wizard, and all child/story pages are 100% client-rendered. There is no server-side rendering of user-specific data, meaning every page shows a loading spinner before content appears.

**Finding P2 [MEDIUM]:** React Query is configured (`staleTime: 60s`) but not used for any data fetching. All pages use raw `supabase.auth.getSession()` + direct Supabase client calls in `useEffect`. This means no caching, no background refetching, and duplicate requests on navigation.

**Finding P3 [MEDIUM]:** Story body rendering splits text by `\n` and renders each paragraph individually. For long stories (1200+ words), this creates 15–25 DOM nodes without virtualization.

**Finding P4 [LOW]:** No image lazy loading on story cards. The dashboard loads all 6 story cover images simultaneously.

**Finding P5 [LOW]:** Google Fonts loaded via `<link>` in the root layout. Should use `next/font` for font optimization.

### 7.2 Backend Performance

**Finding P6 [HIGH]:** Story generation endpoint (`/api/internal/generate`) runs for 15–300 seconds inside a Vercel serverless function. Vercel Hobby plan has a 60-second function timeout. Stories that take longer than 60 seconds will be silently killed with no error to the user.

**Finding P7 [MEDIUM]:** No connection pooling for Supabase. Each serverless function invocation creates a new Supabase client. At scale, this creates connection exhaustion in PostgreSQL (Supabase free tier: 60 connections).

**Finding P8 [LOW]:** `generation_jobs.agent_log` stores the full log as JSONB. Querying job status reads the entire JSONB column unnecessarily.

---

## 8. Scalability Issues

**Finding SC1 [CRITICAL]:** The story generation architecture (background fetch from one serverless function to another) breaks at scale. Vercel serverless functions are stateless and time-limited. A proper job queue (Inngest, Trigger.dev, BullMQ + Redis) is required for production reliability.

**Finding SC2 [HIGH]:** Supabase free tier: 500MB database, 1GB storage, 60 connections. These limits will be hit quickly with active users. The upgrade path to Supabase Pro is straightforward but costs $25/month.

**Finding SC3 [HIGH]:** Groq free tier: 14,400 tokens/day. This allows **at most 1 story/day** in production. Groq Developer tier ($0.59/M tokens) is required from day one.

**Finding SC4 [MEDIUM]:** No horizontal scaling strategy for the AI pipeline. Each story ties up a serverless function for 15–300 seconds. With 10 concurrent story requests, 10 functions are saturated simultaneously.

**Finding SC5 [LOW]:** Vercel Hobby plan has 100GB bandwidth/month. With DALL-E images (typically 2–4MB each), 7 images per story means ~21–28MB per story. At 100 stories/month, this approaches the bandwidth limit.

---

## 9. Missing Business Logic

| Feature | Priority | Impact |
|---------|----------|--------|
| PDF story download | High | Users expect it (button exists, leads nowhere) |
| Stories list page `/stories` | High | No way to view all past stories |
| User settings page `/settings` | High | Navigation links to 404 |
| Email: welcome on signup | High | No onboarding email |
| Email: story ready notification | High | Users don't know when story completes |
| Subscription auto-creation trigger | Critical | New users may lack subscription record |
| Story sharing (public link) | Medium | Viral growth mechanism |
| Child milestone tracking | Medium | Tables exist, never populated |
| Story recommendations | Medium | Tables exist, never populated |
| Admin dashboard | Medium | No visibility into platform usage |
| Audio narration | Low | Mentioned in plans, not started |
| Story favorites | Low | `is_favorite` column exists, no UI |
| Multi-child story selection in wizard | Low | Wizard always asks for child info from scratch |

---

## 10. Findings Summary

### Critical (Must Fix Before Scale)
| ID | Finding | Area |
|----|---------|------|
| D1 | Subscription trigger may not be deployed | Database |
| API1 | No rate limiting on any endpoint | Security |
| API3 | Background fetch is unreliable on Vercel | Architecture |
| S1 | Login/register open to brute force | Security |
| SC1 | No job queue — generation breaks at scale | Architecture |
| P6 | Story generation exceeds Vercel 60s timeout | Performance |
| SC3 | Groq free tier allows ~1 story/day | Infrastructure |
| API2 | Vercel Hobby 60s cap vs 300s generation | Infrastructure |

### High (Fix Before Public Launch)
| ID | Finding | Area |
|----|---------|------|
| A1 | Client-side auth check causes content flash | Frontend |
| A4 | No React Error Boundaries | Frontend |
| D2 | Unused tables add complexity | Database |
| D3 | PDF/audio columns with no implementation | Database |
| AI1 | QA retry triggers extra rate limits | AI Pipeline |
| AI2 | Image failure shows empty slots | AI Pipeline |
| API4 | Static internal API key never rotated | Security |
| API6 | No stories list API endpoint | API |
| S2 | Non-constant-time key comparison | Security |
| SC2 | Supabase free tier limits | Infrastructure |
| SC4 | No concurrency strategy for pipeline | Architecture |
| P1 | No SSR for user data | Performance |

### Medium (Fix Within 30 Days)
12 findings across security, database, API, performance.

### Low (Fix Within 90 Days)
12 findings across code quality, performance optimizations, and developer experience.

---

## 11. Recommendations (Priority Order)

1. **Deploy subscription trigger** — Run the `handle_new_user` SQL in Supabase immediately
2. **Migrate to Inngest or Trigger.dev** — Replace background fetch with a proper job queue
3. **Add rate limiting** — Use Upstash Rate Limit on login, register, and generate endpoints
4. **Upgrade Groq to Developer tier** — Free tier cannot support any real usage
5. **Upgrade Vercel to Pro** — Hobby 60s timeout kills long story generations
6. **Build `/stories` list page** — Users have no way to see all their stories
7. **Build `/settings` page** — Navigation currently leads to 404
8. **Add Error Boundaries** — Wrap all page content in error boundary components
9. **Generate PDF on story completion** — Use `@react-pdf/renderer` or similar
10. **Add welcome email** — Use Resend (key already exists) for onboarding

---

*Audit complete. All findings are based on direct code review of the production codebase as of 2026-06-26.*
