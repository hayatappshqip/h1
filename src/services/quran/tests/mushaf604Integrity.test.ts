import { describe, it, expect } from 'vitest';
import { CANONICAL_MUSHAF_PAGES } from '../../../data/canonicalMushafManifest';
import { ALL_SURAHS_META, SURAH_START_PAGES } from '../../../data/quranData';
import { ALL_JUZ_META } from '../../../data/juzData';
import {
  resolveVerseToPage,
  resolvePageToFirstVerse,
  resolvePageToLastVerse,
  resolveSurahToStartPage,
  resolveJuzToStartPage,
  resolveHizbQuarterToStartPage,
  resolveQuranPosition,
  getMushafPageModel,
} from '../quranPositionService';

describe('604-Page Medina Mushaf Integrity Suite', () => {
  it('should contain exactly 604 sequential pages without gaps', () => {
    expect(CANONICAL_MUSHAF_PAGES).toHaveLength(604);
    CANONICAL_MUSHAF_PAGES.forEach((pageMeta, idx) => {
      expect(pageMeta.page).toBe(idx + 1);
    });
  });

  it('should validate every page verse boundaries and reference existing surahs/ayahs', () => {
    CANONICAL_MUSHAF_PAGES.forEach((meta) => {
      expect(meta.page).toBeGreaterThanOrEqual(1);
      expect(meta.page).toBeLessThanOrEqual(604);

      // Validate Surah numbers
      expect(meta.startSurah).toBeGreaterThanOrEqual(1);
      expect(meta.startSurah).toBeLessThanOrEqual(114);
      expect(meta.endSurah).toBeGreaterThanOrEqual(meta.startSurah);
      expect(meta.endSurah).toBeLessThanOrEqual(114);

      // Fetch metadata for start and end surahs
      const startSurahMeta = ALL_SURAHS_META.find((s) => s.number === meta.startSurah);
      const endSurahMeta = ALL_SURAHS_META.find((s) => s.number === meta.endSurah);

      expect(startSurahMeta).toBeDefined();
      expect(endSurahMeta).toBeDefined();

      if (startSurahMeta && endSurahMeta) {
        expect(meta.startAyah).toBeGreaterThanOrEqual(1);
        expect(meta.startAyah).toBeLessThanOrEqual(startSurahMeta.numberOfAyahs);

        expect(meta.endAyah).toBeGreaterThanOrEqual(1);
        expect(meta.endAyah).toBeLessThanOrEqual(endSurahMeta.numberOfAyahs);

        // Start <= End check within page
        if (meta.startSurah === meta.endSurah) {
          expect(meta.startAyah).toBeLessThanOrEqual(meta.endAyah);
        }
      }

      // Validate Juz (1..30) and Hizb Quarter (1..240)
      expect(meta.juz).toBeGreaterThanOrEqual(1);
      expect(meta.juz).toBeLessThanOrEqual(30);
      expect(meta.hizbQuarter).toBeGreaterThanOrEqual(1);
      expect(meta.hizbQuarter).toBeLessThanOrEqual(240);
    });
  });

  it('should maintain strict Quran page-to-page verse continuity across all 604 pages', () => {
    for (let i = 0; i < CANONICAL_MUSHAF_PAGES.length - 1; i++) {
      const currentPage = CANONICAL_MUSHAF_PAGES[i];
      const nextPage = CANONICAL_MUSHAF_PAGES[i + 1];

      const endSurahMeta = ALL_SURAHS_META.find((s) => s.number === currentPage.endSurah)!;

      if (currentPage.endAyah < endSurahMeta.numberOfAyahs) {
        // Next page must continue on same surah at endAyah + 1
        expect(nextPage.startSurah).toBe(currentPage.endSurah);
        expect(nextPage.startAyah).toBe(currentPage.endAyah + 1);
      } else {
        // Current page finished the surah; next page must start at next surah, ayah 1
        expect(nextPage.startSurah).toBe(currentPage.endSurah + 1);
        expect(nextPage.startAyah).toBe(1);
      }
    }
  });

  it('should verify critical test pages: 1, 2, 42, 603, 604', () => {
    // Page 1: Al-Fatiha (1:1 to 1:7)
    const p1 = CANONICAL_MUSHAF_PAGES[0];
    expect(p1.page).toBe(1);
    expect(p1.startSurah).toBe(1);
    expect(p1.startAyah).toBe(1);
    expect(p1.endSurah).toBe(1);
    expect(p1.endAyah).toBe(7);
    expect(p1.juz).toBe(1);

    // Page 2: Al-Baqarah (2:1 to 2:5)
    const p2 = CANONICAL_MUSHAF_PAGES[1];
    expect(p2.page).toBe(2);
    expect(p2.startSurah).toBe(2);
    expect(p2.startAyah).toBe(1);
    expect(p2.endSurah).toBe(2);
    expect(p2.endAyah).toBe(5);
    expect(p2.juz).toBe(1);

    // Page 42: Al-Baqarah (2:253 to 2:256) - Juz 3 start & Ayat al-Kursi (2:255)
    const p42 = CANONICAL_MUSHAF_PAGES[41];
    expect(p42.page).toBe(42);
    expect(p42.startSurah).toBe(2);
    expect(p42.startAyah).toBe(253);
    expect(p42.endSurah).toBe(2);
    expect(p42.endAyah).toBe(256);
    expect(p42.juz).toBe(3);

    // Page 603: 109:1 to 111:5 (Al-Kafirun, An-Nasr, Al-Masad)
    const p603 = CANONICAL_MUSHAF_PAGES[602];
    expect(p603.page).toBe(603);
    expect(p603.startSurah).toBe(109);
    expect(p603.startAyah).toBe(1);
    expect(p603.endSurah).toBe(111);
    expect(p603.endAyah).toBe(5);
    expect(p603.juz).toBe(30);

    // Page 604: 112:1 to 114:6 (Al-Ikhlas, Al-Falaq, An-Nas)
    const p604 = CANONICAL_MUSHAF_PAGES[603];
    expect(p604.page).toBe(604);
    expect(p604.startSurah).toBe(112);
    expect(p604.startAyah).toBe(1);
    expect(p604.endSurah).toBe(114);
    expect(p604.endAyah).toBe(6);
    expect(p604.juz).toBe(30);
  });

  it('should accurately resolve positions and boundaries via pure position engine', () => {
    // Test resolveVerseToPage
    expect(resolveVerseToPage('1:1')).toBe(1);
    expect(resolveVerseToPage('1:7')).toBe(1);
    expect(resolveVerseToPage('2:1')).toBe(2);
    expect(resolveVerseToPage('2:255')).toBe(42); // Ayat al-Kursi
    expect(resolveVerseToPage('2:282')).toBe(48); // Ayat al-Dayn
    expect(resolveVerseToPage('114:6')).toBe(604); // An-Nas final verse

    // Test resolvePageToFirstVerse & resolvePageToLastVerse
    expect(resolvePageToFirstVerse(1)).toEqual({ surah: 1, ayah: 1, verseKey: '1:1' });
    expect(resolvePageToLastVerse(1)).toEqual({ surah: 1, ayah: 7, verseKey: '1:7' });

    expect(resolvePageToFirstVerse(42)).toEqual({ surah: 2, ayah: 253, verseKey: '2:253' });
    expect(resolvePageToLastVerse(42)).toEqual({ surah: 2, ayah: 256, verseKey: '2:256' });

    expect(resolvePageToFirstVerse(604)).toEqual({ surah: 112, ayah: 1, verseKey: '112:1' });
    expect(resolvePageToLastVerse(604)).toEqual({ surah: 114, ayah: 6, verseKey: '114:6' });

    // Test resolveSurahToStartPage
    expect(resolveSurahToStartPage(1)).toBe(1);
    expect(resolveSurahToStartPage(2)).toBe(2);
    expect(resolveSurahToStartPage(3)).toBe(50);
    expect(resolveSurahToStartPage(18)).toBe(293); // Al-Kahf
    expect(resolveSurahToStartPage(114)).toBe(604);

    // Test resolveJuzToStartPage
    expect(resolveJuzToStartPage(1)).toBe(1);
    expect(resolveJuzToStartPage(2)).toBe(22);
    expect(resolveJuzToStartPage(3)).toBe(42);
    expect(resolveJuzToStartPage(30)).toBe(582);

    // Test resolveHizbQuarterToStartPage
    expect(resolveHizbQuarterToStartPage(1)).toBe(1);
    expect(resolveHizbQuarterToStartPage(14)).toBe(42);
  });

  it('should build a valid domain MushafPage model for multi-surah and standard pages', () => {
    // Page 1: Al-Fatiha
    const page1Model = getMushafPageModel(1);
    expect(page1Model.pageNumber).toBe(1);
    expect(page1Model.surahHeaders).toHaveLength(1);
    expect(page1Model.surahHeaders[0].surahNumber).toBe(1);
    expect(page1Model.hasBismillah).toBe(true);

    // Page 604: Al-Ikhlas, Al-Falaq, An-Nas
    const page604Model = getMushafPageModel(604);
    expect(page604Model.pageNumber).toBe(604);
    expect(page604Model.surahHeaders).toHaveLength(3);
    expect(page604Model.surahHeaders.map((s) => s.surahNumber)).toEqual([112, 113, 114]);
    expect(page604Model.hasBismillah).toBe(true);
  });
});
