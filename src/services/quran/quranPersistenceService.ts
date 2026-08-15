/**
 * Quran Reading Position Persistence Service (Phase 1 Foundation)
 * Dual-layer architecture:
 * - localStorage: Fast synchronous last-position hint (0ms cold start)
 * - IndexedDB: Durable long-term persistence with zero-regression legacy sync
 */
import { QuranPosition } from '../../types/quran';
import { QuranBookmark } from '../../types';
import { resolveQuranPosition } from './quranPositionService';
import { getMeta, saveMeta, putInStore, getAllFromStore, deleteFromStore } from '../db';

export const LOCAL_STORAGE_ACTIVE_POSITION_KEY = 'hayat_quran_active_position';
export const LOCAL_STORAGE_LEGACY_BACKUP_KEY = 'hayat_quran_legacy_reading_state_backup';
export const INDEXEDDB_V2_POSITION_KEY = 'quran_v2_active_position';

/**
 * Fast synchronous reader position loader from localStorage.
 * Used during component initialization to prevent layout shifts.
 */
export function loadCachedQuranPosition(): QuranPosition {
  if (typeof window === 'undefined' || !window.localStorage) {
    return resolveQuranPosition({ surah: 1, ayah: 1, page: 1 });
  }

  try {
    // 1. Primary: check V2 cached position
    const v2Raw = localStorage.getItem(LOCAL_STORAGE_ACTIVE_POSITION_KEY);
    if (v2Raw) {
      const parsed = JSON.parse(v2Raw);
      if (parsed && (parsed.page || parsed.verseKey || (parsed.surah && parsed.ayah))) {
        return resolveQuranPosition({
          verseKey: parsed.verseKey,
          surah: parsed.surah,
          ayah: parsed.ayah,
          page: parsed.page,
          activeReadingMode: parsed.activeReadingMode,
          updatedAt: parsed.updatedAt,
        });
      }
    }

    // 2. Fallback: check legacy reading state and perform non-destructive migration
    const legacyRaw = localStorage.getItem('hayat_quran_reading_state');
    if (legacyRaw) {
      // Backup legacy state before reading
      if (!localStorage.getItem(LOCAL_STORAGE_LEGACY_BACKUP_KEY)) {
        localStorage.setItem(LOCAL_STORAGE_LEGACY_BACKUP_KEY, legacyRaw);
      }
      const legacyParsed = JSON.parse(legacyRaw);
      if (legacyParsed && legacyParsed.lastReadSurah) {
        const migrated = resolveQuranPosition({
          surah: legacyParsed.lastReadSurah,
          ayah: legacyParsed.lastReadAyah || 1,
          activeReadingMode: 'mushaf',
          updatedAt: legacyParsed.updatedAt || Date.now(),
        });
        // Cache newly resolved V2 position
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_POSITION_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch (err) {
    console.warn('Failed to parse cached Quran position from localStorage:', err);
  }

  // 3. Ultimate safe fallback: Page 1, Al-Fatiha
  return resolveQuranPosition({ surah: 1, ayah: 1, page: 1 });
}

/**
 * Asynchronous durable loader from IndexedDB.
 */
export async function loadDurableQuranPosition(): Promise<QuranPosition> {
  try {
    // 1. Check V2 key in IndexedDB meta store
    const v2Meta = await getMeta(INDEXEDDB_V2_POSITION_KEY);
    if (v2Meta && (v2Meta.page || v2Meta.verseKey || (v2Meta.surah && v2Meta.ayah))) {
      return resolveQuranPosition({
        verseKey: v2Meta.verseKey,
        surah: v2Meta.surah,
        ayah: v2Meta.ayah,
        page: v2Meta.page,
        activeReadingMode: v2Meta.activeReadingMode,
        updatedAt: v2Meta.updatedAt,
      });
    }

    // 2. Check legacy meta store 'quranReadingState'
    const legacyMeta = await getMeta('quranReadingState');
    if (legacyMeta && legacyMeta.lastReadSurah) {
      return resolveQuranPosition({
        surah: legacyMeta.lastReadSurah,
        ayah: legacyMeta.lastReadAyah || 1,
        activeReadingMode: 'mushaf',
        updatedAt: legacyMeta.updatedAt || Date.now(),
      });
    }
  } catch (err) {
    console.warn('Failed to load durable Quran position from IndexedDB:', err);
  }

  // Fall back to fast cache or default
  return loadCachedQuranPosition();
}

/**
 * Persists the current Quran reading position to both localStorage and IndexedDB.
 * Maintains complete backwards compatibility with legacy readers and backup generators.
 */
export async function saveQuranPosition(position: QuranPosition): Promise<void> {
  const normalized = resolveQuranPosition({
    verseKey: position.verseKey,
    surah: position.surah,
    ayah: position.ayah,
    page: position.page,
    activeReadingMode: position.activeReadingMode,
    updatedAt: position.updatedAt || Date.now(),
  });

  // 1. Fast synchronous write to localStorage for 0ms startup
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_POSITION_KEY, JSON.stringify(normalized));
    } catch (err) {
      console.warn('Failed to save Quran position to localStorage:', err);
    }
  }

  // 2. Durable write to IndexedDB
  try {
    // Save full V2 Position
    await saveMeta(INDEXEDDB_V2_POSITION_KEY, normalized);

    // Synchronize legacy reading state for existing Hayat features (widgets, backup V2, stats)
    const legacyState = {
      id: 'active',
      lastReadSurah: normalized.surah,
      lastReadAyah: normalized.ayah,
      updatedAt: normalized.updatedAt || Date.now(),
    };
    await saveMeta('quranReadingState', legacyState);
    await putInStore('quranReadingState', legacyState).catch(() => {
      // Ignore if store structure variation exists
    });
  } catch (err) {
    console.warn('Failed to save durable Quran position in IndexedDB:', err);
  }
}

/**
 * Loads all bookmarked ayahs from durable IndexedDB storage.
 */
export async function loadDurableBookmarks(): Promise<QuranBookmark[]> {
  try {
    const bookmarks = await getAllFromStore<QuranBookmark>('quranBookmarks');
    return bookmarks || [];
  } catch (err) {
    console.warn('Failed to load durable bookmarks from IndexedDB:', err);
    return [];
  }
}

/**
 * Persists a bookmark to durable IndexedDB storage.
 */
export async function saveDurableBookmark(bookmark: QuranBookmark): Promise<void> {
  try {
    await putInStore('quranBookmarks', bookmark);
  } catch (err) {
    console.warn('Failed to save durable bookmark in IndexedDB:', err);
  }
}

/**
 * Removes a bookmark from durable IndexedDB storage by ID.
 */
export async function removeDurableBookmark(id: string): Promise<void> {
  try {
    await deleteFromStore('quranBookmarks', id);
  } catch (err) {
    console.warn('Failed to remove durable bookmark from IndexedDB:', err);
  }
}
