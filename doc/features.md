# LearnStratum Feature Guide

A complete deep dive into every feature and capability built into the LearnStratum learning platform.

---

## 1. Autonomous AI Curriculum Synthesis

### Overview
LearnStratum allows any learner to generate a complete, pedagogical curriculum for any subject—ranging from modern web frameworks (e.g., Next.js 16, React 19) to deep theoretical topics (e.g., Quantum Computing, Distributed Systems, Organic Chemistry).

### Parameters
- **Target Topic:** Any arbitrary subject or discipline.
- **Difficulty Level:**
  - `Beginner`: Focuses on fundamental definitions, core syntax, simple mental models.
  - `Intermediate`: Practical architectural patterns, real-world development, production pitfalls.
  - `Advanced`: Internal mechanics, performance tuning, scale bottlenecks, RFCs.
- **Weekly Hours Commitment:** Calibrates lesson module sizing and estimated completion duration.
- **Custom Goals:** Optional custom objectives or specific project goals specified by the user.

### Interactive Syllabus Editor
- Before creating the course in the database, users enter the **Syllabus Editor** (`src/components/syllabus-editor/index.tsx`).
- Allows learners to:
  - Drag and reorder modules or lessons.
  - Add custom lessons and personal learning notes.
  - Delete modules that they already understand.
  - Edit learning objectives and tailored search keywords.

---

## 2. Grounded Multi-Modal Content Harvester

### Anti-Hallucination Pipeline
LLMs commonly hallucinate non-existent video URLs, expired blog posts, or outdated syntax. LearnStratum solves this by acting as a real-time multi-modal harvester:

1. **YouTube Data API v3 Integration (`src/lib/harvester/youtube.ts`):**
   - Automatically searches YouTube using the lesson's target topic and extracted keywords.
   - Filters out spam, shorts, and low-engagement videos.
   - Stores video metadata (Video ID, title, channel title, duration, thumbnail) into PostgreSQL.
   - Video player uses `youtube-nocookie.com` for ad-free, distraction-free studying.

2. **Documentation & Deep Dive Reader (`src/lib/harvester/web.ts`):**
   - Uses Tavily AI Search to identify authoritative documentation, technical blogs, and RFCs.
   - Passes URLs to Jina Reader (`https://r.jina.ai/{url}`) to extract pure, readable Markdown.
   - Cleans navigation bars, cookie banners, tracking scripts, and sidebars.
   - Cached in PostgreSQL with SHA-256 fingerprinting.

---

## 3. Distraction-Free Classroom & In-Lesson Streaming AI Tutor

### Classroom View (`/courses/[id]/lesson/[lessonId]`)
- **Side-by-side Layout:** Video lectures on top or side, paired with the comprehensive documentation reader.
- **Optimistic Completion Checklist:** Check off lessons with instant UI feedback and automatic next-lesson navigation.
- **Interactive Markdown Reader:** Features syntax highlighting, copy-code buttons, callouts, tables, and collapsible deep-dive sections.

### Streaming In-Lesson AI Tutor Drawer (`src/components/classroom/ai-tutor-drawer.tsx`)
- Slide-over chat drawer available directly inside every lesson.
- Contextual Grounding: The AI tutor is automatically primed with the active lesson title, module objectives, and current curriculum context.
- **Pre-Configured Study Modes:**
  - *Explain with Analogy:* Translates complex jargon into everyday physical analogies.
  - *Code Breakdown:* Line-by-line explanation of technical snippets.
  - *Socratic Challenge:* Asks probing questions to test the learner's deeper comprehension.
- **Streaming Response:** Uses Server-Sent Events (SSE) via `/api/tutor` for instant token-by-token output.
- **Model Auto-Fallback:** If the primary Gemini model encounters rate limits or deprecations, it automatically falls back without crashing the tutor conversation.

---

## 4. Active Recall & Spaced Repetition (SM-2)

### Automated Quiz Generator (`src/lib/gemini/quiz-generator.ts`)
- Automatically generates 3 to 5 multi-choice questions testing core concepts of the lesson.
- Immediate feedback showing whether the answer was correct.
- Detailed step-by-step rationales explaining why the correct answer is right and why other options are incorrect.
- Tracks quiz score submissions and awards XP.

### Automated Flashcard Decks (`src/lib/gemini/flashcard-generator.ts`)
- Generates Anki-style front/back question cards.
- Interactive 3D flip card animations with tactile click-to-flip interaction.

### SuperMemo-2 (SM-2) Cognitive Scheduler (`src/lib/sm2.ts`)
- Each card review prompts the user to grade their recall:
  - **Again (Grade 1):** Reset interval to 1 day.
  - **Hard (Grade 3):** Mild interval increase, lower Ease Factor.
  - **Good (Grade 4):** Standard interval multiplication.
  - **Easy (Grade 5):** Significant interval increase, higher Ease Factor.
