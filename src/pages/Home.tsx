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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Hero / Search Section */}
      <div className="mb-12 flex flex-col items-center justify-center text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent"
        >
          Discover New Sounds
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative w-full max-w-xl"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-white/40" />
          </div>
          <input
            type="text"
            placeholder="Search tracks or artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-full border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-white placeholder-white/40 backdrop-blur-md transition-all focus:border-indigo-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="mt-6"
        >
          <button
            onClick={toggleRadioMode}
            className={cn(
              "flex items-center gap-2 rounded-full px-6 py-2 text-sm font-medium transition-all border",
              isRadioMode 
                ? "bg-indigo-500 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]" 
                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <Radio size={16} />
            {isRadioMode ? "Radio Mode Active" : "Start Radio Mode"}
          </button>
        </motion.div>
      </div>

      {/* Track Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTracks.map((track, index) => (
          <motion.div
            key={track._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:border-white/10 hover:bg-white/10"
          >
            {/* Cover Art */}
            <div className="relative aspect-square overflow-hidden rounded-xl bg-black/20">
              <img 
                src={track.coverArtUrl || "https://picsum.photos/seed/music/400/400"} 
                alt={track.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              
              {/* Overlay Play Button */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <button
                  onClick={(e) => handlePlayClick(e, track)}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform hover:scale-105"
                >
                  {currentTrack?._id === track._id && isPlaying ? (
                    <Pause size={24} fill="currentColor" />
                  ) : (
                    <Play size={24} fill="currentColor" className="ml-1" />
                  )}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="mt-4">
              <Link to={`/track/${track.slug}`} className="block">
                <h3 className="truncate text-lg font-semibold text-white hover:text-indigo-400 transition-colors">
                  {track.title}
                </h3>
              </Link>
              <p className="truncate text-sm text-white/60">{track.artist}</p>
            </div>
            
            {/* Playing Indicator */}
            {currentTrack?._id === track._id && (
              <div className="absolute top-4 right-4 flex gap-1">
                <span className="block h-3 w-1 animate-[music-bar_1s_ease-in-out_infinite] rounded-full bg-indigo-500" />
                <span className="block h-3 w-1 animate-[music-bar_1.2s_ease-in-out_infinite] rounded-full bg-indigo-500" style={{ animationDelay: '0.1s' }} />
                <span className="block h-3 w-1 animate-[music-bar_0.8s_ease-in-out_infinite] rounded-full bg-indigo-500" style={{ animationDelay: '0.2s' }} />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredTracks.length === 0 && (
        <div className="py-20 text-center text-white/40">
          <p>No tracks found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
