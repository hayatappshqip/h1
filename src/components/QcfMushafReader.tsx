/**
 * QcfMushafReader Component - Minimalist, Zen, Physical-Book Mushaf Reader
 *
 * Requirements:
 * - Uses endpoint: /.netlify/functions/quran-page?page=N (1 to 604)
 * - Renders code_v2 glyphs strictly with dynamically loaded QCF_P{page} font family
 * - Uses isolated container class: .qcf-mushaf-page
 * - Controls hidden by default; single tap toggles lightweight translucent overlay
 * - Touch swipe left/right changes pages without accidentally toggling controls
 * - Supports Paper themes (Ivory, Sepia, White, Dark), font scaling, Tajweed toggle, and mode switcher
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
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
  FileText
} from 'lucide-react';
import {
  ALL_SURAHS_META,
  SURAH_START_PAGES,
  JUZ_START_PAGES,
  getSurahNumberFromPage
} from '../data/quranData';

interface CleanWord {
  position: number;
  char_type_name: string;
  code_v2: string;
  v2_page: number;
  line_number: number;
  page_number: number;
}

interface CleanVerse {
  page_number: number;
  juz_number: number;
  hizb_number: number;
  rub_el_hizb_number: number;
  chapter_id: number;
  verse_number: number;
  verse_key: string;
  words: CleanWord[];
}

interface QuranPageData {
  page_number: number;
  verses: CleanVerse[];
}

interface ThemeConfig {
  id: string;
  name: string;
  bg: string;          // Main reader canvas background
  paperBg: string;     // Physical paper background
  paperBorder: string; // Paper border
  spineColor: string;  // Center spine divider
  textColor: string;   // Code_v2 glyph text color
  subtextColor: string;// Footer page/juz text color
  hoverColor: string;  // Hover state
  isDark: boolean;
}

const PAPER_THEMES: Record<string, ThemeConfig> = {
  ivory: {
    id: 'ivory',
    name: 'Letër',
    bg: 'bg-[#181614]',
    paperBg: 'bg-[#FAF6EE]',
    paperBorder: 'border-[#E8DCC4]',
    spineColor: 'border-[#DECFA7]',
    textColor: 'text-[#1C160E]',
    subtextColor: 'text-[#7C6A53]',
    hoverColor: 'hover:text-[#0E6243]',
    isDark: false,
  },
  sepia: {
    id: 'sepia',
    name: 'Sepia',
    bg: 'bg-[#1C1712]',
    paperBg: 'bg-[#F4ECD8]',
    paperBorder: 'border-[#DFCFAF]',
    spineColor: 'border-[#D4C29E]',
    textColor: 'text-[#281E12]',
    subtextColor: 'text-[#826F56]',
    hoverColor: 'hover:text-[#B45309]',
    isDark: false,
  },
  white: {
    id: 'white',
    name: 'Bardhë',
    bg: 'bg-[#121212]',
    paperBg: 'bg-[#FFFFFF]',
    paperBorder: 'border-[#E2E8F0]',
    spineColor: 'border-[#CBD5E1]',
    textColor: 'text-[#0F172A]',
    subtextColor: 'text-[#64748B]',
    hoverColor: 'hover:text-[#0284C7]',
    isDark: false,
  },
  dark: {
    id: 'dark',
    name: 'Errët',
    bg: 'bg-[#0A0A0A]',
    paperBg: 'bg-[#161616]',
    paperBorder: 'border-[#262626]',
    spineColor: 'border-[#333333]',
    textColor: 'text-[#EDEDED]',
    subtextColor: 'text-[#888888]',
    hoverColor: 'hover:text-[#34D399]',
    isDark: true,
  },
};

/**
 * Utility to dynamically load QCF V2 page fonts (1 to 604)
 */
