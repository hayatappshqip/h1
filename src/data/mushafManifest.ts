export interface MushafPageMeta {
  mushafPage: number;
  sourcePdfPage: number;
  surahNumber: number;
  fromVerse: string; // e.g. "1:1"
  toVerse: string;   // e.g. "1:7"
  juzNumber?: number;
  surahNameSq?: string;
  surahNameAr?: string;
}

export interface MushafEditionMeta {
  editionId: string;
  title: string;
  subtitle: string;
  pageCount: number;
  sourcePdf: string;
  linesPerPage: number;
  pages: MushafPageMeta[];
}

export const MUSHAF_EDITIONS: Record<string, MushafEditionMeta> = {
  'madinah-15-lines-poc': {
    editionId: 'madinah-15-lines-poc',
    title: 'Mushafi i Medinës — 15 rreshta',
    subtitle: 'Botimi Standard (Prototip 5 Faqe)',
    pageCount: 5,
    sourcePdf: '/assets/mushaf/madinah-15-lines-poc.pdf',
    linesPerPage: 15,
    pages: [
      {
        mushafPage: 1,
        sourcePdfPage: 1,
        surahNumber: 1,
        fromVerse: '1:1',
        toVerse: '1:7',
        juzNumber: 1,
        surahNameSq: 'El-Fatiha',
        surahNameAr: 'سورة الفاتحة'
      },
      {
        mushafPage: 2,
        sourcePdfPage: 2,
        surahNumber: 2,
        fromVerse: '2:1',
        toVerse: '2:5',
        juzNumber: 1,
        surahNameSq: 'El-Bekare',
        surahNameAr: 'سورة البقرة'
      },
      {
        mushafPage: 3,
        sourcePdfPage: 3,
        surahNumber: 2,
        fromVerse: '2:6',
        toVerse: '2:16',
        juzNumber: 1,
        surahNameSq: 'El-Bekare',
        surahNameAr: 'سورة البقرة'
      },
      {
        mushafPage: 4,
        sourcePdfPage: 4,
        surahNumber: 2,
        fromVerse: '2:17',
        toVerse: '2:24',
        juzNumber: 1,
        surahNameSq: 'El-Bekare',
        surahNameAr: 'سورة البقرة'
      },
      {
        mushafPage: 5,
        sourcePdfPage: 5,
        surahNumber: 2,
        fromVerse: '2:25',
        toVerse: '2:29',
        juzNumber: 1,
        surahNameSq: 'El-Bekare',
        surahNameAr: 'سورة البقرة'
      }
    ]
  },
  'tajweed-color-poc': {
    editionId: 'tajweed-color-poc',
    title: 'Mushafi me Texhvid — Prototip',
    subtitle: 'Rregullat e Texhvidit me Ngjyra (Prototip 5 Faqe)',
    pageCount: 5,
    sourcePdf: '/assets/mushaf/tajweed-color-poc.pdf',
    linesPerPage: 15,
    pages: [
      {
        mushafPage: 1,
        sourcePdfPage: 1,
        surahNumber: 1,
        fromVerse: '1:1',
        toVerse: '1:7',
        juzNumber: 1,
        surahNameSq: 'El-Fatiha',
        surahNameAr: 'سورة الفاتحة'
      },
      {
        mushafPage: 2,
        sourcePdfPage: 2,
        surahNumber: 2,
        fromVerse: '2:1',
        toVerse: '2:5',
        juzNumber: 1,
        surahNameSq: 'El-Bekare',
        surahNameAr: 'سورة البقرة'
      },
      {
        mushafPage: 3,
        sourcePdfPage: 3,
        surahNumber: 2,
        fromVerse: '2:6',
        toVerse: '2:16',
        juzNumber: 1,
        surahNameSq: 'El-Bekare',
        surahNameAr: 'سورة البقرة'
      },
      {
        mushafPage: 4,
        sourcePdfPage: 4,
        surahNumber: 2,
        fromVerse: '2:17',
        toVerse: '2:24',
        juzNumber: 1,
        surahNameSq: 'El-Bekare',
        surahNameAr: 'سورة البقرة'
      },
      {
        mushafPage: 5,
        sourcePdfPage: 5,
        surahNumber: 2,
        fromVerse: '2:25',
        toVerse: '2:29',
        juzNumber: 1,
        surahNameSq: 'El-Bekare',
        surahNameAr: 'سورة البقرة'
      }
    ]
  }
};

/**
 * Helper to resolve page number for a given surah and ayah in Mushaf mode
 */
export function getMushafPageForVerse(surah: number, ayah: number, editionKey = 'madinah-15-lines-poc'): number {
  const edition = MUSHAF_EDITIONS[editionKey] || MUSHAF_EDITIONS['madinah-15-lines-poc'];
  for (const p of edition.pages) {
    const [fromS, fromA] = p.fromVerse.split(':').map(Number);
    const [toS, toA] = p.toVerse.split(':').map(Number);
    if (surah > fromS && surah < toS) return p.mushafPage;
    if (surah === fromS && surah === toS) {
      if (ayah >= fromA && ayah <= toA) return p.mushafPage;
    } else if (surah === fromS && ayah >= fromA) {
      return p.mushafPage;
    } else if (surah === toS && ayah <= toA) {
      return p.mushafPage;
    }
  }
  return 1;
}

/**
 * Interface for stored local Mushaf state (requirement 6)
 */
export interface MushafReadingState {
  readerMode: 'by_verse' | 'continuous' | 'mushaf';
  mushafEdition: string;
  mushafPage: number;
  surah: number;
  ayah: number;
  updatedAt: string;
}

export const MUSHAF_STORAGE_KEY = 'hayat_mushaf_prototype_state';
