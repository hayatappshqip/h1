/**
 * Quran Corpus Manager Service (Chunked Loader v2)
 * Bundles and manages full 6,236 verses of the Holy Quran locally
 * (Arabic Uthmani + Hasan Nahi Albanian Translation)
 * Loads chunked manifest and 114 surah files with SHA-256 validation & max concurrency of 4.
 */
import { ALL_SURAHS_META } from '../data/quranData';
import { QuranSurahData, Ayah } from '../types';
import { getMeta, getAllFromStore, replaceQuranCorpusInDB } from './db';
import { cleanAyahArabicText } from './quranApi';

export interface CorpusVerse {
 id: string;
 surah: number;
 ayah: number;
 verseKey: string;
 arabic: string;
 translationSq: string;
}

export interface ManifestSurahItem {
 surah: number;
 file: string;
 verseCount: number;
 bytes: number;
 sha256: string;
}

export interface ChunkedManifest {
 version: string;
 provider: string;
 translationName: string;
 totalSurahs: number;
 totalVerses: number;
 sourceSha256?: string;
 updatedAt: string;
 surahs: ManifestSurahItem[];
}

export type CorpusStatus = 'uninitialized' | 'loading' | 'ready' | 'corpusError';

export const CORPUS_VERSION = 'quran-corpus-v2-chunked-1';
export const MANIFEST_URL = '/quran-corpus-v2-chunked/manifest.json';

let corpusVersesMemory: CorpusVerse[] | null = null;
let corpusMetaMemory: ChunkedManifest | null = null;
let corpusStatus: CorpusStatus = 'uninitialized';
let corpusErrorMsg: string | null = null;
let initPromise: Promise<boolean> | null = null;

export function getCorpusStatus(): CorpusStatus {
 return corpusStatus;
}

export function getCorpusErrorMsg(): string | null {
 return corpusErrorMsg;
}

/**
 * Computes SHA-256 hex hash cross-platform (Browser + Node)
 */
async function computeSha256(text: string): Promise<string> {
 if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
 const encoder = new TextEncoder();
 const data = encoder.encode(text);
 const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
 const hashArray = Array.from(new Uint8Array(hashBuffer));
 return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
 } else {
 try {
 const cryptoMod = await import('crypto');
 return cryptoMod.createHash('sha256').update(text, 'utf8').digest('hex');
 } catch {
 if (globalThis.crypto && globalThis.crypto.subtle) {
 const encoder = new TextEncoder();
 const data = encoder.encode(text);
 const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
 const hashArray = Array.from(new Uint8Array(hashBuffer));
 return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
 }
 throw new Error('SHA-256 calculation unsupported in this environment');
 }
 }
}

/**
 * Concurrency Pool Helper: Limits parallel async task execution to maximum `limit`
 */
async function downloadWithConcurrency<T, R>(
 items: T[],
 limit: number,
 task: (item: T, index: number) => Promise<R>
): Promise<R[]> {
 const results: R[] = new Array(items.length);
 let currentIndex = 0;

 async function worker() {
 while (currentIndex < items.length) {
 const index = currentIndex++;
 results[index] = await task(items[index], index);
 }
 }

 const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
 await Promise.all(workers);
 return results;
}

/**
 * Automatically initializes local Quran database in IndexedDB & memory
 * @param onProgress optional callback for status messages
 * @param forceRetry if true, resets corpusError state and retries
 */
