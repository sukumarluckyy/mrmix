import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track } from '../services/api';

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
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => playNext();
    const handleCanPlay = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
    };
  }, []); // Empty dependency array for init, we use refs for state access in callbacks if needed

  // Effect to handle track changes
  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;

    const audio = audioRef.current;
    
    // Only change src if it's different to prevent reloading same track
    // But here currentTrack changed, so we assume it's new
    const playNewTrack = async () => {
      try {
        audio.src = currentTrack.trackFileUrl;
        audio.load(); // Ensure it loads
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
    // The useEffect above will handle the actual playing
  };

  const togglePlay = async () => {
    if (!audioRef.current || !currentTrack) return;

    const audio = audioRef.current;

    try {
      if (audio.paused) {
        playPromiseRef.current = audio.play();
        await playPromiseRef.current;
      } else {
        // If a play promise is pending, we should wait for it before pausing?
        // Or just pause. The AbortError comes if we pause while play is pending.
        // But we can catch it.
        audio.pause();
      }
    } catch (error) {
      // Ignore AbortError which happens if we pause while loading/playing
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("Toggle play failed:", error);
      }
    }
  };

  const toggleRadioMode = () => {
    setIsRadioMode(!isRadioMode);
  };

  // We need to access the latest state in playNext, so we use a ref or just rely on React re-rendering playNext
  // playNext is called by 'ended' event listener. 
  // Since 'ended' listener is attached once in useEffect([]), it captures the initial state of playNext closure.
  // We need to fix the event listener to access latest state or use a ref for the callback.
  
  // Better approach: Use a ref for the playlist and radio mode to access inside the static event listener,
  // OR re-attach listeners when dependencies change.
  // Re-attaching listeners is safer for closure issues.
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      // Logic for next track
      if (playlist.length === 0) return;

      let nextTrack: Track;
      
      if (isRadioMode) {
        let nextIndex = Math.floor(Math.random() * playlist.length);
        nextTrack = playlist[nextIndex];
        // Avoid repeat if possible
        if (playlist.length > 1 && nextTrack._id === currentTrack?._id) {
          nextIndex = (nextIndex + 1) % playlist.length;
          nextTrack = playlist[nextIndex];
        }
      } else {
        const currentIndex = playlist.findIndex(t => t._id === currentTrack?._id);
        const nextIndex = (currentIndex + 1) % playlist.length;
        nextTrack = playlist[nextIndex];
      }
      
      playTrack(nextTrack);
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [playlist, isRadioMode, currentTrack]); // Re-bind when these change


  const playNext = () => {
    if (playlist.length === 0) return;

    let nextTrack: Track;
    if (isRadioMode) {
      let nextIndex = Math.floor(Math.random() * playlist.length);
      nextTrack = playlist[nextIndex];
      if (playlist.length > 1 && nextTrack._id === currentTrack?._id) {
        nextIndex = (nextIndex + 1) % playlist.length;
        nextTrack = playlist[nextIndex];
      }
    } else {
      const currentIndex = playlist.findIndex(t => t._id === currentTrack?._id);
      const nextIndex = (currentIndex + 1) % playlist.length;
      nextTrack = playlist[nextIndex];
    }
    playTrack(nextTrack);
  };

  const playPrevious = () => {
    if (playlist.length === 0) return;
    
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
