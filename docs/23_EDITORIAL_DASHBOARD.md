# Hikayati — Editorial Dashboard Design v1.0
**Human Quality Control System**

> Status: APPROVED FOR DESIGN & IMPLEMENTATION  
> Version: 1.0  
> Date: 2026-06-27  
> Depends on: 20_BUSINESS_FOUNDATION_v2.0.md, 21_OPERATIONAL_WORKFLOW.md, 22_TECHNICAL_ARCHITECTURE_v2.0.md

---

## DESIGN PHILOSOPHY

The editorial dashboard is the engine room of Hikayati. It is not a tech tool — it is a **professional publishing workspace**. Every design decision should make an Arabic-language editor feel like they are working at a respected publishing house, not using a content management system.

**Design references:** The New Yorker's editorial workflow, Grammarly's inline editing, Notion's clean document feel — combined with Arabic-first RTL layout.

**What this must feel like:** Calm, focused, craft-oriented. Not noisy, not gamified, not corporate.

**What it must never feel like:** A helpdesk ticket system, a CMS backend, a data table.

---

## PART 1 — USER ROLES & PERMISSIONS

### Role: Editor

**Access:**
- Queue: sees all `draft_ready` and `under_review` orders
- Can claim any unclaimed order from the queue
- Full edit access to their assigned orders only
- Can run AI Assist actions on their assigned orders
- Can approve, request revision, or initiate rewrite on their assigned orders
- Cannot approve another editor's order
- Cannot access admin metrics or editor management

**Cannot access:**
- Other editors' claimed orders (read-only view only)
- Admin metrics dashboard
- User management
- Order reassignment

---

### Role: Senior Editor / Editorial Manager

**Access:**
- Everything an Editor can do
- Can view all in-progress orders regardless of assignment
- Can reassign orders from one editor to another
- Can override a revision request and force-approve
- Can view editor performance metrics (stories reviewed, avg review time, revision rate)
- Receives SLA breach alerts

---

### Role: Admin

**Access:**
- Everything Senior Editor can do
- Full order management (cancel, refund trigger, manual status override)
- User management (create/deactivate editor accounts, assign roles)
- Platform metrics dashboard (orders per day, avg delivery time, editor utilization)
- System configuration (SLA thresholds, QA score minimum)

---

## PART 2 — INFORMATION ARCHITECTURE

```
/editor                          ← redirects to /editor/queue
/editor/queue                    ← Main queue view (all editors see this)
/editor/queue?tab=new            ← Draft Ready — unclaimed
/editor/queue?tab=mine           ← Under Review — my assignments
/editor/queue?tab=revision       ← Revision Requested — returned to AI
/editor/queue?tab=approved       ← Approved today (read-only)

/editor/orders/[id]              ← Story workspace (full editing environment)
/editor/orders/[id]/history      ← Version history for this order

/admin                           ← Admin home → redirects to /admin/overview
/admin/overview                  ← Platform metrics
/admin/orders                    ← All orders, filterable
/admin/editors                   ← Editor management
/admin/orders/[id]               ← Admin view of any order (override actions)
```

---

