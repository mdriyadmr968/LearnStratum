'use client';

import { useState, useTransition } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  Award,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  getOrGenerateQuiz,
  submitQuizAttempt,
  type QuizWithQuestions
} from '@/app/courses/quiz-actions';

interface QuizPanelProps {
  lessonId: string;
  courseId: string;
  initialQuiz?: QuizWithQuestions | null;
}

export function QuizPanel({ lessonId, courseId, initialQuiz = null }: QuizPanelProps) {
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(initialQuiz);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load quiz on demand if not pre-loaded
  const handleLoadQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrGenerateQuiz(lessonId);
      if (res.error || !res.quiz) {
        setError(res.error || 'Failed to generate quiz. Please try again.');
      } else {
        setQuiz(res.quiz);
      }
    } catch {
      setError('An unexpected error occurred while loading the quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (selectedAnswers[questionIndex] !== undefined) return; // Locked after selection

    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
    setShowExplanation((prev) => ({ ...prev, [questionIndex]: true }));
  };

  const handleNext = () => {
    if (!quiz) return;
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Calculate score and submit
      handleSubmitAll();
    }
  };

  const handleSubmitAll = () => {
    if (!quiz) return;
    const questions = quiz.questions;
    const answers = questions.map((_, i) => selectedAnswers[i] ?? -1);
    const correctAnswers = questions.map((q) => q.correct_option_index);

    startTransition(async () => {
      const res = await submitQuizAttempt(
        quiz.id,
        lessonId,
        courseId,
        answers,
        correctAnswers,
        questions.length
      );
      setFinalScore(res.score);
      setIsCompleted(true);
    });
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setShowExplanation({});
    setCurrentIndex(0);
    setIsCompleted(false);
    setFinalScore(null);
  };

  // If quiz is not loaded yet
  if (!quiz) {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Interactive Knowledge Check
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
            Test your comprehension of this lesson&apos;s objectives with AI-generated multiple-choice questions.
          </p>
        </div>

        {error && (
          <div className="inline-flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <button
            onClick={handleLoadQuiz}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs sm:text-sm transition shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Quiz with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Start Knowledge Quiz</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  const questions = quiz.questions;
  const currentQ = questions[currentIndex];
  const selectedOption = selectedAnswers[currentIndex];
  const isAnswered = selectedOption !== undefined;
  const isCorrect = isAnswered && selectedOption === currentQ.correct_option_index;

  // Completed State View
  if (isCompleted && finalScore !== null) {
    const isPassing = finalScore >= 70;
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div
          className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-inner ${
            isPassing
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
          }`}
        >
          <Award className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Quiz Completed
          </span>
          <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            You scored {finalScore}%
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            {isPassing
              ? 'Outstanding performance! You have mastered the core objectives of this lesson.'
              : 'Good attempt! Review the lessons and explanations to reinforce key concepts.'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Quiz</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
      {/* Header with Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-zinc-400">·</span>
            <span className="truncate max-w-[200px] sm:max-w-xs">{quiz.title}</span>
          </div>
          <span>
            {Math.round(((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100)}%
          </span>
        </div>

        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question Prompt */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((option, idx) => {
            const isChosen = selectedOption === idx;
            const isCorrectOption = currentQ.correct_option_index === idx;

            let buttonStyle =
              'border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200';

            if (isAnswered) {
              if (isCorrectOption) {
                buttonStyle =
                  'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500';
              } else if (isChosen && !isCorrect) {
                buttonStyle =
                  'border-red-500 bg-red-50/80 dark:bg-red-950/40 text-red-900 dark:text-red-200 font-semibold ring-1 ring-red-500';
              } else {
                buttonStyle =
                  'border-zinc-200/60 dark:border-zinc-800/60 opacity-50 bg-transparent text-zinc-400';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(currentIndex, idx)}
                disabled={isAnswered}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm transition flex items-center justify-between gap-3 ${buttonStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                      isAnswered && isCorrectOption
                        ? 'bg-emerald-500 text-white'
                        : isAnswered && isChosen
                        ? 'bg-red-500 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option}</span>
                </div>

                {isAnswered && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {isAnswered && isChosen && !isCorrect && (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Instant Explanation Card */}
      {isAnswered && showExplanation[currentIndex] && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm border transition-all ${
            isCorrect
              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold mb-1">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Correct!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Explanation</span>
              </>
            )}
          </div>
          <p className="leading-relaxed opacity-90">{currentQ.explanation}</p>
        </div>
      )}

      {/* Footer Navigation */}
      {isAnswered && (
        <div className="flex items-center justify-end pt-2">
          <button
            onClick={handleNext}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs sm:text-sm transition shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting results...</span>
              </>
            ) : (
              <>
                <span>
                  {currentIndex === questions.length - 1 ? 'Finish & See Results' : 'Next Question'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
