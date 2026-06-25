# حكايتي (Hikayati) — Product Requirements Document

**Version:** 1.0  
**Date:** 2026-06-13  
**Status:** Approved for Development  
**Classification:** Confidential

---

## 1. EXECUTIVE SUMMARY

Hikayati ("My Story") is a premium AI-powered Arabic SaaS platform that creates hyper-personalized children's stories where the child becomes the hero. The platform serves Arabic-speaking families globally by combining cutting-edge AI storytelling with child development science, producing stories that are culturally resonant, linguistically native, and pedagogically sound.

**Mission:** Transform every Arabic-speaking child into the hero of their own developmental journey.

**Vision:** Become the #1 Arabic children's digital publishing and parenting intelligence platform, reaching 1M+ families by 2028.

**Core Value Proposition:**  
- Child becomes the literal hero (name, appearance, personality woven throughout)  
- Stories address real behavioral and developmental challenges without preaching  
- Parent receives a complete child development toolkit with every story  
- Native Arabic quality indistinguishable from human-authored books  
- Culturally authentic across all Arabic-speaking regions

---

## 2. PROBLEM STATEMENT

### 2.1 Market Gap
Arabic-speaking parents face a critical shortage of:
- High-quality Arabic children's content
- Culturally relevant educational stories
- Personalized developmental tools
- AI-native Arabic content platforms

### 2.2 Parent Pain Points
1. **Content Desert:** Existing Arabic children's content is low quality, translated, or poorly localized
2. **Generic Advice:** Parenting resources are Western-centric and culturally tone-deaf
3. **Behavioral Challenges:** No structured tool to address behavioral issues through storytelling
4. **Development Gaps:** No unified platform tracking child development milestones
5. **Engagement:** Children disengaged from static, non-personalized content

### 2.3 Child Development Opportunity
Research consistently shows:
- Stories featuring the child as hero increase engagement by 340%
- Narrative-based learning improves value retention vs. direct instruction by 65%
- Culturally relevant content improves literacy outcomes by 48%
- Parental involvement in story-guided learning accelerates development

---

## 3. PRODUCT OVERVIEW

### 3.1 Core Product: AI Story Engine
A multi-agent AI system that generates 800–2000 word personalized Arabic children's stories with:
- Professional children's book illustrations (8–12 pages)
- PDF export (print-ready)
- Audio narration (multiple voice options)
- Parent development guide
- Child growth tracking

### 3.2 Product Pillars

| Pillar | Description |
|--------|-------------|
| Personalized Storytelling | Child name, traits, goals, and photo woven into narratives |
| Parenting Intelligence | AI advisor analyzes behavioral challenges, recommends story goals |
| Child Development Tracking | Long-term growth profiles across 12 development dimensions |
| Cultural Authenticity | Region-specific language, names, settings, and values |
| Family Ecosystem | Shared libraries, collaborative reading, family milestones |

---

## 4. USER PERSONAS

### Persona 1: Fatima — The Gulf Mother
- **Age:** 32, Saudi Arabia
- **Profile:** University-educated, tech-savvy, values Islamic upbringing
- **Pain:** Son (age 5) struggles with honesty; can't find quality Arabic stories
- **Goal:** Raise confident, honest child with Islamic values
- **Willingness to Pay:** SAR 79–149/month for quality content

### Persona 2: Omar — The Diaspora Father
- **Age:** 38, London
- **Profile:** Egyptian expat, concerned about cultural identity erosion
- **Pain:** Daughter (age 7) losing Arabic language connection
- **Goal:** Maintain Arabic cultural identity through engaging stories
- **Willingness to Pay:** £15–25/month

### Persona 3: Dr. Hana — The Child Therapist
- **Age:** 45, Jordan
- **Profile:** Licensed child psychologist, runs private practice
- **Pain:** Needs culturally appropriate therapeutic story tools
- **Goal:** Therapeutic story assignments for 30+ child clients
- **Willingness to Pay:** $99/month Professional plan

