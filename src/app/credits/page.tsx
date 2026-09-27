import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCreditState } from '@/app/credits/actions';
import { CREDIT_PACKAGES } from '@/lib/credits';
import { getCacheStats } from '@/lib/ai-cache';
import { CreditsClient } from '@/components/credits/credits-client';

export const metadata = {
  title: 'AI Credits – LearnStratum',
  description: 'Manage your AI generation credits and top up via bKash, Nagad or Rocket.',
};

export default async function CreditsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const [state, cacheStats] = await Promise.all([
    getCreditState(),
    getCacheStats(),
  ]);

  if (!state) redirect('/dashboard');

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            ⚡ AI Credits
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Credits power every AI generation. Top up via demo payment — your balance never expires.
          </p>
        </div>

        <CreditsClient state={state} packages={CREDIT_PACKAGES} cacheStats={cacheStats} />
      </div>
    </main>
  );
}
