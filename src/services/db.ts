/**
 * Hayat IndexedDB Local Database Engine
 * IndexedDB DB_VERSION = 8
 * Strict Rule: Write/Delete/Restore resolve strictly in transaction.oncomplete
 */
import {
 PrayerLog,
 PostPrayerDhikrSession,
 DayItem,
 DayItemOccurrence,
 QuranBookmark,
 QuranNote,
 QuranReadingState,
 MburojaState,
 PrayerSettings,
 HayatBackupV2
} from '../types';

const DB_NAME = 'HayatDB';
const DB_VERSION = 9;

export interface DBStores {
 prayerLogs: PrayerLog;
 postPrayerDhikrSessions: PostPrayerDhikrSession;
 dailyDhikrSessions: any;
 articles: any;
 quranContent: any;
 quranReadingState: QuranReadingState;
 quranBookmarks: QuranBookmark;
 quranNotes: QuranNote;
 dayItems: DayItem;
 dayItemOccurrences: DayItemOccurrence;
 meta: { key: string; value: any };
}

function openDB(): Promise<IDBDatabase> {
 if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
 return Promise.reject(new Error('IndexedDB is not available in non-browser environment'));
 }
 return new Promise((resolve, reject) => {
 const request = indexedDB.open(DB_NAME, DB_VERSION);

 request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
 const db = request.result;
 const stores = [
 'prayerLogs',
 'postPrayerDhikrSessions',
 'dailyDhikrSessions',
 'articles',
 'quranContent',
 'quranReadingState',
 'quranBookmarks',
 'quranNotes',
 'dayItems',
 'dayItemOccurrences',
 'meta'
 ];

 stores.forEach(storeName => {
 if (!db.objectStoreNames.contains(storeName)) {
 if (storeName === 'meta') {
 db.createObjectStore(storeName, { keyPath: 'key' });
 } else if (storeName === 'quranReadingState') {
 db.createObjectStore(storeName, { keyPath: 'id' });
 } else {
 db.createObjectStore(storeName, { keyPath: 'id' });
 }
 }
 });
 };

 request.onsuccess = () => resolve(request.result);
 request.onerror = () => reject(request.error);
 });
}

// Helper: Generic read all items
export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
 const db = await openDB();
 return new Promise((resolve, reject) => {
 const tx = db.transaction(storeName, 'readonly');
 const store = tx.objectStore(storeName);
 const req = store.getAll();

 req.onsuccess = () => resolve(req.result || []);
 req.onerror = () => reject(req.error);
 });
}

// Helper: Generic put item (resolves ONLY on transaction.oncomplete)
export async function putInStore<T>(storeName: string, item: T): Promise<void> {
 const db = await openDB();
 return new Promise((resolve, reject) => {
 const tx = db.transaction(storeName, 'readwrite');
 const store = tx.objectStore(storeName);
 store.put(item);

 tx.oncomplete = () => resolve();
 tx.onerror = () => reject(tx.error);
 tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
 });
}

// Helper: Generic put batch items in a SINGLE transaction
export async function putBatchInStore<T>(storeName: string, items: T[]): Promise<void> {
 const db = await openDB();
 return new Promise((resolve, reject) => {
 const tx = db.transaction(storeName, 'readwrite');
 const store = tx.objectStore(storeName);
 for (let i = 0; i < items.length; i++) {
 store.put(items[i]);
 }

 tx.oncomplete = () => resolve();
 tx.onerror = () => reject(tx.error);
 tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
 });
}

// Helper: Generic delete item (resolves ONLY on transaction.oncomplete)
export async function deleteFromStore(storeName: string, key: string): Promise<void> {
 const db = await openDB();
 return new Promise((resolve, reject) => {
 const tx = db.transaction(storeName, 'readwrite');
 const store = tx.objectStore(storeName);
 store.delete(key);

 tx.oncomplete = () => resolve();
 tx.onerror = () => reject(tx.error);
 tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
 });
}

// Helper: Save Meta Key-Value
export async function saveMeta(key: string, value: any): Promise<void> {
 await putInStore('meta', { key, value });
}

export async function getMeta(key: string): Promise<any> {
 const db = await openDB();
 return new Promise((resolve, reject) => {
 const tx = db.transaction('meta', 'readonly');
 const store = tx.objectStore('meta');
 const req = store.get(key);

 req.onsuccess = () => resolve(req.result ? req.result.value : null);
 req.onerror = () => reject(req.error);
 });
}

// Helper: Atomic replacement of Quran Corpus in IndexedDB
export async function replaceQuranCorpusInDB(verses: any[], meta: any, version: string): Promise<void> {
 const db = await openDB();
 return new Promise((resolve, reject) => {
 const tx = db.transaction(['quranContent', 'meta'], 'readwrite');
 const quranStore = tx.objectStore('quranContent');
 const metaStore = tx.objectStore('meta');

 // Clear old corpus content
 quranStore.clear();

 // Put all 6236 validated verses
 for (let i = 0; i < verses.length; i++) {
 quranStore.put(verses[i]);
 }

 // Save metadata and version
 metaStore.put({ key: 'quran_corpus_meta', value: meta });
 metaStore.put({ key: 'quran_corpus_version', value: version });

 tx.oncomplete = () => resolve();
 tx.onerror = () => reject(tx.error);
 tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
 });
}

