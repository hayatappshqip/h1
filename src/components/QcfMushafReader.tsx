/**
 * QcfMushafReader Component - Lexuesi Zyrtar i Mus'hafit QCF V2 (Quran Foundation)
 *
 * Rules:
 * - Uses endpoint: /.netlify/functions/quran-page?page=N (1 to 604)
 * - Renders code_v2 glyphs strictly with dynamically loaded QCF_P{page} font
 * - NEVER uses KFGQPC Uthmanic Script, UthmanicHafs1Ver18, .font-arabic, .quran-arabic, .quran-word, or .quran-verse for code_v2
 * - Uses isolated container class: .qcf-mushaf-page
 */
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, AlertCircle, RefreshCw, Layers } from 'lucide-react';

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

/**
 * Utility to dynamically inject @font-face for QCF V2 page fonts (1 to 604)
 */
function loadQcfFontForPage(page: number): string {
  const fontFamilyName = `QCF_P${page}`;
  const fontId = `qcf-v2-font-style-p${page}`;

  if (!document.getElementById(fontId)) {
    const styleEl = document.createElement('style');
    styleEl.id = fontId;
    styleEl.textContent = `
      @font-face {
        font-family: '${fontFamilyName}';
        src: url('https://cdn.qurancdn.com/fonts/quran/hafs/v2/woff2/p${page}.woff2') format('woff2'),
             url('https://fonts.quran.com/v2/p${page}.woff2') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `;
    document.head.appendChild(styleEl);
  }

  return fontFamilyName;
}

interface QcfMushafReaderProps {
  initialPage?: number;
  onPageChange?: (page: number) => void;
}

