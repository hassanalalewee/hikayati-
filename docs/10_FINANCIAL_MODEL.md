# Hikayati — Financial Model

**Version:** 1.0 | **Date:** 2026-06-13

---

## 1. UNIT ECONOMICS

### Revenue Per User

| Plan | Monthly Price | Annual (÷12) | Gross Margin | Net Margin |
|------|--------------|--------------|--------------|------------|
| Free | $0 | — | — | — |
| Premium | $14.99 | $12.49 | 73% | 45% |
| Family Plus | $24.99 | $20.83 | 76% | 48% |
| Professional | $79.00 | $65.83 | 82% | 55% |

### Cost Per Story (AI + Infrastructure)

| Component | Cost |
|-----------|------|
| AI agents (Claude + GPT) | $0.65 |
| Illustration (DALL-E 3, 10×) | $0.40 |
| Audio narration (ElevenLabs) | $0.15 |
| PDF generation | $0.02 |
| Storage + CDN | $0.03 |
| Queue processing | $0.01 |
| **Total per story** | **~$1.26** |

With caching and prompt optimization (Month 6+): **~$0.85/story**

### Stories Per Subscriber Per Month

| Plan | Avg Stories/Month | AI Cost | Gross Contribution |
|------|------------------|---------|-------------------|
| Free | 1 | $1.26 | ($1.26) — acquisition cost |
| Premium | 4.5 | $5.67 | $9.32 (62% margin) |
| Family Plus | 8.0 | $10.08 | $14.91 (60% margin) |
| Professional | 25.0 | $31.50 | $47.50 (60% margin) |

---

## 2. SUBSCRIBER MIX ASSUMPTIONS

Expected subscriber distribution at steady state:
- Free: 70% of registered users
- Premium: 20% of registered users
- Family Plus: 8% of registered users
- Professional: 2% of registered users

Blended ARPU (paying users only): ~$18.50/month

---

## 3. MONTHLY FINANCIAL PROJECTIONS (3 Years)

### Year 1 (Monthly)

| Month | Reg. Users | Paid Subs | MRR | Revenue | AI Cost | Gross Profit |
|-------|-----------|-----------|-----|---------|---------|-------------|
| 1 | 500 | 50 | $925 | $925 | $630 | $295 |
| 2 | 1,200 | 120 | $2,220 | $2,220 | $1,512 | $708 |
| 3 | 2,500 | 275 | $5,088 | $5,088 | $3,465 | $1,623 |
| 4 | 4,500 | 540 | $9,990 | $9,990 | $6,804 | $3,186 |
| 5 | 7,500 | 900 | $16,650 | $16,650 | $11,340 | $5,310 |
| 6 | 12,000 | 1,440 | $26,640 | $26,640 | $18,144 | $8,496 |
| 7 | 18,000 | 2,340 | $43,290 | $43,290 | $29,484 | $13,806 |
| 8 | 26,000 | 3,380 | $62,530 | $62,530 | $42,588 | $19,942 |
| 9 | 36,000 | 4,680 | $86,580 | $86,580 | $58,968 | $27,612 |
| 10 | 48,000 | 6,240 | $115,440 | $115,440 | $78,624 | $36,816 |
| 11 | 62,000 | 8,060 | $149,110 | $149,110 | $101,556 | $47,554 |
| 12 | 80,000 | 10,400 | $192,400 | $192,400 | $131,040 | $61,360 |

**Year 1 Total Revenue:** ~$710K  
**Year 1 Total AI Costs:** ~$484K  
**Year 1 Gross Profit:** ~$226K (32% gross margin — early stage, high AI cost ratio)

### Year 2 Summary

Assumptions:
- AI costs reduced 30% via caching + prompt optimization
- Premium to Family upgrade rate: 25%
- Churn reduced to 5%/month
- B2B revenue begins (schools)

| Period | Paid Subs | MRR | ARR |
|--------|-----------|-----|-----|
| Q1 Y2 | 14,000 | $259K | $3.1M |
| Q2 Y2 | 20,000 | $370K | $4.4M |
| Q3 Y2 | 28,000 | $518K | $6.2M |
| Q4 Y2 | 38,000 | $703K | $8.4M |

**Year 2 ARR:** $8.4M  
**Year 2 Gross Margin:** ~55% (AI cost optimized)

### Year 3 Summary

