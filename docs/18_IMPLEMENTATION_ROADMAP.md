# Implementation Roadmap — Hikayati Platform
**Version:** 1.0  
**Date:** 2026-06-26  
**Status:** Pending Approval  
**Based on:** Technical Audit (15), PRD (16), System Architecture (17)

---

## Roadmap Overview

```
NOW ──────────────────────────────────────────────────────────► FUTURE

 Milestone 0    Milestone 1      Milestone 2     Milestone 3    Milestone 4
 Critical Fix   Stable MVP       Growth Layer    Scale Layer    Platform
 [Week 1-2]     [Week 3-6]       [Week 7-12]     [Week 13-20]   [Week 21-30]
     │               │                │               │               │
     ▼               ▼                ▼               ▼               ▼
Infrastructure   Core Missing    Engagement      Reliability     Expansion
Stabilization    Features        Features        & Scale
```

---

## Milestone 0 — Critical Infrastructure Stabilization
**Duration:** 2 weeks  
**Goal:** Eliminate all Critical and highest-risk High findings before any user acquisition  
**Team:** 1 full-stack developer (CTO)

### M0.1 — Fix Subscription Auto-Creation Trigger

**Priority:** P0 — Blocking  
**Effort:** 2 hours  
**Risk:** Low  

**Problem:** New users may not have a subscription record, breaking every subscription check in the app.

**Task:** Run the following SQL in Supabase SQL Editor (production project):

```sql
-- Verify trigger exists
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'users'
AND trigger_schema = 'auth';

-- If missing, create it:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

**Testing:**
- Register new test account
- Verify `user_profiles` row created
- Verify `subscriptions` row created with plan='free'

**Rollback:** DROP TRIGGER if causing insert failures (unlikely — uses ON CONFLICT DO NOTHING)

---

### M0.2 — Replace Background Fetch with Inngest Queue

**Priority:** P0 — Blocking  
**Effort:** 1 day  
**Risk:** Medium (architectural change)  
**Dependencies:** Inngest account + API key  

**Problem:** `background fetch()` from one Vercel function to another is unreliable. On Vercel Hobby, the 60-second function timeout kills long story generations silently.

**Implementation Plan:**

1. Install Inngest SDK: `npm install inngest`

2. Create `src/inngest/client.ts`:
```typescript
import { Inngest } from 'inngest'
export const inngest = new Inngest({ id: 'hikayati' })
```

3. Create `src/inngest/functions/generate-story.ts` — move all pipeline logic from `/api/internal/generate` into a durable Inngest function with step-level retries.

4. Create `src/app/api/inngest/route.ts` — Inngest webhook endpoint.

5. Update `/api/stories/generate` to call `inngest.send()` instead of `fetch('/api/internal/generate')`.

6. Keep `/api/internal/generate` as deprecated fallback for 1 week, then delete.

**Testing:**
- Generate story end-to-end in preview environment
- Verify job completes successfully in Inngest dashboard
- Verify SSE progress updates still work
- Test story generation at 90+ seconds (should not timeout)

**Rollback:** Revert `/api/stories/generate` to use background fetch. Keep both routes deployed during transition.

---

### M0.3 — Add Rate Limiting

**Priority:** P0 — Security  
**Effort:** 4 hours  
**Risk:** Low  
**Dependencies:** Upstash Redis account  

**Implementation:**

1. Install: `npm install @upstash/ratelimit @upstash/redis`

2. Add env vars: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

3. Create `src/lib/rate-limit.ts`:
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const loginRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  prefix: 'rl:login',
})

export const registerRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '60 s'),
  prefix: 'rl:register',
})

export const generateRateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '60 s'),
  prefix: 'rl:generate',
})
```

4. Apply in middleware (for login/register) and in `/api/stories/generate`.

**Testing:**
- Attempt login 6 times in 60 seconds → 429 on 6th attempt
- Verify error message is user-friendly (Arabic)

**Rollback:** Remove middleware rate limit check. Does not affect DB or existing data.

---

### M0.4 — Upgrade Vercel + Groq Plans

**Priority:** P0 — Infrastructure  
**Effort:** 1 hour (account management)  
**Risk:** None  

