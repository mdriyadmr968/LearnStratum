/**
 * Gamification Engine for LearnStratum
 * Calculates Stratum Levels, XP thresholds, and mastery badge specifications.
 */

export interface RankTier {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  icon: string;
  color: string;
}

export const STRATUM_RANKS: RankTier[] = [
  {
    level: 1,
    title: 'Novice Explorer',
    minXP: 0,
    maxXP: 200,
    icon: 'Compass',
    color: 'text-zinc-600 dark:text-zinc-400',
  },
  {
    level: 2,
    title: 'Knowledge Seeker',
    minXP: 200,
    maxXP: 600,
    icon: 'Sparkles',
    color: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    level: 3,
    title: 'Stratum Scholar',
    minXP: 600,
    maxXP: 1500,
    icon: 'BookOpen',
    color: 'text-violet-600 dark:text-violet-400',
  },
  {
    level: 4,
    title: 'Deep Thinker',
    minXP: 1500,
    maxXP: 3500,
    icon: 'BrainCircuit',
    color: 'text-amber-600 dark:text-amber-400',
  },
  {
    level: 5,
    title: 'Stratum Grandmaster',
    minXP: 3500,
    maxXP: 10000,
    icon: 'Crown',
    color: 'text-yellow-500',
  },
];

export interface RankInfo {
  level: number;
  title: string;
  currentXP: number;
  nextLevelXP: number;
  progressPercent: number;
  icon: string;
  color: string;
  xpInCurrentLevel: number;
  xpRequiredForNext: number;
}

export function getRankInfo(totalXP: number): RankInfo {
  const safeXP = Math.max(0, totalXP || 0);

  // Find tier
  let tier = STRATUM_RANKS[0];
  for (let i = STRATUM_RANKS.length - 1; i >= 0; i--) {
    if (safeXP >= STRATUM_RANKS[i].minXP) {
      tier = STRATUM_RANKS[i];
      break;
    }
  }

  const nextTier =
    STRATUM_RANKS.find((t) => t.level === tier.level + 1) || null;

  if (!nextTier) {
    // Max level achieved
    return {
      level: tier.level,
      title: tier.title,
      currentXP: safeXP,
      nextLevelXP: tier.maxXP,
      progressPercent: 100,
      icon: tier.icon,
      color: tier.color,
      xpInCurrentLevel: safeXP - tier.minXP,
      xpRequiredForNext: 0,
    };
  }

  const range = nextTier.minXP - tier.minXP;
  const currentInRange = safeXP - tier.minXP;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((currentInRange / range) * 100))
  );

  return {
    level: tier.level,
    title: tier.title,
    currentXP: safeXP,
    nextLevelXP: nextTier.minXP,
    progressPercent,
    icon: tier.icon,
    color: tier.color,
    xpInCurrentLevel: currentInRange,
    xpRequiredForNext: nextTier.minXP - safeXP,
  };
}

export interface BadgeDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'obsidian';
  category: 'learning' | 'quiz' | 'streak' | 'community' | 'mastery';
}

export const ALL_BADGES: BadgeDefinition[] = [
  {
    key: 'first_lesson',
    name: 'First Step',
    description: 'Complete your first lesson walkthrough.',
    icon: 'Footprints',
    tier: 'bronze',
    category: 'learning',
  },
  {
    key: 'lesson_5',
    name: 'Knowledge Builder',
    description: 'Complete 5 lessons across any course.',
    icon: 'Layers',
    tier: 'silver',
    category: 'learning',
  },
  {
    key: 'streak_3',
    name: 'Flame Starter',
    description: 'Maintain a 3-day active study streak.',
    icon: 'Flame',
    tier: 'bronze',
    category: 'streak',
  },
  {
    key: 'streak_7',
    name: 'Flame Master',
    description: 'Maintain a 7-day active study streak.',
    icon: 'Zap',
    tier: 'silver',
    category: 'streak',
  },
  {
    key: 'quiz_master',
    name: 'Bullseye',
    description: 'Score 100% on a knowledge check quiz.',
    icon: 'Target',
    tier: 'silver',
    category: 'quiz',
  },
  {
    key: 'flashcard_wizard',
    name: 'Recall Ninja',
    description: 'Review an active-recall flashcard deck.',
    icon: 'BrainCircuit',
    tier: 'bronze',
    category: 'learning',
  },
  {
    key: 'pioneer',
    name: 'Open Educator',
    description: 'Publish a course to the community explore gallery.',
    icon: 'Globe',
    tier: 'gold',
    category: 'community',
  },
  {
    key: 'certified',
    name: 'Certified Scholar',
    description: 'Earn a verifiable certificate of course completion.',
    icon: 'Award',
    tier: 'gold',
    category: 'mastery',
  },
  {
    key: 'grandmaster',
    name: 'Stratum Grandmaster',
    description: 'Reach Level 5 by earning over 3,500 XP.',
    icon: 'Crown',
    tier: 'obsidian',
    category: 'mastery',
  },
];
