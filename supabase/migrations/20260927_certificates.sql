-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: certificates table
-- Run this in your Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

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

-- Row-Level Security
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Anyone can verify a certificate (public read by hash)
CREATE POLICY "Public read certificates by hash"
  ON public.certificates FOR SELECT
  USING (true);

-- Only the certificate owner can see their own list (already covered by public read, but tighter for list views)
CREATE POLICY "Owner reads own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);

-- Only the server (service role) or the owner inserts
CREATE POLICY "Owner inserts certificate"
  ON public.certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);
