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
 * Assembles the canonical CleanVerse list for a single Mushaf page.
 *
 * IMPORTANT (lossless page routing):
 * The Quran API returns a verse under the page where the verse STARTS. A verse that
 * spans a page break therefore carries words belonging to the NEXT page, and the next
 * page's response does not repeat them. Each word carries `v2_page`, which is the
 * authoritative Mushaf page for that word.
 *
 * So we route every word by `v2_page` and expect the caller to supply the raw verses of
 * pages [N-1, N, N+1]. Words are then regrouped into verses, deduped by
 * (chapter, verse, position) and ordered canonically. A verse may legitimately appear on
 * two pages with different word subsets.
 */
function normalizeRawVerses(rawVerses: any[], pageNum: number): CleanVerse[] {
  const byVerseKey = new Map<string, CleanVerse>();
  const seenWords = new Set<string>();

  for (const verse of Array.isArray(rawVerses) ? rawVerses : []) {
    const chapterId =
      verse?.chapter_id || parseInt(String(verse?.verse_key || '1:1').split(':')[0], 10) || 1;
    const verseNumber =
      typeof verse?.verse_number === 'number'
        ? verse.verse_number
        : parseInt(String(verse?.verse_key || '1:1').split(':')[1], 10) || 1;
    const verseKey = String(verse?.verse_key || `${chapterId}:${verseNumber}`);

    // Page the verse was fetched under; only used when a word lacks page metadata.
    const sourcePage =
      typeof verse?.__sourcePage === 'number'
        ? verse.__sourcePage
        : typeof verse?.page_number === 'number'
          ? verse.page_number
          : pageNum;

    const rawWords = Array.isArray(verse?.words) ? verse.words : [];

    for (const w of rawWords) {
      const wordPage =
        typeof w?.v2_page === 'number'
          ? w.v2_page
          : typeof w?.page_number === 'number'
            ? w.page_number
            : sourcePage;

      // Route by the word's own Mushaf page, not by the page the verse was fetched under.
      if (wordPage !== pageNum) continue;

      const position = typeof w?.position === 'number' ? w.position : 0;
      const dedupeKey = `${chapterId}:${verseNumber}:${position}`;
      if (seenWords.has(dedupeKey)) continue;
      seenWords.add(dedupeKey);

      let target = byVerseKey.get(verseKey);
      if (!target) {
        target = {
          page_number: pageNum,
          juz_number: typeof verse?.juz_number === 'number' ? verse.juz_number : 1,
          hizb_number: typeof verse?.hizb_number === 'number' ? verse.hizb_number : 1,
          rub_el_hizb_number:
            typeof verse?.rub_el_hizb_number === 'number'
              ? verse.rub_el_hizb_number
              : (verse?.rub_number || 1),
          chapter_id: chapterId,
          verse_number: verseNumber,
          verse_key: verseKey,
          words: [],
        };
        byVerseKey.set(verseKey, target);
      }

      target.words.push({
        position,
        char_type_name: String(w?.char_type_name || ''),
        code_v2: String(w?.code_v2 || ''),
        v2_page: wordPage,
        line_number: typeof w?.line_number === 'number' ? w.line_number : 1,
        page_number: typeof w?.page_number === 'number' ? w.page_number : wordPage,
      });
    }
  }

  const verses = Array.from(byVerseKey.values()).filter((v) => v.words.length > 0);
  verses.forEach((v) => v.words.sort((a, b) => a.position - b.position));
  verses.sort((a, b) =>
    a.chapter_id !== b.chapter_id
      ? a.chapter_id - b.chapter_id
      : a.verse_number - b.verse_number
  );
  return verses;
}

export const normalizeRawVersesForTesting = normalizeRawVerses;

/**
 * Clears page data cache, optionally for a specific page or all pages.
 */
