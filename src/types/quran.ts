/**
 * Canonical Types for Quran V2 Engine
 * Separates immutable canonical Quran text from translations, user data, and UI state.
 */

export interface CanonicalAyah {
  surah: number;                 // 1 .. 114
  ayah: number;                  // 1 .. totalAyahs in surah
  verseKey: string;              // "surah:ayah", e.g. "2:255"
  absoluteNumber: number;        // 1 .. 6236
  page: number;                  // 1 .. 604
  juz: number;                   // 1 .. 30
  hizbQuarter: number;           // 1 .. 240
  manzil?: number;               // 1 .. 7
  sajdah?: boolean;              // True if ayah contains prostration
  textUthmani: string;           // Pure Uthmani Arabic script
  textUthmaniTajweed?: string;   // Annotated with tajweed markup (optional)
}

export interface QuranTranslation {
  verseKey: string;              // "2:255"
  language: string;              // e.g. "sq", "en"
  translator: string;            // e.g. "Hasan Nahi", "Sahih International"
  text: string;
  source?: string;
  license?: string;
}

/**
 * Pure Single Source of Truth for Quran Position.
 * Explicitly DOES NOT contain UI, audio playback, or modal state.
 */
export interface QuranPosition {
  surah: number;                 // 2
  ayah: number;                  // 255
  verseKey: string;              // "2:255"
  page: number;                  // 42
  juz: number;                   // 3
  hizbQuarter: number;           // 17
  activeReadingMode?: 'mushaf' | 'mushaf_tajweed' | 'verse';
  updatedAt?: number;
}

export interface MushafPageSurahHeader {
  surahNumber: number;
  nameArabic: string;
  nameTransliteration: string;
  startAyahInPage: number;
  lineIndex?: number;            // 1 .. 15 (if available from source)
}

export interface MushafPageLine {
  lineNumber: number;            // 1 .. 15
  lineType: 'surah_header' | 'bismillah' | 'ayah_text';
  text?: string;
  /**
   * Word tokens in this line.
   * NOTE: Line-level token stream mapping is source-dependent (marked TODO / SOURCE REQUIRED for full offline 604 line mapping)
   */
  words?: Array<{
    position: number;
    verseKey: string;
    codeV2?: string;
    charType?: string;
  }>;
}

export interface MushafPage {
  pageNumber: number;            // 1 .. 604
  startVerseKey: string;         // e.g. "2:1"
  endVerseKey: string;           // e.g. "2:5"
  startSurah: number;
  startAyah: number;
  endSurah: number;
  endAyah: number;
  juz: number;                   // 1 .. 30
  hizbQuarter: number;           // 1 .. 240
  rubElHizb: boolean;            // True if a quarter mark begins on this page
  surahHeaders: MushafPageSurahHeader[];
  hasBismillah: boolean;
  lines?: MushafPageLine[];      // Optional line-level metadata
}
