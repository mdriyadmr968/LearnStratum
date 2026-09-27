'use client';

import {
  CheckCircle2,
  Layers,
  HelpCircle,
  Activity,
  Calendar
} from 'lucide-react';
import type { ActivityType } from '@/lib/supabase/types';

export interface ActivityItem {
  id: string;
  activity_type: ActivityType;
  activity_date: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

interface RecentActivityTimelineProps {
  activities: ActivityItem[];
}

export function RecentActivityTimeline({ activities }: RecentActivityTimelineProps) {
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'lesson_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'quiz_completed':
        return <HelpCircle className="w-4 h-4 text-amber-500" />;
      case 'flashcard_reviewed':
        return <Layers className="w-4 h-4 text-violet-500" />;
      default:
        return <Activity className="w-4 h-4 text-indigo-500" />;
    }
  };

  const getActivityTitle = (act: ActivityItem) => {
    switch (act.activity_type) {
      case 'lesson_completed':
        return 'Lesson Completed';
      case 'quiz_completed': {
        const score = act.metadata?.score !== undefined ? `${act.metadata.score}%` : '';
        return `Knowledge Quiz Completed ${score ? `(${score})` : ''}`;
      }
      case 'flashcard_reviewed': {
        const grade = act.metadata?.grade ? `(${String(act.metadata.grade)})` : '';
        return `Flashcard Reviewed ${grade}`;
      }
      default:
        return 'Study Activity';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Recent Study Activity
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Live audit of your active learning journey
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold text-zinc-400">
          {activities.length} Events
        </span>
      </div>

      {activities.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 text-xs text-zinc-400 space-y-2">
          <Calendar className="w-6 h-6 mx-auto text-zinc-400/80" />
          <p>No study logs recorded yet. Begin your first lesson to record activity!</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 max-h-72 overflow-y-auto pr-1">
          {activities.map((act) => (
            <div key={act.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="shrink-0">{getActivityIcon(act.activity_type)}</div>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {getActivityTitle(act)}
                </span>
              </div>
              <span className="text-zinc-400 shrink-0 text-[11px]">
                {formatDate(act.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
