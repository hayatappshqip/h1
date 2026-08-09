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
  console.log('Starting Quran Corpus v2 CHUNKED generation...');
  const allVerses: RawVerse[] = [];

  const publicDir = path.join(process.cwd(), 'public');
  const chunkedDir = path.join(publicDir, 'quran-corpus-v2-chunked');
  const surahsDir = path.join(chunkedDir, 'surahs');

  if (!fs.existsSync(surahsDir)) {
    fs.mkdirSync(surahsDir, { recursive: true });
  }

  const manifestSurahs: Array<{
    surah: number;
    file: string;
    verseCount: number;
    bytes: number;
    sha256: string;
  }> = [];

  for (let s = 1; s <= 114; s++) {
    const meta = ALL_SURAHS_META.find(m => m.number === s);
    if (!meta) {
      throw new Error(`Surah metadata for surah ${s} not found`);
    }
    const expectedAyahs = meta.numberOfAyahs;
    let retries = 5;
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
      await new Promise(r => setTimeout(r, 600));
    }

    if (verses.length !== expectedAyahs) {
      throw new Error(`Surah ${s} validation failed: got ${verses.length} verses, expected ${expectedAyahs}`);
    }

    allVerses.push(...verses);

    const surahPadded = String(s).padStart(3, '0');
    const relativeFilePath = `surahs/${surahPadded}.json`;
    const targetFilePath = path.join(surahsDir, `${surahPadded}.json`);

    const surahObject = {
      surah: s,
      verseCount: verses.length,
      verses
    };

    const surahJsonString = JSON.stringify(surahObject, null, 2);
    const surahBytes = Buffer.byteLength(surahJsonString, 'utf8');
    const surahHash = crypto.createHash('sha256').update(surahJsonString, 'utf8').digest('hex');

    fs.writeFileSync(targetFilePath, surahJsonString, 'utf8');

    manifestSurahs.push({
      surah: s,
      file: relativeFilePath,
      verseCount: verses.length,
      bytes: surahBytes,
      sha256: surahHash
    });

    if (s % 10 === 0 || s === 114) {
      console.log(`Fetched and saved surahs 1..${s} (${allVerses.length} total verses so far)`);
    }
  }

  // --- Strict Validations ---
  console.log('Validating complete chunked corpus...');

  if (allVerses.length !== 6236) {
    throw new Error(`Corpus validation error: Total verses is ${allVerses.length}, expected 6236`);
  }

  const verseKeys = new Set<string>();
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
  }

  const rawJsonContent = JSON.stringify(allVerses);
  const sourceHash = crypto.createHash('sha256').update(rawJsonContent, 'utf8').digest('hex');

  const manifestObject = {
    version: 'quran-corpus-v2-chunked-1',
    provider: 'Quran.com API (Translation ID 88 - Hasan Nahi)',
    translationName: 'Hasan Nahi',
    totalSurahs: 114,
    totalVerses: 6236,
    sourceSha256: sourceHash,
    updatedAt: new Date().toISOString(),
    surahs: manifestSurahs
  };

  const manifestJsonString = JSON.stringify(manifestObject, null, 2);
  const manifestPath = path.join(chunkedDir, 'manifest.json');
  fs.writeFileSync(manifestPath, manifestJsonString, 'utf8');

  console.log(`Successfully generated chunked Quran corpus!`);
  console.log(`Manifest: ${manifestPath}`);
  console.log(`Total Surahs: 114, Total Verses: 6236`);
  console.log(`Source SHA-256: ${sourceHash}`);
}

main().catch(err => {
  console.error('Generation script failed:', err);
  process.exit(1);
});