**Actions:**
1. Upgrade Vercel from Hobby ($0) to Pro ($20/month) — removes 60-second function timeout
2. Upgrade Groq from Free to Developer tier (~$0.59/1M tokens) — removes 14,400 token/day limit
3. Add OpenAI billing with $20 credit for DALL-E 3 images

**Verification:**
- Deploy story generation
- Confirm it runs beyond 60 seconds without 504
- Generate story with images → verify cover + page images appear

---

### Milestone 0 Summary

| Task | Effort | Risk | Impact |
|------|--------|------|--------|
| M0.1 Subscription trigger | 2h | Low | Critical fix |
| M0.2 Inngest queue | 1d | Medium | Eliminates silent failures |
| M0.3 Rate limiting | 4h | Low | Security |
| M0.4 Upgrade plans | 1h | None | Enables real usage |
| **Total** | **~3 days** | | |

**Go/No-Go:** All 4 tasks must complete before user acquisition begins.

---

## Milestone 1 — Stable MVP (Core Missing Features)
**Duration:** 4 weeks  
**Goal:** Complete all "Must Have" features from PRD that are currently missing  
**Team:** 1 developer

### M1.1 — Stories List Page (`/stories`)

**Effort:** 1 day  
**Priority:** P1  

**Problem:** Users can see 6 recent stories on dashboard but have no way to view older stories.

**Implementation:**
- Server Component: fetches stories paginated (cursor-based, 12 per page)
- "Load more" button (no infinite scroll — simpler, works without JS)
- Story card grid reusing existing `StoryCard` component
- Filter by status: complete, failed (hidden by default)

**Acceptance Criteria:**
- User can see all their completed stories, oldest to newest
- Page loads in < 1 second (server-side)
- Works with 0 stories (empty state)

---

### M1.2 — Child Profile Edit

**Effort:** 4 hours  
**Priority:** P1  

**Problem:** `PATCH /api/children/[id]` doesn't exist. Users cannot correct child profile mistakes.

**Implementation:**
- Add `PATCH /api/children/[id]` route (reuse creation validation)
- Add "Edit" button on child profile page (`/children/[id]`)
- Reuse existing child form, pre-populated with current data

---

### M1.3 — Settings Page (`/settings`)

**Effort:** 2 days  
**Priority:** P1  

**Problem:** Header links to `/settings` which returns 404. Subscription management is impossible.

**Sections:**
1. **Profile** — Update display name, dialect preference
2. **Subscription** — Current plan, next billing date, "Cancel" button, "Upgrade" link
3. **Security** — Change password
4. **Account** — Delete account (with confirmation)

**New API routes required:**
- `PATCH /api/settings` — Update user profile
- `GET /api/subscriptions/portal` — Stripe customer portal redirect

---

### M1.4 — Password Reset Flow

**Effort:** 4 hours  
**Priority:** P1  

**Implementation:**
- "Forgot password?" link on login page → `/forgot-password`
- Supabase `resetPasswordForEmail()` sends the email
- `/reset-password?token=xxx` page handles token + new password
- Supabase handles token verification automatically

---

### M1.5 — React Error Boundaries

**Effort:** 3 hours  
**Priority:** P1  

**Implementation:**
- Create `src/components/ui/error-boundary.tsx` — class component with `getDerivedStateFromError`
- Wrap every page in `(app)/layout.tsx` with the error boundary
- Show user-friendly Arabic error message with "retry" button
- Report errors to Sentry

---

### M1.6 — Welcome Email (Resend)

**Effort:** 4 hours  
**Priority:** P1  

**Implementation:**
1. Install: `npm install resend`
2. Create `src/lib/email/client.ts` — Resend client
3. Create `src/lib/email/templates/welcome.tsx` — React Email template (Arabic)
4. Call `resend.emails.send()` from `/api/auth/register` after successful signup
5. Create domain-verified sender in Resend dashboard

---

### M1.7 — Story Ready Email Notification

**Effort:** 4 hours  
**Priority:** P1  

**Implementation:**
- Add `sendStoryReadyEmail()` call at the end of the Inngest story generation function
- Template: "قصة [طفلك] جاهزة! اقرأها الآن" with CTA button

---

### M1.8 — Fix DALL-E Image Persistence

**Effort:** 1 day  
**Priority:** P1  

**Problem:** DALL-E images are stored as temporary Azure Blob URLs that expire in 1 hour.

