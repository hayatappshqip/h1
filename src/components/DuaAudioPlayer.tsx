import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Square, Repeat, Gauge, Loader2, AlertCircle } from 'lucide-react';
import { DuaItem } from '../types';

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
  const [audioError, setAudioError] = useState<string | null>(null);
  const [urlIndex, setUrlIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate padded chapter ID (e.g. 27 -> "027", 28 -> "028", 29 -> "029")
  const effectiveId = chapterId || (dua.id > 0 ? dua.id : 27);
  const paddedId = String(effectiveId).padStart(3, '0');

  // Candidate real MP3 recitation audio sources (Hisnul Muslim)
  const candidateAudioUrls = [
    `https://www.hisnulmuslim.com/audio/ar/ar_hisn_almuslim_${paddedId}.mp3`,
    `https://archive.org/download/HisnulMuslimAudioMp3/${paddedId}.mp3`,
    `https://worldofislam.info/audio/hisnul_muslim/${paddedId}.mp3`,
    `https://worldofislam.info/audio/${paddedId}.mp3`
  ];

  // Reset audio when dua or chapter changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
    setAudioError(null);
    setUrlIndex(0);
    setCurrentTime(0);
    setDuration(0);
  }, [dua.id, chapterId]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const getAudioInstance = (srcUrl: string) => {
    if (!audioRef.current) {
      const audio = new Audio(srcUrl);
      audio.playbackRate = playbackRate;
      audio.loop = isRepeating;

      audio.onplay = () => {
        setIsLoading(false);
        setIsPlaying(true);
        setAudioError(null);
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
        console.warn(`Deshtoi ngarkimi i audios nga: ${srcUrl}`);
        // Try next candidate URL if available
        setUrlIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          if (nextIndex < candidateAudioUrls.length) {
            const nextUrl = candidateAudioUrls[nextIndex];
            audioRef.current = null;
            setTimeout(() => playFromUrl(nextUrl, nextIndex), 100);
          } else {
            setIsLoading(false);
            setIsPlaying(false);
            setAudioError('Nuk u mundësua ngarkimi i audios nga serveri.');
          }
          return nextIndex;
        });
      };

      audioRef.current = audio;
    }
    return audioRef.current;
  };

  const playFromUrl = (url: string, index: number) => {
    setIsLoading(true);
    setAudioError(null);
    try {
      const audio = getAudioInstance(url);
      audio.playbackRate = playbackRate;
      audio.loop = isRepeating;
      audio.play().catch((err) => {
        console.warn('Play error:', err);
        // Retry next URL on catch
        if (index + 1 < candidateAudioUrls.length) {
          audioRef.current = null;
          playFromUrl(candidateAudioUrls[index + 1], index + 1);
        } else {
          setIsLoading(false);
          setIsPlaying(false);
          setAudioError('Problem me luajtjen e audios.');
        }
      });
    } catch (err) {
      console.warn('Audio setup error:', err);
      setIsLoading(false);
      setAudioError('Ndodhi një gabim gjatë nisjes së audios.');
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.playbackRate = playbackRate;
        audioRef.current.loop = isRepeating;
        audioRef.current.play().catch(() => {
          playFromUrl(candidateAudioUrls[urlIndex], urlIndex);
        });
      } else {
        playFromUrl(candidateAudioUrls[urlIndex], urlIndex);
      }
    }
  };

  const changeRate = (newRate: number) => {
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
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
          title={isPlaying ? 'Ndal Zërin' : 'Dëgjo audion'}
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
                <span>Dëgjo audion (Hisnul Muslim)</span>
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
        {duration > 0 && (
          <span className="text-[10px] font-mono text-slate-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        )}
      </div>

      {/* Error notification */}
      {audioError && (
        <div className="flex items-center space-x-1.5 text-[11px] text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-900/50">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{audioError}</span>
        </div>
      )}

      {/* Visual Audio Pulse when playing */}
      {isPlaying && (
        <div className="flex items-center space-x-1 py-1 px-2 bg-emerald-950/40 border border-emerald-900/40 rounded-lg">
          <span className="text-[10px] text-emerald-400 font-mono font-medium mr-2">Dëgjimi i audio recitimit real...</span>
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
