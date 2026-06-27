-- ============================================================
-- Hikayati Migration 003: AI Consent (GDPR)
-- Adds ai_consent + consent_at to user_profiles
-- ============================================================

-- Add ai_consent field (default false — opt-in required)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS ai_consent  BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS consent_at  TIMESTAMPTZ;
