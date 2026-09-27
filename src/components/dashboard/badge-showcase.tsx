'use client';

import {
  Award,
  Lock,
  Flame,
  Zap,
  Target,
  BrainCircuit,
  Globe,
  Crown,
  Footprints,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { UserBadgeItem } from '@/app/gamification/actions';

interface BadgeShowcaseProps {
  badges: UserBadgeItem[];
}

const ICON_MAP: Record<string, any> = {
  Footprints,
  Layers,
  Flame,
  Zap,
  Target,
  BrainCircuit,
  Globe,
  Award,
  Crown,
};

const TIER_STYLES = {
  bronze: {
    bg: 'bg-amber-900/10 dark:bg-amber-950/30',
    border: 'border-amber-700/40',
    text: 'text-amber-800 dark:text-amber-300',
    iconBg: 'bg-amber-800/20 text-amber-700 dark:text-amber-300',
    badge: 'Bronze',
  },
  silver: {
    bg: 'bg-slate-500/10 dark:bg-slate-800/30',
    border: 'border-slate-400/40',
    text: 'text-slate-700 dark:text-slate-200',
    iconBg: 'bg-slate-400/20 text-slate-700 dark:text-slate-300',
    badge: 'Silver',
  },
  gold: {
    bg: 'bg-yellow-500/10 dark:bg-yellow-950/30',
    border: 'border-yellow-500/50',
    text: 'text-yellow-800 dark:text-yellow-300',
    iconBg: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    badge: 'Gold',
  },
  obsidian: {
    bg: 'bg-purple-950/20 dark:bg-purple-950/50',
    border: 'border-purple-500/50',
    text: 'text-purple-800 dark:text-purple-300',
    iconBg: 'bg-purple-600/20 text-purple-600 dark:text-purple-400',
    badge: 'Obsidian',
  },
};

export function BadgeShowcase({ badges }: BadgeShowcaseProps) {
  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Mastery Badges & Trophies
            </h3>
            <p className="text-xs text-zinc-500">
              Unlock prestigious achievements across your learning journey
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {badges.filter((b) => b.isUnlocked).length} of {badges.length} Unlocked
          </span>
          <a
            href="/achievements"
            className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
          >
            View all →
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {badges.map((badge) => {
          const IconComponent = ICON_MAP[badge.icon] || Award;
          const tier = TIER_STYLES[badge.tier];

          return (
            <div
              key={badge.key}
              className={`relative p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3 ${
                badge.isUnlocked
                  ? `${tier.bg} ${tier.border} shadow-sm`
                  : 'bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200/60 dark:border-zinc-800 opacity-60'
              }`}
            >
              {/* Badge Icon */}
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  badge.isUnlocked
                    ? tier.iconBg
                    : 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-400'
                }`}
              >
                {badge.isUnlocked ? (
                  <IconComponent className="w-5 h-5" />
                ) : (
                  <Lock className="w-5 h-5 text-zinc-400" />
                )}
              </div>

              {/* Badge Details */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {badge.name}
                  </h4>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      badge.isUnlocked ? tier.text : 'text-zinc-400'
                    }`}
                  >
                    {tier.badge}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-2">
                  {badge.description}
                </p>

                {badge.isUnlocked && badge.unlockedAt && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium pt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Unlocked
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
