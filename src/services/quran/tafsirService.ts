import { TafsirSource, TafsirEntry } from '../../types';

export const TAFSIR_SOURCES: TafsirSource[] = [
  {
    id: 'nahi-footnotes',
    name: 'Komentimi i Hasan Nahit (Shënime)',
    author: 'Hasan Efendi Nahi',
    language: 'sq',
    languageLabel: 'Shqip',
    provider: 'quranenc',
    translationKey: 'albanian_nahi',
    attribution: 'Përkthimi dhe komentimi nga Hasan I. Nahi / QuranEnc.com',
  },
  {
    id: 'ibn-kathir',
    name: 'Tefsiri i Ibn Kethirit (I shkurtuar)',
    author: 'Hafidh Ibn Kethir',
    language: 'en',
    languageLabel: 'English',
    provider: 'quran.com',
    resourceId: 169,
    attribution: 'Tafsir Ibn Kathir (Abridged) / Quran.com',
  },
  {
    id: 'muyassar',
    name: 'Et-Tefsir El-Mujesser',
    author: 'Komisioni i Dijetarëve të Medinës',
    language: 'ar',
    languageLabel: 'العربية',
    provider: 'quran.com',
    resourceId: 16,
    attribution: 'Kompleksi i Mbretit Fehd për Shtypjen e Kuranit / Quran.com',
  },
  {
    id: 'saadi',
    name: 'Tefsir Es-Sa\'di (Tejsir El-Kerim)',
    author: 'Shejh Abdur-Rrahman Es-Sa\'di',
    language: 'ar',
    languageLabel: 'العربية',
    provider: 'quran.com',
    resourceId: 91,
    attribution: 'Tafsir As-Sa\'di / Quran.com',
  },
];

export const DEFAULT_TAFSIR_SOURCE_ID = 'nahi-footnotes';

// In-memory session cache: key = `${verseKey}:${sourceId}`
const tafsirMemoryCache = new Map<string, TafsirEntry>();

/**
 * Returns available verified Tafsir sources.
 */
export function getAvailableTafsirSources(): TafsirSource[] {
  return [...TAFSIR_SOURCES];
}

/**
 * Finds a source definition by its unique identifier.
 */
export function getTafsirSourceById(sourceId: string): TafsirSource {
  const found = TAFSIR_SOURCES.find(s => s.id === sourceId);
  return found || TAFSIR_SOURCES[0];
}

/**
 * Clears the session Tafsir cache.
 */
export function clearTafsirCache(): void {
  tafsirMemoryCache.clear();
}

/**
 * Parses verseKey "surah:ayah" into numeric surah and ayah.
 */
export function parseVerseKey(verseKey: string): { surah: number; ayah: number } {
  const parts = verseKey.split(':');
  const surah = parseInt(parts[0], 10) || 1;
  const ayah = parseInt(parts[1], 10) || 1;
  return { surah, ayah };
}

/**
 * Sanitizes HTML string safely using DOMParser (browser/jsdom safe)
 * Removes scripts, object/embed/iframe/style tags, and event handlers.
 */
export function sanitizeTafsirHtml(rawHtml: string): string {
  if (!rawHtml) return '';
  
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    // Basic regex fallback if DOMParser is unavailable
    return rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .trim();
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');

    // Remove unsafe nodes
    const unsafeTags = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta'];
    unsafeTags.forEach(tag => {
      const elements = doc.querySelectorAll(tag);
      elements.forEach(el => el.remove());
    });

    // Remove inline event handlers & dangerous attributes from all elements
    const allElements = doc.querySelectorAll('*');
    allElements.forEach(el => {
      Array.from(el.attributes).forEach(attr => {
        const name = attr.name.toLowerCase();
        if (name.startsWith('on') || name === 'href' && attr.value.trim().toLowerCase().startsWith('javascript:')) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return doc.body.innerHTML.trim();
  } catch {
    return rawHtml.replace(/<[^>]*>/g, '').trim();
  }
}

/**
 * Converts sanitized HTML into clean plain text for fallback or high-readability displays.
 */
export function extractPlainTextFromHtml(html: string): string {
  if (!html) return '';
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  } catch {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}

/**
 * Fetches Tafsir entry for a given verseKey and source.
 * Includes timeout (8s), deterministic states, and in-memory cache.
 */
export async function getTafsir(
  verseKey: string,
  sourceId: string = DEFAULT_TAFSIR_SOURCE_ID,
  parentSignal?: AbortSignal
): Promise<TafsirEntry> {
  const { surah, ayah } = parseVerseKey(verseKey);
  const source = getTafsirSourceById(sourceId);
  const cacheKey = `${surah}:${ayah}:${source.id}`;

  // 1. Check in-memory cache
  if (tafsirMemoryCache.has(cacheKey)) {
    return tafsirMemoryCache.get(cacheKey)!;
  }

  // 2. Set up timeout controller (8 seconds)
  const timeoutMs = 8000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Link with parent signal if provided
  if (parentSignal) {
    parentSignal.addEventListener('abort', () => controller.abort());
  }

  try {
    let resultText = '';
    let resultRawHtml = '';

    if (source.provider === 'quranenc') {
      // Fetch from QuranEnc API (e.g. Hasan Nahi Albanian commentary & footnotes)
      const translationKey = source.translationKey || 'albanian_nahi';
      const url = `https://quranenc.com/api/v1/translation/aya/${encodeURIComponent(translationKey)}/${surah}/${ayah}`;

      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Gabim nga serveri i QuranEnc (${res.status})`);
      }

      const json = await res.json();
      if (!json || !json.result) {
        throw new Error('Përgjigje e pavlefshme nga serveri i tefsirit.');
      }

      const footnotes = json.result.footnotes || '';
      const translation = json.result.translation || '';

      if (footnotes && footnotes.trim().length > 0) {
        resultText = footnotes.trim();
        resultRawHtml = `<p>${footnotes.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`;
      } else {
        resultText = '';
        resultRawHtml = '';
      }
    } else if (source.provider === 'quran.com') {
      // Fetch from Quran.com API v4
      const resourceId = source.resourceId || 169;
      const url = `https://api.quran.com/api/v4/tafsirs/${resourceId}/by_ayah/${surah}:${ayah}`;

      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Gabim nga serveri i Quran.com (${res.status})`);
      }

      const json = await res.json();
      if (!json || !json.tafsir || !json.tafsir.text) {
        throw new Error('Nuk u gjet përmbajtje tefsiri për këtë ajet.');
      }

      const rawText = json.tafsir.text || '';
      resultRawHtml = sanitizeTafsirHtml(rawText);
      resultText = extractPlainTextFromHtml(resultRawHtml);
    } else {
      throw new Error(`Ofruesi i panjohur: ${source.provider}`);
    }

    const entry: TafsirEntry = {
      verseKey: `${surah}:${ayah}`,
      surahNumber: surah,
      ayahNumber: ayah,
      source,
      text: resultText,
      rawHtml: resultRawHtml,
      attribution: source.attribution,
      fetchedAt: Date.now(),
    };

    // Save to memory cache
    tafsirMemoryCache.set(cacheKey, entry);

    return entry;
  } catch (err: unknown) {
    if (err instanceof Error && (err.name === 'AbortError' || controller.signal.aborted)) {
      throw new Error('Kërkesa vonoi shumë. Ju lutem kontrolloni lidhjen tuaj të internetit.');
    }
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Ndodhi një gabim i papritur gjatë ngarkimit të tefsirit.');
  } finally {
    clearTimeout(timeoutId);
  }
}