## PART 3 — QUEUE SCREEN (`/editor/queue`)

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  حكايتي — لوحة التحرير                          [أحمد ▾]  [تسجيل خروج] │
│  Hikayati Editorial                                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  جاهز للمراجعة (4)  │  قيد المراجعة (2)  │  طلب مراجعة (1)  │  │
│  │  Ready for Review   │  Under Review      │  Revision         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌── ORDER CARD ───────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │  ● DRAFT READY                          SLA: 3h 24m left   │   │
│  │                                                              │   │
│  │  قصة سارة                                                   │   │
│  │  "Sarah's Story"                                             │   │
│  │                                                              │   │
│  │  Sarah, 6 years old  •  Gulf Arabic  •  Courage             │   │
│  │  Ordered 2h ago  •  QA Score: 87/100                        │   │
│  │                                                              │   │
│  │  Special notes: "Sarah is afraid of the dark"               │   │
│  │                                                              │   │
│  │                                    [  Claim & Review  →  ]  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌── ORDER CARD ───────────────────────────────────────────────┐   │
│  │                                                              │   │
│  │  ⚠ DRAFT READY — LOW QA SCORE           SLA: 1h 52m left   │   │
│  │                                                              │   │
│  │  قصة يوسف                                                   │   │
│  │  "Youssef's Story"                                           │   │
│  │                                                              │   │
│  │  Youssef, 4 years old  •  MSA  •  Sharing                   │   │
│  │  Ordered 4h ago  •  QA Score: 71/100  ⚠ Needs attention     │   │
│  │                                                              │   │
│  │  Flags: "repetitive sentence structure", "tone too formal"  │   │
│  │                                                              │   │
│  │                                    [  Claim & Review  →  ]  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Order Card Design Rules

Each card shows:
- **Status badge** — color-coded dot: green (ready), amber (low QA), red (SLA < 1h), blue (mine/under review)
- **Story title in Arabic** — large, prominent
- **Child profile summary** — name, age, dialect, goal — one line
- **Time ordered + QA score** — secondary info
- **AI flags** — only shown if QA score < 80, truncated to 2 flags
- **Special notes excerpt** — parent's personalization notes, truncated to 80 chars
- **SLA countdown** — always visible, turns amber < 2h, red < 1h
- **Primary action** — "Claim & Review" (unclaimed) or "Continue Review" (claimed by me)

### Queue Tab Behavior

| Tab | What it shows | Who can claim |
|---|---|---|
| Ready for Review | `draft_ready`, unassigned | Any editor |
| Under Review | `under_review`, assigned to me | — (already mine) |
| Revision | `revision_requested` — AI re-generating | Read-only, no action |
| Approved Today | `approved`, delivered today | Read-only |

### Sorting Logic
1. SLA deadline (ascending — most urgent first)
2. Then QA score (ascending — lowest quality needs most attention)
3. Low QA score orders are never buried

---

## PART 4 — STORY WORKSPACE (`/editor/orders/[id]`)

This is the most important screen in the system. Everything else serves this.

