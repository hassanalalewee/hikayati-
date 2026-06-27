# Hikayati — Operational Workflow Design v1.0
**Human-in-the-Loop Publishing System**

> Status: APPROVED OPERATIONAL DESIGN  
> Version: 1.0  
> Date: 2026-06-27  
> Depends on: 20_BUSINESS_FOUNDATION_v2.0.md

---

## PART 1 — END-TO-END WORKFLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER TOUCHPOINTS                         │
└─────────────────────────────────────────────────────────────────────┘
         │                                               │
         ▼                                               ▼
   [Order Placed]                               [Story Delivered]
         │                                               ▲
         ▼                                               │
┌─────────────────────────────────────────────────────────────────────┐
│                        PLATFORM LAYER                               │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │  ORDER INTAKE │───▶│  AI PIPELINE │───▶│   EDITOR DASHBOARD   │  │
│  │              │    │              │    │                      │  │
│  │ - Validate   │    │ - Generate   │    │ - Review queue       │  │
│  │ - Profile    │    │   story      │    │ - Edit inline        │  │
│  │ - Queue      │    │ - Generate   │    │ - Accept / Revise    │  │
│  │              │    │   img prompts│    │ - Flag / Escalate    │  │
│  └──────────────┘    │ - Score QA   │    └──────────────────────┘  │
│                      └──────────────┘               │              │
│                                                      ▼              │
│                                           ┌──────────────────────┐  │
│                                           │  PACKAGING & DELIVERY│  │
│                                           │                      │  │
│                                           │ - Render PDF         │  │
│                                           │ - Attach images      │  │
│                                           │ - Generate link      │  │
│                                           │ - Send notification  │  │
│                                           └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PART 2 — STAGE-BY-STAGE WORKFLOW

### STAGE 1 — Customer Order
**Owner:** Platform (automated)  
**Customer-visible status:** *"We've received your order — our team is preparing your child's story."*

