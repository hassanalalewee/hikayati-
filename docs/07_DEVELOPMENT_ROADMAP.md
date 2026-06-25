# Hikayati — Development Roadmap

**Version:** 1.0 | **Date:** 2026-06-13

---

## ROADMAP PHILOSOPHY

We follow a **"Valuable Slice"** methodology: each phase delivers a complete, valuable user experience before adding complexity. We prioritize the Story Creation Engine above all else — it is the core product.

---

## PHASE 0 — FOUNDATION (Weeks 1–2)

**Goal:** Infrastructure setup, team alignment, no user-facing features.

### Engineering
- [ ] Monorepo setup (Turborepo)
- [ ] Next.js 15 app with RTL configuration
- [ ] Supabase project (auth, database, storage)
- [ ] Database migrations (all core tables)
- [ ] Row Level Security policies
- [ ] Vercel deployment pipeline (dev/staging/prod)
- [ ] CI/CD with GitHub Actions
- [ ] Environment variable management (Vercel + local)
- [ ] Upstash Redis setup
- [ ] Cloudflare R2 bucket setup
- [ ] Sentry error tracking
- [ ] Domain + SSL (hikayati.ai)

### Design
- [ ] Design system in Figma (colors, typography, RTL components)
- [ ] Landing page design
- [ ] Story creation wizard design
- [ ] Dashboard design
- [ ] Mobile-first wireframes approved

### AI
- [ ] All API keys provisioned (Claude, OpenAI, ElevenLabs)
- [ ] Agent prompt library — first drafts
- [ ] Pipeline context schema defined
- [ ] Test harness for story quality evaluation

**Milestone:** First story generated in staging environment

---

## PHASE 1 — MVP (Weeks 3–8)

**Goal:** Launch with paying customers. Core story creation loop fully functional.

### Week 3–4: Story Engine
- [ ] All 12 agents implemented and tested
- [ ] Story generation pipeline (end-to-end)
- [ ] Queue system (BullMQ) for async generation
- [ ] SSE progress updates (real-time status)
- [ ] Illustration generation (DALL-E 3, 10 pages)
- [ ] Cover generation
- [ ] PDF generation (print-ready)
- [ ] Story stored in Supabase + assets in R2

### Week 5: User System
- [ ] Authentication (email + Google + Apple)
- [ ] User profile creation
- [ ] Child profile system (create/edit/delete)
- [ ] Photo upload for child profile
- [ ] RTL dashboard (child profiles, story library)
- [ ] Free tier quota enforcement (1 story/month)

### Week 6: Payments
- [ ] Stripe integration (checkout + webhooks)
- [ ] Premium + Family Plus subscription plans
- [ ] Subscription status enforcement (story limits)
- [ ] Customer portal (cancel/upgrade)
- [ ] Mollie integration (GCC/Middle East payments)
- [ ] Pricing page (RTL)

### Week 7: Story Experience
- [ ] In-browser story reader (book mode)
- [ ] PDF download
- [ ] Story library page
- [ ] Favorite/save stories
- [ ] Basic parent guide display

### Week 8: Polish + Launch
- [ ] Landing page (Arabic SEO-ready)
- [ ] Onboarding email sequence (Resend)
- [ ] Arabic + English legal pages
- [ ] Mobile responsive (all screens)
- [ ] Performance optimization (LCP < 2s)
- [ ] Soft launch to 100 beta users
- [ ] Analytics (PostHog)

**Milestone:** $1,000 MRR from paying subscribers

---

## PHASE 2 — GROWTH (Weeks 9–16)

**Goal:** Add audio, AI advisor, growth tracking. Reduce churn with engagement features.

### Week 9–10: Audio + Advisor
- [ ] ElevenLabs Arabic narration integration
- [ ] Multiple voice options (male/female/child)
- [ ] Audio player in story viewer
- [ ] AI Parenting Advisor (pre-story consultation)
- [ ] Advisor session storage + link to story

### Week 11–12: Growth System
- [ ] Development tracking per child (all 15 categories)
- [ ] Development scores updated after each story
- [ ] Growth dashboard (radar chart)
- [ ] Monthly PDF report generation
- [ ] Milestone system (20 badge types)
- [ ] Badge celebration modal

### Week 13–14: Recommendations + Gamification
- [ ] Smart recommendation engine
- [ ] "Next story" suggestions with reasoning
- [ ] Reading challenges
- [ ] Streak tracking
- [ ] Child achievement board

### Week 15–16: Scale + SEO
- [ ] Arabic SEO optimization (story landing pages)
- [ ] Blog system (parenting content)
- [ ] Programmatic SEO (goal × style × age combinations)
- [ ] Social sharing images (per story)
- [ ] Referral system
- [ ] WhatsApp sharing integration

**Milestone:** 1,000 paid subscribers, $15K MRR

---

## PHASE 3 — SCALE (Weeks 17–28)

**Goal:** Multiple child profiles, family features, professional tier.

### Week 17–20: Family Features
- [ ] Family Plus tier features
- [ ] Multi-child management (up to 5)
- [ ] Family library (shared stories)
- [ ] Family reading challenges
- [ ] Collaborative reading sessions

### Week 21–24: Professional Tier
- [ ] Professional dashboard (teachers/therapists)
- [ ] Bulk story generation
- [ ] Class/group management
- [ ] Progress exports (CSV, PDF)
- [ ] Basic API access (rate-limited)
- [ ] Institutional billing

### Week 25–28: Physical Products
- [ ] Print-on-demand integration (MagCloud or local POD)
- [ ] Hardcover book ordering
- [ ] Custom illustrated book design
- [ ] Shipping integration (Aramex for GCC)
- [ ] Order management in dashboard

**Milestone:** 5,000 paid subscribers, $75K MRR

---

## PHASE 4 — EXPANSION (Month 7–12)

**Goal:** Expert marketplace, series system, additional languages.

- [ ] Expert marketplace (therapists, coaches)
- [ ] Story series (multi-part character arcs)
- [ ] Islamic content expansion (Seerah stories)
- [ ] Maghrebi Arabic dialect
- [ ] Partner API (white-label)
- [ ] School curriculum integration
- [ ] Offline mode (PWA)
- [ ] AR story experience (Phase 4.5)

**Milestone:** 20,000 paid subscribers, $300K MRR

---

## TEAM STRUCTURE (MVP Phase)

| Role | Count | Responsibility |
|------|-------|----------------|
| Full-Stack Engineer | 2 | Next.js, API, Supabase |
| AI Engineer | 1 | Agent development, prompts, pipeline |
| UI/UX Designer | 1 | RTL design, Figma, components |
| QA Engineer | 1 | Story quality, regression testing |
| Product Manager | 1 | Roadmap, user research, prioritization |
| Arabic Content Lead | 1 | Prompt quality, language review |

---

## TECH DEBT BUDGET

Reserve 20% of each sprint for:
- Database query optimization
- Agent prompt refinement
- Test coverage improvement
- Security hardening
- Performance profiling

---

## DEFINITION OF DONE

A feature is "Done" when:
1. Code reviewed and merged
2. Tests passing (unit + integration)
3. Mobile responsive verified
4. RTL layout correct
5. Arabic text renders properly
6. Deployed to production
7. Analytics events firing
8. No Sentry errors introduced
