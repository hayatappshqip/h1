import React, { useState, useEffect, useRef, forwardRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import HTMLFlipBook from 'react-pageflip';
import { MushafReadingState, MUSHAF_EDITIONS, getMushafPageForVerse } from '../data/mushafManifest';
import { Play, Pause, SkipBack, SkipForward, Maximize, Minimize, Settings, X, Bookmark, ZoomIn, ZoomOut, Maximize2, Layers } from 'lucide-react';

// Setup pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PageProps {
  number: number;
  pdfDocument: pdfjsLib.PDFDocumentProxy | null;
  scale: number;
}

const Page = forwardRef<HTMLDivElement, PageProps>(({ number, pdfDocument, scale }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderTask, setRenderTask] = useState<pdfjsLib.RenderTask | null>(null);

  useEffect(() => {
    let active = true;

    const renderPage = async () => {
      if (!pdfDocument || !canvasRef.current) return;
      try {
        const page = await pdfDocument.getPage(number);
        if (!active) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        if (renderTask) {
          await renderTask.promise.catch(() => {}); // ignore cancellation
        }

        const task = page.render(renderContext);
        setRenderTask(task);
        await task.promise;
      } catch (err) {
        // ignore page loading errors or cancellations
      }
    };

    renderPage();

    return () => {
      active = false;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDocument, number, scale]);

  return (
    <div ref={ref} className="page bg-white shadow-md border border-slate-200" style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} className="w-full h-full object-contain" />
    </div>
  );
});

Page.displayName = 'Page';

interface MushafReaderProps {
  editionKey: string;
  initialPage: number;
  onPageChange: (page: number) => void;
  onClose: () => void;
}

