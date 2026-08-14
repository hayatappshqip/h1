/**
 * MushafPageSpread Component
 * Manages Single-Page vs Two-Page Book Spread presentation.
 * In 2-page spread: Page 1 is standalone on the right. Pages 2-3, 4-5, etc., form book spreads.
 */
import React from 'react';
import { MushafPageRenderer, QuranPageData } from './MushafPageRenderer';
import { PaperTheme } from './MushafPageFrame';

interface MushafPageSpreadProps {
  currentPage: number;
  spreadPages: [number, number | null];
  isTwoPageSpread: boolean;
  theme: PaperTheme;
  fontScale: number;
  showTajweed: boolean;
  activeVerseKey: string | null;
  pageData1: QuranPageData | null;
  fontFamily1: string;
  pageData2: QuranPageData | null;
  fontFamily2: string;
  onVerseSelect?: (verseKey: string) => void;
}

export const MushafPageSpread: React.FC<MushafPageSpreadProps> = ({
  currentPage,
  spreadPages,
  isTwoPageSpread,
  theme,
  fontScale,
  showTajweed,
  activeVerseKey,
  pageData1,
  fontFamily1,
  pageData2,
  fontFamily2,
  onVerseSelect,
}) => {
  const [rightPageNum, leftPageNum] = spreadPages;

  // Single page mode (portrait or mobile)
  if (!isTwoPageSpread || leftPageNum === null) {
    return (
      <div className="w-full h-full max-w-xl mx-auto flex items-center justify-center">
        <MushafPageRenderer
          pageNumber={currentPage}
          pageData={pageData1}
          fontFamily={fontFamily1}
          theme={theme}
          fontScale={fontScale}
          showTajweed={showTajweed}
          activeVerseKey={activeVerseKey}
          side="single"
          onVerseSelect={onVerseSelect}
        />
      </div>
    );
  }

  // Two-page spread mode (desktop / landscape tablet)
  // Right page is rightPageNum, Left page is leftPageNum
  return (
    <div className="w-full h-full max-w-5xl mx-auto flex items-center justify-center gap-0.5 sm:gap-1">
      {/* Left Page of the open book */}
      <div className="flex-1 h-full max-w-lg hidden sm:block">
        <MushafPageRenderer
          pageNumber={leftPageNum}
          pageData={pageData2}
          fontFamily={fontFamily2}
          theme={theme}
          fontScale={fontScale}
          showTajweed={showTajweed}
          activeVerseKey={activeVerseKey}
          side="left"
          onVerseSelect={onVerseSelect}
        />
      </div>

      {/* Center Book Spine Crease Divider */}
      <div
        className={`hidden sm:block w-[2px] h-[95%] opacity-40 border-r ${theme.spineColor}`}
      />

      {/* Right Page of the open book */}
      <div className="flex-1 h-full max-w-lg">
        <MushafPageRenderer
          pageNumber={rightPageNum}
          pageData={pageData1}
          fontFamily={fontFamily1}
          theme={theme}
          fontScale={fontScale}
          showTajweed={showTajweed}
          activeVerseKey={activeVerseKey}
          side="right"
          onVerseSelect={onVerseSelect}
        />
      </div>
    </div>
  );
};