### Persona 4: Ms. Nour — The Kindergarten Teacher
- **Age:** 29, UAE
- **Profile:** Early childhood educator, class of 22 students
- **Pain:** Needs individualized content for diverse student needs
- **Goal:** Personalized reading material for each student
- **Willingness to Pay:** AED 500/month institutional license

---

## 5. USER JOURNEY — DETAILED

### 5.1 Onboarding Flow

```
Landing Page
    ↓
Registration (Email / Google / Apple / Phone)
    ↓
Language Selection (dialect preference)
    ↓
First Child Profile Setup
    ↓
Free Story Generation (demo experience)
    ↓
Paywall + Subscription Prompt
    ↓
Dashboard
```

### 5.2 Story Creation Flow (Full)

**Step 1 — AI Parenting Advisor (Optional, Premium)**
```
Parent describes challenge in natural Arabic text
    ↓
AI Insight Agent analyzes challenge
    ↓
Displays: Root Cause Analysis + Emotional Profile
    ↓
Recommends: Goals, Story Style, Length, Characters
    ↓
Parent confirms or adjusts recommendations
```

**Step 2 — Goal Selection**
Parent selects 1–3 goals from:

| Category | Goals |
|----------|-------|
| Character | Honesty, Responsibility, Courage, Gratitude |
| Social | Friendship, Kindness, Anti-Bullying, Leadership |
| Emotional | Self-Confidence, Emotional Intelligence, Resilience |
| Cognitive | Creativity, Problem Solving, Time Management |
| Spiritual | Islamic Values, Discipline |
| Academic | Reading, Focus, Curiosity |

**Step 3 — Child Profile**

| Field | Required | Notes |
|-------|----------|-------|
| Name | Yes | Used throughout story |
| Age | Yes | Controls vocabulary + complexity |
| Gender | Yes | Adjusts pronouns + protagonist traits |
| Country | Yes | Cultural adaptation |
| City | Optional | Hyper-local references |
| Hobbies | Optional | Woven into narrative |
| Favorite Color | Optional | Visual personalization |
| Favorite Animal | Optional | Animal companion/character |
| Favorite Activities | Optional | Story setting inspiration |
| Photo | Optional | Illustration personalization |

**Step 4 — Story Style**

| Style | Description |
|-------|-------------|
| Adventure | Outdoor quests, exploration, discovery |
| Fantasy | Magical worlds, mythical creatures |
| Islamic | Prophetic references, Islamic moral lessons |
| Animals | Talking animals, nature settings |
| Space | Cosmos, science, exploration |
| Superhero | Special powers, saving the day |
| Mystery | Puzzles, detective, problem-solving |
| Historical | Arab history, heritage, civilizations |
| Science | Experiments, discovery, curiosity |
| Everyday Life | School, family, neighborhood |

**Step 5 — Generation & Delivery**
```
12-agent AI pipeline runs (~45–90 seconds)
    ↓
Progress shown with live stage updates
    ↓
Story delivered with:
    - Full illustrated story (PDF)
    - Audio narration file
    - Parent guide document
    - Child development report
    - Social sharing assets
    - Printable book option
```

---

## 6. FEATURE REQUIREMENTS

### 6.1 Core Features (MVP)

| Feature | Priority | Description |
|---------|----------|-------------|
| Story Generation Engine | P0 | Full 12-agent AI pipeline |
| Child Profile System | P0 | Multi-child per account |
| PDF Export | P0 | Print-ready illustrated PDF |
| Subscription Billing | P0 | Stripe + Mollie integration |
| Arabic RTL Interface | P0 | Full RTL support |
| Parent Dashboard | P0 | Profiles, library, history |
| Free Tier | P0 | 1 story/month conversion funnel |

### 6.2 Growth Features (v1.1–v1.3)

