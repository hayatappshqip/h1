/**
 * HAYAT Quran V2 - Manual Khatmah / Reading Plan Service (Phase 2)
 *
 * CRITICAL PRODUCT PRINCIPLE:
 * Manual Khatmah Progress and Last Reading Position are TWO COMPLETELY DIFFERENT CONCEPTS.
 * - Last Reading Position: Where the reader view/iFrame was last open.
 * - Manual Khatmah Progress: Explicitly confirmed pages read in user's physical/digital Khatmah.
 *
 * Opening/navigating pages inside the Mushaf reader MUST NEVER automatically update Khatmah progress.
 */
import { ManualKhatamPlan } from '../../types';
import { ALL_JUZ_META } from '../../data/juzData';
import { getLocalDateString } from '../../utils/dateUtils';
import { getMeta, saveMeta } from '../db';

export const LOCAL_STORAGE_ACTIVE_KHATAM_KEY = 'hayat_khatam_active_plan';
export const LOCAL_STORAGE_COMPLETED_KHATAM_KEY = 'hayat_khatam_completed_plans';
export const INDEXEDDB_ACTIVE_KHATAM_KEY = 'quran_v2_khatam_active_plan';
export const INDEXEDDB_COMPLETED_KHATAM_KEY = 'quran_v2_khatam_completed_plans';

export const TOTAL_MUSHAF_PAGES = 604;

/**
 * Generates default initial ManualKhatamPlan.
 */
export function createDefaultKhatamPlan(
  title = 'Hatme e Re',
  dailyTargetPages = 20,
  targetDate?: string
): ManualKhatamPlan {
  const now = new Date();
  const startDate = getLocalDateString(now);
  const defaultTargetDate = targetDate || getLocalDateString(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));

  return {
    id: `khatam_${Date.now()}`,
    title,
    status: 'active',
    createdAt: Date.now(),
    startDate,
    targetDate: defaultTargetDate,
    dailyTargetPages: dailyTargetPages > 0 ? dailyTargetPages : 20,
    completedPages: [],
    lastCompletedPage: 0,
    nextPage: 1,
    history: [],
    updatedAt: Date.now(),
  };
}

/**
 * Normalizes any legacy or incomplete Khatam plan into a valid ManualKhatamPlan.
 * Performs non-destructive backward compatibility migration.
 */
