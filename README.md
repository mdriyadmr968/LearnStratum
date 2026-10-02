# LearnStratum 🎓

> **Autonomous AI Curriculum Generator, Multi-Modal Harvester & Spaced Repetition Mastery Engine**

LearnStratum turns any subject into an end-to-end, personalized masterclass. It analyzes your target topic and weekly schedule, synthesizes a modular curriculum using **Google Gemini 2.5 Flash**, harvests verified YouTube lectures and clean technical documentation, tests comprehension with automated knowledge checks, and guarantees long-term retention using the **SuperMemo-2 (SM-2)** spaced repetition algorithm.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_15-3ECF8E?logo=supabase)](https://supabase.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-orange?logo=google)](https://aistudio.google.com)
[![Motion](https://img.shields.io/badge/Motion-v12-f08?logo=framer)](https://motion.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📚 Complete Documentation

Extensive technical guides and architectural blueprints are available in the [`doc/`](./doc/) directory:

- 🏛️ [**System Architecture & Data Flow**](./doc/architecture.md) — Architectural overview, LLM auto-fallback, and edge streaming.
- 🌟 [**Feature Deep Dive**](./doc/features.md) — Comprehensive guide to all 10 core subsystems.
- 🗄️ [**Database Schema & Migrations**](./doc/database-schema.md) — Tables, pgvector semantic search, triggers, and RLS policies.
- 🔌 [**API & Server Actions Reference**](./doc/api-reference.md) — Complete specification of Server Actions and the `/api/tutor` SSE endpoint.
- 🛠️ [**Setup & Deployment Guide**](./doc/setup-guide.md) — Local installation, API keys, migration sequence, and Vercel deployment.

---

## 🌟 Key Features

### 1. Autonomous AI Curriculum Synthesis
- **Pedagogical Structuring:** Calibrated by topic, difficulty tier (`Beginner`, `Intermediate`, `Advanced`), and weekly time budget.
- **Interactive Syllabus Editor:** Reorder modules, add custom lessons, and tailor learning objectives before generating course assets.

### 2. Grounded Multi-Modal Content Harvester (Anti-Hallucination)
- **Verified Video Lectures:** Real-time YouTube Data API v3 queries embedded via privacy-enhanced `youtube-nocookie.com`.
- **Clean Markdown Reader:** Tavily AI Search + Jina Reader (`r.jina.ai`) extracts clean, ad-free Markdown from official documentation, RFCs, and engineering blogs.

### 3. In-Lesson Streaming AI Tutor
- Contextual slide-over drawer primed with the active lesson's objectives.
- Multi-mode support: *Analogy Mode*, *Code Breakdown*, and *Socratic Quiz*.
- **Auto-Fallback Engine:** Automatically routes across Gemini 2.5 Flash, 2.0 Flash, 1.5 Flash, and 1.5 Pro to prevent rate-limit failures.

### 4. Active Recall & Spaced Repetition (SM-2)
- **Automated Quizzes:** Generates conceptual questions with immediate feedback and step-by-step rationales.
- **Interactive 3D Flip Flashcards:** Anki-style flashcards scheduled using the cognitive SuperMemo-2 algorithm right before memory decay occurs.

### 5. Stratum Gamification & Habit Streaks
- **5 Stratum Ranks:** Progress from *Novice Explorer* (Level 1) to *Obsidian Grandmaster* (Level 5).
- **Dynamic XP System:** Earn XP for completing lessons (`+50`), passing quizzes (`+30-40`), and reviewing flashcards (`+25`).
- **Mastery Badges & 14-Day Heatmap:** Unlockable achievement badges and real-time study streak tracking.

### 6. Public Community Gallery & 1-Click Course Forking
- Publish syllabi to the public explore feed (`/explore`) with custom URL slugs.
- Clone any community course into your private workspace with a single click.

### 7. Semantic Vector Search via pgvector
- Uses Google's `text-embedding-004` to index lessons and curated documentation into 768-dimensional dense vector embeddings.
- Natural language similarity queries via PostgreSQL `pgvector` (`/search`).

### 8. Verifiable Completion Certificates
- Earn tamper-proof digital completion credentials upon 100% course completion.
- Verifiable at public URLs (`/verify/[hash]`) with unique cryptographic hashes for LinkedIn and portfolio sharing.

### 9. AI Credits & SHA-256 Response Caching
- **1,000 Free Credits:** Granted automatically to all new users upon signup.
- **Zero-Cost Caching Engine:** Popular and duplicate syllabi are served instantly from PostgreSQL cache with zero credit deduction.

### 10. Motion Animation & Fluid Page Transitions
- Powered by `motion` (`v12`) and React 19.
- Global App Router route transitions via `template.tsx`, directional scroll fade-ins, and tactile card hover lifts.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) | Server Components, Server Actions, Edge SSE Routes |
| **Frontend** | [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com) | Modern reactive interfaces & styling |
| **Animations** | [Motion (v12)](https://motion.dev) | Fluid page transitions, stagger grids & micro-interactions |
| **Database & Auth** | [Supabase](https://supabase.com) (PostgreSQL 15+) | Row-Level Security (RLS), Cookie SSR Auth, Triggers |
| **Vector Search** | Supabase `pgvector` + `text-embedding-004` | 768-dimensional semantic knowledge search |
| **AI Engine** | [Google Gemini 2.5 Flash](https://aistudio.google.com) (`@google/genai`) | Curriculum synthesis, quizzes, flashcards & streaming tutor |
| **Harvester** | YouTube Data API v3, Tavily AI, Jina Reader | Multi-modal lecture & documentation extraction |
| **Icons & Utilities** | Lucide React, Zod | Type validation & iconography |

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/mdriyadmr968/learnstratum.git
cd learnstratum
npm install
```

### 2. Environment Variables
Create `.env.local` in the project root:

```ini
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini API
GEMINI_API_KEY=AIzaSy...

# YouTube Data API v3
YOUTUBE_API_KEY=AIzaSy...

# Tavily AI Search (Optional, 1,000 free searches/mo)
TAVILY_API_KEY=tvly-...
```

### 3. Run Database Migrations
Run the SQL scripts in `supabase/migrations/` sequentially in your Supabase SQL Editor:
1. `20260927000000_initial_schema.sql`
2. `20260927_credits_and_cache.sql`
3. `update_starter_credits_1000.sql`
4. `20260927_gamification.sql`
5. `20260927_public_courses.sql`
6. `20260927_vector_search.sql`
7. `20260927_certificates.sql`

*(See [Database Schema Documentation](./doc/database-schema.md) for full migration details).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start exploring LearnStratum!

---

## 🚢 Deployment

Deploy seamlessly to [Vercel](https://vercel.com/new) with zero configuration:
1. Connect your GitHub repository to Vercel.
2. Add your environment variables in **Project Settings $\rightarrow$ Environment Variables**.
3. Deploy! Next.js 16 with Turbopack builds automatically.
4. Update your Supabase **Site URL** and **Redirect URLs** under **Authentication $\rightarrow$ URL Configuration**.

---

## 📄 License

MIT © [LearnStratum](https://github.com/mdriyadmr968/learnstratum)