### Layout: Three-Column Workspace

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Queue    قصة سارة — Sarah, 6y, Courage, Gulf Arabic         SLA: 3h 22m  │
├──────────────┬──────────────────────────────────┬──────────────────────────┤
│              │                                  │                          │
│  LEFT PANEL  │       CENTER: EDITOR             │   RIGHT PANEL            │
│  (280px)     │       CANVAS (flex)              │   (320px)                │
│              │                                  │                          │
│  Child       │  ┌────────────────────────────┐  │  Quality Checklist       │
│  Profile     │  │  AI Draft  │  My Edit       │  │                          │
│              │  ├────────────┤────────────────┤  │  AI Assist               │
│  Story       │  │            │                │  │                          │
│  Brief       │  │  [Draft    │  [Editable     │  │  Version History         │
│              │  │   text     │   text         │  │                          │
│  QA Report   │  │   read-    │   area -       │  │  Approval Actions        │
│              │  │   only]    │   RTL]         │  │                          │
│  Order       │  │            │                │  │                          │
│  Timeline    │  │            │                │  │                          │
│              │  └────────────┴────────────────┘  │                          │
│              │                                  │                          │
└──────────────┴──────────────────────────────────┴──────────────────────────┘
```

---

### Left Panel — Context

#### Child Profile Card
```
┌─────────────────────────────┐
│  👧  Sarah                  │
│  6 years old  •  Female     │
│                             │
│  Personality                │
│  [curious] [brave] [shy]   │
│                             │
│  Story Goal                 │
│  Overcoming fear / Courage  │
│                             │
│  Dialect                    │
│  Gulf Arabic (خليجي)        │
│                             │
│  Parent's Notes             │
│  "Sarah is afraid of the   │
│  dark and refuses to sleep  │
│  alone. She loves cats."    │
└─────────────────────────────┘
```

#### QA Report Card
```
┌─────────────────────────────┐
│  AI Quality Score  87/100   │
│  ████████████████░░░        │
│                             │
│  ✓ Language structure       │
│  ✓ Age-appropriate          │
│  ✓ Goal delivered           │
│  ⚠ Tone slightly formal     │
│  ⚠ Ending feels rushed      │
└─────────────────────────────┘
```

#### Order Timeline
```
┌─────────────────────────────┐
│  Order Timeline             │
│                             │
│  ✓ 10:24  Order placed      │
│  ✓ 10:29  Draft generated   │
│  ✓ 10:31  QA passed (87)   │
│  ● 10:31  In your queue     │
│  ○        Awaiting review   │
│  ○        Packaging         │
│  ○        Delivered         │
└─────────────────────────────┘
```

---

### Center Panel — Editorial Canvas

This is where the editor reads, compares, and writes.

#### Dual-View Toggle
Two modes, toggled by the editor:

**Mode 1: Side-by-Side**
- Left half: AI draft (read-only, soft background)
- Right half: Editor's working copy (editable, white background)
- Differences highlighted automatically
- Editor can copy any paragraph from draft to working copy with one click

**Mode 2: Focus Mode**
- Full-width editable area
- AI draft collapsed to a slide-out panel (accessible via hover/click)
- Better for editors who prefer to rewrite rather than edit

#### Editor Canvas — Detail
```
┌──────────────────────────────────────────────────────────────────┐
│  AI Draft (read-only)          │  Your Edit                      │
│  ─────────────────────────     │  ─────────────────────────      │
│                                │                                  │
│  كانت سارة طفلةٌ صغيرة تحبّ   │  كانت سارة طفلةً صغيرةً تُحِبّ  │
│  اللعب في النهار، ولكنها        │  اللعب في ضوء النهار، غير أنّها  │
│  كانت تخشى الظلام في الليل.   │  كانت تخشى الظلام حين يأتي الليل│
│                                │                                  │
│  [⊕ Copy paragraph]           │                                  │
│                                │                                  │
│  في يومٍ من الأيام، جلست سارة  │  ذاتَ يومٍ، جلسَت سارةُ مع     │
│  مع أمّها وقالت لها: "أنا      │  أمّها وهمسَت لها: "أمّي، أنا   │
│  خائفة من الظلام يا أمّي."    │  خائفةٌ من الظلام."             │
│                                │                                  │
│  [⊕ Copy paragraph]           │  [💬 Add comment]               │
│                                │                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Inline Comment System
- Editor can highlight any text in their working copy and add a comment
- Comments are stored and visible in version history
- Comments are internal only — never visible to the customer
- Use cases: "Changed from formal to warm register", "Simplified vocabulary for age 6", "Added cat reference from parent notes"

#### Illustration Prompts Panel
Below the story text, a collapsible section shows the AI-generated illustration prompts.
- Editor can edit any prompt
- Editor can flag a prompt as needing revision
- These feed directly into the DALL-E generation step

---

### Right Panel — Actions & Tools

#### Quality Checklist

The checklist mirrors the editorial standards from `21_OPERATIONAL_WORKFLOW.md`. Every item must be checked before APPROVE becomes active.

```
┌──────────────────────────────┐
│  Quality Checklist           │
│                              │
│  Language Quality            │
│  ☐ Grammar correct          │
│  ☐ Age-appropriate vocab    │
│  ☐ Dialect consistent       │
│  ☐ Natural flow             │
│                              │
│  Cultural Appropriateness    │
│  ☐ Culturally authentic     │
│  ☐ No inappropriate refs    │
│  ☐ Values respected         │
│                              │
│  Emotional Safety            │
│  ☐ Nothing frightening      │
│  ☐ Positive resolution      │
│  ☐ Age-appropriate conflict │
│                              │
│  Personalization             │
│  ☐ Child's name feels natural│
│  ☐ Personality reflected    │
│  ☐ Parent's notes included  │
│                              │
│  Narrative Quality           │
│  ☐ Clear arc (begin/mid/end)│
│  ☐ Child is the hero        │
│  ☐ Enjoyable to read aloud  │
│                              │
│  17 / 17 ✓                  │
│  [APPROVE] button unlocks ↓ │
└──────────────────────────────┘
```

