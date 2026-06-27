# Product Requirements Document — Hikayati Platform
**Version:** 2.0 (Post-Audit Update)  
**Date:** 2026-06-26  
**Status:** Active — Pending Phase 4 Implementation  
**Owner:** Product & Engineering Leadership

---

## 1. Business Goals

### 1.1 Vision
Hikayati is the Arabic world's first AI-powered personalized children's story platform. Every child becomes the hero of their own story — culturally authentic, educationally designed, instantly generated.

### 1.2 Mission
To eliminate the Arabic children's content desert by making professional-quality, personalized Arabic stories accessible to every family, regardless of geography or income.

### 1.3 Business Objectives

| Objective | Target | Horizon |
|-----------|--------|---------|
| Paying subscribers | 1,000 | Month 6 |
| Paying subscribers | 10,000 | Month 18 |
| Monthly Recurring Revenue | $22,000 | Month 12 |
| Monthly Recurring Revenue | $220,000 | Month 24 |
| Stories generated per month | 5,000 | Month 6 |
| Stories generated per month | 100,000 | Month 24 |
| Geographic markets | GCC-first | Launch |
| Geographic markets | Pan-Arab | Month 12 |
| NPS score | ≥ 60 | Ongoing |
| Story generation success rate | ≥ 98% | Production |

### 1.4 Revenue Model

| Plan | Price (USD) | Stories/Month | Children | Target Segment |
|------|-------------|--------------|----------|---------------|
| Free | $0 | 1 | 1 | Acquisition / trial |
| Premium | $14.99/mo | Unlimited | 1 | Single-child families |
| Family Plus | $24.99/mo | Unlimited | 5 | Multi-child families |
| Professional | $79/mo | Unlimited | 50 | Schools / tutors |

---

## 2. Functional Requirements

### 2.1 User Authentication

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-AUTH-01 | Users can register with email and password | Must Have | ✅ Done |
| FR-AUTH-02 | Users can sign in with Google OAuth | Must Have | ✅ Done |
| FR-AUTH-03 | Users remain logged in across sessions | Must Have | ✅ Done |
| FR-AUTH-04 | Users can reset their password via email | Must Have | ❌ Missing |
| FR-AUTH-05 | Users can delete their account and all data | Must Have | ❌ Missing |
| FR-AUTH-06 | Users can update their email address | Should Have | ❌ Missing |

### 2.2 Child Profile Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-CHILD-01 | Users can create a child profile with name, age, gender, country | Must Have | ✅ Done |
| FR-CHILD-02 | Users can add hobbies, favorite color, favorite animal | Must Have | ✅ Done |
| FR-CHILD-03 | Users can edit an existing child profile | Must Have | ❌ Missing |
| FR-CHILD-04 | Users can upload a child photo/avatar | Should Have | ❌ Missing (column exists) |
| FR-CHILD-05 | Subscription limits enforced on child count | Must Have | ✅ Done |
| FR-CHILD-06 | Users can deactivate (soft-delete) a child profile | Must Have | ✅ Done |

### 2.3 Story Generation

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-STORY-01 | 5-step guided wizard for story creation | Must Have | ✅ Done |
| FR-STORY-02 | Parent advisor analysis (challenge → goal recommendation) | Should Have | ✅ Done |
| FR-STORY-03 | Select up to 3 developmental goals | Must Have | ✅ Done |
| FR-STORY-04 | Select story style (10 options) | Must Have | ✅ Done |
| FR-STORY-05 | Select Arabic dialect (5 options) | Must Have | ✅ Done |
| FR-STORY-06 | Real-time generation progress display | Must Have | ✅ Done |
| FR-STORY-07 | Story generated in < 90 seconds | Must Have | ✅ Done (locally) |
| FR-STORY-08 | Story generation succeeds ≥ 98% of the time | Must Have | ⚠️ At risk (Vercel timeout) |
| FR-STORY-09 | Free tier limited to 1 story per month | Must Have | ✅ Done |
| FR-STORY-10 | Illustrations generated for story (cover + pages) | Should Have | ⚠️ Requires OpenAI credits |

