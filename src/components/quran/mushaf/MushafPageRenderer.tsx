/**
 * MushafPageRenderer Component
 * Renders the authentic 15-line Madinah Mushaf layout for a single page with QCF V2 glyphs,
 * Surah header banners, Bismillah frames, and verse interaction.
 */
import React from 'react';
import { MushafPageFrame, PaperTheme } from './MushafPageFrame';
import { AyahInteractionLayer } from './AyahInteractionLayer';
import { ALL_SURAHS_META, getSurahNumberFromPage } from '../../../data/quranData';

function toArabicDigits(num: number): string {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map((d) => digits[parseInt(d, 10)] || d).join('');
}

export const SurahHeaderBanner: React.FC<{
  surahNumber: number;
  theme: PaperTheme;
  className?: string;
}> = ({ surahNumber, theme, className = '' }) => {
  const meta = ALL_SURAHS_META.find((s) => s.number === surahNumber);
  const rawName = meta?.name || '';
  const surahName = rawName.startsWith('سورة') || rawName.startsWith('سُورَة') ? rawName : `سُورَةُ ${rawName}`;
  const revelationLabel = meta?.revelationType === 'Meccan' ? 'مَكِّيَّة' : 'مَدَنِيَّة';
  const ayahCountLabel = meta ? `${toArabicDigits(meta.numberOfAyahs)} آيَاتُهَا` : '';

  return (
    <div
      data-surah-header={surahNumber}
      className={`flex-1 w-full max-h-[6.5cqw] min-h-[22px] px-[3%] py-[0.5%] rounded-lg sm:rounded-xl border flex items-center justify-between transition-colors shadow-sm select-none ${
        theme.isDark
          ? 'bg-amber-950/25 border-amber-500/30 text-amber-200'
          : 'bg-amber-500/10 border-amber-600/30 text-amber-950'
      } ${className}`}
      dir="rtl"
    >
      <span className="text-[clamp(9px,2.2cqw,12px)] font-arabic opacity-75 hidden xs:inline whitespace-nowrap">
        {ayahCountLabel}
      </span>
      <span className="font-arabic font-bold text-[clamp(11px,3.2cqw,18px)] tracking-wide mx-auto whitespace-nowrap">
        {surahName}
      </span>
      <span className="text-[clamp(9px,2.2cqw,12px)] font-arabic opacity-75 hidden xs:inline whitespace-nowrap">
        {revelationLabel}
      </span>
    </div>
  );
};

export const BismillahFrame: React.FC<{
  theme: PaperTheme;
  className?: string;
}> = ({ theme, className = '' }) => {
  return (
    <div
      data-bismillah-frame="true"
      className={`flex-1 w-full max-h-[6cqw] min-h-[20px] text-center select-none flex items-center justify-center whitespace-nowrap ${className}`}
      dir="rtl"
    >
      <span
        className={`font-arabic text-[clamp(13px,3.8cqw,22px)] leading-none transition-colors whitespace-nowrap ${theme.textColor}`}
      >
        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </span>
    </div>
  );
};

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

export interface QuranPageData {
  page_number: number;
  verses: CleanVerse[];
}

interface MushafPageRendererProps {
  pageNumber: number;
  pageData: QuranPageData | null;
  fontFamily: string;
  theme: PaperTheme;
  fontScale?: number;
  showTajweed?: boolean;
  activeVerseKey?: string | null;
  bookmarkedVerseKeys?: Set<string> | string[];
  side?: 'left' | 'right' | 'single';
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onVerseSelect?: (verseKey: string) => void;
}

