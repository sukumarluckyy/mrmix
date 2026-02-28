import React from 'react';
import { Outlet } from 'react-router-dom';
import { Player } from './Player';

export function Layout() {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white overflow-x-hidden selection:bg-indigo-500/30">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-blue-900/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-white/5 bg-black/20 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
              <span className="text-lg font-bold tracking-tight">GlassStream</span>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        {/* Spacer for player */}
        <div className="h-24" />
      </div>

      <Player />
    </div>
  );
}
