import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Volume2, Square, Repeat, Gauge, Loader2, VolumeX } from 'lucide-react';
import { DuaItem } from '../types';
import rawAudioMap from '../data/audioMap.json';

interface AudioMapEntry {
  file: string;
  url: string;
  score: number;
}

const audioMap = rawAudioMap as Record<string, Record<string, AudioMapEntry | null>>;

interface DuaAudioPlayerProps {
  dua: DuaItem;
  chapterId?: number;
  compact?: boolean;
}

export const DuaAudioPlayer: React.FC<DuaAudioPlayerProps> = ({ dua, chapterId, compact = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isRepeating, setIsRepeating] = useState(false);
  const [urlIndex, setUrlIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSpeechFallback, setIsSpeechFallback] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isRepeatingRef = useRef(isRepeating);

  useEffect(() => {
    isRepeatingRef.current = isRepeating;
  }, [isRepeating]);

  const effectiveChapterId = chapterId || (dua.id > 0 ? dua.id : 27);
  
  // Lookup audio file mapping for this specific dua in this chapter
  const audioEntry = useMemo(() => {
    const chapterKey = String(effectiveChapterId);
    const duaKey = String(dua.id);
    return audioMap[chapterKey]?.[duaKey] || null;
  }, [effectiveChapterId, dua.id]);

  // Candidate audio URLs for this specific dua file
  const candidateAudioUrls = useMemo(() => {
    if (!audioEntry || !audioEntry.file) return [];
    const file = audioEntry.file.startsWith('/') ? audioEntry.file : `/${audioEntry.file}`;
    const filenameOnly = file.replace(/^\/audios\//, '');
    return [
      `https://cdn.jsdelivr.net/gh/BetimShala/mburoja-api@master${file}`,
      `https://raw.githubusercontent.com/BetimShala/mburoja-api/master${file}`,
      `https://www.hisnmuslim.com/audio/ar/${filenameOnly}`
    ];
  }, [audioEntry]);

  // Reset player when dua or chapter changes
  useEffect(() => {
    stopAllAudio();
    setIsPlaying(false);
    setIsLoading(false);
    setUrlIndex(0);
    setCurrentTime(0);
    setDuration(0);
    setIsSpeechFallback(false);
  }, [dua.id, effectiveChapterId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const playSpeechSynthesis = (rate = playbackRate) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsLoading(false);
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(dua.ar);
    utterance.lang = 'ar-SA';
    utterance.rate = rate;

    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(v => v.lang.startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onstart = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setIsSpeechFallback(true);
    };

    utterance.onend = () => {
      if (isRepeatingRef.current) {
        setTimeout(() => playSpeechSynthesis(rate), 400);
      } else {
        setIsPlaying(false);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const playFromCandidateIndex = async (index: number) => {
    if (index >= candidateAudioUrls.length) {
      // All candidate URLs exhausted -> fallback to SpeechSynthesis
      playSpeechSynthesis(playbackRate);
      return;
    }

    const url = candidateAudioUrls[index];
    setIsLoading(true);

    try {
      let srcToPlay = url;

      // Try reading from 'hisn-audio' cache if available
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cache = await caches.open('hisn-audio');
          const cachedResponse = await cache.match(url);
          if (cachedResponse && cachedResponse.ok) {
            const blob = await cachedResponse.blob();
            srcToPlay = URL.createObjectURL(blob);
          } else {
            // Fetch and cache in background for offline use
            fetch(url).then(res => {
              if (res.ok) cache.put(url, res);
            }).catch(() => {});
          }
        } catch (cacheErr) {
          console.warn('Cache API warning:', cacheErr);
        }
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(srcToPlay);
      audio.preload = 'none';
      audio.playbackRate = playbackRate;
      audio.loop = isRepeating;

      audio.onplay = () => {
        setIsLoading(false);
        setIsPlaying(true);
        setIsSpeechFallback(false);
      };

      audio.onpause = () => {
        setIsPlaying(false);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime || 0);
        setDuration(audio.duration || 0);
      };

      audio.onerror = () => {
        console.warn(`Audio source failed: ${url}, trying candidate index ${index + 1}`);
        const nextIndex = index + 1;
        setUrlIndex(nextIndex);
        playFromCandidateIndex(nextIndex);
      };

      audioRef.current = audio;

      await audio.play();
    } catch (err) {
      console.warn(`Play failed for ${url}:`, err);
      const nextIndex = index + 1;
      setUrlIndex(nextIndex);
      playFromCandidateIndex(nextIndex);
    }
  };

  const togglePlay = () => {
    if (!candidateAudioUrls || candidateAudioUrls.length === 0) {
      // If no audio match exists for this dua, optionally play speech synthesis or do nothing
      if (isPlaying) {
        stopAllAudio();
        setIsPlaying(false);
      } else {
        playSpeechSynthesis();
      }
      return;
    }

    if (isPlaying) {
      stopAllAudio();
      setIsPlaying(false);
    } else {
      if (audioRef.current && audioRef.current.src) {
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.loop = isRepeating;
        audioRef.current.play().catch(() => {
          playFromCandidateIndex(urlIndex);
        });
      } else {
        playFromCandidateIndex(urlIndex);
      }
    }
  };

  const changeRate = (newRate: number) => {
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
    if (isSpeechFallback && isPlaying) {
      playSpeechSynthesis(newRate);
    }
  };

  const toggleRepeat = () => {
    const nextRepeat = !isRepeating;
    setIsRepeating(nextRepeat);
    if (audioRef.current) {
      audioRef.current.loop = nextRepeat;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // If no audio file match exists in audioMap
  if (!audioEntry) {
    if (compact) {
      return (
        <span className="text-[11px] text-slate-500 italic flex items-center space-x-1">
          <VolumeX className="w-3 h-3 text-slate-600" />
          <span>Nuk ka audio</span>
        </span>
      );
    }

    return (
      <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <VolumeX className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span className="font-medium text-slate-400">Nuk ka audio për këtë dua</span>
        </div>
        <button
          onClick={togglePlay}
          className="text-[10px] text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 px-2 py-1 rounded transition-colors"
          title="Lexo me zë nga shfletuesi"
        >
          {isPlaying ? 'Ndal me zë' : 'Lexo me zë'}
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-1.5">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className={`p-1.5 rounded-lg border transition-all flex items-center space-x-1 text-xs font-medium ${
            isPlaying
              ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title={isPlaying ? 'Ndal Zërin' : 'Dëgjoni audion'}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          ) : isPlaying ? (
            <Square className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
          <span>{isLoading ? 'Duke ngarkuar' : isPlaying ? 'Ndal' : 'Dëgjo'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 space-y-2.5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            id={`btn-play-dua-${dua.id}`}
            onClick={togglePlay}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center space-x-1.5 transition-all shadow ${
              isPlaying
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-950/50'
                : 'bg-emerald-900/40 hover:bg-emerald-900/60 border-emerald-700/60 text-emerald-300'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-300" />
                <span>Duke ngarkuar...</span>
              </>
            ) : isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Ndal Audio</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>Dëgjoni audion</span>
              </>
            )}
          </button>

          {/* Repeat Button */}
          <button
            onClick={toggleRepeat}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isRepeating
                ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={isRepeating ? 'Përsëritja Automatike është e Aktivizuar' : 'Aktivizo Përsëritjen Automatike'}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[10px]">
            <span className="px-1.5 text-slate-500 font-mono flex items-center">
              <Gauge className="w-3 h-3 mr-0.5" />
            </span>
            <button
              onClick={() => changeRate(0.8)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                playbackRate === 0.8 ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Shpejtësi e ngadaltë"
            >
              0.8x
            </button>
            <button
              onClick={() => changeRate(1.0)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                playbackRate === 1.0 ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Shpejtësi standarde"
            >
              1.0x
            </button>
            <button
              onClick={() => changeRate(1.2)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                playbackRate === 1.2 ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Më shpejt"
            >
              1.2x
            </button>
          </div>
        </div>

        {/* Time counter */}
        {duration > 0 && !isSpeechFallback && (
          <span className="text-[10px] font-mono text-slate-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        )}
      </div>

      {/* Visual Audio Pulse when playing */}
      {isPlaying && (
        <div className="flex items-center space-x-1 py-1 px-2 bg-emerald-950/40 border border-emerald-900/40 rounded-lg">
          <span className="text-[10px] text-emerald-400 font-mono font-medium mr-2">
            {isSpeechFallback ? 'Lexim zëri...' : `Dëgjimi i recitimit real (${audioEntry.file}.mp3)...`}
          </span>
          <div className="flex items-center space-x-1 h-3">
            <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3"></span>
            <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-2 delay-100"></span>
            <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-3.5 delay-200"></span>
            <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-1.5 delay-150"></span>
          </div>
        </div>
      )}
    </div>
  );
};
