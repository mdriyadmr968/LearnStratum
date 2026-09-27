/**
 * SuperMemo-2 (SM-2) spaced repetition algorithm.
 * Reference: https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-super-memo-method
 */

export interface SM2Input {
  repetition: number;  // previous repetitions count (0 = never reviewed)
  interval: number;    // previous interval in days
  easeFactor: number;  // default 2.5 — higher means longer gaps
  grade: number;       // 0 (blackout) to 5 (perfect recall)
}

export interface SM2Output {
  repetition: number;
  interval: number;
  easeFactor: number;
  nextReviewDate: Date;
}

export function calculateSM2({ repetition, interval, easeFactor, grade }: SM2Input): SM2Output {
  let nextRepetition = repetition;
  let nextInterval = interval;
  let nextEaseFactor = easeFactor;

  if (grade >= 3) {
    // Correct response
    if (repetition === 0) {
      nextInterval = 1;
    } else if (repetition === 1) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(interval * easeFactor);
    }
    nextRepetition += 1;
  } else {
    // Incorrect — reset sequence
    nextRepetition = 0;
    nextInterval = 1;
  }

  // Adjust ease factor (minimum 1.3 to prevent intervals collapsing)
  nextEaseFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  );

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

  return {
    repetition: nextRepetition,
    interval: nextInterval,
    easeFactor: Number(nextEaseFactor.toFixed(2)),
    nextReviewDate,
  };
}

/** Simplified 4-button grade mapping for UX */
export const GRADE_MAP = {
  again: 0,   // Complete blackout
  hard: 2,    // Incorrect but remembered with hint
  good: 4,    // Correct with some effort
  easy: 5,    // Perfect recall
} as const;

export type GradeLabel = keyof typeof GRADE_MAP;
