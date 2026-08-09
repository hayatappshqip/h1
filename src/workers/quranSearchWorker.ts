/**
 * Quran Search Web Worker
 * Offloads indexing, normalization, and search over 6,236 verses from the main UI thread.
 */
import { ALL_SURAHS_META } from '../data/quranData';
import { SurahMeta, QuranNote } from '../types';

export type SearchFilter = 'all' | 'surahs' | 'albanian' | 'arabic' | 'saved' | 'notes';

export type SearchIntent =
 | 'direct_reference'
 | 'surah_match'
 | 'arabic_text'
 | 'exact_phrase'
 | 'albanian_words'
 | 'notes_match';

export interface SearchResultItem {
 id: string;
 type: 'reference' | 'surah' | 'verse' | 'note';
 surahNumber: number;
 ayahNumber?: number;
 surahNameAr: string;
 surahNameSq: string;
 surahTransliteration: string;
 numberOfAyahs: number;
 textAr?: string;
 textSq?: string;
 noteText?: string;
 relevanceScore: number;
 matchedTerms?: string[];
 intent: SearchIntent;
}

export interface SearchResponse {
 query: string;
 intent: SearchIntent;
 results: SearchResultItem[];
 invalidReferenceError?: string;
 suggestionText?: string;
 totalCount: number;
}

interface IndexedVerse {
 id: string;
 surah: number;
 ayah: number;
 verseKey: string;
 arabic: string;
 translationSq: string;
 normSqText: string;
 normArText: string;
}

// Global worker state
let indexedVerses: IndexedVerse[] | null = null;
let isIndexing = false;
let latestRequestId = 0;

/**
 * Normalizes Albanian text for search matching:
 * lowercase, ë->e, ç->c, strip punctuation
 */
function normalizeAlbanianText(text: string): string {
 if (!text) return '';
 return text
 .toLowerCase()
 .replace(/ë/g, 'e')
 .replace(/ç/g, 'c')
 .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?«»“”]/g, ' ')
 .replace(/\s+/g, ' ')
 .trim();
}

/**
 * Normalizes Arabic text (removes harakat/tashkeel, hamza, etc.)
 */
function normalizeArabicText(text: string): string {
 if (!text) return '';
 return text
 .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
 .replace(/[أإآ]/g, 'ا')
 .replace(/ى/g, 'ي')
 .replace(/ة/g, 'ه')
 .replace(/\s+/g, ' ')
 .trim();
}

function stripSurahPrefixes(text: string): string {
 const norm = normalizeAlbanianText(text);
 return norm
 .replace(/^(sureja|surja|sure|al|el|ash|an|at|ar|az|as|ad)\s+/i, '')
 .replace(/^(al|el|ash|an|at|ar|az|as|ad)-/i, '')
 .trim();
}

function findSurahByQuery(query: string): SurahMeta | null {
 const qClean = stripSurahPrefixes(query);
 if (!qClean) return null;

 const num = parseInt(qClean, 10);
 if (!isNaN(num) && num >= 1 && num <= 114) {
 return ALL_SURAHS_META.find(s => s.number === num) || null;
 }

 const normalizedQuery = normalizeAlbanianText(query);
 const normalizedStripped = stripSurahPrefixes(query);

 for (const s of ALL_SURAHS_META) {
 const normTrans = normalizeAlbanianText(s.transliteration);
 const normSq = normalizeAlbanianText(s.albanianName);
 const normAr = normalizeArabicText(s.name);

 if (
 normTrans === normalizedQuery ||
 normSq === normalizedQuery ||
 normAr === normalizedQuery ||
 normTrans === normalizedStripped ||
 normSq === normalizedStripped ||
 stripSurahPrefixes(s.transliteration) === normalizedStripped ||
 stripSurahPrefixes(s.albanianName) === normalizedStripped
 ) {
 return s;
 }
 }

 const ALIASES: Record<string, number> = {
 'bekare': 2, 'bekareh': 2, 'baqarah': 2, 'lopa': 2,
 'fatiha': 1, 'fatihah': 1, 'hapja': 1,
 'imran': 3, 'ali imran': 3,
 'nisa': 4, 'nisae': 4,
 'maidah': 5, 'maida': 5, 'tryeza': 5,
 'anam': 6, 'kahf': 18, 'kehff': 18, 'shpella': 18,
 'yasin': 36, 'jasin': 36, 'ya sin': 36,
 'mulk': 67, 'mullk': 67, 'sundimi': 67,
 'ikhlas': 112, 'ihlas': 112, 'sinceriteti': 112,
 'falaq': 113, 'agimi': 113,
 'nas': 114, 'njerëzit': 114, 'njerezit': 114,
 'rahman': 55, 'rahmani': 55, 'meshiruesi': 55,
 'waqiah': 56, 'vakia': 56
 };

 if (ALIASES[normalizedStripped]) {
 return ALL_SURAHS_META.find(s => s.number === ALIASES[normalizedStripped]) || null;
 }

 for (const s of ALL_SURAHS_META) {
 const normTrans = normalizeAlbanianText(s.transliteration);
 const normSq = normalizeAlbanianText(s.albanianName);
 if (
 normTrans.includes(normalizedStripped) ||
 normSq.includes(normalizedStripped)
 ) {
 return s;
 }
 }

 return null;
}