**Implementation:**
- After DALL-E generates each image, download it (`fetch(url).then(r => r.arrayBuffer())`)
- Upload to Supabase Storage: `supabase.storage.from('stories').upload(path, buffer)`
- Store the Supabase Storage URL instead of the DALL-E URL
- Add graceful fallback if upload fails (log error, store temporary URL, mark for retry)

---

### Milestone 1 Summary

| Task | Effort | Priority | Dependencies |
|------|--------|----------|-------------|
| M1.1 Stories list page | 1d | P1 | — |
| M1.2 Child edit | 4h | P1 | — |
| M1.3 Settings page | 2d | P1 | Stripe portal |
| M1.4 Password reset | 4h | P1 | Supabase email config |
| M1.5 Error boundaries | 3h | P1 | Sentry setup |
| M1.6 Welcome email | 4h | P1 | Resend domain verification |
| M1.7 Story ready email | 4h | P1 | M1.6 |
| M1.8 Image persistence | 1d | P1 | Supabase Storage bucket |
| **Total** | **~8 days** | | |

**Exit Criteria:** All "Must Have" PRD requirements satisfied. Zero 404s on any navigation link. Story generation succeeds ≥ 98%.

---

## Milestone 2 — Growth Layer
**Duration:** 6 weeks  
**Goal:** Features that drive user retention, sharing, and upgrade conversion  
**Team:** 1 developer

### M2.1 — PDF Story Download

**Effort:** 3 days  
**Priority:** P2  

**Implementation:**
- Install `@react-pdf/renderer`
- Create `src/lib/pdf/story-template.tsx` — PDF layout (RTL, Arabic font embed)
- Sections: cover page, story pages with illustrations, parent guide
- Generate PDF as part of story completion pipeline (Inngest step 9)
- Upload to Supabase Storage, update `stories.pdf_url`
- Download button calls Supabase Storage signed URL API

---

### M2.2 — Story Sharing (Public Links)

**Effort:** 2 days  
**Priority:** P2  

**Implementation:**
- Add `is_public` boolean column to stories table (migration)
- `POST /api/stories/[id]/share` — sets `is_public = true`, returns shareable URL
- Public view route: `/story/[id]` (no auth required) — shows story without parent guide
- Premium-only feature: Free users see teaser + upgrade prompt

---

### M2.3 — Admin Panel (Basic)

**Effort:** 4 days  
**Priority:** P2  

**Sections (Phase 1):**
- `/admin/overview` — KPI cards: users, stories today, active subscriptions, AI cost today
- `/admin/users` — Table of all users with plan, join date, story count
- `/admin/jobs` — Recent generation jobs with status, duration, cost, error message

**Access Control:**
- Add `role` column to `user_profiles` with default `'user'`
- Set `role = 'admin'` for Hassan's user ID directly in DB
- Middleware blocks `/admin/*` for non-admins

---

### M2.4 — Story Favorites

**Effort:** 4 hours  
**Priority:** P2  

**Implementation:**
- `PATCH /api/stories/[id]` with `{ is_favorite: true/false }`
- Heart icon toggle on story card and story view
- Dashboard: show "Favorites" section if any exist

---

### M2.5 — Improve Dashboard (Server Component)

**Effort:** 2 days  
**Priority:** P2  

**Refactor dashboard from Client Component to Server Component:**
- `createClient()` server-side in layout
- `Promise.all()` for all 4 data fetches
- No loading spinner — data ready on first paint
- Pass data down to minimal client components (only interactive parts)

---

### M2.6 — Child Milestone Tracking

**Effort:** 3 days  
**Priority:** P2  

**Implementation:**
- After each story generation, Inngest step writes to `development_entries`
- Entry records which goals were addressed for which child
- `/children/[id]` shows a progress chart (using Recharts — already in package.json)
- Milestones: "5 stories", "All goals tried", "10 bravery stories" etc.

---

### Milestone 2 Summary

| Task | Effort | Dependencies |
|------|--------|-------------|
| M2.1 PDF download | 3d | M1.8 (image persistence) |
| M2.2 Story sharing | 2d | — |
| M2.3 Admin panel | 4d | M0.4 (role column) |
| M2.4 Favorites | 4h | — |
| M2.5 Dashboard refactor | 2d | — |
| M2.6 Milestone tracking | 3d | — |
| **Total** | **~15 days** | |

