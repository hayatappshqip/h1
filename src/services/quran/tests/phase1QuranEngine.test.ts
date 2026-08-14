// @vitest-environment jsdom
/**
 * Phase 1 Quran Engine Verification Test Suite
 * Tests QuranPosition resolution, Navigation Transitions, Spread Calculations,
 * Prefetch Clamping, and Critical Boundary Assertions (Pages 1, 42, 604).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  resolveQuranPosition,
  resolveVerseToPage,
  resolvePageToFirstVerse,
  resolvePageToLastVerse,
  resolveSurahToStartPage,
  resolveJuzToStartPage,
  resolveHizbQuarterToStartPage,
} from '../quranPositionService';
import {
  createInitialNavigationState,
  navigateNextPage,
  navigatePrevPage,
  navigateToPage,
  navigateToSurah,
  navigateToJuz,
  navigateToHizbQuarter,
  navigateToVerse,
  calculateSpreadPages,
} from '../quranNavigationService';
import { calculatePrefetchPages } from '../mushafPrefetchService';
import {
  loadCachedQuranPosition,
  LOCAL_STORAGE_ACTIVE_POSITION_KEY,
  LOCAL_STORAGE_LEGACY_BACKUP_KEY,
} from '../quranPersistenceService';

describe('Phase 1 Quran Engine - Position Resolution & Boundaries', () => {
  it('Critical Assertion: Page 1 must resolve without crash', () => {
    const pos = resolveQuranPosition({ page: 1 });
    expect(pos.page).toBe(1);
    expect(pos.surah).toBe(1);
    expect(pos.ayah).toBe(1);
    expect(pos.verseKey).toBe('1:1');
    expect(pos.juz).toBe(1);
    expect(pos.hizbQuarter).toBe(1);
  });

  it('Critical Assertion: Ayat al-Kursi (2:255) must resolve to Page 42', () => {
    const page = resolveVerseToPage('2:255');
    expect(page).toBe(42);

    const pos = resolveQuranPosition({ verseKey: '2:255' });
    expect(pos.page).toBe(42);
    expect(pos.surah).toBe(2);
    expect(pos.ayah).toBe(255);
    expect(pos.juz).toBe(3);
  });

  it('Critical Assertion: Page 604 must resolve to Surahs 112, 113, 114 without crash', () => {
    const pos = resolveQuranPosition({ page: 604 });
    expect(pos.page).toBe(604);
    expect(pos.surah).toBe(112);
    expect(pos.juz).toBe(30);

    const lastVerse = resolvePageToLastVerse(604);
    expect(lastVerse.surah).toBe(114);
    expect(lastVerse.ayah).toBe(6);
    expect(lastVerse.verseKey).toBe('114:6');
  });

  it('Clamps negative, NaN, or out-of-range pages and verses safely', () => {
    const negPagePos = resolveQuranPosition({ page: -10 });
    expect(negPagePos.page).toBe(1);

    const overPagePos = resolveQuranPosition({ page: 999 });
    expect(overPagePos.page).toBe(604);

    const overVersePos = resolveQuranPosition({ surah: 999, ayah: 999 });
    expect(overVersePos.surah).toBe(114);
    expect(overVersePos.ayah).toBe(6); // An-Nas has 6 ayahs
  });
});

describe('Phase 1 Quran Engine - Navigation State Transitions', () => {
  it('Next page at page 1 navigates to page 2', () => {
    const state = createInitialNavigationState({ page: 1 });
    const next = navigateNextPage(state);
    expect(next.currentPosition.page).toBe(2);
    expect(next.currentPosition.surah).toBe(2);
  });

  it('Next page at page 604 does not exceed 604', () => {
    const state = createInitialNavigationState({ page: 604 });
    const next = navigateNextPage(state);
    expect(next.currentPosition.page).toBe(604);
  });

  it('Prev page at page 1 does not go below 1', () => {
    const state = createInitialNavigationState({ page: 1 });
    const prev = navigatePrevPage(state);
    expect(prev.currentPosition.page).toBe(1);
  });

  it('Prev page at page 604 navigates to page 603', () => {
    const state = createInitialNavigationState({ page: 604 });
    const prev = navigatePrevPage(state);
    expect(prev.currentPosition.page).toBe(603);
  });

  it('navigateToSurah jumps to start page of Surah', () => {
    const state = createInitialNavigationState({ page: 1 });
    const surah18State = navigateToSurah(state, 18); // Al-Kahf
    expect(surah18State.currentPosition.surah).toBe(18);
    expect(surah18State.currentPosition.page).toBe(293);
  });

  it('navigateToJuz jumps to start page of Juz', () => {
    const state = createInitialNavigationState({ page: 1 });
    const juz30State = navigateToJuz(state, 30);
    expect(juz30State.currentPosition.juz).toBe(30);
    expect(juz30State.currentPosition.page).toBe(582);
  });

  it('navigateToVerse jumps to correct page for given verseKey', () => {
    const state = createInitialNavigationState({ page: 1 });
    const verseState = navigateToVerse(state, { verseKey: '36:1' }); // Ya-Sin
    expect(verseState.currentPosition.surah).toBe(36);
    expect(verseState.currentPosition.ayah).toBe(1);
    expect(verseState.currentPosition.page).toBe(440);
  });
});

describe('Phase 1 Quran Engine - Spread Calculation', () => {
  it('Page 1 is always standalone right-hand page [1, null]', () => {
    const spread = calculateSpreadPages(1);
    expect(spread).toEqual([1, null]);
  });

  it('Page 2 and Page 3 belong to spread [2, 3]', () => {
    expect(calculateSpreadPages(2)).toEqual([2, 3]);
    expect(calculateSpreadPages(3)).toEqual([2, 3]);
  });

  it('Page 42 and Page 43 belong to spread [42, 43]', () => {
    expect(calculateSpreadPages(42)).toEqual([42, 43]);
    expect(calculateSpreadPages(43)).toEqual([42, 43]);
  });
});

describe('Phase 1 Quran Engine - Prefetch Clamping Strategy', () => {
  it('Prefetches clamped window at Page 1 ([1, 2, 3])', () => {
    const pages = calculatePrefetchPages(1, 2);
    expect(pages).toEqual([1, 2, 3]);
  });

  it('Prefetches 5-page neighborhood at Page 42 ([40, 41, 42, 43, 44])', () => {
    const pages = calculatePrefetchPages(42, 2);
    expect(pages).toEqual([40, 41, 42, 43, 44]);
  });

  it('Prefetches clamped window at Page 604 ([602, 603, 604])', () => {
    const pages = calculatePrefetchPages(604, 2);
    expect(pages).toEqual([602, 603, 604]);
  });
});

describe('Phase 1 Quran Engine - Persistence Layer & Migration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Loads default page 1 if no storage exists', () => {
    const pos = loadCachedQuranPosition();
    expect(pos.page).toBe(1);
    expect(pos.verseKey).toBe('1:1');
  });

  it('Loads cached V2 position from localStorage', () => {
    localStorage.setItem(
      LOCAL_STORAGE_ACTIVE_POSITION_KEY,
      JSON.stringify({ surah: 18, ayah: 1, page: 293 })
    );
    const pos = loadCachedQuranPosition();
    expect(pos.surah).toBe(18);
    expect(pos.page).toBe(293);
    expect(pos.verseKey).toBe('18:1');
  });

  it('Migrates legacy reading state non-destructively and creates backup', () => {
    localStorage.setItem(
      'hayat_quran_reading_state',
      JSON.stringify({ lastReadSurah: 36, lastReadAyah: 1, updatedAt: 123456 })
    );

    const pos = loadCachedQuranPosition();
    expect(pos.surah).toBe(36);
    expect(pos.page).toBe(440);

    // Verify backup was made
    const backup = localStorage.getItem(LOCAL_STORAGE_LEGACY_BACKUP_KEY);
    expect(backup).toBeTruthy();
    expect(JSON.parse(backup!).lastReadSurah).toBe(36);
  });
});

