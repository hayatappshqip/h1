import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ALL_SURAHS_META } from '../src/data/quranData';

interface RawVerse {
  surah: number;
  ayah: number;
  verseKey: string;
  arabic: string;
  translationSq: string;
}

function cleanTranslationText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<sup[^>]*>.*?<\/sup>/gi, '') // Remove footnote superscripts
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchSurahVerses(surahNumber: number): Promise<RawVerse[]> {
  const url = `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?translations=88&fields=text_uthmani&per_page=300`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch surah ${surahNumber}: HTTP ${res.status}`);
  }
  const data = await res.json();
  if (!data || !Array.isArray(data.verses)) {
    throw new Error(`Invalid response structure for surah ${surahNumber}`);
  }

  return data.verses.map((v: any) => {
    const translationText = v.translations && v.translations[0] ? v.translations[0].text : '';
    return {
      surah: surahNumber,
      ayah: v.verse_number,
      verseKey: `${surahNumber}:${v.verse_number}`,
      arabic: v.text_uthmani || '',
      translationSq: cleanTranslationText(translationText)
    };
  });
}

async function main() {
  console.log('Starting Quran Corpus v2 generation...');
  const allVerses: RawVerse[] = [];

  for (let s = 1; s <= 114; s++) {
    const meta = ALL_SURAHS_META.find(m => m.number === s);
    if (!meta) {
      throw new Error(`Surah metadata for surah ${s} not found`);
    }
    const expectedAyahs = meta.numberOfAyahs;
    let retries = 3;
    let verses: RawVerse[] = [];

    while (retries > 0) {
      try {
        verses = await fetchSurahVerses(s);
        if (verses.length === expectedAyahs) {
          break;
        }
        console.warn(`Surah ${s}: expected ${expectedAyahs} ayahs, got ${verses.length}. Retrying...`);
      } catch (err: any) {
        console.warn(`Surah ${s} fetch error: ${err.message}. Retrying...`);
      }
      retries--;
      await new Promise(r => setTimeout(r, 500));
    }

    if (verses.length !== expectedAyahs) {
      throw new Error(`Surah ${s} validation failed: got ${verses.length} verses, expected ${expectedAyahs}`);
    }

    allVerses.push(...verses);
    if (s % 10 === 0 || s === 114) {
      console.log(`Fetched surahs 1..${s} (${allVerses.length} total verses so far)`);
    }
  }

  // --- Strict Validations ---
  console.log('Validating complete corpus...');

  // 1. Total verse count check
  if (allVerses.length !== 6236) {
    throw new Error(`Corpus validation error: Total verses is ${allVerses.length}, expected 6236`);
  }

  // 2. Unique verseKey check
  const verseKeys = new Set<string>();
  const surahCounts = new Map<number, number>();

  for (const v of allVerses) {
    if (verseKeys.has(v.verseKey)) {
      throw new Error(`Duplicate verseKey detected: ${v.verseKey}`);
    }
    verseKeys.add(v.verseKey);

    if (!v.arabic || v.arabic.trim().length === 0) {
      throw new Error(`Empty Arabic text for ${v.verseKey}`);
    }

    if (!v.translationSq || v.translationSq.trim().length === 0) {
      throw new Error(`Empty Albanian translation for ${v.verseKey}`);
    }

    surahCounts.set(v.surah, (surahCounts.get(v.surah) || 0) + 1);
  }

  // 3. Verify 114 surahs present with correct counts
  if (surahCounts.size !== 114) {
    throw new Error(`Surah count validation failed: got ${surahCounts.size} surahs, expected 114`);
  }

  for (let s = 1; s <= 114; s++) {
    const meta = ALL_SURAHS_META.find(m => m.number === s)!;
    const count = surahCounts.get(s);
    if (count !== meta.numberOfAyahs) {
      throw new Error(`Surah ${s} has ${count} ayahs, expected ${meta.numberOfAyahs}`);
    }
  }

  console.log('All 6236 verses successfully validated!');

  const rawJsonContent = JSON.stringify(allVerses);
  const hash = crypto.createHash('sha256').update(rawJsonContent, 'utf8').digest('hex');

  const corpusObject = {
    version: 'quran-corpus-v2',
    provider: 'Quran.com API (Translation ID 88 - Hasan Nahi)',
    translationName: 'Hasan Nahi',
    updatedAt: new Date().toISOString(),
    sha256: hash,
    totalVerses: 6236,
    verses: allVerses
  };

  const finalJsonString = JSON.stringify(corpusObject, null, 2);

  const publicDir = path.join(process.cwd(), 'public');
  const tmpPath = path.join(publicDir, 'quran-corpus-v2.tmp.json');
  const targetPath = path.join(publicDir, 'quran-corpus-v2.json');

  // Atomic write & rename
  fs.writeFileSync(tmpPath, finalJsonString, 'utf8');

  // Re-read and parse to verify intact write
  const verifyContent = fs.readFileSync(tmpPath, 'utf8');
  const parsedVerify = JSON.parse(verifyContent);
  if (!parsedVerify || !Array.isArray(parsedVerify.verses) || parsedVerify.verses.length !== 6236) {
    fs.unlinkSync(tmpPath);
    throw new Error('Temporary file verification failed!');
  }

  fs.renameSync(tmpPath, targetPath);
  console.log(`Successfully generated atomic /public/quran-corpus-v2.json (SHA-256: ${hash})`);
}

main().catch(err => {
  console.error('Generation script failed:', err);
  process.exit(1);
});
