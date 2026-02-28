import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import { fetchTracks, Track } from '../services/api';
import { Play, Pause, ArrowLeft, Share2, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function TrackPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, togglePlay, setPlaylist } = useAudio();
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrack = async () => {
      const allTracks = await fetchTracks();
      setPlaylist(allTracks); // Ensure playlist is populated so next/prev works
      const foundTrack = allTracks.find(t => t.slug === slug);
      setTrack(foundTrack || null);
      setLoading(false);
    };
    loadTrack();
  }, [slug, setPlaylist]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-white/60">Track not found</p>
        <button 
          onClick={() => navigate('/')}
          className="text-indigo-400 hover:underline"
        >
          Go Home
        </button>
      </div>
    );
  }

  const isCurrentTrack = currentTrack?._id === track._id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <button 
        onClick={() => navigate('/')}
        className="mb-8 flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Library
      </button>

      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* Cover Art */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          className="relative aspect-square w-full max-w-md mx-auto lg:mx-0 overflow-hidden rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
        >
          <img 
            src={track.coverArtUrl || "https://picsum.photos/seed/music/600/600"} 
            alt={track.title}
            className="h-full w-full object-cover"
          />
          
          {/* Glass Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>

        {/* Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col justify-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl lg:text-7xl">
            {track.title}
          </h1>
          <p className="mt-4 text-xl text-black/60 dark:text-white/60 sm:text-2xl">
            {track.artist}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <button
              onClick={() => playTrack(track)}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black shadow-[0_0_30px_rgba(0,0,0,0.2)] dark:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-transform hover:scale-105 active:scale-95"
            >
              {isCurrentTrack && isPlaying ? (
                <Pause size={32} fill="currentColor" />
              ) : (
                <Play size={32} fill="currentColor" className="ml-1" />
              )}
            </button>

            <div className="flex gap-4">
               <button 
                className="flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-6 py-3 text-sm font-medium text-black dark:text-white transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
              >
                <Share2 size={18} />
                Share
              </button>
              
              <a 
                href={track.trackFileUrl} 
                download
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-6 py-3 text-sm font-medium text-black dark:text-white transition-colors hover:bg-black/10 dark:hover:bg-white/10"
              >
                <Download size={18} />
                Download
              </a>
            </div>
          </div>

          {/* Visualizer Placeholder / Stats */}
          <div className="mt-12 rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm text-black/40 dark:text-white/40">
              <span>Format</span>
              <span>MP3 / High Quality</span>
            </div>
            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
               {/* Fake waveform bars */}
               <div className="flex h-full w-full items-end justify-between gap-0.5 opacity-50">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="w-full bg-indigo-500"
                      style={{ 
                        height: `${Math.random() * 100}%`,
                        opacity: isCurrentTrack && isPlaying ? 1 : 0.3
                      }} 
                    />
                  ))}
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
