import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/navbar';
import {
  ArrowLeft,
  Sparkles,
  Video,
  FileText,
  HelpCircle
} from 'lucide-react';

interface LessonPageProps {
  params: Promise<{ id: string; lessonId: string }>;
}

export default async function LessonClassroomPage({ params }: LessonPageProps) {
  const { id: courseId, lessonId } = await params;
  const supabase = await createClient();

  // Fetch Course
  const { data: course } = await supabase
    .from('courses')
    .select('id, title, topic')
    .eq('id', courseId)
    .single();

  // Fetch Lesson
  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (!course || !lesson) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Syllabus
        </Link>

        {/* Lesson Title Banner */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
            {course.title}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            {lesson.title}
          </h1>

          {/* Objectives */}
          {Array.isArray(lesson.objectives) && lesson.objectives.length > 0 && (
            <div className="mt-5 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2">
                Learning Objectives:
              </span>
              <ul className="space-y-1.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                {(lesson.objectives as unknown as string[]).map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    <span>{String(obj)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Milestone 3 Preview Callout */}
        <div className="rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Classroom Harvester (Milestone 3 Preview)
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              In Milestone 3, opening this lesson triggers the grounded content harvester: YouTube Data API will embed verified video tutorials and Jina Reader will extract summarized documentation.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-red-500" />
              YouTube Video Embeds
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-500" />
              Jina Markdown Reader
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              SM-2 Quizzes & Flashcards
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