export async function initQuranCorpus(
 onProgress?: (msg: string) => void,
 forceRetry = false
): Promise<boolean> {
 if (corpusStatus === 'ready' && corpusVersesMemory && corpusVersesMemory.length === 6236) {
 if (onProgress) onProgress('Kërkimi në Kuran është gati.');
 return true;
 }

 if (corpusStatus === 'corpusError' && !forceRetry) {
 if (onProgress) onProgress(corpusErrorMsg || 'Databaza lokale e Kuranit nuk u inicializua.');
 return false;
 }

 if (corpusStatus === 'loading' && initPromise) {
 return initPromise;
 }

 corpusStatus = 'loading';
 corpusErrorMsg = null;

 initPromise = (async () => {
 try {
 if (onProgress) onProgress('Po verifikohet baza e të dhënave të Kuranit...');

 // 1. Check IndexedDB store first
 try {
 const storedVersion = await getMeta('quran_corpus_version');
 const storedMeta = await getMeta('quran_corpus_meta');
 const storedVerses = await getAllFromStore<CorpusVerse>('quranContent');

 if (
 storedVersion === CORPUS_VERSION &&
 storedMeta &&
 Array.isArray(storedVerses) &&
 storedVerses.length === 6236
 ) {
 storedVerses.sort((a, b) => a.surah !== b.surah ? a.surah - b.surah : a.ayah - b.ayah);
 corpusMetaMemory = storedMeta;
 corpusVersesMemory = storedVerses;
 corpusStatus = 'ready';
 if (onProgress) onProgress('Kërkimi në Kuran është gati.');
 return true;
 }
 } catch (e) {
 // IndexedDB empty or invalid, fallback to fetching chunks
 }

 // 2. Fetch Manifest
 if (onProgress) onProgress('Po ngarkohet manifesti i Kuranit lokal...');

 let manifest: ChunkedManifest | null = null;
 try {
 const response = await fetch(MANIFEST_URL);
 if (response.ok) {
 manifest = await response.json();
 }
 } catch (fetchErr) {
 // Fallback for Node test environment
 if (typeof process !== 'undefined' && process.versions && process.versions.node) {
 try {
 const fs = await import('fs');
 const path = await import('path');
 const filePath = path.join(process.cwd(), 'public', 'quran-corpus-v2-chunked', 'manifest.json');
 if (fs.existsSync(filePath)) {
 manifest = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
 }
 } catch (fsErr) {
 console.warn('Node fs manifest fallback failed:', fsErr);
 }
 }
 }

 // 3. Validate Manifest Structure
 if (
 !manifest ||
 manifest.version !== CORPUS_VERSION ||
 manifest.totalSurahs !== 114 ||
 manifest.totalVerses !== 6236 ||
 !Array.isArray(manifest.surahs) ||
 manifest.surahs.length !== 114
 ) {
 throw new Error('Manifesti i Kuranit është i pavlefshëm ose mungon.');
 }

 for (const item of manifest.surahs) {
 if (!item.file || !item.verseCount || !item.bytes || !item.sha256) {
 throw new Error(`Item-i i sures ${item.surah} në manifest është i paplotë.`);
 }
 }

 // 4. Download 114 surah chunks with MAX CONCURRENCY = 4
 let downloadedSurahsCount = 0;

 const surahChunksVerses = await downloadWithConcurrency<ManifestSurahItem, CorpusVerse[]>(
 manifest.surahs,
 4, // Maximum 4 parallel requests
 async (surahItem) => {
 let rawText = '';

 try {
 const surahUrl = `/quran-corpus-v2-chunked/${surahItem.file}`;
 const res = await fetch(surahUrl);
 if (!res.ok) {
 throw new Error(`HTTP ${res.status} gjatë ngarkimit të sures ${surahItem.surah}`);
 }
 rawText = await res.text();
 } catch (fetchErr) {
 if (typeof process !== 'undefined' && process.versions && process.versions.node) {
 const fs = await import('fs');
 const path = await import('path');
 const filePath = path.join(process.cwd(), 'public', 'quran-corpus-v2-chunked', surahItem.file);
 if (fs.existsSync(filePath)) {
 rawText = fs.readFileSync(filePath, 'utf-8');
 } else {
 throw fetchErr;
 }
 } else {
 throw fetchErr;
 }
 }

 // Validate SHA-256 hash
 const actualSha = await computeSha256(rawText);
 if (actualSha !== surahItem.sha256) {
 throw new Error(`SHA-256 mismatch for surah ${surahItem.surah}`);
 }

 // Parse JSON
 const surahObj = JSON.parse(rawText);
 if (
 !surahObj ||
 surahObj.surah !== surahItem.surah ||
 surahObj.verseCount !== surahItem.verseCount ||
 !Array.isArray(surahObj.verses) ||
 surahObj.verses.length !== surahItem.verseCount
 ) {
 throw new Error(`Strukturë e gabuar në skedarin e sures ${surahItem.surah}`);
 }

 // Validate every verse in this surah
 const versesInSurah: CorpusVerse[] = [];
 for (const v of surahObj.verses) {
 if (v.surah !== surahItem.surah || typeof v.ayah !== 'number') {
 throw new Error(`Verse keys invalid for surah ${surahItem.surah}`);
 }
 if (!v.arabic || v.arabic.trim().length === 0) {
 throw new Error(`Teksti arab është bosh në surja ${surahItem.surah}:${v.ayah}`);
 }
 if (!v.translationSq || v.translationSq.trim().length === 0) {
 throw new Error(`Përkthimi shqip është bosh në surja ${surahItem.surah}:${v.ayah}`);
 }

 versesInSurah.push({
 id: `verse-${v.surah}-${v.ayah}`,
 surah: v.surah,
 ayah: v.ayah,
 verseKey: v.verseKey || `${v.surah}:${v.ayah}`,
 arabic: v.arabic,
 translationSq: v.translationSq
 });
 }

 downloadedSurahsCount++;
 if (onProgress) {
 onProgress(`Po përgatitet Kurani lokal — ${downloadedSurahsCount} nga 114 sure`);
 }

 return versesInSurah;
 }
 );

 // 5. Aggregate and Validate Whole Corpus
 const allVerses: CorpusVerse[] = [];
 const seenKeys = new Set<string>();

 for (const chunk of surahChunksVerses) {
 for (const verse of chunk) {
 if (seenKeys.has(verse.verseKey)) {
 throw new Error(`Ajet me verseKey të dyfishtë u detektua: ${verse.verseKey}`);
 }
 seenKeys.add(verse.verseKey);
 allVerses.push(verse);
 }
 }

 if (allVerses.length !== 6236) {
 throw new Error(`Numri total i ajeteve është ${allVerses.length}, pritej 6236.`);
 }

 allVerses.sort((a, b) => a.surah !== b.surah ? a.surah - b.surah : a.ayah - b.ayah);

 // 6. Save in IndexedDB in a single atomic transaction
 if (onProgress) onProgress('Po ruhet Kurani lokal në memorien e pajisjes...');

 try {
 await replaceQuranCorpusInDB(allVerses, manifest, CORPUS_VERSION);
 } catch (dbErr) {
 // In Node environment or non-browser environments, log warning and continue in memory
 console.warn('IndexedDB save skipped in non-browser environment:', dbErr);
 }

 corpusMetaMemory = manifest;
 corpusVersesMemory = allVerses;
 corpusStatus = 'ready';

 if (onProgress) onProgress('Kërkimi në Kuran është gati.');

 return true;
 } catch (err: any) {
 console.error('Failed to initialize Quran chunked local corpus:', err);
 corpusStatus = 'corpusError';
 corpusErrorMsg = 'Databaza lokale e Kuranit nuk u inicializua.';
 initPromise = null;
 if (onProgress) onProgress('Databaza lokale e Kuranit nuk u inicializua.');
 return false;
 }
 })();

 return initPromise;
}

