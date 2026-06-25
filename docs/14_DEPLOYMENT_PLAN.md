# Hikayati — Deployment Plan

**Version:** 1.0 | **Date:** 2026-06-13

---

## 1. DEPLOYMENT ENVIRONMENTS

| Environment | Purpose | URL | Branch |
|-------------|---------|-----|--------|
| Local Dev | Individual developer | localhost:3000 | feature/* |
| Staging | QA + pre-release testing | staging.hikayati.ai | develop |
| Production | Live users | hikayati.ai | main |
| Admin | Internal admin access | admin.hikayati.ai | main |

---

## 2. CI/CD PIPELINE

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run type-check      # TypeScript
      - run: npm run lint             # ESLint + RTL rules
      - run: npm run test             # Unit tests (Vitest)
      - run: npm run test:e2e         # Playwright (critical flows)

  deploy-staging:
    needs: quality
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel (staging)
        run: vercel --token $VERCEL_TOKEN --env staging
      - name: Run migration (staging)
        run: supabase db push --project-ref $SUPABASE_STAGING_REF
      - name: Smoke test
        run: npm run test:smoke -- --env staging

  deploy-production:
    needs: quality
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel (production)
        run: vercel --prod --token $VERCEL_TOKEN
      - name: Run migration (production)
        run: supabase db push --project-ref $SUPABASE_PROD_REF
      - name: Verify deployment
        run: npm run test:smoke -- --env production
      - name: Notify Slack
        run: |
          curl -X POST $SLACK_WEBHOOK \
            -d '{"text": "✅ Hikayati deployed to production"}'
```

---

## 3. ENVIRONMENT SETUP

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/hikayati/platform
cd platform

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
# Fill in: Supabase keys, AI API keys, Stripe test keys

# 4. Start local Supabase
npx supabase start

# 5. Run migrations
npx supabase db push

# 6. Seed development data
npm run db:seed

# 7. Start development server
npm run dev
```

### Staging Environment Checklist

```
[ ] Supabase project (separate from production)
[ ] Stripe test mode (not live keys)
[ ] AI APIs: Claude, OpenAI (same keys, separate cost monitoring)
[ ] Vercel staging deployment
[ ] Staging domain: staging.hikayati.ai
[ ] Sentry staging environment
[ ] PostHog staging project
[ ] Resend email (staging — uses a test mode)
[ ] Cloudflare R2 staging bucket
[ ] Upstash Redis staging instance
```

---

## 4. DATABASE DEPLOYMENT STRATEGY

### Migration Process

```bash
# Migrations live in: supabase/migrations/
# Naming: YYYYMMDDHHMMSS_description.sql

# Create new migration
npx supabase migration new add_story_series

# Apply to staging
npx supabase db push --project-ref $STAGING_REF

# Verify on staging
npx supabase db diff --project-ref $STAGING_REF

# Apply to production (after staging validation)
npx supabase db push --project-ref $PROD_REF
```

### Zero-Downtime Migration Rules

1. **Never drop columns** in the same migration as removing their usage from code
2. **Always add nullable columns** (not NOT NULL) initially, backfill, then add constraint
3. **Add indexes concurrently** (`CREATE INDEX CONCURRENTLY`)
4. **Test rollback** for every migration on staging before production
5. **Announce to team** before running production migrations

### Rollback Procedure

```bash
# If migration causes issues:
# 1. Identify the migration to rollback
npx supabase migration list

# 2. Create reverse migration manually
npx supabase migration new rollback_description

# 3. Apply rollback
npx supabase db push --project-ref $PROD_REF

# Note: Supabase doesn't auto-rollback — always write reverse migrations
```

---

## 5. PRODUCTION DEPLOYMENT CHECKLIST

### Pre-Deployment (Required for every release)

```
Code Quality:
[ ] All tests passing (unit + integration + e2e)
[ ] TypeScript: zero errors
[ ] No security vulnerabilities (npm audit)
[ ] Code reviewed and approved (2 engineers)

Database:
[ ] All migrations tested on staging
[ ] No breaking schema changes (if any, coordinate with code)
[ ] Indexes added for new query patterns
[ ] RLS policies correct

AI Pipeline:
[ ] Story generation tested on staging (5+ test stories)
[ ] Quality scores reviewed by Arabic content lead
[ ] No regression in agent outputs
[ ] Cost monitoring in place for new AI calls

Infrastructure:
[ ] Environment variables set on Vercel (production)
[ ] Stripe webhook endpoint updated (if changed)
[ ] CDN cache rules configured (new asset types)

Observability:
[ ] Sentry release created
[ ] New feature flags configured
[ ] Analytics events added for new features
[ ] Alert thresholds reviewed
```

### Post-Deployment Verification (15 minutes)

```
[ ] Landing page loads (< 2s)
[ ] Registration/login works
[ ] Story creation completes successfully (generate 1 test story)
[ ] PDF downloads correctly
[ ] Stripe checkout completes (test mode)
[ ] Email delivery working (trigger 1 test email)
[ ] No error spike in Sentry
[ ] No queue backlog in Redis
[ ] Admin dashboard accessible
```

---

## 6. MONITORING & ALERTING

### Critical Alerts (PagerDuty/Betterstack)

| Alert | Condition | Response |
|-------|-----------|---------|
| Story generation failure rate | > 5% in 5 minutes | Immediate investigation |
| Queue depth | > 100 jobs | Scale workers |
| Database response time | P95 > 500ms | Query analysis |
| Payment webhook failures | > 3 in 1 hour | Check Stripe + webhook endpoint |
| API error rate | > 1% | Check logs, roll back if needed |
| Certificate expiry | < 14 days | Renew SSL |

### Daily Monitoring Dashboard

```
KPIs to check every morning:
- Stories generated (yesterday vs 7-day avg)
- New signups vs conversions
- Error rate (Sentry)
- AI cost per story (vs budget)
- Queue depth at peak
- Any failed payments (Stripe)
- Churn signals (cancellations)
```

---

## 7. DISASTER RECOVERY

### RTO (Recovery Time Objective): < 1 hour
### RPO (Recovery Point Objective): < 15 minutes

### Backup Strategy

```
Database:
  - Supabase automated backups: every 6 hours
  - Point-in-time recovery: 7 days (Pro plan)
  - Manual backup before major migrations

Story Assets (R2/Storage):
  - Supabase Storage: replicated automatically
  - Cloudflare R2: geo-replicated
  - PDFs: generated on demand from stored data (re-generatable)

Redis (Queue):
  - Upstash: persistent storage (jobs survive restarts)
  - In-flight jobs recoverable on worker restart
```

### Incident Response Playbook

```
Severity 1 (Complete outage):
  1. Alert team via Slack/WhatsApp
  2. Check Vercel status (vercelstatus.com)
  3. Check Supabase status
  4. Check AI provider status (anthropicstatus.com)
  5. Roll back last deployment if needed: vercel rollback
  6. Communicate to users via status page

Severity 2 (Feature degraded):
  1. Identify affected feature (story generation / payments / auth)
  2. Check relevant service status
  3. Activate fallback if available (e.g., switch image gen provider)
  4. Fix + deploy hotfix branch
  5. Verify resolution

Severity 3 (Quality issue):
  1. Log the affected stories
  2. Pause that story style/goal combination if needed
  3. Fix prompt + test on staging
  4. Deploy prompt update (no code deploy required)
```

---

## 8. SECURITY DEPLOYMENT CHECKLIST

```
Headers (Next.js config):
[ ] Content-Security-Policy configured
[ ] X-Frame-Options: DENY
[ ] X-Content-Type-Options: nosniff
[ ] Strict-Transport-Security enabled
[ ] Referrer-Policy: strict-origin-when-cross-origin

Authentication:
[ ] Supabase Auth JWT expiry configured (1 hour access, 7-day refresh)
[ ] Magic link expiry: 1 hour
[ ] OAuth providers (Google, Apple) validated
[ ] Admin routes protected (role check in middleware)

Data:
[ ] RLS policies tested (cross-user data access impossible)
[ ] Child photo upload: virus scan before storage
[ ] AI outputs: XSS sanitization before display
[ ] PDF generation: server-side only (no user-controlled HTML)

Payments:
[ ] Stripe webhook signature verification
[ ] No payment data stored in our DB (Stripe handles it)
[ ] PCI compliance via Stripe Checkout (not self-hosted form)
```

---

## 9. LAUNCH DAY RUNBOOK

### T-24 Hours
- [ ] Final staging validation (all QA checks)
- [ ] Production environment fully configured
- [ ] DNS TTL lowered to 60s
- [ ] Team on-call schedule confirmed
- [ ] Status page ready (status.hikayati.ai)

### T-1 Hour
- [ ] Database backup taken manually
- [ ] Redis cleared (remove any test jobs)
- [ ] Monitoring alerts all set to production thresholds
- [ ] Team on Slack/WhatsApp for immediate response

### Launch Sequence
```
1. Deploy production build (Vercel CLI or GitHub push to main)
2. Run database migrations
3. Verify deployment (post-deployment checklist)
4. Enable public access (remove maintenance mode)
5. Send launch announcement email to beta list
6. Post on social media
7. Monitor for 2 hours (all engineers on deck)
```

### T+2 Hours
- [ ] Review first 50 stories created (quality check)
- [ ] Check payment flow (any declined cards?)
- [ ] Review error rate (Sentry)
- [ ] Confirm email delivery working
- [ ] Review queue depth and processing speed

---

*Deployment contacts: [team contacts list in Notion]*  
*Escalation: CTO → on-call engineer → full team*