export function normalizeKhatamPlan(raw: any): ManualKhatamPlan {
  if (!raw || typeof raw !== 'object') {
    return createDefaultKhatamPlan();
  }

  // 1. Process completedPages array
  let completedPages: number[] = [];
  if (Array.isArray(raw.completedPages)) {
    completedPages = raw.completedPages
      .map((p: any) => Number(p))
      .filter((p: number) => !isNaN(p) && p >= 1 && p <= TOTAL_MUSHAF_PAGES);
  } else if (typeof raw.pagesRead === 'number' && raw.pagesRead > 0) {
    const count = Math.min(TOTAL_MUSHAF_PAGES, raw.pagesRead);
    for (let p = 1; p <= count; p++) {
      completedPages.push(p);
    }
  } else if (Array.isArray(raw.completedJuz) && raw.completedJuz.length > 0) {
    const pageSet = new Set<number>();
    for (const jNum of raw.completedJuz) {
      const jMeta = ALL_JUZ_META.find((j) => j.number === Number(jNum));
      if (jMeta) {
        for (let p = jMeta.startPage; p <= jMeta.endPage; p++) {
          pageSet.add(p);
        }
      }
    }
    completedPages = Array.from(pageSet);
  }

  // Ensure unique and numerically sorted
  completedPages = Array.from(new Set(completedPages)).sort((a, b) => a - b);

  // 2. Derive lastCompletedPage & nextPage
  const lastCompletedPage = completedPages.length > 0 ? Math.max(...completedPages) : 0;
  let nextPage = lastCompletedPage >= TOTAL_MUSHAF_PAGES ? TOTAL_MUSHAF_PAGES : (lastCompletedPage === 0 ? 1 : lastCompletedPage + 1);

  // 3. Status determination
  let status: 'active' | 'completed' | 'paused' = raw.status === 'completed' || raw.status === 'paused' ? raw.status : 'active';
  // K1: hatmja është e përfunduar VETËM kur të 604 faqet janë të përfunduara.
  // `lastCompletedPage >= 604` nuk mjafton — përdoruesi mund të ketë lexuar vetëm faqen 604.
  if (completedPages.length >= TOTAL_MUSHAF_PAGES) {
    status = 'completed';
    nextPage = TOTAL_MUSHAF_PAGES;
  }

  // 4. History normalization
  let history: { date: string; pagesCount: number }[] = [];
  if (Array.isArray(raw.history)) {
    history = raw.history
      .filter((h: any) => h && typeof h.date === 'string' && typeof h.pagesCount === 'number')
      .map((h: any) => ({ date: h.date, pagesCount: Math.max(0, h.pagesCount) }));
  } else if (Array.isArray(raw.logs)) {
    history = raw.logs
      .filter((l: any) => l && typeof l.date === 'string' && typeof l.pages === 'number')
      .map((l: any) => ({ date: l.date, pagesCount: Math.max(0, l.pages) }));
  }

  return {
    id: typeof raw.id === 'string' && raw.id ? raw.id : `khatam_${Date.now()}`,
    title: typeof raw.title === 'string' && raw.title ? raw.title : 'Hatme e Re',
    status,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    startDate: typeof raw.startDate === 'string' ? raw.startDate : getLocalDateString(),
    targetDate: typeof raw.targetDate === 'string' ? raw.targetDate : (typeof raw.endDate === 'string' ? raw.endDate : undefined),
    dailyTargetPages: typeof raw.dailyTargetPages === 'number' && raw.dailyTargetPages > 0 ? raw.dailyTargetPages : 20,
    completedPages,
    lastCompletedPage,
    nextPage,
    history,
    notes: typeof raw.notes === 'string' ? raw.notes : undefined,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
  };
}

/**
 * Fast synchronous loader from localStorage.
 */
export function loadCachedKhatamPlan(): ManualKhatamPlan {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createDefaultKhatamPlan();
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACTIVE_KHATAM_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return normalizeKhatamPlan(parsed);
    }
  } catch (err) {
    console.warn('Failed to parse cached Khatam plan from localStorage:', err);
  }
  return createDefaultKhatamPlan();
}

/**
 * Asynchronous durable loader from IndexedDB with fallback to localStorage.
 */
export async function loadDurableKhatamPlan(): Promise<ManualKhatamPlan> {
  try {
    const meta = await getMeta(INDEXEDDB_ACTIVE_KHATAM_KEY);
    if (meta) {
      return normalizeKhatamPlan(meta);
    }
  } catch (err) {
    console.warn('Failed to load durable Khatam plan from IndexedDB:', err);
  }
  return loadCachedKhatamPlan();
}

/**
 * Saves Khatam plan synchronously to localStorage and durably to IndexedDB.
 */
export async function saveDurableKhatamPlan(plan: ManualKhatamPlan): Promise<void> {
  const normalized = normalizeKhatamPlan(plan);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_KHATAM_KEY, JSON.stringify(normalized));
    } catch (err) {
      console.warn('Failed to save Khatam plan to localStorage:', err);
    }
  }

  try {
    await saveMeta(INDEXEDDB_ACTIVE_KHATAM_KEY, normalized);
  } catch (err) {
    console.warn('Failed to save durable Khatam plan to IndexedDB:', err);
  }
}

/**
 * Loads completed/archived Khatam plans.
 */
export function loadCachedCompletedKhatamPlans(): ManualKhatamPlan[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_COMPLETED_KHATAM_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeKhatamPlan);
      }
    }
  } catch (err) {
    console.warn('Failed to parse completed Khatam plans:', err);
  }
  return [];
}

/**
 * Saves completed/archived Khatam plans.
 */
