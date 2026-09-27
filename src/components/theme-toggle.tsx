'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
    );
  }

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="relative p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition focus:outline-none"
      title={`Current theme: ${theme} (Click to change)`}
      aria-label="Toggle theme"
    >
      {theme === 'light' && <Sun className="w-4 h-4 text-amber-500 transition-transform" />}
      {theme === 'dark' && <Moon className="w-4 h-4 text-indigo-400 transition-transform" />}
      {theme === 'system' && <Monitor className="w-4 h-4 text-zinc-500 transition-transform" />}
    </button>
  );
}
