import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  BookOpen,
  PlusCircle,
  Clock,
  Sparkles,
  Flame,
  Award,
  Layers,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { StreakCalendar } from '@/components/dashboard/streak-calendar';
import { RetentionChart } from '@/components/dashboard/retention-chart';
import { RecentActivityTimeline, type ActivityItem } from '@/components/dashboard/recent-activity';
import type { Database } from '@/lib/supabase/types';

type CourseRow = Database['public']['Tables']['courses']['Row'];
type FlashcardRow = Database['public']['Tables']['flashcards']['Row'];
type QuizSubmissionRow = Database['public']['Tables']['quiz_submissions']['Row'];
type ActivityLogRow = Database['public']['Tables']['study_activity_logs']['Row'];

export default async function DashboardPage() {
  let user = null;
  let courses: CourseRow[] = [];

  const stats = {
    activeCourses: 0,
    completedLessons: 0,
    totalLessons: 0,
    syllabusProgressPercent: 0,
    flashcardsDue: 0,
    currentStreakDays: 0,
  };

  const retention = {
    totalCards: 0,
    masteredCards: 0,
    reviewingCards: 0,
    newCards: 0,
    averageEaseFactor: 2.5,
  };

  const quizStats = {
    totalSubmissions: 0,
    averageScore: 0,
    recentScores: [] as { id: string; score: number; date: string }[],
  };

  let activityDays: { date: string; count: number; hasActivity: boolean }[] = [];
  let recentActivities: ActivityItem[] = [];

  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    user = userData.user;

    if (user) {
      // 1. Fetch Courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (coursesData) {
        courses = coursesData;
        stats.activeCourses = courses.filter(
          (c) => c.status === 'active' || c.status === 'draft'
        ).length;
      }

      // 2. Fetch Lessons across user's courses
      const courseIds = courses.map((c) => c.id);
      if (courseIds.length > 0) {
        const { data: modulesData } = await supabase
          .from('modules')
          .select('id, lessons ( id, is_completed )')
          .in('course_id', courseIds);

        if (modulesData) {
          interface ModuleWithLessonsBrief {
            id: string;
            lessons: { id: string; is_completed: boolean }[];
          }
          const briefModules = (modulesData as unknown as ModuleWithLessonsBrief[]) || [];
          let total = 0;
          let completed = 0;
          briefModules.forEach((m) => {
            const lessons = m.lessons ?? [];
            total += lessons.length;
            completed += lessons.filter((l) => l.is_completed).length;
          });
          stats.totalLessons = total;
          stats.completedLessons = completed;
          stats.syllabusProgressPercent =
            total > 0 ? Math.round((completed / total) * 100) : 0;
        }
      }

      // 3. Fetch Flashcards & Retention Stats
      const { data: flashcardsData } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', user.id);

      if (flashcardsData) {
        const cards = flashcardsData as FlashcardRow[];
        const now = new Date().toISOString();
        retention.totalCards = cards.length;
        stats.flashcardsDue = cards.filter((c) => c.next_review_at <= now).length;

        const mastered = cards.filter(
          (c) => c.repetitions >= 2 && c.ease_factor >= 2.2
        );
        const reviewing = cards.filter(
          (c) => c.repetitions > 0 && !mastered.includes(c)
        );
        const newCards = cards.filter((c) => c.repetitions === 0);

        retention.masteredCards = mastered.length;
        retention.reviewingCards = reviewing.length;
        retention.newCards = newCards.length;

        if (cards.length > 0) {
          const sumEase = cards.reduce((acc, c) => acc + c.ease_factor, 0);
          retention.averageEaseFactor = sumEase / cards.length;
        }
      }

      // 4. Fetch Quiz Submissions
      const { data: submissionsData } = await supabase
        .from('quiz_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (submissionsData && submissionsData.length > 0) {
        const subs = submissionsData as QuizSubmissionRow[];
        quizStats.totalSubmissions = subs.length;
        const totalScore = subs.reduce((acc, s) => acc + s.score, 0);
        quizStats.averageScore = Math.round(totalScore / subs.length);
        quizStats.recentScores = subs.slice(0, 5).map((s) => ({
          id: s.id,
          score: s.score,
          date: new Date(s.completed_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          }),
        }));
      }

      // 5. Fetch Activity Logs & Build Streak Calendar
      const { data: activityLogs } = await supabase
        .from('study_activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      const logs = (activityLogs ?? []) as ActivityLogRow[];
      recentActivities = logs.slice(0, 8).map((l) => ({
        id: l.id,
        activity_type: l.activity_type,
        activity_date: l.activity_date,
        created_at: l.created_at,
        metadata: (l.metadata as Record<string, unknown>) ?? null,
      }));

      // Calculate 14-day history
      const today = new Date();
      const pastDays: { date: string; count: number; hasActivity: boolean }[] = [];
      const activityMap = new Map<string, number>();

      logs.forEach((log) => {
        const d = log.activity_date;
        activityMap.set(d, (activityMap.get(d) ?? 0) + 1);
      });

      for (let i = 13; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const isoDate = d.toISOString().split('T')[0];
        const count = activityMap.get(isoDate) ?? 0;
        pastDays.push({
          date: isoDate,
          count,
          hasActivity: count > 0,
        });
      }
      activityDays = pastDays;

      // Calculate consecutive streak
      let streak = 0;
      const checkDate = new Date(today);

      // Check if today or yesterday has activity to continue streak
      const todayStr = checkDate.toISOString().split('T')[0];
      const hasToday = (activityMap.get(todayStr) ?? 0) > 0;

      if (!hasToday) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if ((activityMap.get(dateStr) ?? 0) > 0) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      stats.currentStreakDays = streak;
    }
  } catch {
    // Supabase query fallback
  }

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Learner';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 p-8 sm:p-10 text-white shadow-xl shadow-indigo-500/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            AI-Curated Autonomous Learning
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back, {displayName}!
          </h1>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
            Ready to continue your mastery path? Review your due flashcards, test retention with AI quizzes, or synthesize a brand new custom syllabus in seconds.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/courses/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-900 shadow hover:bg-indigo-50 transition"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              Generate New Course
            </Link>
          </div>
        </div>
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
          <GraduationCap className="w-80 h-80" />
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.activeCourses}
            </div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Active Courses
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.syllabusProgressPercent}%
            </div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Overall Progress ({stats.completedLessons}/{stats.totalLessons})
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.flashcardsDue}
            </div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Cards Due Today (SM-2)
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stats.currentStreakDays}d
            </div>
            <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Current Streak
            </div>
          </div>
        </div>
      </div>

      {/* Daily Study Streak Calendar */}
      <StreakCalendar
        currentStreakDays={stats.currentStreakDays}
        activityDays={activityDays}
      />

      {/* Spaced Repetition Retention & Quiz Mastery Analytics */}
      <RetentionChart
        retention={retention}
        quizStats={quizStats}
      />

      {/* Recent Activity Timeline & Courses Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Courses Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Your Syllabi & Courses
            </h2>
            <Link
              href="/courses/new"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              <PlusCircle className="w-4 h-4" />
              New Course
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-10 text-center bg-white dark:bg-zinc-900/50 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  No courses generated yet
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                  Start by typing any topic you want to learn. Our Gemini AI engine will synthesize a custom syllabus with verified YouTube videos, documentation, and spaced repetition decks.
                </p>
              </div>
              <div>
                <Link
                  href="/courses/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Synthesize Your First Course
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col justify-between rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        {course.difficulty_level}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <Clock className="w-3.5 h-3.5" />
                        {course.weekly_hours_allocated}h / week
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {course.description || `Comprehensive mastery curriculum for ${course.topic}`}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Status: <span className="text-zinc-700 dark:text-zinc-300 capitalize">{course.status}</span>
                    </span>
                    <Link
                      href={`/courses/${course.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                      Open Course
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Live Recent Activity Timeline */}
        <div className="space-y-4">
          <RecentActivityTimeline activities={recentActivities} />
        </div>
      </div>
    </div>
  );
}
