-- LearnStratum Initial Schema Migration
-- Includes: Profiles, Courses, Modules, Lessons, Resources, YouTube Cache, Flashcards, Quizzes, Submissions, Activity Logs, and RLS Policies

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Profiles (Managed alongside Supabase Auth)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automatic Profile Creation Trigger on Auth Sign-Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
      updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- 2. Courses
-- ==========================================
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    topic TEXT NOT NULL,
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    weekly_hours_allocated INT NOT NULL DEFAULT 5,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'active', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_user_id ON public.courses(user_id);

-- ==========================================
-- 3. Modules (Units within a Course)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INT NOT NULL,
    estimated_minutes INT DEFAULT 60,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.modules(course_id);

-- ==========================================
-- 4. Lessons (Within Modules)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INT NOT NULL,
    objectives JSONB DEFAULT '[]'::jsonb,
    search_queries JSONB DEFAULT '[]'::jsonb,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);

-- ==========================================
-- 5. Curated Resources (YouTube Videos & Web Articles)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('youtube_video', 'web_article', 'doc_page')),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    external_id TEXT,
    channel_or_author TEXT,
    duration_seconds INT,
    summary_markdown TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_lesson_id ON public.resources(lesson_id);

-- ==========================================
-- 6. YouTube Search Cache (Conserves 10k quota)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.youtube_search_cache (
    query_hash TEXT PRIMARY KEY,
    query_text TEXT NOT NULL,
    results JSONB NOT NULL,
    cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- 7. Flashcards (SM-2 Spaced Repetition)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    repetitions INT NOT NULL DEFAULT 0,
    interval_days INT NOT NULL DEFAULT 1,
    ease_factor FLOAT NOT NULL DEFAULT 2.5,
    next_review_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flashcards_user_review ON public.flashcards(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_flashcards_lesson_id ON public.flashcards(lesson_id);

-- ==========================================
-- 8. Quizzes & Questions
-- ==========================================
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON public.quizzes(lesson_id);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option_index INT NOT NULL,
    explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);

CREATE TABLE IF NOT EXISTS public.quiz_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score FLOAT NOT NULL,
    answers JSONB NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_submissions_user_id ON public.quiz_submissions(user_id);

-- ==========================================
-- 9. Study Activity Logs (Streak & Retention Analytics)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.study_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('lesson_completed', 'quiz_completed', 'flashcard_reviewed')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_activity_user_date ON public.study_activity_logs(user_id, activity_date);

-- ==========================================
-- 10. Enable Row Level Security (RLS)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_search_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_activity_logs ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 11. Row Level Security Policies
-- ==========================================

-- Profiles
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Courses
CREATE POLICY "Users can manage own courses" 
    ON public.courses FOR ALL 
    USING (auth.uid() = user_id);

-- Modules (via course ownership)
CREATE POLICY "Users can manage modules of their courses" 
    ON public.modules FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.courses 
        WHERE public.courses.id = public.modules.course_id 
        AND public.courses.user_id = auth.uid()
    ));

-- Lessons (via module -> course ownership)
CREATE POLICY "Users can manage lessons of their courses" 
    ON public.lessons FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.modules 
        JOIN public.courses ON public.courses.id = public.modules.course_id
        WHERE public.modules.id = public.lessons.module_id 
        AND public.courses.user_id = auth.uid()
    ));

-- Resources (via lesson -> module -> course ownership)
CREATE POLICY "Users can manage resources of their courses" 
    ON public.resources FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.lessons
        JOIN public.modules ON public.modules.id = public.lessons.module_id
        JOIN public.courses ON public.courses.id = public.modules.course_id
        WHERE public.lessons.id = public.resources.lesson_id 
        AND public.courses.user_id = auth.uid()
    ));

-- YouTube Cache (Read-only for all authenticated users, writable by authenticated users)
CREATE POLICY "Authenticated users can read youtube cache"
    ON public.youtube_search_cache FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can insert into youtube cache"
    ON public.youtube_search_cache FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Flashcards
CREATE POLICY "Users can manage own flashcards" 
    ON public.flashcards FOR ALL 
    USING (auth.uid() = user_id);

-- Quizzes (via lesson -> module -> course ownership)
CREATE POLICY "Users can view quizzes of their courses" 
    ON public.quizzes FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.lessons
        JOIN public.modules ON public.modules.id = public.lessons.module_id
        JOIN public.courses ON public.courses.id = public.modules.course_id
        WHERE public.lessons.id = public.quizzes.lesson_id 
        AND public.courses.user_id = auth.uid()
    ));

-- Quiz Questions (via quiz -> lesson -> module -> course)
CREATE POLICY "Users can view questions of their course quizzes" 
    ON public.quiz_questions FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.quizzes
        JOIN public.lessons ON public.lessons.id = public.quizzes.lesson_id
        JOIN public.modules ON public.modules.id = public.lessons.module_id
        JOIN public.courses ON public.courses.id = public.modules.course_id
        WHERE public.quizzes.id = public.quiz_questions.quiz_id 
        AND public.courses.user_id = auth.uid()
    ));

-- Quiz Submissions
CREATE POLICY "Users can manage own quiz submissions" 
    ON public.quiz_submissions FOR ALL 
    USING (auth.uid() = user_id);

-- Study Activity Logs
CREATE POLICY "Users can manage own activity logs" 
    ON public.study_activity_logs FOR ALL 
    USING (auth.uid() = user_id);