### 2.4 Story Reading & Management

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-READ-01 | Users can read their generated story | Must Have | ✅ Done |
| FR-READ-02 | Story displays illustrations between paragraphs | Should Have | ⚠️ Requires OpenAI credits |
| FR-READ-03 | Users can view their full story history | Must Have | ❌ Missing (/stories page) |
| FR-READ-04 | Users can download story as PDF | Should Have | ❌ Missing (button exists) |
| FR-READ-05 | Users can mark a story as favorite | Nice to Have | ❌ Missing (column exists) |
| FR-READ-06 | Users can share a story via public link | Should Have | ❌ Missing |
| FR-READ-07 | Users can delete a story | Should Have | ❌ Missing |
| FR-READ-08 | Audio narration of the story | Nice to Have | ❌ Not started |

### 2.5 Parent Guide

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-GUIDE-01 | Every story includes a structured parent guide | Must Have | ✅ Done |
| FR-GUIDE-02 | Guide includes lesson summary, discussion questions, activities | Must Have | ✅ Done |
| FR-GUIDE-03 | Guide is collapsible in the story view | Should Have | ✅ Done |
| FR-GUIDE-04 | Guide is included in the PDF download | Should Have | ❌ Missing (PDF not built) |

### 2.6 Subscriptions & Billing

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-SUB-01 | Users can upgrade to Premium via Stripe | Must Have | ✅ Done |
| FR-SUB-02 | Users can upgrade to Family Plus via Stripe | Must Have | ✅ Done |
| FR-SUB-03 | Stripe webhooks update subscription state | Must Have | ✅ Done |
| FR-SUB-04 | Users can view their current subscription | Must Have | ❌ Missing (/settings) |
| FR-SUB-05 | Users can cancel their subscription | Must Have | ❌ Missing |
| FR-SUB-06 | Users receive email on subscription change | Should Have | ❌ Missing |
| FR-SUB-07 | Subscription state auto-created on signup | Must Have | ⚠️ Trigger may not be deployed |

### 2.7 User Settings

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-SET-01 | Users can update their display name | Must Have | ❌ Missing |
| FR-SET-02 | Users can change their preferred dialect | Should Have | ❌ Missing |
| FR-SET-03 | Users can view and manage their subscription | Must Have | ❌ Missing |
| FR-SET-04 | Users can change their password | Must Have | ❌ Missing |
| FR-SET-05 | Users can request account deletion | Must Have | ❌ Missing |

### 2.8 Admin Panel

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-ADMIN-01 | Admins can view all users and their subscription status | Must Have | ❌ Missing |
| FR-ADMIN-02 | Admins can view total stories generated per day/month | Must Have | ❌ Missing |
| FR-ADMIN-03 | Admins can view AI pipeline costs (tokens, USD) | Must Have | ❌ Missing |
| FR-ADMIN-04 | Admins can view failed generation jobs and error reasons | Must Have | ❌ Missing |
| FR-ADMIN-05 | Admins can manually override a user's subscription plan | Should Have | ❌ Missing |
| FR-ADMIN-06 | Admins can view revenue metrics (MRR, churn, ARPU) | Should Have | ❌ Missing |
| FR-ADMIN-07 | Admins can view generation quality scores over time | Nice to Have | ❌ Missing |
| FR-ADMIN-08 | Admins can toggle maintenance mode | Should Have | ❌ Missing |

### 2.9 Notifications & Email

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-EMAIL-01 | Welcome email sent on registration | Must Have | ❌ Missing |
| FR-EMAIL-02 | Story ready notification when generation completes | Should Have | ❌ Missing |
| FR-EMAIL-03 | Subscription confirmation email | Must Have | ❌ Missing |
| FR-EMAIL-04 | Password reset email | Must Have | ❌ Missing |
| FR-EMAIL-05 | Payment failed notification | Must Have | ❌ Missing |

---

## 3. Non-Functional Requirements

### 3.1 Performance

| NFR | Requirement | Measurement |
|-----|-------------|-------------|
| NFR-PERF-01 | Page load time (LCP) < 2.5 seconds | Lighthouse / Core Web Vitals |
| NFR-PERF-02 | Story generation starts feedback within 3 seconds of submit | User-perceived response time |
| NFR-PERF-03 | Story generation completes within 90 seconds (p95) | Server-side timing |
| NFR-PERF-04 | API endpoints (non-generation) respond in < 500ms (p95) | Vercel Analytics |
| NFR-PERF-05 | Dashboard loads with < 3 Supabase queries | Query count monitoring |
| NFR-PERF-06 | System supports 100 concurrent story generations | Load testing |

### 3.2 Reliability

