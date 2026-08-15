import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  BookOpen,
  RefreshCw,
  AlertCircle,
  BookMarked,
  Globe,
  Info,
  Check,
  ChevronRight,
} from 'lucide-react';
import { TafsirEntry, TafsirLoadingStatus, TafsirSource, QuranReadingTheme } from '../../../types';
import {
  getTafsir,
  getAvailableTafsirSources,
  getTafsirSourceById,
  DEFAULT_TAFSIR_SOURCE_ID,
  parseVerseKey,
} from '../../../services/quran/tafsirService';
import { ALL_SURAHS_META } from '../../../data/quranData';
import { getSurahData } from '../../../services/quranApi';

interface TafsirOverlayProps {
  verseKey: string;
  onClose: () => void;
  theme?: QuranReadingTheme;
}

export const TafsirOverlay: React.FC<TafsirOverlayProps> = ({
  verseKey,
  onClose,
  theme = 'dark',
}) => {
  const { surah, ayah } = useMemo(() => parseVerseKey(verseKey), [verseKey]);
  const availableSources = useMemo(() => getAvailableTafsirSources(), []);

  const [selectedSourceId, setSelectedSourceId] = useState<string>(DEFAULT_TAFSIR_SOURCE_ID);
  const [status, setStatus] = useState<TafsirLoadingStatus>('idle');
  const [tafsirEntry, setTafsirEntry] = useState<TafsirEntry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Local verse text state (Arabic + Albanian)
  const [arabicText, setArabicText] = useState<string>('');
  const [albanianTranslation, setAlbanianTranslation] = useState<string>('');

  // Surah metadata
  const surahMeta = useMemo(() => {
    return ALL_SURAHS_META.find(s => s.number === surah) || {
      number: surah,
      name: 'Surah',
      transliteration: `Surja ${surah}`,
      albanianName: `Surja ${surah}`,
      numberOfAyahs: 0,
      revelationType: 'Meccan',
    };
  }, [surah]);

  // Load local verse translation immediately (0ms from local corpus)
  useEffect(() => {
    let isMounted = true;
    getSurahData(surah)
      .then(data => {
        if (!isMounted) return;
        const matchingAyah = data.ayahs.find(a => a.numberInSurah === ayah);
        if (matchingAyah) {
          setArabicText(matchingAyah.textAr || '');
          setAlbanianTranslation(matchingAyah.textSq || '');
        }
      })
      .catch(() => {
        // Non-blocking fallback
      });

    return () => {
      isMounted = false;
    };
  }, [surah, ayah]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Fetch Tafsir data whenever verseKey or selectedSourceId changes
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCurrentTafsir = async (sourceId: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus('loading');
    setErrorMessage('');
    setTafsirEntry(null);

    try {
      const entry = await getTafsir(verseKey, sourceId, controller.signal);
      if (controller.signal.aborted) return;

      if (!entry.text || entry.text.trim().length === 0) {
        setStatus('empty');
        setTafsirEntry(entry);
      } else {
        setTafsirEntry(entry);
        setStatus('success');
      }
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      setStatus('error');
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Dështoi ngarkimi i tefsirit. Ju lutem provoni përsëri.');
      }
    }
  };

  useEffect(() => {
    fetchCurrentTafsir(selectedSourceId);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [verseKey, selectedSourceId]);

  const currentSource = useMemo(() => {
    return getTafsirSourceById(selectedSourceId);
  }, [selectedSourceId]);

  const isRtl = currentSource.language === 'ar';

  return (
    <div
      id="hayat-tafsir-overlay"
      data-testid="mushaf-tafsir-overlay"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity animate-in fade-in duration-200"
      onClick={e => {
        // Close when clicking outside modal dialog
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onTouchStart={e => e.stopPropagation()}
      onTouchMove={e => e.stopPropagation()}
      onTouchEnd={e => e.stopPropagation()}
    >
      <div
        className="w-full max-w-2xl bg-slate-950 sm:rounded-3xl rounded-t-3xl border border-slate-800 shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden text-slate-100 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/60 shrink-0">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-100 truncate">
                  {surahMeta.albanianName} ({surahMeta.transliteration})
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  Ajeti {verseKey}
                </span>
              </div>
              <p className="text-xs text-slate-400">Tefsiri dhe Komentimi i Kuranit</p>
            </div>
          </div>

          <button
            type="button"
            data-testid="tafsir-close-btn"
            onClick={onClose}
            aria-label="Mbyll Tefsirin"
            className="p-2 min-h-[44px] min-w-[44px] rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Selector Tabs */}
        <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-800/60 overflow-x-auto no-scrollbar shrink-0 flex items-center space-x-2">
          {availableSources.map(source => {
            const isSelected = source.id === selectedSourceId;
            return (
              <button
                key={source.id}
                type="button"
                data-testid={`tafsir-source-pill-${source.id}`}
                onClick={() => setSelectedSourceId(source.id)}
                className={`px-3 py-2 min-h-[40px] rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{source.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-amber-500/30 text-amber-200 font-bold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {source.languageLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 overscroll-contain">
          {/* Local Canonical Verse Context Card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            {arabicText && (
              <div
                dir="rtl"
                className="font-quran-uthmanic text-xl sm:text-2xl text-amber-200/95 leading-loose text-right"
              >
                {arabicText}
              </div>
            )}
            {albanianTranslation && (
              <div className="text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-800/80">
                <span className="text-xs font-semibold text-emerald-400 block mb-1">
                  Përkthimi në shqip (Hasan Nahi):
                </span>
                {albanianTranslation}
              </div>
            )}
          </div>

          {/* Tafsir Body Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
                <BookMarked className="w-4 h-4 text-amber-400" />
                <span>{currentSource.author}</span>
              </div>
              <span className="text-[11px] text-slate-400 bg-slate-800/70 px-2 py-0.5 rounded-md">
                {currentSource.languageLabel}
              </span>
            </div>

            {/* LOADING STATE */}
            {status === 'loading' && (
              <div
                data-testid="tafsir-loading-state"
                className="py-12 flex flex-col items-center justify-center space-y-3 text-center"
              >
                <RefreshCw className="w-7 h-7 text-amber-400 animate-spin" />
                <p className="text-sm text-slate-300 font-medium">
                  Po ngarkohet tefsiri nga {currentSource.name}...
                </p>
                <p className="text-xs text-slate-400">Ju lutem prisni pak sekonda</p>
              </div>
            )}

            {/* ERROR STATE */}
            {status === 'error' && (
              <div
                data-testid="tafsir-error-state"
                className="p-5 rounded-2xl bg-red-950/40 border border-red-800/50 space-y-3"
              >
                <div className="flex items-center space-x-2.5 text-red-300">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <h4 className="text-sm font-semibold">Dështoi ngarkimi i tefsirit</h4>
                </div>
                <p className="text-xs text-red-200/80 leading-relaxed">
                  {errorMessage || 'Nuk mund të kontaktohej serveri i tefsirit.'}
                </p>
                <button
                  type="button"
                  data-testid="tafsir-retry-btn"
                  onClick={() => fetchCurrentTafsir(selectedSourceId)}
                  className="px-4 py-2 min-h-[44px] rounded-xl bg-red-900/60 hover:bg-red-800/60 text-red-100 text-xs font-semibold border border-red-700/50 flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Riprovo</span>
                </button>
              </div>
            )}

            {/* EMPTY STATE */}
            {status === 'empty' && (
              <div
                data-testid="tafsir-empty-state"
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center space-y-3"
              >
                <Info className="w-8 h-8 text-amber-400/80 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-200">
                  Nuk ka komentim të veçantë për këtë ajet
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Ky burim nuk përmban shënime shtesë ose komentim të ndarë për ajetin {verseKey}.
                  Mund të zgjidhni një burim tjetër nga skedat më sipër.
                </p>
              </div>
            )}

            {/* SUCCESS STATE */}
            {status === 'success' && tafsirEntry && (
              <div
                data-testid="tafsir-success-content"
                dir={isRtl ? 'rtl' : 'ltr'}
                className={`text-slate-200 leading-relaxed text-sm sm:text-base space-y-4 ${
                  isRtl ? 'font-arabic text-right text-lg sm:text-xl' : 'text-left'
                }`}
              >
                {/* Clean Plain Paragraphs Rendering */}
                {tafsirEntry.text
                  .split(/\n\n+/)
                  .map((paragraph, index) => (
                    <p key={index} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Attribution */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-900/80 shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400 gap-1">
          <div className="flex items-center space-x-1.5 truncate">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Burimi: {currentSource.attribution}</span>
          </div>
          <span className="text-slate-400 shrink-0">HAYAT Quran V2</span>
        </div>
      </div>
    </div>
  );
};
