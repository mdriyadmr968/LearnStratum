'use client';

import { useState } from 'react';
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
  CheckCircle2,
  Trophy,
  Star,
} from 'lucide-react';
import type { UserGamificationState } from '@/app/gamification/actions';
import type { RankTier } from '@/lib/gamification';
import { FadeIn, StaggerContainer, StaggerItem, CardHover } from '@/components/animations/motion-components';

const ICON_MAP: Record<string, React.ElementType> = {
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
    text: 'text-amber-700 dark:text-amber-300',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
    badge: 'Bronze',
    glow: 'shadow-amber-500/10',
    dot: 'bg-amber-500',
  },
  silver: {
    bg: 'bg-slate-400/10 dark:bg-slate-800/30',
    border: 'border-slate-400/40',
    text: 'text-slate-700 dark:text-slate-200',
    iconBg: 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300',
    badge: 'Silver',
    glow: 'shadow-slate-500/10',
    dot: 'bg-slate-400',
  },
  gold: {
    bg: 'bg-yellow-500/10 dark:bg-yellow-950/30',
    border: 'border-yellow-500/50',
    text: 'text-yellow-700 dark:text-yellow-300',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    badge: 'Gold',
    glow: 'shadow-yellow-500/20',
    dot: 'bg-yellow-500',
  },
  obsidian: {
    bg: 'bg-purple-950/20 dark:bg-purple-950/50',
    border: 'border-purple-500/50',
    text: 'text-purple-700 dark:text-purple-300',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
    badge: 'Obsidian',
    glow: 'shadow-purple-500/20',
    dot: 'bg-purple-500',
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  learning: 'Learning',
  quiz: 'Quiz',
  streak: 'Streak',
  community: 'Community',
  mastery: 'Mastery',
};

const HOW_TO_EARN: Record<string, string> = {
  first_lesson:
    'Open any course, enter a lesson and click "Mark as Complete" for the first time.',
  lesson_5:
    'Complete 5 lesson walkthroughs across any of your enrolled courses.',
  streak_3:
    'Study and complete at least one activity on 3 consecutive calendar days.',
  streak_7:
    'Keep your study habit going for 7 days in a row without missing a day.',
  quiz_master:
    'Take a lesson knowledge-check quiz and answer every question correctly (100% score).',
  flashcard_wizard:
    'Open a flashcard deck inside a lesson and review all cards until the deck is finished.',
  pioneer:
    'Go to your course settings and toggle "Share publicly" to publish it to the Explore gallery.',
  certified:
    'Complete all lessons in a course and generate a verifiable certificate from the course page.',
  grandmaster:
    'Accumulate 3,500 total XP by completing lessons, quizzes, flashcards, sharing courses, and earning certificates.',
};

const RANK_ICONS: Record<string, React.ElementType> = {
  Compass: Trophy,
  Sparkles: Sparkles,
  BookOpen: Award,
  BrainCircuit: BrainCircuit,
  Crown: Crown,
};

const RANK_COLORS: Record<string, string> = {
  1: 'from-zinc-400 to-zinc-600',
  2: 'from-indigo-500 to-violet-600',
  3: 'from-violet-600 to-purple-700',
  4: 'from-amber-500 to-orange-600',
  5: 'from-yellow-400 to-amber-500',
};

type FilterCategory = 'all' | 'learning' | 'quiz' | 'streak' | 'community' | 'mastery';

interface Props {
  state: UserGamificationState;
  ranks: RankTier[];
}