export function clearPageDataCache(page?: number): void {
  if (typeof page === 'number') {
    PAGE_DATA_CACHE.delete(page);
    IN_FLIGHT_DATA.delete(page);
    clearRawPageCache(page);
  } else {
    PAGE_DATA_CACHE.clear();
    IN_FLIGHT_DATA.clear();
    clearRawPageCache();
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
 * Raw (unrouted) verse payload cache, keyed by the page the verses were FETCHED under.
 * Kept separate from PAGE_DATA_CACHE, which holds page-routed render-ready data.
 */
const RAW_PAGE_CACHE = new Map<number, any[]>();
const IN_FLIGHT_RAW = new Map<number, Promise<any[]>>();

/**
 * Clears the raw verse cache. Clearing page N also clears N-1 and N+1, because those
 * neighbours contribute words to page N's routed output.
 */
function clearRawPageCache(page?: number): void {
  if (typeof page === 'number') {
    for (const p of [page - 1, page, page + 1]) {
      RAW_PAGE_CACHE.delete(p);
      IN_FLIGHT_RAW.delete(p);
    }
  } else {
    RAW_PAGE_CACHE.clear();
    IN_FLIGHT_RAW.clear();
  }
}

/**
 * Fetches the raw verse array for a page with multi-tier resilient fallback:
 * 1. In-memory raw cache
 * 2. Netlify server endpoint
 * 3. Direct public Quran API fallback
 * Returns an empty array when every strategy fails (callers decide how to react).
 */
async function fetchRawPageVerses(page: number): Promise<any[]> {
  const normPage = Math.min(Math.max(1, page), 604);

  if (RAW_PAGE_CACHE.has(normPage)) {
    return RAW_PAGE_CACHE.get(normPage)!;
  }
  if (IN_FLIGHT_RAW.has(normPage)) {
    return IN_FLIGHT_RAW.get(normPage)!;
  }

  const promise = (async (): Promise<any[]> => {
    // Strategy 1: local backend Netlify function proxy
    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 8000);
      const res = await fetch(`/.netlify/functions/quran-page?page=${normPage}`, {
        signal: abortController.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.verses) && data.verses.length > 0) {
          RAW_PAGE_CACHE.set(normPage, data.verses);
          return data.verses;
        }
      }
    } catch (serverErr) {
      console.warn(`Server function fetch failed for page ${normPage}, trying public fallback:`, serverErr);
    }

    // Strategy 2: direct public Quran API fallback
    try {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 8000);
      const publicUrl = `https://api.quran.com/api/v4/verses/by_page/${normPage}?words=true&word_fields=v2_page,code_v2,line_number,position,char_type_name,page_number&per_page=50`;
      const publicRes = await fetch(publicUrl, {
        headers: { 'Accept': 'application/json' },
        signal: abortController.signal,
      });
      clearTimeout(timeoutId);

      if (publicRes.ok) {
        const json = await publicRes.json();
        if (json && Array.isArray(json.verses) && json.verses.length > 0) {
          RAW_PAGE_CACHE.set(normPage, json.verses);
          return json.verses;
        }
      }
    } catch (publicErr) {
      console.warn(`Public API fallback failed for page ${normPage}:`, publicErr);
    }

    return [];
  })();

  IN_FLIGHT_RAW.set(normPage, promise);
  try {
    return await promise;
  } finally {
    IN_FLIGHT_RAW.delete(normPage);
  }
}

/**
 * Fetches page-routed, render-ready data for a Mushaf page.
 *
 * Fetches the raw verses of pages [N-1, N, N+1] and routes every word by its own
 * `v2_page`, so ayahs that span a page break render completely on BOTH pages.
 * Only page N is required; neighbour failures degrade gracefully.
 */
export async function fetchMushafPageData(page: number, forceRefresh = false): Promise<QuranPageData> {
  const normPage = Math.min(Math.max(1, page), 604);

  if (!forceRefresh && PAGE_DATA_CACHE.has(normPage)) {
    return PAGE_DATA_CACHE.get(normPage);
  }

  if (forceRefresh) {
    PAGE_DATA_CACHE.delete(normPage);
    IN_FLIGHT_DATA.delete(normPage);
    for (const p of [normPage - 1, normPage, normPage + 1]) {
      RAW_PAGE_CACHE.delete(p);
      IN_FLIGHT_RAW.delete(p);
    }
  }

  if (IN_FLIGHT_DATA.has(normPage)) {
    return IN_FLIGHT_DATA.get(normPage)!;
  }

  const fetchPromise = (async (): Promise<QuranPageData> => {
    const windowPages = [normPage - 1, normPage, normPage + 1].filter((p) => p >= 1 && p <= 604);

    const results = await Promise.all(
      windowPages.map(async (p) => {
        try {
          const verses = await fetchRawPageVerses(p);
          return verses.map((v: any) => ({ ...v, __sourcePage: p }));
        } catch {
          return [] as any[];
        }
      })
    );

    const ownIndex = windowPages.indexOf(normPage);
    if (ownIndex === -1 || results[ownIndex].length === 0) {
      throw new Error(`Nuk u arrit të ngarkohet faqja ${normPage}. Ju lutemi provoni përsëri.`);
    }

    const combinedRaw = results.flat();
    const cleanPageData: QuranPageData = {
      page_number: normPage,
      verses: normalizeRawVerses(combinedRaw, normPage),
    };

    if (cleanPageData.verses.length === 0) {
      throw new Error(`Nuk u arrit të ngarkohet faqja ${normPage}. Ju lutemi provoni përsëri.`);
    }

    PAGE_DATA_CACHE.set(normPage, cleanPageData);
    return cleanPageData;
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