**Checklist behavior:**
- All 17 items must be checked for APPROVE to activate
- Items can be checked in any order
- Unchecking an item re-locks the APPROVE button
- If editor tries to approve with unchecked items, a polite blocking message appears: "يرجى إكمال قائمة الجودة قبل الموافقة" (Please complete the quality checklist before approving)

---

#### AI Assist Panel

```
┌──────────────────────────────┐
│  AI Assist                   │
│  ─────────────────────────── │
│  Select text, then:          │
│                              │
│  [↻ Regenerate paragraph]   │
│  [✦ Improve Arabic quality] │
│  [↓ Simplify for age 6]     │
│  [🌙 Soften emotional tone] │
│                              │
│  Or for the full story:      │
│  [↻ Regenerate full draft]  │
│                              │
│  ─────────────────────────── │
│  Last AI suggestion:         │
│  "ذاتَ يومٍ، جلسَت سارةُ..."  │
│  [Accept] [Discard]          │
└──────────────────────────────┘
```

**AI Assist behavior rules:**
- All AI suggestions appear in a preview pane — never applied automatically
- Editor must explicitly click ACCEPT to apply any suggestion
- Suggestions are shown inline with a soft highlight, not replacing text directly
- Full story regeneration is a separate action that requires confirmation modal:
  > "هذا سيُنشئ مسودة جديدة بالكامل. هل أنت متأكد؟ / This will create a completely new draft. Are you sure?"
- AI Assist calls the same Claude API used for story generation — same model, smaller targeted prompt
- All AI Assist actions are logged in order_events (actor_type: 'editor', event_type: 'ai_assist_used')

---

#### Approval Actions

This section is at the bottom of the right panel, always visible.

```
┌──────────────────────────────┐
│  Your Decision               │
│  ─────────────────────────── │
│                              │
│  [  ✓  APPROVE STORY  ]     │  ← green, unlocks when checklist done
│                              │
│  ─────────────────────────── │
│                              │
│  [  ↻  Request Revision  ]  │  ← amber
│                              │
│  Revision brief (required):  │
│  ┌────────────────────────┐  │
│  │                        │  │
│  └────────────────────────┘  │
│                              │
│  [  ✎  I'll Rewrite This ]  │  ← gray
│                              │
└──────────────────────────────┘
```

**APPROVE action:**
- Requires all 17 checklist items checked
- Shows confirmation modal: "هل أنت متأكد من الموافقة؟ سيتم إرسال القصة للتغليف مباشرةً." (Are you sure? The story will proceed to packaging immediately.)
- On confirm: order status → `approved`, Inngest `story/package.deliver` triggered, editor released from order, order moves to Approved tab in queue

**Request Revision action:**
- Requires a revision brief (textarea, min 20 characters)
- Brief is sent to the AI pipeline as context for regeneration
- On submit: order status → `revision_requested`, revision_count incremented
- If revision_count = 2: "Request Revision" button is disabled; editor must use "I'll Rewrite This" or Approve
- Editor sees a confirmation: "تم إرسال طلب المراجعة — ستعود القصة إلى قائمتك بمجرد إنشاء المسودة الجديدة." (Revision request sent — the story will return to your queue once the new draft is ready.)

**I'll Rewrite This action:**
- Sets an internal `editor_rewrite = true` flag on the draft
- Story stays in `under_review`, same editor
- AI draft is collapsed; editor canvas switches to full-width Focus Mode
- Editor writes the story manually in the editing canvas
- When done, they complete the checklist and approve normally
- Rewritten stories are tracked in metrics as "editor rewrite" — flags for AI quality review downstream