export async function saveDurableCompletedKhatamPlans(plans: ManualKhatamPlan[]): Promise<void> {
  const normalizedList = plans.map(normalizeKhatamPlan);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(LOCAL_STORAGE_COMPLETED_KHATAM_KEY, JSON.stringify(normalizedList));
    } catch (err) {
      console.warn('Failed to save completed Khatam plans to localStorage:', err);
    }
  }

  try {
    await saveMeta(INDEXEDDB_COMPLETED_KHATAM_KEY, normalizedList);
  } catch (err) {
    console.warn('Failed to save completed Khatam plans to IndexedDB:', err);
  }
}

/**
 * Explicitly marks a single page as completed in a Khatam plan.
 * Pure immutable function returning updated plan.
 */
export function confirmPageCompleted(
  plan: ManualKhatamPlan,
  pageNumber: number,
  dateInput?: string | Date
): ManualKhatamPlan {
  if (pageNumber < 1 || pageNumber > TOTAL_MUSHAF_PAGES) {
    return normalizeKhatamPlan(plan);
  }

  const currentPlan = normalizeKhatamPlan(plan);
  const todayStr = getLocalDateString(dateInput || new Date());
  const existingSet = new Set(currentPlan.completedPages);

  const isNew = !existingSet.has(pageNumber);
  if (!isNew) {
    // Page was already completed: return normalized plan without adding to daily history
    return currentPlan;
  }

  existingSet.add(pageNumber);
  const updatedPages = Array.from(existingSet).sort((a, b) => a - b);

  // Update history for today
  const newHistory = [...currentPlan.history];
  const todayEntryIndex = newHistory.findIndex((h) => h.date === todayStr);
  if (todayEntryIndex >= 0) {
    newHistory[todayEntryIndex] = {
      ...newHistory[todayEntryIndex],
      pagesCount: newHistory[todayEntryIndex].pagesCount + 1,
    };
  } else {
    newHistory.push({ date: todayStr, pagesCount: 1 });
  }

  const lastCompletedPage = Math.max(...updatedPages);
  // K1: vetëm numri i faqeve vendos përfundimin, jo faqja e fundit e arritur.
  const isCompleted = updatedPages.length >= TOTAL_MUSHAF_PAGES;
  const nextPage = isCompleted ? TOTAL_MUSHAF_PAGES : lastCompletedPage + 1;

  return normalizeKhatamPlan({
    ...currentPlan,
    completedPages: updatedPages,
    lastCompletedPage,
    nextPage,
    history: newHistory,
    status: isCompleted ? 'completed' : currentPlan.status,
    updatedAt: Date.now(),
  });
}

/**
 * Explicitly marks a contiguous range of pages as completed.
 */
export function confirmPageRangeCompleted(
  plan: ManualKhatamPlan,
  startPage: number,
  endPage: number,
  dateInput?: string | Date
): ManualKhatamPlan {
  const fromPage = Math.max(1, Math.min(startPage, endPage));
  const toPage = Math.min(TOTAL_MUSHAF_PAGES, Math.max(startPage, endPage));

  const currentPlan = normalizeKhatamPlan(plan);
  const todayStr = getLocalDateString(dateInput || new Date());
  const existingSet = new Set(currentPlan.completedPages);

  let newlyAddedCount = 0;
  for (let p = fromPage; p <= toPage; p++) {
    if (!existingSet.has(p)) {
      existingSet.add(p);
      newlyAddedCount++;
    }
  }

  if (newlyAddedCount === 0) {
    return currentPlan;
  }

  const updatedPages = Array.from(existingSet).sort((a, b) => a - b);

  const newHistory = [...currentPlan.history];
  const todayEntryIndex = newHistory.findIndex((h) => h.date === todayStr);
  if (todayEntryIndex >= 0) {
    newHistory[todayEntryIndex] = {
      ...newHistory[todayEntryIndex],
      pagesCount: newHistory[todayEntryIndex].pagesCount + newlyAddedCount,
    };
  } else {
    newHistory.push({ date: todayStr, pagesCount: newlyAddedCount });
  }

  const lastCompletedPage = Math.max(...updatedPages);
  // K1: vetëm numri i faqeve vendos përfundimin, jo faqja e fundit e arritur.
  const isCompleted = updatedPages.length >= TOTAL_MUSHAF_PAGES;
  const nextPage = isCompleted ? TOTAL_MUSHAF_PAGES : lastCompletedPage + 1;

  return normalizeKhatamPlan({
    ...currentPlan,
    completedPages: updatedPages,
    lastCompletedPage,
    nextPage,
    history: newHistory,
    status: isCompleted ? 'completed' : currentPlan.status,
    updatedAt: Date.now(),
  });
}

