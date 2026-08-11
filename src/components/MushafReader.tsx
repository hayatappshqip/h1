import React, { useState, useEffect, useRef, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { 
  MUSHAF_EDITIONS, 
  MUSHAF_STORAGE_KEY, 
  MushafEditionMeta, 
  MushafPageMeta, 
  MushafReadingState 
} from '../data/mushafManifest';
import { 
  Play, Pause, SkipBack, SkipForward, Maximize, Minimize, X, Bookmark, 
  ZoomIn, ZoomOut, Maximize2, Layers, BookOpen, Moon, Sun, Search, Sparkles, Volume2, RefreshCw
} from 'lucide-react';

// Configure pdf.js worker globally
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// Quran Surahs Index Metadata for Quick Jump Drawer
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

type ReaderTheme = 'parchment' | 'night' | 'white';

interface PageProps {
  pageNumber: number;
  pdfDoc: pdfjsLib.PDFDocumentProxy | null;
  zoomScale: number;
  isNearCurrent: boolean;
  theme: ReaderTheme;
  isBookmarked?: boolean;
  pageMeta?: MushafPageMeta;
}

/**
 * Individual Mushaf Page Component
 * Renders the real PDF vector page onto an HTML5 Canvas using pdfjs-dist.
 */
const Page = forwardRef<HTMLDivElement, PageProps>(({ 
  pageNumber, 
  pdfDoc, 
  zoomScale, 
  isNearCurrent, 
  theme, 
  isBookmarked,
  pageMeta
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rendered, setRendered] = useState<boolean>(false);
  const [rendering, setRendering] = useState<boolean>(false);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    let active = true;

    // Only render canvas when page is visible or near active viewport
    if (!pdfDoc || !canvasRef.current || !isNearCurrent) {
      return;
    }

    const renderPdfPage = async () => {
      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        setRendering(true);
        const page = await pdfDoc.getPage(pageNumber);
        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Base render viewport scaled for high-DPI crisp rendering
        const devicePixelRatio = window.devicePixelRatio || 1;
        const targetScale = Math.max(1.8, devicePixelRatio * zoomScale * 1.5);
        const viewport = page.getViewport({ scale: targetScale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;

        if (active) {
          setRendered(true);
          setRendering(false);
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn(`PDF Page ${pageNumber} render error:`, err);
        }
        if (active) setRendering(false);
      }
    };

    renderPdfPage();

    return () => {
      active = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, pageNumber, zoomScale, isNearCurrent]);

  // Theme styling
  const isNight = theme === 'night';
  const isWhite = theme === 'white';

  const containerBg = isNight ? 'bg-[#0f172a]' : isWhite ? 'bg-white' : 'bg-[#FAF7EE]';
  const outerBorder = isNight ? 'border-amber-500/40' : isWhite ? 'border-emerald-700/30' : 'border-amber-800/40';
  const innerBorder = isNight ? 'border-amber-500/30' : isWhite ? 'border-emerald-600/20' : 'border-amber-700/30';

  return (
    <div 
      ref={ref} 
      className={`page ${containerBg} shadow-2xl border relative select-none flex flex-col justify-between overflow-hidden transition-colors duration-300`} 
      style={{ width: '100%', height: '100%', minHeight: '420px' }}
    >
      {/* Golden Bookmark Ribbon Marker */}
      {isBookmarked && (
        <div className="absolute top-0 right-8 z-30 w-6 h-12 bg-amber-500 shadow-lg flex items-end justify-center pb-1 clip-ribbon animate-bounce-short">
          <Bookmark size={14} className="text-slate-950 fill-slate-950" />
        </div>
      )}

      {/* Decorative Ornate Frame (QuranFlash Style) */}
      <div className={`absolute inset-2 border-2 ${outerBorder} rounded-sm pointer-events-none p-1 z-20`}>
        <div className={`w-full h-full border ${innerBorder} rounded-xs`}></div>
      </div>

      {/* Real PDF Vector Canvas */}
      <div className="relative w-full h-full flex items-center justify-center p-3 sm:p-5 z-10 overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            rendered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            filter: isNight ? 'invert(0.9) hue-rotate(180deg) brightness(1.1) contrast(1.1)' : 'none'
          }}
        />

        {/* Loading Spinner / Skeleton if PDF page is rendering */}
        {(!rendered || rendering) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 p-6 text-center">
            <div className={`w-8 h-8 border-3 ${isNight ? 'border-amber-400 border-t-transparent' : 'border-emerald-700 border-t-transparent'} rounded-full animate-spin`}></div>
            <p className={`text-xs font-bold ${isNight ? 'text-amber-200' : 'text-amber-900'} font-arabic`}>
              {pageMeta?.surahNameAr || `Faqja ${pageNumber}`}
            </p>
          </div>
        )}
      </div>

      {/* Footer Page Number Indicator */}
      <div className={`absolute bottom-2 inset-x-0 text-center z-20 text-[11px] font-extrabold font-mono pointer-events-none ${
        isNight ? 'text-amber-400' : 'text-amber-900/80'
      }`}>
        {pageNumber}
      </div>
    </div>
  );
});

