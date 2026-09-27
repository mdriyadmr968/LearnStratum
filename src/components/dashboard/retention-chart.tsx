'use client';

import { Layers, Award, TrendingUp, CheckCircle2 } from 'lucide-react';

interface RetentionStats {
  totalCards: number;
  masteredCards: number;
  reviewingCards: number;
  newCards: number;
  averageEaseFactor: number;
}

interface QuizStats {
  totalSubmissions: number;
  averageScore: number;
  recentScores: { id: string; score: number; date: string }[];
}

interface RetentionChartProps {
  retention: RetentionStats;
  quizStats: QuizStats;
}

export function RetentionChart({ retention, quizStats }: RetentionChartProps) {
  const masteredPercent =
    retention.totalCards > 0
      ? Math.round((retention.masteredCards / retention.totalCards) * 100)
      : 0;

  const reviewingPercent =
    retention.totalCards > 0
      ? Math.round((retention.reviewingCards / retention.totalCards) * 100)
      : 0;

  const newPercent =
    retention.totalCards > 0
      ? Math.max(0, 100 - masteredPercent - reviewingPercent)
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Flashcard Retention & Memory Stability */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Spaced Repetition Retention
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                SM-2 Memory Decay Resistance
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-extrabold text-violet-600 dark:text-violet-400">
              {retention.totalCards}
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Total Cards
            </span>
          </div>
        </div>

        {/* Stacked Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden flex">
            <div
              style={{ width: `${masteredPercent}%` }}
              className="bg-emerald-500 h-full transition-all duration-500"
              title={`Mastered: ${masteredPercent}%`}
            />
            <div
              style={{ width: `${reviewingPercent}%` }}
              className="bg-indigo-500 h-full transition-all duration-500"
              title={`Learning/Reviewing: ${reviewingPercent}%`}
            />
            <div
              style={{ width: `${newPercent}%` }}
              className="bg-zinc-300 dark:bg-zinc-700 h-full transition-all duration-500"
              title={`New: ${newPercent}%`}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Mastered ({retention.masteredCards})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Reviewing ({retention.reviewingCards})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span>New ({retention.newCards})</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-zinc-600 dark:text-zinc-300 font-medium">
              Average Ease Factor:
            </span>
          </div>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">
            {retention.averageEaseFactor.toFixed(2)}x
          </span>
        </div>
      </div>

      {/* 2. Quiz Performance & Mastery History */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Knowledge Quiz Mastery
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Comprehension testing results
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
              {quizStats.averageScore}%
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Avg Score
            </span>
          </div>
        </div>

        {/* Recent attempts or empty state */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Recent Quiz Submissions ({quizStats.totalSubmissions} total)
          </div>

          {quizStats.recentScores.length === 0 ? (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 text-center text-xs text-zinc-400">
              No quizzes attempted yet. Complete a lesson to take your first knowledge check!
            </div>
          ) : (
            <div className="space-y-2">
              {quizStats.recentScores.slice(0, 3).map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        submission.score >= 70
                          ? 'text-emerald-500'
                          : 'text-amber-500'
                      }`}
                    />
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      Score: {submission.score}%
                    </span>
                  </div>
                  <span className="text-zinc-400">{submission.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span>Active recall strengthens neural pathways</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {quizStats.totalSubmissions > 0 ? 'Tracking Active' : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
}
