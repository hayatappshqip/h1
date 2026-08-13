/**
 * QcfMushafReader Component - Minimalist, Zen, Physical-Book Mushaf Reader
 *
 * Requirements:
 * - Uses endpoint: /.netlify/functions/quran-page?page=N (1 to 604)
 * - Renders code_v2 glyphs strictly with dynamically loaded QCF_P{page} font family
 * - NEVER uses KFGQPC Uthmanic Script, UthmanicHafs1Ver18, .font-arabic, .quran-arabic, .quran-word, or .quran-verse for code_v2
 * - Uses isolated container class: .qcf-mushaf-page
 * - Controls hidden by default; single tap toggles lightweight translucent overlay
 * - Touch swipe left/right changes pages without accidentally toggling controls
 * - Supports Paper themes (Ivory, Sepia, White, Dark) and optional 2-Page Spread
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  AlertCircle,
  RefreshCw,
  X,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Sun,
  Moon
} from 'lucide-react';

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
 * Uses official Quran Foundation URL format:
 * https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p{PAGE}.woff2
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
  onPageChange?: (page: number) => void;
  onBack?: () => void;
}

export const QcfMushafReader: React.FC<QcfMushafReaderProps> = ({
  initialPage = 1,
  onPageChange,
  onBack,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageData, setPageData] = useState<QuranPageData | null>(null);
  const [secondPageData, setSecondPageData] = useState<QuranPageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string>(`QCF_P${initialPage}`);
  const [secondFontFamily, setSecondFontFamily] = useState<string>('');

  // Reader UI States
  const [showControls, setShowControls] = useState<boolean>(false);
  const [selectedThemeKey, setSelectedThemeKey] = useState<string>(() => {
    return localStorage.getItem('hayat_mushaf_theme') || 'ivory';
  });
  const [isSpread, setIsSpread] = useState<boolean>(false); // 2-page book spread for tablet/desktop

  // Touch tracking for swipe vs tap
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const activeTheme = PAPER_THEMES[selectedThemeKey] || PAPER_THEMES.ivory;

  // Persist theme choice
  const handleSelectTheme = (themeKey: string) => {
    setSelectedThemeKey(themeKey);
    localStorage.setItem('hayat_mushaf_theme', themeKey);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [currentPage, isSpread]);

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

    // Swipe threshold: >40px horizontally, duration <600ms, predominantly horizontal
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && duration < 600) {
      if (deltaX < 0) {
        // Swiped left -> Next page
        handleNextPage();
      } else {
        // Swiped right -> Previous page
        handlePrevPage();
      }
      return;
    }

    // Tap threshold: <10px movement, <350ms duration
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && duration < 350) {
      setShowControls((prev) => !prev);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only toggle if clicked directly on the canvas background/wrapper
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
        {/* Subtle inner page frame */}
        <div className={`absolute inset-2 border rounded-xl pointer-events-none opacity-40 ${activeTheme.paperBorder}`} />

        {/* ISOLATED MUSHAF PAGE CONTAINER: .qcf-mushaf-page */}
        <div className="qcf-mushaf-page my-auto space-y-1 sm:space-y-2 py-1">
          {sortedLineNumbers.map((lineNum) => {
            const words = linesMap[lineNum] || [];
            return (
              <div
                key={lineNum}
                className="flex items-center justify-between w-full my-0.5 leading-none"
                dir="rtl"
              >
                {words.map((w, wIdx) => (
                  <span
                    key={`${w.code_v2}-${wIdx}`}
                    className={`qcf-v2-word text-[1.4rem] xs:text-[1.7rem] sm:text-3xl md:text-4xl text-center inline-block px-0.5 transition-colors ${activeTheme.textColor} ${activeTheme.hoverColor}`}
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

        {/* Minimal Physical Page Footer Marker */}
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
          className="fixed top-3 left-3 right-3 sm:top-5 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-50 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 text-slate-100 rounded-2xl p-2.5 sm:px-4 sm:py-3 shadow-2xl transition-all duration-300 animate-fadeIn flex items-center justify-between text-xs"
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
            <ChevronLeft className="w-4 h-4" />
            <span className="font-medium hidden xs:inline">Kur'ani</span>
          </button>

          {/* Page Jumper Selector */}
          <div className="flex items-center space-x-2 font-mono">
            <span className="text-slate-400 text-[11px]">Faqja</span>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(parseInt(e.target.value, 10))}
              disabled={loading}
              className="bg-slate-900 border border-slate-700 text-amber-300 text-xs font-bold rounded-xl px-2.5 py-1 focus:outline-none focus:border-amber-500"
            >
              {Array.from({ length: 604 }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <span className="text-slate-400 text-[11px]">/ 604</span>
          </div>

          {/* Theme Selector & Optional Book Spread Toggle */}
          <div className="flex items-center space-x-1.5">
            {/* Paper Theme Dots */}
            <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 space-x-1">
              {Object.values(PAPER_THEMES).map((th) => (
                <button
                  key={th.id}
                  onClick={() => handleSelectTheme(th.id)}
                  className={`w-5 h-5 rounded-full border transition-all ${
                    selectedThemeKey === th.id
                      ? 'scale-110 ring-2 ring-amber-400 border-white'
                      : 'opacity-70 hover:opacity-100 border-transparent'
                  } ${th.paperBg}`}
                  title={`Tema: ${th.name}`}
                />
              ))}
            </div>

            {/* Book Spread Toggle (visible on tablet/desktop) */}
            <button
              onClick={() => setIsSpread(!isSpread)}
              className={`hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                isSpread
                  ? 'bg-amber-600 border-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 border-slate-700/60 text-slate-300 hover:bg-slate-800'
              }`}
              title={isSpread ? 'Kaloni në 1 Faqe' : 'Kaloni në 2 Faqe (Libër)'}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isSpread ? '2 Faqe' : '1 Faqe'}</span>
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
            {/* If 2-page spread is active, render second page on the left */}
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
          className="fixed bottom-4 left-3 right-3 sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-50 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 text-slate-100 rounded-full px-4 py-2 shadow-2xl transition-all duration-300 animate-fadeIn flex items-center justify-between text-xs"
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

          {/* Page Counter & Quick Slider */}
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
    </div>
  );
};
