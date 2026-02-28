import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track, fetchTracks } from '../services/api';

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playlist: Track[];
  isRadioMode: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  toggleRadioMode: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (time: number) => void;
  setPlaylist: (tracks: Track[]) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [isRadioMode, setIsRadioMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => playNext();
    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.pause();
    };
  }, [isRadioMode, playlist, currentTrack]); // Dependencies for playNext closure

  const playTrack = (track: Track) => {
    if (currentTrack?._id === track._id) {
      togglePlay();
      return;
    }

    if (audioRef.current) {
      audioRef.current.src = track.trackFileUrl;
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const togglePlay = () => {
    if (audioRef.current && currentTrack) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleRadioMode = () => {
    setIsRadioMode(!isRadioMode);
  };

  const playNext = () => {
    if (playlist.length === 0) return;

    if (isRadioMode) {
      // Pick a random track different from current
      let nextIndex = Math.floor(Math.random() * playlist.length);
      let nextTrack = playlist[nextIndex];
      
      // Try to avoid repeating the same song immediately if possible
      if (playlist.length > 1 && nextTrack._id === currentTrack?._id) {
        nextIndex = (nextIndex + 1) % playlist.length;
        nextTrack = playlist[nextIndex];
      }
      
      playTrack(nextTrack);
    } else {
      // Sequential playback
      const currentIndex = playlist.findIndex(t => t._id === currentTrack?._id);
      const nextIndex = (currentIndex + 1) % playlist.length;
      playTrack(playlist[nextIndex]);
    }
  };

  const playPrevious = () => {
    if (playlist.length === 0) return;
    
    // If radio mode, previous doesn't make much sense strictly, but we can just go to a random one or previous in list
    // Let's stick to sequential logic for previous even in radio mode for simplicity, or just random.
    // Standard behavior: Previous usually goes to start of song if > 3s, else previous track.
    
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    const currentIndex = playlist.findIndex(t => t._id === currentTrack?._id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playTrack(playlist[prevIndex]);
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <AudioContext.Provider value={{
      currentTrack,
      isPlaying,
      playlist,
      isRadioMode,
      isLoading,
      currentTime,
      duration,
      playTrack,
      togglePlay,
      toggleRadioMode,
      playNext,
      playPrevious,
      seek,
      setPlaylist
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
