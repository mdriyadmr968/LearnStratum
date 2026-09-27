import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/navbar';
import { harvestLessonResources } from '@/lib/harvester/curator';
import { YouTubePlayer } from '@/components/classroom/youtube-player';
import { MarkdownReader } from '@/components/classroom/markdown-reader';
import { CompletionButton } from '@/components/classroom/completion-button';
import { QuizPanel } from '@/components/classroom/quiz-panel';
import { FlashcardDeck } from '@/components/classroom/flashcard-deck';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Circle,
  HelpCircle,
  Video,
  FileText,
  Layers,
  BrainCircuit
} from 'lucide-react';
import type { Database } from '@/lib/supabase/types';
import type { FlashcardRow } from '@/app/courses/quiz-actions';

interface LessonPageProps {
  params: Promise<{ id: string; lessonId: string }>;
}

type LessonRow = Database['public']['Tables']['lessons']['Row'];
type CourseRow = Database['public']['Tables']['courses']['Row'];

interface ModuleWithLessons {
  id: string;
  title: string;
  order_index: number;
  lessons: LessonRow[];
}

export default async function LessonClassroomPage({ params }: LessonPageProps) {
  const { id: courseId, lessonId } = await params;
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

  // 2. Fetch Current Lesson
  const { data: lessonData, error: lessonError } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (lessonError || !lessonData) {
    notFound();
  }
  const lesson = lessonData as LessonRow;

  // 3. Fetch All Modules & Lessons for Sidebar Navigation
  const { data: rawModules } = await supabase
    .from('modules')
    .select(`
      id,
      title,
      order_index,
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

  const modules: ModuleWithLessons[] = (rawModules as unknown as ModuleWithLessons[]) || [];
  modules.forEach((mod) => {
    if (mod.lessons && Array.isArray(mod.lessons)) {
      mod.lessons.sort((a, b) => a.order_index - b.order_index);
    }
  });

  // Calculate flatten lessons to find previous & next lesson
  const allLessons: LessonRow[] = [];
  modules.forEach((m) => {
    if (m.lessons) {
      allLessons.push(...m.lessons);
    }
  });

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // 4. Harvest Grounded Resources (YouTube Videos & Web Documentation)
  const searchQueries = Array.isArray(lesson.search_queries)
    ? (lesson.search_queries as unknown as string[])
    : [];

  const resources = await harvestLessonResources({
    lessonId,
    lessonTitle: lesson.title,
    courseTopic: course.topic,
    searchQueries,
  });

  const videos = resources.filter((r) => r.type === 'youtube_video');
  const articles = resources.filter(
    (r) => r.type === 'web_article' || r.type === 'doc_page'
  );

  // 5. Check if Quiz already exists
  const { data: existingQuiz } = await supabase
    .from('quizzes')
    .select('id, lesson_id, title, created_at')
    .eq('lesson_id', lessonId)
    .single();

  let initialQuiz = null;
  if (existingQuiz) {
    const { data: questions } = await supabase
      .from('quiz_questions')
      .select('id, question, options, correct_option_index, explanation')
      .eq('quiz_id', existingQuiz.id)
      .order('created_at', { ascending: true });

    initialQuiz = {
      ...existingQuiz,
      questions: (questions ?? []).map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options as string[],
        correct_option_index: q.correct_option_index,
        explanation: q.explanation,
      })),
    };
  }

  // 6. Check if Flashcards already exist
  const { data: existingFlashcards } = await supabase
    .from('flashcards')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: true });

  const initialFlashcards = (existingFlashcards ?? []) as FlashcardRow[];

  const completedCount = allLessons.filter((l) => l.is_completed).length;
  const progressPercent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Course Syllabus
          </Link>

          <div className="flex items-center gap-3">
            <CompletionButton
              lessonId={lesson.id}
              courseId={course.id}
              initialCompleted={lesson.is_completed}
            />

            {nextLesson && (
              <Link
                href={`/courses/${course.id}/lesson/${nextLesson.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm"
              >
                <span>Next Lesson</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Main Classroom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Lesson Content (2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Lesson Title & Objectives Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  {course.topic}
                </span>
                <span className="text-xs text-zinc-400">
                  Lesson {currentIndex + 1} of {allLessons.length}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {lesson.title}
              </h1>

              {/* Objectives List */}
              {Array.isArray(lesson.objectives) && lesson.objectives.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
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

            {/* Video Lecture Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Curated Video Walkthroughs
                </h2>
              </div>
              <YouTubePlayer videos={videos} />
            </div>

            {/* Documentation & Reading Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Documentation & Deep Dive
                </h2>
              </div>
              <MarkdownReader articles={articles} />
            </div>

            {/* Interactive Knowledge Quiz Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Knowledge Check Quiz
                </h2>
              </div>
              <QuizPanel
                lessonId={lesson.id}
                courseId={course.id}
                initialQuiz={initialQuiz}
              />
            </div>

            {/* Spaced Repetition (SM-2) Flashcard Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-500" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  Spaced Repetition Flashcards
                </h2>
              </div>
              <FlashcardDeck
                lessonId={lesson.id}
                courseId={course.id}
                initialFlashcards={initialFlashcards}
              />
            </div>

            {/* Lesson Pagination Footer */}
            <div className="flex items-center justify-between p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              {prevLesson ? (
                <Link
                  href={`/courses/${course.id}/lesson/${prevLesson.id}`}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous: {prevLesson.title}</span>
                </Link>
              ) : (
                <div />
              )}

              {nextLesson && (
                <Link
                  href={`/courses/${course.id}/lesson/${nextLesson.id}`}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition"
                >
                  <span>Next: {nextLesson.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: Syllabus Drawer & Active Recall Status (1 col) */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Progress Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <span>Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-500 text-center">
                {completedCount} of {allLessons.length} lessons completed
              </p>
            </div>

            {/* Retention Engine Highlights */}
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Adaptive Retention Engine
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                LearnStratum schedules your reviews using the SuperMemo-2 (SM-2) algorithm. Flashcards are timed to appear right when recall decay begins.
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-100 dark:border-zinc-800">
                <span>Quiz + SM-2 Active</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Enabled</span>
              </div>
            </div>

            {/* Interactive Syllabus Navigation */}
            <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Course Content
                </span>
                <span className="text-xs text-zinc-500">
                  {modules.length} Modules
                </span>
              </div>

              <div className="p-3 divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-[480px] overflow-y-auto">
                {modules.map((mod, mIdx) => (
                  <div key={mod.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                    <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-2">
                      Module {mIdx + 1}: {mod.title}
                    </div>

                    <div className="space-y-1">
                      {mod.lessons?.map((l) => {
                        const isCurrent = l.id === lesson.id;
                        return (
                          <Link
                            key={l.id}
                            href={`/courses/${course.id}/lesson/${l.id}`}
                            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition ${
                              isCurrent
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 font-medium'
                            }`}
                          >
                            {l.is_completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 shrink-0" />
                            )}
                            <span className="truncate">{l.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
