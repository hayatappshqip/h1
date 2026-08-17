/**
 * Mushaf Page & QCF Font Prefetch Engine (Phase 1 Foundation)
 * Dynamically preloads font assets and page tokens for the [N-2 .. N+2] neighborhood.
 */

// In-memory cache for loaded font families and page token structures
const LOADED_FONTS = new Set<string>();
const PAGE_DATA_CACHE = new Map<number, any>();
const IN_FLIGHT_DATA = new Map<number, Promise<any>>();

export interface CleanWord {
  position: number;
  char_type_name: string;
  code_v2: string;
  v2_page: number;
  line_number: number;
  page_number: number;
}

export interface CleanVerse {
  page_number: number;
  juz_number: number;
  hizb_number: number;
  rub_el_hizb_number: number;
  chapter_id: number;
  verse_number: number;
  verse_key: string;
  words: CleanWord[];
}

export interface QuranPageData {
  page_number: number;
  verses: CleanVerse[];
}

/**
 * Normalizes raw API verse objects to canonical CleanVerse format.
 */
function normalizeRawVerses(rawVerses: any[], pageNum: number): CleanVerse[] {
  return rawVerses.map((verse: any) => {
    const chapterId = verse.chapter_id || parseInt(String(verse.verse_key || '1:1').split(':')[0], 10) || 1;
    const words: CleanWord[] = Array.isArray(verse.words)
      ? verse.words.map((w: any) => ({
          position: typeof w.position === 'number' ? w.position : 0,
          char_type_name: String(w.char_type_name || ''),
          code_v2: String(w.code_v2 || ''),
          v2_page: typeof w.v2_page === 'number' ? w.v2_page : pageNum,
          line_number: typeof w.line_number === 'number' ? w.line_number : 1,
          page_number: typeof w.page_number === 'number' ? w.page_number : pageNum,
        }))
      : [];

    return {
      page_number: typeof verse.page_number === 'number' ? verse.page_number : pageNum,
      juz_number: typeof verse.juz_number === 'number' ? verse.juz_number : 1,
      hizb_number: typeof verse.hizb_number === 'number' ? verse.hizb_number : 1,
      rub_el_hizb_number: typeof verse.rub_el_hizb_number === 'number' ? verse.rub_el_hizb_number : (verse.rub_number || 1),
      chapter_id: chapterId,
      verse_number: typeof verse.verse_number === 'number' ? verse.verse_number : 1,
      verse_key: String(verse.verse_key || ''),
      words,
    };
  });
}

/**
 * Clears page data cache, optionally for a specific page or all pages.
 */
export function clearPageDataCache(page?: number): void {
  if (typeof page === 'number') {
    PAGE_DATA_CACHE.delete(page);
    IN_FLIGHT_DATA.delete(page);
  } else {
    PAGE_DATA_CACHE.clear();
    IN_FLIGHT_DATA.clear();
  }
}

/**
 * Calculates prefetch page list for a target page clamped between 1 and 604.
 */
export function calculatePrefetchPages(currentPage: number, radius = 2): number[] {
  const normPage = Math.min(Math.max(1, currentPage), 604);
  const start = Math.max(1, normPage - radius);
  const end = Math.min(604, normPage + radius);
  const pages: number[] = [];
  for (let p = start; p <= end; p++) {
    pages.push(p);
  }
  return pages;
}

/**
 * Preloads the QCF V2 font for a given page number.
 */
