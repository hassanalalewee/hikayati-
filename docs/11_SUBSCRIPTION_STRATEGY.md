# Hikayati — Subscription Strategy

**Version:** 1.0 | **Date:** 2026-06-13

---

## 1. SUBSCRIPTION DESIGN PRINCIPLES

1. **Free must be genuinely valuable** — 1 story/month is enough to create delight and trigger word-of-mouth
2. **Premium must feel like a steal** — unlimited stories at $14.99 is a clear win vs. buying books
3. **Upgrade triggers must be natural** — users hit the paywall right after experiencing the magic
4. **Annual plans are the revenue engine** — target 40% of paid users on annual (2-month discount)
5. **Family Plus must be obviously right** for 2+ child households

---

## 2. TIER DESIGN

### Free Tier (Conversion Engine)
**Purpose:** Deliver the magic moment. Trigger upgrade desire.

```
Features:
  ✓ 1 story/month (resets on billing date)
  ✓ Basic personalization (name, age, gender, 1 goal)
  ✓ Web reading only
  ✓ Watermarked illustrations
  ✓ Basic PDF (Hikayati branded watermark)
  ✗ No audio narration
  ✗ No parent guide
  ✗ No growth dashboard
  ✗ No high-res/print-ready download
  ✗ No photo personalization

Upgrade CTAs:
  - When free story is used: "أنشئ قصصاً غير محدودة"
  - On parent guide teaser (blurred): "اكشف دليل الوالدين كاملاً"
  - On audio player (locked): "استمع إلى القصة بصوت عربي أصيل"
  - Monthly reset email: "قصتك المجانية جاهزة — أم تريد المزيد؟"
```

### Premium ($14.99/month | $11.99/month annual)
**Purpose:** Single-child power user. The core product experience.

```
Features:
  ✓ Everything in Free
  ✓ Unlimited stories
  ✓ Full personalization (all fields + photo)
  ✓ Audio narration (3 voice options)
  ✓ High-res illustrations (no watermark)
  ✓ Print-ready PDF
  ✓ Parent guide with every story
  ✓ AI Parenting Advisor (pre-story consultation)
  ✓ Growth dashboard (child development tracking)
  ✓ Monthly development report (PDF)
  ✓ Smart story recommendations
  ✓ Achievement badges
  ✓ Priority generation queue (< 60s vs < 90s)
  ✓ 4 Arabic dialects
  ✓ Story library (unlimited storage)
  
Single child profile
```

### Family Plus ($24.99/month | $19.99/month annual)
**Purpose:** Multi-child households. The best value.

```
Features:
  ✓ Everything in Premium
  ✓ Up to 5 child profiles
  ✓ Family shared library
  ✓ Cross-child development comparison
  ✓ Family reading challenges
  ✓ Collaborative reading sessions
  ✓ Family achievement board
  ✓ 10% discount on physical books
  ✓ Priority customer support
  
Upgrade path from Premium:
  Triggered when user tries to add 2nd child
```

### Professional ($79/month | $63.17/month annual)
**Purpose:** Schools, therapists, educational organizations.

```
Features:
  ✓ Everything in Family Plus
  ✓ Up to 50 child profiles
  ✓ Institutional dashboard
  ✓ Bulk story generation
  ✓ Class/group management
  ✓ Progress exports (CSV + PDF)
  ✓ API access (500 stories/month)
  ✓ White-label option (add-on: $299/month)
  ✓ Priority support + onboarding call
  ✓ Custom story templates (add-on)
  
Custom enterprise pricing available for 50+ children
```

---

## 3. PRICING PSYCHOLOGY

### Anchor Pricing
On pricing page, show Professional first (anchors high), then Family Plus highlighted as "most popular", then Premium, then Free.

### Annual Discount Framing
```
Premium: "$14.99/month — OR — $143/year (save $37)"
→ Frame as "2 months free" not "20% off"
→ Show: "= $11.92/month, billed annually"
```

### Family Value Framing
```
Family Plus vs 2× Premium:
  2× Premium = $29.98/month
  Family Plus = $24.99/month
  → "Save $60/year vs two Premium accounts"
```

### Regional Pricing (PPP-adjusted)

| Country | Free | Premium | Family Plus | Professional |
|---------|------|---------|-------------|-------------|
| USA/UK | $0 | $14.99 | $24.99 | $79 |
| Saudi Arabia | 0 | SAR 56 | SAR 94 | SAR 296 |
| UAE | 0 | AED 55 | AED 92 | AED 290 |
| Kuwait | 0 | KWD 4.6 | KWD 7.7 | KWD 24 |
| Egypt | 0 | EGP 750 | EGP 1,250 | EGP 3,950 |
| Jordan | 0 | JOD 10.7 | JOD 17.8 | JOD 56 |
| UK | 0 | £12 | £20 | £63 |
| Germany/France | 0 | €14 | €23 | €73 |

