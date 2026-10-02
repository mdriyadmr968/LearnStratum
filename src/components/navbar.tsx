'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/auth/actions';
import {
  BookOpen,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Compass,
  Search,
  Trophy,
  Zap,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { ThemeToggle } from '@/components/theme-toggle';
import { XPBadge } from '@/components/gamification/xp-badge';
import { getRankInfo, type RankInfo } from '@/lib/gamification';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [rankInfo, setRankInfo] = useState<RankInfo | null>(null);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

  // Mobile menu & user dropdown states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Supabase Auth and User Data Listener
  useEffect(() => {
    try {
      const supabase = createClient();
      const fetchUserAndXP = async () => {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUser(data.user);
          const { data: profile } = await supabase
            .from('profiles')
            .select('xp, ai_credits')
            .eq('id', data.user.id)
            .single();
          if (profile) {
            setRankInfo(getRankInfo(profile.xp || 0));
            setCreditBalance(profile.ai_credits ?? 0);
          }
        }
      };

      fetchUserAndXP();

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          supabase
            .from('profiles')
            .select('xp, ai_credits')
            .eq('id', session.user.id)
            .single()
            .then(({ data: profile }) => {
              if (profile) {
                setRankInfo(getRankInfo(profile.xp || 0));
                setCreditBalance(profile.ai_credits ?? 0);
              }
            });
        } else {
          setRankInfo(null);
          setCreditBalance(null);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    } catch {
      // Supabase unconfigured fallback
    }
  }, []);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Learner';

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const initial = displayName.charAt(0).toUpperCase();

  const navLinks = [
    { href: '/explore', label: 'Explore', icon: Compass, public: true },
    { href: '/search', label: 'Search', icon: Search, public: true },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, public: false },
    { href: '/courses/new', label: 'New Course', icon: PlusCircle, public: false },
    { href: '/achievements', label: 'Achievements', icon: Trophy, public: false },
  ];

  const visibleNavLinks = navLinks.filter((link) => link.public || !!user);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* ── LEFT: BRAND LOGO & DESKTOP NAVIGATION ────────────────── */}
        <div className="flex items-center gap-6 lg:gap-8 min-w-0">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white whitespace-nowrap">
              Learn<span className="text-indigo-600 dark:text-indigo-400">Stratum</span>
            </span>
          </Link>

          {/* Desktop Navigation Links (>= lg screens) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {visibleNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold transition whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                      : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── RIGHT: STATUS BADGES, THEME TOGGLE, USER MENU & MOBILE TRIGGER ── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Quick AI Credits Pill (Visible from sm and up) */}
          {user && creditBalance !== null && (
            <Link
              href="/credits"
              title="Available AI Credits"
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition border whitespace-nowrap shrink-0 ${
                creditBalance <= 5
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                  : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500 shrink-0" />
              <span>{creditBalance} cr</span>
            </Link>
          )}

          {/* Gamification Stratum Level Pill (Visible on md and up) */}
          {user && rankInfo && (
            <XPBadge rankInfo={rankInfo} className="hidden md:block shrink-0" />
          )}

          {/* Theme Toggle Button */}
          <div className="shrink-0">
            <ThemeToggle />
          </div>

          {/* Authenticated Desktop User Dropdown Menu */}
          {user ? (
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
                title={displayName}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-7 h-7 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {initial}
                  </div>
                )}
                <span className="hidden xl:inline text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-[120px] truncate whitespace-nowrap">
                  {displayName}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl z-50 p-3 space-y-3"
                  >
                    {/* User Header */}
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                          {initial}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {displayName}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Quick Stats Banner inside Dropdown */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 hover:border-amber-300 transition block"
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-300">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            Level {rankInfo?.level ?? 1}
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 truncate">
                          {rankInfo ? `${rankInfo.currentXP} XP` : 'Beginner'}
                        </p>
                      </Link>

                      <Link
                        href="/credits"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 hover:border-indigo-300 transition block"
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-indigo-500" />
                            Credits
                          </span>
                        </div>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5 font-bold">
                          {creditBalance ?? 0} cr
                        </p>
                      </Link>
                    </div>

                    {/* Menu Links */}
                    <div className="space-y-0.5 pt-1 border-t border-zinc-100 dark:border-zinc-800 text-xs font-semibold">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-zinc-400" />
                        <span>Dashboard</span>
                      </Link>
                      <Link
                        href="/courses/new"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition"
                      >
                        <PlusCircle className="w-4 h-4 text-zinc-400" />
                        <span>Generate New Course</span>
                      </Link>
                      <Link
                        href="/achievements"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition"
                      >
                        <Trophy className="w-4 h-4 text-zinc-400" />
                        <span>Achievements & Badges</span>
                      </Link>
                      <Link
                        href="/credits"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition"
                      >
                        <Zap className="w-4 h-4 text-zinc-400" />
                        <span>Top Up Credits</span>
                      </Link>
                    </div>

                    {/* Sign Out Button */}
                    <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                      <form action={signOut}>
                        <button
                          type="submit"
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Logged-out Call to Actions */
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                href="/auth/sign-up"
                className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition whitespace-nowrap"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* ── MOBILE MENU TOGGLE BUTTON (Hidden on lg and up) ────── */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition focus:outline-none"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── MOBILE SLIDE-DOWN DRAWER & BACKDROP ───────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 top-16 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            />

            {/* Mobile Drawer Panel */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-0 top-16 max-h-[calc(100vh-4rem)] overflow-y-auto bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 z-40 lg:hidden shadow-2xl p-5 space-y-5"
            >
              {/* If Logged In: Mobile User Profile & Stats Header */}
              {user ? (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="w-11 h-11 rounded-2xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm">
                        {initial}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Mobile Quick Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 block"
                    >
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Level {rankInfo?.level ?? 1}</span>
                      </div>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                        {rankInfo ? `${rankInfo.currentXP} XP` : 'Beginner'}
                      </p>
                    </Link>

                    <Link
                      href="/credits"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 block"
                    >
                      <div className="flex items-center gap-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                        <Zap className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Credits</span>
                      </div>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 font-bold">
                        {creditBalance ?? 0} cr
                      </p>
                    </Link>
                  </div>
                </div>
              ) : (
                /* If Logged Out: Action Buttons in Mobile Menu */
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 font-semibold text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/sign-up"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-md transition"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Navigation Links List */}
              <div className="space-y-1">
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Navigation
                </p>

                {visibleNavLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(`${link.href}/`));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{link.label}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-40" />
                    </Link>
                  );
                })}

                {user && (
                  <Link
                    href="/credits"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition ${
                      pathname === '/credits'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 shrink-0" />
                      <span>AI Credits & Top Up</span>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-40" />
                  </Link>
                )}
              </div>

              {/* Mobile Sign Out Button */}
              {user && (
                <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800">
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