// Export Full Backup v2
export async function generateBackupV2(
 settings: PrayerSettings,
 mburojaState: MburojaState
): Promise<HayatBackupV2> {
 const dayItems = await getAllFromStore<DayItem>('dayItems');
 const dayItemOccurrences = await getAllFromStore<DayItemOccurrence>('dayItemOccurrences');
 const prayerLogs = await getAllFromStore<PrayerLog>('prayerLogs');
 const postPrayerDhikrSessions = await getAllFromStore<PostPrayerDhikrSession>('postPrayerDhikrSessions');
 const quranBookmarks = await getAllFromStore<QuranBookmark>('quranBookmarks');
 const quranNotes = await getAllFromStore<QuranNote>('quranNotes');
 const readingStateMeta = await getMeta('quranReadingState');
 const fastingStateMeta = await getMeta('fastingState');

 const quranReadingState: QuranReadingState = readingStateMeta || {
 lastReadSurah: 1,
 lastReadAyah: 1,
 updatedAt: Date.now()
 };

 return {
 version: 2,
 exportedAt: new Date().toISOString(),
 settings,
 mburojaState,
 quranReadingState,
 quranBookmarks,
 quranNotes,
 dayItems,
 dayItemOccurrences,
 prayerLogs,
 postPrayerDhikrSessions,
 fastingState: fastingStateMeta || undefined
 };
}

// Restore Full Backup v2 (Atomic transaction resolving strictly on transaction.oncomplete)
export async function restoreBackupV2(data: any): Promise<{ success: boolean; error?: string }> {
 if (!data || (data.version !== 2 && data.version !== 1)) {
 return { success: false, error: 'Skedari i rezervimit ka version të paklapshëm ose të panjohur.' };
 }

 // Strict validation
 if (!Array.isArray(data.dayItems) || !Array.isArray(data.prayerLogs)) {
 return { success: false, error: 'Struktura e të dhënave të backup-it është e dëmtuar ose jo e plotë.' };
 }

 const db = await openDB();
 return new Promise((resolve) => {
 const storesToUpdate = [
 'dayItems',
 'dayItemOccurrences',
 'prayerLogs',
 'postPrayerDhikrSessions',
 'quranBookmarks',
 'quranNotes',
 'meta'
 ];
 const tx = db.transaction(storesToUpdate, 'readwrite');

 // Clear existing
 storesToUpdate.forEach(s => tx.objectStore(s).clear());

 // Populate dayItems
 const dayItemStore = tx.objectStore('dayItems');
 data.dayItems.forEach((item: DayItem) => dayItemStore.put(item));

 // Populate dayItemOccurrences
 if (Array.isArray(data.dayItemOccurrences)) {
 const occStore = tx.objectStore('dayItemOccurrences');
 data.dayItemOccurrences.forEach((occ: DayItemOccurrence) => occStore.put(occ));
 }

 // Populate prayerLogs
 const prayerLogStore = tx.objectStore('prayerLogs');
 data.prayerLogs.forEach((log: PrayerLog) => prayerLogStore.put(log));

 // Populate postPrayerDhikrSessions
 if (Array.isArray(data.postPrayerDhikrSessions)) {
 const dhikrStore = tx.objectStore('postPrayerDhikrSessions');
 data.postPrayerDhikrSessions.forEach((sess: PostPrayerDhikrSession) => dhikrStore.put(sess));
 }

 // Populate quranBookmarks
 if (Array.isArray(data.quranBookmarks)) {
 const bkmStore = tx.objectStore('quranBookmarks');
 data.quranBookmarks.forEach((bkm: QuranBookmark) => bkmStore.put(bkm));
 }

 // Populate quranNotes
 if (Array.isArray(data.quranNotes)) {
 const noteStore = tx.objectStore('quranNotes');
 data.quranNotes.forEach((note: QuranNote) => noteStore.put(note));
 }

 // Populate meta
 const metaStore = tx.objectStore('meta');
 if (data.quranReadingState) {
 metaStore.put({ key: 'quranReadingState', value: data.quranReadingState });
 }
 if (data.settings) {
 metaStore.put({ key: 'prayerSettings', value: data.settings });
 }
 if (data.mburojaState) {
 metaStore.put({ key: 'mburojaState', value: data.mburojaState });
 }
 if (data.fastingState) {
 metaStore.put({ key: 'fastingState', value: data.fastingState });
 }

 tx.oncomplete = () => resolve({ success: true });
 tx.onerror = () => resolve({ success: false, error: 'Dështoi ruajtja atomike në IndexedDB: ' + tx.error?.message });
 tx.onabort = () => resolve({ success: false, error: 'Transaksioni i backup-it u anulua.' });
 });
}
