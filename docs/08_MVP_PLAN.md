# Hikayati — MVP Plan

**Version:** 1.0 | **Date:** 2026-06-13

---

## MVP NORTH STAR

**One sentence:** A parent can create a personalized Arabic story for their child in under 5 minutes, receive it as a beautiful illustrated PDF, and pay for monthly access.

**MVP success = 500 paying subscribers generating 2,000+ stories/month.**

---

## MVP SCOPE (8 Weeks)

### IN SCOPE
- Story creation wizard (4 steps)
- 12-agent AI pipeline (full quality)
- 3 subscription tiers (Free, Premium, Family Plus)
- PDF export (illustrated, print-ready)
- Child profile system
- Story library
- Arabic RTL interface
- Gulf Arabic + MSA dialect
- Mobile-responsive design
- Stripe payments
- Email onboarding

### OUT OF SCOPE (deferred to v1.1+)
- Audio narration (Week 9)
- AI Parenting Advisor (Week 9)
- Growth dashboard (Week 11)
- Gamification/badges (Week 13)
- Physical book printing (Week 25)
- Professional/school tier (Week 21)
- Expert marketplace (Month 7)

---

## SPRINT PLAN

### Sprint 1 (Days 1–7): Foundation
**Owner:** Backend + DevOps

```
Day 1-2:
  - Turborepo monorepo init
  - Next.js 15 setup (App Router, RTL, TypeScript)
  - Supabase project + all tables migrated
  - Row Level Security configured
  - Vercel deploy (dev + staging)

Day 3-4:
  - Auth (email, Google, Apple)
  - User profile system
  - Child profile CRUD
  - Basic dashboard shell

Day 5-7:
  - Upstash Redis setup
  - BullMQ queue configured
  - Story generation job schema
  - Environment management
```

**Exit Criteria:** Authenticated user can create a child profile and submit a story request that enters the queue.

### Sprint 2 (Days 8–14): AI Pipeline Core
**Owner:** AI Engineer + Backend

```
Day 8-9:
  - Pipeline context object
  - Agent 1: Parent Insight Agent (Claude)
  - Agent 2: Child Psychology Agent (Claude)
  - Agent 3: Educational Specialist (GPT-4o)
  - Agent 4: Story Architect Agent (Claude Opus)

Day 10-11:
  - Story generation (Claude Opus, with few-shot library)
  - Agent 5: Language Editor Agent
  - Agent 6: Cultural Sensitivity Agent
  - Agent 7: Character Consistency Agent

Day 12-14:
  - Agent 8: Illustration Director (DALL-E 3)
  - Agent 9: Cover Design (DALL-E 3)
  - Asset upload to R2/Supabase Storage
  - Story record creation in DB
```

**Exit Criteria:** Pipeline generates a complete story with 10 illustrations and cover. Quality evaluated manually by Arabic content lead.

### Sprint 3 (Days 15–21): Story Packaging
**Owner:** Backend + AI Engineer

```
Day 15-16:
  - Agent 10: Parent Coach Agent
  - Agent 11: QA Agent (with auto-retry)
  - Agent 12: Development Planner Agent
  - Pipeline telemetry (tokens, cost, timing)

Day 17-18:
  - PDF generation (React PDF + custom template)
  - RTL PDF with Arabic fonts
  - Cover page + story pages + parent guide
  - R2 storage + CDN URL generation

Day 19-21:
  - SSE progress streaming (real-time updates)
  - Webhook to notify client on completion
  - Error handling + fallback chain
  - Queue priority (premium vs free)
```

**Exit Criteria:** Full story package (story + 10 illustrations + cover + PDF + parent guide) delivered in < 90 seconds P95.

### Sprint 4 (Days 22–28): Story Experience
**Owner:** Frontend + Designer

```
Day 22-23:
  - Story creation wizard (4 steps)
  - Goal selection UI (all 16 goals)
  - Child profile form (RTL, validation)
  - Story style selector

Day 24-25:
  - Generation progress screen (live stages)
  - Story delivery screen (reveal animation)
  - In-browser story reader (book mode)
  - Page navigation (RTL swipe)

Day 26-28:
  - PDF viewer (in-browser)
  - Download button
  - Story library (grid view)
  - Favorite/unfavorite
  - Parent guide section
```

**Exit Criteria:** Parent can complete full flow (create → generate → read → download) on mobile and desktop.