---

## 4. UPGRADE OPTIMIZATION

### Paywall Triggers (in priority order)

1. **Post-first-story** (highest intent): User just experienced delight
   - Full-screen upgrade modal: "قصتك جاهزة — استمتع بالمزيد"
   - Show blurred parent guide + audio player
   - CTA: "ابدأ Premium — أول شهر بـ 50% خصم"

2. **Free story limit reached**: User tries to create second story
   - "لقد استخدمت قصتك المجانية لهذا الشهر"
   - Show counter: "8 أيام حتى تجديد القصة المجانية — أو اشترك الآن"

3. **Feature upsell within story**: Clicked on locked feature
   - Inline upgrade prompt (non-blocking)
   - "هذه الميزة متاحة في Premium"

4. **Child profile #2 attempt**: User tries to add second child
   - "أضف حتى 5 أطفال مع Family Plus"
   - Show pricing comparison (Premium vs Family Plus)

5. **Monthly report teaser**: Show summary, blur details
   - "اكتشف تقرير نمو [اسم الطفل] الكامل"

### Free Trial Strategy

- No credit card required for free tier
- Optional: 7-day Premium trial (with card, cancel anytime)
- Trial offered: at post-first-story paywall
- Trial recovery email sequence:
  - Day 5: "تنتهي تجربتك المجانية خلال يومين"
  - Day 7: "الآن آخر يوم في تجربتك"
  - Day 8 (churned trial): "عد إلى حكايتي — قصة مجانية تنتظرك"

---

## 5. RETENTION STRATEGY

### Engagement Features
- Weekly "قصة الأسبوع" recommendation email
- Monthly child development report (Premium) — high perceived value
- Milestone celebrations (gamification) — emotional attachment
- "تذكير القراءة" — reading reminder push notification
- Streak tracking: "7 أيام متتالية من القصص"

### Anti-Churn Playbook

**Day 14 (low activity):**
Email: "لم نرك منذ فترة — [اسم الطفل] يشتاق لقصة جديدة"
CTA: One-click "Create a story now" deep link

**Day 21 (no story created this period):**
Push: "أنشئ قصة في 5 دقائق لـ [اسم الطفل]"
Offer: Bonus story credit

**Cancellation flow:**
- Show: stories remaining in current period
- Offer: 1-month 50% discount
- Offer: Pause subscription (1–3 months)
- If Educational user: connect with school discount

**Win-back (canceled > 30 days):**
Email: "حكايتي يشتاق إليك — هدية من عندنا"
Offer: 2 free stories (no credit card, if previously paid)

---

## 6. ANNUAL PLAN CONVERSION

**Target: 40% of Premium users on annual plan**

### Annual Plan Tactics

1. **Launch offer:** First 30 days — annual plan 30% off (vs standard 20%)
2. **Month 3 email:** "وفّر 37 دولار — حوّل اشتراكك إلى سنوي"
3. **In-app banner:** After 2+ months as subscriber
4. **Post-development report:** "استثمر في مستقبل [اسم الطفل] — اشترك سنوياً"
5. **Renewal prevention:** 7 days before annual renewal, send "your year in review" celebration

### Annual Plan Economics
```
Monthly paying: $14.99 × 12 = $179.88/year
Annual paying: $143.88/year (20% discount)

Value of annual conversion:
  - Locked revenue for 12 months
  - Churn eliminated for that period
  - LTV increases by 3× vs monthly churn rate
  - Worth giving 2 months free to convert
```

---

## 7. GIFTING SYSTEM

**"أهدِ قصة" — Gift a Story**

- Gift a single story: $4.99 one-time
- Gift Premium (1 month): $14.99 + card
- Gift annual Premium: $143.88 + card
- Gift card (any amount): custom purchase

**High-value gift moments:**
- Eid al-Fitr, Eid al-Adha
- Child's birthday
- New baby gift (future-dated story subscription)
- Teacher gift from parents

**Gift flow:**
Purchaser pays → enters recipient email → recipient creates account → story credits waiting

---

## 8. B2B SUBSCRIPTION MODEL

### School Pricing

| Size | Students | Price/Year | Per Student |
|------|----------|-----------|------------|
| Small | 1–25 | $499 | $20 |
| Medium | 26–100 | $1,499 | $15 |
| Large | 101–500 | $4,999 | $10 |
| District | 500+ | Custom | $7–8 |

### B2B Sales Process
1. Free 30-day pilot (1 classroom, 10 students)
2. Pilot review call with teacher/principal
3. School-wide proposal
4. Annual contract + PO process
5. Quarterly check-in + renewal

### B2B Value Proposition
- Personalized story per student per week = 40 stories/year
- Traditional: 40 custom stories × $50 = $2,000
- Hikayati: $499/year = 99.5% cheaper
- Plus: development tracking, teacher dashboard, progress reports
