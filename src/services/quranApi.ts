/**
 * Quran Fetching Service
 * Text: Uthmani Arabic + Hasan Nahi Albanian Translation
 * Embedded offline core fallback + local cache
 */
import { QuranSurahData } from '../types';
import { ALL_SURAHS_META, OFFLINE_CORE_SURAHS } from '../data/quranData';
import { getMeta, saveMeta } from './db';
import { getLocalSurahData } from './quranCorpusStore';

/**
 * Converts standard ASCII digits to Eastern Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩).
 */
export function toArabicDigits(num: number): string {
 const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
 return num.toString().split('').map(d => arabicDigits[parseInt(d, 10)] || d).join('');
}

/**
 * RREGULL I PANDRYSHUESHMERISE SE KORPUSIT (handoff §9)
 * -----------------------------------------------------
 * Teksti arab i Kuranit NUK modifikohet KURRE nga aplikacioni.
 *
 * Ky funksion me pare:
 * - hiqte Bismilahin nga ajeti 1 i sureve 2..114,
 * - fshinte me regex shenjat e waqfit, U+06DD, rrathet U+25CC dhe shifrat arabo-indiane,
 * - shtonte nje shenje sintetike ﴿numer﴾ ne fund te CDO ajeti (6236/6236).
 *
 * Te gjitha keto ishin modifikime te tekstit fetar pa dataset te kontrolluar dhe
 * rrezikonin fshirjen e heshtur te shenjave autentike sapo te integrohej nje
 * korpus me shenja waqfi/texhvidi.
 *
 * Tani kthen tekstin ASHTU SIC ESHTE (vetem trim i hapesirave anesore, qe nuk
 * prek asnje karakter). Numri i ajetit renderohet si element i vecante
 * <span className="ayah-marker"> ne QuranVerseRenderer.
 */
import { sanitizeArabicText } from '../utils/arabicUtils';

export function cleanAyahArabicText(textAr: string, _surahNumber?: number, _numberInSurah?: number): string {
  if (!textAr) return '';
  return sanitizeArabicText(textAr.trim());
}

/**
 * Shenja e fundit te ajetit si STRING I VECANTE (nuk ngjitet kurre ne tekst).
 * U+06DD ARABIC END OF AYAH eshte karakteri standard Unicode per kete qellim;
 * ne fontin KFGQPC ai e mbeshtjell numrin brenda rrotullimit kaligrafik.
 */
export function buildAyahEndMarker(numberInSurah: number): string {
 return `\u06DD${toArabicDigits(numberInSurah)}`;
}

export async function getSurahData(surahNumber: number): Promise<QuranSurahData> {
 // 1. Check local corpus store first (100% offline, 0ms)
 const localCorpusData = getLocalSurahData(surahNumber);
 if (localCorpusData) {
 return localCorpusData;
 }

 // 2. Check embedded offline core surahs fallback
 if (OFFLINE_CORE_SURAHS[surahNumber]) {
 return {
 ...OFFLINE_CORE_SURAHS[surahNumber],
 ayahs: OFFLINE_CORE_SURAHS[surahNumber].ayahs.map(a => ({
 ...a,
 textAr: cleanAyahArabicText(a.textAr, surahNumber, a.numberInSurah)
 }))
 };
 }

 // Check IndexedDB / LocalStorage cache
 const cacheKey = `quran_surah_v2_${surahNumber}`;
 try {
 const cached = await getMeta(cacheKey);
 if (cached && cached.ayahs) {
 return {
 ...cached,
 ayahs: cached.ayahs.map((a: any) => ({
 ...a,
 textAr: cleanAyahArabicText(a.textAr, surahNumber, a.numberInSurah)
 }))
 };
 }
 } catch (e) {
 // ignore
 }

 const meta = ALL_SURAHS_META.find(s => s.number === surahNumber) || {
 number: surahNumber,
 name: 'سورة',
 transliteration: `Surah ${surahNumber}`,
 albanianName: `Surja ${surahNumber}`,
 numberOfAyahs: 1,
 revelationType: 'Meccan' as const
 };

 try {
 // AlQuran.cloud API with Arabic + Hasan Efendi Nahi translation
 const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,sq.nahi`;
 const res = await fetch(url);
 if (res.ok) {
 const json = await res.json();
 if (json && json.code === 200 && json.data && json.data.length === 2) {
 const arabicEdition = json.data[0];
 const albanianEdition = json.data[1];
 
 const ayahs = arabicEdition.ayahs.map((verse: any, index: number) => {
 let textAr = verse.text || '';
 let textSq = albanianEdition.ayahs[index]?.text || '';
 
 return {
 numberInSurah: verse.numberInSurah,
 textAr: cleanAyahArabicText(textAr, meta.number, verse.numberInSurah),
 textSq
 };
 });

 const result: QuranSurahData = {
 number: arabicEdition.number,
 name: arabicEdition.name,
 transliteration: arabicEdition.englishName,
 albanianName: meta.albanianName,
 numberOfAyahs: arabicEdition.numberOfAyahs,
 revelationType: arabicEdition.revelationType === 'Meccan' ? 'Meccan' : 'Medinan',
 ayahs
 };

 await saveMeta(cacheKey, result);
 return result;
 }
 }
 } catch (err) {
 console.warn(`Could not fetch surah ${surahNumber} online, using fallback template:`, err);
 }

 // Standard fallback placeholder for offline uncached surahs
 return {
 number: meta.number,
 name: meta.name,
 transliteration: meta.transliteration,
 albanianName: meta.albanianName,
 numberOfAyahs: meta.numberOfAyahs,
 revelationType: meta.revelationType,
 ayahs: Array.from({ length: Math.min(meta.numberOfAyahs, 10) }, (_, i) => ({
 numberInSurah: i + 1,
 textAr: `(Ajeti ${i + 1})`,
 textSq: `Ajeti ${i + 1} i surjes ${meta.albanianName}. (Kërkohet lidhje me internetin për të shkarkuar të gjithë tekstin offline).`
 }))
 };
}
