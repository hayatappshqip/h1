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
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
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
  isLoading = false,
  errorMessage = null,
  onRetry,
  onVerseSelect,
}) => {
  const [rightPageNum, leftPageNum] = spreadPages;

  // Single page mode (portrait or mobile)
  if (!isTwoPageSpread || leftPageNum === null) {
    return (
      <div className="w-full h-full max-w-[min(100%,calc((100dvh-7.5rem)/1.42))] max-h-[calc(100dvh-7.5rem)] aspect-[1/1.42] mx-auto flex items-center justify-center">
        <MushafPageRenderer
          pageNumber={currentPage}
          pageData={pageData1}
          fontFamily={fontFamily1}
          theme={theme}
          fontScale={fontScale}
          showTajweed={showTajweed}
          activeVerseKey={activeVerseKey}
          side="single"
          isLoading={isLoading}
          errorMessage={errorMessage}
          onRetry={onRetry}
          onVerseSelect={onVerseSelect}
        />
      </div>
    );
  }

  // Two-page spread mode (desktop / landscape tablet)
  // Right page is rightPageNum, Left page is leftPageNum
  return (
    <div className="w-full h-full max-w-5xl max-h-[calc(100dvh-7.5rem)] mx-auto flex items-center justify-center gap-1 sm:gap-2">
      {/* Left Page of the open book */}
      <div className="flex-1 h-full max-w-[min(50%,calc((100dvh-7.5rem)/1.42))] aspect-[1/1.42] flex items-center justify-center hidden sm:flex">
        <MushafPageRenderer
          pageNumber={leftPageNum}
          pageData={pageData2}
          fontFamily={fontFamily2}
          theme={theme}
          fontScale={fontScale}
          showTajweed={showTajweed}
          activeVerseKey={activeVerseKey}
          side="left"
          isLoading={isLoading}
          errorMessage={errorMessage}
          onRetry={onRetry}
          onVerseSelect={onVerseSelect}
        />
      </div>

      {/* Center Book Spine Crease Divider */}
      <div
        className={`hidden sm:block w-[2px] h-[95%] opacity-40 border-r ${theme.spineColor}`}
      />

      {/* Right Page of the open book */}
      <div className="flex-1 h-full max-w-[min(50%,calc((100dvh-7.5rem)/1.42))] aspect-[1/1.42] flex items-center justify-center">
        <MushafPageRenderer
          pageNumber={rightPageNum}
          pageData={pageData1}
          fontFamily={fontFamily1}
          theme={theme}
          fontScale={fontScale}
          showTajweed={showTajweed}
          activeVerseKey={activeVerseKey}
          side="right"
          isLoading={isLoading}
          errorMessage={errorMessage}
          onRetry={onRetry}
          onVerseSelect={onVerseSelect}
        />
      </div>
    </div>
  );
};