async function loadQcfFontForPage(page: number): Promise<string> {
  const fontFamilyName = `QCF_P${page}`;
  const fontUrl = `https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p${page}.woff2`;

  const fontId = `qcf-v2-font-style-p${page}`;
  if (!document.getElementById(fontId)) {
    const styleEl = document.createElement('style');
    styleEl.id = fontId;
    styleEl.textContent = `
      @font-face {
        font-family: '${fontFamilyName}';
        src: url('${fontUrl}') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: block;
      }
    `;
    document.head.appendChild(styleEl);
  }

  if ('fonts' in document) {
    const isAlreadyLoaded = Array.from(document.fonts).some(
      (font) => font.family === fontFamilyName && font.status === 'loaded'
    );
    if (isAlreadyLoaded) {
      return fontFamilyName;
    }

    try {
      if ('FontFace' in window) {
        const fontFace = new FontFace(fontFamilyName, `url('${fontUrl}')`, {
          display: 'block',
        });
        const loadedFace = await fontFace.load();
        document.fonts.add(loadedFace);
      } else {
        await document.fonts.load(`16px "${fontFamilyName}"`);
      }
    } catch (err) {
      console.error(`Error loading QCF font for page ${page}:`, err);
      throw new Error(`Dështoi ngarkimi i shkrimit QCF për faqen ${page}. Ju lutem provoni përsëri.`);
    }
  }

  return fontFamilyName;
}

interface QcfMushafReaderProps {
  initialPage?: number;
  initialSurahNum?: number;
  onPageChange?: (page: number) => void;
  onBack?: () => void;
  onSwitchToVerseByVerse?: (surahNum: number) => void;
  showTajweed?: boolean;
  onToggleTajweed?: () => void;
}

