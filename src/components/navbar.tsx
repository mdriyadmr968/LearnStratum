'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/auth/actions';
import { BookOpen, PlusCircle, LayoutDashboard, LogOut, User as UserIcon, Compass, Search } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { ThemeToggle } from '@/components/theme-toggle';
import { XPBadge } from '@/components/gamification/xp-badge';
import { getRankInfo, type RankInfo } from '@/lib/gamification';

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [rankInfo, setRankInfo] = useState<RankInfo | null>(null);

  useEffect(() => {
    try {
      const supabase = createClient();
      const fetchUserAndXP = async () => {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUser(data.user);
          const { data: profile } = await supabase
            .from('profiles')
            .select('xp')
            .eq('id', data.user.id)
            .single();
          if (profile) {
            setRankInfo(getRankInfo(profile.xp || 0));
          }
        }
      };

      fetchUserAndXP();

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          supabase
            .from('profiles')
            .select('xp')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profile }) => {
              if (profile) setRankInfo(getRankInfo(profile.xp || 0));
            });
        } else {
          setRankInfo(null);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    } catch {
      // Supabase unconfigured or placeholders
    }
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Learn<span className="text-indigo-600 dark:text-indigo-400">Stratum</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/explore"
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
            >
              <Compass className="w-4 h-4" />
              Explore
            </Link>
            <Link
              href="/search"
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
            >
              <Search className="w-4 h-4" />
              Search
            </Link>

            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  href="/courses/new"
                  className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  New Course
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              <XPBadge rankInfo={rankInfo} />
              <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
                <span className="max-w-[150px] truncate font-medium">
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  title="Sign out"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/sign-up"
                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