---

## Milestone 3 — Reliability & Scale
**Duration:** 8 weeks  
**Goal:** Prepare infrastructure for 10,000 users and 1,000 stories/day  
**Team:** 1 developer + DevOps support

### M3.1 — Prompt Versioning System

**Effort:** 3 days  
**Priority:** P3  

**Problem:** Agent prompts are hardcoded in source files. Cannot A/B test or update without deployment.

**Implementation:**
- Store prompts in a database table: `prompt_templates(id, agent_id, version, content, is_active)`
- Load prompts at runtime from DB with 5-minute in-memory cache
- Admin panel: view/edit active prompts, activate new version

---

### M3.2 — AI Provider Fallback

**Effort:** 2 days  
**Priority:** P3  

**Implementation:**
- Add OpenAI GPT-4o as fallback for all Groq text generation calls
- If Groq returns 5xx (not 429): switch to OpenAI for that request
- Log provider selection for cost analysis
- Circuit breaker: if Groq down for 5 minutes, switch all traffic to OpenAI

---

### M3.3 — Audio Narration (ElevenLabs)

**Effort:** 4 days  
**Priority:** P3  
**Gate:** OpenAI image credits working + Groq stable  

**Implementation:**
- Add ElevenLabs Arabic voice narration as optional story feature
- Inngest step 9: Generate audio from story body (premium+ only)
- Upload MP3 to Supabase Storage
- Audio player on story view page

---

### M3.4 — Monitoring & Alerting Setup

**Effort:** 2 days  
**Priority:** P3  

**Implementation:**
1. Install Sentry Next.js SDK
2. Create `sentry.server.config.ts` + `sentry.client.config.ts`
3. Wrap Inngest functions with Sentry error capture
4. Set up Uptime Robot for hikayati-nine.vercel.app
5. Set Sentry alerts: error rate > 5 errors/minute → email

---

### M3.5 — Performance Optimization

**Effort:** 3 days  
**Priority:** P3  

**Tasks:**
1. Replace `useEffect` auth in all pages with Server Component layout-level auth
2. Replace all direct Supabase client calls with React Query hooks (proper caching)
3. Add skeleton loaders for all loading states
4. Optimize Google Fonts loading via `next/font`
5. Add `loading.tsx` files for all page routes

---

### Milestone 3 Summary

| Task | Effort | Dependencies |
|------|--------|-------------|
| M3.1 Prompt versioning | 3d | Admin panel |
| M3.2 AI fallback | 2d | — |
| M3.3 Audio narration | 4d | ElevenLabs account |
| M3.4 Monitoring | 2d | Sentry account |
| M3.5 Performance | 3d | — |
| **Total** | **~14 days** | |

---

## Milestone 4 — Platform Expansion
**Duration:** 10 weeks  
**Goal:** New revenue streams, mobile, and API ecosystem  
**Team:** 2 developers

### M4.1 — Mobile App (PWA First, then React Native)

**Effort:** 4 weeks  
**Priority:** P4  

**Phase 1:** Progressive Web App
- Add `manifest.json` and service worker
- "Add to Home Screen" prompt for iOS/Android
- Offline reading of downloaded stories

**Phase 2:** React Native (separate codebase)
- Shared API layer with web
- Native push notifications for story ready

---

### M4.2 — Referral & Gift Card System

**Effort:** 1 week  
**Priority:** P4  

**Implementation:**
- Referral code per user (`user_profiles.referral_code` = UUID slug)
- Referral tracking: `/register?ref=XXXXX` stores referrer in DB
- Credit system: referrer gets 1 free story credit per paid conversion
- Gift cards via Stripe (pre-defined SKUs)

---

### M4.3 — AI Story Recommendations

**Effort:** 1 week  
**Priority:** P4  

**Implementation:**
- After each story, Inngest generates 3 recommendations for next story (different goal, same child)
- Recommendations appear on story completion screen and dashboard
- Populates the existing `story_recommendations` table

---

### M4.4 — Professional / School Plan Features

**Effort:** 2 weeks  
**Priority:** P4  