---

## PART 5 — VERSION HISTORY (`/editor/orders/[id]/history`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ← Back to Editor    Version History — قصة سارة                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  v3 — CURRENT (Approved)                                     │  │
│  │  By: Ahmed Al-Rashidi  •  27 Jun 2026, 14:32                 │  │
│  │  Changes: "Revised ending, simplified vocabulary in para 4,  │  │
│  │  added cat reference from parent notes"                      │  │
│  │                                    [View]                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  v2 — AI Draft (after revision request)                      │  │
│  │  By: AI System  •  27 Jun 2026, 13:15                        │  │
│  │  Revision brief: "The ending feels abrupt. The child should  │  │
│  │  arrive at courage herself, not be told by the mother."      │  │
│  │  QA Score: 91/100                                            │  │
│  │                                    [View]  [Compare to v3]   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  v1 — AI Draft (original)                                    │  │
│  │  By: AI System  •  27 Jun 2026, 10:29                        │  │
│  │  QA Score: 87/100                                            │  │
│  │  Flags: "tone slightly formal", "ending feels rushed"        │  │
│  │                                    [View]  [Compare to v2]   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

- All versions are read-only after superseded
- "Compare" shows a diff view (additions in green, deletions in red) — RTL aware
- Cannot restore a previous version after approval

---

## PART 6 — ADMIN DASHBOARD (`/admin`)

### Metrics Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  لوحة إدارة حكايتي — Hikayati Admin                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────┐ │
│  │  Today       │  │  In Queue    │  │  Avg Review  │  │  SLA   │ │
│  │  14 orders   │  │  4 pending   │  │  3h 12m      │  │  98%   │ │
│  │  11 delivered│  │  2 in review │  │              │  │  met   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────┘ │
│                                                                     │
│  Editor Utilization                                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Ahmed Al-Rashidi   ████████████████░░░░  5 today / 8 cap   │  │
│  │  Nora Khalid        ████████████░░░░░░░░  4 today / 8 cap   │  │
│  │  Lina Sabbagh       ░░░░░░░░░░░░░░░░░░░░  0 today (offline) │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  SLA Alerts                                                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  🔴  Order #4821 — 47 minutes left — UNCLAIMED               │  │
│  │      قصة محمد  •  Youssef, 4y  •  MSA                        │  │
│  │      [Assign to Ahmed]  [Assign to Nora]                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Admin Order Management

Filterable table of all orders:
- Filter by: status, editor, date range, dialect, story goal, SLA breach
- Columns: Order ID, Child Name, Status, Editor Assigned, Time in Status, SLA
- Row actions: View, Reassign Editor, Force Approve (admin only), Cancel

### Editor Performance View

Per-editor stats:
- Stories reviewed today / this week / this month
- Average review time (minutes)
- Revision request rate (%)
- Rewrite rate (%)
- Customer NPS on their approved stories (future, when feedback is collected)

---

## PART 7 — DESIGN SYSTEM (EDITORIAL LAYER)

### Color Palette (Editorial — distinct from customer UI)

| Token | Value | Usage |
|---|---|---|
| `editorial-bg` | `#FAFAF8` | Main background — warm off-white, paper-like |
| `editorial-surface` | `#FFFFFF` | Cards and panels |
| `editorial-border` | `#E8E4DC` | Subtle borders — warm gray |
| `editorial-text-primary` | `#1A1814` | Main text — near-black, warm |
| `editorial-text-secondary` | `#6B6560` | Labels, metadata |
| `status-ready` | `#16A34A` | Draft ready badge |
| `status-review` | `#2563EB` | Under review badge |
| `status-urgent` | `#DC2626` | SLA breach, urgent |
| `status-warning` | `#D97706` | Low QA score, approaching SLA |
| `status-approved` | `#059669` | Approved |
| `ai-draft-bg` | `#F0F4FF` | AI draft column tint — subtle blue |
| `editor-draft-bg` | `#FFFFFF` | Editor working copy — clean white |
| `checklist-checked` | `#059669` | Checked item |
| `checklist-unchecked` | `#D1CEC9` | Unchecked item |

