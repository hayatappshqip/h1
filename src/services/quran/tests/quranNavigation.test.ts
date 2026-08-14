import { describe, it, expect } from 'vitest';
import {
  createInitialNavigationState,
  navigateNextPage,
  navigatePrevPage,
  navigateToPage,
  navigateToSurah,
  navigateToJuz,
  calculateSpreadPages,
} from '../quranNavigationService';

describe('Quran Navigation Service (Phase 0 Foundation)', () => {
  it('should initialize navigation state correctly for single page mode', () => {
    const state = createInitialNavigationState({ page: 42 });
    expect(state.currentPosition.page).toBe(42);
    expect(state.currentPosition.surah).toBe(2);
    expect(state.currentPosition.ayah).toBe(253);
    expect(state.currentPosition.juz).toBe(3);
    expect(state.readingMode).toBe('mushaf');
    expect(state.isTwoPageSpread).toBe(false);
  });

  it('should calculate 2-page book spread pages correctly for RTL layout', () => {
    // Page 1 is always standalone right
    expect(calculateSpreadPages(1)).toEqual([1, null]);

    // Page 2 (even) -> [2, 3] (Page 2 on right, Page 3 on left)
    expect(calculateSpreadPages(2)).toEqual([2, 3]);

    // Page 3 (odd) -> [2, 3] (part of the 2-3 spread)
    expect(calculateSpreadPages(3)).toEqual([2, 3]);

    // Page 42 (even) -> [42, 43]
    expect(calculateSpreadPages(42)).toEqual([42, 43]);

    // Page 604 -> [604, null]
    expect(calculateSpreadPages(604)).toEqual([604, null]);
  });

  it('should handle single-page next and prev navigation', () => {
    let state = createInitialNavigationState({ page: 1 });
    state = navigateNextPage(state);
    expect(state.currentPosition.page).toBe(2);

    state = navigateNextPage(state);
    expect(state.currentPosition.page).toBe(3);

    state = navigatePrevPage(state);
    expect(state.currentPosition.page).toBe(2);

    state = navigatePrevPage(state);
    expect(state.currentPosition.page).toBe(1);

    // Prev at boundary (page 1) should remain at page 1
    state = navigatePrevPage(state);
    expect(state.currentPosition.page).toBe(1);
  });

  it('should handle spread two-page next and prev navigation', () => {
    let state = createInitialNavigationState({ page: 2, isTwoPageSpread: true });
    expect(state.spreadPages).toEqual([2, 3]);

    state = navigateNextPage(state); // steps by 2
    expect(state.currentPosition.page).toBe(4);
    expect(state.spreadPages).toEqual([4, 5]);

    state = navigatePrevPage(state);
    expect(state.currentPosition.page).toBe(2);
    expect(state.spreadPages).toEqual([2, 3]);
  });

  it('should jump to specific page, surah, and juz', () => {
    let state = createInitialNavigationState({ page: 1 });

    state = navigateToPage(state, 50);
    expect(state.currentPosition.page).toBe(50);
    expect(state.currentPosition.surah).toBe(3); // Ali 'Imran

    state = navigateToSurah(state, 18); // Al-Kahf
    expect(state.currentPosition.page).toBe(293);
    expect(state.currentPosition.surah).toBe(18);
    expect(state.currentPosition.ayah).toBe(1);

    state = navigateToJuz(state, 30);
    expect(state.currentPosition.page).toBe(582);
    expect(state.currentPosition.juz).toBe(30);
  });
});
