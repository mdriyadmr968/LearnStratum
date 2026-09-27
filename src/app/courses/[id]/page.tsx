import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/navbar';
import {
  Clock,
  CheckCircle2,
  Circle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import type { Database } from '@/lib/supabase/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface LessonItem {
  id: string;
  title: string;
  order_index: number;
  objectives: string[];
  search_queries: string[];
  is_completed: boolean;
}

interface ModuleItem {
  id: string;
  title: string;
  order_index: number;
  estimated_minutes: number;
  lessons: LessonItem[];
}

type CourseRow = Database['public']['Tables']['courses']['Row'];

export default async function CourseDetailPage({ params }: PageProps) {
  const { id: courseId } = await params;
  const supabase = await createClient();

  // 1. Fetch Course
  const { data: courseData, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (courseError || !courseData) {
    notFound();
  }

  const course = courseData as CourseRow;

  // 2. Fetch Modules with Lessons
  const { data: rawModules } = await supabase
    .from('modules')
    .select(`
      id,
      title,
      order_index,
      estimated_minutes,
      lessons (
        id,
        title,
        order_index,
        objectives,
        search_queries,
        is_completed
      )
    `)
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  const modules: ModuleItem[] = (rawModules as unknown as ModuleItem[]) || [];

  // Sort lessons within each module
  modules.forEach((mod) => {
    if (mod.lessons && Array.isArray(mod.lessons)) {
      mod.lessons.sort((a, b) => a.order_index - b.order_index);
    }
  });

  const totalLessons = modules.reduce(
    (acc, m) => acc + (m.lessons?.length || 0),
    0
  );
  const completedLessons = modules.reduce(
    (acc, m) => acc + (m.lessons?.filter((l) => l.is_completed).length || 0),
    0
  );
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Find first incomplete lesson for "Resume/Start Learning"
  let nextLesson: LessonItem | null = null;
  for (const mod of modules) {
    const incomplete = mod.lessons?.find((l) => !l.is_completed);
    if (incomplete) {
      nextLesson = incomplete;
      break;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Course Header Banner */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                <Sparkles className="w-3.5 h-3.5" />
                {course.topic}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize">
                {course.difficulty_level}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {course.weekly_hours_allocated}h / week
              </span>
            </div>

            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Status: <span className="text-zinc-800 dark:text-zinc-200 capitalize">{course.status}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {course.title}
          </h1>

          {course.description && (
            <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
              {course.description}
            </p>
          )}

          {/* Progress Bar & CTA */}
          <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                <span>Course Progress</span>
                <span>{progressPercent}% ({completedLessons}/{totalLessons} lessons)</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {nextLesson && (
              <Link
                href={`/courses/${course.id}/lesson/${nextLesson.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
              >
                {completedLessons === 0 ? 'Start Course' : 'Resume Learning'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Modules & Lessons Curriculum Breakdown */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Curriculum Syllabus
            </h2>
            <span className="text-xs text-zinc-500">
              {modules.length} Modules • {totalLessons} Lessons
            </span>
          </div>

          {modules.map((mod, mIdx) => (
            <div
              key={mod.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="bg-zinc-50 dark:bg-zinc-900/60 px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                    {mIdx + 1}
                  </span>
                  <h3 className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                    {mod.title}
                  </h3>
                </div>
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {mod.estimated_minutes} min
                </span>
              </div>

              <div className="p-4 sm:p-6 divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {mod.lessons?.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5 text-zinc-400">
                        {lesson.is_completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/courses/${course.id}/lesson/${lesson.id}`}
                          className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                        >
                          {lesson.title}
                        </Link>

                        {/* Objectives preview */}
                        {Array.isArray(lesson.objectives) && lesson.objectives.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {lesson.objectives.slice(0, 3).map((obj: string, oIdx: number) => (
                              <span
                                key={oIdx}
                                className="inline-block text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400"
                              >
                                {obj}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/courses/${course.id}/lesson/${lesson.id}`}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition shrink-0"
                      title="Open Lesson"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
