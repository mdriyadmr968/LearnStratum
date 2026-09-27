import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUserGamificationState } from '@/app/gamification/actions';
import { STRATUM_RANKS } from '@/lib/gamification';
import { AchievementsClient } from '@/components/achievements/achievements-client';

export const metadata = {
  title: 'Achievements – LearnStratum',
  description: 'Track your Stratum levels, XP progress, and mastery badges.',
};

export default async function AchievementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const state = await getUserGamificationState();
  if (!state) redirect('/dashboard');

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            🏆 Achievements
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Your learning journey, rank progression, and mastery badges — all in one place.
          </p>
        </div>

        <AchievementsClient state={state} ranks={STRATUM_RANKS} />
      </div>
    </main>
  );
}