/**
 * Explicitly marks an entire Juz (1..30) as completed in the Khatam plan.
 */
export function confirmJuzCompleted(
  plan: ManualKhatamPlan,
  juzNumber: number,
  dateInput?: string | Date
): ManualKhatamPlan {
  if (juzNumber < 1 || juzNumber > 30) {
    return normalizeKhatamPlan(plan);
  }
  const juzMeta = ALL_JUZ_META[juzNumber - 1];
  if (!juzMeta) {
    return normalizeKhatamPlan(plan);
  }
  return confirmPageRangeCompleted(plan, juzMeta.startPage, juzMeta.endPage, dateInput);
}

/**
 * Direct page position update (e.g., "Arrita deri te faqja 120").
 */
export function updateDirectPagePosition(
  plan: ManualKhatamPlan,
  targetPage: number,
  markPriorCompleted: boolean,
  dateInput?: string | Date
): ManualKhatamPlan {
  const clampedPage = Math.max(1, Math.min(TOTAL_MUSHAF_PAGES, targetPage));
  if (markPriorCompleted) {
    return confirmPageRangeCompleted(plan, 1, clampedPage, dateInput);
  } else {
    return confirmPageCompleted(plan, clampedPage, dateInput);
  }
}

/**
 * Removes a single completed page from the Khatam plan.
 */
export function removePageCompleted(
  plan: ManualKhatamPlan,
  pageNumber: number
): ManualKhatamPlan {
  const currentPlan = normalizeKhatamPlan(plan);
  const existingSet = new Set(currentPlan.completedPages);

  if (!existingSet.has(pageNumber)) {
    return currentPlan;
  }

  existingSet.delete(pageNumber);
  const updatedPages = Array.from(existingSet).sort((a, b) => a - b);
  const lastCompletedPage = updatedPages.length > 0 ? Math.max(...updatedPages) : 0;
  const nextPage = updatedPages.length >= TOTAL_MUSHAF_PAGES ? TOTAL_MUSHAF_PAGES : (lastCompletedPage === 0 ? 1 : Math.min(TOTAL_MUSHAF_PAGES, lastCompletedPage + 1));

  return normalizeKhatamPlan({
    ...currentPlan,
    completedPages: updatedPages,
    lastCompletedPage,
    nextPage,
    // K4: një plan 'paused' nuk bëhet 'active' vetëm sepse u korrigjua një faqe.
    // Një plan i përfunduar që bie nën 604 faqe kthehet në 'active'.
    status: updatedPages.length >= TOTAL_MUSHAF_PAGES
      ? 'completed'
      : currentPlan.status === 'paused'
        ? 'paused'
        : 'active',
    updatedAt: Date.now(),
  });
}

/**
 * Removes all pages belonging to a specified Juz from the Khatam plan.
 */
export function removeJuzCompleted(
  plan: ManualKhatamPlan,
  juzNumber: number
): ManualKhatamPlan {
  if (juzNumber < 1 || juzNumber > 30) return normalizeKhatamPlan(plan);
  const juzMeta = ALL_JUZ_META[juzNumber - 1];
  if (!juzMeta) return normalizeKhatamPlan(plan);

  const startPage = juzMeta.startPage;
  const endPage = juzMeta.endPage;

  const currentPlan = normalizeKhatamPlan(plan);
  const updatedPages = currentPlan.completedPages.filter(p => p < startPage || p > endPage);

  const lastCompletedPage = updatedPages.length > 0 ? Math.max(...updatedPages) : 0;
  const nextPage = updatedPages.length >= TOTAL_MUSHAF_PAGES ? TOTAL_MUSHAF_PAGES : (lastCompletedPage === 0 ? 1 : Math.min(TOTAL_MUSHAF_PAGES, lastCompletedPage + 1));

  return normalizeKhatamPlan({
    ...currentPlan,
    completedPages: updatedPages,
    lastCompletedPage,
    nextPage,
    // K4: një plan 'paused' nuk bëhet 'active' vetëm sepse u korrigjua një faqe.
    // Një plan i përfunduar që bie nën 604 faqe kthehet në 'active'.
    status: updatedPages.length >= TOTAL_MUSHAF_PAGES
      ? 'completed'
      : currentPlan.status === 'paused'
        ? 'paused'
        : 'active',
    updatedAt: Date.now(),
  });
}

