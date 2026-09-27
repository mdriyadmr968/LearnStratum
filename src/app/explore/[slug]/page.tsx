import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/navbar';
import { ForkButton } from '@/components/fork-button';
import {
  ArrowLeft,
  Sparkles,
  Clock,
  Layers,
  Circle,
  Globe,
} from 'lucide-react';
import type { Metadata } from 'next';
import type { Database } from '@/lib/supabase/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase
    .from('courses')
    .select('title, description')
    .eq('slug', slug)
    .single();

  return {
    title: course?.title ? `${course.title} – LearnStratum Explore` : 'Course – LearnStratum',
    description: course?.description || 'Learn and fork AI-curated courses on LearnStratum.',
  };
}

export default async function PublicCourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch Course by slug
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('is_public', true)
    .single();

  if (courseError || !course) {
    notFound();
  }

  // 2. Fetch Modules & Lessons
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
        objectives
      )
    `)
    .eq('course_id', course.id)
    .order('order_index', { ascending: true });

  const modules = (rawModules ?? []).map((m: any) => {
    const lessons = [...(m.lessons ?? [])].sort(
      (a: any, b: any) => a.order_index - b.order_index
    );
    return { ...m, lessons };
  });

  const totalLessons = modules.reduce(
    (acc, m) => acc + (m.lessons?.length || 0),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Link>

        {/* Public Header Card */}
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

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5" />
              <span>Public Course</span>
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

          {/* Fork Action */}
          <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-zinc-500">
              <p className="font-semibold text-zinc-700 dark:text-zinc-300">
                {modules.length} Modules • {totalLessons} Lessons
              </p>
              <p>Fork this curriculum to track your individual progress, take quizzes, and earn a certificate.</p>
            </div>

            <ForkButton courseId={course.id} />
          </div>
        </div>

        {/* Syllabus Overview */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Course Syllabus Preview
          </h2>

          {modules.map((mod: any, mIdx: number) => (
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
                {mod.lessons?.map((lesson: any) => (
                  <div
                    key={lesson.id}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3"
                  >
                    <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-700 mt-1 shrink-0" />
                    <div className="space-y-1">
                      <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        {lesson.title}
                      </p>
                      {Array.isArray(lesson.objectives) && lesson.objectives.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {lesson.objectives.slice(0, 3).map((obj: string, oIdx: number) => (
                            <span
                              key={oIdx}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                            >
                              {obj}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
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
