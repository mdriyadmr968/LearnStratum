'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { generateQuiz } from '@/lib/gemini/quiz-generator';
import { generateFlashcards } from '@/lib/gemini/flashcard-generator';
import { calculateSM2, GRADE_MAP, type GradeLabel } from '@/lib/sm2';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
}

export interface QuizWithQuestions {
  id: string;
  lesson_id: string;
  title: string;
  created_at: string;
  questions: QuizQuestion[];
}

export interface FlashcardRow {
  id: string;
  lesson_id: string;
  user_id: string;
  front: string;
  back: string;
  repetitions: number;
  interval_days: number;
  ease_factor: number;
  next_review_at: string;
  last_reviewed_at: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Quiz Actions
// ---------------------------------------------------------------------------

/**
 * Fetch existing quiz for a lesson, or generate one via Gemini and persist it.
 * Returns the quiz with all questions included.
 */
export async function getOrGenerateQuiz(
  lessonId: string
): Promise<{ quiz: QuizWithQuestions | null; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { quiz: null, error: 'Not authenticated' };

  // 1. Check for cached quiz
  const { data: existingQuiz } = await supabase
    .from('quizzes')
    .select('id, lesson_id, title, created_at')
    .eq('lesson_id', lessonId)
    .single();

  if (existingQuiz) {
    const { data: questions } = await supabase
      .from('quiz_questions')
      .select('id, question, options, correct_option_index, explanation')
      .eq('quiz_id', existingQuiz.id)
      .order('created_at', { ascending: true });

    return {
      quiz: {
        ...existingQuiz,
        questions: (questions ?? []).map((q) => ({
          id: q.id,
          question: q.question,
          options: q.options as string[],
          correct_option_index: q.correct_option_index,
          explanation: q.explanation,
        })),
      },
    };
  }

  // 2. Fetch lesson data to generate quiz
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('title, objectives')
    .eq('id', lessonId)
    .single();

  if (lessonError || !lesson) return { quiz: null, error: 'Lesson not found' };

  const objectives = Array.isArray(lesson.objectives)
    ? (lesson.objectives as unknown as string[])
    : [];

  // 3. Generate quiz via Gemini
  const generated = await generateQuiz(lesson.title, objectives);

  // 4. Persist quiz
  const { data: newQuiz, error: quizError } = await supabase
    .from('quizzes')
    .insert({ lesson_id: lessonId, title: generated.title })
    .select('id, lesson_id, title, created_at')
    .single();

  if (quizError || !newQuiz) {
    return { quiz: null, error: 'Failed to save quiz' };
  }

  // 5. Persist questions
  const questionRows = generated.questions.map((q) => ({
    quiz_id: newQuiz.id,
    question: q.question,
    options: q.options,
    correct_option_index: q.correct_option_index,
    explanation: q.explanation,
  }));

  const { data: insertedQuestions } = await supabase
    .from('quiz_questions')
    .insert(questionRows)
    .select('id, question, options, correct_option_index, explanation');

  return {
    quiz: {
      ...newQuiz,
      questions: (insertedQuestions ?? []).map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options as string[],
        correct_option_index: q.correct_option_index,
        explanation: q.explanation,
      })),
    },
  };
}

/**
 * Submit a completed quiz attempt and log it.
 */
export async function submitQuizAttempt(
  quizId: string,
  lessonId: string,
  courseId: string,
  answers: number[],      // user's selected option index per question
  correctAnswers: number[], // ground truth
  totalQuestions: number
): Promise<{ score: number; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { score: 0, error: 'Not authenticated' };

  const correctCount = answers.filter((a, i) => a === correctAnswers[i]).length;
  const score = Math.round((correctCount / totalQuestions) * 100);

  await supabase.from('quiz_submissions').insert({
    quiz_id: quizId,
    user_id: user.id,
    score,
    answers,
  });

  // Log activity
  await supabase.from('study_activity_logs').insert({
    user_id: user.id,
    activity_type: 'quiz_completed',
    activity_date: new Date().toISOString().split('T')[0],
    metadata: { quiz_id: quizId, lesson_id: lessonId, score },
  });

  revalidatePath(`/courses/${courseId}/lesson/${lessonId}`);

  return { score };
}

// ---------------------------------------------------------------------------
// Flashcard Actions
// ---------------------------------------------------------------------------

/**
 * Fetch existing flashcards for a lesson, or generate and persist them.
 */
export async function getOrGenerateFlashcards(
  lessonId: string
): Promise<{ flashcards: FlashcardRow[]; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { flashcards: [], error: 'Not authenticated' };

  // 1. Check existing cards for this user + lesson
  const { data: existing } = await supabase
    .from('flashcards')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (existing && existing.length > 0) {
    return { flashcards: existing as FlashcardRow[] };
  }

  // 2. Fetch lesson data
  const { data: lesson, error: lessonError } = await supabase
    .from('lessons')
    .select('title, objectives')
    .eq('id', lessonId)
    .single();

  if (lessonError || !lesson) return { flashcards: [], error: 'Lesson not found' };

  const objectives = Array.isArray(lesson.objectives)
    ? (lesson.objectives as unknown as string[])
    : [];

  // 3. Generate flashcards via Gemini
  const generated = await generateFlashcards(lesson.title, objectives);

  // 4. Persist
  const rows = generated.map((fc) => ({
    lesson_id: lessonId,
    user_id: user.id,
    front: fc.front,
    back: fc.back,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from('flashcards')
    .insert(rows)
    .select('*');

  if (insertError) {
    return { flashcards: [], error: 'Failed to save flashcards' };
  }

  return { flashcards: (inserted ?? []) as FlashcardRow[] };
}

/**
 * Record a flashcard review using SM-2 and update the card.
 */
export async function reviewFlashcard(
  flashcardId: string,
  lessonId: string,
  courseId: string,
  gradeLabel: GradeLabel,
  currentRepetitions: number,
  currentInterval: number,
  currentEaseFactor: number
): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const grade = GRADE_MAP[gradeLabel];
  const { repetition, interval, easeFactor, nextReviewDate } = calculateSM2({
    repetition: currentRepetitions,
    interval: currentInterval,
    easeFactor: currentEaseFactor,
    grade,
  });

  await supabase
    .from('flashcards')
    .update({
      repetitions: repetition,
      interval_days: interval,
      ease_factor: easeFactor,
      next_review_at: nextReviewDate.toISOString(),
      last_reviewed_at: new Date().toISOString(),
    })
    .eq('id', flashcardId)
    .eq('user_id', user.id);

  // Log activity
  await supabase.from('study_activity_logs').insert({
    user_id: user.id,
    activity_type: 'flashcard_reviewed',
    activity_date: new Date().toISOString().split('T')[0],
    metadata: { flashcard_id: flashcardId, lesson_id: lessonId, grade: gradeLabel },
  });

  revalidatePath(`/courses/${courseId}/lesson/${lessonId}`);

  return {};
}

/**
 * Get count of flashcards due for review today (across all lessons).
 */
export async function getFlashcardsDueCount(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from('flashcards')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .lte('next_review_at', new Date().toISOString());

  return count ?? 0;
}
