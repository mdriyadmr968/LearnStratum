-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Semantic Vector Search (Supabase pgvector)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding columns (768 dimensions for Gemini text-embedding-004)
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS embedding vector(768);

ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. Match lessons by vector similarity function
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

-- 4. Match resources by vector similarity function
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