- The system schedules the next review timestamp right before the predicted Ebbinghaus forgetting curve decay.
- Daily due cards appear on the dashboard review widget.

---

## 5. Stratum Gamification & Habit Streaks

LearnStratum turns self-directed learning into an engaging, habit-forming experience:

### 5 Stratum Ranks
1. **Level 1 — Novice Explorer** (0 – 299 XP)
2. **Level 2 — Knowledge Apprentice** (300 – 899 XP)
3. **Level 3 — Concept Architect** (900 – 1,799 XP)
4. **Level 4 — Cognitive Master** (1,800 – 3,499 XP)
5. **Level 5 — Obsidian Grandmaster** (3,500+ XP)

### XP Awarding Rules
- **Complete a Lesson:** `+50 XP`
- **Pass a Knowledge Quiz:** `+30 XP` (Bonus `+10 XP` for a 100% score)
- **Review Flashcard Deck:** `+25 XP`
- **Share a Course Publicly:** `+50 XP`
- **Earn a Verifiable Certificate:** `+100 XP`

### Mastery Badges
Badges are categorized into Bronze, Silver, Gold, and Obsidian tiers:
- `First Step`: Complete your first lesson.
- `Consistent Scholar`: Complete 5 lessons.
- `Streak Starter`: Maintain a 3-day study streak.
- `Unstoppable`: Maintain a 7-day study streak.
- `Quiz Master`: Score 100% on any quiz.
- `Memory Wizard`: Complete a flashcard review deck.
- `Pioneer`: Share a course to the public explore feed.
- `Certified Master`: Complete 100% of a course and generate a certificate.
- `Grandmaster`: Reach 3,500 XP and unlock Obsidian rank.

### 14-Day Study Streak Calendar Heatmap
- Live calendar widget tracking consecutive daily study activity.
- Automatically calculates streak retention based on UTC calendar days.

---

## 6. Public Course Sharing & 1-Click Forking

### Public Gallery (`/explore`)
- Learners can toggle any generated course to **Public** (`is_public = true`) with a custom URL slug.
- The public gallery allows other students to browse community-created courses and syllabi.
- Each course displays difficulty badges, weekly commitment, module count, and lesson count.

### 1-Click Course Forking (`src/components/fork-button.tsx`)
- Allows any user to fork a public course directly into their private workspace.
- Duplicates modules, lessons, objectives, and cached resources.
- The student can immediately customize the syllabus or begin studying with independent progress tracking, quizzes, and flashcards.

---

## 7. Semantic Knowledge Search via pgvector

### Overview (`/search`)
- Integrates PostgreSQL `pgvector` with Google's `text-embedding-004` model.
- Generates 768-dimensional dense vector embeddings for lesson content, module objectives, and harvested documentation.
- Enables natural language semantic search (e.g., *"How do transformers handle self-attention?"* matches relevant lessons even without exact keyword matches).
- Returns similarity percentages, highlighted snippets, and direct links to lessons and external documentation resources.

---

## 8. Verifiable Completion Certificates

### Certification Engine (`/verify/[hash]`)
- Upon completing 100% of all lessons in a course, learners can generate a tamper-proof digital completion certificate.
- Generates a unique, cryptographically random verification hash.
- Provides a public verification page accessible at `/verify/[hash]` showcasing:
  - Student Name / Learner Handle.
  - Course Title, Difficulty, and Completed Lessons.
  - Issue Date and Cryptographic Verification Hash.
  - Direct sharing to LinkedIn and personal portfolios.

---

## 9. AI Credits & Response Caching Engine

### Credit System (`/credits`)
- Every new user receives **1,000 free AI credits** on signup.
- Action costs:
  - Course Outline Generation: `3 credits`
  - Lesson Content Synthesis: `2 credits`
  - Quiz Generation: `1 credit`
  - Flashcard Deck: `1 credit`
- Demo top-up workflow supporting local mobile payment methods (bKash, Nagad, Rocket).

### SHA-256 Response Caching Engine
- When multiple users request identical or popular topics, the system looks up the request signature in `ai_response_cache`.
- Cached results are served instantly with **zero credit deduction** and **zero API consumption**.
- Real-time cache metrics on the `/credits` page show total cached generations, community hits, and total credits saved.

---

## 10. Motion Animation & Route Transitions

### Fluid App Router Transitions
- Built on `motion` (`v12`), the modern successor to Framer Motion optimized for React 19.
- **Global Page Transitions:** `src/app/template.tsx` automatically animates page changes with a smooth upward slide and fade-in (`y: 8px -> 0px`, `opacity: 0 -> 1`).
- **In-Page Micro-Interactions:**
  - Viewport-aware directional scroll reveal (`FadeIn`).
  - Staggered card grid entrances (`StaggerContainer`, `StaggerItem`).
  - Card hover lifts (`CardHover`) with subtle scale and shadow elevation.
  - Seamless dark and light mode color transitions.
