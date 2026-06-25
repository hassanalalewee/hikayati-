-- ============================================================
-- Hikayati Database Schema
-- Migration: 001_initial_schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USER PROFILES
-- ============================================================
CREATE TABLE user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  display_name  TEXT,
  phone         TEXT,
  country       TEXT,
  city          TEXT,
  dialect       TEXT NOT NULL DEFAULT 'gulf' CHECK (dialect IN ('msa','gulf','levantine','egyptian','maghrebi')),
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('parent','therapist','teacher','admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
CREATE TABLE subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  plan                    TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','premium','family','professional')),
  status                  TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','canceled','past_due','trialing')),
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT UNIQUE,
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CHILDREN PROFILES
-- ============================================================
CREATE TABLE children (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  age                 INTEGER NOT NULL CHECK (age BETWEEN 3 AND 14),
  gender              TEXT NOT NULL CHECK (gender IN ('male','female')),
  country             TEXT,
  city                TEXT,
  hobbies             TEXT[] NOT NULL DEFAULT '{}',
  favorite_color      TEXT,
  favorite_animal     TEXT,
  favorite_activities TEXT[] NOT NULL DEFAULT '{}',
  photo_url           TEXT,
  avatar_description  TEXT,
  notes               TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STORIES
-- ============================================================
CREATE TABLE stories (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  child_id            UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  subtitle            TEXT,
  body                TEXT NOT NULL DEFAULT '',
  word_count          INTEGER,
  goals               TEXT[] NOT NULL DEFAULT '{}',
  style               TEXT NOT NULL,
  dialect             TEXT NOT NULL DEFAULT 'gulf',
  age_group           TEXT NOT NULL DEFAULT '5-7' CHECK (age_group IN ('3-4','5-7','8-10','11-13')),
  cover_url           TEXT,
  pdf_url             TEXT,
  audio_url           TEXT,
  status              TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating','complete','failed')),
  generation_job_id   TEXT,
  pipeline_metadata   JSONB,
  is_favorite         BOOLEAN NOT NULL DEFAULT FALSE,
  view_count          INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STORY ASSETS (illustrations)
-- ============================================================
CREATE TABLE story_assets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id   UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  type       TEXT NOT NULL CHECK (type IN ('cover','page','social','audio')),
  page_num   INTEGER,
  url        TEXT NOT NULL,
  prompt     TEXT,
  alt_text   TEXT,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PARENT GUIDES
-- ============================================================
CREATE TABLE parent_guides (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id              UUID NOT NULL UNIQUE REFERENCES stories(id) ON DELETE CASCADE,
  lesson_summary        TEXT,
  discussion_questions  TEXT[] NOT NULL DEFAULT '{}',
  family_activities     TEXT[] NOT NULL DEFAULT '{}',
  reinforcement_tips    TEXT[] NOT NULL DEFAULT '{}',
  parenting_advice      TEXT,
  development_notes     TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GENERATION JOBS
-- ============================================================
CREATE TABLE generation_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  child_id        UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  story_id        UUID REFERENCES stories(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','processing','complete','failed')),
  current_stage   TEXT,
  progress        INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  error_message   TEXT,
  agent_log       JSONB,
  tokens_used     INTEGER,
  cost_usd        NUMERIC(10,6),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DEVELOPMENT TRACKING
-- ============================================================
CREATE TABLE development_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  story_id     UUID REFERENCES stories(id) ON DELETE SET NULL,
  category     TEXT NOT NULL,
  score        INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  notes        TEXT,
  source       TEXT NOT NULL DEFAULT 'story' CHECK (source IN ('story','parent','therapist')),
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CHILD MILESTONES
-- ============================================================
CREATE TABLE child_milestones (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  badge_type   TEXT,
  badge_url    TEXT,
  achieved_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ADVISOR SESSIONS
-- ============================================================
CREATE TABLE advisor_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  child_id        UUID REFERENCES children(id) ON DELETE SET NULL,
  challenge_text  TEXT NOT NULL,
  analysis        JSONB,
  story_id        UUID REFERENCES stories(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STORY RECOMMENDATIONS
-- ============================================================
CREATE TABLE story_recommendations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  goals        TEXT[] NOT NULL DEFAULT '{}',
  style        TEXT,
  reason       TEXT,
  priority     INTEGER NOT NULL DEFAULT 5,
  is_seen      BOOLEAN NOT NULL DEFAULT FALSE,
  is_used      BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_children_user ON children(user_id) WHERE is_active = TRUE;
CREATE INDEX idx_stories_user_child ON stories(user_id, child_id, created_at DESC);
CREATE INDEX idx_stories_status ON stories(status) WHERE status = 'generating';
CREATE INDEX idx_stories_child ON stories(child_id, created_at DESC);
CREATE INDEX idx_dev_entries_child ON development_entries(child_id, category, recorded_at DESC);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id, status);
CREATE INDEX idx_generation_jobs_user ON generation_jobs(user_id, created_at DESC);
CREATE INDEX idx_recommendations_child ON story_recommendations(child_id, is_used, expires_at);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_recommendations ENABLE ROW LEVEL SECURITY;

-- user_profiles: own only
CREATE POLICY "users_read_own_profile" ON user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_update_own_profile" ON user_profiles FOR UPDATE USING (id = auth.uid());

-- subscriptions: own only
CREATE POLICY "users_read_own_subscription" ON subscriptions FOR SELECT USING (user_id = auth.uid());

-- children: own only
CREATE POLICY "users_manage_own_children" ON children FOR ALL USING (user_id = auth.uid());

-- stories: own only
CREATE POLICY "users_manage_own_stories" ON stories FOR ALL USING (user_id = auth.uid());

-- story_assets: via story ownership
CREATE POLICY "users_read_own_story_assets" ON story_assets FOR SELECT
  USING (EXISTS (SELECT 1 FROM stories WHERE stories.id = story_assets.story_id AND stories.user_id = auth.uid()));

-- parent_guides: via story ownership
CREATE POLICY "users_read_own_parent_guides" ON parent_guides FOR SELECT
  USING (EXISTS (SELECT 1 FROM stories WHERE stories.id = parent_guides.story_id AND stories.user_id = auth.uid()));

-- generation_jobs: own only
CREATE POLICY "users_read_own_jobs" ON generation_jobs FOR SELECT USING (user_id = auth.uid());

-- development_entries: via child ownership
CREATE POLICY "users_manage_own_dev_entries" ON development_entries FOR ALL
  USING (EXISTS (SELECT 1 FROM children WHERE children.id = development_entries.child_id AND children.user_id = auth.uid()));

-- child_milestones: via child ownership
CREATE POLICY "users_read_own_milestones" ON child_milestones FOR SELECT
  USING (EXISTS (SELECT 1 FROM children WHERE children.id = child_milestones.child_id AND children.user_id = auth.uid()));

-- advisor_sessions: own only
CREATE POLICY "users_manage_own_advisor_sessions" ON advisor_sessions FOR ALL USING (user_id = auth.uid());

-- story_recommendations: via child ownership
CREATE POLICY "users_read_own_recommendations" ON story_recommendations FOR SELECT
  USING (EXISTS (SELECT 1 FROM children WHERE children.id = story_recommendations.child_id AND children.user_id = auth.uid()));