| NFR | Requirement | Measurement |
|-----|-------------|-------------|
| NFR-REL-01 | Story generation success rate ≥ 98% | Failure rate in generation_jobs table |
| NFR-REL-02 | Platform uptime ≥ 99.5% | Vercel / external uptime monitor |
| NFR-REL-03 | No data loss on generation failure | Failed stories marked, not deleted |
| NFR-REL-04 | Stripe webhook idempotency (no duplicate subscription updates) | Stripe event ID dedup |

### 3.3 Security

| NFR | Requirement | Measurement |
|-----|-------------|-------------|
| NFR-SEC-01 | All user data isolated by Row-Level Security | RLS policy audit |
| NFR-SEC-02 | No child PII sent to third parties without disclosure | Privacy policy + data audit |
| NFR-SEC-03 | Authentication endpoints rate-limited | ≤ 5 attempts/minute/IP |
| NFR-SEC-04 | HTTPS enforced on all endpoints | Vercel enforced |
| NFR-SEC-05 | Stripe webhook signature verified on every event | Code review |
| NFR-SEC-06 | Admin panel accessible only to users with `role = 'admin'` | RLS + middleware check |

### 3.4 Scalability

| NFR | Requirement | Measurement |
|-----|-------------|-------------|
| NFR-SCALE-01 | Architecture supports 10,000 registered users | Load and connection testing |
| NFR-SCALE-02 | Architecture supports 1,000 stories/day | Queue throughput testing |
| NFR-SCALE-03 | Database can store 1M stories without degradation | Query performance testing |
| NFR-SCALE-04 | AI costs scale linearly (no surprise bills) | Cost monitoring dashboard |

### 3.5 Accessibility & Localization

| NFR | Requirement | Measurement |
|-----|-------------|-------------|
| NFR-A11Y-01 | Full RTL layout for Arabic UI | Visual audit |
| NFR-A11Y-02 | Arabic typography optimized (Cairo / Noto Sans Arabic) | Font rendering test |
| NFR-A11Y-03 | Sufficient color contrast (WCAG AA) | Automated contrast check |
| NFR-A11Y-04 | Mobile-first responsive design | Viewport testing on iPhone, Android |
| NFR-A11Y-05 | Story content culturally appropriate for target market | Editorial review |

---

## 4. Technical Requirements

### 4.1 Infrastructure Requirements

| Component | Requirement | Justification |
|-----------|-------------|---------------|
| Hosting | Vercel Pro | 300s function timeout, higher bandwidth |
| Database | Supabase Pro | 8GB DB, 250GB storage, 500 connections |
| AI – Text | Groq Developer Tier | > 14,400 tokens/day limit |
| AI – Images | OpenAI Pay-as-you-go | DALL-E 3: ~$0.04/image |
| Job Queue | Inngest or Trigger.dev | Reliable async story generation |
| Email | Resend | Already configured, $20/month for 100k emails |
| Rate Limiting | Upstash Redis | $10/month, integrates with Next.js |
| Monitoring | Sentry + Vercel Analytics | Error tracking + performance |
| Storage | Supabase Storage | Story PDFs and audio files |

### 4.2 API Design Requirements

- All API routes follow REST conventions
- All request bodies validated with Zod schemas
- All responses return consistent `{ data, error }` envelope
- All authenticated routes return 401 (not redirect) on missing auth
- Pagination uses cursor-based approach for story lists
- Rate limiting on all public endpoints

### 4.3 AI Pipeline Requirements

- Generation jobs managed by a durable queue (not fire-and-forget fetch)
- Each agent failure is retried independently (not the whole pipeline)
- Token usage logged accurately from API responses
- Prompt templates versioned and stored outside source code
- Quality score threshold (85) configurable without deployment

---

## 5. User Roles & Permissions

### 5.1 Role Definitions

| Role | Description | Access Level |
|------|-------------|-------------|
| `anonymous` | Unauthenticated visitor | Landing page, login, register |
| `user_free` | Registered, free plan | 1 story/month, 1 child |
| `user_premium` | Premium subscriber | Unlimited stories, 1 child |
| `user_family` | Family Plus subscriber | Unlimited stories, 5 children |
| `user_pro` | Professional subscriber | Unlimited stories, 50 children |
| `admin` | Platform operator | All data, admin panel |

### 5.2 Permission Matrix

| Feature | Anonymous | Free | Premium | Family | Pro | Admin |
|---------|-----------|------|---------|--------|-----|-------|
| View landing page | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create account | ✅ | — | — | — | — | — |
| Create child profile | — | 1 | 1 | 5 | 50 | ∞ |
| Generate story | — | 1/mo | ∞ | ∞ | ∞ | ∞ |
| View own stories | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Download PDF | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| Share story | — | — | ✅ | ✅ | ✅ | ✅ |
| Audio narration | — | — | ✅ | ✅ | ✅ | ✅ |
| View admin panel | — | — | — | — | — | ✅ |
| Override subscriptions | — | — | — | — | — | ✅ |

