'use client';

import { useState } from 'react';
import { Globe, Lock, Copy, CheckCheck, ExternalLink, Loader2, Share2 } from 'lucide-react';
import { toggleCoursePublic } from '@/app/courses/sharing-actions';

interface CourseSharePanelProps {
  courseId: string;
  initialIsPublic: boolean;
  initialSlug: string | null;
  isOwner: boolean;
}

export function CourseSharePanel({
  courseId,
  initialIsPublic,
  initialSlug,
  isOwner,
}: CourseSharePanelProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [slug, setSlug] = useState<string | null>(initialSlug);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOwner) return null;

  const publicUrl = slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/explore/${slug}`
    : '';

  const handleToggle = async () => {
    setLoading(true);
    setError(null);
    const nextState = !isPublic;
    const res = await toggleCoursePublic(courseId, nextState);
    setLoading(false);

    if (res.success) {
      setIsPublic(!!res.isPublic);
      if (res.slug) setSlug(res.slug);
    } else {
      setError(res.error || 'Failed to update visibility.');
    }
  };

  const handleCopy = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Course Visibility</h4>
            <p className="text-xs text-zinc-500">
              {isPublic ? 'Public — Anyone with the link can view & fork' : 'Private — Only visible to you'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading}
          type="button"
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            isPublic
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isPublic ? (
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Lock className="w-3.5 h-3.5" />
          )}
          <span>{isPublic ? 'Public' : 'Make Public'}</span>
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl">
          ⚠️ {error}
        </p>
      )}

      {isPublic && slug && (
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            readOnly
            value={publicUrl}
            className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 focus:outline-none"
          />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>
            <a
              href={`/explore/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              title="Open Public Preview"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
