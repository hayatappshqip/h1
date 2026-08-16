/**
 * HAYAT Quran V2 - Reading Progress & Khatmah Service (Phase 1 Foundation)
 * Canonical identity: Verse Key ("surah:ayah")
 * All Page, Juz, Hizb, and Surah progress metrics are strictly derived views.
 */
import { QuranProgressState } from '../../types';
import { ALL_SURAHS_META } from '../../data/quranData';
import { ALL_JUZ_META } from '../../data/juzData';
import { CANONICAL_MUSHAF_PAGES_DATA } from '../../data/canonicalMushafManifest';
import { getLocalDateString } from '../../utils/dateUtils';
import {
  loadCachedQuranProgress,
  loadDurableQuranProgress,
  saveDurableQuranProgress,
} from './quranPersistenceService';

export const TOTAL_CANONICAL_AYAHS = ALL_SURAHS_META.reduce((acc, s) => acc + s.numberOfAyahs, 0); // 6236

/**
 * Returns default empty progress state.
 */
export function getDefaultProgressState(): QuranProgressState {
  return {
    readVerseKeys: [],
    dailyProgress: {},
    currentStreak: 0,
    longestStreak: 0,
    totalReadingEvents: 0,
    updatedAt: Date.now(),
  };
}

/**
 * Validates whether a string is a valid Quran verseKey (e.g. "1:1", "2:255").
 */
export function isValidVerseKey(verseKey: string): boolean {
  if (!verseKey || typeof verseKey !== 'string') return false;
  const parts = verseKey.split(':');
  if (parts.length !== 2) return false;
  const surah = parseInt(parts[0], 10);
  const ayah = parseInt(parts[1], 10);
  if (isNaN(surah) || isNaN(ayah) || surah < 1 || surah > 114 || ayah < 1) return false;
  const surahMeta = ALL_SURAHS_META[surah - 1];
  if (!surahMeta || ayah > surahMeta.numberOfAyahs) return false;
  return true;
}

/**
 * Returns all verse keys for a given Surah (1..114).
 */
export function getSurahVerseKeys(surahNumber: number): string[] {
  if (surahNumber < 1 || surahNumber > 114) return [];
  const meta = ALL_SURAHS_META[surahNumber - 1];
  if (!meta) return [];
  const keys: string[] = [];
  for (let a = 1; a <= meta.numberOfAyahs; a++) {
    keys.push(`${surahNumber}:${a}`);
  }
  return keys;
}

/**
 * Helper to collect all verse keys in a range from startSurah:startAyah to endSurah:endAyah.
 */
export function getVerseKeysInRange(
  startSurah: number,
  startAyah: number,
  endSurah: number,
  endAyah: number
): string[] {
  const keys: string[] = [];
  for (let s = startSurah; s <= endSurah; s++) {
    const sMeta = ALL_SURAHS_META[s - 1];
    if (!sMeta) continue;
    const fromAyah = s === startSurah ? startAyah : 1;
    const toAyah = s === endSurah ? endAyah : sMeta.numberOfAyahs;
    for (let a = fromAyah; a <= toAyah; a++) {
      keys.push(`${s}:${a}`);
    }
  }
  return keys;
}

/**
 * Returns all verse keys on a given Mushaf page (1..604).
 */
export function getPageVerseKeys(pageNumber: number): string[] {
  if (pageNumber < 1 || pageNumber > 604) return [];
  const pageData = CANONICAL_MUSHAF_PAGES_DATA[pageNumber - 1];
  if (!pageData) return [];
  const [, startSurah, startAyah, endSurah, endAyah] = pageData;
  return getVerseKeysInRange(startSurah, startAyah, endSurah, endAyah);
}

/**
 * Returns all verse keys in a given Juz (1..30).
 */
export function getJuzVerseKeys(juzNumber: number): string[] {
  if (juzNumber < 1 || juzNumber > 30) return [];
  const juzMeta = ALL_JUZ_META[juzNumber - 1];
  if (!juzMeta) return [];
  return getVerseKeysInRange(juzMeta.startSurah, juzMeta.startAyah, juzMeta.endSurah, juzMeta.endAyah);
}

/**
 * Pure function to calculate current and longest streak from dailyProgress map.
 */