export const QcfMushafReader: React.FC<QcfMushafReaderProps> = ({
  initialPage,
  initialSurahNum,
  onPageChange,
  onBack,
  onSwitchToVerseByVerse,
  showTajweed = false,
  onToggleTajweed
}) => {
  const startPage = initialPage || (initialSurahNum ? (SURAH_START_PAGES[initialSurahNum] || 1) : 1);
  const [currentPage, setCurrentPage] = useState<number>(startPage);
  const [pageData, setPageData] = useState<QuranPageData | null>(null);
  const [secondPageData, setSecondPageData] = useState<QuranPageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string>(`QCF_P${startPage}`);
  const [secondFontFamily, setSecondFontFamily] = useState<string>('');

  // Reader UI States
  const [showControls, setShowControls] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [fontScale, setFontScale] = useState<number>(100); // 80..130%
  const [isTajweedActive, setIsTajweedActive] = useState<boolean>(showTajweed);
  const [selectedThemeKey, setSelectedThemeKey] = useState<string>(() => {
    return localStorage.getItem('hayat_mushaf_theme') || 'ivory';
  });
  const [isSpread, setIsSpread] = useState<boolean>(false); // 2-page book spread for tablet/desktop

  // Touch tracking for swipe vs tap
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const activeTheme = PAPER_THEMES[selectedThemeKey] || PAPER_THEMES.ivory;

  // Sync initialSurahNum / initialPage changes from parent
  useEffect(() => {
    if (initialPage) {
      setCurrentPage(initialPage);
    } else if (initialSurahNum && SURAH_START_PAGES[initialSurahNum]) {
      setCurrentPage(SURAH_START_PAGES[initialSurahNum]);
    }
  }, [initialPage, initialSurahNum]);

  // Derive current surah metadata from page
  const currentSurahNum = getSurahNumberFromPage(currentPage);
  const currentSurahMeta = ALL_SURAHS_META.find((s) => s.number === currentSurahNum);

  // Persist theme choice
  const handleSelectTheme = (themeKey: string) => {
    setSelectedThemeKey(themeKey);
    localStorage.setItem('hayat_mushaf_theme', themeKey);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSettingsModal) return;
      if (e.key === 'ArrowLeft') {
        handleNextPage();
      } else if (e.key === 'ArrowRight') {
        handlePrevPage();
      } else if (e.key === ' ' || e.key === 'Escape') {
        setShowControls((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, isSpread, showSettingsModal]);

  // Fetch Page Data & Font (Single or Spread)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorMessage(null);

    const secondPageNum = currentPage < 604 ? currentPage + 1 : null;

    const primaryFontPromise = loadQcfFontForPage(currentPage);
    const secondaryFontPromise =
      isSpread && secondPageNum
        ? loadQcfFontForPage(secondPageNum)
        : Promise.resolve('');

    const fetchPrimary = fetch(`/.netlify/functions/quran-page?page=${currentPage}`).then((res) =>
      res.json()
    );

    const fetchSecondary =
      isSpread && secondPageNum
        ? fetch(`/.netlify/functions/quran-page?page=${secondPageNum}`).then((res) => res.json())
        : Promise.resolve(null);

    Promise.all([primaryFontPromise, secondaryFontPromise, fetchPrimary, fetchSecondary])
      .then(([pFont, sFont, p1Data, p2Data]) => {
        if (!isMounted) return;
        if (p1Data && p1Data.error) throw new Error(p1Data.error);

        setFontFamily(pFont);
        if (sFont) setSecondFontFamily(sFont);
        setPageData(p1Data);
        setSecondPageData(p2Data);
        setLoading(false);

        if (onPageChange) onPageChange(currentPage);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setErrorMessage(
          err.message || `Dështoi ngarkimi i shkrimit QCF për faqen ${currentPage}. Ju lutem provoni përsëri.`
        );
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage, isSpread]);

  const handleNextPage = () => {
    const step = isSpread ? 2 : 1;
    if (currentPage + step <= 604) {
      setCurrentPage((prev) => prev + step);
    } else if (currentPage < 604) {
      setCurrentPage(604);
    }
  };

  const handlePrevPage = () => {
    const step = isSpread ? 2 : 1;
    if (currentPage - step >= 1) {
      setCurrentPage((prev) => prev - step);
    } else if (currentPage > 1) {
      setCurrentPage(1);
    }
  };

  // Gesture Handlers
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
    if (!touchStartRef.current) return;

    const touchEnd = e.changedTouches[0];
    const deltaX = touchEnd.clientX - touchStartRef.current.x;
    const deltaY = touchEnd.clientY - touchStartRef.current.y;
    const duration = Date.now() - touchStartRef.current.time;

    touchStartRef.current = null;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && duration < 600) {
      if (deltaX < 0) {
        handleNextPage();
      } else {
        handlePrevPage();
      }
      return;
    }

    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && duration < 350) {
      setShowControls((prev) => !prev);
    }
  };

  const handleCanvasClick = () => {
    setShowControls((prev) => !prev);
  };

  // Helper to render a single page layout
  const renderPageLines = (data: QuranPageData | null, fontName: string, pNum: number) => {
    if (!data || !Array.isArray(data.verses)) return null;

    const linesMap: { [lineNumber: number]: CleanWord[] } = {};
    data.verses.forEach((verse) => {
      if (Array.isArray(verse.words)) {
        verse.words.forEach((word) => {
          const lNum = word.line_number || 1;
          if (!linesMap[lNum]) linesMap[lNum] = [];
          linesMap[lNum].push(word);
        });
      }
    });

    const sortedLineNumbers = Object.keys(linesMap)
      .map((n) => parseInt(n, 10))
      .sort((a, b) => a - b);

    const firstVerse = data.verses[0];
    const juzNum = firstVerse?.juz_number || 1;
    const hizbNum = firstVerse?.hizb_number || 1;

    return (
      <div
        className={`w-full h-full flex flex-col justify-between p-3 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border shadow-xl relative overflow-hidden select-none transition-colors duration-300 ${activeTheme.paperBg} ${activeTheme.paperBorder}`}
      >
        <div className={`absolute inset-2 border rounded-xl pointer-events-none opacity-40 ${activeTheme.paperBorder}`} />

        {/* ISOLATED MUSHAF PAGE CONTAINER */}
        <div
          className="qcf-mushaf-page my-auto space-y-1 sm:space-y-1.5 py-1 transition-all duration-200"
          style={{
            fontSize: fontScale !== 100 ? `${fontScale}%` : undefined
          }}
        >
          {sortedLineNumbers.map((lineNum) => {
            const words = linesMap[lineNum] || [];
            return (
              <div
                key={lineNum}
                className="flex items-center justify-center flex-wrap w-full my-0.5 leading-none gap-x-1 sm:gap-x-1.5"
                dir="rtl"
              >
                {words.map((w, wIdx) => (
                  <span
                    key={`${w.code_v2}-${wIdx}`}
                    className={`qcf-v2-word text-[1.25rem] xs:text-[1.45rem] sm:text-[1.9rem] md:text-[2.2rem] lg:text-[2.5rem] text-center inline-block transition-colors ${
                      isTajweedActive ? 'hover:text-emerald-600' : ''
                    } ${activeTheme.textColor} ${activeTheme.hoverColor}`}
                    style={{
                      fontFamily: `'${fontName}'`,
                    }}
                  >
                    {w.code_v2}
                  </span>
                ))}
              </div>
            );
          })}
        </div>

        {/* Physical Page Footer Marker */}
        <div className={`pt-3 mt-2 border-t flex justify-between items-center text-[10px] sm:text-[11px] font-mono opacity-80 ${activeTheme.spineColor} ${activeTheme.subtextColor}`}>
          <span>Xhuz {juzNum}</span>
          <span className="font-bold">Faqja {pNum}</span>
          <span>Hizb {hizbNum}</span>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between overflow-hidden transition-colors duration-500 ${activeTheme.bg}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleCanvasClick}
    >
      {/* ----------------- TOP TRANSLUCENT CONTROLS OVERLAY ----------------- */}
      {showControls && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed top-3 left-3 right-3 sm:top-5 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-50 bg-slate-950/90 backdrop-blur-md border border-slate-800/80 text-slate-100 rounded-2xl p-2.5 sm:px-4 sm:py-3 shadow-2xl transition-all duration-300 animate-fadeIn flex items-center justify-between text-xs"
        >
          {/* Back Button */}
          <button
            onClick={() => {
              if (onBack) onBack();
              else setShowControls(false);
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition-colors"
            title="Kthehu te Kur'ani"
          >
            <ChevronLeft className="w-4 h-4 text-emerald-400" />
            <span className="font-medium hidden xs:inline">Kur'ani</span>
          </button>

          {/* Current Surah Title & Page Indicator */}
          <div className="flex items-center space-x-1.5 font-medium text-amber-300">
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold text-slate-100 truncate max-w-[120px] xs:max-w-[180px]">
              {currentSurahMeta?.transliteration || `Surja ${currentSurahNum}`}
            </span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-[11px] text-amber-300">Faqja {currentPage}/604</span>
          </div>

          {/* Right Header Actions: Settings Drawer Toggle */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold transition-colors"
              title="Rregullo cilësimet e leximit"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden xs:inline text-xs">Cilësimet</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------- MAIN READING CANVAS ----------------- */}
      <div className="flex-1 w-full max-w-5xl mx-auto flex items-center justify-center p-2 sm:p-6 md:p-8 transition-all">
        {loading ? (
          <div className={`p-8 rounded-3xl border text-center space-y-3 shadow-lg ${activeTheme.paperBg} ${activeTheme.paperBorder}`}>
            <RefreshCw className={`w-7 h-7 animate-spin mx-auto ${activeTheme.textColor}`} />
            <p className={`text-xs font-medium ${activeTheme.subtextColor}`}>
              Duke ngarkuar shkrimin QCF për faqen {currentPage}...
            </p>
          </div>
        ) : errorMessage ? (
          <div className="bg-rose-950/40 border border-rose-800/80 p-6 rounded-2xl text-center space-y-3 max-w-sm">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-xs text-rose-200">{errorMessage}</p>
            <button
              onClick={() => setCurrentPage((p) => p)}
              className="px-4 py-2 bg-rose-900 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold"
            >
              Riprovo
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center gap-3 md:gap-6">
            {/* 2-page spread */}
            {isSpread && secondPageData && (
              <div className="flex-1 h-full max-w-lg hidden sm:block">
                {renderPageLines(secondPageData, secondFontFamily, currentPage + 1)}
              </div>
            )}

            {/* Primary Page */}
            <div className="flex-1 h-full max-w-lg">
              {renderPageLines(pageData, fontFamily, currentPage)}
            </div>
          </div>
        )}
      </div>

      {/* ----------------- BOTTOM TRANSLUCENT CONTROLS OVERLAY ----------------- */}
      {showControls && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-4 left-3 right-3 sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-50 bg-slate-950/90 backdrop-blur-md border border-slate-800/80 text-slate-100 rounded-full px-4 py-2 shadow-2xl transition-all duration-300 animate-fadeIn flex items-center justify-between text-xs"
        >
          {/* Previous Page Button */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || loading}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/60 disabled:opacity-30 transition-all"
            title="Faqja e Mëparshme"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Para</span>
          </button>

          {/* Page Counter */}
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="font-bold text-amber-300">Faqja {currentPage}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">604</span>
          </div>

          {/* Next Page Button */}
          <button
            onClick={handleNextPage}
            disabled={currentPage >= 604 || loading}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/60 disabled:opacity-30 transition-all"
            title="Faqja Tjetër"
          >
            <span className="hidden xs:inline">Tjetra</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ----------------- SETTINGS MODAL / DRAWER OVERLAY ----------------- */}
      {showSettingsModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowSettingsModal(false);
          }}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Cilësimet e Leximit</h3>
                  <p className="text-[11px] text-slate-400">Personalizo Mushafin dhe leximin tënd</p>
                </div>
              </div>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Reading Mode Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Mënyra e Leximit</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-3.5 rounded-2xl border bg-amber-500/10 border-amber-500/60 text-amber-300 font-bold text-xs flex flex-col items-center justify-center space-y-1.5 shadow-sm"
                >
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <span>Faqe Mushafi (QCF V2)</span>
                  <span className="text-[10px] font-normal text-amber-400/80">Format Fizik</span>
                </button>

                <button
                  onClick={() => {
                    setShowSettingsModal(false);
                    if (onSwitchToVerseByVerse) {
                      onSwitchToVerseByVerse(currentSurahNum);
                    }
                  }}
                  className="p-3.5 rounded-2xl border bg-slate-950/80 border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 font-medium text-xs flex flex-col items-center justify-center space-y-1.5 transition-all"
                >
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <span>Ajet për Ajet</span>
                  <span className="text-[10px] font-normal text-slate-400">Përkthim & Audio</span>
                </button>
              </div>
            </div>

            {/* 2. Font Size Scaling */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Type className="w-3.5 h-3.5 text-amber-400" />
                  <span>Madhësia e Shkrimit</span>
                </label>
                <span className="text-xs font-mono text-amber-300 font-bold">{fontScale}%</span>
              </div>
              <div className="flex items-center space-x-1.5">
                {[80, 90, 100, 115, 130].map((sc) => (
                  <button
                    key={sc}
                    onClick={() => setFontScale(sc)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      fontScale === sc
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {sc === 100 ? 'Normale' : `${sc}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Tajweed Rules Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Rregullat e Texhvidit</span>
                </label>
                <p className="text-[10px] text-slate-400">Ngjyrosje për rregullat e leximit të Kuranit</p>
              </div>
              <button
                onClick={() => {
                  const nextState = !isTajweedActive;
                  setIsTajweedActive(nextState);
                  if (onToggleTajweed) onToggleTajweed();
                }}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors flex items-center ${
                  isTajweedActive ? 'bg-emerald-600 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            {/* 4. Paper Theme Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Tema e Letrës</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.values(PAPER_THEMES).map((th) => (
                  <button
                    key={th.id}
                    onClick={() => handleSelectTheme(th.id)}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center space-y-1.5 transition-all ${
                      selectedThemeKey === th.id
                        ? 'border-amber-400 ring-2 ring-amber-400/40 bg-slate-800/90'
                        : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800'
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full border shadow-sm ${th.paperBg}`} />
                    <span className="text-[10px] text-slate-300 font-semibold">{th.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. 2-Page Book Spread */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  <span>Format Libri (2 Faqe)</span>
                </label>
                <p className="text-[10px] text-slate-400">Shfaq dy faqe përballe (Për ekran më të madh)</p>
              </div>
              <button
                onClick={() => setIsSpread(!isSpread)}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors flex items-center ${
                  isSpread ? 'bg-amber-600 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>

            {/* 6. Quick Navigation Dropdowns */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>Navigim i Shpejtë</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono">Zgjidh Suren:</span>
                  <select
                    value={currentSurahNum}
                    onChange={(e) => {
                      const sNum = parseInt(e.target.value, 10);
                      const p = SURAH_START_PAGES[sNum] || 1;
                      setCurrentPage(p);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 rounded-xl p-2.5 focus:border-amber-500 focus:outline-none"
                  >
                    {ALL_SURAHS_META.map((s) => (
                      <option key={s.number} value={s.number}>
                        {s.number}. {s.transliteration} ({s.albanianName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono">Zgjidh Xhuzin:</span>
                  <select
                    onChange={(e) => {
                      const jNum = parseInt(e.target.value, 10);
                      const p = JUZ_START_PAGES[jNum] || 1;
                      setCurrentPage(p);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 rounded-xl p-2.5 focus:border-amber-500 focus:outline-none"
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                      <option key={j} value={j}>
                        Xhuzi {j} (Faqja {JUZ_START_PAGES[j]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
