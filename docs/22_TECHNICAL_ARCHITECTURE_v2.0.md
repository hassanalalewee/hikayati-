# Hikayati — Lean Technical Architecture v2.0
**MVP System Design: Human-Led Publishing Platform**

> Status: APPROVED FOR IMPLEMENTATION  
> Version: 2.0 — Supersedes 02_ARCHITECTURE.md and 19_APPROVED_TECHNICAL_FOUNDATION_v1.0.md  
> Date: 2026-06-27  
> Depends on: 20_BUSINESS_FOUNDATION_v2.0.md, 21_OPERATIONAL_WORKFLOW.md

---

## PART 1 — ARCHITECTURE OVERVIEW

### What Changed From v1.0

| Dimension | v1.0 (Deprecated) | v2.0 (This Document) |
|---|---|---|
| Core model | Fully automated AI pipeline | Human-in-the-loop publishing workflow |
| Queue system | Inngest (durable AI job queue) | Inngest (durable editorial workflow queue) |
| AI agents | 6-agent pipeline, auto-approved | AI draft only — human approval required |
| Story delivery | Auto-delivered after QA score | Delivered only after editor APPROVE action |
| Real-time updates | SSE / Supabase Realtime for generation progress | Supabase Realtime for order status updates |
| New surface | None | Editor Dashboard (internal tool) |
| Status model | generation job statuses | Order state machine (7 states) |

### System Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     CUSTOMER LAYER                          │
│         Next.js App — story request, reader, library        │
└─────────────────────────────────────────────────────────────┘
                            │  │
              Supabase Auth  │  │  Supabase Realtime
                            ▼  ▼
