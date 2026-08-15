/**
 * MushafReader Component (Phase 1 Implementation)
 * Authentic, physical Madinah Mushaf experience powered by the centralized Quran Engine.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
  AlertCircle,
  RefreshCw,
  X,
  Sliders,
  Settings,
  Type,
  Sparkles,
  Layers,
  Palette,
  Search,
  Bookmark,
  Compass,
  Volume2,
  Check,
  Share2,
} from 'lucide-react';
import { useQuranPosition } from '../../../context/QuranPositionContext';
import { MushafPageSpread } from './MushafPageSpread';
import { MUSHAF_THEMES, PaperTheme } from './MushafPageFrame';
import { QuranPageData } from './MushafPageRenderer';
import {
  prefetchQcfFont,
  fetchMushafPageData,
  prefetchPageNeighborhood,
  clearPageDataCache,
} from '../../../services/quran/mushafPrefetchService';
import {
  ALL_SURAHS_META,
  JUZ_START_PAGES,
  getSurahNumberFromPage,
} from '../../../data/quranData';

interface MushafReaderProps {
  onBack?: () => void;
  onSwitchToVerseByVerse?: (surahNum: number) => void;
  onPlayAyahAudio?: (verseKey: string) => void;
}

export const MushafReader: React.FC<MushafReaderProps> = ({
  onBack,
  onSwitchToVerseByVerse,
  onPlayAyahAudio,
}) => {
  const {
    currentPosition,
    currentPage,
    isTwoPageSpread,
    spreadPages,
    goToPage,
    nextPage,
    prevPage,
    goToSurah,
    goToJuz,
    setTwoPageSpread,
  } = useQuranPosition();

  // Page data and fonts
  const [pageData1, setPageData1] = useState<QuranPageData | null>(null);
  const [fontFamily1, setFontFamily1] = useState<string>(`QCF_P${currentPage}`);
  const [pageData2, setPageData2] = useState<QuranPageData | null>(null);
  const [fontFamily2, setFontFamily2] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Active interaction
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);
  const [showAyahModal, setShowAyahModal] = useState<boolean>(false);

  // Overlays and Modals
  const [showControls, setShowControls] = useState<boolean>(true);
  const [showSurahModal, setShowSurahModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showNavigationModal, setShowNavigationModal] = useState<boolean>(false);

  // Navigation Modal State
  const [navTab, setNavTab] = useState<'faqe' | 'sure' | 'xhuz'>('faqe');
  const [navFaqeInput, setNavFaqeInput] = useState<string>('');
  const [navFaqeError, setNavFaqeError] = useState<string>('');
  const [surahSearchTerm, setSurahSearchTerm] = useState<string>('');

  // Reader Preferences
  const [fontScale, setFontScale] = useState<number>(100);
  const [showTajweed, setShowTajweed] = useState<boolean>(false);
  const [selectedThemeKey, setSelectedThemeKey] = useState<string>(() => {
    return localStorage.getItem('hayat_mushaf_theme') || 'ivory';
  });

  const activeTheme: PaperTheme = MUSHAF_THEMES[selectedThemeKey] || MUSHAF_THEMES.ivory;

  // Touch Tracking
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Current Surah derived from active position
  const currentSurahNum = currentPosition.surah || getSurahNumberFromPage(currentPage);
  const currentSurahMeta = ALL_SURAHS_META.find((s) => s.number === currentSurahNum);

  // Save theme selection
  const handleSelectTheme = (themeKey: string) => {
    setSelectedThemeKey(themeKey);
    localStorage.setItem('hayat_mushaf_theme', themeKey);
  };

  const handleRetry = useCallback(() => {
    const p1 = isTwoPageSpread ? spreadPages[0] : currentPage;
    const p2 = isTwoPageSpread ? spreadPages[1] : null;
    clearPageDataCache(p1);
    if (p2) clearPageDataCache(p2);
    setRetryCount((c) => c + 1);
  }, [isTwoPageSpread, spreadPages, currentPage]);

  // Load active page data and font
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorMessage(null);

    const p1 = isTwoPageSpread ? spreadPages[0] : currentPage;
    const p2 = isTwoPageSpread ? spreadPages[1] : null;

    const font1Promise = prefetchQcfFont(p1);
    const font2Promise = isTwoPageSpread && p2 ? prefetchQcfFont(p2) : Promise.resolve('');
    const data1Promise = fetchMushafPageData(p1, retryCount > 0);
    const data2Promise = isTwoPageSpread && p2 ? fetchMushafPageData(p2, retryCount > 0) : Promise.resolve(null);

    Promise.all([font1Promise, font2Promise, data1Promise, data2Promise])
      .then(([f1, f2, d1, d2]) => {
        if (!isMounted) return;
        setFontFamily1(f1);
        setFontFamily2(f2);
        setPageData1(d1);
        setPageData2(d2);
        setLoading(false);

        // Preload neighborhood [N-2 .. N+2] in background
        prefetchPageNeighborhood(currentPage);
      })
      .catch((err) => {
        if (!isMounted) return;
        setErrorMessage(
          err?.message || `Dështoi ngarkimi i të dhënave për faqen ${currentPage}. Ju lutemi provoni përsëri.`
        );
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, spreadPages, isTwoPageSpread, retryCount]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSettingsModal || showSurahModal || showSearchModal || showNavigationModal || showAyahModal) return;
      if (e.key === 'ArrowLeft') {
        nextPage();
      } else if (e.key === 'ArrowRight') {
        prevPage();
      } else if (e.key === ' ' || e.key === 'Escape') {
        setShowControls((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage, showSettingsModal, showSurahModal, showSearchModal, showNavigationModal, showAyahModal]);

  // Auto-hide controls after inactivity period during normal reading
  useEffect(() => {
    if (!showControls) return;
    if (showSettingsModal || showSurahModal || showSearchModal || showNavigationModal || showAyahModal) {
      return;
    }

    const timer = setTimeout(() => {
      setShowControls(false);
    }, 4500);

    return () => clearTimeout(timer);
  }, [
    showControls,
    currentPage,
    showSettingsModal,
    showSurahModal,
    showSearchModal,
    showNavigationModal,
    showAyahModal,
  ]);

  // Touch gestures (Quran swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) return;

    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    const duration = Date.now() - touchStartRef.current.time;

    touchStartRef.current = null;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && duration < 500) {
      if (deltaX < 0) {
        nextPage();
      } else {
        prevPage();
      }
      return;
    }

    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && duration < 350) {
      setShowControls((prev) => !prev);
    }
  };

  const handleVerseSelect = (verseKey: string) => {
    setActiveVerseKey(verseKey);
    setShowAyahModal(true);
  };

  // Filtered Surahs
  const filteredSurahs = ALL_SURAHS_META.filter(
    (s) =>
      s.transliteration.toLowerCase().includes(surahSearchTerm.toLowerCase()) ||
      s.albanianName.toLowerCase().includes(surahSearchTerm.toLowerCase()) ||
      s.number.toString() === surahSearchTerm.trim()
  );

  return (
    <div
      id="hayat-mushaf-reader"
      className={`fixed inset-0 z-50 flex flex-col justify-between overflow-hidden transition-colors duration-500 ${activeTheme.bg}`}
    >
      {/* ----------------- TOP CONTROLS HEADER ----------------- */}
      {showControls && (
        <div
          id="mushaf-top-header"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="fixed top-2 left-2 right-2 sm:top-4 sm:left-6 sm:right-6 z-50 flex items-center justify-between p-2 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 shadow-2xl transition-all"
        >
          {/* Back Button */}
          <button
            type="button"
            onClick={() => {
              if (onBack) onBack();
            }}
            className="flex items-center space-x-1 px-3 py-2 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition-colors shrink-0 text-xs font-semibold cursor-pointer"
            title="Kthehu"
          >
            <ChevronLeft className="w-4 h-4 text-emerald-400" />
            <span className="hidden xs:inline">Kurani</span>
          </button>

          {/* Surah Title Pill */}
          <button
            type="button"
            onClick={() => setShowSurahModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 min-h-[44px] rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold transition-all mx-1 truncate max-w-[200px] xs:max-w-[280px] text-xs cursor-pointer"
            title="Zgjidh Suren"
          >
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate text-slate-100">
              {currentSurahMeta?.number}. {currentSurahMeta?.transliteration || `Surja ${currentSurahNum}`}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400/80 shrink-0 ml-0.5" />
          </button>

          {/* Action Icons: Navigation, Mode, Settings */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Search/Navigation Jump */}
            <button
              type="button"
              onClick={() => setShowNavigationModal(true)}
              className="p-2 sm:px-3 sm:py-2 min-h-[44px] min-w-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-amber-300 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              title="Navigo sipas Faqes / Sures / Xhuzit"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline font-medium text-xs">Navigo</span>
            </button>

            {/* Switch to Verse by Verse */}
            {onSwitchToVerseByVerse && (
              <button
                type="button"
                onClick={() => onSwitchToVerseByVerse(currentSurahNum)}
                className="p-2 min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-emerald-300 transition-colors hidden xs:flex items-center space-x-1 cursor-pointer"
                title="Kalo në modalitetin Ajet pas Ajeti"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="hidden md:inline font-medium text-xs">Ajet</span>
              </button>
            )}

            {/* Settings */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="p-2 sm:px-3 sm:py-2 min-h-[44px] min-w-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-amber-300 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              title="Cilësimet e Mushafit"
            >
              <Settings className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline font-medium text-xs">Cilësimet</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------- MAIN READING CANVAS ----------------- */}
      <div
        id="mushaf-reading-canvas"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          e.stopPropagation();
          setShowControls((prev) => !prev);
        }}
        className="flex-1 w-full max-w-6xl mx-auto flex items-center justify-center p-1 sm:p-3 md:p-4 transition-all cursor-pointer select-none overflow-hidden"
      >
        <MushafPageSpread
          currentPage={currentPage}
          spreadPages={spreadPages}
          isTwoPageSpread={isTwoPageSpread}
          theme={activeTheme}
          fontScale={fontScale}
          showTajweed={showTajweed}
          activeVerseKey={activeVerseKey}
          pageData1={pageData1}
          fontFamily1={fontFamily1}
          pageData2={pageData2}
          fontFamily2={fontFamily2}
          isLoading={loading}
          errorMessage={errorMessage}
          onRetry={handleRetry}
          onVerseSelect={handleVerseSelect}
        />
      </div>

      {/* ----------------- BOTTOM CONTROLS FOOTER ----------------- */}
      {showControls && (
        <div
          id="mushaf-bottom-footer"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="fixed bottom-3 left-3 right-3 sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-50 bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 text-slate-100 rounded-full px-4 py-2 shadow-2xl transition-all flex items-center justify-between text-xs"
        >
          {/* Previous Page */}
          <button
            type="button"
            onClick={prevPage}
            disabled={currentPage <= 1 || loading}
            className="flex items-center space-x-1 px-3 py-2 min-h-[44px] rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/60 disabled:opacity-30 transition-all font-medium cursor-pointer"
            title="Faqja e Mëparshme"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Para</span>
          </button>

          {/* Page Counter & Direct Jump */}
          <button
            type="button"
            onClick={() => {
              setNavTab('faqe');
              setShowNavigationModal(true);
            }}
            className="flex items-center space-x-2 font-mono text-xs px-3 py-2 min-h-[44px] rounded-full bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 text-amber-300 font-bold transition-colors cursor-pointer"
            title="Kliko për navigim"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Faqja {currentPage}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">604</span>
          </button>

          {/* Next Page */}
          <button
            type="button"
            onClick={nextPage}
            disabled={currentPage >= 604 || loading}
            className="flex items-center space-x-1 px-3 py-2 min-h-[44px] rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/60 disabled:opacity-30 transition-all font-medium cursor-pointer"
            title="Faqja Tjetër"
          >
            <span>Tjetra</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ----------------- AYAH INTERACTION MODAL ----------------- */}
      {showAyahModal && activeVerseKey && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowAyahModal(false);
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 w-full max-w-sm text-slate-100 shadow-2xl space-y-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-mono font-bold text-xs">
                  {activeVerseKey}
                </span>
                <span className="text-sm font-bold">Ajeti {activeVerseKey}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAyahModal(false)}
                className="p-2 min-h-[44px] min-w-[44px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              {/* Play Audio */}
              <button
                type="button"
                onClick={() => {
                  if (onPlayAyahAudio) onPlayAyahAudio(activeVerseKey);
                  setShowAyahModal(false);
                }}
                className="p-3 min-h-[44px] rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>Dëgjo Ajetin</span>
              </button>

              {/* Jump to Verse-by-Verse */}
              {onSwitchToVerseByVerse && (
                <button
                  type="button"
                  onClick={() => {
                    const surahNum = parseInt(activeVerseKey.split(':')[0], 10);
                    onSwitchToVerseByVerse(surahNum);
                    setShowAyahModal(false);
                  }}
                  className="p-3 min-h-[44px] rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Përkthimi</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SURAH SELECTION MODAL ----------------- */}
      {showSurahModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowSurahModal(false);
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl text-slate-100"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Zgjidhni Suren</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSurahModal(false)}
                className="p-2 min-h-[44px] min-w-[44px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-800">
              <input
                type="text"
                value={surahSearchTerm}
                onChange={(e) => setSurahSearchTerm(e.target.value)}
                placeholder="Kërko Suren sipas emrit ose numrit..."
                className="w-full px-3 py-2.5 min-h-[44px] rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-slate-800/50">
              {filteredSurahs.map((surah) => (
                <div
                  key={surah.number}
                  onClick={() => {
                    goToSurah(surah.number);
                    setShowSurahModal(false);
                  }}
                  className={`py-2 px-2.5 min-h-[44px] rounded-xl cursor-pointer flex items-center justify-between transition-colors ${
                    currentSurahNum === surah.number
                      ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6 h-6 rounded bg-slate-950 text-slate-400 font-mono text-[10px] flex items-center justify-center">
                      {surah.number}
                    </span>
                    <div>
                      <div className="text-xs font-semibold">{surah.transliteration}</div>
                      <div className="text-[10px] text-slate-400">{surah.albanianName} • {surah.numberOfAyahs} ajete</div>
                    </div>
                  </div>
                  <span className="font-arabic text-base">{surah.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- NAVIGATION MODAL (FAQE / SURE / XHUZ) ----------------- */}
      {showNavigationModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowNavigationModal(false);
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden shadow-2xl text-slate-100"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center space-x-2">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Navigimi në Mushaf</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNavigationModal(false)}
                className="p-2 min-h-[44px] min-w-[44px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Selector */}
            <div className="grid grid-cols-3 p-2 bg-slate-950 border-b border-slate-800 gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setNavTab('faqe')}
                className={`py-2 min-h-[44px] rounded-lg transition-colors cursor-pointer ${
                  navTab === 'faqe' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Faqe (1-604)
              </button>
              <button
                type="button"
                onClick={() => setNavTab('sure')}
                className={`py-2 min-h-[44px] rounded-lg transition-colors cursor-pointer ${
                  navTab === 'sure' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sure (114)
              </button>
              <button
                type="button"
                onClick={() => setNavTab('xhuz')}
                className={`py-2 min-h-[44px] rounded-lg transition-colors cursor-pointer ${
                  navTab === 'xhuz' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Xhuz (30)
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {navTab === 'faqe' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const p = parseInt(navFaqeInput.trim(), 10);
                    if (!isNaN(p) && p >= 1 && p <= 604) {
                      goToPage(p);
                      setShowNavigationModal(false);
                      setNavFaqeInput('');
                      setNavFaqeError('');
                    } else {
                      setNavFaqeError('Ju lutem shkruani një faqe midis 1 dhe 604.');
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Shkruani numrin e faqes (1 - 604):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={604}
                      value={navFaqeInput}
                      onChange={(e) => {
                        setNavFaqeInput(e.target.value);
                        setNavFaqeError('');
                      }}
                      placeholder={`psh. ${currentPage}`}
                      className="w-full px-4 py-2.5 min-h-[44px] rounded-xl bg-slate-950 border border-slate-700 text-sm font-mono text-center text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                    {navFaqeError && <p className="text-xs text-rose-400 mt-1">{navFaqeError}</p>}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center"
                  >
                    Shko te Faqja
                  </button>
                </form>
              )}

              {navTab === 'sure' && (
                <div className="space-y-1 divide-y divide-slate-800/50">
                  {ALL_SURAHS_META.map((surah) => (
                    <div
                      key={surah.number}
                      onClick={() => {
                        goToSurah(surah.number);
                        setShowNavigationModal(false);
                      }}
                      className="py-2.5 px-2 min-h-[44px] rounded-xl cursor-pointer flex items-center justify-between hover:bg-slate-800 text-xs"
                    >
                      <span className="font-medium text-slate-200">
                        {surah.number}. {surah.transliteration}
                      </span>
                      <span className="font-arabic text-sm text-amber-400">{surah.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {navTab === 'xhuz' && (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((juz) => (
                    <button
                      key={juz}
                      type="button"
                      onClick={() => {
                        goToJuz(juz);
                        setShowNavigationModal(false);
                      }}
                      className="p-3 min-h-[44px] rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-center transition-colors font-medium text-xs cursor-pointer"
                    >
                      <div className="text-amber-400 font-bold">Xhuz {juz}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Faqja {JUZ_START_PAGES[juz]}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SETTINGS MODAL ----------------- */}
      {showSettingsModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowSettingsModal(false);
          }}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl text-slate-100 p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm flex items-center space-x-2">
                <Settings className="w-4 h-4 text-amber-400" />
                <span>Cilësimet e Mushafit</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="p-2 min-h-[44px] min-w-[44px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Paper Theme Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Tema e Letrës</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(MUSHAF_THEMES).map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`p-2.5 min-h-[44px] rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                      selectedThemeKey === theme.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-medium">{theme.name}</span>
                    {selectedThemeKey === theme.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Two-page spread toggle on desktop */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Pamje Dy-Faqëshe (Libër)</div>
                  <div className="text-[10px] text-slate-400">Rekomanduar për Ekran të Gjerë / Tablet</div>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoPageSpread(!isTwoPageSpread)}
                  className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                    isTwoPageSpread ? 'bg-amber-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                      isTwoPageSpread ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Font Scale slider */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Madhësia e Shkrimit</span>
                <span className="text-amber-400 font-mono">{fontScale}%</span>
              </div>
              <input
                type="range"
                min={80}
                max={130}
                step={5}
                value={fontScale}
                onChange={(e) => setFontScale(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 h-6 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
