# LearnStratum Local Setup & Deployment Guide

This guide details step-by-step instructions for running LearnStratum locally, configuring external APIs, setting up Supabase, and deploying to Vercel.

---

## 1. Prerequisites

Before starting, ensure you have the following installed on your machine:

- **Node.js**: `v20.x` or higher (Node 22 LTS recommended)
- **Package Manager**: `npm` (v10+)
- **Git**
- **Supabase Account**: Free tier at [supabase.com](https://supabase.com)
- **Google Cloud / AI Studio Account**: Free tier at [aistudio.google.com](https://aistudio.google.com)

---

## 2. Clone & Install Dependencies

```bash
git clone https://github.com/mdriyadmr968/learnstratum.git
cd learnstratum
npm install
```

> [!NOTE]
> On Windows PowerShell, if script execution policy restricts `npm`, execute using `npm.cmd install`.

---

## 3. Environment Variables Configuration

Create a `.env.local` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env.local
```

Populate the required environment variables:

```ini
# ==============================================================================
# 1. Supabase (PostgreSQL & Authentication)
# Obtain from: https://supabase.com/dashboard/project/_/settings/api
# ==============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ==============================================================================
# 2. Google Gemini API (AI Curriculum, Quizzes, Flashcards & Tutor)
# Obtain free API key from: https://aistudio.google.com/app/apikey
# ==============================================================================
GEMINI_API_KEY=AIzaSy...

# ==============================================================================
# 3. YouTube Data API v3 (Verified Video Lecture Harvesting)
# Obtain from Google Cloud Console: https://console.cloud.google.com/apis/credentials
# Enable "YouTube Data API v3" in Cloud Console library
# ==============================================================================
YOUTUBE_API_KEY=AIzaSy...

# ==============================================================================
# 4. Tavily AI Search (Clean Technical Documentation Search)
# Obtain free key (1,000 free searches/month): https://tavily.com
# ==============================================================================
TAVILY_API_KEY=tvly-...

# ==============================================================================
# 5. Optional Rate Limiting (Upstash Redis)
# If omitted, LearnStratum automatically defaults to an in-memory sliding window
# ==============================================================================
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## 4. Supabase Database Migrations

Open your Supabase Project Dashboard $\rightarrow$ **SQL Editor**, and run the SQL migration scripts in `supabase/migrations/` in the following sequence:

1. **`20260927000000_initial_schema.sql`**: Initializes core tables (`courses`, `modules`, `lessons`, `lesson_resources`, `flashcards`, `quiz_submissions`, `study_activity_logs`) and default RLS policies.
2. **`20260927_credits_and_cache.sql`**: Creates `user_credits`, `credit_transactions`, `ai_response_cache`, and initial triggers.
3. **`update_starter_credits_1000.sql`**: Sets the default starter bonus to **1,000 free credits** for all new signups.
4. **`20260927_gamification.sql`**: Creates `user_gamification`, `user_badges`, rank levels, and daily streak handlers.
5. **`20260927_public_courses.sql`**: Adds course slug indexing, public visibility flags, and course forking tracking.
6. **`20260927_vector_search.sql`**: Enables `pgvector` extension, creates vector columns (`vector(768)`), and installs `match_lessons` and `match_resources` RPC search functions.
7. **`20260927_certificates.sql`**: Creates the `certificates` table and public verification policies.

> [!TIP]
> Alternatively, you can run `supabase/migrations/pending_migrations.sql` which combines the supplemental updates in one batch.

---

## 5. Supabase Auth Configuration

1. In Supabase Dashboard, navigate to **Authentication $\rightarrow$ URL Configuration**:
   - **Site URL**:
     - Set to your primary production URL: `https://learnstratum.vercel.app` (or `http://localhost:3000` when running strictly locally).
   - **Redirect URLs** (Add all of the following):
     - `https://learnstratum.vercel.app/**`
     - `https://learnstratum.vercel.app/auth/callback`
     - `http://localhost:3000/**`
     - `http://localhost:3000/auth/callback`

> [!WARNING]
> **Why is my Google Sign-in redirecting to `http://localhost:3000/?code=...` instead of Vercel?**
> Supabase Auth validates the OAuth `redirectTo` target against its **Redirect URLs allowlist**. If your Vercel domain (`https://learnstratum.vercel.app/**`) is **not** explicitly added under **Redirect URLs**, or if your **Site URL** is left as `http://localhost:3000`, Supabase will reject the production redirect and fallback to `http://localhost:3000`. Adding your Vercel URL patterns and setting the **Site URL** to `https://learnstratum.vercel.app` resolves this immediately.

2. In **Google Cloud Console** (APIs & Services $\rightarrow$ Credentials $\rightarrow$ OAuth 2.0 Client IDs):
   - Under **Authorized redirect URIs**, ensure you have added your Supabase project callback URL:
     `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
3. Under Supabase Dashboard **Authentication $\rightarrow$ Providers $\rightarrow$ Google**:
   - Enable Google provider, and paste your Google Client ID and Client Secret.

---

## 6. Running the Development Server

Start Next.js with Turbopack:

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Quality & Verification Commands

To check code quality and ensure zero TypeScript errors before committing:

```bash
# Type-checking
npm run build # or npx tsc --noEmit

# Linting
npm run lint
```

---

## 8. Deploying to Vercel

1. Push your repository to GitHub.
2. Visit [Vercel](https://vercel.com/new) and click **Import Project**.
3. In **Environment Variables**, paste all keys from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `YOUTUBE_API_KEY`
   - `TAVILY_API_KEY`
4. Click **Deploy**. Vercel will build the Next.js App Router application with zero configuration.
5. Update your Supabase **Site URL** and **Redirect URLs** with your newly deployed Vercel domain.

---

## 9. Common Troubleshooting

### Error: "Your project's URL and Key are required to create a Supabase client!"
- **Cause:** Missing or misnamed `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
- **Fix:** Ensure variable names have the `NEXT_PUBLIC_` prefix and restart the Next.js dev server.

### AI Tutor Model Not Found (404) or Rate Limited (429)
- **Cause:** Deprecated Gemini preview model or high API Studio usage.
- **Fix:** LearnStratum contains automatic model fallback logic in `src/lib/gemini/models.ts`. It will attempt `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`, and `gemini-1.5-pro` consecutively. Verify that your `GEMINI_API_KEY` is valid at [aistudio.google.com](https://aistudio.google.com).

### YouTube Harvest Returns 0 Videos
- **Cause:** `YOUTUBE_API_KEY` is missing or quota is depleted.
- **Fix:** Verify that the "YouTube Data API v3" is enabled in Google Cloud Console for the project linked to your API key. YouTube grants 10,000 free quota units per day.
