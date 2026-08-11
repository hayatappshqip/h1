import React, { useState, useEffect, useRef, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { 
  Play, Pause, SkipBack, SkipForward, Maximize, Minimize, X, Bookmark, 
  ZoomIn, ZoomOut, Maximize2, Layers, BookOpen, Moon, Sun, Search, Check, Volume2 
} from 'lucide-react';

// Quran Surahs Index Metadata for Quick Jump
const SURAH_INDEX = [
  { number: 1, nameAr: 'الفَاتِحَةِ', nameSq: 'El-Fatiha', page: 1, type: 'Meqase', verses: 7 },
  { number: 2, nameAr: 'البَقَرَةِ', nameSq: 'El-Bekare', page: 2, type: 'Medinase', verses: 286 },
  { number: 3, nameAr: 'آلِ عِمْرَانَ', nameSq: 'Ali Imran', page: 50, type: 'Medinase', verses: 200 },
  { number: 4, nameAr: 'النِّسَاءِ', nameSq: 'En-Nisa', page: 77, type: 'Medinase', verses: 176 },
  { number: 5, nameAr: 'المَائِدَةِ', nameSq: 'El-Maide', page: 106, type: 'Medinase', verses: 120 },
  { number: 6, nameAr: 'الأَنْعَامِ', nameSq: 'El-En\'am', page: 128, type: 'Meqase', verses: 165 },
  { number: 36, nameAr: 'يس', nameSq: 'Ja-Sin', page: 440, type: 'Meqase', verses: 83 },
  { number: 67, nameAr: 'المُلْكِ', nameSq: 'El-Mulk', page: 562, type: 'Meqase', verses: 30 },
  { number: 112, nameAr: 'الإِخْلَاصِ', nameSq: 'El-Ihlas', page: 604, type: 'Meqase', verses: 4 },
  { number: 113, nameAr: 'الفَلَقِ', nameSq: 'El-Felek', page: 604, type: 'Meqase', verses: 5 },
  { number: 114, nameAr: 'النَّاسِ', nameSq: 'En-Nas', page: 604, type: 'Meqase', verses: 6 },
];

const JUZ_INDEX = Array.from({ length: 30 }, (_, i) => ({
  juzNumber: i + 1,
  nameAr: `الجُزْءُ ${['الأَوَّلُ', 'الثَّانِي', 'الثَّالِثُ', 'الرَّابِعُ', 'الخَامِسُ', 'السَّادِسُ', 'السَّابِعُ', 'الثَّامِنُ', 'التَّاسِعُ', 'العَاشِرُ'][i] || (i + 1)}`,
  page: i === 0 ? 1 : Math.min(604, Math.round(i * 20.1) + 2)
}));

// Medina 15-Lines Uthmanic Content
const MUSHAF_PAGES_TEXT: Record<number, { surah: string; juz: string; lines: string[] }> = {
  1: {
    surah: "سُورَةُ الفَاتِحَةِ",
    juz: "الجُزْءُ الأَوَّلُ",
    lines: [
      "بِسْمِ اللهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿١﴾",
      "الرَّحْمَٰنِ الرَّحِيمِ ﴿٢﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٣﴾",
      "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٤﴾",
      "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٥﴾",
      "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ ﴿٦﴾",
      "غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾"
    ]
  },
  2: {
    surah: "سُورَةُ البَقَرَةِ",
    juz: "الجُزْءُ الأَوَّلُ",
    lines: [
      "بِسْمِ اللهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "الم ﴿١﴾ ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ ﴿٢﴾",
      "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ ﴿٣﴾",
      "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ",
      "وَبِالْآخِرَةِ هُمْ يُوقِنُونَ ﴿٤﴾",
      "أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ ﴿٥﴾"
    ]
  },
  3: {
    surah: "سُورَةُ البَقَرَةِ",
    juz: "الجُزْءُ الأَوَّلُ",
    lines: [
      "إِنَّ الَّذِينَ كَفَرُوا سَوَاءٌ عَلَيْهِمْ أَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ ﴿٦﴾",
      "خَتَمَ اللَّهُ عَلَىٰ قُلُوبِهِمْ وَعَلَىٰ سَمْعِهِمْ ۖ وَعَلَىٰ أَبْصَارِهِمْ غِشَاوَةٌ ۖ وَلَهُمْ عَذَابٌ عَظِيمٌ ﴿٧﴾",
      "وَمِنَ النَّاسِ مَن يَقُولُ آمَنَّا بِاللَّهِ وَبِالْآخِرَةِ وَمَا هُم بِمُؤْمِنِينَ ﴿٨﴾",
      "يُخَادِعُونَ اللَّهَ وَالَّذِينَ آمَنُوا وَمَا يَخْدَعُونَ إِلَّا أَنفُسَهُمْ وَمَا يَشْعُرُونَ ﴿٩﴾",
      "فِي قُلُوبِهِم مَّرَضٌ فَزَادَهُمُ اللَّهُ مَرَضًا ۖ وَلَهُمْ عَذَابٌ أَلِيمٌ بِمَا كَانُوا يَكْذِبُونَ ﴿١٠﴾",
      "وَإِذَا قِيلَ لَهُمْ لَا تُفْسِدُوا فِي الْأَرْضِ قَالُوا إِنَّمَا نَحْنُ مُصْلِحُونَ ﴿١١﴾",
      "أَلَا إِنَّهُمْ هُمُ الْمُفْسِدُونَ وَلَٰكِن لَّا يَشْعُرُونَ ﴿١٢﴾"
    ]
  },
  4: {
    surah: "سُورَةُ البَقَرَةِ",
    juz: "الجُزْءُ الأَوَّلُ",
    lines: [
      "مَثَلُهُمْ كَمَثَلِ الَّذِي اسْتَوْقَدَ نَارًا فَلَمَّا أَضَاءَتْ مَا حَوْلَهُ ذَهَبَ اللَّهُ بِنُورِهِمْ ﴿١٧﴾",
      "صُمٌّ بُكْمٌ عُمْيٌ فَهُمْ لَا يَرْجِعُونَ ﴿١٨﴾ أَوْ كَصَيِّبٍ مِّنَ السَّمَاءِ فِيهِ ظُلُمَاتٌ وَرَعْدٌ وَبَرْقٌ",
      "يَجْعَلُونَ أَصَابِعَهُمْ فِي آذَانِهِم مِّنَ الصَّوَاعِقِ حَذَرَ الْمَوْتِ ۚ وَاللَّهُ مُحِيطٌ بِالْكَافِرِينَ ﴿١٩﴾",
      "يَكَادُ الْبَرْقُ يَخْطَفُ أَبْصَارَهُمْ ۖ كُلَّمَا أَضَاءَ لَهُم مَّشَوْا فِيهِ وَإِذَا أَظْلَمَ عَلَيْهِمْ قَامُوا ﴿٢٠﴾",
      "يَا أَيُّهَا النَّاسُ اعْبُدُوا رَبَّكُمُ الَّذِي خَلَقَكُمْ وَالَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ ﴿٢١﴾",
      "الَّذِي جَعَلَ لَكُمُ الْأَرْضَ فِرَاشًا وَالسَّمَاءَ بِنَاءً وَأَنزَلَ مِنَ السَّمَاءِ مَاءً ﴿٢٢﴾",
      "فَإِن لَّمْ تَفْعَلُوا وَلَن تَفْعَلُوا فَاتَّقُوا النَّارَ الَّتِي وَقُودُهَا النَّاسُ وَالْحِجَارَةُ ﴿٢٤﴾"
    ]
  },
  5: {
    surah: "سُورَةُ البَقَرَةِ",
    juz: "الجُزْءُ الأَوَّلُ",
    lines: [
      "وَبَشِّرِ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ أَنَّ لَهُمْ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ ﴿٢٥﴾",
      "إِنَّ اللَّهَ لَا يَسْتَحْيِي أَن يَضْرِبَ مَثَلًا مَّا بَعُوضَةً فَمَا فَوْقَهَا ۚ فَأَمَّا الَّذِينَ آمَنُوا ﴿٢٦﴾",
      "الَّذِينَ يَنقُضُونَ عَهْدَ اللَّهِ مِن بَعْدِ مِيثَاقِهِ وَيَقْطَعُونَ مَا أَمَرَ اللَّهُ بِهِ أَن يُوصَلَ ﴿٢٧﴾",
      "كَيْفَ تَكْفُرُونَ بِاللَّهِ وَكُنتُمْ أَمْوَاتًا فَأَحْيَاكُمْ ۖ ثُمَّ يُمِيتُكُمْ ثُمَّ يُحْيِيكُمْ ﴿٢٨﴾",
      "هُوَ الَّذِي خَلَقَ لَكُم مَّا فِي الْأَرْضِ جَمِيعًا ثُمَّ اسْتَوَىٰ إِلَى السَّمَاءِ فَسَوَّاهُنَّ سَبْعَ سَمَاوَاتٍ ﴿٢٩﴾"
    ]
  }
};

type ReaderTheme = 'parchment' | 'night' | 'white';

interface PageProps {
  number: number;
  theme: ReaderTheme;
  isBookmarked?: boolean;
}

const Page = forwardRef<HTMLDivElement, PageProps>(({ number, theme, isBookmarked }, ref) => {
  const pageTextData = MUSHAF_PAGES_TEXT[number] || MUSHAF_PAGES_TEXT[1];

  // Theme styles
  const isNight = theme === 'night';
  const isWhite = theme === 'white';

  const containerBg = isNight ? 'bg-[#0f172a]' : isWhite ? 'bg-white' : 'bg-[#FAF7EE]';
  const outerBorder = isNight ? 'border-amber-500/40' : isWhite ? 'border-emerald-700/30' : 'border-amber-800/40';
  const innerBorder = isNight ? 'border-amber-500/30' : isWhite ? 'border-emerald-600/20' : 'border-amber-700/30';
  const headerBorder = isNight ? 'border-amber-500/20 text-amber-200/90' : 'border-amber-900/20 text-amber-950/80';
  const textColor = isNight ? 'text-slate-100' : 'text-amber-950';
  const numberColor = isNight ? 'text-amber-400' : 'text-amber-900';

  return (
    <div 
      ref={ref} 
      className={`page ${containerBg} shadow-2xl border relative select-none flex flex-col justify-between overflow-hidden transition-colors duration-300`} 
      style={{ width: '100%', height: '100%', minHeight: '420px' }}
    >
      {/* Golden Bookmark Ribbon Marker if bookmarked */}
      {isBookmarked && (
        <div className="absolute top-0 right-8 z-30 w-6 h-12 bg-amber-500 shadow-md flex items-end justify-center pb-1 clip-ribbon">
          <Bookmark size={14} className="text-slate-950 fill-slate-950" />
        </div>
      )}

      {/* Decorative Traditional Islamic Frame */}
      <div className={`absolute inset-2 border-2 ${outerBorder} rounded-sm pointer-events-none p-1`}>
        <div className={`w-full h-full border ${innerBorder} rounded-xs`}></div>
      </div>

      {/* High-Resolution Native Uthmanic Hafs Medina Page Layout */}
      <div className={`relative z-10 p-5 sm:p-7 flex-1 flex flex-col justify-between ${textColor} font-arabic`} dir="rtl">
        {/* Top Header Row */}
        <div className={`flex justify-between items-center text-[12px] sm:text-xs font-bold border-b pb-2 px-2 ${headerBorder}`}>
          <span>{pageTextData.juz}</span>
          <span className="font-extrabold">{pageTextData.surah}</span>
        </div>

        {/* Surah Banner Header if page starts a Surah */}
        {number === 1 && (
          <div className={`my-2 py-2 rounded-md text-center shadow-sm border-2 ${
            isNight 
              ? 'bg-amber-950/60 border-amber-500/50 text-amber-200' 
              : 'bg-gradient-to-r from-amber-100 via-amber-200/90 to-amber-100 border-amber-800/50 text-amber-950'
          }`}>
            <h3 className="text-lg sm:text-xl font-extrabold tracking-wide">سُورَةُ الفَاتِحَةِ</h3>
            <p className="text-[11px] font-sans font-medium opacity-80">مكّيّة • آياتُها ٧</p>
          </div>
        )}
        {number === 2 && (
          <div className={`my-2 py-2 rounded-md text-center shadow-sm border-2 ${
            isNight 
              ? 'bg-amber-950/60 border-amber-500/50 text-amber-200' 
              : 'bg-gradient-to-r from-amber-100 via-amber-200/90 to-amber-100 border-amber-800/50 text-amber-950'
          }`}>
            <h3 className="text-lg sm:text-xl font-extrabold tracking-wide">سُورَةُ البَقَرَةِ</h3>
            <p className="text-[11px] font-sans font-medium opacity-80">مدنيّة • آياتُها ٢٨٦</p>
          </div>
        )}

        {/* 15 Lines Text Body with Uthmanic Hafs Script */}
        <div className={`my-auto py-3 space-y-2.5 sm:space-y-3.5 text-center leading-[2.5] text-base sm:text-lg md:text-xl tracking-wide font-arabic font-bold ${textColor}`} dir="rtl">
          {pageTextData.lines.map((line, idx) => (
            <p key={idx} className="leading-loose drop-shadow-[0_0.5px_0.5px_rgba(0,0,0,0.05)]">
              {line}
            </p>
          ))}
        </div>

        {/* Bottom Page Number Emblem */}
        <div className={`text-center pt-2 border-t text-xs font-extrabold font-mono ${headerBorder} ${numberColor}`}>
          {number}
        </div>
      </div>
    </div>
  );
});

Page.displayName = 'Page';

interface MushafReaderProps {
  initialPage: number;
  onPageChange: (page: number) => void;
  onClose: () => void;
}

export const MushafReader: React.FC<MushafReaderProps> = ({
  initialPage,
  onPageChange,
  onClose,
}) => {
  const [scale, setScale] = useState(1.5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageInput, setPageInput] = useState(initialPage.toString());
  const [theme, setTheme] = useState<ReaderTheme>('parchment');
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [indexTab, setIndexTab] = useState<'surahs' | 'juz' | 'bookmarks'>('surahs');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<number[]>([1]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const flipBookRef = useRef<any>(null);
  const numPages = 5;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        flipBookRef.current?.pageFlip().flipNext();
      } else if (e.key === 'ArrowRight') {
        flipBookRef.current?.pageFlip().flipPrev();
      } else if (e.key === 'Escape') {
        if (isIndexOpen) setIsIndexOpen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isIndexOpen, onClose]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      setIsFullscreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    const elem = containerRef.current as any;
    const doc = document as any;
    if (!elem) return;

    const isFull = !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);

    if (!isFull) {
      if (typeof elem.requestFullscreen === 'function') {
        elem.requestFullscreen().catch(() => {});
      } else if (typeof elem.webkitRequestFullscreen === 'function') {
        elem.webkitRequestFullscreen();
      } else {
        setIsFullscreen(prev => !prev);
      }
    } else {
      if (typeof doc.exitFullscreen === 'function') {
        doc.exitFullscreen().catch(() => {});
      } else if (typeof doc.webkitExitFullscreen === 'function') {
        doc.webkitExitFullscreen();
      } else {
        setIsFullscreen(false);
      }
    }
  };

  const handleFlip = (e: any) => {
    const pageIndex = e.data + 1;
    setCurrentPage(pageIndex);
    setPageInput(pageIndex.toString());
    onPageChange(pageIndex);
  };

  const goToPage = (page: number) => {
    const target = Math.max(1, Math.min(page, numPages));
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().turnToPage(target - 1);
      setCurrentPage(target);
      setPageInput(target.toString());
      onPageChange(target);
    }
    setIsIndexOpen(false);
  };

  const toggleBookmark = () => {
    setBookmarks(prev => 
      prev.includes(currentPage) 
        ? prev.filter(p => p !== currentPage) 
        : [...prev, currentPage]
    );
  };

  const isPortrait = typeof window !== 'undefined' && window.innerHeight > window.innerWidth;
  const width = isPortrait ? window.innerWidth : Math.min(window.innerWidth / 2, 580);
  const height = typeof window !== 'undefined' ? window.innerHeight : 800;

  const isCurrentBookmarked = bookmarks.includes(currentPage);

  const filteredSurahs = SURAH_INDEX.filter(s => 
    s.nameSq.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.nameAr.includes(searchQuery) ||
    s.number.toString() === searchQuery
  );

  return (
    <div 
      ref={containerRef} 
      className={`fixed inset-0 ${theme === 'night' ? 'bg-slate-950' : 'bg-slate-900'} z-50 flex flex-col justify-center items-center overflow-hidden touch-none transition-colors duration-300`}
      onClick={() => setControlsVisible(!controlsVisible)}
    >
      {/* Top Header Navigation Bar (QuranFlash Style) */}
      <div 
        className={`absolute top-0 inset-x-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-3 flex flex-col sm:flex-row items-center justify-between transition-transform duration-300 z-30 space-y-2.5 sm:space-y-0 ${controlsVisible ? 'translate-y-0' : '-translate-y-full'}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center space-x-2">
            <button aria-label="Mbull" onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors">
              <X size={18} />
            </button>
            
            {/* Quick Index Drawer Trigger */}
            <button 
              onClick={() => setIsIndexOpen(true)}
              className="flex items-center space-x-2 bg-emerald-900/70 hover:bg-emerald-800 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <BookOpen size={16} />
              <span>Kapaku / Surot</span>
            </button>
          </div>

          <div className="text-right sm:text-left">
            <h2 className="font-bold text-xs sm:text-sm text-emerald-400 flex items-center space-x-1">
              <span>Mushafi i Medinës</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono">15 Rreshta</span>
            </h2>
            <p className="text-[11px] text-slate-400">Faqja {currentPage} nga {numPages}</p>
          </div>
        </div>
        
        {/* Toolbar controls */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {/* Theme mode toggles */}
          <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
            <button 
              title="Karta (Medina Parchment)" 
              onClick={() => setTheme('parchment')} 
              className={`p-1.5 rounded-md text-xs font-bold transition-all ${theme === 'parchment' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Karta
            </button>
            <button 
              title="Mënyra e Natës" 
              onClick={() => setTheme('night')} 
              className={`p-1.5 rounded-md text-xs font-bold transition-all ${theme === 'night' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <Moon size={14} />
            </button>
            <button 
              title="E bardhë" 
              onClick={() => setTheme('white')} 
              className={`p-1.5 rounded-md text-xs font-bold transition-all ${theme === 'white' ? 'bg-slate-200 text-slate-900 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <Sun size={14} />
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 mx-1"></div>

          <button aria-label="Zmadho" onClick={() => setScale(s => Math.min(s + 0.2, 2.5))} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-colors">
            <ZoomIn size={16} />
          </button>
          <button aria-label="Zvogëlo" onClick={() => setScale(s => Math.max(s - 0.2, 0.8))} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-colors">
            <ZoomOut size={16} />
          </button>
          <button aria-label="Fullscreen" onClick={toggleFullscreen} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-colors">
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>

          {/* Bookmark Button */}
          <button 
            aria-label="Bookmark" 
            onClick={toggleBookmark} 
            className={`p-2 rounded-full transition-colors ${
              isCurrentBookmarked 
                ? 'bg-amber-500 text-slate-950' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Bookmark size={16} className={isCurrentBookmarked ? 'fill-slate-950' : ''} />
          </button>

          <button 
            aria-label="Kthehu te ajetet" 
            onClick={onClose} 
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold ml-1 shadow-sm transition-transform active:scale-95"
          >
            <Layers size={14} />
            <span>Ajetet</span>
          </button>
        </div>
      </div>

      {/* Main QuranFlash 3D Page Flipbook Canvas */}
      <div className="flex-1 w-full h-full flex items-center justify-center relative p-2 md:p-6" onClick={e => e.stopPropagation()}>
        <HTMLFlipBook 
          width={width - (isPortrait ? 16 : 40)} 
          height={height - (controlsVisible ? 140 : 20)}
          size="stretch"
          minWidth={280}
          maxWidth={800}
          minHeight={380}
          maxHeight={1200}
          showCover={false}
          mobileScrollSupport={true}
          startPage={Math.max(0, Math.min(initialPage - 1, numPages - 1))}
          onFlip={handleFlip}
          usePortrait={isPortrait}
          className="flip-book shadow-2xl rounded-lg"
          style={{ margin: '0 auto' }}
          ref={flipBookRef}
          startZIndex={0}
          drawShadow={true}
          flippingTime={700}
          useMouseEvents={true}
          swipeDistance={25}
          showPageCorners={true}
          disableFlipByClick={false}
        >
          {Array.from({ length: numPages }, (_, i) => (
            <Page key={i} number={i + 1} theme={theme} isBookmarked={bookmarks.includes(i + 1)} />
          ))}
        </HTMLFlipBook>
      </div>

      {/* Bottom Control Bar & Audio Player (QuranFlash Reader Navigation) */}
      <div 
        className={`absolute bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-3 flex items-center justify-between transition-transform duration-300 z-30 ${controlsVisible ? 'translate-y-0' : 'translate-y-full'}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2">
          <button 
            aria-label="Faqja e mëparshme" 
            onClick={() => flipBookRef.current?.pageFlip().flipPrev()} 
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <SkipBack size={16} />
            <span className="hidden sm:inline">Prapa</span>
          </button>
        </div>
        
        {/* Audio Reciter Trigger & Fast Page Jump */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
            className={`w-10 h-10 flex items-center justify-center rounded-full shadow-lg text-white transition-all active:scale-95 ${
              isPlayingAudio ? 'bg-amber-600 hover:bg-amber-500 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
            title="Dëgjo leximin e faqes"
          >
            {isPlayingAudio ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>

          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden text-xs">
            <span className="px-2.5 text-slate-400 font-medium">Faqja</span>
            <input 
              type="number" 
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  goToPage(parseInt(pageInput, 10));
                }
              }}
              className="w-10 bg-slate-950 text-emerald-400 font-bold text-center py-1 outline-none appearance-none border-x border-slate-700/80"
            />
            <span className="px-2.5 text-slate-400 font-medium">/ {numPages}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            aria-label="Faqja tjetër" 
            onClick={() => flipBookRef.current?.pageFlip().flipNext()} 
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <span className="hidden sm:inline">Para</span>
            <SkipForward size={16} />
          </button>
        </div>
      </div>

      {/* Quran Index Overlay Drawer (Surot & Xhuzet - QuranFlash Style) */}
      {isIndexOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsIndexOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen size={20} className="text-emerald-400" />
                <h3 className="font-bold text-slate-200 text-base">Indeksi i Kuranit (Mushaf)</h3>
              </div>
              <button 
                onClick={() => setIsIndexOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2">
              <button 
                onClick={() => setIndexTab('surahs')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  indexTab === 'surahs' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Surot (114)
              </button>
              <button 
                onClick={() => setIndexTab('juz')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  indexTab === 'juz' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Xhuzet (30)
              </button>
              <button 
                onClick={() => setIndexTab('bookmarks')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  indexTab === 'bookmarks' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Faqet e Ruajtura ({bookmarks.length})
              </button>
            </div>

            {/* Search Input for Surahs */}
            {indexTab === 'surahs' && (
              <div className="p-3 border-b border-slate-800/80 bg-slate-900">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Kërko suren sipas emrit ose numrit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {indexTab === 'surahs' && (
                <div className="space-y-1.5">
                  {filteredSurahs.map(surah => (
                    <button
                      key={surah.number}
                      onClick={() => goToPage(surah.page)}
                      className="w-full p-3 bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 rounded-xl flex items-center justify-between text-left transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-7 h-7 bg-emerald-950 border border-emerald-800/80 text-emerald-400 font-mono text-xs font-bold rounded-lg flex items-center justify-center">
                          {surah.number}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-slate-200">{surah.nameSq}</p>
                          <p className="text-[11px] text-slate-400">{surah.type} • {surah.verses} ajete</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-arabic font-bold text-base text-amber-400" dir="rtl">{surah.nameAr}</p>
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                          Faqja {surah.page}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {indexTab === 'juz' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {JUZ_INDEX.map(juz => (
                    <button
                      key={juz.juzNumber}
                      onClick={() => goToPage(juz.page)}
                      className="p-3 bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 rounded-xl flex items-center justify-between text-left transition-all"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-200">Xhuzi {juz.juzNumber}</p>
                        <p className="text-[10px] text-emerald-400">Faqja {juz.page}</p>
                      </div>
                      <span className="font-arabic font-bold text-sm text-amber-400" dir="rtl">
                        {juz.nameAr}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {indexTab === 'bookmarks' && (
                <div className="space-y-2">
                  {bookmarks.length === 0 ? (
                    <p className="text-center text-xs text-slate-500 py-8">Nuk keni asnjë faqe të ruajtur.</p>
                  ) : (
                    bookmarks.map(page => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className="w-full p-3 bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 rounded-xl flex items-center justify-between transition-all"
                      >
                        <div className="flex items-center space-x-2">
                          <Bookmark size={16} className="text-amber-400 fill-amber-400" />
                          <span className="font-bold text-sm text-slate-200">Faqja {page}</span>
                        </div>
                        <span className="text-xs text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
                          Këce te faqja
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