function parseDirectReference(query: string) {
 const trimmed = query.trim();
 if (!trimmed) return null;

 const numSepMatch = trimmed.match(/^(\d{1,3})[\s:./\-]+(\d{1,3})$/);
 if (numSepMatch) {
 const sNum = parseInt(numSepMatch[1], 10);
 const aNum = parseInt(numSepMatch[2], 10);
 const surah = ALL_SURAHS_META.find(s => s.number === sNum);
 if (surah) {
 if (aNum >= 1 && aNum <= surah.numberOfAyahs) {
 return { surah, ayahNum: aNum };
 } else {
 return {
 isError: true,
 invalidSurah: surah,
 invalidAyahNum: aNum,
 errorMessage: `Sureja ${surah.transliteration} ka ${surah.numberOfAyahs} ajete. Numri ${aNum} nuk ekziston në këtë sure.`
 };
 }
 } else if (sNum > 114) {
 return {
 isError: true,
 errorMessage: `Kurani ka 114 sure. Numri ${sNum} nuk është i vlefshëm.`
 };
 }
 }

 const wordNumMatch = trimmed.match(/^(?:sureja|surja|sure)?\s*(\d{1,3})\s*(?:ajeti|ajet)?\s*(\d{1,3})$/i);
 if (wordNumMatch) {
 const sNum = parseInt(wordNumMatch[1], 10);
 const aNum = parseInt(wordNumMatch[2], 10);
 const surah = ALL_SURAHS_META.find(s => s.number === sNum);
 if (surah) {
 if (aNum >= 1 && aNum <= surah.numberOfAyahs) {
 return { surah, ayahNum: aNum };
 } else {
 return {
 isError: true,
 invalidSurah: surah,
 invalidAyahNum: aNum,
 errorMessage: `Sureja ${surah.transliteration} ka ${surah.numberOfAyahs} ajete. Numri ${aNum} nuk ekziston.`
 };
 }
 }
 }

 const nameNumMatch = trimmed.match(/^([a-zëç\s\-'.]+?)\s+(?:ajeti|ajet)?\s*(\d{1,3})$/i);
 if (nameNumMatch) {
 const namePart = nameNumMatch[1].trim();
 const aNum = parseInt(nameNumMatch[2], 10);
 const surah = findSurahByQuery(namePart);
 if (surah) {
 if (aNum >= 1 && aNum <= surah.numberOfAyahs) {
 return { surah, ayahNum: aNum };
 } else {
 return {
 isError: true,
 invalidSurah: surah,
 invalidAyahNum: aNum,
 errorMessage: `Sureja ${surah.transliteration} ka ${surah.numberOfAyahs} ajete.`
 };
 }
 }
 }

 return null;
}

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

async function ensureCorpusIndexed(): Promise<IndexedVerse[]> {
 if (indexedVerses && indexedVerses.length === 6236) {
 return indexedVerses;
 }
 if (isIndexing) {
 while (isIndexing) {
 await new Promise(r => setTimeout(r, 20));
 }
 return indexedVerses || [];
 }

 isIndexing = true;
 try {
 const response = await fetch('/quran-corpus-v2-chunked/manifest.json');
 if (!response.ok) {
 throw new Error('Failed to fetch /quran-corpus-v2-chunked/manifest.json in Web Worker');
 }
 const manifest = await response.json();
 if (!manifest || !Array.isArray(manifest.surahs) || manifest.surahs.length !== 114) {
 throw new Error('Invalid manifest structure in Web Worker');
 }

 const chunks = await downloadWithConcurrency(manifest.surahs, 4, async (item: any) => {
 const surahRes = await fetch(`/quran-corpus-v2-chunked/${item.file}`);
 if (!surahRes.ok) {
 throw new Error(`Worker failed to fetch surah ${item.surah}`);
 }
 const surahData = await surahRes.json();
 return surahData.verses.map((v: any) => ({
 id: `verse-${v.surah}-${v.ayah}`,
 surah: v.surah,
 ayah: v.ayah,
 verseKey: v.verseKey || `${v.surah}:${v.ayah}`,
 arabic: v.arabic || '',
 translationSq: v.translationSq || '',
 normSqText: normalizeAlbanianText(v.translationSq || ''),
 normArText: normalizeArabicText(v.arabic || '')
 }));
 });

 const allVerses: IndexedVerse[] = [];
 for (const chunk of chunks) {
 allVerses.push(...chunk);
 }

 indexedVerses = allVerses;
 } catch (err) {
 console.error('Worker corpus indexing error:', err);
 indexedVerses = [];
 } finally {
 isIndexing = false;
 }
 return indexedVerses || [];
}

function performWorkerSearch(
 requestId: number,
 query: string,
 filter: SearchFilter,
 userBookmarks: { surahNumber: number; ayahNumber: number }[],
 userNotes: QuranNote[],
 allVerses: IndexedVerse[]
): SearchResponse {
 const trimmed = query.trim();
 if (!trimmed) {
 return { query: '', intent: 'albanian_words', results: [], totalCount: 0 };
 }

 // 1. Direct Reference Check
 const directRef = parseDirectReference(trimmed);
 if (directRef && 'isError' in directRef && directRef.isError) {
 return {
 query: trimmed,
 intent: 'direct_reference',
 results: [],
 invalidReferenceError: directRef.errorMessage,
 totalCount: 0
 };
 } else if (directRef && 'surah' in directRef) {
 const { surah, ayahNum } = directRef;
 const verseObj = allVerses.find(v => v.surah === surah.number && v.ayah === ayahNum);
 return {
 query: trimmed,
 intent: 'direct_reference',
 results: [
 {
 id: `ref-${surah.number}-${ayahNum}`,
 type: 'reference',
 surahNumber: surah.number,
 ayahNumber: ayahNum,
 surahNameAr: surah.name,
 surahNameSq: surah.albanianName,
 surahTransliteration: surah.transliteration,
 numberOfAyahs: surah.numberOfAyahs,
 textAr: verseObj?.arabic || '',
 textSq: verseObj?.translationSq || '',
 relevanceScore: 100,
 intent: 'direct_reference'
 }
 ],
 totalCount: 1
 };
 }

 // 2. Surah Match Check
 const surahMatch = findSurahByQuery(trimmed);
 const isOnlySurahFilter = filter === 'surahs';

 // 3. User Notes Filter
 if (filter === 'notes') {
 const normQ = normalizeAlbanianText(trimmed);
 const results: SearchResultItem[] = [];

 for (const note of userNotes) {
 const normNote = normalizeAlbanianText(note.text);
 if (
 normNote.includes(normQ) ||
 note.surahNumber.toString() === trimmed ||
 note.ayahNumber.toString() === trimmed
 ) {
 const surahMeta = ALL_SURAHS_META.find(s => s.number === note.surahNumber);
 results.push({
 id: `note-${note.id}`,
 type: 'note',
 surahNumber: note.surahNumber,
 ayahNumber: note.ayahNumber,
 surahNameAr: surahMeta?.name || '',
 surahNameSq: surahMeta?.albanianName || '',
 surahTransliteration: surahMeta?.transliteration || `Surja ${note.surahNumber}`,
 numberOfAyahs: surahMeta?.numberOfAyahs || 0,
 noteText: note.text,
 relevanceScore: 90,
 matchedTerms: [trimmed],
 intent: 'notes_match'
 });
 }
 }

 return {
 query: trimmed,
 intent: 'notes_match',
 results,
 totalCount: results.length
 };
 }

 // 4. General Corpus Search
 const isArabic = /[\u0600-\u06FF]/.test(trimmed);
 const isExactPhrase = trimmed.startsWith('"') && trimmed.endsWith('"');
 const cleanQuery = isExactPhrase ? trimmed.slice(1, -1).trim() : trimmed;

 const results: SearchResultItem[] = [];

 if (surahMatch && (filter === 'all' || filter === 'surahs')) {
 results.push({
 id: `surah-${surahMatch.number}`,
 type: 'surah',
 surahNumber: surahMatch.number,
 surahNameAr: surahMatch.name,
 surahNameSq: surahMatch.albanianName,
 surahTransliteration: surahMatch.transliteration,
 numberOfAyahs: surahMatch.numberOfAyahs,
 relevanceScore: 100,
 intent: 'surah_match'
 });

 if (isOnlySurahFilter) {
 return {
 query: trimmed,
 intent: 'surah_match',
 results,
 totalCount: results.length
 };
 }
 }

 const normQuerySq = normalizeAlbanianText(cleanQuery);
 const normQueryAr = normalizeArabicText(cleanQuery);
 const queryWords = normQuerySq.split(/\s+/).filter(w => w.length > 0);

 const wordPrefixRegexes = queryWords.map(word => {
 if (word.length >= 3) {
 const safeWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
 return new RegExp(`\\b${safeWord}[a-z]*`, 'i');
 }
 return new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
 });

 for (const verse of allVerses) {
 if (requestId !== latestRequestId) {
 // Abort early if superseded
 break;
 }

 if (filter === 'saved') {
 const isSaved = userBookmarks.some(b => b.surahNumber === verse.surah && b.ayahNumber === verse.ayah);
 if (!isSaved) continue;
 }

 const surahMeta = ALL_SURAHS_META.find(s => s.number === verse.surah);
 if (!surahMeta) continue;

 let isMatch = false;
 let score = 0;
 let matchedTerms: string[] = [];

 if (isArabic && (filter === 'all' || filter === 'arabic')) {
 if (verse.normArText.includes(normQueryAr)) {
 isMatch = true;
 score = 90;
 matchedTerms.push(cleanQuery);
 }
 } else if (!isArabic && (filter === 'all' || filter === 'albanian' || filter === 'saved')) {
 if (isExactPhrase) {
 if (verse.normSqText.includes(normQuerySq)) {
 isMatch = true;
 score = 95;
 matchedTerms.push(cleanQuery);
 }
 } else {
 let matchedWordsCount = 0;
 for (let i = 0; i < queryWords.length; i++) {
 const reg = wordPrefixRegexes[i];
 const matchResult = verse.normSqText.match(reg);
 if (matchResult) {
 matchedWordsCount++;
 matchedTerms.push(matchResult[0]);
 }
 }

 if (matchedWordsCount === queryWords.length && queryWords.length > 0) {
 isMatch = true;
 if (verse.normSqText.includes(normQuerySq)) {
 score = 90;
 } else {
 score = 80 + queryWords.length * 2;
 }
 } else if (matchedWordsCount > 0 && queryWords.length > 1) {
 isMatch = true;
 score = 50 + matchedWordsCount;
 }
 }
 }

 if (isMatch) {
 results.push({
 id: `verse-${verse.surah}-${verse.ayah}`,
 type: 'verse',
 surahNumber: verse.surah,
 ayahNumber: verse.ayah,
 surahNameAr: surahMeta.name,
 surahNameSq: surahMeta.albanianName,
 surahTransliteration: surahMeta.transliteration,
 numberOfAyahs: surahMeta.numberOfAyahs,
 textAr: verse.arabic,
 textSq: verse.translationSq,
 relevanceScore: score,
 matchedTerms: Array.from(new Set(matchedTerms)),
 intent: isArabic ? 'arabic_text' : (isExactPhrase ? 'exact_phrase' : 'albanian_words')
 });
 }
 }

 results.sort((a, b) => {
 if (b.relevanceScore !== a.relevanceScore) {
 return b.relevanceScore - a.relevanceScore;
 }
 if (a.surahNumber !== b.surahNumber) {
 return a.surahNumber - b.surahNumber;
 }
 return (a.ayahNumber || 0) - (b.ayahNumber || 0);
 });

 const intent: SearchIntent = isArabic
 ? 'arabic_text'
 : (isExactPhrase ? 'exact_phrase' : 'albanian_words');

 return {
 query: trimmed,
 intent,
 results,
 totalCount: results.length
 };
}

// Worker message listener
self.onmessage = async (e: MessageEvent) => {
 const { type, requestId, query, filter, userBookmarks, userNotes, corpusPayload } = e.data || {};

 if (type === 'INIT_CORPUS' && Array.isArray(corpusPayload)) {
 indexedVerses = corpusPayload.map((v: any) => ({
 id: `verse-${v.surah}-${v.ayah}`,
 surah: v.surah,
 ayah: v.ayah,
 verseKey: v.verseKey || `${v.surah}:${v.ayah}`,
 arabic: v.arabic || '',
 translationSq: v.translationSq || '',
 normSqText: normalizeAlbanianText(v.translationSq || ''),
 normArText: normalizeArabicText(v.arabic || '')
 }));
 self.postMessage({ type: 'INIT_READY' });
 return;
 }

 if (type === 'SEARCH_REQUEST') {
 latestRequestId = requestId;
 const allVerses = await ensureCorpusIndexed();

 if (requestId !== latestRequestId) {
 // Abort if a newer request came in while indexing
 return;
 }

 const response = performWorkerSearch(
 requestId,
 query,
 filter,
 userBookmarks || [],
 userNotes || [],
 allVerses
 );

 if (requestId === latestRequestId) {
 self.postMessage({
 type: 'SEARCH_RESPONSE',
 requestId,
 response
 });
 }
 }
};
