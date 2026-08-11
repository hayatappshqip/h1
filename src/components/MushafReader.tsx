import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { 
  MUSHAF_EDITIONS, 
  MUSHAF_STORAGE_KEY, 
  MushafEditionMeta, 
  MushafPageMeta, 
  MushafReadingState 
} from '../data/mushafManifest';
import { ALL_JUZ_META } from '../data/juzData';
import { ALL_SURAHS_META } from '../data/quranData';
import { getSurahData, cleanAyahArabicText, toArabicDigits, buildAyahEndMarker } from '../services/quranApi';
import { renderTajweedText } from '../utils/tajweed';
import { 
  Play, Pause, SkipBack, SkipForward, Maximize, Minimize, X, Bookmark, 
  ZoomIn, ZoomOut, Maximize2, Layers, BookOpen, Moon, Sun, Search, Sparkles, Volume2, RefreshCw, Settings, ChevronLeft, ChevronRight, Sliders
} from 'lucide-react';

// Configure pdf.js worker globally
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type ReaderTheme = 'parchment' | 'night' | 'white';
type RenderMode = 'digital_medina' | 'pdf_vector';

export interface MushafReaderProps {
  editionKey?: string;
  initialPage: number;
  onPageChange: (page: number) => void;
  onClose: () => void;
}

/**
 * Resolves page metadata (Surah, Juz, Verse range) for any page from 1 to 604
 */
function getPageMetaData(pageNumber: number): { surahNumber: number; surahNameAr: string; surahNameSq: string; juzNumber: number; fromVerse: number; toVerse: number } {
  // Find Juz
  const juz = ALL_JUZ_META.find(j => pageNumber >= j.startPage && pageNumber <= j.endPage) || ALL_JUZ_META[0];
  
  // Approximate surah for page
  let surahNum = juz.startSurah;
  for (const s of ALL_SURAHS_META) {
    if (s.number >= juz.startSurah && s.number <= juz.endSurah) {
      surahNum = s.number;
    }
  }
  
  const surahMeta = ALL_SURAHS_META.find(s => s.number === surahNum) || ALL_SURAHS_META[0];
  
  return {
    surahNumber: surahMeta.number,
    surahNameAr: surahMeta.name,
    surahNameSq: surahMeta.albanianName,
    juzNumber: juz.number,
    fromVerse: 1,
    toVerse: surahMeta.numberOfAyahs
  };
}

