/**
 * Centralized Quran Engine Context & State Management
 * Single source of truth for Quran position and navigation across all reading modes.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { QuranPosition } from '../types/quran';
import {
  QuranNavigationState,
  QuranReadingMode,
  createInitialNavigationState,
  navigateNextPage,
  navigatePrevPage,
  navigateToPage,
  navigateToSurah,
  navigateToJuz,
  navigateToHizbQuarter,
  navigateToVerse,
  setTwoPageSpread as applySpread,
  setReadingMode as applyReadingMode,
} from '../services/quran/quranNavigationService';
import {
  loadCachedQuranPosition,
  loadDurableQuranPosition,
  saveQuranPosition,
} from '../services/quran/quranPersistenceService';

export interface QuranPositionContextValue {
  navigationState: QuranNavigationState;
  currentPosition: QuranPosition;
  currentPage: number;
  readingMode: QuranReadingMode;
  isTwoPageSpread: boolean;
  spreadPages: [number, number | null];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToSurah: (surah: number) => void;
  goToJuz: (juz: number) => void;
  goToHizbQuarter: (quarter: number) => void;
  goToVerse: (input: { verseKey?: string; surah?: number; ayah?: number }) => void;
  setTwoPageSpread: (spread: boolean) => void;
  setReadingMode: (mode: QuranReadingMode) => void;
}

const QuranPositionContext = createContext<QuranPositionContextValue | null>(null);

export const QuranPositionProvider: React.FC<{
  children: React.ReactNode;
  initialPage?: number;
  initialSurah?: number;
  initialAyah?: number;
}> = ({ children, initialPage, initialSurah, initialAyah }) => {
  // Initialize synchronously with cached hint or passed props
  const [navState, setNavState] = useState<QuranNavigationState>(() => {
    if (initialPage || initialSurah) {
      return createInitialNavigationState({
        page: initialPage,
        surah: initialSurah,
        ayah: initialAyah,
      });
    }
    const cached = loadCachedQuranPosition();
    return createInitialNavigationState({
      page: cached.page,
      surah: cached.surah,
      ayah: cached.ayah,
      mode: cached.activeReadingMode === 'verse' ? 'by_verse' : 'mushaf',
    });
  });

  // Reconcile with IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    if (!initialPage && !initialSurah) {
      loadDurableQuranPosition().then((durable) => {
        if (!isMounted) return;
        if (durable.updatedAt && durable.updatedAt > (navState.currentPosition.updatedAt || 0)) {
          setNavState(createInitialNavigationState({
            page: durable.page,
            surah: durable.surah,
            ayah: durable.ayah,
          }));
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, []);

  // Persist position whenever it changes
  useEffect(() => {
    saveQuranPosition(navState.currentPosition);
  }, [navState.currentPosition]);

  // Actions
  const goToPage = useCallback((page: number) => {
    setNavState((prev) => navigateToPage(prev, page));
  }, []);

  const nextPage = useCallback(() => {
    setNavState((prev) => navigateNextPage(prev));
  }, []);

  const prevPage = useCallback(() => {
    setNavState((prev) => navigatePrevPage(prev));
  }, []);

  const goToSurah = useCallback((surah: number) => {
    setNavState((prev) => navigateToSurah(prev, surah));
  }, []);

  const goToJuz = useCallback((juz: number) => {
    setNavState((prev) => navigateToJuz(prev, juz));
  }, []);

  const goToHizbQuarter = useCallback((quarter: number) => {
    setNavState((prev) => navigateToHizbQuarter(prev, quarter));
  }, []);

  const goToVerse = useCallback((input: { verseKey?: string; surah?: number; ayah?: number }) => {
    setNavState((prev) => navigateToVerse(prev, input));
  }, []);

  const setTwoPageSpread = useCallback((spread: boolean) => {
    setNavState((prev) => applySpread(prev, spread));
  }, []);

  const setReadingMode = useCallback((mode: QuranReadingMode) => {
    setNavState((prev) => applyReadingMode(prev, mode));
  }, []);

  const value = useMemo<QuranPositionContextValue>(() => ({
    navigationState: navState,
    currentPosition: navState.currentPosition,
    currentPage: navState.currentPosition.page,
    readingMode: navState.readingMode,
    isTwoPageSpread: navState.isTwoPageSpread,
    spreadPages: navState.spreadPages,
    goToPage,
    nextPage,
    prevPage,
    goToSurah,
    goToJuz,
    goToHizbQuarter,
    goToVerse,
    setTwoPageSpread,
    setReadingMode,
  }), [navState, goToPage, nextPage, prevPage, goToSurah, goToJuz, goToHizbQuarter, goToVerse, setTwoPageSpread, setReadingMode]);

  return (
    <QuranPositionContext.Provider value={value}>
      {children}
    </QuranPositionContext.Provider>
  );
};

export function useQuranPosition(): QuranPositionContextValue {
  const context = useContext(QuranPositionContext);
  if (!context) {
    throw new Error('useQuranPosition must be used within a QuranPositionProvider');
  }
  return context;
}
