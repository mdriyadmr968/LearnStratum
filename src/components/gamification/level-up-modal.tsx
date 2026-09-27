'use client';

import { useState, useEffect } from 'react';
import { Crown, Sparkles, X, ArrowRight } from 'lucide-react';
import { triggerGoldCelebration } from '@/lib/celebration';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  newRankTitle: string;
}

export function LevelUpModal({
  isOpen,
  onClose,
  newLevel,
  newRankTitle,
}: LevelUpModalProps) {
  useEffect(() => {
    if (isOpen) {
      triggerGoldCelebration();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-700/80 p-6 text-center shadow-2xl space-y-5 animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Glowing Crown Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 animate-ai-orb">
          <Crown className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
            <Sparkles className="w-3 h-3" />
            Stratum Rank Up!
          </span>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-white pt-1">
            Level {newLevel} Reached
          </h3>
          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            {newRankTitle}
          </p>
        </div>

        <p className="text-xs text-zinc-500 leading-relaxed">
          Your dedication to self-curated mastery has elevated your Stratum rank. Keep exploring, quizzing, and retaining knowledge!
        </p>

        <button
          onClick={onClose}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-xs shadow-md transition"
        >
          <span>Claim Glory & Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