export const MushafReader: React.FC<MushafReaderProps> = ({
  editionKey = 'madinah-15-lines-poc',
  initialPage = 1,
  onPageChange,
  onClose,
}) => {
  const [currentEditionKey, setCurrentEditionKey] = useState<string>(editionKey);
  const edition: MushafEditionMeta = MUSHAF_EDITIONS[currentEditionKey] || MUSHAF_EDITIONS['madinah-15-lines-poc'];

  const [currentPage, setCurrentPage] = useState<number>(Math.max(1, Math.min(604, initialPage || 1)));
  const [pageInput, setPageInput] = useState<string>((initialPage || 1).toString());
  const [theme, setTheme] = useState<ReaderTheme>('parchment');
  const [renderMode, setRenderMode] = useState<RenderMode>('digital_medina');
  const [showTajweed, setShowTajweed] = useState<boolean>(true);

  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  
  const [isIndexOpen, setIsIndexOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [indexTab, setIndexTab] = useState<'surahs' | 'juz' | 'bookmarks'>('surahs');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<number[]>([1]);

  // Audio state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Digital Quran Page Data State
  const [pageSurahData, setPageSurahData] = useState<any | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(false);

  // PDF Engine State
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Touch Swipe Gesture Tracking
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync initialPage prop
  useEffect(() => {
    if (initialPage && initialPage !== currentPage) {
      setCurrentPage(Math.max(1, Math.min(604, initialPage)));
      setPageInput(initialPage.toString());
    }
  }, [initialPage]);

  // Load digital Surah data when currentPage changes
  useEffect(() => {
    let active = true;
    const pageMeta = getPageMetaData(currentPage);

    setPageLoading(true);
    getSurahData(pageMeta.surahNumber).then(data => {
      if (active) {
        setPageSurahData(data);
        setPageLoading(false);
      }
    }).catch(err => {
      console.warn('Error fetching surah data for page:', err);
      if (active) setPageLoading(false);
    });

    return () => { active = false; };
  }, [currentPage]);

  // Load PDF if mode is pdf_vector
  useEffect(() => {
    if (renderMode !== 'pdf_vector') return;

    let active = true;
    setPdfLoading(true);

    const loadPdfDoc = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ url: edition.sourcePdf });
        const doc = await loadingTask.promise;
        if (active) {
          setPdfDoc(doc);
          setPdfLoading(false);
        }
      } catch (err) {
        console.warn('PDF load error:', err);
        if (active) setPdfLoading(false);
      }
    };

    loadPdfDoc();
    return () => { active = false; };
  }, [currentEditionKey, renderMode]);

  // Render PDF Canvas when in pdf_vector mode
  useEffect(() => {
    if (renderMode !== 'pdf_vector' || !pdfDoc || !pdfCanvasRef.current) return;

    let active = true;
    const targetPdfPageNum = ((currentPage - 1) % (pdfDoc.numPages || 1)) + 1;

    pdfDoc.getPage(targetPdfPageNum).then(page => {
      if (!active || !pdfCanvasRef.current) return;
      const canvas = pdfCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const devicePixelRatio = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: devicePixelRatio * zoomScale * 1.5 });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      page.render({ canvasContext: ctx, viewport }).promise.catch(e => {
        if (e?.name !== 'RenderingCancelledException') console.warn(e);
      });
    });

    return () => { active = false; };
  }, [renderMode, pdfDoc, currentPage, zoomScale]);

  // Handle Page Changes
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(604, page));
    setCurrentPage(validPage);
    setPageInput(validPage.toString());
    onPageChange(validPage);
    setIsIndexOpen(false);
  };

  const nextPage = () => {
    if (currentPage < 604) goToPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  };

  // Fullscreen Handler
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Bookmark Toggle
  const toggleBookmark = () => {
    setBookmarks(prev => 
      prev.includes(currentPage) ? prev.filter(p => p !== currentPage) : [...prev, currentPage]
    );
  };

  const isCurrentBookmarked = bookmarks.includes(currentPage);

  // Audio Playback Handler
  const playPageAudio = () => {
    if (isPlayingAudio) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlayingAudio(false);
      setCurrentPlayingAyah(null);
      return;
    }

    const pageMeta = getPageMetaData(currentPage);
    const surahStr = pageMeta.surahNumber.toString().padStart(3, '0');
    const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${pageMeta.surahNumber}.mp3`;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    setIsPlayingAudio(true);
    setCurrentPlayingAyah(`Surja ${pageMeta.surahNameSq}`);

    audio.play().catch(err => {
      console.warn('Audio play failed:', err);
      setIsPlayingAudio(false);
    });

    audio.onended = () => {
      setIsPlayingAudio(false);
      setCurrentPlayingAyah(null);
    };
  };

  // Touch Swipe Gesture Logic
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > 40;

    if (isSwipe) {
      // RTL direction: Swipe Left = Next Page, Swipe Right = Previous Page
      if (distance > 0) {
        nextPage();
      } else {
        prevPage();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Center Screen Tap Handler
  const handleScreenTap = (e: React.MouseEvent) => {
    // Check click position
    const width = window.innerWidth;
    const clickX = e.clientX;

    // Left 25% = Next Page (RTL)
    if (clickX < width * 0.25) {
      nextPage();
    } 
    // Right 25% = Previous Page (RTL)
    else if (clickX > width * 0.75) {
      prevPage();
    } 
    // Center 50% = Toggle Controls
    else {
      setControlsVisible(!controlsVisible);
    }
  };

  const currentMeta = getPageMetaData(currentPage);

  // Theme Styles
  const themeBg = theme === 'night' 
    ? 'bg-slate-950 text-slate-100' 
    : theme === 'white' 
    ? 'bg-stone-100 text-stone-900' 
    : 'bg-[#FAF6EE] text-[#2C221E]';

  const pageBorder = theme === 'night'
    ? 'border-emerald-900/60 bg-slate-900'
    : theme === 'white'
    ? 'border-stone-300 bg-white shadow-xl'
    : 'border-[#D4AF37]/50 bg-[#FFFDF9] shadow-2xl';

  const headerText = theme === 'night' ? 'text-emerald-400' : 'text-[#8C6228]';

  const filteredSurahs = ALL_SURAHS_META.filter(s => 
    s.albanianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.includes(searchQuery) ||
    s.number.toString() === searchQuery.trim()
  );

  return (
    <div 
      ref={containerRef}
      className={`relative select-none overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-[99999] w-screen h-screen bg-slate-950' : 'w-full h-screen bg-slate-950 flex flex-col'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Floating Glass Header (Mobile Compact) */}
      <div 
        className={`absolute top-0 inset-x-0 h-13 z-40 bg-slate-950/90 backdrop-blur-md border-b border-emerald-900/50 px-3 flex items-center justify-between transition-transform duration-300 ${
          controlsVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Left: Close Button */}
        <button 
          onClick={onClose}
          className="p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-full active:scale-95 transition-all"
          title="Mbyll Lexuesin"
        >
          <X size={18} />
        </button>

        {/* Center: Surah / Page Quick Jump Badge */}
        <button 
          onClick={() => setIsIndexOpen(true)}
          className="flex items-center space-x-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-amber-400 px-3 py-1.5 rounded-full text-xs font-bold active:scale-95 transition-all"
        >
          <BookOpen size={14} className="text-amber-400 shrink-0" />
          <span className="truncate max-w-[140px] sm:max-w-[220px]">
            {currentMeta.surahNameSq} • Faqja {currentPage}
          </span>
        </button>

        {/* Right: Actions (Options, Fullscreen, Bookmark) */}
        <div className="flex items-center space-x-1.5">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-full active:scale-95 transition-all"
            title="Opsionet"
          >
            <Sliders size={16} />
          </button>

          <button 
            onClick={toggleFullscreen}
            className="p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-full active:scale-95 transition-all"
            title="Ekran i Plotë"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>

          <button 
            onClick={toggleBookmark}
            className={`p-2 rounded-full transition-all active:scale-95 ${
              isCurrentBookmarked 
                ? 'bg-amber-500 text-slate-950 shadow-md' 
                : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}
            title="Ruaj Faqen"
          >
            <Bookmark size={16} className={isCurrentBookmarked ? 'fill-slate-950' : ''} />
          </button>
        </div>
      </div>

      {/* Main Reading Surface */}
      <div 
        className={`flex-1 w-full h-full flex items-center justify-center relative p-2 sm:p-6 overflow-hidden ${themeBg}`}
        onClick={handleScreenTap}
      >
        {/* Subtle Non-Blocking Corner Bookmark Tag */}
        {isCurrentBookmarked && (
          <div className="absolute top-2 right-4 z-30 pointer-events-none">
            <div className="w-5 h-8 bg-amber-500 rounded-b-md shadow-lg flex items-center justify-center border-b border-amber-700">
              <Bookmark size={12} className="fill-slate-950 text-slate-950" />
            </div>
          </div>
        )}

        {/* Outer Page Container */}
        <div 
          className={`relative w-full max-w-2xl h-full max-h-[92vh] rounded-2xl border-4 p-4 sm:p-8 flex flex-col justify-between overflow-y-auto transition-transform duration-200 ${pageBorder}`}
          style={{ transform: `scale(${zoomScale})` }}
        >
          {/* Header Banner */}
          <div className={`flex items-center justify-between pb-3 border-b border-amber-800/20 text-xs font-semibold ${headerText}`}>
            <span className="font-sans">Juz {currentMeta.juzNumber}</span>
            <span className="font-arabic font-bold text-base text-amber-600" dir="rtl">
              {currentMeta.surahNameAr}
            </span>
            <span className="font-sans">Faqja {currentPage} / 604</span>
          </div>

          {/* Main Page Area */}
          <div className="flex-1 my-3 flex flex-col justify-center items-center">
            {renderMode === 'pdf_vector' ? (
              /* Vector PDF Canvas Layer */
              <div className="w-full h-full flex items-center justify-center relative">
                {pdfLoading && (
                  <div className="flex flex-col items-center justify-center space-y-2 text-amber-600">
                    <RefreshCw size={28} className="animate-spin" />
                    <span className="text-xs font-bold">Po ngarkohet faqja PDF...</span>
                  </div>
                )}
                <canvas 
                  ref={pdfCanvasRef} 
                  className={`max-w-full max-h-full object-contain ${pdfLoading ? 'opacity-0' : 'opacity-100'}`}
                  style={{
                    filter: theme === 'night' ? 'invert(0.92) hue-rotate(180deg) brightness(1.1)' : 'none'
                  }}
                />
              </div>
            ) : (
              /* Digital Medina Uthmanic Page (Guaranteed 100% Arabic Text) */
              <div className="w-full space-y-4 text-center">
                {pageLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-3 text-amber-600">
                    <RefreshCw size={32} className="animate-spin" />
                    <p className="text-sm font-bold">Duke ngarkuar faqen e Medinës...</p>
                  </div>
                ) : pageSurahData ? (
                  <div className="space-y-4">
                    {/* Medina Surah Calligraphy Banner */}
                    <div className="py-3 px-6 rounded-xl border-2 border-[#D4AF37]/40 bg-gradient-to-r from-amber-900/10 via-amber-600/20 to-amber-900/10 flex items-center justify-between">
                      <span className="text-[11px] font-sans opacity-75">{pageSurahData.revelationType === 'Meccan' ? 'Meqase' : 'Medinase'} • {pageSurahData.numberOfAyahs} Ajete</span>
                      <h2 className="font-arabic font-bold text-2xl text-amber-600" dir="rtl">
                        سُورَةُ {pageSurahData.name}
                      </h2>
                      <span className="text-[11px] font-sans opacity-75">Sura {pageSurahData.number}</span>
                    </div>

                    {/* Bismillah Header */}
                    {pageSurahData.number !== 9 && pageSurahData.number !== 1 && (
                      <div className="py-2 text-amber-700 font-arabic text-2xl leading-relaxed" dir="rtl">
                        بِسْمِ اللهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </div>
                    )}

                    {/* Uthmanic Arabic Page Text */}
                    <div 
                      className="font-arabic text-right leading-[2.6] select-text px-2 sm:px-4"
                      style={{ fontSize: `${Math.round(22 * zoomScale)}px` }}
                      dir="rtl"
                    >
                      {pageSurahData.ayahs.map((ayah: any) => (
                        <span key={ayah.numberInSurah} className="inline font-arabic">
                          {renderTajweedText(cleanAyahArabicText(ayah.textAr, pageSurahData.number, ayah.numberInSurah), showTajweed)}
                          <span className="inline-flex items-center justify-center relative mx-1 align-middle select-none text-amber-600 text-[0.8em]" dir="rtl">
                            {buildAyahEndMarker(ayah.numberInSurah)}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-sm opacity-75">
                    Faqja {currentPage} nga Mushafi i Medinës.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Emblem */}
          <div className={`pt-2 border-t border-amber-800/20 text-center font-mono text-xs font-bold ${headerText}`}>
            — {currentPage} —
          </div>
        </div>
      </div>

      {/* Bottom Control Bar (Mobile Compact) */}
      <div 
        className={`absolute bottom-0 inset-x-0 h-13 z-40 bg-slate-950/90 backdrop-blur-md border-t border-emerald-900/50 px-3 flex items-center justify-between transition-transform duration-300 ${
          controlsVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Previous Page Button (RTL) */}
        <button 
          onClick={prevPage}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all active:scale-95"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Prapa</span>
        </button>

        {/* Audio Reciter & Direct Page Input */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={playPageAudio}
            className={`w-9 h-9 flex items-center justify-center rounded-full shadow-md text-white transition-all active:scale-95 ${
              isPlayingAudio ? 'bg-amber-600 animate-pulse ring-2 ring-amber-400' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
            title={isPlayingAudio ? 'Ndalo Audio' : 'Dëgjo Sure-n'}
          >
            {isPlayingAudio ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>

          {/* Page Range Slider */}
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl text-xs">
            <span className="text-amber-400 font-mono font-bold">{currentPage}</span>
            <input 
              type="range"
              min={1}
              max={604}
              value={currentPage}
              onChange={(e) => goToPage(Number(e.target.value))}
              className="w-20 sm:w-32 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="text-slate-400 font-mono text-[11px]">/ 604</span>
          </div>
        </div>

        {/* Next Page Button (RTL) */}
        <button 
          onClick={nextPage}
          disabled={currentPage >= 604}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all active:scale-95 shadow-md shadow-emerald-950/50"
        >
          <span className="hidden sm:inline">Para</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Quick Settings & Theme Sheet Modal */}
      {isSettingsOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 space-y-5 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 text-sm flex items-center space-x-2">
                <Sliders size={18} className="text-amber-400" />
                <span>Opsionet e Leximit</span>
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-full">
                <X size={16} />
              </button>
            </div>

            {/* Reader Theme */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Tema e Faqes</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setTheme('parchment')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center space-y-1 ${
                    theme === 'parchment' ? 'bg-[#FAF6EE] text-[#2C221E] border-amber-500 ring-2 ring-amber-500/50' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <span>📜 Parchment</span>
                </button>
                <button 
                  onClick={() => setTheme('night')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center space-y-1 ${
                    theme === 'night' ? 'bg-slate-950 text-emerald-400 border-emerald-500 ring-2 ring-emerald-500/50' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <span>🌙 Nata</span>
                </button>
                <button 
                  onClick={() => setTheme('white')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center space-y-1 ${
                    theme === 'white' ? 'bg-white text-stone-900 border-stone-400 ring-2 ring-stone-400/50' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  <span>☀️ Bardhë</span>
                </button>
              </div>
            </div>

            {/* Render Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Lloji i Pamjes</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setRenderMode('digital_medina')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    renderMode === 'digital_medina' ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  ✨ Medinë Uthmani (Kristal)
                </button>
                <button 
                  onClick={() => setRenderMode('pdf_vector')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    renderMode === 'pdf_vector' ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  📄 Faqe Vektoriale PDF
                </button>
              </div>
            </div>

            {/* Tajweed & Zoom */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300">Ngjyrat e Texhvidit</span>
              <button 
                onClick={() => setShowTajweed(!showTajweed)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  showTajweed ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                {showTajweed ? 'Aktivizuar' : 'Caktivizuar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Index Overlay Drawer */}
      {isIndexOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-center items-center p-3 animate-in fade-in duration-200"
          onClick={() => setIsIndexOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen size={20} className="text-amber-400" />
                <h3 className="font-bold text-slate-200 text-base">Indeksi i Kuranit (Mushaf)</h3>
              </div>
              <button onClick={() => setIsIndexOpen(false)} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-full">
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/40 p-2 gap-2">
              <button 
                onClick={() => setIndexTab('surahs')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  indexTab === 'surahs' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Surot (114)
              </button>
              <button 
                onClick={() => setIndexTab('juz')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  indexTab === 'juz' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Xhuzet (30)
              </button>
              <button 
                onClick={() => setIndexTab('bookmarks')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  indexTab === 'bookmarks' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Të Ruajtur ({bookmarks.length})
              </button>
            </div>

            {/* Search */}
            {indexTab === 'surahs' && (
              <div className="p-3 border-b border-slate-800/80 bg-slate-900">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Kërko suren sipas emrit ose numrit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {indexTab === 'surahs' && (
                <div className="space-y-1.5">
                  {filteredSurahs.map(surah => {
                    // Estimate page number
                    const juz = ALL_JUZ_META.find(j => surah.number >= j.startSurah && surah.number <= j.endSurah);
                    const targetPage = juz ? juz.startPage : 1;
                    return (
                      <button
                        key={surah.number}
                        onClick={() => goToPage(targetPage)}
                        className="w-full p-3 bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 rounded-xl flex items-center justify-between text-left transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-7 h-7 bg-amber-950 border border-amber-800/80 text-amber-400 font-mono text-xs font-bold rounded-lg flex items-center justify-center">
                            {surah.number}
                          </span>
                          <div>
                            <p className="font-bold text-sm text-slate-200">{surah.albanianName}</p>
                            <p className="text-[11px] text-slate-400">{surah.revelationType === 'Meccan' ? 'Meqase' : 'Medinase'} • {surah.numberOfAyahs} ajete</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-arabic font-bold text-base text-amber-400" dir="rtl">{surah.name}</p>
                          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                            Faqja ~{targetPage}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {indexTab === 'juz' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_JUZ_META.map(juz => (
                    <button
                      key={juz.number}
                      onClick={() => goToPage(juz.startPage)}
                      className="p-3 bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 rounded-xl flex items-center justify-between text-left transition-all"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-200">Xhuzi {juz.number}</p>
                        <p className="text-[10px] text-emerald-400">Faqja {juz.startPage}</p>
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
                        <span className="text-xs text-emerald-400 font-semibold">Kalo te faqja &rarr;</span>
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