| Feature | Priority | Description |
|---------|----------|-------------|
| Audio Narration | P1 | ElevenLabs + OpenAI TTS |
| AI Parenting Advisor | P1 | Pre-story behavioral consultation |
| Growth Dashboard | P1 | Development tracking per child |
| Monthly Reports | P1 | Parent-facing PDF reports |
| Gamification Badges | P1 | Child achievement system |
| Recommendation Engine | P1 | Next story intelligence |

### 6.3 Scale Features (v2.0+)

| Feature | Priority | Description |
|---------|----------|-------------|
| Physical Book Printing | P2 | POD integration (hardcover/softcover) |
| Family Library | P2 | Shared family reading space |
| Expert Marketplace | P2 | Psychologists, coaches, writers |
| School/Institution Portal | P2 | B2B dashboard |
| Story Series | P2 | Multi-part character arcs |
| AR Story Experience | P3 | Augmented reality page animations |

---

## 7. SUBSCRIPTION TIERS

### Free
- 1 story/month
- Basic personalization
- PDF download
- Web reading only
- No audio
- Watermarked illustrations

### Premium — $14.99/month (or regional pricing)
- Unlimited stories
- Full personalization + photo
- Audio narration (3 voice options)
- High-res illustrations (no watermark)
- PDF + print-ready export
- Parent guide with every story
- Growth dashboard
- Monthly development report
- Recommendation engine
- Priority generation queue

### Family Plus — $24.99/month
- Everything in Premium
- Up to 5 child profiles
- Family shared library
- Collaborative reading sessions
- Family milestone celebrations
- Cross-child development analytics
- Shared reading challenges
- Family achievement board

### Professional — $79/month
- Everything in Family Plus
- Up to 50 child profiles
- Bulk story generation
- Institutional dashboard
- Progress exports (CSV/PDF)
- API access (limited)
- Priority support
- White-label option (enterprise)

### Regional Pricing

| Region | Premium | Family Plus |
|--------|---------|-------------|
| GCC (USD) | $14.99 | $24.99 |
| Saudi Arabia (SAR) | SAR 56 | SAR 94 |
| UAE (AED) | AED 55 | AED 92 |
| Egypt (EGP) | EGP 750 | EGP 1,250 |
| UK (GBP) | £12 | £20 |
| EU (EUR) | €14 | €23 |

---

## 8. CONTENT REQUIREMENTS

### 8.1 Story Quality Standards
- **Language:** Native Arabic fluency (no translation artifacts)
- **Vocabulary:** Age-calibrated (3–4yr / 5–7yr / 8–10yr / 11–13yr)
- **Length:** 800–1500 words standard; 2000+ premium
- **Structure:** 6-act framework (Intro → Challenge → Discovery → Growth → Resolution → Transformation)
- **Personalization Score:** Child name appears 12–18 times naturally
- **Educational Embedding:** Goal embedded in narrative (never stated directly)
- **Ending:** Positive transformation always, with subtle lesson reflection

### 8.2 Illustration Standards
- **Count:** 8–12 illustrated pages per story
- **Style:** Warm, premium children's book aesthetic
- **Consistency:** Same character appearance across all pages
- **Resolution:** 300 DPI print-ready
- **Formats:** WEBP (web) + PNG (print) + PDF (export)

### 8.3 Audio Standards
- **Quality:** Studio-grade narration
- **Options:** Male voice / Female voice / Child voice
- **Features:** Background ambient music, subtle sound effects
- **Format:** MP3 + M4A
- **Duration:** 8–15 minutes per story

### 8.4 Prohibited Content
- Direct preaching or moralizing
- Fear-based lessons or threats
- Shaming language
- Gender stereotyping beyond cultural norms
- Violence beyond age-appropriate adventure
- Political content
- Non-Islamic religious content (in Islamic story mode)
- Culturally inappropriate references

---

## 9. LOCALIZATION & CULTURAL REQUIREMENTS

