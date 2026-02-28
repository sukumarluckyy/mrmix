import React, { useEffect, useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { fetchTracks, Track } from '../services/api';
import { Search, Play, Pause, Radio } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Home() {
  const { setPlaylist, playTrack, currentTrack, isPlaying, togglePlay, isRadioMode, toggleRadioMode } = useAudio();
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
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white sm:text-4xl">
            Listen Now
          </h1>
          <p className="mt-2 text-lg text-black/60 dark:text-white/60">
            Top picks for you. Updated today.
          </p>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40 dark:text-white/40" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full min-w-[200px] rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/10 pl-9 pr-4 text-sm text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={toggleRadioMode}
            className={cn(
              "flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-all",
              isRadioMode 
                ? "bg-blue-500 text-white shadow-md" 
                : "bg-black/5 dark:bg-white/10 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20"
            )}
          >
            <Radio size={16} />
            <span className="hidden sm:inline">Radio</span>
          </button>
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
                <h3 className="truncate text-sm font-medium text-black dark:text-white hover:underline">
                  {track.title}
                </h3>
              </Link>
              <p className="truncate text-xs text-black/60 dark:text-white/60">{track.artist}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTracks.length === 0 && (
        <div className="py-20 text-center text-black/40 dark:text-white/40">
          <p>No tracks found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
