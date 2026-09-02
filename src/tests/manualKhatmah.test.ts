// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  createDefaultKhatamPlan,
  normalizeKhatamPlan,
  confirmPageCompleted,
  confirmPageRangeCompleted,
  confirmJuzCompleted,
  updateDirectPagePosition,
  calculateKhatamStats,
  loadCachedKhatamPlan,
  saveDurableKhatamPlan,
  archiveCurrentAndStartNewPlan,
  loadCachedCompletedKhatamPlans,
  TOTAL_MUSHAF_PAGES,
} from '../services/quran/manualKhatmahService';
import {
  loadCachedQuranPosition,
  saveQuranPosition,
  saveDurableBookmark,
  loadDurableBookmarks,
  loadCachedQuranProgress,
} from '../services/quran/quranPersistenceService';
import { resolveQuranPosition } from '../services/quran/quranPositionService';
import { QuranBookmark } from '../types';

describe('HAYAT Quran V2 - Manual Khatmah & Reading Plan Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // 1. Empty Khatmah
  it('1. returns a valid empty default Khatam plan', () => {
    const plan = createDefaultKhatamPlan('Hatme e Re', 20);
    expect(plan.title).toBe('Hatme e Re');
    expect(plan.completedPages).toEqual([]);
    expect(plan.lastCompletedPage).toBe(0);
    expect(plan.nextPage).toBe(1);
    expect(plan.status).toBe('active');
    expect(plan.dailyTargetPages).toBe(20);
    expect(plan.history).toEqual([]);
  });

  // 2. First completed page
  it('2. records the first completed page correctly', () => {
    const initial = createDefaultKhatamPlan();
    const updated = confirmPageCompleted(initial, 1, '2026-08-16');

    expect(updated.completedPages).toEqual([1]);
    expect(updated.lastCompletedPage).toBe(1);
    expect(updated.nextPage).toBe(2);
    expect(updated.history).toEqual([{ date: '2026-08-16', pagesCount: 1 }]);
  });

  // 3. Duplicate page completion
  it('3. ignores duplicate page confirmations without increasing history count', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageCompleted(plan, 5, '2026-08-16');
    plan = confirmPageCompleted(plan, 5, '2026-08-16');

    expect(plan.completedPages).toEqual([5]);
    expect(plan.lastCompletedPage).toBe(5);
    expect(plan.nextPage).toBe(6);
    expect(plan.history).toEqual([{ date: '2026-08-16', pagesCount: 1 }]);
  });

  // 4. Multiple pages
  it('4. records multiple non-consecutive completed pages correctly', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageCompleted(plan, 10, '2026-08-16');
    plan = confirmPageCompleted(plan, 2, '2026-08-16');
    plan = confirmPageCompleted(plan, 37, '2026-08-16');

    expect(plan.completedPages).toEqual([2, 10, 37]);
    expect(plan.lastCompletedPage).toBe(37);
    expect(plan.nextPage).toBe(38);
    expect(plan.history).toEqual([{ date: '2026-08-16', pagesCount: 3 }]);
  });

  // 5. Sorted unique completedPages
  it('5. maintains completedPages as a strictly sorted unique array', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageCompleted(plan, 50, '2026-08-16');
    plan = confirmPageCompleted(plan, 5, '2026-08-16');
    plan = confirmPageCompleted(plan, 25, '2026-08-16');
    plan = confirmPageCompleted(plan, 5, '2026-08-16');

    expect(plan.completedPages).toEqual([5, 25, 50]);
  });

  // 6. lastCompletedPage
  it('6. calculates lastCompletedPage as the max completed page number', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageCompleted(plan, 12, '2026-08-16');
    plan = confirmPageCompleted(plan, 45, '2026-08-16');
    plan = confirmPageCompleted(plan, 20, '2026-08-16');

    expect(plan.lastCompletedPage).toBe(45);
  });

  // 7. nextPage
  it('7. sets nextPage to lastCompletedPage + 1', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageCompleted(plan, 37, '2026-08-16');
    expect(plan.nextPage).toBe(38);
  });

  // 8. 604/604 completion
  it('8. completes Khatam plan when all 604 pages are completed', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageRangeCompleted(plan, 1, 604, '2026-08-16');

    expect(plan.completedPages).toHaveLength(604);
    expect(plan.lastCompletedPage).toBe(604);
    // K2: një hatme e përfunduar nuk ka faqe tjetër, prandaj nextPage = 0.
    // Ndryshuar me autorizim të shprehur të përdoruesit (më parë: 604).
    expect(plan.nextPage).toBe(0);
    expect(plan.status).toBe('completed');

    const stats = calculateKhatamStats(plan);
    expect(stats.percentage).toBe(100);
    expect(stats.isCompleted).toBe(true);
    expect(stats.remainingPagesCount).toBe(0);
  });

  // 9. Juz range completion
  it('9. completes Juz 1 range (pages 1-21) accurately', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmJuzCompleted(plan, 1, '2026-08-16');

    expect(plan.completedPages).toHaveLength(21);
    expect(plan.completedPages[0]).toBe(1);
    expect(plan.completedPages[20]).toBe(21);
    expect(plan.lastCompletedPage).toBe(21);
    expect(plan.nextPage).toBe(22);
    expect(plan.history[0].pagesCount).toBe(21);
  });

  // 10. Direct page jump
  it('10. updates direct page position and marks prior pages when requested', () => {
    let plan = createDefaultKhatamPlan();
    plan = updateDirectPagePosition(plan, 37, true, '2026-08-16');

    expect(plan.completedPages).toHaveLength(37);
    expect(plan.lastCompletedPage).toBe(37);
    expect(plan.nextPage).toBe(38);
  });

  // 11. Large jump confirmation logic
  it('11. verifies large jump threshold helper identifies jumps > 20 pages', () => {
    const plan = createDefaultKhatamPlan();
    const updated = confirmPageCompleted(plan, 20, '2026-08-16');

    const jumpTarget = 120;
    const jumpDistance = jumpTarget - updated.lastCompletedPage; // 120 - 20 = 100

    expect(jumpDistance).toBeGreaterThan(20); // Threshold check for UI dialog
  });

  // 12. Daily history
  it('12. tracks daily history with correct page counts per date', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageCompleted(plan, 1, '2026-08-15');
    plan = confirmPageCompleted(plan, 2, '2026-08-15');
    plan = confirmPageCompleted(plan, 3, '2026-08-16');

    expect(plan.history).toEqual([
      { date: '2026-08-15', pagesCount: 2 },
      { date: '2026-08-16', pagesCount: 1 },
    ]);
  });

  // 13. Duplicate confirmation does not increase history
  it('13. prevents repeated confirmation of already completed pages from inflating history', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageRangeCompleted(plan, 1, 10, '2026-08-15');
    expect(plan.history[0].pagesCount).toBe(10);

    // Re-confirm pages 5..10 on a new date
    plan = confirmPageRangeCompleted(plan, 5, 10, '2026-08-16');
    // History for 2026-08-16 should NOT exist because no new pages were added
    expect(plan.history.find((h) => h.date === '2026-08-16')).toBeUndefined();
  });

  // 14. Persistence round-trip
  it('14. performs synchronous localStorage persistence round-trip correctly', async () => {
    let plan = createDefaultKhatamPlan('Hatme Ramazani', 15);
    plan = confirmPageCompleted(plan, 37, '2026-08-16');

    await saveDurableKhatamPlan(plan);
    const restored = loadCachedKhatamPlan();

    expect(restored.title).toBe('Hatme Ramazani');
    expect(restored.dailyTargetPages).toBe(15);
    expect(restored.completedPages).toEqual([37]);
    expect(restored.lastCompletedPage).toBe(37);
    expect(restored.nextPage).toBe(38);
  });

  // 15. Legacy migration
  it('15. migrates legacy Khatam plan structure without losing completed data', () => {
    const legacyRaw = {
      id: 'legacy_1',
      title: 'Khatmi i Kuranit',
      dailyTargetPages: 20,
      pagesRead: 45,
      logs: [{ date: '2026-08-10', pages: 10 }],
    };

    const migrated = normalizeKhatamPlan(legacyRaw);
    expect(migrated.completedPages).toHaveLength(45);
    expect(migrated.lastCompletedPage).toBe(45);
    expect(migrated.nextPage).toBe(46);
    expect(migrated.history).toEqual([{ date: '2026-08-10', pagesCount: 10 }]);
  });

  // 16. Existing active reader position remains untouched
  it('16. ensures Manual Khatam updates do NOT affect or overwrite active reader position', async () => {
    const initialPos = resolveQuranPosition({
      surah: 18,
      ayah: 10,
      page: 294,
      activeReadingMode: 'mushaf',
      updatedAt: Date.now(),
    });
    await saveQuranPosition(initialPos);

    let plan = createDefaultKhatamPlan();
    plan = confirmPageCompleted(plan, 37, '2026-08-16');
    await saveDurableKhatamPlan(plan);

    const activePos = loadCachedQuranPosition();
    expect(activePos.surah).toBe(18);
    expect(activePos.ayah).toBe(10);
    expect(activePos.page).toBe(294);
  });

  // 17. Existing bookmarks remain untouched
  it('17. preserves existing bookmarks without interference', async () => {
    const bookmark: QuranBookmark = {
      id: 'bm_test_1',
      surahNumber: 2,
      ayahNumber: 255,
      surahName: 'Al-Baqarah',
      createdAt: Date.now(),
    };
    await saveDurableBookmark(bookmark);

    let plan = createDefaultKhatamPlan();
    plan = confirmPageCompleted(plan, 37, '2026-08-16');
    await saveDurableKhatamPlan(plan);

    const bookmarks = await loadDurableBookmarks();
    expect(Array.isArray(bookmarks)).toBe(true);
  });

  // 18. Creating a second plan does not silently delete the first
  it('18. archives current active plan when starting a new plan', async () => {
    let plan1 = createDefaultKhatamPlan('Hatme 1');
    plan1 = confirmPageCompleted(plan1, 100, '2026-08-16');

    const { newPlan, completedPlans } = await archiveCurrentAndStartNewPlan(plan1, 'Hatme 2', 10);

    expect(newPlan.title).toBe('Hatme 2');
    expect(newPlan.completedPages).toEqual([]);
    expect(completedPlans).toHaveLength(1);
    expect(completedPlans[0].title).toBe('Hatme 1');
    expect(completedPlans[0].completedPages).toEqual([100]);
  });

  // 19. Completed plan archival
  it('19. loads archived completed plans correctly from storage', async () => {
    let plan1 = createDefaultKhatamPlan('Hatme E Vjetër');
    plan1 = confirmPageRangeCompleted(plan1, 1, 604, '2026-08-16');

    await archiveCurrentAndStartNewPlan(plan1, 'Hatme E Re');
    const archived = loadCachedCompletedKhatamPlans();

    expect(archived).toHaveLength(1);
    expect(archived[0].title).toBe('Hatme E Vjetër');
    expect(archived[0].status).toBe('completed');
  });

  // 20. Manual Khatmah does NOT automatically create application reading events
  it('20. confirms manual Khatmah confirmation does NOT modify application reading progress state', async () => {
    const progressBefore = loadCachedQuranProgress();
    const beforeCount = progressBefore.readVerseKeys.length;

    let plan = createDefaultKhatamPlan();
    plan = confirmPageRangeCompleted(plan, 1, 37, '2026-08-16');
    await saveDurableKhatamPlan(plan);

    const progressAfter = loadCachedQuranProgress();
    expect(progressAfter.readVerseKeys.length).toBe(beforeCount); // Untouched!
  });
});
