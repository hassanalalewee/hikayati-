-- ============================================================
-- Hikayati Migration 002: Editorial Workflow
-- Adds human-in-the-loop order state machine
-- ============================================================

-- ============================================================
-- 1. ADD EDITOR ROLE TO user_profiles
-- ============================================================
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('parent','editor','therapist','teacher','admin'));

-- ============================================================
-- 2. ORDERS (central state machine)
-- ============================================================
CREATE TABLE orders (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key           TEXT UNIQUE NOT NULL,
  parent_id                 UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  child_id                  UUID NOT NULL REFERENCES children(id) ON DELETE RESTRICT,

  -- what the parent requested
  story_goal                TEXT NOT NULL,
  dialect                   TEXT NOT NULL DEFAULT 'msa'
                            CHECK (dialect IN ('msa','gulf','levantine','egyptian','maghrebi')),
  special_notes             TEXT,
  age_group                 TEXT NOT NULL CHECK (age_group IN ('2-4','5-7','8-12')),

  -- state machine
  status                    TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN (
                              'pending','draft_generating','draft_ready',
                              'under_review','revision_requested','approved',
                              'packaging','delivered','failed','cancelled'
                            )),

  -- assignments
  assigned_editor_id        UUID REFERENCES user_profiles(id),

  -- SLA & timing
  revision_count            SMALLINT NOT NULL DEFAULT 0,
  draft_ready_at            TIMESTAMPTZ,
  review_started_at         TIMESTAMPTZ,
  approved_at               TIMESTAMPTZ,
  delivered_at              TIMESTAMPTZ,
  sla_deadline              TIMESTAMPTZ,

  -- billing (nullable for MVP — payment not yet enforced)
  stripe_payment_intent_id  TEXT,
  amount_paid               INTEGER,
  currency                  TEXT DEFAULT 'AED',

  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at                TIMESTAMPTZ
);

CREATE INDEX ON orders (parent_id);
CREATE INDEX ON orders (assigned_editor_id);
CREATE INDEX ON orders (status);
CREATE INDEX ON orders (sla_deadline) WHERE status IN ('draft_ready','under_review');

-- auto-update updated_at
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. STORY DRAFTS (each AI generation attempt per order)
-- ============================================================
CREATE TABLE story_drafts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  version           SMALLINT NOT NULL DEFAULT 1,
  is_active         BOOLEAN NOT NULL DEFAULT true,

  -- AI-generated content
  title             TEXT,
  content           TEXT,
  word_count        SMALLINT,
  qa_score          SMALLINT CHECK (qa_score BETWEEN 0 AND 100),
  qa_flags          JSONB DEFAULT '[]',

  -- editor work (separate from AI content)
  editor_id         UUID REFERENCES user_profiles(id),
  editor_notes      TEXT,
  edited_content    TEXT,
  edited_at         TIMESTAMPTZ,

  -- generation metadata
  model_used        TEXT,
  prompt_tokens     INTEGER,
  completion_tokens INTEGER,
  generation_ms     INTEGER,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Only one active draft per order at any time
CREATE UNIQUE INDEX story_drafts_one_active_per_order
  ON story_drafts(order_id) WHERE is_active = true;

CREATE INDEX ON story_drafts (order_id);

-- ============================================================
-- 4. ILLUSTRATION PROMPTS (per draft scene)
-- ============================================================
CREATE TABLE illustration_prompts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id      UUID NOT NULL REFERENCES story_drafts(id) ON DELETE CASCADE,
  scene_index   SMALLINT NOT NULL CHECK (scene_index BETWEEN 0 AND 9),
  prompt_text   TEXT NOT NULL,
  style_notes   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ON illustration_prompts (draft_id);

-- ============================================================
-- 5. ORDER EVENTS (append-only audit log)
-- ============================================================
CREATE TABLE order_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  actor_id      UUID REFERENCES user_profiles(id),
  actor_type    TEXT NOT NULL CHECK (actor_type IN ('system','parent','editor','admin')),
  event_type    TEXT NOT NULL,
  from_status   TEXT,
  to_status     TEXT,
  notes         TEXT,
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ON order_events (order_id);
CREATE INDEX ON order_events (created_at);

-- ============================================================
-- 6. PROCESSED WEBHOOK EVENTS (Stripe idempotency)
-- ============================================================
CREATE TABLE processed_webhook_events (
  id            TEXT PRIMARY KEY,
  event_type    TEXT NOT NULL,
  processed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. ROW-LEVEL SECURITY
-- ============================================================

-- orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parent_select_own_orders" ON orders
  FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "parent_insert_own_orders" ON orders
  FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "editor_select_all_orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('editor','admin')
    )
  );

CREATE POLICY "editor_update_assigned_orders" ON orders
  FOR UPDATE USING (
    assigned_editor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- story_drafts (editors only — parents never see raw drafts)
ALTER TABLE story_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "editor_select_drafts" ON story_drafts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('editor','admin')
    )
  );

CREATE POLICY "editor_insert_drafts" ON story_drafts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('editor','admin')
    )
  );

CREATE POLICY "editor_update_own_drafts" ON story_drafts
  FOR UPDATE USING (
    editor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System (service role) bypasses RLS — used by internal generate route

-- illustration_prompts (editors only)
ALTER TABLE illustration_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "editor_select_prompts" ON illustration_prompts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('editor','admin')
    )
  );

-- order_events (editors read, system writes via service role)
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "editor_select_events" ON order_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('editor','admin')
    )
  );

CREATE POLICY "parent_select_own_events" ON order_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_id AND parent_id = auth.uid()
    )
  );

-- processed_webhook_events (service role only — no RLS needed for client)
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;
