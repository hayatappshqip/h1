import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ALL_SURAHS_META, OFFLINE_CORE_SURAHS } from '../data/quranData';
import { ALL_JUZ_META } from '../data/juzData';
import { getSurahData, cleanAyahArabicText } from '../services/quranApi';
import { QURAN_RECITERS } from './KuraniView';
import { hifzDb, AyahMemorizationRecord } from '../services/hifzDb';
import {
  Brain,
  RotateCcw,
  Eye,
  EyeOff,
  Check,
  X,
  Shuffle,
  Volume2,
  VolumeX,
  ChevronLeft,
  Flame,
  Sparkles,
  BookOpen,
  Filter,
  Layers,
  Award,
  Zap,
  Play,
  Pause,
  Sliders,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export type FlashcardSourceMode = 'MEMORIZED' | 'SPECIFIC_SURAH' | 'SPECIFIC_JUZ' | 'CORE';

export interface FlashcardItem {
  surahNumber: number;
  ayahNumber: number;
  surahTransliteration: string;
  surahAlbanianName: string;
  surahArabicName: string;
  juzNumber: number;
  textAr: string;
  textSq: string;
}

interface Props {
  onClose: () => void;
}

export const HifzFlashcardView: React.FC<Props> = ({ onClose }) => {
  // Source & Filter Settings
  const [sourceMode, setSourceMode] = useState<FlashcardSourceMode>('CORE');
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedJuz, setSelectedJuz] = useState<number>(30);
  const [promptWordCount, setPromptWordCount] = useState<number>(3); // 2, 3, 4, or 5 words
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Deck & Current Card State
  const [cardPool, setCardPool] = useState<FlashcardItem[]>([]);
  const [currentCard, setCurrentCard] = useState<FlashcardItem | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Audio Playback State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [reciterKey, setReciterKey] = useState<string>('alafasy');
  const [autoPlayOnReveal, setAutoPlayOnReveal] = useState<boolean>(true);
  const [repeatMode, setRepeatMode] = useState<number>(1); // 1x, 2x, 3x, 5x
  const [playbackRate, setPlaybackRate] = useState<number>(1.0); // 0.75x, 1.0x, 1.25x
  const [currentRepeat, setCurrentRepeat] = useState<number>(1);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio Playback Logic
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  const playAudio = (timesToRepeat = repeatMode) => {
    if (!currentCard) return;
    stopAudio();
    setAudioError(null);

    const reciter = QURAN_RECITERS.find(r => r.key === reciterKey) || QURAN_RECITERS[0];
    const audioUrl = reciter.getAyahAudioUrl(currentCard.surahNumber, currentCard.ayahNumber);

    let countRemaining = timesToRepeat;
    setCurrentRepeat(1);

    const audio = new Audio(audioUrl);
    audio.playbackRate = playbackRate;
    audioRef.current = audio;
    setIsPlayingAudio(true);

    const playInstance = () => {
      audio.playbackRate = playbackRate;
      audio.play().catch(e => {
        console.error('Audio play error:', e);
        setAudioError('Audio nuk mund të luhej. Kontrolloni lidhjen e internetit.');
        setIsPlayingAudio(false);
      });
    };

    audio.onended = () => {
      countRemaining--;
      if (countRemaining > 0) {
        setCurrentRepeat(prev => prev + 1);
        audio.currentTime = 0;
        playInstance();
      } else {
        setIsPlayingAudio(false);
      }
    };

    playInstance();
  };

  const toggleAudio = () => {
    if (isPlayingAudio) {
      stopAudio();
    } else {
      playAudio(repeatMode);
    }
  };

  // Auto-play audio when card is revealed if option enabled
  const handleRevealCard = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      if (autoPlayOnReveal) {
        playAudio(repeatMode);
      }
    }
  };

  // Session Statistics
  const [sessionStats, setSessionStats] = useState({
    totalReviewed: 0,
    knewCount: 0,
    struggledCount: 0,
    forgotCount: 0,
    currentStreak: 0,
    bestStreak: 0
  });

  // User Memorized Records
  const [userMemorizedRecords, setUserMemorizedRecords] = useState<AyahMemorizationRecord[]>([]);

  // Load User's Memorized Records from DB
  useEffect(() => {
    hifzDb.ayahRecords.toArray().then(records => {
      setUserMemorizedRecords(records);
      if (records.length > 0) {
        setSourceMode('MEMORIZED');
      }
    });
  }, []);

  // Load pool of ayahs based on current selection
  const loadDeckPool = async () => {
    setLoading(true);
    setIsRevealed(false);
    stopAudio();

    let items: FlashcardItem[] = [];

    try {
      if (sourceMode === 'MEMORIZED' && userMemorizedRecords.length > 0) {
        // Build cards from user's actual memorized list
        const surahCache = new Map<number, any>();

        for (const record of userMemorizedRecords) {
          const [sStr, aStr] = record.ayahKey.split(':');
          const surahNum = parseInt(sStr, 10);
          const ayahNum = parseInt(aStr, 10);

          if (!surahCache.has(surahNum)) {
            const data = await getSurahData(surahNum);
            surahCache.set(surahNum, data);
          }

          const surahData = surahCache.get(surahNum);
          if (surahData) {
            const ayah = surahData.ayahs.find((a: any) => a.numberInSurah === ayahNum);
            const surahMeta = ALL_SURAHS_META.find(s => s.number === surahNum);
            if (ayah && surahMeta) {
              items.push({
                surahNumber: surahNum,
                ayahNumber: ayahNum,
                surahTransliteration: surahMeta.transliteration,
                surahAlbanianName: surahMeta.albanianName,
                surahArabicName: surahMeta.name,
                juzNumber: getJuzForSurahAyah(surahNum, ayahNum),
                textAr: ayah.textAr,
                textSq: ayah.textSq
              });
            }
          }
        }
      } else if (sourceMode === 'SPECIFIC_SURAH') {
        const surahData = await getSurahData(selectedSurah);
        const surahMeta = ALL_SURAHS_META.find(s => s.number === selectedSurah);
        if (surahData && surahMeta) {
          items = surahData.ayahs.map(a => ({
            surahNumber: selectedSurah,
            ayahNumber: a.numberInSurah,
            surahTransliteration: surahMeta.transliteration,
            surahAlbanianName: surahMeta.albanianName,
            surahArabicName: surahMeta.name,
            juzNumber: getJuzForSurahAyah(selectedSurah, a.numberInSurah),
            textAr: a.textAr,
            textSq: a.textSq
          }));
        }
      } else if (sourceMode === 'SPECIFIC_JUZ') {
        const juzMeta = ALL_JUZ_META.find(j => j.number === selectedJuz);
        if (juzMeta) {
          for (let s = juzMeta.startSurah; s <= juzMeta.endSurah; s++) {
            const surahData = await getSurahData(s);
            const surahMeta = ALL_SURAHS_META.find(meta => meta.number === s);
            if (surahData && surahMeta) {
              const startA = (s === juzMeta.startSurah) ? juzMeta.startAyah : 1;
              const endA = (s === juzMeta.endSurah) ? juzMeta.endAyah : surahData.numberOfAyahs;

              surahData.ayahs.forEach(a => {
                if (a.numberInSurah >= startA && a.numberInSurah <= endA) {
                  items.push({
                    surahNumber: s,
                    ayahNumber: a.numberInSurah,
                    surahTransliteration: surahMeta.transliteration,
                    surahAlbanianName: surahMeta.albanianName,
                    surahArabicName: surahMeta.name,
                    juzNumber: selectedJuz,
                    textAr: a.textAr,
                    textSq: a.textSq
                  });
                }
              });
            }
          }
        }
      } else {
        // CORE: Surahs 1, 112, 113, 114
        const coreSurahNumbers = [1, 112, 113, 114];
        for (const sNum of coreSurahNumbers) {
          const surahMeta = ALL_SURAHS_META.find(s => s.number === sNum);
          const coreData = OFFLINE_CORE_SURAHS[sNum];
          if (coreData && surahMeta) {
            coreData.ayahs.forEach(a => {
              items.push({
                surahNumber: sNum,
                ayahNumber: a.numberInSurah,
                surahTransliteration: surahMeta.transliteration,
                surahAlbanianName: surahMeta.albanianName,
                surahArabicName: surahMeta.name,
                juzNumber: getJuzForSurahAyah(sNum, a.numberInSurah),
                textAr: a.textAr,
                textSq: a.textSq
              });
            });
          }
        }
      }

      setCardPool(items);
      if (items.length > 0) {
        // Pick a random card
        const randomIndex = Math.floor(Math.random() * items.length);
        setCurrentCard(items[randomIndex]);
      } else {
        setCurrentCard(null);
      }
    } catch (err) {
      console.error('Error loading flashcard deck:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeckPool();
  }, [sourceMode, selectedSurah, selectedJuz, userMemorizedRecords.length]);

  // Helper to calculate Juz for Surah/Ayah
  function getJuzForSurahAyah(surah: number, ayah: number): number {
    for (const j of ALL_JUZ_META) {
      if (
        (surah > j.startSurah || (surah === j.startSurah && ayah >= j.startAyah)) &&
        (surah < j.endSurah || (surah === j.endSurah && ayah <= j.endAyah))
      ) {
        return j.number;
      }
    }
    return 30;
  }

  // Draw Next Random Card
  const pickNextCard = () => {
    if (cardPool.length === 0) return;
    setIsRevealed(false);
    stopAudio();

    if (cardPool.length === 1) {
      setCurrentCard(cardPool[0]);
      return;
    }

    let nextCard: FlashcardItem;
    do {
      const idx = Math.floor(Math.random() * cardPool.length);
      nextCard = cardPool[idx];
    } while (currentCard && nextCard.surahNumber === currentCard.surahNumber && nextCard.ayahNumber === currentCard.ayahNumber && cardPool.length > 1);

    setCurrentCard(nextCard);
  };

  // Handle Self-Rating Feedback
  const handleRating = (result: 'KNEW' | 'STRUGGLED' | 'FORGOT') => {
    setSessionStats(prev => {
      const totalReviewed = prev.totalReviewed + 1;
      let knewCount = prev.knewCount;
      let struggledCount = prev.struggledCount;
      let forgotCount = prev.forgotCount;
      let currentStreak = prev.currentStreak;

      if (result === 'KNEW') {
        knewCount++;
        currentStreak++;
      } else if (result === 'STRUGGLED') {
        struggledCount++;
        currentStreak++;
      } else {
        forgotCount++;
        currentStreak = 0;
      }

      const bestStreak = Math.max(prev.bestStreak, currentStreak);

      return {
        totalReviewed,
        knewCount,
        struggledCount,
        forgotCount,
        currentStreak,
        bestStreak
      };
    });

    pickNextCard();
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => stopAudio();
  }, []);

  // Compute Word Prompt
  const parsedPrompt = useMemo(() => {
    if (!currentCard) return { prompt: '', remaining: '', fullClean: '' };
    const fullClean = cleanAyahArabicText(currentCard.textAr);
    const words = fullClean.split(/\s+/).filter(Boolean);

    const promptWords = words.slice(0, promptWordCount).join(' ');
    const remainingWords = words.slice(promptWordCount).join(' ');

    return {
      prompt: promptWords,
      remaining: remainingWords,
      fullClean,
      totalWords: words.length
    };
  }, [currentCard, promptWordCount]);

  const accuracyPercent = sessionStats.totalReviewed > 0
    ? Math.round(((sessionStats.knewCount + sessionStats.struggledCount) / sessionStats.totalReviewed) * 100)
    : 100;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 animate-fadeIn">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onClose}
          className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kthehu te Hifz Dashboard</span>
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
            showSettings
              ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span>Konfiguro Kartat</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="text-center space-y-2 py-2">
        <div className="w-14 h-14 bg-emerald-950/80 border border-emerald-800 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
          <Brain className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-serif text-slate-100 font-bold">Gjeneruesi i Flashcards</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Shfaq fjalët e para të ajetit për të testuar kujtesën tënde natyrale. Prek kartën për të zbuluar ajetin e plotë.
        </p>
      </div>

      {/* Session Progress KPIs */}
      <div className="grid grid-cols-4 gap-2.5 bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-lg text-center">
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-400 font-mono uppercase">Të Parira</span>
          <div className="text-base font-bold font-mono text-slate-100">{sessionStats.totalReviewed}</div>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-400 font-mono uppercase">Saktësia</span>
          <div className="text-base font-bold font-mono text-emerald-400">{accuracyPercent}%</div>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-400 font-mono uppercase">Seria (Streak)</span>
          <div className="text-base font-bold font-mono text-amber-400 flex items-center justify-center space-x-1">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{sessionStats.currentStreak}</span>
          </div>
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-400 font-mono uppercase">Më e Mira</span>
          <div className="text-base font-bold font-mono text-blue-400">{sessionStats.bestStreak}</div>
        </div>
      </div>

      {/* Settings Drawer / Drawer Collapse */}
      {showSettings && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-400" />
              <span>Burimi i Kartave & Konfigurimi</span>
            </h3>
            <button onClick={() => setShowSettings(false)} className="text-xs text-slate-400 hover:text-slate-200">
              Mbyll
            </button>
          </div>

          {/* Mode Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              onClick={() => setSourceMode('MEMORIZED')}
              disabled={userMemorizedRecords.length === 0}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                sourceMode === 'MEMORIZED'
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-200 font-bold'
                  : userMemorizedRecords.length === 0
                  ? 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-medium text-[11px]">Të Memorizuara</div>
              <div className="text-[10px] opacity-75">{userMemorizedRecords.length} Ajete</div>
            </button>

            <button
              onClick={() => setSourceMode('SPECIFIC_SURAH')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                sourceMode === 'SPECIFIC_SURAH'
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-200 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-medium text-[11px]">Sipas Sures</div>
              <div className="text-[10px] opacity-75">Zgjidh 1 nga 114</div>
            </button>

            <button
              onClick={() => setSourceMode('SPECIFIC_JUZ')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                sourceMode === 'SPECIFIC_JUZ'
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-200 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-medium text-[11px]">Sipas Xhuzit</div>
              <div className="text-[10px] opacity-75">Zgjidh Xhuzin 1-30</div>
            </button>

            <button
              onClick={() => setSourceMode('CORE')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                sourceMode === 'CORE'
                  ? 'bg-emerald-950 border-emerald-600 text-emerald-200 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="font-medium text-[11px]">Suret e Shkurtra</div>
              <div className="text-[10px] opacity-75">Fatihah, Ikhlas...</div>
            </button>
          </div>

          {/* Conditional Dropdowns based on Mode */}
          {sourceMode === 'SPECIFIC_SURAH' && (
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Zgjidh Suren:</label>
              <select
                value={selectedSurah}
                onChange={e => setSelectedSurah(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              >
                {ALL_SURAHS_META.map(s => (
                  <option key={s.number} value={s.number}>
                    {s.number}. {s.transliteration} ({s.albanianName}) - {s.numberOfAyahs} ajete
                  </option>
                ))}
              </select>
            </div>
          )}

          {sourceMode === 'SPECIFIC_JUZ' && (
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Zgjidh Xhuzin:</label>
              <select
                value={selectedJuz}
                onChange={e => setSelectedJuz(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:border-emerald-500 focus:outline-none"
              >
                {ALL_JUZ_META.map(j => (
                  <option key={j.number} value={j.number}>
                    Xhuzi {j.number} ({j.transliteration}) - {j.nameAr}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Prompt Words Length Selector */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs text-slate-300 font-medium">Numri i Fjalëve Prompt (Pyetja):</span>
            <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[2, 3, 4, 5].map(cnt => (
                <button
                  key={cnt}
                  onClick={() => setPromptWordCount(cnt)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    promptWordCount === cnt
                      ? 'bg-emerald-600 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cnt} Fjalë
                </button>
              ))}
            </div>
          </div>

          {/* Audio Recitation Settings Section */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Cilësimet e Audio Recitimit</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Reciter Selector */}
              <div className="space-y-1">
                <label className="text-slate-400">Lexuesi i Kuranit (Qari):</label>
                <select
                  value={reciterKey}
                  onChange={e => {
                    setReciterKey(e.target.value);
                    stopAudio();
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2 focus:border-emerald-500 focus:outline-none"
                >
                  {QURAN_RECITERS.map(r => (
                    <option key={r.key} value={r.key}>
                      {r.name} ({r.arabicName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Playback Speed */}
              <div className="space-y-1">
                <label className="text-slate-400">Shpejtësia e Leximit:</label>
                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {[0.75, 1.0, 1.25].map(rate => (
                    <button
                      key={rate}
                      onClick={() => {
                        setPlaybackRate(rate);
                        if (audioRef.current) audioRef.current.playbackRate = rate;
                      }}
                      className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        playbackRate === rate
                          ? 'bg-emerald-600 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Repeat Loop Count */}
              <div className="space-y-1">
                <label className="text-slate-400">Përsëritja për Çdo Ajet:</label>
                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {[1, 2, 3, 5].map(rep => (
                    <button
                      key={rep}
                      onClick={() => setRepeatMode(rep)}
                      className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                        repeatMode === rep
                          ? 'bg-emerald-600 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {rep}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-Play Toggle */}
              <div className="space-y-1 flex flex-col justify-end">
                <button
                  onClick={() => setAutoPlayOnReveal(!autoPlayOnReveal)}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                    autoPlayOnReveal
                      ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-[11px]">Autodëgjimi kur Zbuloni</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${autoPlayOnReveal ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-slate-400'}`}>
                    {autoPlayOnReveal ? 'Aktiv' : 'Jo'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLASHCARD DISPLAY CARD */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-2xl">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400">Po ngarkohet paketa e flashcards...</p>
          </div>
        ) : !currentCard ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-200">Nuk u gjetën ajete në këtë kategori</h3>
              <p className="text-xs text-slate-400">
                Ju lutemi zgjidhni një sure ose xhuz tjetër nga konfigurimi i kartave.
              </p>
            </div>
            <button
              onClick={() => {
                setSourceMode('CORE');
                setShowSettings(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition-all"
            >
              Ndrysho Burimin te Suret e Shkurtra
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Dedicated Audio Recitation Banner Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-lg flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-center ${
                    isPlayingAudio
                      ? 'bg-amber-950 border-amber-600 text-amber-300 shadow-lg shadow-amber-950/50 scale-105'
                      : 'bg-emerald-950 border-emerald-800 text-emerald-400 hover:bg-emerald-900/60'
                  }`}
                  title={isPlayingAudio ? 'Ndal audion' : 'Dëgjo leximin e ajetit'}
                >
                  {isPlayingAudio ? (
                    <Pause className="w-5 h-5 fill-current animate-pulse" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-200">
                      {isPlayingAudio ? 'Po dëgjohet ajeti...' : 'Dëgjo Recitimin e Ajetit'}
                    </span>
                    {isPlayingAudio && (
                      <span className="flex items-center space-x-1 px-2 py-0.5 bg-amber-950 border border-amber-800 text-amber-300 rounded-full text-[10px] font-mono animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                        <span>{currentRepeat} / {repeatMode}x</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {QURAN_RECITERS.find(r => r.key === reciterKey)?.name || 'Mishary Rashid Alafasy'} • {playbackRate}x shpejtësia
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Reciter Selector Quick Dropdown */}
                <select
                  value={reciterKey}
                  onChange={e => {
                    setReciterKey(e.target.value);
                    stopAudio();
                  }}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:border-emerald-500 focus:outline-none max-w-[150px] sm:max-w-none"
                >
                  {QURAN_RECITERS.map(r => (
                    <option key={r.key} value={r.key}>
                      {r.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setAutoPlayOnReveal(!autoPlayOnReveal)}
                  className={`p-2 rounded-xl border text-xs transition-all flex items-center space-x-1 ${
                    autoPlayOnReveal
                      ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                  title="Aktivizo ose çaktivizo autodëgjimin kur zbuloni kartën"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Auto</span>
                </button>
              </div>

              {audioError && (
                <div className="w-full text-center text-xs text-red-400 bg-red-950/40 p-2 rounded-xl border border-red-900/50">
                  {audioError}
                </div>
              )}
            </div>

            {/* The Main Interactive Flip Card Container */}
            <div
              onClick={handleRevealCard}
              className={`bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border ${
                isRevealed ? 'border-emerald-600/80' : 'border-slate-800 hover:border-emerald-700/60'
              } rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative transition-all duration-300 cursor-pointer group min-h-[320px] flex flex-col justify-between`}
            >
              {/* Card Top Meta Bar */}
              <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg font-mono font-bold text-[11px]">
                    {currentCard.surahTransliteration} ({currentCard.surahNumber}:{currentCard.ayahNumber})
                  </span>
                  <span className="text-slate-400 hidden sm:inline">
                    • {currentCard.surahAlbanianName}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 font-mono text-[11px]">
                    Xhuzi {currentCard.juzNumber}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAudio();
                    }}
                    className={`p-2 rounded-xl border transition-all ${
                      isPlayingAudio
                        ? 'bg-amber-950 border-amber-700 text-amber-300 animate-pulse'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Dëgjo ajetin"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CARD FRONT / PROMPT SECTION */}
              {!isRevealed ? (
                <div className="my-auto space-y-6 text-center py-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-emerald-400/90 uppercase tracking-widest font-mono">
                      Fjalët e Para të Ajetit ({promptWordCount} fjalë)
                    </span>

                    {/* Big Prominent Arabic Words */}
                    <div className="text-3xl sm:text-4xl md:text-5xl font-arabic text-emerald-300 leading-[2.2] dir-rtl px-2 py-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 shadow-inner" dir="rtl">
                      {parsedPrompt.prompt}
                      <span className="text-amber-400 font-sans text-2xl tracking-widest ml-2 opacity-80">...</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col items-center justify-center space-y-2 text-slate-400 group-hover:text-emerald-300 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-bounce">
                      <Eye className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold">Prekni kartën për të zbuluar ajetin e plotë</span>
                  </div>
                </div>
              ) : (
                /* CARD BACK / REVEALED SECTION */
                <div className="my-auto space-y-6 animate-fadeIn py-2">
                  {/* Full Arabic Text */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-widest font-mono flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ajeti i Plotë:</span>
                    </div>

                    <p className="text-2xl sm:text-3xl md:text-4xl font-arabic text-slate-100 leading-[2.2] text-right dir-rtl p-4 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner" dir="rtl">
                      <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
                        {parsedPrompt.prompt}
                      </span>{' '}
                      {parsedPrompt.remaining}
                    </p>
                  </div>

                  {/* Albanian Translation */}
                  <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Përkthimi në Shqip (Hasan Nahi):</span>
                    <p className="text-sm text-slate-300 italic leading-relaxed">
                      "{currentCard.textSq}"
                    </p>
                  </div>
                </div>
              )}

              {/* Bottom Card Footer Hint */}
              <div className="text-center border-t border-slate-800/80 pt-3 text-[11px] text-slate-500 font-mono">
                Pulla: {currentCard.surahTransliteration} ({currentCard.surahNumber}:{currentCard.ayahNumber}) • {parsedPrompt.totalWords} Fjalë gjithsej
              </div>
            </div>

            {/* ACTION & RATING CONTROLS */}
            {isRevealed ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl animate-fadeIn">
                <div className="text-center text-xs font-bold text-slate-300">
                  Si e mbanit mend këtë ajet?
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    onClick={() => handleRating('FORGOT')}
                    className="p-3.5 bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 rounded-xl text-red-300 text-xs font-bold transition-all flex flex-col items-center space-y-1.5 shadow"
                  >
                    <X className="w-5 h-5 text-red-400" />
                    <span>E harrova</span>
                    <span className="text-[10px] text-red-400/70 font-normal">0 pikë</span>
                  </button>

                  <button
                    onClick={() => handleRating('STRUGGLED')}
                    className="p-3.5 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-900/60 rounded-xl text-amber-300 text-xs font-bold transition-all flex flex-col items-center space-y-1.5 shadow"
                  >
                    <RotateCcw className="w-5 h-5 text-amber-400" />
                    <span>Me vështirësi</span>
                    <span className="text-[10px] text-amber-400/70 font-normal">1 pikë</span>
                  </button>

                  <button
                    onClick={() => handleRating('KNEW')}
                    className="p-3.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-900/60 rounded-xl text-emerald-300 text-xs font-bold transition-all flex flex-col items-center space-y-1.5 shadow"
                  >
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span>E mbaja mend!</span>
                    <span className="text-[10px] text-emerald-400/70 font-normal">2 pikë</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setIsRevealed(true)}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-2xl transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Zbulor Ajetin e Plotë</span>
                </button>

                <button
                  onClick={pickNextCard}
                  className="px-4 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-2xl font-semibold text-xs transition-all flex items-center space-x-1.5"
                  title="Karta Tjetër (Kalo)"
                >
                  <Shuffle className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Karta Tjetër</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