export function getCorpusMeta(): ChunkedManifest | null {
 return corpusMetaMemory;
}

export function getLocalSurahData(surahNumber: number): QuranSurahData | null {
 const surahMeta = ALL_SURAHS_META.find(s => s.number === surahNumber);
 if (!surahMeta) return null;

 if (!corpusVersesMemory || corpusVersesMemory.length === 0) {
 return null;
 }

 const versesForSurah = corpusVersesMemory.filter(v => v.surah === surahNumber);
 if (versesForSurah.length === 0) return null;

 const ayahs: Ayah[] = versesForSurah.map(v => ({
 numberInSurah: v.ayah,
 textAr: cleanAyahArabicText(v.arabic, surahNumber, v.ayah),
 textSq: v.translationSq
 }));

 return {
 number: surahMeta.number,
 name: surahMeta.name,
 transliteration: surahMeta.transliteration,
 albanianName: surahMeta.albanianName,
 numberOfAyahs: surahMeta.numberOfAyahs,
 revelationType: surahMeta.revelationType,
 ayahs
 };
}

export function getAllLocalVerses(): CorpusVerse[] {
 return corpusVersesMemory || [];
}

/**
 * Rebuilds the search index (forces re-fetch and validation of chunks)
 */
export async function rebuildQuranSearchIndex(): Promise<boolean> {
 corpusVersesMemory = null;
 corpusMetaMemory = null;
 corpusStatus = 'uninitialized';
 corpusErrorMsg = null;
 return initQuranCorpus(undefined, true);
}
