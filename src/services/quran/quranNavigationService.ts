/**
 * Quran Navigation Model & Service (Phase 0 Foundation)
 * Pure navigation helper service designed for future state management without disrupting legacy state.
 */
import {
  resolveQuranPosition,
  resolvePageToFirstVerse,
  resolveSurahToStartPage,
  resolveJuzToStartPage,
  resolveHizbQuarterToStartPage,
} from './quranPositionService';
import { QuranPosition } from '../../types/quran';

export type QuranReadingMode = 'by_verse' | 'continuous' | 'mushaf';

export interface QuranNavigationState {
  currentPosition: QuranPosition;
  readingMode: QuranReadingMode;
  isTwoPageSpread: boolean;
  spreadPages: [number, number | null]; // [rightPage, leftPage] in RTL Quran layout
}

/**
 * Calculates standard Quran 2-page book spread pages for a given page number.
 * In a traditional right-to-left Mushaf:
 * - Page 1 sits alone on the right (odd page on right).
 * - Pages 2 (right) & 3 (left), 4 (right) & 5 (left), etc.
 * - Even pages are right-hand sides, odd pages (>1) are left-hand sides.
 */
export function calculateSpreadPages(currentPage: number): [number, number | null] {
  const normPage = Math.min(Math.max(1, currentPage), 604);
  if (normPage === 1) {
    return [1, null];
  }
  if (normPage === 604) {
    return [604, null];
  }

  // If even page (e.g. 2, 4, 6), it's the right page; left page is normPage + 1
  if (normPage % 2 === 0) {
    const leftPage = normPage + 1 <= 604 ? normPage + 1 : null;
    return [normPage, leftPage];
  } else {
    // If odd page (e.g. 3, 5, 7), the spread began at normPage - 1
    const rightPage = normPage - 1;
    return [rightPage, normPage];
  }
}

/**
 * Creates an initial navigation state initialized to a position or page 1.
 */
export function createInitialNavigationState(initial?: {
  page?: number;
  surah?: number;
  ayah?: number;
  mode?: QuranReadingMode;
  isTwoPageSpread?: boolean;
}): QuranNavigationState {
  const pos = resolveQuranPosition({
    page: initial?.page,
    surah: initial?.surah,
    ayah: initial?.ayah,
  });

  const isSpread = initial?.isTwoPageSpread ?? false;
  const spreadPages = calculateSpreadPages(pos.page);

  return {
    currentPosition: pos,
    readingMode: initial?.mode || 'mushaf',
    isTwoPageSpread: isSpread,
    spreadPages,
  };
}

/**
 * Pure transition for navigating forward (next page in Mushaf, step = 1 or 2 if spread).
 */
export function navigateNextPage(state: QuranNavigationState): QuranNavigationState {
  const step = state.isTwoPageSpread ? 2 : 1;
  const nextPage = Math.min(604, state.currentPosition.page + step);
  const newPos = resolveQuranPosition({ page: nextPage });
  return {
    ...state,
    currentPosition: newPos,
    spreadPages: calculateSpreadPages(nextPage),
  };
}

/**
 * Pure transition for navigating backward (prev page in Mushaf, step = 1 or 2 if spread).
 */
export function navigatePrevPage(state: QuranNavigationState): QuranNavigationState {
  const step = state.isTwoPageSpread ? 2 : 1;
  const prevPage = Math.max(1, state.currentPosition.page - step);
  const newPos = resolveQuranPosition({ page: prevPage });
  return {
    ...state,
    currentPosition: newPos,
    spreadPages: calculateSpreadPages(prevPage),
  };
}

/**
 * Pure transition for jumping directly to a target page number (1..604).
 */
export function navigateToPage(state: QuranNavigationState, page: number): QuranNavigationState {
  const targetPage = Math.min(Math.max(1, page), 604);
  const newPos = resolveQuranPosition({ page: targetPage });
  return {
    ...state,
    currentPosition: newPos,
    spreadPages: calculateSpreadPages(targetPage),
  };
}

/**
 * Pure transition for jumping to a Surah start page.
 */
export function navigateToSurah(state: QuranNavigationState, surah: number): QuranNavigationState {
  const startPage = resolveSurahToStartPage(surah);
  const newPos = resolveQuranPosition({ surah, ayah: 1, page: startPage });
  return {
    ...state,
    currentPosition: newPos,
    spreadPages: calculateSpreadPages(startPage),
  };
}

/**
 * Pure transition for jumping to a Juz start page.
 */
export function navigateToJuz(state: QuranNavigationState, juz: number): QuranNavigationState {
  const startPage = resolveJuzToStartPage(juz);
  const firstVerse = resolvePageToFirstVerse(startPage);
  const newPos = resolveQuranPosition({ surah: firstVerse.surah, ayah: firstVerse.ayah, page: startPage });
  return {
    ...state,
    currentPosition: newPos,
    spreadPages: calculateSpreadPages(startPage),
  };
}

/**
 * Pure transition for jumping to a Hizb Quarter start page.
 */
export function navigateToHizbQuarter(state: QuranNavigationState, hizbQuarter: number): QuranNavigationState {
  const startPage = resolveHizbQuarterToStartPage(hizbQuarter);
  const firstVerse = resolvePageToFirstVerse(startPage);
  const newPos = resolveQuranPosition({ surah: firstVerse.surah, ayah: firstVerse.ayah, page: startPage });
  return {
    ...state,
    currentPosition: newPos,
    spreadPages: calculateSpreadPages(startPage),
  };
}

/**
 * Pure transition for jumping to a specific Verse (by verseKey or surah + ayah).
 */
export function navigateToVerse(
  state: QuranNavigationState,
  input: { verseKey?: string; surah?: number; ayah?: number }
): QuranNavigationState {
  const newPos = resolveQuranPosition({
    verseKey: input.verseKey,
    surah: input.surah,
    ayah: input.ayah,
  });
  return {
    ...state,
    currentPosition: newPos,
    spreadPages: calculateSpreadPages(newPos.page),
  };
}

/**
 * Pure transition for toggling or setting two-page spread mode.
 */
export function setTwoPageSpread(state: QuranNavigationState, isSpread: boolean): QuranNavigationState {
  return {
    ...state,
    isTwoPageSpread: isSpread,
    spreadPages: calculateSpreadPages(state.currentPosition.page),
  };
}

/**
 * Pure transition for switching reading mode (mushaf, by_verse, continuous).
 */
export function setReadingMode(state: QuranNavigationState, mode: QuranReadingMode): QuranNavigationState {
  return {
    ...state,
    readingMode: mode,
    currentPosition: {
      ...state.currentPosition,
      activeReadingMode: mode === 'by_verse' ? 'verse' : 'mushaf',
      updatedAt: Date.now(),
    },
  };
}

