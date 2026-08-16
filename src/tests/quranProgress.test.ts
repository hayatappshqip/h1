// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getDefaultProgressState,
  isValidVerseKey,
  recordVerseRead,
  recordVersesRead,
  removeReadVerse,
  isVerseRead,
  calculateProgress,
  calculateSurahProgress,
  calculatePageProgress,
  calculateJuzProgress,
  recalculateStreaks,
  calculateDailyGoalProgress,
  getSurahVerseKeys,
  getPageVerseKeys,
  TOTAL_CANONICAL_AYAHS,
} from '../services/quran/quranProgressService';
import {
  loadCachedQuranProgress,
  loadDurableQuranProgress,
  saveDurableQuranProgress,
  loadCachedQuranPosition,
  saveQuranPosition,
  loadDurableBookmarks,
  saveDurableBookmark,
  LOCAL_STORAGE_PROGRESS_KEY,
} from '../services/quran/quranPersistenceService';
import { QuranBookmark } from '../types';

import { resolveQuranPosition } from '../services/quran/quranPositionService';

describe('HAYAT Quran V2 - Reading Progress & Khatmah Foundation Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // 1. Empty progress state
  it('1. returns a valid empty default progress state', () => {
    const state = getDefaultProgressState();
    expect(state.readVerseKeys).toEqual([]);
    expect(state.dailyProgress).toEqual({});
    expect(state.currentStreak).toBe(0);
    expect(state.longestStreak).toBe(0);
    expect(state.totalReadingEvents).toBe(0);
  });

  // 2. Add first verse
  it('2. adds the first verse read correctly', async () => {
    const initial = getDefaultProgressState();
    const updated = await recordVerseRead('1:1', '2026-08-16', initial);
    expect(updated.readVerseKeys).toEqual(['1:1']);
    expect(updated.dailyProgress['2026-08-16']).toBe(1);
    expect(updated.totalReadingEvents).toBe(1);
    expect(updated.lastReadDate).toBe('2026-08-16');
  });

  // 3. Add duplicate verse
  it('3. handles adding a duplicate verse without duplicating readKeys', async () => {
    let state = getDefaultProgressState();
    state = await recordVerseRead('1:1', '2026-08-16', state);
    state = await recordVerseRead('1:1', '2026-08-16', state);

    expect(state.readVerseKeys).toEqual(['1:1']);
    expect(state.dailyProgress['2026-08-16']).toBe(1);
    expect(state.totalReadingEvents).toBe(2); // total events tracked, but unique count stays 1
  });

  // 4. Multiple verses
  it('4. records multiple distinct verses correctly', async () => {
    let state = getDefaultProgressState();
    state = await recordVersesRead(['1:1', '1:2', '1:3', '1:4'], '2026-08-16', state);
    expect(state.readVerseKeys).toHaveLength(4);
    expect(state.dailyProgress['2026-08-16']).toBe(4);
  });

  // 5. Correct unique verse count
  it('5. computes total unique verse count accurately', () => {
    const state = {
      ...getDefaultProgressState(),
      readVerseKeys: ['1:1', '1:2', '1:3', '2:255'],
    };
    const summary = calculateProgress(state);
    expect(summary.totalUniqueVersesRead).toBe(4);
    expect(summary.totalCanonicalVerses).toBe(TOTAL_CANONICAL_AYAHS);
  });

  // 6. Correct completion percentage
  it('6. calculates Khatm completion percentage accurately', () => {
    // 6236 is total. 623.6 is 10%
    const keys = Array.from({ length: 624 }, (_, i) => `2:${i + 1}`);
    const summary = calculateProgress(keys);
    expect(summary.completionPercentage).toBeGreaterThan(9.9);
    expect(summary.completionPercentage).toBeLessThan(10.1);
  });

  // 7. Surah progress calculation
  it('7. calculates Surah 1 (Al-Fatihah) progress accurately', () => {
    const keys = ['1:1', '1:2', '1:3', '1:4', '1:5', '1:6', '1:7'];
    const surah1 = calculateSurahProgress(1, keys);
    expect(surah1.surahNumber).toBe(1);
    expect(surah1.totalAyahs).toBe(7);
    expect(surah1.readAyahs).toBe(7);
    expect(surah1.percentage).toBe(100);
    expect(surah1.isCompleted).toBe(true);

    const surah1Partial = calculateSurahProgress(1, ['1:1', '1:2']);
    expect(surah1Partial.readAyahs).toBe(2);
    expect(surah1Partial.percentage).toBe(28.57);
    expect(surah1Partial.isCompleted).toBe(false);
  });

  // 8. Page progress as derived data
  it('8. derives Mushaf page 1 completion accurately', () => {
    // Page 1 has 7 ayahs (1:1 to 1:7)
    const page1Keys = getPageVerseKeys(1);
    expect(page1Keys).toHaveLength(7);

    const fullPage = calculatePageProgress(1, page1Keys);
    expect(fullPage.totalAyahs).toBe(7);
    expect(fullPage.readAyahs).toBe(7);
    expect(fullPage.isCompleted).toBe(true);
  });

  // 9. Daily progress
  it('9. maintains date-keyed daily progress structure', async () => {
    let state = getDefaultProgressState();
    state = await recordVerseRead('1:1', '2026-08-15', state);
    state = await recordVerseRead('1:2', '2026-08-16', state);

    expect(state.dailyProgress['2026-08-15']).toBe(1);
    expect(state.dailyProgress['2026-08-16']).toBe(1);
  });

  // 10. Multiple verses on same day
  it('10. aggregates multiple new verses on the same day correctly', async () => {
    let state = getDefaultProgressState();
    state = await recordVerseRead('1:1', '2026-08-16', state);
    state = await recordVerseRead('1:2', '2026-08-16', state);
    state = await recordVerseRead('1:3', '2026-08-16', state);

    expect(state.dailyProgress['2026-08-16']).toBe(3);
  });

  // 11. Current streak = 1
  it('11. sets current streak to 1 when reading today for the first time', () => {
    const dailyProgress = { '2026-08-16': 5 };
    const { currentStreak } = recalculateStreaks(dailyProgress, '2026-08-16');
    expect(currentStreak).toBe(1);
  });

  // 12. Consecutive-day streak
  it('12. calculates consecutive day streak correctly', () => {
    const dailyProgress = {
      '2026-08-14': 5,
      '2026-08-15': 10,
      '2026-08-16': 2,
    };
    const { currentStreak, longestStreak } = recalculateStreaks(dailyProgress, '2026-08-16');
    expect(currentStreak).toBe(3);
    expect(longestStreak).toBe(3);
  });

  // 13. Broken streak
  it('13. handles broken streaks appropriately when a day is missed', () => {
    const dailyProgress = {
      '2026-08-10': 5,
      '2026-08-11': 10,
      '2026-08-13': 2, // 2026-08-12 missed
    };
    // Reference date = 2026-08-14 (today). Neither today nor yesterday (2026-08-13) was read? Wait, 13 was yesterday!
    // If today is 2026-08-14 and yesterday (13th) was read, streak is 1.
    const streakResult14 = recalculateStreaks(dailyProgress, '2026-08-14');
    expect(streakResult14.currentStreak).toBe(1);

    // If today is 2026-08-15 and neither today nor yesterday (14th) was read, streak drops to 0.
    const streakResult15 = recalculateStreaks(dailyProgress, '2026-08-15');
    expect(streakResult15.currentStreak).toBe(0);
    expect(streakResult15.longestStreak).toBe(2); // 10 and 11 was 2 days
  });

  // 14. Longest streak
  it('14. preserves longest streak across multiple reading intervals', () => {
    const dailyProgress = {
      '2026-08-01': 5,
      '2026-08-02': 5,
      '2026-08-03': 5,
      '2026-08-04': 5, // 4-day streak
      '2026-08-10': 5,
      '2026-08-11': 5, // 2-day streak
    };
    const { longestStreak } = recalculateStreaks(dailyProgress, '2026-08-11');
    expect(longestStreak).toBe(4);
  });

  // 15. Empty streak
  it('15. returns 0 for streaks when progress is empty', () => {
    const { currentStreak, longestStreak } = recalculateStreaks({}, '2026-08-16');
    expect(currentStreak).toBe(0);
    expect(longestStreak).toBe(0);
  });

  // 16. Defensive handling of invalid verse keys
  it('16. rejects invalid verse keys gracefully', async () => {
    expect(isValidVerseKey('invalid')).toBe(false);
    expect(isValidVerseKey('0:1')).toBe(false);
    expect(isValidVerseKey('115:1')).toBe(false);
    expect(isValidVerseKey('1:0')).toBe(false);
    expect(isValidVerseKey('1:99')).toBe(false); // Surah 1 only has 7 ayahs

    const initial = getDefaultProgressState();
    const result = await recordVerseRead('invalid:key', '2026-08-16', initial);
    expect(result.readVerseKeys).toEqual([]);
  });

  // 17. Persistence round-trip
  it('17. performs fast localStorage persistence round-trip correctly', async () => {
    const state = {
      readVerseKeys: ['1:1', '1:2', '2:255'],
      dailyProgress: { '2026-08-16': 3 },
      currentStreak: 1,
      longestStreak: 1,
      totalReadingEvents: 3,
      lastReadDate: '2026-08-16',
      updatedAt: 123456789,
    };

    await saveDurableQuranProgress(state);
    const loaded = loadCachedQuranProgress();
    expect(loaded.readVerseKeys).toEqual(['1:1', '1:2', '2:255']);
    expect(loaded.dailyProgress).toEqual({ '2026-08-16': 3 });
    expect(loaded.currentStreak).toBe(1);
  });

  // 18. Backward-compatible state loading
  it('18. falls back to legacy reading state safely if new format key is missing', () => {
    const legacy = {
      lastReadSurah: 2,
      lastReadAyah: 255,
      dailyProgress: { '2026-08-10': 15 },
      updatedAt: 100000,
    };
    localStorage.setItem('hayat_quran_reading_state', JSON.stringify(legacy));

    const loaded = loadCachedQuranProgress();
    expect(loaded.dailyProgress).toEqual({ '2026-08-10': 15 });
    expect(loaded.readVerseKeys).toEqual([]);
  });

  // 19. Existing reading position remains intact
  it('19. does not overwrite or corrupt active reader position', async () => {
    const pos = resolveQuranPosition({
      surah: 18,
      ayah: 10,
      page: 294,
      activeReadingMode: 'mushaf',
      updatedAt: Date.now(),
    });
    await saveQuranPosition(pos);

    const progressState = await recordVerseRead('18:10', '2026-08-16');
    expect(progressState.readVerseKeys).toContain('18:10');

    const restoredPos = loadCachedQuranPosition();
    expect(restoredPos.surah).toBe(18);
    expect(restoredPos.ayah).toBe(10);
    expect(restoredPos.page).toBe(294);
  });

  // 20. Existing bookmarks remain intact
  it('20. preserves existing bookmark helper operations without interference', async () => {
    const bookmark: QuranBookmark = {
      id: 'bm_1',
      surahNumber: 3,
      ayahNumber: 18,
      surahName: 'Ali Imran',
      createdAt: Date.now(),
    };

    // Save durable bookmark (stores in IndexedDB, which is mocked or fallback)
    await saveDurableBookmark(bookmark);
    // Bookmark loader should run without throwing
    const loaded = await loadDurableBookmarks();
    expect(Array.isArray(loaded)).toBe(true);
  });

  // 21. Khatmah completion at 100%
  it('21. reports Khatm as 100% complete when all 6236 verses are read', () => {
    // Generate all 6236 verse keys
    const allKeys: string[] = [];
    for (let s = 1; s <= 114; s++) {
      const keys = getSurahVerseKeys(s);
      allKeys.push(...keys);
    }
    expect(allKeys).toHaveLength(TOTAL_CANONICAL_AYAHS);

    const summary = calculateProgress(allKeys);
    expect(summary.totalUniqueVersesRead).toBe(6236);
    expect(summary.completionPercentage).toBe(100);
    expect(summary.remainingVerses).toBe(0);
    expect(summary.pagesCompletedCount).toBe(604);
    expect(summary.juzCompletedCount).toBe(30);
    expect(summary.surahsCompletedCount).toBe(114);
    expect(summary.isKhatmahComplete).toBe(true);
  });

  // 22. No duplicate progress from repeated verse events
  it('22. prevents duplicate counts on dailyProgress for repeated reads of the same verse', async () => {
    let state = getDefaultProgressState();
    state = await recordVerseRead('2:255', '2026-08-16', state);
    state = await recordVerseRead('2:255', '2026-08-16', state);
    state = await recordVerseRead('2:255', '2026-08-16', state);

    expect(state.readVerseKeys).toEqual(['2:255']);
    expect(state.dailyProgress['2026-08-16']).toBe(1);
    expect(state.totalReadingEvents).toBe(3);
  });
});
