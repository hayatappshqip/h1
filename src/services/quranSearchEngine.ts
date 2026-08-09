/**
 * Quran Advanced Search Engine for Hayat
 * Complete, 100% local offline search engine working over all 6,236 verses.
 * Features: Morphological Albanian prefix matching (Musa -> Musa, Musai, Musait, Musain),
 * multi-format direct reference parsing, Arabic harakat normalization,
 * search in user notes & bookmarks, safe React text highlighting (<mark>), and strict ranking.
 */
import { ALL_SURAHS_META } from '../data/quranData';
import { SurahMeta, QuranSurahData, QuranNote } from '../types';
import { getAllLocalVerses, CorpusVerse, initQuranCorpus } from './quranCorpusStore';

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

/**
 * Normalizes Albanian text for search matching:
 * - lowercase
 * - ë -> e, ç -> c
 * - removes punctuation & special characters
 * - normalizes whitespace
 */
export function normalizeAlbanianText(text: string): string {
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
 * Normalizes Arabic text for search matching:
 * - removes harakat/tashkeel
 * - normalizes alef, hamza, ya, ta marbuta
 */
export function normalizeArabicText(text: string): string {
 if (!text) return '';
 return text
 .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
 .replace(/[أإآ]/g, 'ا')
 .replace(/ى/g, 'ي')
 .replace(/ة/g, 'ه')
 .replace(/\s+/g, ' ')
 .trim();
}

/**
 * Strips common Albanian / Arabic surah prefixes (El-, Al-, Sureja, etc.)
 */
function stripSurahPrefixes(text: string): string {
 const norm = normalizeAlbanianText(text);
 return norm
 .replace(/^(sureja|surja|sure|al|el|ash|an|at|ar|az|as|ad)\s+/i, '')
 .replace(/^(al|el|ash|an|at|ar|az|as|ad)-/i, '')
 .trim();
}

/**
 * Finds Surah by query (number, transliteration, Albanian name, Arabic name, or common alias)
 */
export function findSurahByQuery(query: string): SurahMeta | null {
 const qClean = stripSurahPrefixes(query);
 if (!qClean) return null;

 // Numeric lookup
 const num = parseInt(qClean, 10);
 if (!isNaN(num) && num >= 1 && num <= 114) {
 return ALL_SURAHS_META.find(s => s.number === num) || null;
 }

 const normalizedQuery = normalizeAlbanianText(query);
 const normalizedStripped = stripSurahPrefixes(query);

 // Exact match
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

 // Common aliases
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

 // Partial match
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

/**
 * Direct Reference Parser
 * Parses format variations:
 * 2:255, 2.255, 2/255, 2-255, 2 255, sureja 2 ajeti 255, Bekare 255, El-Bekare 255, البقرة 255
 */
export function parseDirectReference(query: string): { surah: SurahMeta; ayahNum: number } | { invalidSurah?: SurahMeta; invalidAyahNum?: number; isError: boolean; errorMessage?: string } | null {
 const trimmed = query.trim();
 if (!trimmed) return null;

 // Pattern 1: Pure digits separator digits (2:255, 2.255, 2/255, 2-255, 2 255)
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

 // Pattern 2: "sureja 2 ajeti 255", "surja 2 ajet 255"
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

 // Pattern 3: Name followed by ajet number ("Bekare 255", "El-Bekare ajeti 255", "Al-Baqarah 255", "البقرة 255")
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

/**
 * Executes Quran Search over the full local corpus (6,236 verses)
 */
export async function executeQuranSearch(
 query: string,
 filter: SearchFilter = 'all',
 userBookmarks: { surahNumber: number; ayahNumber: number }[] = [],
 userNotes: QuranNote[] = []
): Promise<SearchResponse> {
 const trimmed = query.trim();
 if (!trimmed) {
 return {
 query: '',
 intent: 'albanian_words',
 results: [],
 totalCount: 0
 };
 }

 // Ensure 6,236 local Quran verses corpus is initialized in memory
 await initQuranCorpus();

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
 const allLocal = getAllLocalVerses();
 const verseObj = allLocal.find(v => v.surah === surah.number && v.ayah === ayahNum);

 const item: SearchResultItem = {
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
 };

 return {
 query: trimmed,
 intent: 'direct_reference',
 results: [item],
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
 if (normNote.includes(normQ) || note.surahNumber.toString() === trimmed || note.ayahNumber.toString() === trimmed) {
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

 const allVerses = getAllLocalVerses();
 const normQuerySq = normalizeAlbanianText(cleanQuery);
 const normQueryAr = normalizeArabicText(cleanQuery);
 const queryWords = normQuerySq.split(/\s+/).filter(w => w.length > 0);

 // Construct morphological prefix regexes for Albanian words (musa -> \bmus[a-z]* inside normalized text)
 const wordPrefixRegexes = queryWords.map(word => {
 if (word.length >= 3) {
 // Escape regex chars
 const safeWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
 return new RegExp(`\\b${safeWord}[a-z]*`, 'i');
 }
 return new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
 });

 for (const verse of allVerses) {
 // Saved Bookmarks Filter check
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
 const normArText = normalizeArabicText(verse.arabic);
 if (normArText.includes(normQueryAr)) {
 isMatch = true;
 score = 90;
 matchedTerms.push(cleanQuery);
 }
 } else if (!isArabic && (filter === 'all' || filter === 'albanian' || filter === 'saved')) {
 const normSqText = normalizeAlbanianText(verse.translationSq);

 if (isExactPhrase) {
 if (normSqText.includes(normQuerySq)) {
 isMatch = true;
 score = 95;
 matchedTerms.push(cleanQuery);
 }
 } else {
 let matchedWordsCount = 0;
 for (let i = 0; i < queryWords.length; i++) {
 const reg = wordPrefixRegexes[i];
 const matchResult = normSqText.match(reg);
 if (matchResult) {
 matchedWordsCount++;
 matchedTerms.push(matchResult[0]);
 }
 }

 if (matchedWordsCount === queryWords.length && queryWords.length > 0) {
 isMatch = true;
 // Exact sub-phrase gets higher score than scattered words
 if (normSqText.includes(normQuerySq)) {
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

 // Sort by relevance score descending, then by Surah number, then Ayah number
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

/**
 * Safe Highlighter Utility
 * Splits text into safe chunks rendered by React without innerHTML
 */
export interface TextChunk {
 text: string;
 isMatch: boolean;
}

export function highlightMatchedText(text: string, matchedTerms: string[]): TextChunk[] {
 if (!text) return [{ text: '', isMatch: false }];
 if (!matchedTerms || matchedTerms.length === 0) {
 return [{ text, isMatch: false }];
 }

 const validTerms = matchedTerms
 .map(t => t.trim())
 .filter(t => t.length > 0)
 .map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

 if (validTerms.length === 0) {
 return [{ text, isMatch: false }];
 }

 const pattern = new RegExp(`(${validTerms.join('|')})`, 'gi');
 const parts = text.split(pattern);

 return parts.map(part => {
 const isMatch = validTerms.some(term => new RegExp(`^${term}$`, 'i').test(part));
 return { text: part, isMatch };
 });
}
