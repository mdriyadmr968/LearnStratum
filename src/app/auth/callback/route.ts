import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAppUrl } from '@/lib/utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = getAppUrl(request.headers);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.session?.user) {
      const user = data.session.user;
      const { data: profile } = await supabase
        .from('profiles')
        .select('ai_credits')
        .eq('id', user.id)
        .single();

      if (!profile || profile.ai_credits === null || profile.ai_credits === undefined) {
        const displayName =
          user.user_metadata?.full_name ||
          user.user_metadata?.display_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'Learner';

        await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          display_name: displayName,
          avatar_url: user.user_metadata?.avatar_url || null,
          ai_credits: 1000,
          plan: 'free',
        });
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=Authentication%20failed`);
}
