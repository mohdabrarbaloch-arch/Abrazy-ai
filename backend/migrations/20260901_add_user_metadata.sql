-- Add metadata column to users table for storing onboarding data and preferences
-- Migration: 20260901_add_user_metadata.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add index for faster queries on metadata
CREATE INDEX IF NOT EXISTS idx_users_metadata ON users USING GIN (metadata);

-- Example metadata structure:
-- {
--   "role": "developer",
--   "use_case": "automation",
--   "team_size": "small",
--   "interests": ["automation", "research"],
--   "onboarded": true,
--   "onboarded_at": "2026-09-01T12:00:00Z",
--   "oauth_provider": "google"
-- }
