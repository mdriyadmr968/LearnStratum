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
  AlertCircle,
  Zap
} from 'lucide-react';
import {
  getOrGenerateQuiz,
  submitQuizAttempt,
  type QuizWithQuestions
} from '@/app/courses/quiz-actions';
import { triggerConfetti } from '@/lib/celebration';
import { awardUserXP, checkAndAwardBadge } from '@/app/gamification/actions';
import { LevelUpModal } from '@/components/gamification/level-up-modal';

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
  const [justAnsweredIndex, setJustAnsweredIndex] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [levelUpData, setLevelUpData] = useState<{ level: number; title: string } | null>(null);

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
    setJustAnsweredIndex(optionIndex);
  };

  const handleNext = () => {
    if (!quiz) return;
    setJustAnsweredIndex(null);
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

      // Trigger confetti celebration on passing score
      if (res.score >= 70) {
        triggerConfetti();
        const xpAmount = res.score === 100 ? 40 : 30;
        awardUserXP(xpAmount, 'quiz_passed').then((result) => {
          if (result.leveledUp) {
            setLevelUpData({ level: result.level, title: result.rankTitle });
          }
        });
        if (res.score === 100) {
          checkAndAwardBadge('quiz_master');
        }
      }
    });
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setShowExplanation({});
    setCurrentIndex(0);
    setIsCompleted(false);
    setFinalScore(null);
    setJustAnsweredIndex(null);
  };

  // If quiz is not loaded yet
  if (!quiz) {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-center space-y-5">
        {/* Pulsing AI Indicator */}
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-xl animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <HelpCircle className="w-7 h-7" />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Interactive Knowledge Check
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
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
            className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Quiz with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
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
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="relative w-20 h-20 mx-auto">
          <div
            className={`absolute inset-0 rounded-3xl blur-xl ${
              isPassing ? 'bg-emerald-500/30' : 'bg-amber-500/30'
            }`}
          />
          <div
            className={`relative w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-inner animate-check-pop ${
              isPassing
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
            }`}
          >
            <Award className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Quiz Completed
          </span>
          <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            You scored {finalScore}%
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            {isPassing
              ? 'Outstanding performance! You have mastered the core objectives of this lesson.'
              : 'Good attempt! Review the lessons and explanations to reinforce key concepts.'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm transition active:scale-95"
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
      {/* Header with Smooth Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-[11px]">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-zinc-400">·</span>
            <span className="truncate max-w-[200px] sm:max-w-xs">{quiz.title}</span>
          </div>
          <span className="tabular-nums">
            {Math.round(((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100)}%
          </span>
        </div>

        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500 ease-out"
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
              'border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800';

            let animationClass = '';

            if (isAnswered) {
              if (isCorrectOption) {
                buttonStyle =
                  'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500';
                if (isChosen) {
                  animationClass = 'animate-check-pop';
                }
              } else if (isChosen && !isCorrect) {
                buttonStyle =
                  'border-red-500 bg-red-50/80 dark:bg-red-950/40 text-red-900 dark:text-red-200 font-semibold ring-1 ring-red-500';
                animationClass = 'animate-shake';
              } else {
                buttonStyle =
                  'border-zinc-200/60 dark:border-zinc-800/60 opacity-50 bg-transparent text-zinc-400';
              }
            }

            return (
              <div key={idx} className="relative">
                {/* Floating XP Reward Pill on Correct Answer */}
                {isAnswered && isCorrectOption && isChosen && justAnsweredIndex === idx && (
                  <div className="absolute -top-3 right-4 z-20 pointer-events-none animate-xp-float flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/30">
                    <Zap className="w-3 h-3 fill-white" />
                    <span>+10 XP</span>
                  </div>
                )}

                <button
                  onClick={() => handleSelectOption(currentIndex, idx)}
                  disabled={isAnswered}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm transition-all duration-200 flex items-center justify-between gap-3 ${buttonStyle} ${animationClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-transform ${
                        isAnswered && isCorrectOption
                          ? 'bg-emerald-500 text-white scale-110'
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
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 animate-check-pop" />
                  )}
                  {isAnswered && isChosen && !isCorrect && (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smooth Accordion Explanation Card */}
      {isAnswered && showExplanation[currentIndex] && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm border transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
            isCorrect
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
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
        <div className="flex items-center justify-end pt-2 animate-in fade-in duration-200">
          <button
            onClick={handleNext}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs sm:text-sm transition shadow-sm active:scale-95"
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

      {levelUpData && (
        <LevelUpModal
          isOpen={!!levelUpData}
          onClose={() => setLevelUpData(null)}
          newLevel={levelUpData.level}
          newRankTitle={levelUpData.title}
        />
      )}
    </div>
  );
}