export function AchievementsClient({ state, ranks }: Props) {
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);

  const { rankInfo, badges, unlockedCount, totalCount } = state;

  const filteredBadges = badges.filter((b) => {
    if (showOnlyUnlocked && !b.isUnlocked) return false;
    if (filter !== 'all' && b.category !== filter) return false;
    return true;
  });

  const categories: FilterCategory[] = ['all', 'learning', 'quiz', 'streak', 'community', 'mastery'];

  return (
    <div className="space-y-8">
      {/* ── XP & Level Hero ─────────────────────────────────── */}
      <FadeIn direction="up">
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-4">
              {/* Level badge */}
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${RANK_COLORS[rankInfo.level] ?? 'from-zinc-400 to-zinc-600'} flex items-center justify-center shadow-lg`}
              >
                <span className="text-2xl font-black text-white">{rankInfo.level}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {rankInfo.title}
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    Level {rankInfo.level}
                  </span>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {rankInfo.currentXP.toLocaleString()} XP total
                  {rankInfo.level < 5 && (
                    <> · <span className="text-indigo-600 dark:text-indigo-400 font-medium">{rankInfo.xpRequiredForNext} XP</span> to {ranks.find((r) => r.level === rankInfo.level + 1)?.title}</>
                  )}
                </p>

                {/* XP bar */}
                <div className="mt-3 h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${RANK_COLORS[rankInfo.level] ?? 'from-indigo-500 to-violet-600'} transition-all duration-700`}
                    style={{ width: `${rankInfo.progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                  <span>{rankInfo.xpInCurrentLevel.toLocaleString()} XP in this level</span>
                  {rankInfo.level < 5 ? (
                    <span>{rankInfo.nextLevelXP.toLocaleString()} XP needed</span>
                  ) : (
                    <span className="text-yellow-600 dark:text-yellow-400 font-semibold">MAX RANK ✦</span>
                  )}
                </div>
              </div>

              {/* Badge count */}
              <div className="hidden sm:flex flex-col items-center px-5 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 shrink-0">
                <span className="text-2xl font-black text-zinc-900 dark:text-white">
                  {unlockedCount}/{totalCount}
                </span>
                <span className="text-[11px] text-zinc-500 font-medium mt-0.5">Badges</span>
              </div>
            </div>
          </div>

          {/* ── Rank Ladder ── */}
          <div className="px-6 py-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
              Rank Progression
            </p>
            <div className="flex items-center gap-0">
              {ranks.map((rank, i) => {
                const isCurrentLevel = rank.level === rankInfo.level;
                const isPast = rank.level < rankInfo.level;
                const RankIcon = RANK_ICONS[rank.icon] ?? Trophy;
                return (
                  <div key={rank.level} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                          isCurrentLevel
                            ? `bg-gradient-to-br ${RANK_COLORS[rank.level]} border-transparent shadow-md`
                            : isPast
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-400 dark:border-emerald-600'
                            : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        {isPast ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <RankIcon
                            className={`w-4 h-4 ${isCurrentLevel ? 'text-white' : 'text-zinc-400 dark:text-zinc-600'}`}
                          />
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-semibold text-center leading-tight max-w-[60px] ${
                          isCurrentLevel
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : isPast
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-zinc-400'
                        }`}
                      >
                        {rank.title}
                      </span>
                      <span className="text-[9px] text-zinc-400">{rank.minXP.toLocaleString()} XP</span>
                    </div>
                    {i < ranks.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-1 rounded-full ${
                          isPast ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-zinc-200 dark:bg-zinc-700'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* ── XP Rate Reference ────────────────────────────────── */}
      <FadeIn direction="up" delay={0.1}>
        <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-yellow-500" />
            How to Earn XP
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Complete a Lesson', xp: '+50 XP', color: 'text-indigo-600 dark:text-indigo-400' },
              { label: 'Pass a Quiz', xp: '+30–40 XP', color: 'text-violet-600 dark:text-violet-400' },
              { label: 'Review Flashcards', xp: '+25 XP', color: 'text-sky-600 dark:text-sky-400' },
              { label: 'Share a Course', xp: '+50 XP', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Earn Certificate', xp: '+100 XP', color: 'text-amber-600 dark:text-amber-400' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center text-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800"
              >
                <span className={`text-base font-black ${item.color}`}>{item.xp}</span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* ── Badge Grid ───────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Filters */}
        <FadeIn direction="up" delay={0.15}>
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                    filter === cat
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-indigo-400'
                  }`}
                >
                  {cat === 'all' ? `All (${totalCount})` : CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowOnlyUnlocked((v) => !v)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                showOnlyUnlocked
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-emerald-400'
              }`}
            >
              ✓ Unlocked only
            </button>
          </div>
        </FadeIn>

        {/* Cards */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((badge) => {
            const IconComponent = ICON_MAP[badge.icon] ?? Award;
            const tier = TIER_STYLES[badge.tier];
            const howTo = HOW_TO_EARN[badge.key] ?? 'Complete the required action to unlock.';

            return (
              <StaggerItem key={badge.key}>
                <CardHover className="h-full">
                  <div
                    className={`relative rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between h-full ${
                      badge.isUnlocked
                        ? `${tier.bg} ${tier.border} shadow-md ${tier.glow}`
                        : 'bg-white dark:bg-zinc-900 border-zinc-200/70 dark:border-zinc-800 opacity-70'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Top row: icon + title + tier */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            badge.isUnlocked ? tier.iconBg : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {badge.isUnlocked ? (
                            <IconComponent className="w-6 h-6" />
                          ) : (
                            <Lock className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                              {badge.name}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                badge.isUnlocked
                                  ? `${tier.text} bg-white/60 dark:bg-black/20 border border-current/20`
                                  : 'text-zinc-400 bg-zinc-100 dark:bg-zinc-800'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.isUnlocked ? tier.dot : 'bg-zinc-300'}`} />
                              {tier.badge}
                            </span>
                          </div>

                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 capitalize">
                            {CATEGORY_LABELS[badge.category]}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[13px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {badge.description}
                      </p>

                      {/* How to earn */}
                      <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 px-3.5 py-3 space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          How to earn
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {howTo}
                        </p>
                      </div>
                    </div>

                    {/* Unlock status footer */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      {badge.isUnlocked ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          Unlocked
                          {badge.unlockedAt && (
                            <span className="text-zinc-400 font-normal ml-1">
                              · {new Date(badge.unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                          <Lock className="w-3.5 h-3.5" />
                          Locked — earn this to unlock
                        </div>
                      )}
                    </div>
                  </div>
                </CardHover>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {filteredBadges.length === 0 && (
          <div className="text-center py-16 text-zinc-400 dark:text-zinc-600">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No badges match this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