export const QcfMushafReader: React.FC<QcfMushafReaderProps> = ({
  initialPage = 1,
  onPageChange,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageData, setPageData] = useState<QuranPageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string>(`QCF_P${initialPage}`);

  // Fetch page data whenever currentPage changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorMessage(null);

    // Dynamically inject the QCF V2 font for the target page
    const injectedFont = loadQcfFontForPage(currentPage);
    setFontFamily(injectedFont);

    fetch(`/.netlify/functions/quran-page?page=${currentPage}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || 'Dështoi marrja e të dhënave të faqes së Kuranit.');
        }
        return json;
      })
      .then((data: QuranPageData) => {
        if (isMounted) {
          setPageData(data);
          setLoading(false);
          if (onPageChange) onPageChange(currentPage);
        }
      })
      .catch((err: any) => {
        if (isMounted) {
          setErrorMessage(err.message || 'Pati një gabim gjatë lidhjes me shërbimin e Kuranit.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const handleNextPage = () => {
    if (currentPage < 604) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // Group words into lines (1 to 15) for standard Mushaf rendering
  const linesMap: { [lineNumber: number]: CleanWord[] } = {};
  if (pageData && Array.isArray(pageData.verses)) {
    pageData.verses.forEach((verse) => {
      if (Array.isArray(verse.words)) {
        verse.words.forEach((word) => {
          const lNum = word.line_number || 1;
          if (!linesMap[lNum]) linesMap[lNum] = [];
          linesMap[lNum].push(word);
        });
      }
    });
  }

  const sortedLineNumbers = Object.keys(linesMap)
    .map((n) => parseInt(n, 10))
    .sort((a, b) => a - b);

  // Derive metadata (Juz, Hizb, Chapter ID) from page verses
  const firstVerse = pageData?.verses?.[0];
  const juzNumber = firstVerse?.juz_number || 1;
  const hizbNumber = firstVerse?.hizb_number || 1;

  return (
    <div className="space-y-4 animate-fadeIn max-w-4xl mx-auto">
      {/* Top Mushaf Header & Page Navigation */}
      <div className="bg-amber-950/20 border border-amber-800/40 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-900/40 border border-amber-700/50 flex items-center justify-center text-amber-300 font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-amber-100 flex items-center space-x-2">
              <span>Mus'hafi i Sherifit (QCF V2)</span>
              <span className="text-[10px] px-2 py-0.5 bg-amber-900/60 border border-amber-600/50 rounded-full font-mono text-amber-300">
                Faqja {currentPage} / 604
              </span>
            </h3>
            <p className="text-[11px] text-amber-300/80 font-mono">
              Xhuz {juzNumber} • Hizb {hizbNumber} • Formati Zyrtar nga Quran Foundation
            </p>
          </div>
        </div>

        {/* Page selector dropdown and prev/next buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || loading}
            className="p-2 rounded-xl bg-amber-900/40 border border-amber-700/50 text-amber-200 hover:bg-amber-800/50 disabled:opacity-40 transition-all"
            title="Faqja e Mëparshme"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            value={currentPage}
            onChange={(e) => setCurrentPage(parseInt(e.target.value, 10))}
            disabled={loading}
            className="bg-amber-950 border border-amber-800 text-amber-200 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-amber-500"
          >
            {Array.from({ length: 604 }, (_, i) => i + 1).map((p) => (
              <option key={p} value={p}>
                Faqja {p}
              </option>
            ))}
          </select>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= 604 || loading}
            className="p-2 rounded-xl bg-amber-900/40 border border-amber-700/50 text-amber-200 hover:bg-amber-800/50 disabled:opacity-40 transition-all"
            title="Faqja Tjetër"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Page Area */}
      {loading ? (
        <div className="bg-[#FAF6EE] text-[#2C251E] p-12 rounded-3xl border border-[#E5D8BF] text-center space-y-3 min-h-[500px] flex flex-col items-center justify-center shadow-lg">
          <RefreshCw className="w-8 h-8 text-[#0E6243] animate-spin" />
          <p className="text-xs font-semibold text-[#473B2C]">
            Duke ngarkuar faqen {currentPage} me simbolet origjinale QCF V2...
          </p>
        </div>
      ) : errorMessage ? (
        <div className="bg-rose-950/30 border border-rose-800/60 p-6 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-xs text-rose-200 font-medium">{errorMessage}</p>
          <button
            onClick={() => setCurrentPage((p) => p)}
            className="px-4 py-2 bg-rose-900/60 hover:bg-rose-800/80 border border-rose-700 text-rose-100 rounded-xl text-xs font-semibold transition-colors"
          >
            Riprovo Lidhen
          </button>
        </div>
      ) : (
        <div className="bg-[#FAF6EE] border-2 border-[#D6C7A7] p-4 sm:p-8 rounded-3xl shadow-xl space-y-3 min-h-[550px] relative overflow-hidden">
          {/* Subtle Quran Page Border Frame Decorator */}
          <div className="absolute inset-2 border border-[#E5D8BF] rounded-2xl pointer-events-none opacity-60" />

          {/* ISOLATED MUSHAF PAGE CONTAINER: .qcf-mushaf-page */}
          <div className="qcf-mushaf-page space-y-2 py-2">
            {sortedLineNumbers.map((lineNum) => {
              const words = linesMap[lineNum] || [];
              return (
                <div
                  key={lineNum}
                  className="flex items-center justify-center sm:justify-between w-full my-1 leading-relaxed select-text"
                  dir="rtl"
                >
                  {words.map((w, wIdx) => (
                    <span
                      key={`${w.code_v2}-${wIdx}`}
                      className="qcf-v2-word text-2xl sm:text-3xl text-[#1F170F] inline-block px-0.5 transition-colors hover:text-[#0E6243]"
                      style={{
                        fontFamily: `'${fontFamily}'`,
                      }}
                      title={`Linja ${lineNum}, Pozicioni ${w.position}`}
                    >
                      {w.code_v2}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Page Footer Marker */}
          <div className="pt-6 border-t border-[#DECFA7] flex justify-between items-center text-[11px] font-mono text-[#5C4D3C]">
            <span>Xhuz {juzNumber}</span>
            <span className="font-bold text-[#0E6243]">Faqja {currentPage}</span>
            <span>Hizb {hizbNumber}</span>
          </div>
        </div>
      )}
    </div>
  );
};
