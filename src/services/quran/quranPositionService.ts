/**
 * Quran Position Resolution Service (Phase 0 Foundation)
 * Pure, side-effect free resolution engine mapping between VerseKey, Surah/Ayah, Page (1..604), Juz (1..30), and Hizb Quarter (1..240).
 * Uses canonical Mushaf mapping and repository metadata as the authoritative source of truth.
 */
import { CANONICAL_MUSHAF_PAGES } from '../../data/canonicalMushafManifest';
import { SURAH_START_PAGES, JUZ_START_PAGES, ALL_SURAHS_META } from '../../data/quranData';
import { ALL_JUZ_META } from '../../data/juzData';
import { QuranPosition, MushafPage } from '../../types/quran';

/**
 * Resolves a given verseKey ("surah:ayah") or (surah, ayah) to standard 15-line Medina Mushaf page number (1..604).
 */
export function resolveVerseToPage(verseKey: string): number {
  const parts = verseKey.split(':');
  const surah = parseInt(parts[0], 10);
  const ayah = parseInt(parts[1], 10);

  if (isNaN(surah) || isNaN(ayah) || surah < 1 || surah > 114 || ayah < 1) {
    return 1;
  }

  // Linear / binary search through canonical pages
  for (const p of CANONICAL_MUSHAF_PAGES) {
    if (surah > p.startSurah && surah < p.endSurah) {
      return p.page;
    }
    if (surah === p.startSurah && surah === p.endSurah) {
      if (ayah >= p.startAyah && ayah <= p.endAyah) {
        return p.page;
      }
    } else if (surah === p.startSurah) {
      if (ayah >= p.startAyah) {
        return p.page;
      }
    } else if (surah === p.endSurah) {
      if (ayah <= p.endAyah) {
        return p.page;
      }
    }
  }

  // Fallback to surah start page if verse boundary exceeds
  return SURAH_START_PAGES[surah] || 1;
}

/**
 * Resolves the first verse situated on a given Mushaf page.
 */
export function resolvePageToFirstVerse(page: number): { surah: number; ayah: number; verseKey: string } {
  const normalizedPage = Math.min(Math.max(1, page), 604);
  const pageMeta = CANONICAL_MUSHAF_PAGES[normalizedPage - 1];
  return {
    surah: pageMeta.startSurah,
    ayah: pageMeta.startAyah,
    verseKey: pageMeta.startVerseKey,
  };
}

/**
 * Resolves the last verse situated on a given Mushaf page.
 */
export function resolvePageToLastVerse(page: number): { surah: number; ayah: number; verseKey: string } {
  const normalizedPage = Math.min(Math.max(1, page), 604);
  const pageMeta = CANONICAL_MUSHAF_PAGES[normalizedPage - 1];
  return {
    surah: pageMeta.endSurah,
    ayah: pageMeta.endAyah,
    verseKey: pageMeta.endVerseKey,
  };
}

/**
 * Resolves the starting page for a given surah number (1..114).
 */
export function resolveSurahToStartPage(surah: number): number {
  const normalizedSurah = Math.min(Math.max(1, surah), 114);
  return SURAH_START_PAGES[normalizedSurah] || 1;
}

/**
 * Resolves the starting page for a given Juz number (1..30).
 */
export function resolveJuzToStartPage(juz: number): number {
  const normalizedJuz = Math.min(Math.max(1, juz), 30);
  return JUZ_START_PAGES[normalizedJuz] || ALL_JUZ_META.find(j => j.number === normalizedJuz)?.startPage || 1;
}

/**
 * Resolves the starting page for a given Hizb Quarter (1..240).
 */
export function resolveHizbQuarterToStartPage(hizbQuarter: number): number {
  const normalizedHizb = Math.min(Math.max(1, hizbQuarter), 240);
  const matched = CANONICAL_MUSHAF_PAGES.find(p => p.hizbQuarter === normalizedHizb);
  if (matched) {
    return matched.page;
  }
  // Approximate mapping if exact quarter boundary is within page
  const approxPage = Math.min(604, Math.max(1, Math.round(((normalizedHizb - 1) / 240) * 604) + 1));
  return approxPage;
}

/**
 * Resolves a full canonical QuranPosition object from either verseKey or surah/ayah.
 */
export function resolveQuranPosition(input: {
  verseKey?: string;
  surah?: number;
  ayah?: number;
  page?: number;
  activeReadingMode?: 'mushaf' | 'mushaf_tajweed' | 'verse';
  updatedAt?: number;
}): QuranPosition {
  let surah = input.surah;
  let ayah = input.ayah;
  let page = input.page;

  if (input.verseKey) {
    const parts = input.verseKey.split(':');
    surah = parseInt(parts[0], 10);
    ayah = parseInt(parts[1], 10);
  }

  if (page && (!surah || !ayah)) {
    const first = resolvePageToFirstVerse(page);
    surah = first.surah;
    ayah = first.ayah;
  }

  const validSurah = Math.min(Math.max(1, surah || 1), 114);
  const surahMeta = ALL_SURAHS_META.find(s => s.number === validSurah);
  const maxAyahs = surahMeta ? surahMeta.numberOfAyahs : 7;
  const validAyah = Math.min(Math.max(1, ayah || 1), maxAyahs);
  const verseKey = `${validSurah}:${validAyah}`;

  const resolvedPage = page && page >= 1 && page <= 604 ? page : resolveVerseToPage(verseKey);
  const pageMeta = CANONICAL_MUSHAF_PAGES[resolvedPage - 1];

  return {
    surah: validSurah,
    ayah: validAyah,
    verseKey,
    page: resolvedPage,
    juz: pageMeta ? pageMeta.juz : 1,
    hizbQuarter: pageMeta ? pageMeta.hizbQuarter : 1,
    activeReadingMode: input.activeReadingMode || 'mushaf',
    updatedAt: input.updatedAt || Date.now(),
  };
}

/**
 * Constructs a future-oriented MushafPage domain model for a given page number.
 */
export function getMushafPageModel(pageNumber: number): MushafPage {
  const normPage = Math.min(Math.max(1, pageNumber), 604);
  const meta = CANONICAL_MUSHAF_PAGES[normPage - 1];

  const surahHeaders = [];
  // Check if any surah starts on this page
  for (let s = meta.startSurah; s <= meta.endSurah; s++) {
    const startPage = SURAH_START_PAGES[s];
    if (startPage === normPage) {
      const sMeta = ALL_SURAHS_META.find(item => item.number === s);
      if (sMeta) {
        surahHeaders.push({
          surahNumber: s,
          nameArabic: sMeta.name,
          nameTransliteration: sMeta.transliteration,
          startAyahInPage: 1,
        });
      }
    }
  }

  const prevMeta = normPage > 1 ? CANONICAL_MUSHAF_PAGES[normPage - 2] : null;
  const isRubStart = prevMeta ? prevMeta.hizbQuarter !== meta.hizbQuarter : true;

  return {
    pageNumber: normPage,
    startVerseKey: meta.startVerseKey,
    endVerseKey: meta.endVerseKey,
    startSurah: meta.startSurah,
    startAyah: meta.startAyah,
    endSurah: meta.endSurah,
    endAyah: meta.endAyah,
    juz: meta.juz,
    hizbQuarter: meta.hizbQuarter,
    rubElHizb: isRubStart,
    surahHeaders,
    hasBismillah: surahHeaders.some(h => h.surahNumber !== 9), // Surah 9 (At-Tawbah) has no Bismillah
  };
}
