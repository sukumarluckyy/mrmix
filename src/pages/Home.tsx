import React, { useEffect, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { fetchTracks, Track } from '../services/api';
import { Search, Play, Pause, Radio, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Home() {
  const { setPlaylist, playTrack, currentTrack, isPlaying, isRadioMode, toggleRadioMode } = useAudio();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTracks = async () => {
      const data = await fetchTracks();
      setTracks(data);
      setPlaylist(data);
      setLoading(false);
    };
    loadTracks();
  }, [setPlaylist]);

  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePlayClick = (e: React.MouseEvent, track: Track) => {
    e.preventDefault();
    playTrack(track);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Floating Radio Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleRadioMode}
        className={cn(
          "fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all",
          isRadioMode 
            ? "bg-blue-500 text-white shadow-blue-500/30" 
            : "bg-white dark:bg-[#1c1c1e] text-black dark:text-white border border-black/5 dark:border-white/10"
        )}
        title="Toggle Radio Mode"
      >
        <Radio size={24} className={cn(isRadioMode && "animate-pulse")} />
      </motion.button>

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white sm:text-4xl mb-6">
          Listen Now
        </h1>

        {/* Apple-style Search Bar */}
        <div className="relative max-w-md">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search in Library"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-xl bg-gray-100 dark:bg-[#1c1c1e] pl-10 pr-10 text-[17px] text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-300 dark:bg-gray-600 p-0.5 text-white hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <hr className="mb-8 border-black/5 dark:border-white/10" />

      {/* Track Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filteredTracks.map((track, index) => (
          <motion.div
            key={track._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            className="group relative"
          >
            {/* Cover Art */}
            <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800 shadow-sm transition-shadow group-hover:shadow-md">
              <img 
                src={track.coverArtUrl || "https://picsum.photos/seed/music/400/400"} 
                alt={track.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Overlay Play Button */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <button
                  onClick={(e) => handlePlayClick(e, track)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg backdrop-blur-sm transition-transform hover:scale-105"
                >
                  {currentTrack?._id === track._id && isPlaying ? (
                    <Pause size={20} fill="currentColor" />
                  ) : (
                    <Play size={20} fill="currentColor" className="ml-1" />
                  )}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0">
              <Link to={`/track/${track.slug}`} className="block">
                <h3 className="truncate text-[15px] font-medium text-black dark:text-white hover:underline leading-tight">
                  {track.title}
                </h3>
              </Link>
              <p className="truncate text-[13px] text-gray-500 dark:text-gray-400 mt-1">{track.artist}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTracks.length === 0 && (
        <div className="py-20 text-center text-gray-500 dark:text-gray-400">
          <p>No tracks found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
