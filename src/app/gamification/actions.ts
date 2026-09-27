'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  getRankInfo,
  ALL_BADGES,
  type RankInfo,
  type BadgeDefinition,
} from '@/lib/gamification';

export interface AwardXPResult {
  success: boolean;
  newXP: number;
  level: number;
  oldLevel: number;
  leveledUp: boolean;
  rankTitle: string;
  newBadges: BadgeDefinition[];
  error?: string;
}

export interface UserBadgeItem extends BadgeDefinition {
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export interface UserGamificationState {
  rankInfo: RankInfo;
  badges: UserBadgeItem[];
  unlockedCount: number;
  totalCount: number;
}

/**
 * Award XP to the currently authenticated user, update their level,
 * and check for newly unlocked mastery badges.
 */
export async function awardUserXP(
  amount: number,
  reason: string = 'activity'
): Promise<AwardXPResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      newXP: 0,
      level: 1,
      oldLevel: 1,
      leveledUp: false,
      rankTitle: 'Novice Explorer',
      newBadges: [],
      error: 'Not authenticated',
    };
  }

  // 1. Fetch current profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, level')
    .eq('id', user.id)
    .single();

  const currentXP = (profile?.xp as number) || 0;
  const oldLevel = (profile?.level as number) || 1;

  const newTotalXP = currentXP + Math.max(0, amount);
  const rankInfo = getRankInfo(newTotalXP);
  const leveledUp = rankInfo.level > oldLevel;

  // 2. Update profile with new XP and Level
  await supabase
    .from('profiles')
    .update({
      xp: newTotalXP,
      level: rankInfo.level,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  // 3. Evaluate Badge Unlocks
  const newBadges: BadgeDefinition[] = [];

  // Fetch already unlocked badge keys
  const { data: existingBadges } = await supabase
    .from('user_badges')
    .select('badge_key')
    .eq('user_id', user.id);

  const existingKeys = new Set((existingBadges ?? []).map((b) => b.badge_key));

  // Check badges to award
  const badgesToAward: BadgeDefinition[] = [];

  // Grandmaster badge
  if (rankInfo.level >= 5 && !existingKeys.has('grandmaster')) {
    const badge = ALL_BADGES.find((b) => b.key === 'grandmaster');
    if (badge) badgesToAward.push(badge);
  }

  // Insert any newly earned badges
  for (const badge of badgesToAward) {
    const { error: insertErr } = await supabase.from('user_badges').insert({
      user_id: user.id,
      badge_key: badge.key,
      badge_name: badge.name,
      badge_description: badge.description,
      icon: badge.icon,
      tier: badge.tier,
    });

    if (!insertErr) {
      newBadges.push(badge);
    }
  }

  revalidatePath('/dashboard');

  return {
    success: true,
    newXP: newTotalXP,
    level: rankInfo.level,
    oldLevel,
    leveledUp,
    rankTitle: rankInfo.title,
    newBadges,
  };
}

/**
 * Trigger award of a specific badge if not already unlocked
 */
export async function checkAndAwardBadge(
  badgeKey: string
): Promise<BadgeDefinition | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const badgeDef = ALL_BADGES.find((b) => b.key === badgeKey);
  if (!badgeDef) return null;

  // Check if already unlocked
  const { data: existing } = await supabase
    .from('user_badges')
    .select('id')
    .eq('user_id', user.id)
    .eq('badge_key', badgeKey)
    .single();

  if (existing) return null;

  // Insert badge
  const { error } = await supabase.from('user_badges').insert({
    user_id: user.id,
    badge_key: badgeDef.key,
    badge_name: badgeDef.name,
    badge_description: badgeDef.description,
    icon: badgeDef.icon,
    tier: badgeDef.tier,
  });

  if (!error) {
    revalidatePath('/dashboard');
    return badgeDef;
  }
  return null;
}

/**
 * Fetch full gamification state for the current logged-in user
 */
export async function getUserGamificationState(): Promise<UserGamificationState | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch profile XP
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, level')
    .eq('id', user.id)
    .single();

  const xp = (profile?.xp as number) || 0;
  const rankInfo = getRankInfo(xp);

  // Fetch unlocked badges
  const { data: unlockedBadges } = await supabase
    .from('user_badges')
    .select('badge_key, unlocked_at')
    .eq('user_id', user.id);

  const unlockedMap = new Map<string, string>();
  (unlockedBadges ?? []).forEach((b) => {
    unlockedMap.set(b.badge_key, b.unlocked_at);
  });

  const badges: UserBadgeItem[] = ALL_BADGES.map((b) => ({
    ...b,
    isUnlocked: unlockedMap.has(b.key),
    unlockedAt: unlockedMap.get(b.key) || null,
  }));

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  return {
    rankInfo,
    badges,
    unlockedCount,
    totalCount: ALL_BADGES.length,
  };
}
