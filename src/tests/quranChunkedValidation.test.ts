import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

describe('Quran Corpus Chunked Validation', () => {
 it('should validate manifest and all 114 surah files with SHA-256 integrity', () => {
 const chunkedDir = path.join(process.cwd(), 'public', 'quran-corpus-v2-chunked');
 const manifestPath = path.join(chunkedDir, 'manifest.json');

 expect(fs.existsSync(manifestPath)).toBe(true);

 const manifestContent = fs.readFileSync(manifestPath, 'utf8');
 const manifest = JSON.parse(manifestContent);

 expect(manifest.version).toBe('quran-corpus-v2-chunked-1');
 expect(manifest.totalSurahs).toBe(114);
 expect(manifest.totalVerses).toBe(6236);
 expect(Array.isArray(manifest.surahs)).toBe(true);
 expect(manifest.surahs.length).toBe(114);

 const seenVerseKeys = new Set<string>();
 let grandTotalVerses = 0;

 manifest.surahs.forEach((item: any, index: number) => {
 const expectedSurahNumber = index + 1;
 expect(item.surah).toBe(expectedSurahNumber);
 expect(typeof item.file).toBe('string');
 expect(typeof item.verseCount).toBe('number');
 expect(typeof item.bytes).toBe('number');
 expect(typeof item.sha256).toBe('string');

 const surahFilePath = path.join(chunkedDir, item.file);
 expect(fs.existsSync(surahFilePath)).toBe(true);

 const surahRawContent = fs.readFileSync(surahFilePath, 'utf8');
 const actualBytes = Buffer.byteLength(surahRawContent, 'utf8');
 const actualSha = crypto.createHash('sha256').update(surahRawContent, 'utf8').digest('hex');

 expect(actualSha).toBe(item.sha256);
 expect(actualBytes).toBe(item.bytes);

 const surahObj = JSON.parse(surahRawContent);
 expect(surahObj.surah).toBe(expectedSurahNumber);
 expect(surahObj.verseCount).toBe(item.verseCount);
 expect(Array.isArray(surahObj.verses)).toBe(true);
 expect(surahObj.verses.length).toBe(item.verseCount);

 surahObj.verses.forEach((v: any) => {
 expect(v.surah).toBe(expectedSurahNumber);
 expect(typeof v.ayah).toBe('number');
 expect(v.verseKey).toBe(`${expectedSurahNumber}:${v.ayah}`);
 expect(typeof v.arabic).toBe('string');
 expect(v.arabic.trim().length).toBeGreaterThan(0);
 expect(typeof v.translationSq).toBe('string');
 expect(v.translationSq.trim().length).toBeGreaterThan(0);

 expect(seenVerseKeys.has(v.verseKey)).toBe(false);
 seenVerseKeys.add(v.verseKey);
 });

 grandTotalVerses += surahObj.verses.length;
 });

 expect(grandTotalVerses).toBe(6236);
 expect(seenVerseKeys.size).toBe(6236);

 const resultMessage = `Quran corpus chunked validation: OK — ${manifest.totalSurahs} surahs, ${manifest.totalVerses} verses`;
 console.log(resultMessage);
 expect(resultMessage).toContain('Quran corpus chunked validation: OK — 114 surahs, 6236 verses');
 });
});
