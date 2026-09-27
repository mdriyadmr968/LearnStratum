'use client';

import React, { useState } from 'react';
import { toggleLessonCompletion } from '@/app/courses/lesson-actions';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { triggerGoldCelebration } from '@/lib/celebration';

interface CompletionButtonProps {
  lessonId: string;
  courseId: string;
  initialCompleted: boolean;
}

export function CompletionButton({
  lessonId,
  courseId,
  initialCompleted,
}: CompletionButtonProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async () => {
    const nextState = !isCompleted;
    setIsCompleted(nextState);
    setIsPending(true);

    if (nextState) {
      triggerGoldCelebration();
    }

    const res = await toggleLessonCompletion(lessonId, courseId, nextState);
    if (!res.success) {
      // Revert if failed
      setIsCompleted(!nextState);
    }
    setIsPending(false);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 shadow-sm active:scale-95 ${
        isCompleted
          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
          : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
      }`}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isCompleted ? (
        <CheckCircle2 className="w-4 h-4 text-white animate-check-pop" />
      ) : (
        <Circle className="w-4 h-4 text-zinc-400" />
      )}
      <span>{isCompleted ? 'Completed' : 'Mark as Complete'}</span>
    </button>
  );
}
