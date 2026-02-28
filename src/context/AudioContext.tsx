import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track, Quote, fetchQuotes } from '../services/api';

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
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isRadioMode, setIsRadioMode] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false); // Repeat One Track
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Quote Logic State
  const [songsPlayedSinceLastQuote, setSongsPlayedSinceLastQuote] = useState(0);
  const [nextQuoteDistance, setNextQuoteDistance] = useState(Math.floor(Math.random() * 3) + 1); // 1 to 3

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

    // Fetch quotes
    fetchQuotes().then(setQuotes);

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
    if (!track.isQuote) {
      setPlayHistory(prev => [...prev, track._id]);
    }
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

  const playNext = () => {
    // Check if we just finished a quote
    if (currentTrack?.isQuote) {
      // Resume music (random)
      playNextRandom();
      return;
    }

    // If we just finished a song, check if we should play a quote
    if (isRadioMode && currentTrack?.genre) {
       const newCount = songsPlayedSinceLastQuote + 1;
       setSongsPlayedSinceLastQuote(newCount);

       if (newCount >= nextQuoteDistance) {
         // Try to find a matching quote
         const matchingQuotes = quotes.filter(q => q.genre.toLowerCase() === currentTrack.genre?.toLowerCase());
         
         if (matchingQuotes.length > 0) {
           const randomQuote = matchingQuotes[Math.floor(Math.random() * matchingQuotes.length)];
           
           // Convert Quote to Track
           const quoteTrack: Track = {
             _id: randomQuote._id,
             title: randomQuote.quotes,
             artist: randomQuote.author,
             coverArtUrl: randomQuote.coverArtUrl,
             trackFileUrl: randomQuote.quoteFileUrl,
             slug: randomQuote.slug,
             genre: randomQuote.genre,
             isQuote: true
           };

           // Reset counters
           setSongsPlayedSinceLastQuote(0);
           setNextQuoteDistance(Math.floor(Math.random() * 3) + 1); // 1 to 3

           playTrack(quoteTrack);
           return;
         }
       }
    }

    // Normal next track logic
    if (isRadioMode) {
      playNextRandom();
    } else {
       // Linear playback logic (if we had it, but for now just stop or loop)
       setIsPlaying(false);
    }
  };

  const playPrevious = () => {
     // Not implemented in UI but kept for API completeness/shortcuts
     // For now just restart current or random
     if (audioRef.current) audioRef.current.currentTime = 0;
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Handle 'ended' event
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
       if (isRepeating && currentTrack && !currentTrack.isQuote) {
          audio.currentTime = 0;
          audio.play().catch(console.error);
          return;
       }
       playNext();
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [isRepeating, currentTrack, isRadioMode, songsPlayedSinceLastQuote, nextQuoteDistance, quotes, playlist, playHistory]);

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
