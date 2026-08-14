/**
 * MushafPageFrame Component
 * Provides authentic physical book aesthetics: paper textures, traditional framing,
 * gold borders, corner ornaments, header/footer margins, and center book spine.
 */
import React from 'react';

export interface PaperTheme {
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

export const MUSHAF_THEMES: Record<string, PaperTheme> = {
  ivory: {
    id: 'ivory',
    name: 'Letër (Ivory)',
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
    name: 'Errët (Natë)',
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

interface MushafPageFrameProps {
  pageNumber: number;
  juzNumber: number;
  hizbNumber: number;
  surahNameArabic?: string;
  theme: PaperTheme;
  side?: 'left' | 'right' | 'single';
  children: React.ReactNode;
}

export const MushafPageFrame: React.FC<MushafPageFrameProps> = ({
  pageNumber,
  juzNumber,
  hizbNumber,
  surahNameArabic,
  theme,
  side = 'single',
  children,
}) => {
  return (
    <div
      id={`mushaf-page-frame-${pageNumber}`}
      className={`relative w-full h-full flex flex-col justify-between p-3 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden select-none transition-colors duration-300 ${theme.paperBg} ${theme.paperBorder} ${
        side === 'right' ? 'sm:rounded-l-none' : side === 'left' ? 'sm:rounded-r-none' : ''
      }`}
    >
      {/* Traditional Inner Frame Outline */}
      <div
        className={`absolute inset-2 sm:inset-3 border rounded-xl sm:rounded-2xl pointer-events-none opacity-40 transition-colors ${theme.paperBorder}`}
      />

      {/* Decorative Gold Corner Trims */}
      <div className="absolute top-3 left-3 w-2 h-2 border-t-2 border-l-2 border-amber-600/40 pointer-events-none" />
      <div className="absolute top-3 right-3 w-2 h-2 border-t-2 border-r-2 border-amber-600/40 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-2 h-2 border-b-2 border-l-2 border-amber-600/40 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-2 h-2 border-b-2 border-r-2 border-amber-600/40 pointer-events-none" />

      {/* Page Header (Surah Name & Juz Number) */}
      <div
        className={`pt-1 pb-2 border-b flex justify-between items-center text-[10px] sm:text-xs font-serif opacity-85 transition-colors ${theme.spineColor} ${theme.subtextColor}`}
      >
        <span className="font-arabic text-xs sm:text-sm font-semibold">
          {surahNameArabic || `Surja`}
        </span>
        <span className="font-mono tracking-wider">
          Xhuzi {juzNumber}
        </span>
      </div>

      {/* Main 15-Line Quran Reading Stage */}
      <div className="flex-1 flex flex-col justify-center my-auto py-1">
        {children}
      </div>

      {/* Page Footer (Page Number & Hizb Quarter Marker) */}
      <div
        className={`pt-2 mt-1 border-t flex justify-between items-center text-[10px] sm:text-xs font-mono opacity-85 transition-colors ${theme.spineColor} ${theme.subtextColor}`}
      >
        <span>Hizb {hizbNumber}</span>
        <span className="font-bold text-xs sm:text-sm">
          {pageNumber}
        </span>
        <span>Madinah Mushaf</span>
      </div>
    </div>
  );
};
