-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Public Course Sharing & Forking
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add is_public and slug to courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create an index on slug for fast public lookups
CREATE INDEX IF NOT EXISTS idx_courses_slug ON public.courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_is_public ON public.courses(is_public);

-- 2. Allow public read on courses where is_public = true
CREATE POLICY "Public read active public courses"
  ON public.courses FOR SELECT
  USING (is_public = true);

-- 3. Allow public read on modules if course is public
CREATE POLICY "Public read modules of public courses"
  ON public.modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.courses
      WHERE public.courses.id = public.modules.course_id
      AND public.courses.is_public = true
    )
  );

-- 4. Allow public read on lessons if course is public
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
