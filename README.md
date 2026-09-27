# LearnStratum 🎓

> **AI-Powered Autonomous Curriculum Generator & Spaced Repetition Mastery Engine**

LearnStratum turns any topic into an end-to-end masterclass. It analyzes your skill level, generates a modular syllabus using Google Gemini 2.5 Flash, harvests verified YouTube video walkthroughs and web documentation, tests comprehension with automated quizzes, and guarantees long-term retention using the SuperMemo-2 (SM-2) spaced repetition algorithm.

---

## 🌟 Key Features

1. **AI Curriculum Synthesis**:
   - Customizable by topic, difficulty level (Beginner / Intermediate / Advanced), and weekly commitment.
   - Interactive Syllabus Editor with inline drag/drop reordering, module editing, and custom lesson creation.

2. **Grounded Multi-Modal Content Harvester**:
   - Zero-hallucination JIT content curation.
   - Verified YouTube Data API v3 search with SHA-256 query caching in PostgreSQL.
   - Tavily AI Search + Jina Reader clean markdown extractor for official documentation.

3. **Interactive Classroom View**:
   - Responsive multi-video player embed (`youtube-nocookie.com`).
   - Clean GitHub-flavored Markdown documentation reader.
   - Progress tracking and optimistic lesson completion checklist.

4. **Active Recall & Spaced Repetition Engine (SM-2)**:
   - Automated Quiz Generator with instant option validation, rationales, and score tracking.
   - Automated Anki-style Flashcard Generator with interactive 3D flip card.
   - SuperMemo-2 spaced repetition scheduler calculating intervals, repetitions, and next review dates based on recall quality grades (`Again`, `Hard`, `Good`, `Easy`).

5. **Student Performance Analytics Dashboard**:
   - 14-day study streak calendar heatmap and consecutive days tracker.
   - Overall syllabus completion percentage.
   - Flashcard retention curve and memory stability metrics.
   - Real-time audit trail of study events.
   - Sliding-window rate limiter protecting AI generation endpoints.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (Turbopack, App Router)](https://nextjs.org)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Database & Auth**: [Supabase](https://supabase.com) (PostgreSQL with RLS & SSR authentication)
- **AI Model**: [Google Gemini 2.5 Flash](https://aistudio.google.com) (`@google/genai`)
- **Web & Video APIs**: YouTube Data API v3, Tavily AI Search, Jina Reader (`r.jina.ai`)
- **Icons**: Lucide React
- **Validation**: Zod

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/mdriyadmr968/LearnStratum.git
cd LearnStratum
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env.local` in the root folder with the following keys:

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

# Optional Upstash Redis (In-memory fallback included by default)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### 4. Database Setup
Run the SQL migration located at `supabase/migrations/20260927000000_initial_schema.sql` in your Supabase SQL Editor. This initializes all 9 tables, triggers, and Row Level Security (RLS) policies.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view LearnStratum.

---

## 🚢 Deploying to Vercel

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com/new).
3. Configure the Environment Variables listed above in **Project Settings → Environment Variables**.
4. Deploy! Next.js 16 with Turbopack and Edge/SSR proxy will build automatically.

---

## 📄 License
MIT
