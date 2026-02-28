import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { Play, Pause, Repeat, X } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { cn } from '../lib/utils';

export function Player() {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    currentTime, 
    duration, 
    seek,
    isRepeating,
    toggleRepeat,
    playNext,
    playPrevious
  } = useAudio();

  const [isExpanded, setIsExpanded] = useState(false);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          if (e.metaKey || e.ctrlKey) {
             playNext();
          } else {
             seek(Math.min(currentTime + 5, duration));
          }
          break;
        case 'ArrowLeft':
          if (e.metaKey || e.ctrlKey) {
             playPrevious();
          } else {
             seek(Math.max(currentTime - 5, 0));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seek, currentTime, duration, playNext, playPrevious]);

  if (!currentTrack) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100) {
      setIsExpanded(false);
    }
  };

  return (
    <>
      {/* Mini Player */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl",
          isExpanded ? "hidden" : "block"
        )}
      >
        <div 
          className="relative flex items-center justify-between overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-[#1c1c1e]/90 p-2 pr-4 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-[#1c1c1e]/80 cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          {/* Progress Bar Background */}
          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-black/5 dark:bg-white/5">
             <div 
                className="h-full bg-black/20 dark:bg-white/30"
                style={{ width: `${progress}%` }}
              />
          </div>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800 shadow-sm">
              <img 
                src={currentTrack.coverArtUrl || "https://picsum.photos/seed/music/200/200"} 
                alt={currentTrack.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 overflow-hidden">
              <p className="truncate text-sm font-semibold text-black dark:text-white">
                {currentTrack.title}
              </p>
              <p className="truncate text-xs text-black/50 dark:text-white/50">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Full Screen Player Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.2 }}
            onDragEnd={handleDragEnd}
            className="fixed inset-0 z-[60] flex flex-col bg-[#f5f5f7] dark:bg-[#000000] p-6 sm:p-8"
          >
            {/* Header with Close Button */}
            <div className="flex justify-between items-center mb-8">
              {/* Drag Handle Indicator for Mobile */}
              <div className="w-10 h-1 rounded-full bg-black/20 dark:bg-white/20 mx-auto sm:hidden" />
              
              {/* Close Button for Desktop */}
              <button 
                onClick={() => setIsExpanded(false)}
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors ml-auto"
                aria-label="Close player"
              >
                <X size={20} className="text-black dark:text-white" />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
              {/* Large Cover Art */}
              <div className="aspect-square w-full rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_-12px_rgba(255,255,255,0.1)] mb-10 bg-gray-200 dark:bg-gray-800">
                <img 
                  src={currentTrack.coverArtUrl || "https://picsum.photos/seed/music/800/800"} 
                  alt={currentTrack.title}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Track Info */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-black dark:text-white truncate">
                  {currentTrack.title}
                </h2>
                <p className="text-lg text-black/60 dark:text-white/60 truncate mt-1">
                  {currentTrack.artist}
                </p>
              </div>

              {/* Scrubber */}
              <div className="mb-8 group">
                <div 
                  className="relative h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = x / rect.width;
                    seek(percentage * duration);
                  }}
                >
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full bg-black/80 dark:bg-white/80 group-hover:bg-blue-500 transition-colors"
                    style={{ width: `${progress}%` }}
                  />
                  {/* Thumb */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-black dark:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs font-medium text-black/40 dark:text-white/40 font-mono">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Main Controls - Rectangular Buttons */}
              <div className="flex items-center justify-center gap-6">
                <button 
                  onClick={toggleRepeat}
                  className={cn(
                    "h-14 w-20 rounded-2xl flex items-center justify-center transition-all",
                    isRepeating 
                      ? "bg-blue-500/10 text-blue-500" 
                      : "bg-black/5 dark:bg-white/10 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20"
                  )}
                >
                  <Repeat size={24} />
                </button>

                <button 
                  onClick={togglePlay}
                  className="h-20 w-32 rounded-3xl flex items-center justify-center bg-black dark:bg-white text-white dark:text-black shadow-xl hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
                </button>
              </div>
            </div>
            
            {/* Spacer for bottom safe area */}
            <div className="h-8" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