### 9.1 Arabic Dialect Support

| Dialect | Regions | Priority |
|---------|---------|----------|
| Modern Standard Arabic (MSA) | All | P0 |
| Gulf Arabic | Saudi, UAE, Kuwait, Qatar, Bahrain, Oman | P0 |
| Levantine | Lebanon, Syria, Jordan, Palestine | P1 |
| Egyptian | Egypt, Sudan | P1 |
| Maghrebi | Morocco, Algeria, Tunisia, Libya | P2 |

### 9.2 Cultural Adaptation Requirements
- Names must be region-appropriate (Gulf names for Gulf users, etc.)
- Settings must be recognizable (UAE skylines, Egyptian Nile, Levantine mountains)
- Food, clothing, customs must match region
- Islamic calendar and holidays integrated where relevant
- Family structure respects Arab family values (extended family, parental respect)
- Proverbs and idioms must be dialect-appropriate

### 9.3 Interface RTL Requirements
- Full RTL layout for all UI components
- Arabic numerals option (٠١٢٣ vs 0123)
- Arabic date formats
- RTL text input handling
- RTL PDF generation
- RTL audio timestamps

---

## 10. NON-FUNCTIONAL REQUIREMENTS

### 10.1 Performance
- Story generation: < 90 seconds P95
- Page load: < 2 seconds (LCP)
- PDF generation: < 15 seconds
- Audio generation: < 60 seconds
- Uptime SLA: 99.9%

### 10.2 Security
- SOC 2 Type II compliance path
- COPPA compliant (children's data)
- GDPR compliant (EU users)
- Saudi PDPL compliant
- End-to-end encryption for child data
- Row-level security on all child profiles
- No third-party data sharing of child data

### 10.3 Scalability
- Horizontal scaling via serverless functions
- CDN delivery for all static assets
- Queue-based story generation (Bull/BullMQ)
- Database connection pooling (PgBouncer)
- Target: 1M+ registered users by Year 3

### 10.4 Accessibility
- WCAG 2.1 AA compliance
- Screen reader support (Arabic)
- High contrast mode
- Font size controls
- Keyboard navigation

---

## 11. SUCCESS METRICS

### Product Metrics
| Metric | Month 3 | Month 12 | Month 24 |
|--------|---------|---------|---------|
| Registered Users | 5,000 | 50,000 | 250,000 |
| Paid Subscribers | 500 | 7,500 | 45,000 |
| Stories Generated/day | 200 | 2,000 | 15,000 |
| Free-to-Paid Conversion | 8% | 12% | 15% |
| MRR | $7.5K | $112K | $675K |
| NPS Score | 45 | 60 | 70 |
| Story Completion Rate | 75% | 82% | 87% |
| Monthly Churn | 8% | 5% | 3.5% |

### Quality Metrics
| Metric | Target |
|--------|--------|
| AI Language Quality Score | ≥95/100 |
| Parent Satisfaction (post-story) | ≥4.5/5 |
| QA Pass Rate (first attempt) | ≥85% |
| Illustration Consistency Score | ≥90/100 |

---

## 12. LAUNCH REQUIREMENTS

### MVP Launch Checklist
- [ ] Story generation engine (all 12 agents)
- [ ] 3 subscription tiers with billing
- [ ] Child profile system (up to 2 profiles on Premium)
- [ ] PDF export with illustrations
- [ ] Arabic RTL interface (Gulf + MSA)
- [ ] Mobile-responsive design
- [ ] Authentication (Email + Google)
- [ ] Parent dashboard
- [ ] Free tier (1 story/month)
- [ ] Story library (saved stories)
- [ ] Basic analytics (admin)
- [ ] Payment processing (Stripe)
- [ ] Email onboarding sequence
- [ ] Privacy Policy + Terms (Arabic + English)
- [ ] Basic SEO setup

---

*Document Owner: Product Team | Next Review: 2026-07-13*
