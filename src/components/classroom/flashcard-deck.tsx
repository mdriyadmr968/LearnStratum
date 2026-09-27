'use client';

import { useState, useTransition } from 'react';
import {
  Layers,
  Sparkles,
  RotateCw,
  CheckCircle2,
  RotateCcw,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  getOrGenerateFlashcards,
  reviewFlashcard,
  type FlashcardRow
} from '@/app/courses/quiz-actions';
import { type GradeLabel } from '@/lib/sm2';
import { triggerConfetti } from '@/lib/celebration';

interface FlashcardDeckProps {
  lessonId: string;
  courseId: string;
  initialFlashcards?: FlashcardRow[];
}

export function FlashcardDeck({
  lessonId,
  courseId,
  initialFlashcards = [],
}: FlashcardDeckProps) {
  const [cards, setCards] = useState<FlashcardRow[]>(initialFlashcards);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Deck review state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLoadFlashcards = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrGenerateFlashcards(lessonId);
      if (res.error) {
        setError(res.error);
      } else {
        setCards(res.flashcards);
      }
    } catch {
      setError('An unexpected error occurred while generating flashcards.');
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleRate = (grade: GradeLabel) => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    startTransition(async () => {
      await reviewFlashcard(
        currentCard.id,
        lessonId,
        courseId,
        grade,
        currentCard.repetitions,
        currentCard.interval_days,
        currentCard.ease_factor
      );

      setReviewedCount((prev) => prev + 1);
      setIsFlipped(false);

      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsCompleted(true);
        triggerConfetti();
      }
    });
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setReviewedCount(0);
    setIsCompleted(false);
  };

  // If cards not loaded yet
  if (cards.length === 0) {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-center space-y-5">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 rounded-2xl bg-violet-500/20 blur-xl animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/60 border border-violet-100 dark:border-violet-900/40 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <Layers className="w-7 h-7" />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Spaced Repetition Deck
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            SuperMemo-2 (SM-2) smart flashcards generated from this lesson&apos;s key concepts to maximize your long-term memory retention.
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
            onClick={handleLoadFlashcards}
            disabled={loading}
            className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Flashcards with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
                <span>Generate SM-2 Flashcards</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Session Completed State
  if (isCompleted) {
    return (
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-3xl bg-emerald-500/30 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner animate-check-pop">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Study Deck Completed
          </span>
          <h3 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            All {cards.length} Cards Reviewed!
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
            The SM-2 algorithm has updated your review intervals and next review dates in your personal spaced repetition schedule.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Deck Again</span>
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 font-bold uppercase tracking-wider text-[11px]">
              Card {currentIndex + 1} of {cards.length}
            </span>
            <span className="text-zinc-400">·</span>
            <span className="text-zinc-500">Interval: {currentCard.interval_days}d</span>
          </div>
          <span className="tabular-nums">
            {Math.round((reviewedCount / cards.length) * 100)}% Reviewed
          </span>
        </div>

        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-violet-600 h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(reviewedCount / cards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 3D Interactive Card Flip Container */}
      <div className="perspective-1000 w-full min-h-[260px] sm:min-h-[290px]">
        <div
          onClick={handleFlip}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handleFlip();
            }
          }}
          className={`relative w-full h-[260px] sm:h-[290px] rounded-3xl preserve-3d transition-transform duration-500 ease-out cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front */}
          <div className="absolute inset-0 backface-hidden p-6 sm:p-8 rounded-3xl border-2 border-indigo-100 dark:border-zinc-800 bg-gradient-to-b from-zinc-50/60 via-white to-white dark:from-zinc-800/40 dark:via-zinc-900 dark:to-zinc-900 flex flex-col justify-between shadow-sm hover:border-indigo-400 transition-colors">
            <div className="flex items-center justify-between text-xs font-bold tracking-wider uppercase text-zinc-400">
              <span>Question / Concept</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-indigo-600 transition">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Click to flip</span>
              </span>
            </div>

            <div className="my-auto py-3">
              <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed">
                {currentCard.front}
              </p>
            </div>

            <div className="text-[11px] text-zinc-400 italic">
              Think of your answer before flipping the card
            </div>
          </div>

          {/* Card Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 p-6 sm:p-8 rounded-3xl border-2 border-violet-200 dark:border-violet-900/50 bg-gradient-to-b from-violet-50/40 via-white to-white dark:from-violet-950/20 dark:via-zinc-900 dark:to-zinc-900 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold tracking-wider uppercase text-violet-600 dark:text-violet-400">
              <span>Answer & Explanation</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-violet-600 transition">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Click to flip back</span>
              </span>
            </div>

            <div className="my-auto py-3">
              <p className="text-sm sm:text-base font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
                {currentCard.back}
              </p>
            </div>

            <div className="text-[11px] text-zinc-400 italic">
              Rate your recall quality below to schedule next interval
            </div>
          </div>
        </div>
      </div>

      {/* SM-2 Rating Controls (Active once flipped) */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block text-center">
          {isFlipped ? 'How well did you remember this?' : 'Flip card to rate recall'}
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => handleRate('again')}
            disabled={!isFlipped || isPending}
            className="p-3 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 text-center space-y-0.5 shadow-sm"
          >
            <div className="text-xs font-bold text-red-600 dark:text-red-400">Again</div>
            <div className="text-[10px] text-zinc-500">Reset to 1d</div>
          </button>

          <button
            onClick={() => handleRate('hard')}
            disabled={!isFlipped || isPending}
            className="p-3 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 text-center space-y-0.5 shadow-sm"
          >
            <div className="text-xs font-bold text-amber-600 dark:text-amber-400">Hard</div>
            <div className="text-[10px] text-zinc-500">~1–2 days</div>
          </button>

          <button
            onClick={() => handleRate('good')}
            disabled={!isFlipped || isPending}
            className="p-3 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 text-center space-y-0.5 shadow-sm"
          >
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Good</div>
            <div className="text-[10px] text-zinc-500">Standard SM-2</div>
          </button>

          <button
            onClick={() => handleRate('easy')}
            disabled={!isFlipped || isPending}
            className="p-3 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95 text-center space-y-0.5 shadow-sm"
          >
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Easy</div>
            <div className="text-[10px] text-zinc-500">Long interval</div>
          </button>
        </div>
      </div>
    </div>
  );
}