┌─────────────────────────────────────────────────────────────┐
│                     API LAYER                               │
│           Next.js API Routes (/api/v1/*)                    │
│     Zod validation │ RLS enforced │ Response envelope       │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        Supabase DB    Supabase       Inngest
        (PostgreSQL)   Storage        (Workflow Queue)
                                          │
                              ┌───────────┼───────────┐
                              ▼           ▼           ▼
                           Claude      OpenAI      Resend
                         (story draft) (images)   (email)
┌─────────────────────────────────────────────────────────────┐
│                   EDITOR LAYER (Internal)                   │
│          Next.js App — /editor/* (role-gated)               │
│    Review queue │ Inline edit │ Approve / Revise / Rewrite  │
└─────────────────────────────────────────────────────────────┘
                            │
                      Supabase DB
                  (same DB, editor role)
```

### Non-Goals (Explicitly Out of Scope for MVP)
- No microservices or separate backend service
- No multi-agent orchestration framework
- No AI gateway or model routing layer
- No distributed systems or message brokers beyond Inngest
- No real-time collaborative editing
- No mobile app
- No audio narration (v2 feature)

---

## PART 2 — DATABASE SCHEMA

### Design Principles
- Single PostgreSQL database via Supabase
- Row-Level Security (RLS) on every table — no exceptions
- Soft deletes on all user-owned data (`deleted_at`)
- Audit log on all critical mutations
- No raw SQL in application code — use Supabase client or RPC functions

---

### Table: `users` (managed by Supabase Auth)
Supabase Auth handles the `auth.users` table. We extend it with a profile.

```sql
create table public.user_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  email        text not null,
  role         text not null default 'parent'  -- 'parent' | 'editor' | 'admin'
               check (role in ('parent', 'editor', 'admin')),
  ai_consent   boolean not null default false,
  consent_at   timestamptz,
  locale       text default 'ar',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
```

---

### Table: `children`
```sql
create table public.children (
  id              uuid primary key default gen_random_uuid(),
  parent_id       uuid not null references public.user_profiles(id),
  name            text not null,
  age             smallint not null check (age between 2 and 12),
  gender          text check (gender in ('male', 'female', 'unspecified')),
  personality     text[] not null default '{}',  -- ['curious', 'brave', ...]
  photo_url       text,                          -- Supabase Storage path
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
```

---

### Table: `orders`
The central table. Every story request is an order with a lifecycle.

```sql
create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  idempotency_key     text unique not null,         -- prevent duplicate submissions
  parent_id           uuid not null references public.user_profiles(id),
  child_id            uuid not null references public.children(id),

  -- Order parameters (what the parent requested)
  story_goal          text not null,                -- 'honesty' | 'courage' | etc.
  dialect             text not null default 'msa'
                      check (dialect in ('msa', 'gulf', 'levantine', 'egyptian')),
  special_notes       text,
  age_group           text not null
                      check (age_group in ('2-4', '5-7', '8-12')),

  -- State machine
  status              text not null default 'pending'
                      check (status in (
                        'pending',
                        'draft_generating',
                        'draft_ready',
                        'under_review',
                        'revision_requested',
                        'approved',
                        'packaging',
                        'delivered',
                        'failed',
                        'cancelled'
                      )),

  -- Assignments
  assigned_editor_id  uuid references public.user_profiles(id),
  inngest_run_id      text,                         -- for tracking Inngest job

  -- SLA tracking
  draft_ready_at      timestamptz,
  review_started_at   timestamptz,
  approved_at         timestamptz,
  delivered_at        timestamptz,
  sla_deadline        timestamptz,                  -- calculated on creation

  -- Billing
  stripe_payment_intent_id  text,
  amount_paid               integer,                -- in fils/halalat (smallest unit)
  currency                  text default 'AED',

  -- Metadata
  revision_count      smallint not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);
```

---

### Table: `story_drafts`
Each AI generation attempt for an order. Multiple drafts per order (revisions).

```sql
create table public.story_drafts (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id),
  version         smallint not null default 1,      -- increments on each revision
  is_active       boolean not null default true,    -- only one active draft per order

  -- Content (AI-generated, editor-modified)
  title           text,
  content         text,                             -- full story text in Arabic
  word_count      smallint,
  qa_score        smallint,                         -- 0–100, from AI QA agent
  qa_flags        jsonb default '[]',               -- issues flagged by AI QA

  -- Editor work
  editor_id       uuid references public.user_profiles(id),
  editor_notes    text,                             -- editor's notes / revision brief
  edited_content  text,                             -- content after editor edits
  edited_at       timestamptz,

  -- Generation metadata
  model_used      text,
  prompt_tokens   integer,
  completion_tokens integer,
  generation_ms   integer,

  created_at      timestamptz not null default now()
);

-- Only one active draft per order
create unique index on public.story_drafts(order_id) where is_active = true;
```

---

### Table: `illustration_prompts`
```sql
create table public.illustration_prompts (
  id          uuid primary key default gen_random_uuid(),
  draft_id    uuid not null references public.story_drafts(id),
  scene_index smallint not null,                    -- 1–8
  prompt_text text not null,                        -- English prompt for DALL-E
  style_notes text,                                 -- cultural style guidance
  created_at  timestamptz not null default now()
);
```

---

### Table: `story_assets`
Permanent storage references. All files live in Supabase Storage — never temporary URLs.

```sql
create table public.story_assets (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id),
  draft_id        uuid references public.story_drafts(id),
  asset_type      text not null
                  check (asset_type in ('illustration', 'pdf', 'cover')),
  scene_index     smallint,                         -- for illustrations
  storage_path    text not null,                    -- Supabase Storage path (permanent)
  file_size_bytes integer,
  created_at      timestamptz not null default now()
);
```

---

### Table: `order_events` (Audit Log)
Append-only. Every status transition and editorial action is recorded.

```sql
create table public.order_events (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id),
  actor_id    uuid references public.user_profiles(id),  -- null = system
  actor_type  text not null check (actor_type in ('system', 'parent', 'editor', 'admin')),
  event_type  text not null,                        -- 'status_change' | 'editor_assigned' | 'revision_requested' | etc.
  from_status text,
  to_status   text,
  notes       text,
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now()
);
```

---

### Table: `subscriptions`
```sql
create table public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.user_profiles(id),
  stripe_subscription_id  text unique,
  stripe_customer_id      text,
  plan                    text not null check (plan in ('pay_per_story', 'personal', 'family', 'professional')),
  status                  text not null check (status in ('active', 'cancelled', 'past_due', 'trialing')),
  stories_remaining       smallint,                 -- null = unlimited
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
```

---

### Table: `processed_webhook_events`
Idempotency guard for Stripe webhooks.

```sql
create table public.processed_webhook_events (
  id              text primary key,                 -- Stripe event ID
  event_type      text not null,
  processed_at    timestamptz not null default now()
);
```

---

### Row-Level Security Policies (Key Rules)

```sql
-- Parents can only read their own orders
create policy "parent_read_own_orders" on public.orders
  for select using (parent_id = auth.uid());

-- Parents can only insert orders for themselves
create policy "parent_insert_own_orders" on public.orders
  for insert with check (parent_id = auth.uid());

-- Editors can read all non-deleted orders
create policy "editor_read_orders" on public.orders
  for select using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role in ('editor', 'admin')
    )
  );

-- Editors can update orders assigned to them (status, notes)
create policy "editor_update_assigned_orders" on public.orders
  for update using (
    assigned_editor_id = auth.uid() or
    exists (select 1 from public.user_profiles where id = auth.uid() and role = 'admin')
  );

-- Parents cannot read story_drafts (internal only)
create policy "editor_read_drafts" on public.story_drafts
  for select using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role in ('editor', 'admin')
    )
  );

-- Parents can read their own assets after order is delivered
create policy "parent_read_delivered_assets" on public.story_assets
  for select using (
    exists (
      select 1 from public.orders
      where id = order_id
        and parent_id = auth.uid()
        and status = 'delivered'
    )
  );
```

---

## PART 3 — ORDER STATE MACHINE

```
                    ┌─────────┐
                    │ PENDING │  ← order created, payment captured
                    └────┬────┘
                         │ Inngest job triggered
                         ▼
               ┌──────────────────┐
               │ DRAFT_GENERATING │  ← AI pipeline running
               └────────┬─────────┘
                        │
              ┌─────────┴──────────┐
              │ QA score check     │
         [≥80]│                    │[<80, retry]
              ▼                    ▼
       ┌────────────┐    ┌──────────────────┐
       │ DRAFT_READY│    │ DRAFT_GENERATING │ (retry, max 1)
       └─────┬──────┘    └────────┬─────────┘
             │                    │ [2nd fail]
             │             ┌──────┴──────┐
             │             │ DRAFT_READY │ (flagged for editor)
             │             └──────┬──────┘
             └──────────┬─────────┘
                        │ Editor assigned
                        ▼
               ┌──────────────────┐
               │   UNDER_REVIEW   │  ← editor working
               └────────┬─────────┘
                        │
           ┌────────────┼────────────┐
           │            │            │
     [APPROVE]   [REVISE &      [EDITOR
           │     RESUBMIT]      REWRITE]
           │            │            │
           │            ▼            │
           │  ┌──────────────────┐   │
           │  │REVISION_REQUESTED│   │
           │  └────────┬─────────┘   │
           │           │ Inngest      │
           │           │ re-runs AI   │
           │           ▼             │
           │  ┌──────────────────┐   │
           │  │ DRAFT_GENERATING │   │
           │  └────────┬─────────┘   │
           │           │             │
           │           └──────┬──────┘
           │                  │ back to UNDER_REVIEW
           ▼                  │ (max 2 revision cycles)
       ┌──────────┐           │
       │ APPROVED │◄──────────┘
       └────┬─────┘
            │ Inngest packaging job
            ▼
       ┌──────────┐
       │PACKAGING │  ← PDF render, image upload, link gen
       └────┬─────┘
            │
            ▼
       ┌──────────┐
       │DELIVERED │  ← customer notified
       └──────────┘

  [Any state] → FAILED    (unrecoverable error, needs manual intervention)
  [Any state] → CANCELLED (parent cancels before delivery)
```

### State Transition Rules

| From | To | Actor | Condition |
|---|---|---|---|
| pending | draft_generating | System | Payment confirmed |
| draft_generating | draft_ready | System | QA score ≥ 80 OR 2nd attempt complete |
| draft_generating | failed | System | Unrecoverable AI error |
| draft_ready | under_review | System | Editor auto-assigned |
| under_review | approved | Editor | Editor clicks APPROVE |
| under_review | revision_requested | Editor | Editor clicks REVISE |
| under_review | under_review | Editor | Editor rewrite complete |
| revision_requested | draft_generating | System | Inngest picks up revision job |
| approved | packaging | System | Immediate |
| packaging | delivered | System | PDF + images + link ready |
| any | failed | System | Unrecoverable error |
| any | cancelled | Parent/Admin | Before delivered |

---

## PART 4 — API DESIGN

### Conventions
- All routes prefixed `/api/v1/`
- Response envelope: `{ ok: boolean, data?: T, error?: { code: string, message: string } }`
- Auth: Supabase session cookie on all routes — no exceptions
- Validation: Zod schema on every POST/PATCH body
- Rate limiting: Upstash Redis, applied in Next.js middleware

---

### Customer-Facing Routes

```
POST   /api/v1/orders
       Body: { child_id, story_goal, dialect, special_notes, idempotency_key }
       Auth: parent
       Action: Creates order, captures payment intent, triggers Inngest draft job
       Returns: { order_id, status: 'pending' }

GET    /api/v1/orders
       Auth: parent
       Action: Returns all orders for authenticated parent (paginated)
       Returns: { orders: Order[], total: number }

GET    /api/v1/orders/:id
       Auth: parent (own orders only, RLS enforced)
       Action: Returns order with current status
       Returns: { order: Order }

GET    /api/v1/orders/:id/assets
       Auth: parent (delivered orders only, RLS enforced)
       Action: Returns signed Supabase Storage URLs for PDF and illustrations
       Returns: { pdf_url: string, illustrations: string[] }

POST   /api/v1/orders/:id/cancel
       Auth: parent
       Condition: status not in ['approved', 'packaging', 'delivered']
       Action: Cancels order, triggers refund if paid
       Returns: { ok: true }

POST   /api/v1/children
       Auth: parent
       Body: { name, age, gender?, personality[], special_notes? }
       Returns: { child: Child }

GET    /api/v1/children
       Auth: parent
       Returns: { children: Child[] }

PATCH  /api/v1/children/:id
       Auth: parent (own children only)
       Returns: { child: Child }
```

---

### Editor-Facing Routes (role: editor | admin)

```
GET    /api/v1/editor/queue
       Auth: editor
       Action: Returns orders in draft_ready or under_review, sorted by SLA deadline
       Returns: { orders: OrderWithDraft[], count: number }

POST   /api/v1/editor/orders/:id/claim
       Auth: editor
       Action: Assigns this editor to order, sets status → under_review
       Returns: { ok: true }

GET    /api/v1/editor/orders/:id/draft
       Auth: editor
       Action: Returns current active draft for order
       Returns: { draft: StoryDraft, child: Child, order: Order }

PATCH  /api/v1/editor/orders/:id/draft
       Auth: editor (assigned editor only)
       Body: { edited_content: string, editor_notes?: string }
       Action: Saves in-progress edits (auto-save, no status change)
       Returns: { ok: true }

POST   /api/v1/editor/orders/:id/approve
       Auth: editor (assigned editor only)
       Action: Locks draft, sets status → approved, triggers packaging Inngest job
       Returns: { ok: true }

POST   /api/v1/editor/orders/:id/revise
       Auth: editor (assigned editor only)
       Body: { revision_brief: string }
       Condition: revision_count < 2
       Action: Sets status → revision_requested, triggers new AI draft via Inngest
       Returns: { ok: true }

POST   /api/v1/editor/orders/:id/rewrite
       Auth: editor (assigned editor only)
       Action: Sets status → under_review, editor_rewrite flag = true
       Returns: { ok: true }
```

---

### Admin Routes (role: admin)

```
GET    /api/v1/admin/orders
       Auth: admin
       Query: ?status=&editor_id=&from=&to=
       Returns: { orders: Order[], total: number }

POST   /api/v1/admin/orders/:id/reassign
       Auth: admin
       Body: { editor_id: string }
       Returns: { ok: true }

GET    /api/v1/admin/editors
       Auth: admin
       Returns: { editors: EditorWithStats[] }

GET    /api/v1/admin/metrics
       Auth: admin
       Returns: { avg_review_time_h, orders_today, sla_breach_count, ... }
```

---

### Webhook Routes

```
POST   /api/webhooks/stripe
       Auth: Stripe signature verification (raw body required)
       Events handled: payment_intent.succeeded, customer.subscription.*, invoice.*

POST   /api/webhooks/inngest
       Auth: Inngest signature verification
       Action: Inngest event handler (internal)
```

---

## PART 5 — INNGEST WORKFLOW DESIGN

Two Inngest functions handle the entire async workflow.

### Function 1: `story/draft.generate`

Triggered by: `POST /api/v1/orders` (new order) or `POST /api/v1/editor/orders/:id/revise` (revision)

```
story/draft.generate
│
├── Step 1: fetch-order
│   Load order + child profile from DB
│
├── Step 2: ai-draft-story
│   Call Claude API
│   Prompt includes: child name, age, personality, goal, dialect, special_notes
│   Model: claude-sonnet-4-6 (quality matters here)
│   Output: title + full story text
│
├── Step 3: ai-generate-illustration-prompts
│   Call Claude API (fast, cheap)
│   Input: story text
│   Output: 6–8 scene prompts in English for DALL-E
│
├── Step 4: ai-qa-review
│   Call Claude API
│   Input: story text + child profile
│   Output: { score: number (0–100), flags: string[] }
│   If score < 80 AND attempt == 1: retry from Step 2
│   If score < 80 AND attempt == 2: proceed with flag
│
├── Step 5: save-draft
│   Insert into story_drafts (is_active = true, deactivate previous)
│   Insert into illustration_prompts
│   Update order status → draft_ready
│   Insert order_event (actor_type: 'system')
│
└── Step 6: notify-editor-queue
    No push notification at MVP — editor polls dashboard
    (Future: email/Slack alert to editorial manager)
```

---

### Function 2: `story/package.deliver`

Triggered by: `POST /api/v1/editor/orders/:id/approve`

```
story/package.deliver
│
├── Step 1: fetch-approved-draft
│   Load approved draft + illustration prompts
│   Use edited_content if present, else content
│
├── Step 2: generate-images
│   For each illustration prompt (6–8):
│     Call OpenAI DALL-E 3 API
│     Immediately download image bytes (do NOT store URL — it expires)
│     Upload to Supabase Storage: /stories/{order_id}/illustration_{n}.png
│     Insert into story_assets
│   Run in parallel (Promise.all, max 3 concurrent)
│
├── Step 3: generate-cover
│   Call DALL-E 3 for cover image
│   Upload to Supabase Storage: /stories/{order_id}/cover.png
│
├── Step 4: generate-pdf
│   Assemble PDF using @react-pdf/renderer or puppeteer
│   Layout: RTL, Arabic font, child's name on cover, illustrated pages
│   Upload to Supabase Storage: /stories/{order_id}/story.pdf
│   Insert into story_assets
│
├── Step 5: update-order
│   Update order status → delivered
│   Set delivered_at = now()
│   Update subscription stories_remaining (decrement)
│   Insert order_event
│
└── Step 6: notify-customer
    Send email via Resend:
      To: parent email
      Subject: "قصة {child_name} جاهزة! 🎉"
      Body: delivery link + CTA to view in app
```

---

## PART 6 — SECURITY MODEL

### Authentication
- Supabase Auth handles all session management
- JWT stored in httpOnly cookie (Supabase SSR client)
- Session refreshed in middleware on every request
- No custom auth routes — Supabase handles login, OAuth, password reset

### Authorization (Three Roles)

| Role | Access |
|---|---|
| `parent` | Own orders, own children, own assets (delivered only) |
| `editor` | All orders in queue, all drafts, approve/revise actions |
| `admin` | Everything + editor management + metrics |

Role stored in `user_profiles.role`. Checked in:
1. **Middleware** — blocks `/editor/*` and `/admin/*` routes for wrong roles
2. **API route handlers** — explicit role check before any action
3. **RLS policies** — database enforces at query level (defense in depth)

### Input Validation
- Every POST/PATCH endpoint validates with Zod before touching the database
- `special_notes` and `story_goal` are sanitized — no HTML, no script injection
- Illustration prompts are generated by AI from structured data, not directly from user text
- Child photo upload: file type check (image/* only), max 5MB, stored in private Supabase bucket

### Data Protection (GDPR / COPPA)
- AI consent (`ai_consent = true`) required before any order can be placed
- Consent timestamp stored in `user_profiles.consent_at`
- Children's data (name, photo, personality) stored only in `children` table — never sent to third parties beyond AI providers
- AI providers used: Anthropic (Claude), OpenAI — both have DPAs available
- Child photos are never sent to AI APIs — used only for style reference notes entered by parent
- Data deletion: soft delete on `children` and `orders`; hard delete available via GDPR request endpoint (`DELETE /api/v1/account`)
- Story content stored in Supabase (EU region) — confirm region in Supabase project settings

### API Security
- All webhook endpoints verify signature before processing (Stripe: `stripe.webhooks.constructEvent`, Inngest: built-in verification)
- Rate limits via Upstash Redis in middleware:
  - `POST /api/v1/orders`: 5 per hour per user
  - `POST /api/v1/editor/*`: 100 per hour per editor
  - All other routes: 60 per minute per IP
- Idempotency key required on `POST /api/v1/orders` — duplicate submissions return existing order
- Service role key (Supabase) used only in Inngest functions (server-side) — never exposed to client

### Content Safety
- AI QA agent checks story content before it reaches editor queue
- Editor is final human gate — no story delivered without APPROVE action
- Inappropriate order parameters caught at intake via Zod enum validation (story_goal from approved list) + free-text length limits
- `special_notes` field: max 500 characters, no HTML allowed

---

## PART 7 — FOLDER STRUCTURE

```
hikayati/
├── app/
│   ├── (customer)/               # Customer-facing pages
│   │   ├── dashboard/            # Order history, story library
│   │   ├── order/new/            # Story request form
│   │   ├── order/[id]/           # Order status page
│   │   ├── story/[id]/           # Story reader (delivered only)
│   │   └── account/              # Profile, subscription, consent
│   │
│   ├── (editor)/                 # Editor-facing pages (role-gated)
│   │   ├── editor/queue/         # Review queue
│   │   └── editor/orders/[id]/   # Story review + edit workspace
│   │
│   ├── (admin)/                  # Admin pages (role-gated)
│   │   ├── admin/orders/         # All orders + filters
│   │   ├── admin/editors/        # Editor management
│   │   └── admin/metrics/        # Operational dashboard
│   │
│   ├── api/
│   │   ├── v1/
│   │   │   ├── orders/           # Customer order routes
│   │   │   ├── children/         # Child profile routes
│   │   │   ├── editor/           # Editor action routes
│   │   │   └── admin/            # Admin routes
│   │   └── webhooks/
│   │       ├── stripe/           # Stripe webhook handler
│   │       └── inngest/          # Inngest event handler
│   │
│   └── (auth)/                   # Login, signup, OAuth callback
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client (SSR)
│   │   └── middleware.ts         # Session refresh middleware
│   ├── inngest/
│   │   ├── client.ts             # Inngest client
│   │   ├── draft-generate.ts     # story/draft.generate function
│   │   └── package-deliver.ts    # story/package.deliver function
│   ├── ai/
│   │   ├── claude.ts             # Claude API wrapper (story draft, QA)
│   │   └── openai.ts             # OpenAI wrapper (DALL-E images)
│   ├── pdf/
│   │   └── generate.ts           # PDF assembly
│   ├── email/
│   │   └── resend.ts             # Email sending via Resend
│   ├── stripe/
│   │   └── client.ts             # Stripe client + webhook helpers
│   └── validation/
│       └── schemas.ts            # All Zod schemas
│
├── components/
│   ├── customer/                 # Customer UI components
│   ├── editor/                   # Editor workspace components
│   └── shared/                   # Shared UI (buttons, modals, etc.)
│
├── middleware.ts                 # Auth check + role gate + rate limit
├── supabase/
│   └── migrations/               # SQL migration files
└── docs/                         # All documentation
```

---

## PART 8 — ENVIRONMENT VARIABLES

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Server/Inngest only — never client

# AI
ANTHROPIC_API_KEY=                # Claude (story draft, QA)
OPENAI_API_KEY=                   # DALL-E 3 (images)

# Queue
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email
RESEND_API_KEY=

# Rate limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_APP_URL=              # https://hikayati-nine.vercel.app (prod)
```

---

## PART 9 — MIGRATION FROM V1.0 (CURRENT CODEBASE)

The current codebase (`main` branch) was built for the v1.0 auto-generation model. The following changes are required to implement this architecture.

### What to Keep
- Next.js 15 App Router setup ✅
- Supabase Auth integration (middleware pattern) ✅
- Supabase client/server setup ✅
- Inngest client setup ✅
- Claude + OpenAI API wrappers ✅
- Stripe webhook handler structure ✅
- Resend email setup ✅

### What to Change

| Current | New |
|---|---|
| `generation_jobs` table | Replace with `orders` table (new schema) |
| `stories` table | Merge into `story_drafts` (editor-visible only) |
| `story_assets` with expiring DALL-E URLs | `story_assets` with permanent Supabase Storage paths |
| Auto-delivery after QA score pass | Delivery only after editor APPROVE action |
| SSE for generation progress | Supabase Realtime on `orders.status` |
| 6-agent Inngest pipeline | 2-function Inngest workflow (draft.generate + package.deliver) |
| No editor role / no editor UI | Editor role + `/editor/*` pages |
| Freemium subscription model | Pay-per-story + subscription tiers |

### Migration Order (Implementation Sequence)
1. Write and run new DB migrations (new tables, RLS policies)
2. Update Inngest functions (draft.generate + package.deliver)
3. Build editor dashboard (`/editor/queue`, `/editor/orders/[id]`)
4. Update customer order flow (new form, status page, Realtime)
5. Update delivery flow (permanent storage, Resend email)
6. Update Stripe pricing (pay-per-story + subscription tiers)
7. Add admin pages
8. QA end-to-end with test orders

---

*Document owner: Hassan Al-Alewee*  
*Next action: DB migrations — write SQL for new schema and run in Supabase dashboard.*