Assumptions:
- Physical book revenue: 5% of subscribers order ($35 avg)
- Expert marketplace: 3% GMV take rate
- White-label API: 10 enterprise clients @ $5K/year
- Churn: 3.5%/month

| Period | Paid Subs | MRR | ARR |
|--------|-----------|-----|-----|
| Q1 Y3 | 50,000 | $925K | $11.1M |
| Q2 Y3 | 65,000 | $1.2M | $14.4M |
| Q3 Y3 | 82,000 | $1.52M | $18.2M |
| Q4 Y3 | 100,000 | $1.85M | $22.2M |

**Year 3 ARR:** $22.2M  
**Year 3 Gross Margin:** ~65%  
**Year 3 EBITDA:** ~$4.4M (20% margin)

---

## 4. OPERATING EXPENSE MODEL

### Monthly Burn (MVP Phase, Month 1–6)

| Category | Monthly Cost |
|----------|-------------|
| Engineering (3 FT) | $18,000 |
| Design (1 FT) | $5,000 |
| Arabic Content (1 PT) | $2,500 |
| Product/PM (1 FT) | $8,000 |
| AI APIs (variable) | $8,000–$15,000 |
| Infrastructure (Vercel, Supabase, Redis) | $800 |
| Marketing budget | $3,000 |
| Legal, accounting | $1,500 |
| Miscellaneous | $1,200 |
| **Total Monthly Burn** | **~$48,000–$55,000** |

**Runway needed for MVP phase:** 6 months × $52K = ~$312K

### Monthly Burn (Growth Phase, Month 7–18)

| Category | Monthly Cost |
|----------|-------------|
| Engineering (6 FT) | $42,000 |
| Design (2 FT) | $12,000 |
| Product (2 FT) | $16,000 |
| Marketing (2 FT) | $14,000 |
| Customer Success (2 FT) | $10,000 |
| AI APIs | $30,000–$80,000 |
| Infrastructure | $3,000 |
| Marketing spend | $15,000 |
| G&A | $5,000 |
| **Total Monthly Burn** | **~$147,000–$197,000** |

---

## 5. FUNDING REQUIREMENTS

### Seed Round: $750K–$1.5M
**Use of funds:**
- 6 months runway through MVP launch: $312K
- Marketing budget (beta + launch): $150K
- Infrastructure setup: $50K
- Legal + IP: $75K
- Reserve: $163K–$913K

**Milestones unlocked:**
- MVP launched with paying customers
- $15K MRR within 6 months
- Product-market fit signal (NPS > 50)

### Series A: $4M–$8M (Month 12–18)
**Trigger:** $100K+ MRR, proven unit economics (LTV:CAC > 10×)
**Use of funds:**
- Scale engineering team (10 → 20)
- Marketing scale-up ($100K+/month)
- Physical book infrastructure
- Expert marketplace development
- International expansion (diaspora markets)
- Working capital for print inventory

### Series B: $15M–$25M (Year 3)
**Trigger:** $1M+ MRR, expansion to new revenue streams
**Use of funds:**
- MENA regional offices
- School curriculum partnerships
- AR/interactive story experience
- Potential acquisition of Arabic content library

---

## 6. KEY FINANCIAL RATIOS

### LTV Calculation (Premium)
```
ARPU:           $14.99/month
Gross Margin:   73%
Monthly Churn:  5% (steady state)
LTV = (ARPU × GM) / Churn
LTV = ($14.99 × 0.73) / 0.05
LTV = $218.85
```

### CAC Target
- Blended CAC target: ≤ $25
- LTV:CAC target: > 8×
- Payback period: ≤ 4 months

### Break-Even Analysis
- Fixed monthly costs (Year 1): ~$40K (ex-AI)
- Contribution per paid subscriber: ~$9.50/month
- Break-even subscribers: 4,211
- Projected break-even: Month 9–10

---

## 7. REVENUE DIVERSIFICATION (Year 2–3)

| Revenue Stream | % of Total (Y3) | Est. Annual |
|---------------|-----------------|-------------|
| Subscriptions (B2C) | 70% | $15.5M |
| Physical Books | 12% | $2.7M |
| B2B (Schools) | 8% | $1.8M |
| Expert Marketplace | 6% | $1.3M |
| White-Label API | 4% | $0.9M |
| **Total** | 100% | **$22.2M** |