**Implementation:**
- Bulk story generation API (up to 50 stories at once)
- Classroom view: teacher sees all student profiles
- Custom school branding on PDFs
- Monthly usage report email

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Groq API changes pricing or limits | Medium | High | Maintain OpenAI fallback, abstract provider |
| Vercel cold starts increase latency | Low | Medium | Warm-up cron job, consider Fly.io for pipeline |
| Supabase outage | Low | High | Monitor, PITR ready, display maintenance page |
| DALL-E image generation costs exceed budget | Medium | High | Per-user daily image limit, skip for free tier |
| AI-generated content fails cultural review | Low | High | Human editorial review layer for QA agents |
| Stripe payment failure rate spikes | Low | High | Inngest retry for webhook processing |
| Child data privacy compliance (GDPR/COPPA) | Medium | Critical | Legal review, consent flows, data deletion |

---

## Testing Requirements Per Milestone

### Milestone 0 Testing
- [ ] New user registration creates profile + subscription (automated test)
- [ ] Story generation completes end-to-end without timeout
- [ ] Rate limiting blocks 6th login attempt per minute
- [ ] Groq retry succeeds on simulated 429 response

### Milestone 1 Testing
- [ ] Stories list paginates correctly at 13+ stories
- [ ] Child profile edit saves all fields correctly
- [ ] Settings page shows correct subscription plan
- [ ] Password reset flow completes successfully
- [ ] Error boundary catches simulated JS error without blank screen
- [ ] Welcome email arrives within 60 seconds of registration
- [ ] DALL-E images persist in Supabase Storage after 2 hours

### Milestone 2 Testing
- [ ] PDF downloads as valid file with Arabic text rendered correctly
- [ ] Public story link accessible without login
- [ ] Admin panel accessible only to admin role
- [ ] Favorites toggle persists across sessions

### Milestone 3 Testing
- [ ] AI fallback activates when Groq returns 503
- [ ] Story generation succeeds when Groq is down (GPT-4o fallback)
- [ ] Sentry captures unhandled errors with user context
- [ ] Dashboard loads server-side with no loading spinner

---

## Deployment Plan Per Milestone

### Milestone 0 Deployment
1. Run M0.1 SQL directly in Supabase dashboard (no code deploy)
2. Deploy M0.2 (Inngest) to preview → test → promote to production
3. Deploy M0.3 (rate limiting) with env vars set in Vercel
4. Account upgrades (M0.4) — no deployment needed

### Milestone 1 Deployment
- Deploy all M1 tasks in a single release after local testing
- Feature flag: `/stories` page behind `isLoggedIn` check only (no additional gate)
- Monitor Vercel logs for 24h post-deploy

### Milestone 2+ Deployment
- Weekly release cadence
- Preview deployment reviewed before production promotion
- Database migrations tested on staging before production

---

## Rollback Plan Per Milestone

| Milestone | Rollback Method | Time to Rollback |
|-----------|----------------|-----------------|
| M0.2 (Inngest) | Re-enable background fetch in generate route | 5 minutes |
| M0.3 (Rate limit) | Remove rate limit check from middleware | 5 minutes |
| M1.3 (Settings) | Remove route — causes 404, no data corruption | 2 minutes |
| M2.3 (Admin) | Remove `/admin` routes — no impact on users | 2 minutes |
| M3.1 (Prompts) | Set `is_active = false` for new prompt version | 1 minute (DB change) |
| Any failed deployment | Vercel Dashboard → Promote previous deployment | 30 seconds |

---

## Resource & Cost Projection

### Monthly Infrastructure Costs (Target State)

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Vercel | Pro | $20 |
| Supabase | Pro | $25 |
| Groq | Developer | ~$30 (est. 50M tokens) |
| OpenAI | Pay-as-you-go | ~$20 (est. 500 images) |
| Inngest | Free (up to 50k events) | $0 |
| Resend | Free (up to 3k emails) | $0 |
| Upstash Redis | Pay-per-use | ~$5 |
| Sentry | Free tier | $0 |
| **Total** | | **~$100/month** |

### Break-Even Analysis

At $14.99/month average plan:
- 7 paying users covers all infrastructure costs
- Milestone 0 must complete before targeting any user acquisition

---

*Roadmap subject to revision after each milestone retrospective. All timelines assume 1 full-time developer working 6–8 hours/day.*