**What happens:**
1. Parent completes the story request form:
   - Child's name, age (2–12), gender (optional)
   - Personality traits (select up to 3): curious / brave / shy / energetic / kind / stubborn / etc.
   - Story goal / lesson: honesty, courage, sharing, dealing with fear, new sibling, etc.
   - Dialect preference: MSA / Gulf / Levantine / Egyptian
   - Optional: child photo (used for illustration style reference only)
   - Special notes: anything the parent wants woven in (favorite animal, real friend's name, etc.)
2. Platform validates the input (no empty required fields, age in range)
3. Order record created in database with status `NEW_ORDER`
4. Order assigned to AI pipeline queue
5. Parent receives confirmation:
   > *"حكايتي تحضّر قصة [اسم الطفل] — فريقنا التحريري سيبدأ العمل عليها الآن."*
   > *"[Child's name]'s story is in the hands of our team. We'll notify you when it's ready."*

**What the parent does NOT see:** any reference to AI, queues, generation time, or automation.

---

### STAGE 2 — AI Draft Generation
**Owner:** AI Pipeline (fully automated, invisible to customer)  
**Customer-visible status:** *"Your story is being crafted by our editorial team."* *(no change)*

**What happens:**
1. AI pipeline picks up the order from queue
2. Generates full story draft (800–1,500 words depending on child age):
   - Age 2–4: 400–600 words, simple sentences, repetition
   - Age 5–7: 700–1,000 words, one narrative arc
   - Age 8–12: 1,100–1,500 words, richer vocabulary, subplot
3. Generates illustration prompts for 6–8 scenes
4. Runs internal QA scoring (language coherence, value alignment, cultural check)
5. If QA score ≥ 80: status → `DRAFT_READY`, enters editor queue
6. If QA score < 80: auto-regenerate once (max 1 retry), then escalate to editor with flag
7. Draft stored in platform — editor sees it, customer never does

**SLA:** AI draft generated within **5 minutes** of order placement.

---

### STAGE 3 — Editorial Review
**Owner:** Human Editor  
**Customer-visible status:** *"Your story is being reviewed by our editorial team."*

**What the editor sees in their dashboard:**
- Child profile summary (name, age, personality, goal)
- Full AI-generated story draft
- QA score and any auto-flagged issues
- Illustration prompts
- Parent's special notes
- Order timestamp + SLA countdown

**What the editor must do:**
1. Read the full story end-to-end
2. Assess against the editorial checklist (see Part 3)
3. Make inline edits directly in the platform — language, tone, narrative flow
4. Verify cultural and emotional appropriateness
5. Confirm the story delivers on the stated goal / lesson
6. Choose one of three actions:

| Action | Meaning | Next Step |
|--------|---------|-----------|
| **APPROVE** | Story meets all standards | → Stage 4 (Packaging) |
| **REVISE & RESUBMIT** | Story needs AI regeneration with editor notes | → Stage 2 re-runs with editor's revision brief |
| **EDITOR REWRITE** | Story is too far off; editor writes manually | → Stage 4 after editor completes rewrite |

**SLA:** Editor review completed within **4–8 hours** of draft being ready (target: 4h business hours).

---

### STAGE 4 — Approval & Packaging
**Owner:** Platform (automated after editor approval)  
**Customer-visible status:** *"Your story is almost ready — final touches in progress."*

**What happens:**
1. Editor clicks APPROVE — story is locked (no further edits)
2. Platform triggers packaging pipeline:
   - Renders final PDF (story + illustrations + cover page)
   - Generates images from approved illustration prompts (DALL-E / Stable Diffusion)
   - Images downloaded immediately and stored in Supabase Storage (URLs never expire)
   - Cover page generated with child's name in Arabic calligraphy style
   - PDF assembled with layout template (age-appropriate font sizes, RTL)
3. Delivery link generated — unique, secure, accessible for 1 year
4. Status → `DELIVERED`

**SLA:** Packaging completes within **15 minutes** of editor approval.

---

### STAGE 5 — Delivery to Customer
**Owner:** Platform (automated)  
**Customer-visible status:** *"Your story is ready!"*

**What the customer receives:**
1. Push notification + email:
   > *"قصة [اسم الطفل] جاهزة! 🎉"*
   > *"[Child's name]'s story is ready. Tap to read, download, or share."*
2. In-app story reader (RTL, illustrated, full-screen)
3. Download button (PDF)
4. Share button (WhatsApp / link)
5. Optional: "Order printed book" upsell

**What the customer is never told:** that AI was involved, how long generation took, or that a human reviewed it (implied, not stated explicitly — unless they ask).

---

## PART 3 — EDITORIAL CHECKLIST

Every editor must verify the following before approving:

### Language Quality
- [ ] Correct Arabic grammar and syntax throughout
- [ ] Vocabulary appropriate for child's age group
- [ ] Sentence length suitable for age (short + repetitive for <5, richer for 8+)
- [ ] Dialect consistent throughout (no dialect mixing unless intentional)
- [ ] No awkward translated phrases or unnatural constructions

### Cultural Appropriateness
- [ ] Names, places, and references are culturally authentic
- [ ] No Western cultural assumptions embedded (holidays, food, norms)
- [ ] Islamic/Arab values respected (where relevant to the family's context)
- [ ] No stereotypes, caricatures, or reductive cultural portrayals
- [ ] Imagery descriptions are modest and culturally appropriate

### Emotional Safety
- [ ] No content that could frighten, distress, or confuse a child of this age
- [ ] No ambiguous moral messaging
- [ ] The stated goal / lesson is delivered clearly and naturally (not didactically)
- [ ] Story ends with resolution — child feels safe, empowered, or understood
- [ ] No adult themes, conflict escalation beyond age-appropriate level

### Personalization Quality
- [ ] Child's name appears naturally throughout (not just inserted mechanically)
- [ ] Personality traits described by the parent are reflected in the child character
- [ ] Parent's special notes have been incorporated where possible
- [ ] Story feels written *for this child*, not a generic template

### Narrative Quality
- [ ] Clear beginning, middle, end
- [ ] Protagonist (the child) drives the story — they act, choose, overcome
- [ ] Supporting characters serve the story (not distracting)
- [ ] Pacing appropriate for age group
- [ ] Story is enjoyable to read aloud

---

## PART 4 — ROLE DEFINITIONS

### The AI Pipeline
**Role:** Draft Creator and Speed Layer  
**What it does:**
- Generates the first draft of every story
- Produces illustration prompts
- Runs initial automated QA scoring
- Re-generates drafts on editor revision request
- Handles all packaging and rendering (PDF, images)

**What it does NOT do:**
- Make final quality decisions
- Approve stories for delivery
- Interact with customers
- Override editor judgment

**How it is referred to internally:** "the pipeline" or "draft engine"  
**How it is referred to externally (to customers):** never directly mentioned

---

### The Human Editor
**Role:** Quality Authority and Brand Guardian  
**What they do:**
- Review every story before delivery — no exceptions
- Make inline edits to improve language, tone, and cultural fit
- Apply the editorial checklist
- Approve, revise, or rewrite
- Flag systemic AI quality issues to the content team
- Maintain the editorial standard that defines the Hikayati brand

**What they do NOT do:**
- Generate stories from scratch (except in EDITOR REWRITE cases)
- Communicate directly with customers
- Override the order parameters (child profile, goal) set by the parent

**Editor profile (target hire):**
- Native Arabic speaker
- Background in children's literature, education, journalism, or linguistics
- Sensitivity to child development and age-appropriate content
- Available for async review shifts (morning / evening)

---

### The Platform
**Role:** Orchestration Layer  
**What it does:**
- Receives orders, manages queue, routes to AI and editor
- Tracks status at every stage
- Enforces SLAs and escalates when breached
- Handles packaging, delivery, and notification
- Surfaces editor dashboard and customer-facing progress
- Collects feedback post-delivery

---

## PART 5 — STATUS LIFECYCLE

```
NEW_ORDER
    │
    ▼
DRAFT_GENERATING  (AI working — target: <5 min)
    │
    ├──[QA < 80]──▶ DRAFT_FLAGGED ──▶ DRAFT_GENERATING (retry)
    │                                       │
    │                              [2nd fail]▼
    │                               ESCALATED_TO_EDITOR
    ▼
DRAFT_READY
    │
    ▼
UNDER_REVIEW  (Editor working — target: <4h business hours)
    │
    ├──[REVISE]──▶ REVISION_REQUESTED ──▶ DRAFT_GENERATING
    │
    ├──[REWRITE]──▶ EDITOR_REWRITING
    │                    │
    │                    ▼
    │               UNDER_REVIEW (re-enters review after rewrite)
    │
    └──[APPROVE]──▶ APPROVED
                        │
                        ▼
                   PACKAGING  (automated — target: <15 min)
                        │
                        ▼
                   DELIVERED ──▶ [customer notified]
                        │
                        ▼
                   [optional] FEEDBACK_RECEIVED
```

---

## PART 6 — EDGE CASES & HANDLING

### Edge Case 1: AI Draft Quality Fails Twice
**Trigger:** QA score < 80 after 2 AI generation attempts  
**Action:** Story escalated to editor with flag `LOW_QUALITY_DRAFT`  
**Editor instruction:** "AI draft did not meet quality threshold. Please review carefully or use Editor Rewrite option."  
**Customer impact:** None — SLA clock continues normally  
**Customer message:** No change — still sees "being prepared by our team"

---

### Edge Case 2: Editor Requests Revision (AI Regenerates)
**Trigger:** Editor selects REVISE & RESUBMIT, writes revision brief  
**Action:** Platform sends revision brief + original child profile back to AI pipeline; new draft generated; returns to UNDER_REVIEW  
**SLA impact:** Each revision cycle adds up to 30 minutes (AI) + restarts editor review  
**Max revisions:** 2 AI revision cycles before EDITOR REWRITE is required  
**Customer message:** No change

---

### Edge Case 3: SLA Breach — Editor Delay
**Trigger:** Story in UNDER_REVIEW for > 6 hours without action  
**Action:**
1. Platform sends alert to editor (push + email)
2. At 8 hours: alert escalated to editorial manager
3. At 12 hours: story auto-reassigned to next available editor
4. Customer receives proactive message:
   > *"فريقنا يعمل على قصة [اسم الطفل] — نعتذر عن التأخير الطفيف وسنُبلغك فور الانتهاء."*
   > *"Our team is still working on [child's name]'s story. We appreciate your patience and will notify you shortly."*

---

### Edge Case 4: Inappropriate or Impossible Request
**Trigger:** Parent's order parameters contain inappropriate content requests, impossible personalization, or content that cannot be safely fulfilled  
**Detection:** At order intake (automated filter) or during editorial review  
**Action:**
- Intake filter catches it: order rejected with polite guidance, no charge
- Editor catches it during review: order flagged, customer contacted manually by support team
**Customer message (if rejected at intake):**
> *"لم نتمكن من معالجة طلبك — يرجى مراجعة التعليمات أو التواصل مع فريق الدعم."*

---

### Edge Case 5: Delivery Link Expiry or Technical Failure
**Trigger:** Customer cannot access delivered story (link expired, PDF broken, etc.)  
**Action:** Customer contacts support → support regenerates delivery link within 2 hours  
**Policy:** Delivery links are valid for 12 months. Reactivation is free, always.

---

### Edge Case 6: Customer Requests Changes After Delivery
**Trigger:** Customer is dissatisfied with the story after delivery  
**Policy:**
- Within 24 hours of delivery: 1 free revision request allowed (re-enters UNDER_REVIEW)
- After 24 hours: revision available at 50% of original story price
- Full refund available within 24 hours if story is fundamentally wrong (wrong name, wrong age group, etc. — platform error)
**Customer message:**
> *"نريدك أن تكون سعيداً بقصة طفلك — تواصل معنا وسنصلح الأمر."*
> *"We want you to love your child's story. Reach out and we'll make it right."*

---

## PART 7 — SLA SUMMARY TABLE

| Stage | Owner | Target SLA | Maximum SLA | Breach Action |
|-------|-------|-----------|-------------|---------------|
| Order intake & validation | Platform | < 1 min | 5 min | Auto-alert engineering |
| AI draft generation | AI Pipeline | < 5 min | 15 min | Retry → escalate |
| Editor review | Human Editor | < 4h (business hours) | 8h | Manager alert → reassign |
| Packaging & rendering | Platform | < 15 min | 30 min | Auto-alert engineering |
| Delivery notification | Platform | < 1 min | 5 min | Auto-retry |
| **End-to-end (normal)** | | **< 5 hours** | **12 hours** | Customer proactive message |
| **End-to-end (with revision)** | | **< 8 hours** | **24 hours** | Customer update sent |

**Business hours definition (launch phase):** 08:00–22:00 GST (Gulf Standard Time), 7 days/week.  
**Outside business hours:** Orders queue. Customer sees: *"Your story will be reviewed by our team first thing tomorrow."*

---

## PART 8 — CUSTOMER-FACING MESSAGING BY STATUS

| Internal Status | What Customer Sees |
|---|---|
| NEW_ORDER | "We've received your order. Our team is preparing [name]'s story." |
| DRAFT_GENERATING | "Your story is being crafted by our editorial team." |
| DRAFT_READY / UNDER_REVIEW | "Your story is being reviewed by our editorial team." |
| REVISION_REQUESTED | "Your story is being reviewed by our editorial team." *(no change)* |
| APPROVED / PACKAGING | "Your story is almost ready — final touches in progress." |
| DELIVERED | "🎉 [Name]'s story is ready! Tap to read." |
| SLA BREACHED (>6h) | "Our team is still working on [name]'s story. We appreciate your patience." |
| ESCALATED / ERROR | "We're putting extra care into [name]'s story. We'll notify you shortly." |

**Rule:** The customer never sees a status that implies automation, failure, or technical processing. Every message implies a human team is actively working on their child's story.

---

## PART 9 — EDITOR OPERATIONS MODEL

### Launch Phase (0–500 orders/month)
- **Team:** 2–3 freelance editors, async shifts
- **Capacity per editor:** 8–12 stories/day (at 20–30 min review per story)
- **Total capacity:** 20–36 stories/day = 600–1,000/month
- **Cost:** $3–5 per story reviewed (freelance rate)
- **Management:** Editorial manager (part-time) handles QA, editor onboarding, escalations

### Growth Phase (500–3,000 orders/month)
- **Team:** 6–10 editors across time zones (GCC, Levant, Egypt, Europe)
- **Capacity:** 100–200 stories/day
- **Specialization begins:** editors by dialect, by age group, by developmental theme
- **Cost target:** $2–3 per story (volume + efficiency)

### Scale Phase (3,000+ orders/month)
- **Team:** Full editorial department
- **Senior editors:** Review junior editor work on complex stories
- **Editor scoring system:** Track approval rate, revision rate, customer NPS per editor
- **AI-assisted review:** AI flags specific issues for editor attention (reduces review time from 25 min → 12 min)

---

*Document owner: Hassan Al-Alewee*  
*Next action: Use this workflow to design the Editor Dashboard UI (feeds into 05_UI_UX_WIREFRAMES.md v2.0)*
