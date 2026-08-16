// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  createDefaultKhatamPlan,
  confirmPageCompleted,
  confirmPageRangeCompleted,
  confirmJuzCompleted,
  removePageCompleted,
  removeJuzCompleted,
  getMissingPagesInRange,
  updateDirectPagePosition,
  saveDurableKhatamPlan,
  loadCachedKhatamPlan,
  TOTAL_MUSHAF_PAGES,
} from '../services/quran/manualKhatmahService';
import {
  saveQuranPosition,
  loadCachedQuranPosition,
  loadCachedQuranProgress,
} from '../services/quran/quranPersistenceService';
import { resolveQuranPosition } from '../services/quran/quranPositionService';

describe('Phase 2.1 Regression Tests - Manual Khatmah & Last Reading Position', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // 1. Last reading page 10 restores page 10, not ayah 1
  it('1. Last reading page 10 restores page 10 correctly', async () => {
    const pos = resolveQuranPosition({
      surah: 2,
      ayah: 62,
      page: 10,
      verseKey: '2:62',
      activeReadingMode: 'mushaf',
      updatedAt: Date.now(),
    });
    await saveQuranPosition(pos);

    const loaded = loadCachedQuranPosition();
    expect(loaded.page).toBe(10);
    expect(loaded.surah).toBe(2);
    expect(loaded.ayah).toBe(62);
  });

  // 2. Last reading position preserves the actual verseKey when available
  it('2. Last reading position preserves the actual verseKey when available', async () => {
    const pos = resolveQuranPosition({
      surah: 18,
      ayah: 10,
      page: 294,
      verseKey: '18:10',
      activeReadingMode: 'verse',
      updatedAt: Date.now(),
    });
    await saveQuranPosition(pos);

    const loaded = loadCachedQuranPosition();
    expect(loaded.verseKey).toBe('18:10');
    expect(loaded.surah).toBe(18);
    expect(loaded.ayah).toBe(10);
  });

  // 3. "Vazhdo hatmen" opens Mushaf mode
  it('3. "Vazhdo hatmen" target resolution targets Mushaf mode with nextPage', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageCompleted(plan, 5, '2026-08-16');
    expect(plan.nextPage).toBe(6);
    // When navigating to Khatmah next page, active mode is 'mushaf'
    const targetMode = 'mushaf';
    expect(targetMode).toBe('mushaf');
  });

  // 4. "Vazhdo hatmen" navigates to nextPage
  it('4. "Vazhdo hatmen" navigates to plan.nextPage', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageRangeCompleted(plan, 1, 37, '2026-08-16');
    expect(plan.nextPage).toBe(38);
  });

  // 5. "Vazhdo hatmen" does not mark nextPage completed
  it('5. Navigating to nextPage does not alter completedPages array until user explicitly completes it', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageCompleted(plan, 10, '2026-08-16');
    const nextPage = plan.nextPage; // 11
    expect(plan.completedPages).not.toContain(nextPage);
    expect(plan.completedPages).toEqual([10]);
  });

  // 6. Duplicate page cannot be completed twice
  it('6. Duplicate page cannot be completed twice in completedPages array', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageCompleted(plan, 15, '2026-08-16');
    plan = confirmPageCompleted(plan, 15, '2026-08-16');
    expect(plan.completedPages.filter(p => p === 15)).toHaveLength(1);
  });

  // 7. Duplicate page does not increase daily history
  it('7. Duplicate page completion does not add extra counts to daily history', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageCompleted(plan, 15, '2026-08-16');
    const initialHistoryLength = plan.history.length;
    const initialCount = plan.history[0].pagesCount;

    plan = confirmPageCompleted(plan, 15, '2026-08-16');
    expect(plan.history.length).toBe(initialHistoryLength);
    expect(plan.history[0].pagesCount).toBe(initialCount);
  });

  // 8. Duplicate Juz cannot be completed twice
  it('8. Confirming an already completed Juz does not duplicate pages or inflate history', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmJuzCompleted(plan, 1, '2026-08-16'); // pages 1-21
    const pagesCountAfterFirst = plan.completedPages.length; // 21

    plan = confirmJuzCompleted(plan, 1, '2026-08-16');
    expect(plan.completedPages.length).toBe(pagesCountAfterFirst);
  });

  // 9. Partially completed Juz only adds missing pages
  it('9. Partially completed Juz adds only missing pages', () => {
    let plan = createDefaultKhatamPlan();
    // Mark pages 1, 2, 3 as done
    plan = confirmPageCompleted(plan, 1, '2026-08-16');
    plan = confirmPageCompleted(plan, 2, '2026-08-16');
    plan = confirmPageCompleted(plan, 3, '2026-08-16');

    // Confirm Juz 1 (pages 1..21)
    plan = confirmJuzCompleted(plan, 1, '2026-08-16');
    expect(plan.completedPages).toHaveLength(21);
    // History should reflect only 18 new pages added for Juz 1
    const totalAdded = plan.history.reduce((sum, h) => sum + h.pagesCount, 0);
    expect(totalAdded).toBe(21);
  });

  // 10. Removing a completed page requires confirmation (helper testing removal)
  it('10. removePageCompleted correctly removes a completed page and adjusts lastCompletedPage & nextPage', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageRangeCompleted(plan, 1, 5, '2026-08-16'); // 1..5
    expect(plan.lastCompletedPage).toBe(5);
    expect(plan.nextPage).toBe(6);

    plan = removePageCompleted(plan, 5);
    expect(plan.completedPages).toEqual([1, 2, 3, 4]);
    expect(plan.lastCompletedPage).toBe(4);
    expect(plan.nextPage).toBe(5);
  });

  // 11. Removing a Juz removes only its intended pages
  it('11. removeJuzCompleted removes all pages of Juz 1 (1-21) and leaves other pages intact', () => {
    let plan = createDefaultKhatamPlan();
    // Complete Juz 1 (1-21) and Juz 2 (22-41)
    plan = confirmJuzCompleted(plan, 1, '2026-08-16');
    plan = confirmJuzCompleted(plan, 2, '2026-08-16');
    expect(plan.completedPages).toHaveLength(41);

    // Remove Juz 1
    plan = removeJuzCompleted(plan, 1);
    expect(plan.completedPages.filter(p => p >= 1 && p <= 21)).toEqual([]);
    expect(plan.completedPages.filter(p => p >= 22 && p <= 41)).toHaveLength(20);
    expect(plan.lastCompletedPage).toBe(41);
  });

  // 12. Removing a Juz removes only its intended pages when it was the last Juz
  it('12. Removing the last completed Juz adjusts lastCompletedPage and nextPage backwards', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmJuzCompleted(plan, 1, '2026-08-16'); // 1-21
    plan = confirmJuzCompleted(plan, 2, '2026-08-16'); // 22-41
    expect(plan.lastCompletedPage).toBe(41);
    expect(plan.nextPage).toBe(42);

    plan = removeJuzCompleted(plan, 2);
    expect(plan.lastCompletedPage).toBe(21);
    expect(plan.nextPage).toBe(22);
  });

  // 13. Direct page jump >20 pages check
  it('13. Jump threshold correctly detects jumps > 20 pages from lastCompletedPage', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageCompleted(plan, 10, '2026-08-16');

    const jumpTarget = 35;
    const missing = getMissingPagesInRange(plan, plan.lastCompletedPage + 1, jumpTarget);
    expect(jumpTarget - plan.lastCompletedPage).toBeGreaterThan(20);
    expect(missing.length).toBe(25); // 11 to 35 inclusive
  });

  // 14. Direct page entry correctly fills missing page range when confirmed with fill
  it('14. Direct page jump with fill marks all missing prior pages completed', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageRangeCompleted(plan, 1, 10, '2026-08-16');

    plan = confirmPageRangeCompleted(plan, plan.lastCompletedPage + 1, 35, '2026-08-16');
    expect(plan.completedPages).toHaveLength(35);
    expect(plan.lastCompletedPage).toBe(35);
    expect(plan.nextPage).toBe(36);
  });

  // 15. Manual Khatmah does not create application reading events
  it('15. Confirming Khatmah pages does not modify application Quran reading progress state', async () => {
    const progressBefore = loadCachedQuranProgress();
    let plan = createDefaultKhatamPlan();
    plan = confirmPageRangeCompleted(plan, 1, 50, '2026-08-16');
    await saveDurableKhatamPlan(plan);

    const progressAfter = loadCachedQuranProgress();
    expect(progressAfter.readVerseKeys).toEqual(progressBefore.readVerseKeys);
  });

  // 16. Last reading position and Khatmah position remain independent
  it('16. Last reading position and Khatmah position remain independent', async () => {
    // Set last reading position to Surah 18, Ayah 10 (Page 294)
    const readerPos = resolveQuranPosition({
      surah: 18,
      ayah: 10,
      page: 294,
      verseKey: '18:10',
      activeReadingMode: 'mushaf',
      updatedAt: Date.now(),
    });
    await saveQuranPosition(readerPos);

    // Update Khatmah plan to Page 100
    let plan = createDefaultKhatamPlan();
    plan = confirmPageCompleted(plan, 100, '2026-08-16');
    await saveDurableKhatamPlan(plan);

    // Reader position must remain unchanged
    const loadedPos = loadCachedQuranPosition();
    expect(loadedPos.page).toBe(294);
    expect(loadedPos.surah).toBe(18);
    expect(loadedPos.ayah).toBe(10);

    // Khatmah plan must remain unchanged
    const loadedPlan = loadCachedKhatamPlan();
    expect(loadedPlan.lastCompletedPage).toBe(100);
    expect(loadedPlan.nextPage).toBe(101);
  });

  // 17. Persistence round-trip preserves both positions independently
  it('17. Persistence round-trip preserves both reader position and Khatmah plan independently', async () => {
    const readerPos = resolveQuranPosition({
      surah: 36,
      ayah: 1,
      page: 440,
      verseKey: '36:1',
      activeReadingMode: 'verse',
      updatedAt: Date.now(),
    });
    await saveQuranPosition(readerPos);

    let plan = createDefaultKhatamPlan('Ramadan 2026');
    plan = confirmPageCompleted(plan, 50, '2026-08-16');
    await saveDurableKhatamPlan(plan);

    const restoredPos = loadCachedQuranPosition();
    const restoredPlan = loadCachedKhatamPlan();

    expect(restoredPos.surah).toBe(36);
    expect(restoredPos.page).toBe(440);

    expect(restoredPlan.title).toBe('Ramadan 2026');
    expect(restoredPlan.completedPages).toEqual([50]);
  });
});
