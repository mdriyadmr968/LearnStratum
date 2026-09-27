'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, Sparkles } from 'lucide-react';
import type { RankInfo } from '@/lib/gamification';

interface XPBadgeProps {
  rankInfo: RankInfo | null;
}

export function XPBadge({ rankInfo }: XPBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!rankInfo) return null;

  return (
    <div
      className="relative hidden sm:block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs font-semibold hover:border-amber-400 transition"
      >
        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span>Lvl {rankInfo.level}</span>
        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
          ({rankInfo.currentXP} XP)
        </span>
      </Link>

      {/* Floating progress popover */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl z-50 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-white">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {rankInfo.title}
            </span>
            <span>Level {rankInfo.level}</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>{rankInfo.currentXP} XP</span>
              <span>{rankInfo.nextLevelXP} XP</span>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${rankInfo.progressPercent}%` }}
              />
            </div>
          </div>

          <p className="text-[10px] text-zinc-400 text-center">
            {rankInfo.xpRequiredForNext > 0
              ? `${rankInfo.xpRequiredForNext} XP to Level ${rankInfo.level + 1}`
              : 'Maximum Stratum Level Reached!'}
          </p>
        </div>
      )}
    </div>
  );
}
