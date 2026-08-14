/**
 * Mushaf Page & QCF Font Prefetch Engine (Phase 1 Foundation)
 * Dynamically preloads font assets and page tokens for the [N-2 .. N+2] neighborhood.
 */

// In-memory cache for loaded font families and page token structures
const LOADED_FONTS = new Set<string>();
const PAGE_DATA_CACHE = new Map<number, any>();
const IN_FLIGHT_DATA = new Map<number, Promise<any>>();

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
        const loadedFace = await fontFace.load();
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
 * Fetches and caches page token data.
 */
export async function fetchMushafPageData(page: number): Promise<any> {
  if (PAGE_DATA_CACHE.has(page)) {
    return PAGE_DATA_CACHE.get(page);
  }

  if (IN_FLIGHT_DATA.has(page)) {
    return IN_FLIGHT_DATA.get(page);
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(`/.netlify/functions/quran-page?page=${page}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      PAGE_DATA_CACHE.set(page, data);
      return data;
    } catch (err) {
      console.warn(`Failed to fetch page data for page ${page}:`, err);
      return null;
    } finally {
      IN_FLIGHT_DATA.delete(page);
    }
  })();

  IN_FLIGHT_DATA.set(page, fetchPromise);
  return fetchPromise;
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
