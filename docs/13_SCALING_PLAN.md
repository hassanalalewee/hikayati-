# Hikayati — Scaling Plan

**Version:** 1.0 | **Date:** 2026-06-13

---

## 1. SCALING PHILOSOPHY

Hikayati scales across three dimensions simultaneously:
1. **User Scale:** 1K → 100K → 1M subscribers
2. **Story Scale:** 100 → 10K → 1M stories/day
3. **Geography Scale:** GCC → MENA → Global Arabic

Each dimension has distinct bottlenecks. We solve them proactively.

---

## 2. INFRASTRUCTURE SCALING TIERS

### Tier 1: 0–10K Users (MVP Infrastructure)
**Architecture:** Simple serverless, managed services

```
Traffic:        ~50 concurrent users, 500 stories/day
Infrastructure:
  - Vercel: Hobby/Pro plan ($20/month)
  - Supabase: Free/Pro ($25/month)
  - Upstash Redis: Pay-per-use (~$10/month)
  - Cloudflare R2: ~$5/month
  
Story Generation: Direct API calls, single queue
Database: Single Supabase instance, no read replicas
CDN: Vercel Edge + Cloudflare automatic
Cost: ~$300/month infra
```

### Tier 2: 10K–100K Users (Growth Infrastructure)
**Architecture:** Optimized serverless, dedicated queues

```
Traffic:        ~500 concurrent users, 5,000 stories/day
Infrastructure:
  - Vercel: Enterprise plan
  - Supabase: Team plan ($599/month)
  - Upstash Redis: Pro plan with replicas
  - Cloudflare R2: ~$50/month
  - Add: Dedicated story worker service (Fly.io)
  
Story Generation:
  - Separated worker service from web app
  - Priority queues (Premium vs Free)
  - Concurrent workers: 20
  - API rate limiting (per user, per plan)

Database:
  - Primary + 1 read replica
  - PgBouncer connection pooling
  - Supabase Edge Functions for hot paths
  
Cost: ~$2,500/month infra
```

### Tier 3: 100K–1M Users (Scale Infrastructure)
**Architecture:** Multi-region, dedicated compute

```
Traffic:        ~5,000 concurrent users, 50,000 stories/day
Infrastructure:
  - Vercel Enterprise
  - Supabase Enterprise or migrate to dedicated PostgreSQL
  - Upstash Redis Cluster
  - Cloudflare R2 (global replication)
  - Custom GPU worker fleet for illustrations (if needed)
  
Multi-Region:
  - Primary: us-east-1 (US market)
  - Secondary: eu-west-1 (Europe/diaspora)
  - GCC: AWS Bahrain (me-south-1) or local data residency

Story Generation:
  - Auto-scaling worker pool (ECS Fargate or Fly Machines)
  - Priority queue system (3 tiers)
  - Concurrent workers: 100+
  - Story generation SLA enforcement

Database:
  - Primary + 2 read replicas (geo-distributed)
  - Automated backup every 6 hours
  - Point-in-time recovery
  - Archival for old stories (Glacier equivalent)

CDN: 
  - All story assets on global CDN (Cloudflare)
  - Arabic font pre-loading
  - PDF caching (stories rarely change after generation)

Cost: ~$25,000/month infra
```

---

## 3. AI COST OPTIMIZATION STRATEGY

AI is the largest variable cost. At scale, these optimizations matter:

### Optimization 1: Prompt Caching (Immediate, -30% cost)
```typescript
// Cache system prompts (static content) using Claude's prompt caching
// System prompts are ~3,000 tokens each — cached at $0.30/M vs $3/M
// Savings: ~30% on Claude costs for analysis agents
```

### Optimization 2: Output Caching (-15% cost)
```
If two children have identical profiles + goals:
  Skip regeneration → return cached story (modified names only)
  
Cache key: hash(age + goals + style + dialect)
Story pool: maintain 50+ base stories per common combination
Name/detail injection: post-process cached story with child-specific data
```

### Optimization 3: Model Routing (-20% cost)
```
Not every agent needs Opus 4.8:

Agent 1-3 (Analysis): Claude claude-sonnet-4-6 → 5× cheaper than Opus
Agent 4 (Architect): Claude claude-sonnet-4-6 (structured output, not creative)
Agent 5-7 (Editing): Sonnet for initial pass, Opus only for rewrites
Agent 11 (QA): Sonnet is sufficient for scoring
Agent 12 (Dev Planner): Sonnet or Haiku (pattern matching)

Reserve Opus 4.8 for:
  - Story Generation (core creative work)
  - Language Editor final pass
  - QA revision regeneration
```

### Optimization 4: Illustration Batching (-10% cost)
```
Generate all 10 illustrations in one API batch request (where supported)
Use cheaper models (Flux Pro vs DALL-E 3) after quality validation
Cache illustration styles by child profile (same character design reused)
```

### Optimization 5: Audio Generation on Demand (-25% cost)
```
Don't generate audio on story creation — generate on first play
Only 60% of Premium users play audio → 40% savings
Cache audio permanently (never regenerate for same story)
```

**Combined AI cost reduction at scale: ~50% less per story**  
Target at 100K subs: ~$0.65/story (vs $1.26 at launch)

---

## 4. DATABASE SCALING STRATEGY

### Hot vs Cold Storage

