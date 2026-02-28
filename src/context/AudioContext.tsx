import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track } from '../services/api';

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playlist: Track[];
  isRadioMode: boolean;
  isRepeating: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  toggleRadioMode: () => void;
  toggleRepeat: () => void;
  playNext: () => void; // Kept for internal use (auto-advance)
  seek: (time: number) => void;
  setPlaylist: (tracks: Track[]) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [isRadioMode, setIsRadioMode] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false); // Repeat One Track
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // History to prevent repeats in Radio Mode
  const [playHistory, setPlayHistory] = useState<string[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      // If repeating, just play again
      // We handle this in the effect below that listens to 'ended'
    };
    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
    };
  }, []);

  // Effect to handle track changes
  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;

    const audio = audioRef.current;
    
    const playNewTrack = async () => {
      try {
        // Only update src if it's different to avoid reload on re-render
        // But currentTrack dependency ensures we only run when it changes
        audio.src = currentTrack.trackFileUrl;
        audio.load();
        playPromiseRef.current = audio.play();
        await playPromiseRef.current;
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Playback failed:", error);
        }
      }
    };

    playNewTrack();

  }, [currentTrack]);

  const playTrack = (track: Track) => {
    if (currentTrack?._id === track._id) {
      togglePlay();
      return;
    }
    setCurrentTrack(track);
    // Add to history
    setPlayHistory(prev => [...prev, track._id]);
  };

  const togglePlay = async () => {
    if (!audioRef.current || !currentTrack) return;

    const audio = audioRef.current;

    try {
      if (audio.paused) {
        playPromiseRef.current = audio.play();
        await playPromiseRef.current;
      } else {
        audio.pause();
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("Toggle play failed:", error);
      }
    }
  };

  const toggleRadioMode = () => {
    setIsRadioMode(!isRadioMode);
    // If turning on radio mode and nothing playing, start playing random
    if (!isRadioMode && !isPlaying && playlist.length > 0) {
      playNextRandom();
    }
  };

  const toggleRepeat = () => {
    setIsRepeating(!isRepeating);
  };

  const playNextRandom = () => {
    if (playlist.length === 0) return;
    
    // Filter out recently played if possible
    const unplayed = playlist.filter(t => !playHistory.includes(t._id));
    
    let nextTrack: Track;
    
    if (unplayed.length > 0) {
      const randomIndex = Math.floor(Math.random() * unplayed.length);
      nextTrack = unplayed[randomIndex];
    } else {
      // All played, reset history (except current) and pick random
      setPlayHistory(currentTrack ? [currentTrack._id] : []);
      const available = playlist.filter(t => t._id !== currentTrack?._id);
      if (available.length === 0) {
         nextTrack = playlist[0]; // Only 1 track in playlist
      } else {
         const randomIndex = Math.floor(Math.random() * available.length);
         nextTrack = available[randomIndex];
      }
    }
    
    playTrack(nextTrack);
  };

  // Handle 'ended' event
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (isRepeating && currentTrack) {
        audio.currentTime = 0;
        audio.play().catch(e => console.error(e));
        return;
      }

      if (isRadioMode) {
        playNextRandom();
      } else {
        // Stop or loop playlist? User didn't specify behavior for normal mode end.
        // Let's just stop if not radio mode, or maybe loop playlist.
        // User asked for "Radio mode" specifically for random.
        // We'll just stop if not radio mode as there are no next/prev buttons.
        setIsPlaying(false);
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [playlist, isRadioMode, isRepeating, currentTrack, playHistory]);


  const playNext = () => {
    // Internal use for manual skip if we had one, or auto-advance
    if (isRadioMode) {
      playNextRandom();
    } else {
      // If not radio mode, maybe just stop or go to next in list?
      // Since UI has no next button, this is only called by 'ended' if we added logic for it.
      // But we handled 'ended' above.
    }
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
      isRepeating,
      isLoading,
      currentTime,
      duration,
      playTrack,
      togglePlay,
      toggleRadioMode,
      toggleRepeat,
      playNext,
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
