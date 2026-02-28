import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Player } from './Player';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Music } from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen w-full bg-[#f5f5f7] dark:bg-[#000000] text-black dark:text-white transition-colors duration-300 selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-black/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md transition-transform group-hover:scale-105">
              <Music size={18} fill="currentColor" />
            </div>
            <span className="text-xl font-semibold tracking-tight">mrmix</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="rounded-full p-2 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      <main className="flex-1 pb-32">
        <Outlet />
      </main>

      <Player />
    </div>
  );
}