---

## 6. Future Roadmap

### Quarter 1 (Post-Launch Stabilization)
- Fix all Critical and High findings from Technical Audit
- Build /stories list page and /settings page
- Implement PDF generation
- Add welcome and story-ready email notifications
- Deploy admin panel (basic analytics)
- Add rate limiting on all endpoints

### Quarter 2 (Growth Features)
- Story sharing (public links with view counters)
- Audio narration via ElevenLabs
- Child milestone tracking UI
- AI-powered story recommendations
- Progress tracking dashboard for parents
- A/B testing framework for AI prompts

### Quarter 3 (Monetization & Retention)
- Annual billing discount (save 20%)
- Gift cards and referral program
- Story collections and series
- Classroom / teacher mode (bulk story generation)
- Parent community features
- Weekly story digest email

### Quarter 4 (Platform Expansion)
- Mobile app (React Native / Expo)
- Offline story download (PWA)
- Multi-language support (English story summaries for non-Arabic parents)
- API access for educational publishers (Professional tier)
- White-label option for schools

---

## 7. KPIs & Success Metrics

### 7.1 North Star Metric
**Stories generated per month** — the single most important indicator of product-market fit and platform health.

### 7.2 Acquisition KPIs
| Metric | Month 3 | Month 6 | Month 12 |
|--------|---------|---------|---------|
| Registered users | 500 | 2,000 | 10,000 |
| Free → Paid conversion | 8% | 10% | 12% |
| CAC (paid channel) | < $30 | < $25 | < $20 |

### 7.3 Engagement KPIs
| Metric | Target |
|--------|--------|
| D7 retention | ≥ 35% |
| D30 retention | ≥ 20% |
| Stories per active user per month | ≥ 3 |
| Time spent reading story | ≥ 4 minutes |
| Parent guide engagement rate | ≥ 40% |

### 7.4 Revenue KPIs
| Metric | Month 6 | Month 12 |
|--------|---------|---------|
| MRR | $5,000 | $22,000 |
| ARPU (paying users) | $18 | $20 |
| Churn rate (monthly) | < 8% | < 5% |
| LTV:CAC ratio | > 3:1 | > 4:1 |

### 7.5 Technical KPIs
| Metric | Target |
|--------|--------|
| Story generation success rate | ≥ 98% |
| Story generation p95 latency | ≤ 90 seconds |
| API error rate (non-generation) | < 0.5% |
| Platform uptime | ≥ 99.5% |
| QA score average | ≥ 85/100 |

---

## 8. Acceptance Criteria

### Epic: Story Generation
- **AC-GEN-01:** Given a valid child profile and selected goals, when the user submits the story wizard, then a story is generated and visible in < 90 seconds in 98% of cases.
- **AC-GEN-02:** Given a Groq rate limit is hit, when the pipeline retries, then the story completes without user-visible error.
- **AC-GEN-03:** Given the user is on the free plan and has generated 1 story this month, when they attempt to generate another, then they see an upgrade prompt (not an error).

### Epic: Authentication
- **AC-AUTH-01:** Given a new user registers, then they receive a welcome email within 60 seconds.
- **AC-AUTH-02:** Given a user logs in on Vercel (production), then they are redirected to /dashboard within 3 seconds.
- **AC-AUTH-03:** Given a logged-in session expires, when the user navigates to a protected page, then they are redirected to /login without a blank screen.

### Epic: Payments
- **AC-PAY-01:** Given a user upgrades to Premium, when the Stripe payment succeeds, then their plan is updated to 'premium' within 10 seconds (webhook processing time).
- **AC-PAY-02:** Given a Stripe webhook arrives with an invalid signature, then it is rejected with 400 and logged.
- **AC-PAY-03:** Given a subscription is canceled, then the user retains premium access until the current period ends.

### Epic: Admin Panel
- **AC-ADMIN-01:** Given an admin logs in, then they can view a dashboard showing total users, stories today, and current MRR.
- **AC-ADMIN-02:** Given an admin is logged in, then pages under /admin are inaccessible to regular users (401/redirect).

---

*Document reflects system state as of 2026-06-26. Updated from v1.0 PRD based on Technical Audit findings.*
