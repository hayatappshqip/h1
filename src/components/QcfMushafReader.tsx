/**
 * QcfMushafReader Component - Minimalist, Zen, Physical-Book Mushaf Reader
 *
 * Features:
 * - Renders Hafs code_v2 glyphs with dynamic QCF_P{page} font families
 * - Isolated container class: .qcf-mushaf-page
 * - Persistent/Responsive controls header & footer with quick toggles
 * - Click Surah name -> opens Surah Selection Modal
 * - Search button in Header -> search Surahs, Pages (1-604), and Juzs (1-30)
 * - Swipe gestures for left/right page flipping
 * - Supports Paper themes (Ivory, Sepia, White, Dark), font scaling, Tajweed toggle, and mode switcher
 */
import React, { useState, useEffect, useRef } from 'react';
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
  FileText,
  Bookmark,
  Hash,
  Compass
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
 * Dynamic Font Loader for Hafs QCF V2 Page Fonts (1 to 604)
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

  // Reader UI Control States
  const [showControls, setShowControls] = useState<boolean>(true); // Persistent by default
  const [showSurahModal, setShowSurahModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showNavigationModal, setShowNavigationModal] = useState<boolean>(false);

  // Search & Filter State
  const [surahSearchTerm, setSurahSearchTerm] = useState<string>('');
  const [quickJumpInput, setQuickJumpInput] = useState<string>('');
  
  // Navigation Modal State
  const [navTab, setNavTab] = useState<'faqe' | 'sure' | 'xhuz'>('faqe');
  const [navFaqeInput, setNavFaqeInput] = useState<string>('');
  const [navFaqeError, setNavFaqeError] = useState<string>('');
  const [navSureSearch, setNavSureSearch] = useState<string>('');

  // Settings
  const [fontScale, setFontScale] = useState<number>(100); // 80..130%
  const [isTajweedActive, setIsTajweedActive] = useState<boolean>(showTajweed);
  const [selectedThemeKey, setSelectedThemeKey] = useState<string>(() => {
    return localStorage.getItem('hayat_mushaf_theme') || 'ivory';
  });
  const [isSpread, setIsSpread] = useState<boolean>(false); // 2-page book spread

  // Touch tracking
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const activeTheme = PAPER_THEMES[selectedThemeKey] || PAPER_THEMES.ivory;

  // Sync initialSurahNum / initialPage from parent
  useEffect(() => {
    if (initialPage) {
      setCurrentPage(initialPage);
    } else if (initialSurahNum && SURAH_START_PAGES[initialSurahNum]) {
      setCurrentPage(SURAH_START_PAGES[initialSurahNum]);
    }
  }, [initialPage, initialSurahNum]);

  // Derive current surah metadata
  const currentSurahNum = getSurahNumberFromPage(currentPage);
  const currentSurahMeta = ALL_SURAHS_META.find((s) => s.number === currentSurahNum);

  // Theme selection
  const handleSelectTheme = (themeKey: string) => {
    setSelectedThemeKey(themeKey);
    localStorage.setItem('hayat_mushaf_theme', themeKey);
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSettingsModal || showSurahModal || showSearchModal) return;
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
  }, [currentPage, isSpread, showSettingsModal, showSurahModal, showSearchModal]);

  // Fetch Page Data & Font
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

  // Touch Gesture Handlers
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

    // Swipe threshold
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && duration < 600) {
      if (deltaX < 0) {
        handleNextPage();
      } else {
        handlePrevPage();
      }
      return;
    }

    // Tap canvas to toggle control bar visibility
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && duration < 350) {
      setShowControls((prev) => !prev);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only toggle if clicked directly on canvas background
    setShowControls((prev) => !prev);
  };

  // Handle Quick Jump Page Input
  const handleQuickPageJump = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(quickJumpInput.trim(), 10);
    if (!isNaN(p) && p >= 1 && p <= 604) {
      setCurrentPage(p);
      setShowSearchModal(false);
      setQuickJumpInput('');
    }
  };

  // Filtered Surahs List for Modal
  const filteredSurahs = ALL_SURAHS_META.filter(
    (s) =>
      s.transliteration.toLowerCase().includes(surahSearchTerm.toLowerCase()) ||
      s.albanianName.toLowerCase().includes(surahSearchTerm.toLowerCase()) ||
      s.number.toString() === surahSearchTerm.trim()
  );

  // Render Single Page
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

    // Identify special lines for Surah headers and Bismillah
    const specialLines: Record<number, { type: 'surah_header'; surahNumber: number } | { type: 'bismillah'; surahNumber: number }> = {};

    data.verses.forEach((verse) => {
      if (verse.verse_number === 1) {
        const sNum = verse.chapter_id;
        const firstWordLine = verse.words?.[0]?.line_number || 1;

        if (sNum === 1) {
          if (firstWordLine > 1) {
            specialLines[firstWordLine - 1] = { type: 'surah_header', surahNumber: 1 };
          } else {
            specialLines[1] = { type: 'surah_header', surahNumber: 1 };
          }
        } else if (sNum === 9) {
          if (firstWordLine > 1) {
            specialLines[firstWordLine - 1] = { type: 'surah_header', surahNumber: 9 };
          } else {
            specialLines[1] = { type: 'surah_header', surahNumber: 9 };
          }
        } else {
          if (firstWordLine >= 3) {
            specialLines[firstWordLine - 2] = { type: 'surah_header', surahNumber: sNum };
            specialLines[firstWordLine - 1] = { type: 'bismillah', surahNumber: sNum };
          } else if (firstWordLine === 2) {
            specialLines[1] = { type: 'surah_header', surahNumber: sNum };
          }
        }
      }
    });

    // Determine the max line, fallback to 15 (standard QCF page length)
    const maxLine = Math.max(
      15,
      ...Object.keys(linesMap).map(n => parseInt(n, 10))
    );
    const sortedLineNumbers = Array.from({ length: maxLine }, (_, i) => i + 1);

    // Vertically center content on opening pages (1 and 2) by shifting empty bottom lines to the top
    const lastContentLine = Math.max(
      ...Object.keys(linesMap).map(Number),
      ...Object.keys(specialLines).map(Number),
      0
    );
    const emptyLinesAtEnd = sortedLineNumbers.filter((l) => l > lastContentLine);
    const shiftCount = (pNum === 1 || pNum === 2) ? Math.floor(emptyLinesAtEnd.length / 2) : 0;
    const linesToShiftToTop = emptyLinesAtEnd.slice(0, shiftCount);

    const firstVerse = data.verses[0];
    const juzNum = firstVerse?.juz_number || 1;
    const hizbNum = firstVerse?.hizb_number || 1;

    return (
      <div
        className={`@container w-full h-full aspect-[1/1.42] max-h-[calc(100dvh-7.5rem)] flex flex-col justify-between p-[3.5%] rounded-2xl sm:rounded-3xl border shadow-xl relative overflow-hidden select-none transition-colors duration-300 ${activeTheme.paperBg} ${activeTheme.paperBorder}`}
      >
        <div className={`absolute inset-2 border rounded-xl pointer-events-none opacity-40 ${activeTheme.paperBorder}`} />

        {/* Traditional Page Header */}
        <div className={`pt-0.5 pb-1 border-b flex justify-between items-center text-[clamp(10px,2.4cqw,13px)] font-serif opacity-85 ${activeTheme.spineColor} ${activeTheme.subtextColor}`}>
          <span className="font-arabic text-[clamp(11px,2.8cqw,15px)] font-semibold">Surja</span>
          <span className="font-mono">Xhuzi {juzNum}</span>
        </div>

        {/* QCF V2 ISOLATED PAGE */}
        <div
          className="qcf-mushaf-page flex-1 flex flex-col justify-between my-auto py-1 min-h-0 overflow-hidden select-none"
        >
          {sortedLineNumbers.map((lineNum) => {
            const isShiftedToTop = linesToShiftToTop.includes(lineNum);
            const orderClass = isShiftedToTop ? 'order-first' : '';

            const special = specialLines[lineNum];
            if (special) {
              if (special.type === 'surah_header') {
                const meta = ALL_SURAHS_META.find((s) => s.number === special.surahNumber);
                const sName = meta?.name ? (meta.name.startsWith('سورة') || meta.name.startsWith('سُورَة') ? meta.name : `سُورَةُ ${meta.name}`) : `سُورَةُ ${special.surahNumber}`;
                return (
                  <div
                    key={`header-${special.surahNumber}-${lineNum}`}
                    className={`flex-1 w-full max-h-[6.5cqw] min-h-[22px] px-[3%] py-[0.5%] rounded-lg sm:rounded-xl border flex items-center justify-between transition-colors shadow-sm select-none ${
                      activeTheme.isDark
                        ? 'bg-amber-950/25 border-amber-500/30 text-amber-200'
                        : 'bg-amber-500/10 border-amber-600/30 text-amber-950'
                    } ${orderClass}`}
                    dir="rtl"
                  >
                    <span className="font-arabic font-bold text-[clamp(11px,3.2cqw,18px)] tracking-wide mx-auto whitespace-nowrap">
                      {sName}
                    </span>
                  </div>
                );
              }
              if (special.type === 'bismillah') {
                return (
                  <div
                    key={`bismillah-${special.surahNumber}-${lineNum}`}
                    className={`flex-1 w-full max-h-[6cqw] min-h-[20px] text-center select-none flex items-center justify-center whitespace-nowrap ${orderClass}`}
                    dir="rtl"
                  >
                    <span className={`font-arabic text-[clamp(13px,3.8cqw,22px)] leading-none whitespace-nowrap ${activeTheme.textColor}`}>
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </span>
                  </div>
                );
              }
            }

            const words = linesMap[lineNum] || [];
            
            // Render spacer if line is empty
            if (words.length === 0) {
                return <div key={`empty-${lineNum}`} className={`flex-1 w-full min-h-[14px] ${orderClass}`} />;
            }

            return (
              <div
                key={lineNum}
                className={`flex-1 w-full flex items-center justify-center gap-x-[1cqw] flex-nowrap whitespace-nowrap overflow-hidden leading-none select-none ${orderClass}`}
                dir="rtl"
              >
                {words.map((w, wIdx) => (
                  <span
                    key={`${w.code_v2}-${wIdx}`}
                    className={`qcf-v2-word text-center inline-flex items-center justify-center whitespace-nowrap transition-colors ${
                      isTajweedActive ? 'hover:text-emerald-600' : ''
                    } ${activeTheme.textColor} ${activeTheme.hoverColor}`}
                    style={{
                      fontFamily: `'${fontName}'`,
                      fontSize: `calc(${fontScale / 100} * clamp(13px, 5.2cqw, 32px))`,
                      lineHeight: 1,
                    }}
                  >
                    {w.code_v2}
                  </span>
                ))}
              </div>
            );
          })}
        </div>

        {/* Page Footer Marker */}
        <div className={`pt-1 mt-0.5 border-t flex justify-between items-center text-[clamp(10px,2.2cqw,12px)] font-mono opacity-80 whitespace-nowrap ${activeTheme.spineColor} ${activeTheme.subtextColor}`}>
          <span className="whitespace-nowrap">Xhuz {juzNum}</span>
          <span className="font-bold text-[clamp(11px,2.8cqw,14px)] whitespace-nowrap">Faqja {pNum}</span>
          <span className="whitespace-nowrap">Hizb {hizbNum}</span>
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
      {/* ----------------- TOP CONTROLS HEADER OVERLAY ----------------- */}
      {showControls && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed top-2 left-2 right-2 sm:top-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-3xl z-50 bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 text-slate-100 rounded-2xl p-2 sm:px-4 sm:py-2.5 shadow-2xl transition-all duration-200 animate-fadeIn flex items-center justify-between text-xs"
        >
          {/* Back Button */}
          <button
            onClick={() => {
              if (onBack) onBack();
              else setShowControls(false);
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition-colors shrink-0"
            title="Kthehu te Kur'ani"
          >
            <ChevronLeft className="w-4 h-4 text-emerald-400" />
            <span className="font-medium hidden xs:inline">Kur'ani</span>
          </button>

          {/* Surah Title Pill -> CLICK OPENS SURAH SELECTION MODAL */}
          <button
            onClick={() => setShowSurahModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold transition-all mx-1 truncate max-w-[200px] xs:max-w-[280px]"
            title="Kliko për të zgjedhur Suren"
          >
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate text-slate-100">
              {currentSurahMeta?.number}. {currentSurahMeta?.transliteration || `Surja ${currentSurahNum}`}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400/80 shrink-0 ml-0.5" />
          </button>

          {/* Right Action Icons: Search & Settings */}
          <div className="flex items-center space-x-1.5 shrink-0">
            {/* Search Button */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-amber-300 transition-colors flex items-center space-x-1"
              title="Kërko Suren apo Faqen"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline font-medium text-xs">Kërko</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-amber-300 transition-colors flex items-center space-x-1.5"
              title="Cilësimet"
            >
              <Settings className="w-4 h-4 text-slate-300" />
              <span className="hidden sm:inline font-medium text-xs">Cilësimet</span>
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
          <div className="w-full h-full max-w-5xl max-h-[calc(100dvh-7.5rem)] flex items-center justify-center gap-1 sm:gap-2">
            {/* 2-page spread */}
            {isSpread && secondPageData && (
              <div className="flex-1 h-full max-w-[min(50%,calc((100dvh-7.5rem)/1.42))] aspect-[1/1.42] flex items-center justify-center hidden sm:flex">
                {renderPageLines(secondPageData, secondFontFamily, currentPage + 1)}
              </div>
            )}

            {/* Primary Page */}
            <div className={`flex-1 h-full ${isSpread ? 'max-w-[min(50%,calc((100dvh-7.5rem)/1.42))]' : 'max-w-[min(100%,calc((100dvh-7.5rem)/1.42))]'} aspect-[1/1.42] flex items-center justify-center`}>
              {renderPageLines(pageData, fontFamily, currentPage)}
            </div>
          </div>
        )}
      </div>

      {/* ----------------- BOTTOM CONTROLS FOOTER OVERLAY ----------------- */}
      {showControls && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed bottom-3 left-3 right-3 sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-50 bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 text-slate-100 rounded-full px-4 py-2 shadow-2xl transition-all duration-200 animate-fadeIn flex items-center justify-between text-xs"
        >
          {/* Previous Page Button */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || loading}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/60 disabled:opacity-30 transition-all font-medium"
            title="Faqja e Mëparshme"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Para</span>
          </button>

          {/* Page Counter & Direct Jump */}
          <button
            onClick={() => setShowNavigationModal(true)}
            className="flex items-center space-x-2 font-mono text-xs px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 text-amber-300 font-bold transition-colors"
            title="Kliko për navigim"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Faqja {currentPage}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">604</span>
          </button>

          {/* Next Page Button */}
          <button
            onClick={handleNextPage}
            disabled={currentPage >= 604 || loading}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/60 disabled:opacity-30 transition-all font-medium"
            title="Faqja Tjetër"
          >
            <span>Tjetra</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SURAH SELECTION MODAL */}
      {/* ========================================================================= */}
      {showSurahModal && (
        <div
          onClick={() => setShowSurahModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[85vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Lista e Sureve (114)</h3>
                  <p className="text-[11px] text-slate-400">Zgjidh suren për të hapur faqen e saj në Mushaf</p>
                </div>
              </div>

              <button
                onClick={() => setShowSurahModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={surahSearchTerm}
                onChange={(e) => setSurahSearchTerm(e.target.value)}
                placeholder="Kërko suren sipas emrit ose numrit..."
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 pl-9 pr-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none"
                autoFocus
              />
              {surahSearchTerm && (
                <button
                  onClick={() => setSurahSearchTerm('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Scrollable Surahs Grid/List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800/50">
              {filteredSurahs.map((s) => {
                const startPage = SURAH_START_PAGES[s.number] || 1;
                const isCurrentSurah = s.number === currentSurahNum;

                return (
                  <div
                    key={s.number}
                    onClick={() => {
                      setCurrentPage(startPage);
                      setShowSurahModal(false);
                      setSurahSearchTerm('');
                    }}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                      isCurrentSurah
                        ? 'bg-amber-500/15 border border-amber-500/50 text-amber-300 font-bold'
                        : 'hover:bg-slate-800/80 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs ${
                          isCurrentSurah
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-950 border border-slate-800 text-slate-400'
                        }`}
                      >
                        {s.number}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">{s.transliteration}</h4>
                        <p className="text-[10px] text-slate-400">
                          {s.albanianName} • {s.numberOfAyahs} Ajete
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-arabic text-sm text-amber-300 block">{s.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Faqja {startPage}</span>
                    </div>
                  </div>
                );
              })}
              {filteredSurahs.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500">
                  Nuk u gjet asnjë sure me këtë kërkim.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. QUICK SEARCH / JUMP MODAL */}
      {/* ========================================================================= */}
      {showSearchModal && (
        <div
          onClick={() => setShowSearchModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-5 shadow-2xl space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">Kërko & Shko tek Faqja</h3>
              </div>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Page Number Input */}
            <form onSubmit={handleQuickPageJump} className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Shkruaj numrin e faqes (1 deri 604):
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min={1}
                  max={604}
                  value={quickJumpInput}
                  onChange={(e) => setQuickJumpInput(e.target.value)}
                  placeholder="nr. 1 - 604"
                  className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-100 px-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none font-mono"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Shko
                </button>
              </div>
            </form>

            {/* Quick Jump Shortcuts */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Sugjerime të Shpejta:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setCurrentPage(1);
                    setShowSearchModal(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-300 text-left"
                >
                  <span className="font-bold block text-slate-100">1. Al-Fatihah</span>
                  <span className="text-[10px] text-amber-400 font-mono">Faqja 1</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentPage(2);
                    setShowSearchModal(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-300 text-left"
                >
                  <span className="font-bold block text-slate-100">2. Al-Baqarah</span>
                  <span className="text-[10px] text-amber-400 font-mono">Faqja 2</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentPage(440);
                    setShowSearchModal(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-300 text-left"
                >
                  <span className="font-bold block text-slate-100">36. Ya-Sin</span>
                  <span className="text-[10px] text-amber-400 font-mono">Faqja 440</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentPage(582);
                    setShowSearchModal(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-300 text-left"
                >
                  <span className="font-bold block text-slate-100">Xhuzi 30 (Amme)</span>
                  <span className="text-[10px] text-amber-400 font-mono">Faqja 582</span>
                </button>
              </div>
            </div>

            {/* Open Full Surah List */}
            <button
              onClick={() => {
                setShowSearchModal(false);
                setShowSurahModal(true);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Shfletoni të gjitha 114 Suret</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SETTINGS MODAL / DRAWER OVERLAY */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div
          onClick={() => setShowSettingsModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
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
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Reading Mode Switcher */}
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
                  <span>Varg pas Vargu</span>
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

      {/* ========================================================================= */}
      {/* 4. MUSHAF NAVIGATION MODAL */}
      {/* ========================================================================= */}
      {showNavigationModal && (
        <div
          onClick={() => setShowNavigationModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md bg-slate-900 border-t sm:border border-slate-800 text-slate-100 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] transition-transform transform translate-y-0"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <Compass className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100">Shko te Mushafi</h3>
              </div>
              <button
                onClick={() => setShowNavigationModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-4 bg-slate-950 p-1 rounded-xl">
              <button
                onClick={() => setNavTab('faqe')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${navTab === 'faqe' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Faqe
              </button>
              <button
                onClick={() => setNavTab('sure')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${navTab === 'sure' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Sure
              </button>
              <button
                onClick={() => setNavTab('xhuz')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${navTab === 'xhuz' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Xhuz
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto pr-1">
              {navTab === 'faqe' && (
                <div className="space-y-4 pt-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Shkruaj numrin e faqes (1 - 604):
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
                    placeholder="P.sh. 12"
                    className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-100 px-4 py-3 rounded-xl focus:border-amber-500 focus:outline-none font-mono"
                  />
                  {navFaqeError && <p className="text-xs text-rose-400">{navFaqeError}</p>}
                  <button
                    onClick={() => {
                      const p = parseInt(navFaqeInput.trim(), 10);
                      if (isNaN(p) || p < 1 || p > 604) {
                        setNavFaqeError('Ju lutem shkruani një numër faqeje të vlefshëm nga 1 deri në 604.');
                      } else {
                        setCurrentPage(p);
                        setShowNavigationModal(false);
                      }
                    }}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-colors"
                  >
                    Hape faqen
                  </button>
                </div>
              )}

              {navTab === 'sure' && (
                <div className="space-y-3 flex flex-col h-full">
                  <div className="relative shrink-0">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={navSureSearch}
                      onChange={(e) => setNavSureSearch(e.target.value)}
                      placeholder="Kërko suren..."
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 pl-9 pr-3 py-2.5 rounded-xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1.5 divide-y divide-slate-800/50">
                    {ALL_SURAHS_META.filter(s =>
                      s.transliteration.toLowerCase().includes(navSureSearch.toLowerCase()) ||
                      s.albanianName.toLowerCase().includes(navSureSearch.toLowerCase()) ||
                      s.number.toString() === navSureSearch.trim()
                    ).map(s => (
                      <button
                        key={s.number}
                        onClick={() => {
                          setCurrentPage(SURAH_START_PAGES[s.number] || 1);
                          setShowNavigationModal(false);
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800/80 text-slate-200 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-xs text-slate-400">
                            {s.number}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-100">{s.transliteration}</h4>
                            <p className="text-[10px] text-slate-400">{s.albanianName}</p>
                          </div>
                        </div>
                        <div className="text-[10px] text-amber-400 font-mono">Faqja {SURAH_START_PAGES[s.number]}</div>
                      </button>
                    ))}
                    {ALL_SURAHS_META.filter(s =>
                      s.transliteration.toLowerCase().includes(navSureSearch.toLowerCase()) ||
                      s.albanianName.toLowerCase().includes(navSureSearch.toLowerCase()) ||
                      s.number.toString() === navSureSearch.trim()
                    ).length === 0 && (
                      <div className="text-center py-6 text-xs text-slate-500">
                        Nuk u gjet asnjë sure.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {navTab === 'xhuz' && (
                <div className="grid grid-cols-3 gap-2 pb-2">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
                    <button
                      key={j}
                      onClick={() => {
                        setCurrentPage(JUZ_START_PAGES[j] || 1);
                        setShowNavigationModal(false);
                      }}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800 text-slate-300 flex flex-col items-center justify-center space-y-1 transition-colors"
                    >
                      <span className="font-bold text-xs text-slate-100">Xhuzi {j}</span>
                      <span className="text-[10px] text-amber-400 font-mono">Faqja {JUZ_START_PAGES[j]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
