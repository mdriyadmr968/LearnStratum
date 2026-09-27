'use client';

import { Flame, CheckCircle2 } from 'lucide-react';

interface ActivityDay {
  date: string;       // YYYY-MM-DD
  count: number;
  hasActivity: boolean;
}

interface StreakCalendarProps {
  currentStreakDays: number;
  activityDays: ActivityDay[];
}

export function StreakCalendar({ currentStreakDays, activityDays }: StreakCalendarProps) {
  // Format day name helper
  const getDayLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'narrow' });
  };

  const getDayNumber = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getDate();
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/60 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <Flame className="w-5 h-5 fill-orange-500/20 text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Study Streak
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Active daily consistency tracker
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xl font-extrabold text-orange-600 dark:text-orange-400">
            {currentStreakDays} {currentStreakDays === 1 ? 'day' : 'days'}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Current streak
          </span>
        </div>
      </div>

      {/* Heatmap / Day Grid for recent days */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400">
          <span>Past 14 Days</span>
          <span>Consistency matters</span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
          {activityDays.map((day) => {
            const isToday =
              day.date === new Date().toISOString().split('T')[0];

            return (
              <div
                key={day.date}
                className="flex flex-col items-center gap-1 group relative"
                title={`${day.date}: ${day.count} activities`}
              >
                <span className="text-[10px] text-zinc-400 font-medium">
                  {getDayLabel(day.date)}
                </span>
                <div
                  className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                    day.hasActivity
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20 scale-100 ring-2 ring-orange-400/20'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/60'
                  } ${isToday ? 'border-2 border-indigo-500' : ''}`}
                >
                  {day.hasActivity ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <span>{getDayNumber(day.date)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>Complete a lesson, quiz, or flashcard review to maintain your streak!</span>
      </div>
    </div>
  );
}