Page.displayName = 'Page';

export interface MushafReaderProps {
  editionKey?: string;
  initialPage: number;
  onPageChange: (page: number) => void;
  onClose: () => void;
}

export const MushafReader: React.FC<MushafReaderProps> = ({
  editionKey = 'madinah-15-lines-poc',
  initialPage,
  onPageChange,
  onClose,
}) => {
  const [currentEditionKey, setCurrentEditionKey] = useState<string>(editionKey);
  const edition: MushafEditionMeta = MUSHAF_EDITIONS[currentEditionKey] || MUSHAF_EDITIONS['madinah-15-lines-poc'];

  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfLoading, setPdfLoading] = useState<boolean>(true);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(initialPage || 1);
  const [pageInput, setPageInput] = useState<string>((initialPage || 1).toString());
  const [theme, setTheme] = useState<ReaderTheme>('parchment');
  const [isIndexOpen, setIsIndexOpen] = useState<boolean>(false);
  const [indexTab, setIndexTab] = useState<'surahs' | 'juz' | 'bookmarks'>('surahs');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<number[]>([1]);

  // Audio Playback state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const flipBookRef = useRef<any>(null);

  // Load PDF Document when currentEditionKey changes
  useEffect(() => {
    let active = true;
    setPdfLoading(true);
    setPdfError(null);

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: edition.sourcePdf,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (active) {
          setPdfDoc(doc);
          setPdfLoading(false);
        }
      } catch (err: any) {
        console.error("Error loading Mushaf PDF:", err);
        if (active) {
          setPdfError("Dështoi ngarkimi i PDF-së së Mushafit. Ju lutemi kontrolloni lidhjen.");
          setPdfLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      active = false;
    };
  }, [currentEditionKey, edition.sourcePdf]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Sync state with localStorage
  const saveStateToStorage = (page: number, edKey: string) => {
    const curEdition = MUSHAF_EDITIONS[edKey] || MUSHAF_EDITIONS['madinah-15-lines-poc'];
    const pMeta = curEdition.pages.find(p => p.mushafPage === page) || curEdition.pages[0];
    const [surahNum, ayahNum] = pMeta ? pMeta.fromVerse.split(':').map(Number) : [1, 1];

    const stateToSave: MushafReadingState = {
      readerMode: 'mushaf',
      mushafEdition: edKey,
      mushafPage: page,
      surah: surahNum,
      ayah: ayahNum,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(MUSHAF_STORAGE_KEY, JSON.stringify(stateToSave));
      window.dispatchEvent(new Event('mushaf_settings_changed'));
    } catch (e) {
      // ignore
    }
  };

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

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as any;
      setIsFullscreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
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
    saveStateToStorage(pageIndex, currentEditionKey);
  };

  const goToPage = (page: number) => {
    const target = Math.max(1, Math.min(page, edition.pageCount));
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().turnToPage(target - 1);
      setCurrentPage(target);
      setPageInput(target.toString());
      onPageChange(target);
      saveStateToStorage(target, currentEditionKey);
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

  // Audio playback for verses on current page
  const playPageAudio = async () => {
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    const pageMeta = edition.pages.find(p => p.mushafPage === currentPage) || edition.pages[0];
    if (!pageMeta) return;

    const [fromS, fromA] = pageMeta.fromVerse.split(':').map(Number);
    const [toS, toA] = pageMeta.toVerse.split(':').map(Number);

    // Build verse list to play sequentially
    const versesToPlay: { surah: number; ayah: number }[] = [];
    if (fromS === toS) {
      for (let a = fromA; a <= toA; a++) versesToPlay.push({ surah: fromS, ayah: a });
    } else {
      versesToPlay.push({ surah: fromS, ayah: fromA });
    }

    let currentIndex = 0;

    const playNextVerse = () => {
      if (currentIndex >= versesToPlay.length) {
        setIsPlayingAudio(false);
        setCurrentPlayingAyah(null);
        return;
      }

      const verse = versesToPlay[currentIndex];
      const audioUrl = `https://everyayah.com/data/Alafasy_128kbps/${verse.surah.toString().padStart(3, '0')}${verse.ayah.toString().padStart(3, '0')}.mp3`;

      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setCurrentPlayingAyah(`${verse.surah}:${verse.ayah}`);
      setIsPlayingAudio(true);

      audio.onended = () => {
        currentIndex++;
        playNextVerse();
      };

      audio.onerror = () => {
        setIsPlayingAudio(false);
        setCurrentPlayingAyah(null);
      };

      audio.play().catch(err => {
        console.warn("Audio play error:", err);
        setIsPlayingAudio(false);
      });
    };

    playNextVerse();
  };

  const isPortrait = typeof window !== 'undefined' && window.innerHeight > window.innerWidth;
  const width = isPortrait ? window.innerWidth : Math.min(window.innerWidth / 2, 580);
  const height = typeof window !== 'undefined' ? window.innerHeight : 800;

  const isCurrentBookmarked = bookmarks.includes(currentPage);
  const pageMeta = edition.pages.find(p => p.mushafPage === currentPage) || edition.pages[0];

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
      {/* Top Header Controls Bar (QuranFlash Style) */}
      <div 
        className={`absolute top-0 inset-x-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-3 flex flex-col sm:flex-row items-center justify-between transition-transform duration-300 z-30 space-y-2.5 sm:space-y-0 ${controlsVisible ? 'translate-y-0' : '-translate-y-full'}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center space-x-2">
            <button 
              aria-label="Mbull" 
              onClick={onClose} 
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors"
            >
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
            <h2 className="font-bold text-xs sm:text-sm text-emerald-400 flex items-center space-x-1.5">
              <span>{edition.title}</span>
              {pageMeta?.surahNameSq && (
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-medium">
                  {pageMeta.surahNameSq}
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400">
              Faqja {currentPage} nga {edition.pageCount} • Ajetet {pageMeta?.fromVerse} - {pageMeta?.toVerse}
            </p>
          </div>
        </div>
        
        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {/* Edition Switcher (Standard vs Tajweed) */}
          <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60 text-xs">
            <button
              onClick={() => {
                setCurrentEditionKey('madinah-15-lines-poc');
                saveStateToStorage(currentPage, 'madinah-15-lines-poc');
              }}
              className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                currentEditionKey === 'madinah-15-lines-poc' 
                  ? 'bg-emerald-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Standard (15)
            </button>
            <button
              onClick={() => {
                setCurrentEditionKey('tajweed-color-poc');
                saveStateToStorage(currentPage, 'tajweed-color-poc');
              }}
              className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center space-x-1 ${
                currentEditionKey === 'tajweed-color-poc' 
                  ? 'bg-amber-600 text-white shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={12} className="text-amber-300" />
              <span>Texhvid</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 mx-1"></div>

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

          {/* Zoom Buttons */}
          <button aria-label="Zmadho" onClick={() => setZoomScale(s => Math.min(s + 0.25, 2.5))} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-colors">
            <ZoomIn size={16} />
          </button>
          <button aria-label="Zvogëlo" onClick={() => setZoomScale(s => Math.max(s - 0.25, 0.75))} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-colors">
            <ZoomOut size={16} />
          </button>
          <button aria-label="Përshtat" onClick={() => setZoomScale(1.0)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 hover:text-white transition-colors" title="Rivendos zoom-in">
            <Maximize2 size={16} />
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

      {/* Main QuranFlash 3D Canvas Flipbook Stage */}
      <div className="flex-1 w-full h-full flex items-center justify-center relative p-2 md:p-6" onClick={e => e.stopPropagation()}>
        {pdfLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4 text-center p-8 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl">
            <RefreshCw size={32} className="text-emerald-400 animate-spin" />
            <p className="text-sm font-bold text-slate-200">Duke ngarkuar Mushafin e Medinës...</p>
            <p className="text-xs text-slate-400">PDF Rendering (Vector PDFjs engine)</p>
          </div>
        ) : pdfError ? (
          <div className="text-center p-8 bg-slate-900 border border-red-500/30 rounded-2xl max-w-md">
            <p className="text-red-400 font-bold text-sm mb-2">{pdfError}</p>
            <button onClick={onClose} className="bg-slate-800 text-white text-xs px-4 py-2 rounded-lg font-bold">
              Kthehu te Lexuesi Standard
            </button>
          </div>
        ) : (
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
            startPage={Math.max(0, Math.min(currentPage - 1, edition.pageCount - 1))}
            onFlip={handleFlip}
            usePortrait={isPortrait}
            className="flip-book shadow-2xl rounded-lg"
            style={{ margin: '0 auto' }}
            ref={flipBookRef}
            startZIndex={0}
            drawShadow={true}
            flippingTime={650}
            useMouseEvents={true}
            swipeDistance={25}
            showPageCorners={true}
            disableFlipByClick={false}
          >
            {Array.from({ length: edition.pageCount }, (_, i) => {
              const pageNum = i + 1;
              const isNear = Math.abs(pageNum - currentPage) <= 2;
              return (
                <Page 
                  key={`${currentEditionKey}_${pageNum}`} 
                  pageNumber={pageNum} 
                  pdfDoc={pdfDoc}
                  zoomScale={zoomScale}
                  isNearCurrent={isNear}
                  theme={theme}
                  isBookmarked={bookmarks.includes(pageNum)}
                  pageMeta={edition.pages.find(p => p.mushafPage === pageNum)}
                />
              );
            })}
          </HTMLFlipBook>
        )}
      </div>

      {/* Bottom Control Bar & Audio Reciter Player */}
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
        
        {/* Audio Reciter & Fast Page Jump */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={playPageAudio}
            className={`w-10 h-10 flex items-center justify-center rounded-full shadow-lg text-white transition-all active:scale-95 ${
              isPlayingAudio ? 'bg-amber-600 hover:bg-amber-500 animate-pulse ring-4 ring-amber-500/30' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
            title={isPlayingAudio ? `Ndalo audio (${currentPlayingAyah || ''})` : "Dëgjo leximin e ajetit të faqes (Alafasy)"}
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
            <span className="px-2.5 text-slate-400 font-medium">/ {edition.pageCount}</span>
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