export const MushafPageRenderer: React.FC<MushafPageRendererProps> = ({
  pageNumber,
  pageData,
  fontFamily,
  theme,
  fontScale = 100,
  showTajweed = false,
  activeVerseKey = null,
  bookmarkedVerseKeys,
  side = 'single',
  isLoading = false,
  errorMessage = null,
  onRetry,
  onVerseSelect,
}) => {
  if (!pageData || !Array.isArray(pageData.verses) || pageData.verses.length === 0) {
    return (
      <MushafPageFrame
        pageNumber={pageNumber}
        juzNumber={1}
        hizbNumber={1}
        theme={theme}
        side={side}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-3">
            <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <div className="text-xs italic text-slate-400">
              Duke ngarkuar faqen {pageNumber}...
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 space-y-3 text-center px-4">
            <p className="text-sm font-medium text-rose-400">Faqja nuk u ngarkua.</p>
            {errorMessage && (
              <p className="text-xs text-slate-400 max-w-xs">{errorMessage}</p>
            )}
            {onRetry && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetry();
                }}
                className="px-4 py-2 min-h-[44px] min-w-[88px] text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
              >
                Riprovo
              </button>
            )}
          </div>
        )}
      </MushafPageFrame>
    );
  }

  // Derive metadata
  const firstVerse = pageData.verses[0];
  const juzNum = firstVerse?.juz_number || 1;
  const hizbNum = firstVerse?.hizb_number || 1;
  const primarySurahNum = getSurahNumberFromPage(pageNumber);
  const primarySurahMeta = ALL_SURAHS_META.find((s) => s.number === primarySurahNum);

  // Group words into lines and associate with their parent verse_key
  const linesMap: { [lineNumber: number]: { word: CleanWord; verseKey: string; surah: number; ayah: number }[] } = {};

  pageData.verses.forEach((verse) => {
    if (Array.isArray(verse.words)) {
      verse.words.forEach((word) => {
        // Defensive page isolation guard
        const wordPage =
          typeof word.v2_page === 'number'
            ? word.v2_page
            : typeof word.page_number === 'number'
              ? word.page_number
              : pageNumber;
        if (wordPage !== pageNumber) return;

        const lNum = word.line_number || 1;
        if (!linesMap[lNum]) linesMap[lNum] = [];
        linesMap[lNum].push({
          word,
          verseKey: verse.verse_key,
          surah: verse.chapter_id,
          ayah: verse.verse_number,
        });
      });
    }
  });

  // Identify special lines for Surah headers and Bismillah
  const specialLines: Record<number, { type: 'surah_header'; surahNumber: number } | { type: 'bismillah'; surahNumber: number }> = {};

  pageData.verses.forEach((verse) => {
    if (verse.verse_number === 1) {
      const sNum = verse.chapter_id;
      const firstWordLine = verse.words?.[0]?.line_number || 1;

      if (sNum === 1) {
        // Surah Al-Fatihah (page 1): 1:1 is Bismillah on line 2; line 1 is the header
        if (firstWordLine > 1) {
          specialLines[firstWordLine - 1] = { type: 'surah_header', surahNumber: 1 };
        } else {
          specialLines[1] = { type: 'surah_header', surahNumber: 1 };
        }
      } else if (sNum === 9) {
        // Surah At-Tawbah (page 187): No Bismillah; line 1 is the header
        if (firstWordLine > 1) {
          specialLines[firstWordLine - 1] = { type: 'surah_header', surahNumber: 9 };
        } else {
          specialLines[1] = { type: 'surah_header', surahNumber: 9 };
        }
      } else {
        // All other surahs: Header banner followed by Bismillah
        if (firstWordLine >= 3) {
          specialLines[firstWordLine - 2] = { type: 'surah_header', surahNumber: sNum };
          specialLines[firstWordLine - 1] = { type: 'bismillah', surahNumber: sNum };
        } else if (firstWordLine === 2) {
          specialLines[1] = { type: 'surah_header', surahNumber: sNum };
        }
      }
    }
  });

  const maxLine = Math.max(15, ...Object.keys(linesMap).map((n) => parseInt(n, 10)));
  const sortedLineNumbers = Array.from({ length: maxLine }, (_, i) => i + 1);

  // Vertically center content on opening pages (1 and 2) by shifting empty bottom lines to the top
  const lastContentLine = Math.max(
    ...Object.keys(linesMap).map(Number),
    ...Object.keys(specialLines).map(Number),
    0
  );
  const emptyLinesAtEnd = sortedLineNumbers.filter((l) => l > lastContentLine);
  const shiftCount = (pageNumber === 1 || pageNumber === 2) ? Math.floor(emptyLinesAtEnd.length / 2) : 0;
  const linesToShiftToTop = emptyLinesAtEnd.slice(0, shiftCount);

  return (
    <MushafPageFrame
      pageNumber={pageNumber}
      juzNumber={juzNum}
      hizbNumber={hizbNum}
      surahNameArabic={primarySurahMeta?.name}
      theme={theme}
      side={side}
    >
      <div
        className="qcf-mushaf-page flex flex-col justify-between w-full h-full my-auto select-none overflow-hidden"
      >
        {sortedLineNumbers.map((lineNum) => {
          const isShiftedToTop = linesToShiftToTop.includes(lineNum);
          const orderClass = isShiftedToTop ? 'order-first' : '';

          const special = specialLines[lineNum];
          if (special) {
            if (special.type === 'surah_header') {
              return (
                <SurahHeaderBanner
                  key={`header-${special.surahNumber}-${lineNum}`}
                  surahNumber={special.surahNumber}
                  theme={theme}
                  className={orderClass}
                />
              );
            }
            if (special.type === 'bismillah') {
              return (
                <BismillahFrame
                  key={`bismillah-${special.surahNumber}-${lineNum}`}
                  theme={theme}
                  className={orderClass}
                />
              );
            }
          }

          const lineItems = linesMap[lineNum] || [];

          if (lineItems.length === 0) {
            return <div key={`empty-line-${lineNum}`} className={`flex-1 w-full min-h-[14px] ${orderClass}`} />;
          }

          // Dynamic line density factor for long/dense Arabic lines to guarantee zero clipping
          const wordCount = lineItems.length;
          const lineDensityScale = wordCount > 8 ? Math.max(0.68, 8.5 / wordCount) : 1;

          return (
            <div
              key={`line-${lineNum}`}
              className={`flex-1 w-full flex items-center justify-center flex-nowrap whitespace-nowrap overflow-hidden leading-none select-none ${orderClass}`}
              dir="rtl"
            >
              {lineItems.map(({ word, verseKey }, wIdx) => {
                const isEndOfAyah = word.char_type_name === 'end';
                const isBookmarked = bookmarkedVerseKeys
                  ? bookmarkedVerseKeys instanceof Set
                    ? bookmarkedVerseKeys.has(verseKey)
                    : Array.isArray(bookmarkedVerseKeys)
                    ? bookmarkedVerseKeys.includes(verseKey)
                    : false
                  : false;

                return (
                  <AyahInteractionLayer
                    key={`${verseKey}-${word.position}-${wIdx}`}
                    verseKey={verseKey}
                    isSelected={activeVerseKey === verseKey}
                    isBookmarked={isBookmarked}
                    onSelect={onVerseSelect}
                  >
                    <span
                      className={`qcf-v2-word text-center inline-flex items-center justify-center whitespace-nowrap transition-colors ${
                        showTajweed ? 'hover:text-emerald-600' : ''
                      } ${isEndOfAyah ? 'opacity-90 font-bold' : ''} ${theme.textColor} ${theme.hoverColor}`}
                      style={{
                        fontFamily: `'${fontFamily}'`,
                        fontSize: `calc(${((fontScale / 100) * lineDensityScale).toFixed(4)} * clamp(9px, 4.85cqw, 32px))`,
                        lineHeight: 1,
                      }}
                      title={verseKey}
                    >
                      {word.code_v2}
                    </span>
                  </AyahInteractionLayer>
                );
              })}
            </div>
          );
        })}
      </div>
    </MushafPageFrame>
  );
};
