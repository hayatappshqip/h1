import React, { useState, useEffect, useRef } from 'react';
import { ALL_SURAHS_META } from '../data/quranData';
import { QURAN_RECITERS, Reciter } from './KuraniView';
import { getSurahData } from '../services/quranApi';
import { hifzDb } from '../services/hifzDb';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Star,
  Search,
  ChevronLeft,
  Music,
  Check,
  RotateCcw,
  Sliders,
  Sparkles,
  BookOpen,
  Filter,
  CheckCircle2,
  Heart,
  ListMusic,
  Zap,
  Repeat,
  Radio,
  Share2,
  Award,
  FastForward,
  Rewind
} from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const HifzAudioLibraryView: React.FC<Props> = ({ onClose }) => {
  // Search & Filter state
  const [reciterSearch, setReciterSearch] = useState<string>('');
  const [surahSearch, setSurahSearch] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'BOOKMARKED' | 'PRIMARY'>('ALL');
  const [bookmarkedKeys, setBookmarkedKeys] = useState<string[]>([]);
  const [primaryReciterKey, setPrimaryReciterKey] = useState<string>('alafasy');

  // Player state
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(QURAN_RECITERS[0]);
  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(1);
  const [playerMode, setPlayerMode] = useState<'SURAH' | 'AYAH'>('SURAH');

  // Audio Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoopingSurah, setIsLoopingSurah] = useState<boolean>(false);

  // Ayah-by-Ayah Study Mode state
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [surahAyahs, setSurahAyahs] = useState<any[]>([]);
  const [ayahRepeatLimit, setAyahRepeatLimit] = useState<number>(1); // 1, 3, 5, 10
  const [ayahCurrentRepeat, setAyahCurrentRepeat] = useState<number>(1);
  const [loadingAyahs, setLoadingAyahs] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load Bookmarks & Primary Reciter Settings
  useEffect(() => {
    // Bookmarked reciters from localStorage
    try {
      const savedBookmarks = localStorage.getItem('hifz_bookmarked_reciters');
      if (savedBookmarks) {
        setBookmarkedKeys(JSON.parse(savedBookmarks));
      } else {
        // Default bookmarks
        const defaults = ['alafasy', 'minshawi', 'dosari'];
        setBookmarkedKeys(defaults);
        localStorage.setItem('hifz_bookmarked_reciters', JSON.stringify(defaults));
      }
    } catch (e) {
      console.error('Error loading bookmarks:', e);
    }

    // Load primary reciter from hifzDb settings
    hifzDb.settings.get(1).then(settings => {
      if (settings?.reciterId) {
        const cleanKey = settings.reciterId.replace('ar.', '');
        setPrimaryReciterKey(cleanKey);
        const match = QURAN_RECITERS.find(r => r.key === cleanKey);
        if (match) setSelectedReciter(match);
      }
    });
  }, []);

  // Save Bookmarks
  const toggleBookmark = (key: string) => {
    let updated: string[];
    if (bookmarkedKeys.includes(key)) {
      updated = bookmarkedKeys.filter(k => k !== key);
    } else {
      updated = [...bookmarkedKeys, key];
    }
    setBookmarkedKeys(updated);
    localStorage.setItem('hifz_bookmarked_reciters', JSON.stringify(updated));
  };

  // Set as Default Primary Hifz Reciter
  const setAsPrimaryReciter = async (reciterKey: string) => {
    setPrimaryReciterKey(reciterKey);
    try {
      const settings = await hifzDb.settings.get(1);
      if (settings) {
        await hifzDb.settings.update(1, { reciterId: `ar.${reciterKey}` });
      }
    } catch (e) {
      console.error('Error updating primary reciter in DB:', e);
    }
  };

  // Load Ayahs for selected Surah when switching to Ayah Mode
  useEffect(() => {
    if (playerMode === 'AYAH') {
      setLoadingAyahs(true);
      getSurahData(selectedSurahNum)
        .then(data => {
          if (data && data.ayahs) {
            setSurahAyahs(data.ayahs);
            setCurrentAyahIndex(0);
            setAyahCurrentRepeat(1);
          }
        })
        .finally(() => setLoadingAyahs(false));
    }
  }, [selectedSurahNum, playerMode]);

  // Audio Playback Handlers
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Play Full Surah Audio
  const playSurahAudio = () => {
    stopAudio();
    const reciter = selectedReciter || QURAN_RECITERS[0];
    const url = reciter.getSurahAudioUrl(selectedSurahNum);
    if (!url) return;

    const audio = new Audio();
    audio.src = url;
    audio.preload = 'auto';
    audioRef.current = audio;

    try {
      audio.playbackRate = playbackRate;
    } catch (e) {
      console.warn('Playback rate error:', e);
    }
    audio.muted = isMuted;
    audio.loop = isLoopingSurah;

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    audio.onended = () => {
      setIsPlaying(false);
    };

    audio.onerror = (e) => {
      console.warn('Audio onerror:', e);
      setIsPlaying(false);
    };

    audio.play().then(() => setIsPlaying(true)).catch(err => {
      console.warn('Playback error:', err);
      setIsPlaying(false);
    });
  };

  // Play Ayah Audio
  const playAyahAudio = (ayahIndex: number, repeatCount = ayahRepeatLimit) => {
    if (surahAyahs.length === 0 || !surahAyahs[ayahIndex]) return;
    stopAudio();

    const reciter = selectedReciter || QURAN_RECITERS[0];
    const ayahNum = surahAyahs[ayahIndex].numberInSurah;
    const url = reciter.getAyahAudioUrl(selectedSurahNum, ayahNum);
    if (!url) return;

    let repeatsLeft = repeatCount;
    setAyahCurrentRepeat(1);

    const audio = new Audio();
    audio.src = url;
    audio.preload = 'auto';
    audioRef.current = audio;

    try {
      audio.playbackRate = playbackRate;
    } catch (e) {
      console.warn('Playback rate error:', e);
    }
    audio.muted = isMuted;

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    audio.onerror = (e) => {
      console.warn('Ayah audio onerror:', e);
      setIsPlaying(false);
    };

    const playLoopInstance = () => {
      audio.currentTime = 0;
      audio.play().then(() => setIsPlaying(true)).catch(err => {
        console.warn('Ayah play error:', err);
        setIsPlaying(false);
      });
    };

    audio.onended = () => {
      repeatsLeft--;
      if (repeatsLeft > 0) {
        setAyahCurrentRepeat(prev => prev + 1);
        playLoopInstance();
      } else {
        // Move to next Ayah if available
        if (ayahIndex + 1 < surahAyahs.length) {
          setCurrentAyahIndex(ayahIndex + 1);
          playAyahAudio(ayahIndex + 1, ayahRepeatLimit);
        } else {
          setIsPlaying(false);
        }
      }
    };

    playLoopInstance();
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current && audioRef.current.src) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(err => {
          console.warn('Toggle play error:', err);
          setIsPlaying(false);
        });
      } else {
        if (playerMode === 'SURAH') {
          playSurahAudio();
        } else {
          playAyahAudio(currentAyahIndex);
        }
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopAudio();
  }, []);

  // Filter Reciters List
  const filteredReciters = QURAN_RECITERS.filter(reciter => {
    const matchesSearch =
      reciter.name.toLowerCase().includes(reciterSearch.toLowerCase()) ||
      reciter.arabicName.includes(reciterSearch) ||
      reciter.style.toLowerCase().includes(reciterSearch.toLowerCase());

    if (selectedFilter === 'BOOKMARKED') {
      return matchesSearch && bookmarkedKeys.includes(reciter.key);
    }
    if (selectedFilter === 'PRIMARY') {
      return matchesSearch && reciter.key === primaryReciterKey;
    }
    return matchesSearch;
  });

  // Filter Surahs List
  const filteredSurahs = ALL_SURAHS_META.filter(s => {
    const q = surahSearch.toLowerCase();
    return (
      s.number.toString() === q ||
      s.transliteration.toLowerCase().includes(q) ||
      s.albanianName.toLowerCase().includes(q) ||
      s.name.includes(q)
    );
  });

  const selectedSurahMeta = ALL_SURAHS_META.find(s => s.number === selectedSurahNum) || ALL_SURAHS_META[0];

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-28 animate-fadeIn">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onClose}
          className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kthehu te Hifz Dashboard</span>
        </button>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-xl font-mono font-bold flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Libraria e Audios</span>
          </span>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="text-center space-y-2 py-2">
        <div className="w-14 h-14 bg-gradient-to-br from-emerald-900 to-slate-900 border border-emerald-700/60 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
          <Music className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-serif text-slate-100 font-bold">Audio Recitimet & Lexuesit (Qari)</h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Zgjidhni lexuesin tuaj të preferuar për dëgjimin e sureve dhe ajeteve gjatë memorizimit. Ruani të preferuarit tuaj për qasje të shpejtë.
        </p>
      </div>

      {/* RECITERS & SEARCH SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        {/* Search Bar & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Kërko lexuesin (p.sh. Alafasy, Minshawi)..."
              value={reciterSearch}
              onChange={e => setReciterSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-2xl pl-9 pr-3 py-2.5 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 w-full sm:w-auto justify-center">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedFilter === 'ALL'
                  ? 'bg-emerald-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Të Gjithë ({QURAN_RECITERS.length})
            </button>
            <button
              onClick={() => setSelectedFilter('BOOKMARKED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all ${
                selectedFilter === 'BOOKMARKED'
                  ? 'bg-emerald-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Të Preferuarit ({bookmarkedKeys.length})</span>
            </button>
            <button
              onClick={() => setSelectedFilter('PRIMARY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all ${
                selectedFilter === 'PRIMARY'
                  ? 'bg-emerald-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lexuesi Kryesor</span>
            </button>
          </div>
        </div>

        {/* Reciters Horizontal Cards Scroll Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
          {filteredReciters.map(reciter => {
            const isSelected = selectedReciter.key === reciter.key;
            const isBookmarked = bookmarkedKeys.includes(reciter.key);
            const isPrimary = primaryReciterKey === reciter.key;

            return (
              <div
                key={reciter.key}
                onClick={() => {
                  setSelectedReciter(reciter);
                  if (isPlaying) stopAudio();
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex items-center justify-between group ${
                  isSelected
                    ? 'bg-emerald-950/70 border-emerald-500 shadow-lg ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                      {reciter.name}
                    </span>
                    {isPrimary && (
                      <span className="px-1.5 py-0.5 bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 rounded text-[9px] font-mono font-bold">
                        Kryesori
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-arabic" dir="rtl">
                    {reciter.arabicName}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">
                    Stili: {reciter.style}
                  </div>
                </div>

                {/* Right Quick Action Icons */}
                <div className="flex items-center space-x-1.5" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => toggleBookmark(reciter.key)}
                    className={`p-2 rounded-xl border transition-all ${
                      isBookmarked
                        ? 'bg-amber-950/80 border-amber-600 text-amber-400 shadow'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                    title={isBookmarked ? 'Hiq nga të preferuarit' : 'Shto te të preferuarit'}
                  >
                    <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => setAsPrimaryReciter(reciter.key)}
                    className={`p-2 rounded-xl border transition-all ${
                      isPrimary
                        ? 'bg-emerald-900 border-emerald-600 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                    title="Vendos si Lexues Kryesor për memorizimin e Hifz-it"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SURAH SELECTOR & AUDIO PLAYER CONTROLLER */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Mode Switcher & Surah Dropdown */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="p-3 bg-emerald-950 border border-emerald-800 rounded-2xl text-emerald-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-mono font-semibold">Lexuesi Aktiv:</div>
              <div className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>{selectedReciter.name}</span>
                <span className="text-xs font-arabic text-emerald-400">({selectedReciter.arabicName})</span>
              </div>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 w-full sm:w-auto justify-center">
            <button
              onClick={() => {
                setPlayerMode('SURAH');
                if (isPlaying) stopAudio();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                playerMode === 'SURAH'
                  ? 'bg-emerald-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>E Gjithë Sura</span>
            </button>

            <button
              onClick={() => {
                setPlayerMode('AYAH');
                if (isPlaying) stopAudio();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                playerMode === 'AYAH'
                  ? 'bg-emerald-600 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ajet për Ajet (Përsetitës Hifz)</span>
            </button>
          </div>
        </div>

        {/* Surah Selection Control */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zgjidh Suren e Kuranit (1-114):</span>
          </label>

          <select
            value={selectedSurahNum}
            onChange={e => {
              setSelectedSurahNum(Number(e.target.value));
              if (isPlaying) stopAudio();
            }}
            className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm font-semibold rounded-2xl p-3 focus:border-emerald-500 focus:outline-none shadow-inner"
          >
            {ALL_SURAHS_META.map(s => (
              <option key={s.number} value={s.number}>
                Sura {s.number}. {s.transliteration} ({s.albanianName}) - {s.numberOfAyahs} ajete
              </option>
            ))}
          </select>
        </div>

        {/* MAIN DISPLAY & CONTROLS BASED ON PLAYER MODE */}
        {playerMode === 'SURAH' ? (
          /* FULL SURAH AUDIO PLAYER MODE */
          <div className="space-y-6 pt-2">
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 text-center space-y-3 shadow-inner">
              <span className="text-[11px] font-mono text-emerald-400 font-semibold uppercase tracking-widest">
                Surah {selectedSurahMeta.number} • {selectedSurahMeta.revelationType === 'Meccan' ? 'Mekase' : 'Medinase'} • {selectedSurahMeta.numberOfAyahs} Ajete
              </span>
              <h3 className="text-3xl font-serif text-slate-100 font-bold">
                {selectedSurahMeta.transliteration}
              </h3>
              <p className="text-sm text-slate-400 italic">"{selectedSurahMeta.albanianName}"</p>
            </div>

            {/* Audio Progress Scrubber */}
            <div className="space-y-1.5">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={e => {
                  const val = Number(e.target.value);
                  setCurrentTime(val);
                  if (audioRef.current) audioRef.current.currentTime = val;
                }}
                className="w-full accent-emerald-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              {/* Playback Speed */}
              <div className="flex items-center space-x-1">
                {[0.75, 1.0, 1.25, 1.5].map(rate => (
                  <button
                    key={rate}
                    onClick={() => {
                      setPlaybackRate(rate);
                      if (audioRef.current) audioRef.current.playbackRate = rate;
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      playbackRate === rate
                        ? 'bg-emerald-600 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Central Play/Pause Big Button */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsLoopingSurah(!isLoopingSurah)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isLoopingSurah
                      ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                  title="Përsërit sërish pafundësisht (Loop Surah)"
                >
                  <Repeat className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-950/40 transition-all transform hover:scale-105"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current ml-1" />
                  )}
                </button>

                <button
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isMuted
                      ? 'bg-red-950 border-red-800 text-red-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Set Primary Shortcut */}
              <button
                onClick={() => setAsPrimaryReciter(selectedReciter.key)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  primaryReciterKey === selectedReciter.key
                    ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {primaryReciterKey === selectedReciter.key
                    ? 'Lexuesi Primar i Ruajtur'
                    : 'Vendos si Primar'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* AYAH BY AYAH HIFZ STUDY PLAYER MODE */
          <div className="space-y-6 pt-2">
            {loadingAyahs ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-400">Po ngarkohen ajetet e sures...</p>
              </div>
            ) : surahAyahs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Ajetet nuk mund të ngarkoheshin.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Ayah Repeat Settings Bar */}
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-300 font-semibold">Përsërit çdo Ajet:</span>
                    <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                      {[1, 3, 5, 10].map(cnt => (
                        <button
                          key={cnt}
                          onClick={() => setAyahRepeatLimit(cnt)}
                          className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all ${
                            ayahRepeatLimit === cnt
                              ? 'bg-emerald-600 text-slate-950 shadow'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {cnt}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Ayah Index Indicator */}
                  <div className="font-mono text-emerald-400 font-bold bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-800">
                    Ajeti {currentAyahIndex + 1} nga {surahAyahs.length}{' '}
                    {isPlaying && `(Përsëritja: ${ayahCurrentRepeat}/${ayahRepeatLimit})`}
                  </div>
                </div>

                {/* Active Ayah Display Box */}
                <div className="bg-slate-950 p-6 rounded-3xl border border-emerald-800/80 shadow-2xl space-y-6 text-center">
                  <div className="space-y-3">
                    <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-widest">
                      {selectedSurahMeta.transliteration} • Ajeti {surahAyahs[currentAyahIndex]?.numberInSurah}
                    </span>
                    <p className="text-3xl sm:text-4xl font-arabic text-emerald-200 leading-[2.2] dir-rtl p-4 bg-slate-900/60 rounded-2xl border border-slate-800" dir="rtl">
                      {surahAyahs[currentAyahIndex]?.textAr}
                    </p>
                  </div>

                  <p className="text-sm text-slate-300 italic max-w-xl mx-auto leading-relaxed">
                    "{surahAyahs[currentAyahIndex]?.textSq}"
                  </p>
                </div>

                {/* Ayah Player Navigation Bar */}
                <div className="flex items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  <button
                    disabled={currentAyahIndex === 0}
                    onClick={() => {
                      const prevIdx = Math.max(0, currentAyahIndex - 1);
                      setCurrentAyahIndex(prevIdx);
                      playAyahAudio(prevIdx);
                    }}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center space-x-1.5 transition-all ${
                      currentAyahIndex === 0
                        ? 'bg-slate-950 border-slate-900 text-slate-700 cursor-not-allowed'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Rewind className="w-4 h-4" />
                    <span className="hidden sm:inline">Ajeti Më Parë</span>
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-950/40 transition-all transform hover:scale-105"
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 fill-current" />
                    ) : (
                      <Play className="w-7 h-7 fill-current ml-1" />
                    )}
                  </button>

                  <button
                    disabled={currentAyahIndex >= surahAyahs.length - 1}
                    onClick={() => {
                      const nextIdx = Math.min(surahAyahs.length - 1, currentAyahIndex + 1);
                      setCurrentAyahIndex(nextIdx);
                      playAyahAudio(nextIdx);
                    }}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center space-x-1.5 transition-all ${
                      currentAyahIndex >= surahAyahs.length - 1
                        ? 'bg-slate-950 border-slate-900 text-slate-700 cursor-not-allowed'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="hidden sm:inline">Ajeti Tjetër</span>
                    <FastForward className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
