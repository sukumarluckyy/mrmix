import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { Play, Pause, SkipBack, SkipForward, Radio, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Player() {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    playNext, 
    playPrevious, 
    currentTime, 
    duration, 
    seek,
    isRadioMode,
    toggleRadioMode
  } = useAudio();

  if (!currentTrack) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-2 pb-2 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-[#1c1c1e]/90 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-[#1c1c1e]/80"
        >
          <div className="flex items-center justify-between p-3 sm:p-4">
            
            {/* Track Info */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-1/3">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 overflow-hidden rounded-md shadow-sm bg-gray-200 dark:bg-gray-800">
                <img 
                  src={currentTrack.coverArtUrl || "https://picsum.photos/seed/music/200/200"} 
                  alt={currentTrack.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 overflow-hidden">
                <Link to={`/track/${currentTrack.slug}`} className="block truncate text-sm font-semibold text-black dark:text-white hover:underline">
                  {currentTrack.title}
                </Link>
                <p className="truncate text-xs text-black/50 dark:text-white/50">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center justify-center flex-1 w-1/3">
              <div className="flex items-center gap-4 sm:gap-6">
                <button 
                  onClick={playPrevious}
                  className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
                >
                  <SkipBack size={20} fill="currentColor" />
                </button>

                <button 
                  onClick={togglePlay}
                  className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black shadow-md hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                </button>

                <button 
                  onClick={playNext}
                  className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
                >
                  <SkipForward size={20} fill="currentColor" />
                </button>
              </div>
            </div>

            {/* Extra Controls */}
            <div className="flex items-center justify-end gap-3 flex-1 min-w-0 w-1/3">
              <button 
                onClick={toggleRadioMode}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  isRadioMode 
                    ? "bg-blue-500/10 text-blue-500 dark:text-blue-400" 
                    : "text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
                )}
                title="Radio Mode"
              >
                <Radio size={18} />
              </button>
            </div>

          </div>

          {/* Progress Bar - Integrated at bottom or top? Apple puts it at top of player usually on mobile, or integrated. 
              Let's put it at the top edge of the card for cleanliness. */}
          <div 
            className="absolute bottom-0 left-0 h-[2px] w-full cursor-pointer bg-black/5 dark:bg-white/5 group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width;
              seek(percentage * duration);
            }}
          >
            <div 
              className="h-full bg-black/20 dark:bg-white/30 group-hover:bg-blue-500 transition-colors"
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
