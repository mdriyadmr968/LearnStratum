'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GitFork, Loader2 } from 'lucide-react';
import { forkCourse } from '@/app/courses/sharing-actions';

interface ForkButtonProps {
  courseId: string;
  className?: string;
}

export function ForkButton({ courseId, className = '' }: ForkButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFork = async () => {
    setLoading(true);
    setError(null);
    const res = await forkCourse(courseId);
    setLoading(false);

    if (res.success && res.newCourseId) {
      router.push(`/courses/${res.newCourseId}`);
    } else {
      setError(res.error || 'Failed to fork course.');
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={handleFork}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 ${className}`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <GitFork className="w-4 h-4" />
        )}
        <span>{loading ? 'Forking Course…' : 'Fork to My Dashboard'}</span>
      </button>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2 rounded-lg">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
