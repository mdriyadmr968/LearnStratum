-- ============================================================
-- Milestone 8: Token/Credit System & AI Response Caching
-- ============================================================

-- 1. Add ai_credits and plan to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ai_credits integer NOT NULL DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';
ALTER TABLE profiles ALTER COLUMN ai_credits SET DEFAULT 1000;

-- 2. Update the existing new-user trigger to grant 1000 starter credits
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

-- 3. credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount      integer NOT NULL,            -- positive = top-up, negative = deduction
  method      text,                        -- 'bkash' | 'nagad' | 'rocket' | 'system'
  reference   text,                        -- payment TxID entered by user
  status      text NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected' | 'completed'
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Users can see their own transactions
CREATE POLICY "Users view own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Only system (service role) can insert — enforced via server actions
CREATE POLICY "Service role inserts transactions"
  ON credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. ai_cache table
CREATE TABLE IF NOT EXISTS ai_cache (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_hash   text NOT NULL UNIQUE,
  action_type   text NOT NULL,             -- 'lesson' | 'quiz' | 'flashcards' | 'outline'
  response_json jsonb NOT NULL,
  hit_count     integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL
);

-- No RLS on ai_cache — server-side only, accessed via service role
-- Index for fast hash lookups
CREATE INDEX IF NOT EXISTS ai_cache_prompt_hash_idx ON ai_cache (prompt_hash);
CREATE INDEX IF NOT EXISTS ai_cache_expires_at_idx  ON ai_cache (expires_at);
