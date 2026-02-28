import React, { useEffect, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { Play, Pause, SkipBack, SkipForward, Radio, Volume2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2"
    >
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/40 shadow-2xl backdrop-blur-xl">
          
          {/* Progress Bar - Top Edge */}
          <div 
            className="absolute top-0 left-0 h-1 bg-white/20 w-full cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const percentage = x / rect.width;
              seek(percentage * duration);
            }}
          >
            <motion.div 
              className="h-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between p-4">
            
            {/* Track Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg shadow-lg">
                <img 
                  src={currentTrack.coverArtUrl || "https://picsum.photos/seed/music/200/200"} 
                  alt={currentTrack.title}
                  className={cn("h-full w-full object-cover transition-transform duration-[10s]", isPlaying ? "scale-110" : "scale-100")}
                />
              </div>
              <div className="min-w-0 overflow-hidden">
                <Link to={`/track/${currentTrack.slug}`} className="block truncate text-sm font-medium text-white hover:underline">
                  {currentTrack.title}
                </Link>
                <p className="truncate text-xs text-white/60">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 md:gap-6">
              <button 
                onClick={playPrevious}
                className="text-white/60 hover:text-white transition-colors"
              >
                <SkipBack size={20} />
              </button>

              <button 
                onClick={togglePlay}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
              </button>

              <button 
                onClick={playNext}
                className="text-white/60 hover:text-white transition-colors"
              >
                <SkipForward size={20} />
              </button>
            </div>

            {/* Extra Controls */}
            <div className="flex items-center justify-end gap-3 flex-1 min-w-0 hidden sm:flex">
               <span className="text-xs font-mono text-white/40 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              
              <button 
                onClick={toggleRadioMode}
                className={cn(
                  "p-2 rounded-full transition-all",
                  isRadioMode ? "bg-indigo-500/20 text-indigo-300" : "text-white/40 hover:text-white"
                )}
                title="Radio Mode"
              >
                <Radio size={16} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
