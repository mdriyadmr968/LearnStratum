import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import {
  Sparkles,
  Video,
  Brain,
  ArrowRight,
  CheckCircle,
  Zap,
  Award,
  Share2,
  Search,
  Clock,
  BookOpen,
  ShieldCheck,
  TrendingUp,
  Layers,
  Terminal,
  Flame,
  Compass,
} from 'lucide-react';
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  CardHover,
} from '@/components/animations/motion-components';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar />

      <main className="flex-1 flex flex-col">
        {/* ── 1. HERO SECTION ─────────────────────────────────── */}
        <section className="relative overflow-hidden py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-transparent to-transparent dark:from-indigo-950/20 pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <FadeIn delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                <span>1,000 Free Credits on Signup • Powered by Google Gemini</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.12]">
                Autonomous Mastery Paths for{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Any Subject
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="mt-6 text-lg sm:text-xl text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto leading-relaxed">
                No static courses. No outdated paywalls. Tell LearnStratum what you want to master and your weekly time budget — our AI synthesizes a personalized syllabus, harvests verified video lectures and technical documentation, and locks knowledge in with SM-2 spaced repetition.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/sign-up"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-7 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-500/25 transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Start Learning Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/explore"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-6 py-4 text-base font-semibold text-zinc-800 dark:text-zinc-200 shadow-sm transition"
                >
                  <Compass className="w-4 h-4 text-indigo-500" />
                  <span>Explore Community Paths</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 px-6 py-4 text-base font-semibold text-zinc-700 dark:text-zinc-300 transition"
                >
                  <span>Dashboard</span>
                </Link>
              </div>
            </FadeIn>

            {/* Trust Highlights */}
            <FadeIn delay={0.5}>
              <div className="mt-12 pt-8 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>1,000 Starter Credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Grounded YouTube Lectures</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>SuperMemo-2 (SM-2) Flashcards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Verifiable Certificates</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── 2. METRICS & STATS BAR ──────────────────────────── */}
        <section className="py-10 px-4 sm:px-6 lg:px-8 bg-white/60 dark:bg-zinc-900/40 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <StaggerContainer className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <StaggerItem>
              <div className="p-4 rounded-2xl hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition">
                <p className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400">1,000</p>
                <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">Free Credits on Signup</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="p-4 rounded-2xl hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition">
                <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">0%</p>
                <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">Hallucination (Source Verified)</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="p-4 rounded-2xl hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition">
                <p className="text-3xl sm:text-4xl font-black text-violet-600 dark:text-violet-400">SM-2</p>
                <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">Active Recall Algorithm</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="p-4 rounded-2xl hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition">
                <p className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400">100%</p>
                <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">Custom Paced to Your Schedule</p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* ── 3. HOW IT WORKS FLOW ────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
              Step-by-Step Learning Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-3">
              How LearnStratum Guides You to Mastery
            </h2>
            <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
              From raw curiosity to verified certificate in five progressive stages.
            </p>
          </div>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            <StaggerItem>
              <CardHover className="h-full">
                <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
                  <div>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-lg">
                      STEP 01
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mt-4 mb-3">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-base">Define Goal & Pacing</h3>
                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Enter any topic (e.g. Next.js 15, Quantum Computing) and choose your skill level and weekly hours budget.
                    </p>
                  </div>
                </div>
              </CardHover>
            </StaggerItem>

            <StaggerItem>
              <CardHover className="h-full">
                <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
                  <div>
                    <span className="text-xs font-mono font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/80 px-2.5 py-1 rounded-lg">
                      STEP 02
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400 mt-4 mb-3">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-base">Syllabus Synthesis</h3>
                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Google Gemini architects a modular roadmap. Rearrange, customize, or add custom lessons in the interactive editor.
                    </p>
                  </div>
                </div>
              </CardHover>
            </StaggerItem>

            <StaggerItem>
              <CardHover className="h-full">
                <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
                  <div>
                    <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2.5 py-1 rounded-lg">
                      STEP 03
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mt-4 mb-3">
                      <Video className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-base">Grounded Classroom</h3>
                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Study ad-free with verified YouTube lectures and side-by-side technical documentation curated by Jina Reader.
                    </p>
                  </div>
                </div>
              </CardHover>
            </StaggerItem>

            <StaggerItem>
              <CardHover className="h-full">
                <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-lg">
                      STEP 04
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mt-4 mb-3">
                      <Brain className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-base">Active Recall (SM-2)</h3>
                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Test comprehension with auto-generated quizzes and review 3D flip flashcards scheduled to prevent the forgetting curve.
                    </p>
                  </div>
                </div>
              </CardHover>
            </StaggerItem>

            <StaggerItem>
              <CardHover className="h-full">
                <div className="p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between h-full">
                  <div>
                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2.5 py-1 rounded-lg">
                      STEP 05
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mt-4 mb-3">
                      <Award className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-base">Certify & Share</h3>
                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Earn XP, unlock achievement badges, and receive a cryptographically verifiable completion certificate with public verification.
                    </p>
                  </div>
                </div>
              </CardHover>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* ── 4. SIX CORE PILLARS ─────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-100/60 dark:bg-zinc-900/30 border-y border-zinc-200/80 dark:border-zinc-800/80">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                Core Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-3">
                Everything You Need to Master Complex Skills
              </h2>
              <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
                Designed to bridge the gap between unstructured web content and rigorous university pedagogy.
              </p>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <StaggerItem>
                <CardHover className="h-full">
                  <div className="p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm h-full flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        AI Curriculum Generator
                      </h3>
                      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Maps complex subjects into progressive modules. Each lesson is broken down with explicit learning objectives and targeted search queries so you know exactly what to learn and why.
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      <span>Interactive Drag & Drop Editor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </CardHover>
              </StaggerItem>

              {/* Feature 2 */}
              <StaggerItem>
                <CardHover className="h-full">
                  <div className="p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm h-full flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6">
                        <Video className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        Grounded Video Lectures
                      </h3>
                      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Zero hallucinations. The system queries the YouTube Data API to harvest top-rated conference talks and video tutorials, embedding them in a distraction-free, ad-free environment.
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                      <span>SHA-256 PostgreSQL Caching</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </CardHover>
              </StaggerItem>

              {/* Feature 3 */}
              <StaggerItem>
                <CardHover className="h-full">
                  <div className="p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm h-full flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-6">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        Documentation & Deep Dive
                      </h3>
                      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Harnesses Tavily AI Search and Jina Reader to extract clean, readable Markdown from official documentation sites, RFCs, and engineering blogs directly into your lesson reader.
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400">
                      <span>Ad-Free Clean Markdown Reader</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </CardHover>
              </StaggerItem>

              {/* Feature 4 */}
              <StaggerItem>
                <CardHover className="h-full">
                  <div className="p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm h-full flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
                        <Zap className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        Embedded Streaming AI Tutor
                      </h3>
                      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Never get stuck. Ask questions to your contextual AI tutor directly inside any lesson. Request real-world analogies, code explanations, or instant Socratic quizzes in real time.
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      <span>Multi-Model Auto-Fallback</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </CardHover>
              </StaggerItem>

              {/* Feature 5 */}
              <StaggerItem>
                <CardHover className="h-full">
                  <div className="p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm h-full flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                        <Brain className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        SM-2 Spaced Repetition Engine
                      </h3>
                      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Anki-style active recall. Interactive 3D flip flashcards automatically schedule reviews based on the SuperMemo-2 cognitive algorithm right before memory decay occurs.
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span>Permanent Knowledge Retention</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </CardHover>
              </StaggerItem>

              {/* Feature 6 */}
              <StaggerItem>
                <CardHover className="h-full">
                  <div className="p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm h-full flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                        <Award className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        Verifiable Certificates
                      </h3>
                      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Upon 100% course completion, earn a tamper-proof digital certificate. Each credential contains a unique verification hash verifiable at public URLs like <span className="font-mono text-xs">/verify/[hash]</span>.
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
                      <span>Share on LinkedIn & Portfolios</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </CardHover>
              </StaggerItem>
            </StaggerContainer>
          </div>
        </section>

        {/* ── 5. GAMIFICATION & SOCIAL SHOWCASE ─────────────────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Gamification Card */}
            <FadeIn direction="left" delay={0.1}>
              <CardHover className="h-full">
                <div className="p-8 sm:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-gradient-to-br from-white to-indigo-50/40 dark:from-zinc-900 dark:to-indigo-950/20 shadow-sm flex flex-col justify-between h-full">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-4">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Stratum Mastery & Streaks</span>
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                      Gamified Progress That Keeps You Consistent
                    </h3>
                    <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Never break the chain. Earn Stratum XP for completing lessons, passing quizzes, and doing flashcard reviews. Level up from Novice (Level 1) to Obsidian Master (Level 5) and unlock unique achievement badges.
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60">
                        <p className="font-bold text-zinc-900 dark:text-white">Daily Study Heatmap</p>
                        <p className="text-zinc-500 mt-0.5">Track 14-day study streaks</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60">
                        <p className="font-bold text-zinc-900 dark:text-white">Mastery Badges</p>
                        <p className="text-zinc-500 mt-0.5">Bronze, Silver, Gold, Obsidian</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-500">Live XP calculation per activity</span>
                    <Link
                      href="/dashboard"
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      View Your Stats <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </CardHover>
            </FadeIn>

            {/* Public Sharing & Forking Card */}
            <FadeIn direction="right" delay={0.2}>
              <CardHover className="h-full">
                <div className="p-8 sm:p-10 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-gradient-to-br from-white to-purple-50/40 dark:from-zinc-900 dark:to-purple-950/20 shadow-sm flex flex-col justify-between h-full">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-4">
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Public Sharing & Forking</span>
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                      Collaborative Learning & Course Forking
                    </h3>
                    <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Publish your favorite roadmaps to the public explore feed with a custom slug. Other students can fork your syllabus into their private dashboard with a single click and adapt it to their own pace.
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60">
                        <p className="font-bold text-zinc-900 dark:text-white">1-Click Forking</p>
                        <p className="text-zinc-500 mt-0.5">Clone any course with resources</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60">
                        <p className="font-bold text-zinc-900 dark:text-white">Semantic Search</p>
                        <p className="text-zinc-500 mt-0.5">Find topics with pgvector AI search</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-500">Discover community curated curricula</span>
                    <Link
                      href="/explore"
                      className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                    >
                      Browse Explore Feed <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </CardHover>
            </FadeIn>
          </div>
        </section>

        {/* ── 6. COMPARISON: TRADITIONAL VS LEARNSTRATUM ─────── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
          <FadeIn direction="up">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                Why LearnStratum Outperforms Traditional Online Learning
              </h2>
              <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                Compare the passive video playlist approach with active cognitive synthesis.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-2 shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="py-4 px-4 font-semibold text-zinc-400">Feature</th>
                    <th className="py-4 px-4 font-bold text-zinc-500">Traditional Platforms</th>
                    <th className="py-4 px-4 font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-t-xl">
                      LearnStratum
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
                  <tr>
                    <td className="py-4 px-4 font-semibold text-zinc-800 dark:text-zinc-200">Curriculum Pacing</td>
                    <td className="py-4 px-4 text-zinc-500">Fixed, generic syllabus</td>
                    <td className="py-4 px-4 font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/20">
                      Tailored to your exact weekly time budget & skill level
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-semibold text-zinc-800 dark:text-zinc-200">Content Freshness</td>
                    <td className="py-4 px-4 text-zinc-500">Often recorded years ago</td>
                    <td className="py-4 px-4 font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/20">
                      JIT harvested latest documentation & verified videos
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-semibold text-zinc-800 dark:text-zinc-200">Retention Strategy</td>
                    <td className="py-4 px-4 text-zinc-500">Passive video watching</td>
                    <td className="py-4 px-4 font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/20">
                      Active recall with automated SuperMemo-2 (SM-2) flashcards
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-semibold text-zinc-800 dark:text-zinc-200">In-Lesson Support</td>
                    <td className="py-4 px-4 text-zinc-500">Unanswered forum comments</td>
                    <td className="py-4 px-4 font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/20">
                      Streaming AI Tutor with analogies, code explanations & quizzes
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4 font-semibold text-zinc-800 dark:text-zinc-200">Proof of Completion</td>
                    <td className="py-4 px-4 text-zinc-500">Unverifiable PDFs</td>
                    <td className="py-4 px-4 font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-b-xl">
                      Cryptographic hash certificates verifiable at public URLs
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </FadeIn>
        </section>

        {/* ── 7. POPULAR TOPICS SHOWCASE ──────────────────────── */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <FadeIn direction="up">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Popular Topics to Generate Right Now
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Jumpstart your learning journey with pre-calibrated pathways.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
            {[
              'Next.js 15 & React 19 Architecture',
              'Deep Learning & LLM Fine-Tuning',
              'Distributed Systems & Microservices',
              'Rust Systems Programming',
              'Kubernetes & Cloud Native DevOps',
              'Quantum Computing Fundamentals',
              'Data Structures & Algorithms in Python',
              'Cybersecurity & Penetration Testing',
              'TypeScript Advanced Type Gymnastics',
            ].map((topic) => (
              <StaggerItem key={topic}>
                <CardHover>
                  <Link
                    href={`/courses/new?topic=${encodeURIComponent(topic)}`}
                    className="inline-block px-4 py-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:border-indigo-400 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition"
                  >
                    ✨ {topic}
                  </Link>
                </CardHover>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ── 8. CALL TO ACTION ───────────────────────────────── */}
        <FadeIn direction="up" className="w-full">
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white text-center relative overflow-hidden">
            <div className="max-w-4xl mx-auto relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-4">
                Get Started in 60 Seconds
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Ready to Master Your Next Skill?
              </h2>
              <p className="mt-4 text-base sm:text-lg text-indigo-100 max-w-2xl mx-auto">
                Sign up today and get <strong>1,000 free AI credits</strong> added to your account instantly. Generate complete roadmaps, harvest lectures, and build lifelong mastery.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/sign-up"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-indigo-600 hover:bg-zinc-100 px-8 py-4 text-base font-bold shadow-2xl transition hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Claim 1,000 Free Credits</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/explore"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-500/40 hover:bg-indigo-500/60 border border-white/20 px-7 py-4 text-base font-bold text-white transition"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Community Courses</span>
                </Link>
              </div>
            </div>
          </section>
        </FadeIn>
      </main>

      {/* ── 9. RICH FOOTER ──────────────────────────────────── */}
      <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-950 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              L
            </div>
            <div>
              <p className="font-bold text-zinc-900 dark:text-white">LearnStratum</p>
              <p className="text-[11px] text-zinc-400">Autonomous Curriculum Generator & Spaced Repetition Engine</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium">
            <Link href="/explore" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Explore
            </Link>
            <Link href="/search" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Search
            </Link>
            <Link href="/credits" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Pricing & Credits
            </Link>
            <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              Dashboard
            </Link>
          </div>

          <p className="text-zinc-400">
            © {new Date().getFullYear()} LearnStratum. Built with Next.js 16, Supabase & Google Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
}
