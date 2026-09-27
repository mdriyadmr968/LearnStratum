-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Gamification (Stratum Levels, XP & Mastery Badges)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add XP and Level to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xp INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 1;

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(xp DESC);

-- 2. Create user_badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  icon TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'obsidian')),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_badge_unique UNIQUE(user_id, badge_key)
);

-- Index for user badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);

-- Enable RLS on user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own badges and view others' public badges
CREATE POLICY "Public read user badges"
  ON public.user_badges FOR SELECT
  USING (true);

-- Allow authenticated user to insert their badges
CREATE POLICY "User inserts own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);