export async function prefetchQcfFont(page: number): Promise<string> {
  const fontFamilyName = `QCF_P${page}`;
  if (LOADED_FONTS.has(fontFamilyName)) {
    return fontFamilyName;
  }

  if (typeof document === 'undefined') {
    return fontFamilyName;
  }

  const fontUrl = `https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/p${page}.woff2`;
  const fontId = `qcf-v2-font-style-p${page}`;

  if (!document.getElementById(fontId)) {
    const styleEl = document.createElement('style');
    styleEl.id = fontId;
    styleEl.textContent = `
      @font-face {
        font-family: '${fontFamilyName}';
        src: url('${fontUrl}') format('woff2');
        font-weight: normal;
        font-style: normal;
        font-display: block;
      }
    `;
    document.head.appendChild(styleEl);
  }

  if ('fonts' in document) {
    try {
      if ('FontFace' in window) {
        const fontFace = new FontFace(fontFamilyName, `url('${fontUrl}')`, {
          display: 'block',
        });
        const loadPromise = fontFace.load();
        const timeoutPromise = new Promise<FontFace>((_, reject) => 
          setTimeout(() => reject(new Error('Font load timeout')), 5000)
        );
        const loadedFace = await Promise.race([loadPromise, timeoutPromise]);
        document.fonts.add(loadedFace);
        LOADED_FONTS.add(fontFamilyName);
      } else {
        await document.fonts.load(`16px "${fontFamilyName}"`);
        LOADED_FONTS.add(fontFamilyName);
      }
    } catch {
      // Ignore font load error if network offline or already cached
    }
  }

  LOADED_FONTS.add(fontFamilyName);
  return fontFamilyName;
}

/**
 * Fetches and caches page token data with multi-tier resilient fallback:
 * 1. In-memory cache
 * 2. Netlify server endpoint
 * 3. Direct public Quran API fallback
 * Throws an explicit error only when all retrieval strategies fail.
 */
export async function fetchMushafPageData(page: number, forceRefresh = false): Promise<QuranPageData> {
  const normPage = Math.min(Math.max(1, page), 604);

  if (!forceRefresh && PAGE_DATA_CACHE.has(normPage)) {
    return PAGE_DATA_CACHE.get(normPage);
  }

  if (forceRefresh) {
    PAGE_DATA_CACHE.delete(normPage);
    IN_FLIGHT_DATA.delete(normPage);
  }

  if (IN_FLIGHT_DATA.has(normPage)) {
    return IN_FLIGHT_DATA.get(normPage)!;
  }

  const fetchPromise = (async (): Promise<QuranPageData> => {
    // Strategy 1: Fetch via local backend Netlify function proxy
    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 8000);
      
      const res = await fetch(`/.netlify/functions/quran-page?page=${normPage}`, {
        signal: abortController.signal
      });
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.verses) && data.verses.length > 0) {
          PAGE_DATA_CACHE.set(normPage, data);
          return data;
        }
      }
    } catch (serverErr) {
      console.warn(`Server function fetch failed for page ${normPage}, trying public fallback:`, serverErr);
    }

    // Strategy 2: Direct public Quran API fallback
    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 8000);

      const publicUrl = `https://api.quran.com/api/v4/verses/by_page/${normPage}?words=true&word_fields=v2_page,code_v2,line_number,position,char_type_name,page_number&per_page=50`;
      const publicRes = await fetch(publicUrl, {
        headers: {
          'Accept': 'application/json',
        },
        signal: abortController.signal
      });
      clearTimeout(timeoutId);

      if (publicRes.ok) {
        const json = await publicRes.json();
        if (json && Array.isArray(json.verses) && json.verses.length > 0) {
          const cleanPageData: QuranPageData = {
            page_number: normPage,
            verses: normalizeRawVerses(json.verses, normPage),
          };
          PAGE_DATA_CACHE.set(normPage, cleanPageData);
          return cleanPageData;
        }
      }
    } catch (publicErr) {
      console.warn(`Public API fallback failed for page ${normPage}:`, publicErr);
    }

    // If both failed, throw explicit descriptive error
    throw new Error(`Nuk u arrit të ngarkohet faqja ${normPage}. Ju lutemi provoni përsëri.`);
  })();

  IN_FLIGHT_DATA.set(normPage, fetchPromise);

  try {
    const result = await fetchPromise;
    return result;
  } finally {
    IN_FLIGHT_DATA.delete(normPage);
  }
}

/**
 * Pre-fetches the neighborhood around the current page [N-2, N-1, N, N+1, N+2].
 */
export function prefetchPageNeighborhood(currentPage: number): void {
  const pagesToPreload = calculatePrefetchPages(currentPage, 2);
  pagesToPreload.forEach((p) => {
    // Background font loading
    prefetchQcfFont(p).catch(() => {});
    // Background data loading
    if (!PAGE_DATA_CACHE.has(p)) {
      fetchMushafPageData(p).catch(() => {});
    }
  });
}
