'use client';

import { Sparkles, Trophy, Zap, ChevronRight, Award } from 'lucide-react';
import type { RankInfo } from '@/lib/gamification';

interface GamificationCardProps {
  rankInfo: RankInfo;
  unlockedBadgeCount: number;
  totalBadgeCount: number;
}

export function GamificationCard({
  rankInfo,
  unlockedBadgeCount,
  totalBadgeCount,
}: GamificationCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-zinc-950 text-white p-6 sm:p-7 border border-indigo-800/50 shadow-md">
      {/* Background glow orb */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Rank & Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              Level {rankInfo.level}
            </span>
            <span className="text-xs text-indigo-300">
              {rankInfo.currentXP} Total XP
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <span>{rankInfo.title}</span>
          </h3>

          <p className="text-xs text-zinc-300 max-w-md leading-relaxed">
            Every completed lesson (+50 XP), quiz (+30 XP), and flashcard review (+5 XP) brings you closer to the next Stratum rank.
          </p>
        </div>

        {/* Right: XP Progress Bar & Badges counter */}
        <div className="w-full md:w-80 space-y-4 rounded-2xl bg-white/5 p-4 border border-white/10 backdrop-blur-sm">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300">Level Progress</span>
              <span className="font-mono text-amber-400 font-bold">
                {rankInfo.progressPercent}%
              </span>
            </div>

            <div className="w-full bg-zinc-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-amber-400 to-yellow-400 h-1.5 rounded-full transition-all duration-700 shadow-sm shadow-amber-400/50"
                style={{ width: `${rankInfo.progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>{rankInfo.currentXP} XP</span>
              <span>
                {rankInfo.xpRequiredForNext > 0
                  ? `${rankInfo.xpRequiredForNext} XP to next level`
                  : 'Max rank achieved!'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Mastery Trophies</span>
            </div>
            <span className="font-bold text-white">
              {unlockedBadgeCount} / {totalBadgeCount} Unlocked
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