### Sprint 5 (Days 29–35): Payments + Subscriptions
**Owner:** Backend + Frontend

```
Day 29-30:
  - Stripe products + prices created
  - Checkout session creation
  - Subscription webhook handling
  - Subscription status stored in DB

Day 31-32:
  - Free tier enforcement (1 story/month)
  - Paywall modal (triggers after free story)
  - Pricing page (RTL, Arabic copy)
  - Upgrade flow from within app
  - Customer portal (manage/cancel)

Day 33-35:
  - Mollie integration (GCC card payments)
  - Family Plus plan (multiple children)
  - Subscription middleware (API protection)
  - Billing email (Resend)
```

**Exit Criteria:** A user can subscribe, generate unlimited stories, and cancel. Free tier is enforced.

### Sprint 6 (Days 36–42): Dashboard + Polish
**Owner:** Frontend + Designer

```
Day 36-37:
  - Parent dashboard (full design)
  - Multiple child profiles display
  - Recent stories carousel
  - Quick story creation button
  - Story recommendation card (static)

Day 38-39:
  - Account settings (profile, password, dialect)
  - Notification preferences
  - Mobile responsive audit (all screens)
  - RTL edge cases fixed

Day 40-42:
  - Performance optimization
  - Image lazy loading + CDN
  - LCP < 2s audit and fix
  - Error boundaries + loading states
  - Form validation (Arabic error messages)
```

**Exit Criteria:** Dashboard is polished, mobile-first, < 2s LCP.

### Sprint 7 (Days 43–49): Landing Page + SEO
**Owner:** Frontend + Designer + PM

```
Day 43-44:
  - Landing page (full Arabic copy)
  - Hero section with animated story preview
  - How it works section
  - Story examples section (3 sample stories)
  - Testimonials (beta users)

Day 45-46:
  - Pricing section (on landing page)
  - FAQ section
  - Footer (Arabic + English links)
  - Basic SEO (meta tags, OG images, schema)
  - Sitemap + robots.txt

Day 47-49:
  - Email onboarding sequence (5 emails, Resend)
  - Welcome email
  - "Create your first story" prompt
  - Story ready notification
  - Weekly story recommendation
  - PostHog analytics events
```

**Exit Criteria:** Landing page ranks for target keywords; onboarding sequence sends correctly.

### Sprint 8 (Days 50–56): Beta Launch + Hardening
**Owner:** Whole Team

```
Day 50-51:
  - Privacy Policy + Terms (Arabic + English)
  - GDPR/PDPL cookie consent
  - Security audit (RLS, auth, CORS)
  - Load testing (100 concurrent story generations)
  - Queue stress test

Day 52-53:
  - Beta user onboarding (100 users)
  - Bug bash from beta feedback
  - Arabic quality review (5 stories rated by native speakers)
  - Illustration quality review

Day 54-56:
  - Critical bug fixes
  - Final QA pass
  - Monitoring alerts configured (Betterstack)
  - Runbook written
  - Team on-call schedule
```

**Exit Criteria:** Platform handles 100 concurrent users, 0 P0 bugs, Arabic quality rated 4.5/5 by beta users.

---

## MVP QUALITY GATES

Before public launch, all of these must pass:

| Gate | Requirement | Owner |
|------|-------------|-------|
| Story Quality | 5 native Arabic speakers rate 10 stories ≥ 4.5/5 | Arabic Content Lead |
| Illustration Quality | 10 illustrations rated "children's book quality" by designer | Designer |
| Generation Speed | P95 < 90 seconds (with illustrations) | AI Engineer |
| Mobile Experience | Lighthouse mobile score > 85 | Frontend |
| Payment Flow | Stripe test + 10 real test payments succeed | Backend |
| Quota Enforcement | Free tier 1-story limit tested | QA |
| RTL Accuracy | No RTL layout bugs in any screen | Designer |
| Security | RLS tested (user A can't access user B's data) | Backend |

---

## POST-MVP IMMEDIATE PRIORITIES (Week 9+)

Based on early user feedback, we expect to prioritize:
1. Audio narration (highest requested feature in Arabic market)
2. AI Parenting Advisor (high perceived value, drives Premium conversion)
3. More dialect options (Levantine user requests)
4. WhatsApp story sharing (viral growth in GCC)