### Typography

| Role | Font | Size | Weight |
|---|---|---|---|
| Arabic story text (editing) | Cairo | 18px | 400 |
| Arabic UI labels | Noto Sans Arabic | 14px | 500 |
| Story title (queue card) | Cairo | 20px | 700 |
| English labels | Inter | 13px | 400 |
| Checklist items | Noto Sans Arabic | 14px | 400 |
| SLA countdown | Inter Mono | 13px | 600 |

**Story canvas font size:** 18px minimum — editors are reading Arabic text for quality assessment; smaller type causes fatigue and errors.

### RTL Behavior

The entire editorial dashboard is RTL. Key rules:
- Arabic text always right-aligned
- Panel layout: Left panel is on the RIGHT in RTL (context panel), Right panel is on the LEFT (actions panel)
- The side-by-side editor: AI draft on the right, editor's copy on the left (reading direction)
- Queue cards: metadata flows right-to-left
- Action buttons: primary action (Approve) on the right, secondary (Revise) on the left
- Icons: directional icons (arrows, chevrons) must be mirrored for RTL

### Component States

**Queue Card:**
- Default → hover (subtle shadow lift) → claimed (blue left border) → SLA urgent (red left border)

**Checklist Item:**
- Unchecked → hover → checked (green tick, line-through text) → all-checked (section header turns green)

**Approve Button:**
- Locked (gray, disabled, tooltip: "Complete checklist first") → unlocked (green, pulsing once) → confirm modal → processing → done

**AI Assist Suggestion:**
- Pending → accepted (green flash, replaces text) → discarded (fades out)

---

## PART 8 — EDITOR ONBOARDING

New editors must complete before accessing the queue:

1. **Platform orientation** (10 min) — what Hikayati is, who the customers are, why the editorial step matters
2. **Editorial standards guide** — the 17-point checklist explained with examples and anti-examples
3. **Arabic style guide** — dialect-specific guidance (Gulf, MSA, Levantine, Egyptian), vocabulary lists by age group, tone register examples
4. **Practice review** — 2 test stories (one good, one with deliberate issues) — editor must identify all issues and approve/revise correctly
5. **Shadow review** — first 3 live stories reviewed alongside a senior editor before going solo

---

## PART 9 — KEY UX PRINCIPLES SUMMARY

1. **The story is the product.** The UI exists to serve the story, not the other way around. Maximum space goes to text. Minimum chrome.

2. **Never lose the editor's work.** Auto-save every 10 seconds on the working copy. If the editor closes the browser, their edits are preserved. A "Resume where you left off" banner appears on next login.

3. **Context is always visible.** The child profile and parent notes are never more than a glance away. Editors should never have to open a separate tab to remember what the story is supposed to do.

4. **The checklist is not bureaucracy.** Frame it as a professional standard, not a compliance form. Language: "Your quality review" not "Required fields."

5. **AI assist is a tool, not a crutch.** AI suggestions are always labeled as AI suggestions. The editor's voice and judgment are the product. Design reinforces this: AI suggestions appear in a different visual register (blue-tinted, labeled "AI suggestion"), editor's text is always on white.

6. **Urgency is honest.** SLA countdowns are always visible, but they are not designed to create panic. Amber at 2h, red at 1h — calm, professional, like a production schedule, not a ticking bomb.

7. **Every action is recoverable except Approve.** Edits auto-save. Revision requests can be accompanied by notes. Approve is the one irreversible action — and it has a confirmation step for that reason.

---

*Document owner: Hassan Al-Alewee*  
*Next action: Design the Customer-Facing Order Experience (story request form, status page, story reader) to match this editorial quality standard.*