```
Hot (PostgreSQL):
  - User profiles
  - Active subscriptions
  - Story metadata (last 90 days)
  - Development entries (last 6 months)
  - Active recommendations

Warm (PostgreSQL + compression):
  - Story bodies (full text)
  - Historical development data
  - Story generation logs

Cold (Object Storage — R2):
  - Story PDFs
  - All illustration images
  - Audio files
  - Monthly reports
  - Generation job logs (>30 days)
```

### Query Optimization
```sql
-- Critical indexes
CREATE INDEX idx_stories_user_child ON stories(user_id, child_id, created_at DESC);
CREATE INDEX idx_stories_status ON stories(status) WHERE status = 'generating';
CREATE INDEX idx_dev_entries_child ON development_entries(child_id, category, recorded_at DESC);
CREATE INDEX idx_subs_user ON subscriptions(user_id, status);
CREATE INDEX idx_recommendations_child ON story_recommendations(child_id, is_used, expires_at);

-- Materialized views for analytics (refreshed hourly)
CREATE MATERIALIZED VIEW child_development_scores AS
  SELECT child_id, category, AVG(score) as avg_score, COUNT(*) as entries
  FROM development_entries
  WHERE recorded_at > NOW() - INTERVAL '90 days'
  GROUP BY child_id, category;
```

---

## 5. GEOGRAPHIC SCALING

### Phase 1: GCC Hub (Month 0–12)
**Data Residency:** Supabase EU West (acceptable for GCC)
**CDN:** Cloudflare global edge

### Phase 2: Saudi Data Residency (Month 12–18)
**Requirement:** Saudi PDPL may require in-kingdom data storage
**Solution:** 
- Deploy read replica in AWS Bahrain (closest)
- Evaluate Supabase self-hosted in GCC colocation
- Work with Saudi-based cloud provider (STC Cloud)

### Phase 3: EU GDPR Compliance (Month 6)
**For EU Arabic diaspora users:**
- EU data residency (Supabase EU region)
- GDPR-compliant user data export
- Right to deletion (automated pipeline)
- Cookie consent for EU users

---

## 6. CONTENT SCALING

### Story Quality at Scale

**Challenge:** How do we maintain 95+ quality scores across millions of stories?

**Solution: Multi-Layer Quality System**
1. **QA Agent** — automated scoring (pre-delivery, every story)
2. **Human Review Sample** — 1% of stories reviewed by Arabic content team
3. **User Ratings** — 1-5 star + text feedback on every story
4. **Pattern Detection** — automated flagging of low-rated stories
5. **Prompt Iteration** — weekly prompt improvements based on feedback

**Few-Shot Library Scaling:**
- Start: 50 example stories
- Month 6: 200 examples (covering all goal × style × age × dialect combinations)
- Month 12: 500+ examples + fine-tuned evaluation model

### Illustration Consistency at Scale

**Challenge:** Same child character looks different across illustrations

**Solution:**
1. Character sheet generated once per child profile
2. Character sheet cached and referenced in every illustration prompt
3. ControlNet/IP-Adapter integration (when available via API) for face consistency
4. Human review for photo-based characters (first story for each child)

---

## 7. TEAM SCALING

### Hiring Roadmap

| Phase | New Hires | Focus |
|-------|-----------|-------|
| Seed (Month 1–6) | 6 → 7 | Arabic Content Lead |
| Growth (Month 7–12) | +4 | Marketing (×2), CS (×1), Data (×1) |
| Scale (Month 13–18) | +8 | Sales B2B, Eng (×4), Product (×2), Finance |
| Expansion (Month 19–36) | +20+ | Regional leads, international, R&D |

### Critical Early Hires
1. **Arabic Content Lead** (Month 1) — Native Arabic speaker, children's content background
2. **Head of Growth** (Month 4) — Arabic digital marketing expert, GCC experience
3. **B2B Sales Lead** (Month 8) — School/institution sales in GCC
4. **Head of Product** (Month 6) — Consumer product, ideally edtech background

---

## 8. RISK MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| AI API costs spike | Medium | High | Multi-provider fallback, cost optimization roadmap |
| Arabic quality below bar | Low | High | Human review sample, QA agent, native speaker rating |
| Competitor launches Arabic version | Medium | Medium | Speed to market, data moat, cultural authenticity |
| Saudi data residency requirement | Medium | Medium | AWS Bahrain deployment readiness |
| Churn higher than projected | Medium | High | Engagement features, monthly reports, re-engagement emails |
| AI provider outage | Low | High | Multi-provider fallback (Claude → GPT-4o → Gemini) |
| Illustration model quality drops | Low | Medium | Multiple image providers, pre-generated asset library |

---

## 9. PLATFORM EXTENSIBILITY

**Hikayati as a Platform (Year 3+)**

The core story + personalization engine can power:
1. **White-Label API** — Other children's apps integrate Hikayati's story engine
2. **School Curriculum Layer** — Story engine aligned to curriculum standards
3. **Therapeutic Story Tool** — Integration with child therapist workflows
4. **Arabic Language Learning** — Stories + vocabulary tracking for diaspora
5. **Cultural Preservation** — Heritage stories for specific Arab communities
6. **Book Publisher API** — Traditional publishers use engine for digital personalization

This transforms Hikayati from a consumer app to an **Arabic children's content infrastructure company**.
