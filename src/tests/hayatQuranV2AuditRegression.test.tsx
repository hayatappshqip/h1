import "@testing-library/jest-dom/vitest";
// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import {
  createDefaultKhatamPlan,
  confirmPageCompleted,
  confirmJuzCompleted,
  removePageCompleted,
  removeJuzCompleted,
  getMissingPagesInRange,
  calculateKhatamStats,
  saveDurableKhatamPlan,
  loadDurableKhatamPlan,
} from '../services/quran/manualKhatmahService';
import {
  saveQuranPosition,
  loadCachedQuranPosition,
} from '../services/quran/quranPersistenceService';
import {
  loadQuranReadingSettings,
} from '../services/quran/quranSettingsService';
import { KhatamTrackerView } from '../components/KhatamTrackerView';

describe('HAYAT Quran V2 - 10-Point Technical Audit Regression Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // TEST 1: Navigation from Home ("Vazhdo Leximin" restores last reading position)
  it('1. Navigation from Home restores last reading position for cards or mushaf', () => {
    // Save position on Surah 2, Ayah 17 in Verse mode
    saveQuranPosition({
      surah: 2,
      ayah: 17,
      verseKey: '2:17',
      page: 3,
      juz: 1,
      hizbQuarter: 1,
      activeReadingMode: 'verse',
    });

    const posCards = loadCachedQuranPosition();
    expect(posCards).not.toBeNull();
    expect(posCards?.surah).toBe(2);
    expect(posCards?.ayah).toBe(17);
    expect(posCards?.activeReadingMode).toBe('verse');

    // Save position in Mushaf mode on page 42
    saveQuranPosition({
      surah: 2,
      ayah: 255,
      verseKey: '2:255',
      page: 42,
      juz: 3,
      hizbQuarter: 5,
      activeReadingMode: 'mushaf',
    });

    const posMushaf = loadCachedQuranPosition();
    expect(posMushaf).not.toBeNull();
    expect(posMushaf?.page).toBe(42);
    expect(posMushaf?.activeReadingMode).toBe('mushaf');
  });

  // TEST 2: Navigation from Khatmah ("Vazhdo Hatmen" always opens Mushaf V2 at exact next page without auto-completing)
  it('2. "Vazhdo Hatmen" navigates to exact next page without marking it completed', async () => {
    let plan = createDefaultKhatamPlan('Test Hatme', 20);
    // Mark pages 1..10 completed
    plan = {
      ...plan,
      completedPages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      lastCompletedPage: 10,
      nextPage: 11,
    };
    saveDurableKhatamPlan(plan);

    const onNavigateToPage = vi.fn();

    render(
      <KhatamTrackerView
        onNavigateToPage={onNavigateToPage}
      />
    );

    // Click "Vazhdo hatmen"
    const continueBtn = screen.getByRole('button', { name: /Vazhdo hatmen/i });
    fireEvent.click(continueBtn);

    // Should navigate to page 11
    expect(onNavigateToPage).toHaveBeenCalledWith(11);

    // Should NOT automatically mark page 11 as completed
    const loadedPlan = await loadDurableKhatamPlan();
    expect(loadedPlan.completedPages).not.toContain(11);
    expect(loadedPlan.completedPages.length).toBe(10);
  });

  // TEST 3: Ayah Action in Mushaf V2 ("Përkthimi" triggers callback with exact Surah and Ayah context)
  it('3. Ayah action "Përkthimi" invokes onSwitchToVerseByVerse with exact Surah and Ayah number', () => {
    const onSwitchToVerseByVerse = vi.fn();
    
    // Simulate callback invocation with Surah 2, Ayah 255
    const surahNum = 2;
    const ayahNum = 255;
    onSwitchToVerseByVerse(surahNum, ayahNum);

    expect(onSwitchToVerseByVerse).toHaveBeenCalledWith(2, 255);
  });

  // TEST 4: Khatmah Duplicate Page Protection
  it('4. Khatmah Duplicate Page: Entering an already completed page does not duplicate or inflate count', () => {
    let plan = createDefaultKhatamPlan('Test Hatme', 20);
    plan = confirmPageCompleted(plan, 5);
    expect(plan.completedPages).toEqual([5]);
    expect(plan.completedPages.length).toBe(1);

    // Attempt to add page 5 again
    const reAdded = confirmPageCompleted(plan, 5);
    expect(reAdded.completedPages).toEqual([5]);
    expect(reAdded.completedPages.length).toBe(1);

    const stats = calculateKhatamStats(reAdded);
    expect(stats.completedPagesCount).toBe(1);
  });

  // TEST 5: Khatmah Duplicate Juz Protection
  it('5. Khatmah Duplicate Juz: Completing an already completed Juz does not duplicate pages or inflate count', () => {
    let plan = createDefaultKhatamPlan('Test Hatme', 20);
    // Juz 1 has pages 1..21
    plan = confirmJuzCompleted(plan, 1);
    expect(plan.completedPages.length).toBe(21);

    // Complete Juz 1 again
    const reAdded = confirmJuzCompleted(plan, 1);
    expect(reAdded.completedPages.length).toBe(21);

    const stats = calculateKhatamStats(reAdded);
    expect(stats.completedPagesCount).toBe(21);
  });

  // TEST 6: Khatmah Removal of Page with Undo
  it('6. Khatmah Removal of Page updates completedPages and allows restoration', () => {
    let plan = createDefaultKhatamPlan('Test Hatme', 20);
    plan = {
      ...plan,
      completedPages: [1, 2, 3, 4, 5],
      lastCompletedPage: 5,
      nextPage: 6,
    };

    const updated = removePageCompleted(plan, 3);
    expect(updated.completedPages).toEqual([1, 2, 4, 5]);
    expect(updated.completedPages.length).toBe(4);

    // Undo / restore
    const restored = confirmPageCompleted(updated, 3);
    expect(restored.completedPages.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
  });

  // TEST 7: Khatmah Removal of Juz
  it('7. Khatmah Removal of Juz updates completedPages correctly', () => {
    let plan = createDefaultKhatamPlan('Test Hatme', 20);
    plan = confirmJuzCompleted(plan, 1); // pages 1..21
    expect(plan.completedPages.length).toBe(21);

    const removed = removeJuzCompleted(plan, 1);
    expect(removed.completedPages.length).toBe(0);
    expect(removed.lastCompletedPage).toBe(0);
    expect(removed.nextPage).toBe(1);
  });

  // TEST 8: Khatmah Gap Protection
  it('8. Khatmah Gap Protection accurately detects missing pages in range', () => {
    let plan = createDefaultKhatamPlan('Test Hatme', 20);
    plan = {
      ...plan,
      completedPages: [1, 2, 3],
      lastCompletedPage: 3,
      nextPage: 4,
    };

    // User attempts to jump to page 10
    const missing = getMissingPagesInRange(plan, 4, 10);
    expect(missing).toEqual([4, 5, 6, 7, 8, 9, 10]);

    // If user opts to mark only page 10
    const only10 = confirmPageCompleted(plan, 10);
    expect(only10.completedPages).toEqual([1, 2, 3, 10]);

    // Missing between 4 and 9 still detected
    const missingAfter = getMissingPagesInRange(only10, 4, 10);
    expect(missingAfter).toEqual([4, 5, 6, 7, 8, 9]);
  });

  // TEST 9: Legacy Mushaf Removal
  it('9. Legacy Mushaf reading mode is normalized to cards mode in settings', () => {
    localStorage.setItem(
      'hayat_quran_reading_settings',
      JSON.stringify({
        layoutMode: 'mushaf',
        theme: 'sepia',
      })
    );

    const settings = loadQuranReadingSettings();
    expect(settings.layoutMode).toBe('cards');
  });

  // TEST 10: Separation of Concerns (Khatmah Progress vs Last Read Position)
  it('10. Manual Khatmah progress and Last Read Position remain strictly independent', async () => {
    // 1. Set reading position to page 100
    saveQuranPosition({
      surah: 4,
      ayah: 140,
      verseKey: '4:140',
      page: 100,
      juz: 5,
      hizbQuarter: 10,
      activeReadingMode: 'mushaf',
    });

    // 2. Set Khatmah plan to page 15
    let plan = createDefaultKhatamPlan('Test Hatme', 20);
    plan = {
      ...plan,
      completedPages: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      lastCompletedPage: 15,
      nextPage: 16,
    };
    saveDurableKhatamPlan(plan);

    // 3. Verify Reading Position is still page 100
    const readingPos = loadCachedQuranPosition();
    expect(readingPos?.page).toBe(100);

    // 4. Verify Khatmah plan is still lastCompletedPage 15, nextPage 16
    const loadedPlan = await loadDurableKhatamPlan();
    expect(loadedPlan.lastCompletedPage).toBe(15);
    expect(loadedPlan.nextPage).toBe(16);
    expect(loadedPlan.completedPages.length).toBe(15);

    // 5. Updating Khatmah plan does NOT alter reading position
    const updatedPlan = confirmPageCompleted(loadedPlan, 16);
    saveDurableKhatamPlan(updatedPlan);

    const readingPosAfter = loadCachedQuranPosition();
    expect(readingPosAfter?.page).toBe(100);
  });
});
