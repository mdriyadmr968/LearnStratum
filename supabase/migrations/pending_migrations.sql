-- ============================================================
-- LearnStratum - Combined Pending Database Migrations
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql/new
-- ============================================================

-- ------------------------------------------------------------
-- 1. Credits & AI Response Caching
-- ------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ai_credits integer NOT NULL DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';
ALTER TABLE public.profiles ALTER COLUMN ai_credits SET DEFAULT 1000;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url, ai_credits, plan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    1000,
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount      integer NOT NULL,
  method      text,
  reference   text,
  status      text NOT NULL DEFAULT 'pending',
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own transactions" ON public.credit_transactions;
CREATE POLICY "Users view own transactions"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role inserts transactions" ON public.credit_transactions;
CREATE POLICY "Service role inserts transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.ai_cache (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_hash   text NOT NULL UNIQUE,
  action_type   text NOT NULL,
  response_json jsonb NOT NULL,
  hit_count     integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS ai_cache_prompt_hash_idx ON public.ai_cache (prompt_hash);
CREATE INDEX IF NOT EXISTS ai_cache_expires_at_idx  ON public.ai_cache (expires_at);

-- ------------------------------------------------------------
-- 2. Certificates
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id         UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  course_title      TEXT NOT NULL,
  student_name      TEXT NOT NULL,
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  verification_hash TEXT NOT NULL UNIQUE,
  CONSTRAINT certificates_user_course_unique UNIQUE (user_id, course_id)
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read certificates by hash" ON public.certificates;
CREATE POLICY "Public read certificates by hash"
  ON public.certificates FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owner reads own certificates" ON public.certificates;
CREATE POLICY "Owner reads own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owner inserts certificate" ON public.certificates;
CREATE POLICY "Owner inserts certificate"
  ON public.certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3. Gamification (XP, Level, Badges)
-- ------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xp INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(xp DESC);

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

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read user badges" ON public.user_badges;
CREATE POLICY "Public read user badges"
  ON public.user_badges FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "User inserts own badges" ON public.user_badges;
CREATE POLICY "User inserts own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 4. Public Course Sharing & Forking
-- ------------------------------------------------------------
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_is_public ON public.courses(is_public);

DROP POLICY IF EXISTS "Public read active public courses" ON public.courses;
CREATE POLICY "Public read active public courses"
  ON public.courses FOR SELECT
  USING (is_public = true);

DROP POLICY IF EXISTS "Public read modules of public courses" ON public.modules;
CREATE POLICY "Public read modules of public courses"
  ON public.modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE public.courses.id = public.modules.course_id
      AND public.courses.is_public = true
    )
  );

DROP POLICY IF EXISTS "Public read lessons of public courses" ON public.lessons;
CREATE POLICY "Public read lessons of public courses"
  ON public.lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.modules
      JOIN public.courses ON public.courses.id = public.modules.course_id
      WHERE public.modules.id = public.lessons.module_id
      AND public.courses.is_public = true
    )
  );

-- ------------------------------------------------------------
-- 5. Semantic Vector Search (pgvector)
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS embedding vector(768);

ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS embedding vector(768);

CREATE OR REPLACE FUNCTION match_lessons(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  module_id uuid,
  title text,
  course_id uuid,
  course_title text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.module_id,
    l.title,
    c.id AS course_id,
    c.title AS course_title,
    1 - (l.embedding <=> query_embedding) AS similarity
  FROM public.lessons l
  JOIN public.modules m ON m.id = l.module_id
  JOIN public.courses c ON c.id = m.course_id
  WHERE l.embedding IS NOT NULL
    AND (1 - (l.embedding <=> query_embedding)) > match_threshold
  ORDER BY l.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION match_resources(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  lesson_id uuid,
  title text,
  url text,
  type text,
  summary_markdown text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.lesson_id,
    r.title,
    r.url,
    r.type::text,
    r.summary_markdown,
    1 - (r.embedding <=> query_embedding) AS similarity
  FROM public.resources r
  WHERE r.embedding IS NOT NULL
    AND (1 - (r.embedding <=> query_embedding)) > match_threshold
  ORDER BY r.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