export function recalculateStreaks(
  dailyProgress: Record<string, number>,
  referenceDateInput?: Date | string
): { currentStreak: number; longestStreak: number } {
  const refDateStr = getLocalDateString(referenceDateInput || new Date());

  // Filter valid date keys with progress > 0 that are <= reference date
  const activeDates = Object.keys(dailyProgress || {})
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && (dailyProgress[d] || 0) > 0 && d <= refDateStr)
    .sort();

  if (activeDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const dateSet = new Set(activeDates);

  // Calculate current streak ending today or yesterday
  let currentStreak = 0;
  const refObj = new Date(refDateStr + 'T00:00:00');

  // Check if today has activity
  if (dateSet.has(refDateStr)) {
    currentStreak = 1;
    const cursor = new Date(refObj);
    cursor.setDate(cursor.getDate() - 1);
    while (dateSet.has(getLocalDateString(cursor))) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  } else {
    // Check if yesterday has activity (streak maintained until today ends)
    const yesterday = new Date(refObj);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);
    if (dateSet.has(yesterdayStr)) {
      currentStreak = 1;
      const cursor = new Date(yesterday);
      cursor.setDate(cursor.getDate() - 1);
      while (dateSet.has(getLocalDateString(cursor))) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
      }
    }
  }

  // Calculate longest streak in historical activeDates
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (const dateStr of activeDates) {
    const currentDate = new Date(dateStr + 'T00:00:00');
    if (!lastDate) {
      tempStreak = 1;
    } else {
      const diffMs = currentDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    lastDate = currentDate;
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
}

/**
 * Checks if a verse is marked as read.
 */
export function isVerseRead(verseKey: string, readVerseKeys: string[] = []): boolean {
  if (!isValidVerseKey(verseKey)) return false;
  return readVerseKeys.includes(verseKey);
}

/**
 * Fast synchronous or asynchronous loading wrapper for current progress.
 */
export function loadProgressState(): QuranProgressState {
  return loadCachedQuranProgress();
}

export async function loadDurableProgressState(): Promise<QuranProgressState> {
  return loadDurableQuranProgress();
}

/**
 * Direct saver for progress state.
 */
export async function saveProgressState(state: QuranProgressState): Promise<void> {
  await saveDurableQuranProgress(state);
}

/**
 * Record a single verse as read.
 */
export async function recordVerseRead(
  verseKey: string,
  dateInput?: Date | string,
  currentState?: QuranProgressState
): Promise<QuranProgressState> {
  if (!isValidVerseKey(verseKey)) {
    return currentState || loadCachedQuranProgress();
  }

  const state = currentState || loadCachedQuranProgress();
  const dateStr = getLocalDateString(dateInput || new Date());

  const readKeysSet = new Set(state.readVerseKeys || []);
  const isNew = !readKeysSet.has(verseKey);

  if (isNew) {
    readKeysSet.add(verseKey);
  }

  const newDailyProgress = { ...state.dailyProgress };
  if (isNew) {
    newDailyProgress[dateStr] = (newDailyProgress[dateStr] || 0) + 1;
  }

  const { currentStreak, longestStreak } = recalculateStreaks(newDailyProgress, dateStr);

  const newState: QuranProgressState = {
    readVerseKeys: Array.from(readKeysSet),
    dailyProgress: newDailyProgress,
    currentStreak,
    longestStreak,
    totalReadingEvents: (state.totalReadingEvents || 0) + 1,
    lastReadDate: dateStr,
    updatedAt: Date.now(),
  };

  await saveDurableQuranProgress(newState);
  return newState;
}

/**
 * Record multiple verses as read (batch).
 */
export async function recordVersesRead(
  verseKeys: string[],
  dateInput?: Date | string,
  currentState?: QuranProgressState
): Promise<QuranProgressState> {
  const validKeys = verseKeys.filter(isValidVerseKey);
  if (validKeys.length === 0) {
    return currentState || loadCachedQuranProgress();
  }

  const state = currentState || loadCachedQuranProgress();
  const dateStr = getLocalDateString(dateInput || new Date());

  const readKeysSet = new Set(state.readVerseKeys || []);
  let newAddedCount = 0;

  for (const vk of validKeys) {
    if (!readKeysSet.has(vk)) {
      readKeysSet.add(vk);
      newAddedCount++;
    }
  }

  const newDailyProgress = { ...state.dailyProgress };
  if (newAddedCount > 0) {
    newDailyProgress[dateStr] = (newDailyProgress[dateStr] || 0) + newAddedCount;
  }

  const { currentStreak, longestStreak } = recalculateStreaks(newDailyProgress, dateStr);

  const newState: QuranProgressState = {
    readVerseKeys: Array.from(readKeysSet),
    dailyProgress: newDailyProgress,
    currentStreak,
    longestStreak,
    totalReadingEvents: (state.totalReadingEvents || 0) + validKeys.length,
    lastReadDate: dateStr,
    updatedAt: Date.now(),
  };

  await saveDurableQuranProgress(newState);
  return newState;
}

/**
 * Removes a verse key from read status.
 */
export async function removeReadVerse(
  verseKey: string,
  currentState?: QuranProgressState
): Promise<QuranProgressState> {
  const state = currentState || loadCachedQuranProgress();
  if (!state.readVerseKeys.includes(verseKey)) {
    return state;
  }

  const updatedKeys = state.readVerseKeys.filter((k) => k !== verseKey);
  const { currentStreak, longestStreak } = recalculateStreaks(state.dailyProgress);

  const newState: QuranProgressState = {
    ...state,
    readVerseKeys: updatedKeys,
    currentStreak,
    longestStreak,
    updatedAt: Date.now(),
  };

  await saveDurableQuranProgress(newState);
  return newState;
}

/**
 * High-level progress statistics summary.
 */
export function calculateProgress(state: QuranProgressState | string[]) {
  const readVerseKeys = Array.isArray(state)
    ? state
    : (state && Array.isArray(state.readVerseKeys) ? state.readVerseKeys : []);
  const readSet = new Set(readVerseKeys);

  const totalUniqueVersesRead = readSet.size;
  const completionPercentage = Math.min(
    100,
    Number(((totalUniqueVersesRead / TOTAL_CANONICAL_AYAHS) * 100).toFixed(2))
  );
  const remainingVerses = Math.max(0, TOTAL_CANONICAL_AYAHS - totalUniqueVersesRead);

  // Derive completed pages (where ALL ayahs on page are in readSet)
  let pagesCompletedCount = 0;
  for (let p = 1; p <= 604; p++) {
    const pageKeys = getPageVerseKeys(p);
    if (pageKeys.length > 0 && pageKeys.every((k) => readSet.has(k))) {
      pagesCompletedCount++;
    }
  }

  // Derive completed Juz
  let juzCompletedCount = 0;
  for (let j = 1; j <= 30; j++) {
    const juzKeys = getJuzVerseKeys(j);
    if (juzKeys.length > 0 && juzKeys.every((k) => readSet.has(k))) {
      juzCompletedCount++;
    }
  }

  // Derive completed Surahs
  let surahsCompletedCount = 0;
  for (let s = 1; s <= 114; s++) {
    const surahKeys = getSurahVerseKeys(s);
    if (surahKeys.length > 0 && surahKeys.every((k) => readSet.has(k))) {
      surahsCompletedCount++;
    }
  }

  return {
    totalUniqueVersesRead,
    totalCanonicalVerses: TOTAL_CANONICAL_AYAHS, // 6236
    completionPercentage,
    remainingVerses,
    pagesCompletedCount,
    totalPages: 604,
    juzCompletedCount,
    totalJuz: 30,
    surahsCompletedCount,
    totalSurahs: 114,
    isKhatmahComplete: totalUniqueVersesRead >= TOTAL_CANONICAL_AYAHS,
  };
}

/**
 * Calculates progress metrics for a single Surah.
 */
export function calculateSurahProgress(surahNumber: number, readVerseKeys: string[]) {
  const surahKeys = getSurahVerseKeys(surahNumber);
  const totalAyahs = surahKeys.length;
  if (totalAyahs === 0) return { surahNumber, totalAyahs: 0, readAyahs: 0, percentage: 0, isCompleted: false };
  const readSet = new Set(readVerseKeys);
  const readAyahs = surahKeys.filter((k) => readSet.has(k)).length;
  const percentage = Math.min(100, Number(((readAyahs / totalAyahs) * 100).toFixed(2)));
  return {
    surahNumber,
    totalAyahs,
    readAyahs,
    percentage,
    isCompleted: readAyahs === totalAyahs,
  };
}

/**
 * Calculates progress metrics for a single Mushaf Page.
 */
export function calculatePageProgress(pageNumber: number, readVerseKeys: string[]) {
  const pageKeys = getPageVerseKeys(pageNumber);
  const totalAyahs = pageKeys.length;
  if (totalAyahs === 0) return { pageNumber, totalAyahs: 0, readAyahs: 0, percentage: 0, isCompleted: false };
  const readSet = new Set(readVerseKeys);
  const readAyahs = pageKeys.filter((k) => readSet.has(k)).length;
  const percentage = Math.min(100, Number(((readAyahs / totalAyahs) * 100).toFixed(2)));
  return {
    pageNumber,
    totalAyahs,
    readAyahs,
    percentage,
    isCompleted: readAyahs === totalAyahs,
  };
}

/**
 * Calculates progress metrics for a single Juz.
 */
export function calculateJuzProgress(juzNumber: number, readVerseKeys: string[]) {
  const juzKeys = getJuzVerseKeys(juzNumber);
  const totalAyahs = juzKeys.length;
  if (totalAyahs === 0) return { juzNumber, totalAyahs: 0, readAyahs: 0, percentage: 0, isCompleted: false };
  const readSet = new Set(readVerseKeys);
  const readAyahs = juzKeys.filter((k) => readSet.has(k)).length;
  const percentage = Math.min(100, Number(((readAyahs / totalAyahs) * 100).toFixed(2)));
  return {
    juzNumber,
    totalAyahs,
    readAyahs,
    percentage,
    isCompleted: readAyahs === totalAyahs,
  };
}

/**
 * Calculates daily goal completion metrics.
 */
export function calculateDailyGoalProgress(todayCount: number, goal: number) {
  const validGoal = Math.max(0, goal || 0);
  const percentage = validGoal > 0 ? Math.min(100, Math.round((todayCount / validGoal) * 100)) : 0;
  return {
    goal: validGoal,
    current: todayCount,
    percentage,
    isGoalReached: validGoal > 0 && todayCount >= validGoal,
  };
}