export const MushafReader: React.FC<MushafReaderProps> = ({
  editionKey,
  initialPage,
  onPageChange,
  onClose,
}) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [scale, setScale] = useState(1.5);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageInput, setPageInput] = useState(initialPage.toString());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const flipBookRef = useRef<any>(null);
  const edition = MUSHAF_EDITIONS[editionKey];
  const numPages = edition?.pageCount || 5;

  useEffect(() => {
    let loadingTask: pdfjsLib.PDFDocumentLoadingTask;

    if (edition) {
      loadingTask = pdfjsLib.getDocument({ url: edition.sourcePdf });
      loadingTask.promise.then(
        (pdf) => setPdfDoc(pdf),
        (err) => console.error("Error loading PDF", err)
      );
    }

    return () => {
      if (loadingTask) loadingTask.destroy();
    };
  }, [editionKey]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleFlip = (e: any) => {
    // e.data is 0-indexed page index (RTL starts from highest index)
    const newPage = numPages - e.data;
    setCurrentPage(newPage);
    setPageInput(newPage.toString());
    onPageChange(newPage);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= numPages && flipBookRef.current) {
      flipBookRef.current.pageFlip().turnToPage(numPages - page);
    }
  };

  const isPortrait = window.innerHeight > window.innerWidth;
  const width = isPortrait ? window.innerWidth : window.innerWidth / 2;
  const height = window.innerHeight;

  if (!edition) return <div>Invalid Edition</div>;

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 bg-slate-900 z-50 flex flex-col justify-center items-center overflow-hidden touch-none"
      onClick={() => setControlsVisible(!controlsVisible)}
    >
      <div className={`absolute top-0 inset-x-0 bg-slate-950/80 p-4 flex flex-col sm:flex-row items-center justify-between transition-transform duration-300 z-10 space-y-3 sm:space-y-0 ${controlsVisible ? 'translate-y-0' : '-translate-y-full'}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <button aria-label="Kthehu" onClick={onClose} className="p-2 bg-slate-800 rounded-full text-white hover:bg-slate-700">
            <X size={20} />
          </button>
          <div className="text-white flex-1 sm:flex-none">
            <h2 className="font-bold text-sm sm:text-base">{edition.title}</h2>
            <p className="text-xs text-slate-400">{edition.subtitle}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button aria-label="Zmadho" onClick={() => setScale(s => Math.min(s + 0.2, 3))} className="p-2 bg-slate-800 rounded-full text-white hover:text-emerald-400">
            <ZoomIn size={18} />
          </button>
          <button aria-label="Zvogëlo" onClick={() => setScale(s => Math.max(s - 0.2, 0.5))} className="p-2 bg-slate-800 rounded-full text-white hover:text-emerald-400">
            <ZoomOut size={18} />
          </button>
          <button aria-label="Përshtat faqen" onClick={() => setScale(1.5)} className="p-2 bg-slate-800 rounded-full text-white hover:text-emerald-400">
            <Maximize2 size={18} />
          </button>
          <button aria-label="Fullscreen" onClick={toggleFullscreen} className="p-2 bg-slate-800 rounded-full text-white hover:text-emerald-400">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
          <button aria-label="Bookmark" onClick={() => {}} className="p-2 bg-slate-800 rounded-full text-white hover:text-emerald-400">
            <Bookmark size={18} />
          </button>
          <button 
            aria-label="Hap në pamjen e aksesueshme ajet pas ajeti" 
            onClick={onClose} 
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-medium ml-2"
          >
            <Layers size={14} />
            <span className="hidden sm:inline">Ajet pas ajeti</span>
          </button>
        </div>
      </div>

      <div className="flex-1 w-full h-full flex items-center justify-center relative p-2 md:p-8" dir="ltr" onClick={e => e.stopPropagation()}>
        {pdfDoc ? (
           <HTMLFlipBook 
             width={width - (isPortrait ? 20 : 60)} 
             height={height - (controlsVisible ? 160 : 40)}
             size="stretch"
             minWidth={300}
             maxWidth={1000}
             minHeight={400}
             maxHeight={1500}
             showCover={false}
             mobileScrollSupport={true}
             startPage={numPages - initialPage}
             onFlip={handleFlip}
             usePortrait={isPortrait}
             className="flip-book shadow-2xl"
             style={{ margin: '0 auto' }}
             ref={flipBookRef}
             startZIndex={0}
             drawShadow={true}
             flippingTime={1000}
             useMouseEvents={true}
             swipeDistance={30}
             showPageCorners={true}
             disableFlipByClick={true}
           >
             {Array.from({ length: numPages }, (_, i) => (
               <Page key={i} number={numPages - i} pdfDocument={pdfDoc} scale={scale} />
             ))}
           </HTMLFlipBook>
        ) : (
          <div className="text-white animate-pulse">Duke ngarkuar...</div>
        )}
      </div>

      <div className={`absolute bottom-0 inset-x-0 bg-slate-950/80 p-4 flex items-center justify-between transition-transform duration-300 z-10 ${controlsVisible ? 'translate-y-0' : 'translate-y-full'}`} onClick={e => e.stopPropagation()}>
         <div className="flex items-center space-x-4">
           <button aria-label="Faqja tjetër" onClick={() => flipBookRef.current?.pageFlip().flipNext()} className="p-2 text-white hover:text-emerald-400">
             <SkipBack size={24} />
           </button>
         </div>
         
         <div className="flex items-center space-x-4">
            <button aria-label="Luaj audio" className="w-12 h-12 flex items-center justify-center bg-emerald-600 rounded-full hover:bg-emerald-500 shadow-lg shadow-emerald-900/50 text-white">
               <Play size={24} className="ml-1" />
            </button>
            <div className="flex items-center bg-slate-800 rounded-lg overflow-hidden">
               <span className="px-3 text-sm text-slate-400">Faqja</span>
               <input 
                 type="number" 
                 value={pageInput}
                 onChange={(e) => setPageInput(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') {
                     goToPage(parseInt(pageInput, 10));
                   }
                 }}
                 className="w-12 bg-slate-700 text-white text-center py-1 outline-none appearance-none"
               />
               <span className="px-3 text-sm text-slate-400">/ {numPages}</span>
            </div>
         </div>

         <div className="flex items-center space-x-4">
           <button aria-label="Faqja e mëparshme" onClick={() => flipBookRef.current?.pageFlip().flipPrev()} className="p-2 text-white hover:text-emerald-400">
             <SkipForward size={24} />
           </button>
         </div>
      </div>
    </div>
  );
};