/**
 * Returns an array of uncompleted page numbers within a given range.
 */
export function getMissingPagesInRange(
  plan: ManualKhatamPlan,
  startPage: number,
  endPage: number
): number[] {
  const currentPlan = normalizeKhatamPlan(plan);
  const completedSet = new Set(currentPlan.completedPages);
  const from = Math.max(1, Math.min(startPage, endPage));
  const to = Math.min(TOTAL_MUSHAF_PAGES, Math.max(startPage, endPage));

  const missing: number[] = [];
  for (let p = from; p <= to; p++) {
    if (!completedSet.has(p)) {
      missing.push(p);
    }
  }
  return missing;
}

/**
 * Archives current active plan and initializes a new active plan safely.
 */
export async function archiveCurrentAndStartNewPlan(
  currentPlan: ManualKhatamPlan,
  newTitle = 'Hatme e Re',
  newDailyTarget = 20,
  newTargetDate?: string
): Promise<{ newPlan: ManualKhatamPlan; completedPlans: ManualKhatamPlan[] }> {
  const normalizedCurrent = normalizeKhatamPlan(currentPlan);
  normalizedCurrent.status = normalizedCurrent.completedPages.length >= TOTAL_MUSHAF_PAGES ? 'completed' : 'paused';

  const completedList = loadCachedCompletedKhatamPlans();
  completedList.unshift(normalizedCurrent);
  await saveDurableCompletedKhatamPlans(completedList);

  const newPlan = createDefaultKhatamPlan(newTitle, newDailyTarget, newTargetDate);
  await saveDurableKhatamPlan(newPlan);

  return { newPlan, completedPlans: completedList };
}

/**
 * Calculates current status, pace, and projections for a Khatam plan.
 */
export function calculateKhatamStats(plan: ManualKhatamPlan) {
  const normalized = normalizeKhatamPlan(plan);
  const todayStr = getLocalDateString();

  const completedPagesCount = normalized.completedPages.length;
  const remainingPagesCount = Math.max(0, TOTAL_MUSHAF_PAGES - completedPagesCount);
  const percentage = Number(((completedPagesCount / TOTAL_MUSHAF_PAGES) * 100).toFixed(1));

  const todayHistory = normalized.history.find((h) => h.date === todayStr);
  const confirmedTodayCount = todayHistory ? todayHistory.pagesCount : 0;
  const dailyTargetPages = normalized.dailyTargetPages || 20;
  const isDailyGoalReached = confirmedTodayCount >= dailyTargetPages;

  // Pace calculation (average pages/day over history or last 7 days)
  let avgPagesPerDay = dailyTargetPages;
  if (normalized.history.length > 0) {
    const totalHistoryPages = normalized.history.reduce((acc, h) => acc + h.pagesCount, 0);
    avgPagesPerDay = Math.max(1, Math.round(totalHistoryPages / normalized.history.length));
  }

  const daysNeeded = Math.ceil(remainingPagesCount / (avgPagesPerDay || 1));
  const projDate = new Date();
  projDate.setDate(projDate.getDate() + daysNeeded);
  const projectedCompletionDate = getLocalDateString(projDate);

  return {
    completedPagesCount,
    remainingPagesCount,
    percentage,
    confirmedTodayCount,
    dailyTargetPages,
    isDailyGoalReached,
    avgPagesPerDay,
    projectedCompletionDate,
    lastCompletedPage: normalized.lastCompletedPage,
    nextPage: normalized.nextPage,
    isCompleted: completedPagesCount >= TOTAL_MUSHAF_PAGES,
  };
}
