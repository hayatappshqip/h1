/**
 * Netlify Function: quran-page
 * Endpoint: /.netlify/functions/quran-page?page=1
 *
 * Fetches page data from Quran Foundation API using OAuth2 client credentials.
 * Returns only structural page/verse/word metrics (code_v2, position, page/juz/line layout)
 * without text_uthmani, translations, audio, or credentials.
 */

interface CleanWord {
  position: number;
  char_type_name: string;
  code_v2: string;
  v2_page: number;
  line_number: number;
  page_number: number;
}

interface CleanVerse {
  page_number: number;
  juz_number: number;
  hizb_number: number;
  rub_el_hizb_number: number;
  chapter_id: number;
  verse_number: number;
  verse_key: string;
  words: CleanWord[];
}

export interface QuranPageResponse {
  page_number: number;
  verses: CleanVerse[];
}

export interface QuranPageError {
  error: string;
}

// In-memory token cache for OAuth client_credentials
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getOAuthToken(): Promise<string | null> {
  const clientId = process.env.QURAN_CLIENT_ID;
  const clientSecret = process.env.QURAN_CLIENT_SECRET;
  const authUrl = process.env.QURAN_AUTH_URL || 'https://auth.quran.foundation/oauth2/token';

  if (!clientId || !clientSecret) {
    return null;
  }

  // Use cached token if valid for at least 30 seconds
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 30000) {
    return cachedToken.accessToken;
  }

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'content',
      }).toString(),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (!data || !data.access_token) {
      return null;
    }

    const expiresInMs = (data.expires_in || 3600) * 1000;
    cachedToken = {
      accessToken: data.access_token,
      expiresAt: now + expiresInMs,
    };

    return cachedToken.accessToken;
  } catch (err) {
    console.error('Quran OAuth Token fetch error:', err);
    return null;
  }
}

export async function fetchQuranPageData(pageStr: string | undefined): Promise<{ statusCode: number; data: QuranPageResponse | QuranPageError }> {
  const pageNum = parseInt(pageStr || '', 10);
  if (isNaN(pageNum) || pageNum < 1 || pageNum > 604) {
    return {
      statusCode: 400,
      data: {
        error: 'Numri i faqes është i pavlefshëm. Duhet të jetë një numër nga 1 deri në 604.',
      },
    };
  }

  const clientId = process.env.QURAN_CLIENT_ID;
  const clientSecret = process.env.QURAN_CLIENT_SECRET;

  let rawVerses: any[] | null = null;

  // 1. If OAuth client credentials exist, attempt authorized Quran Foundation API call
  if (clientId && clientSecret) {
    const accessToken = await getOAuthToken();
    if (accessToken) {
      const authEndpoints = [
        `https://apis.quran.foundation/content/api/v4/verses/by_page/${pageNum}?words=true&word_fields=v2_page,code_v2,line_number,position,char_type_name,page_number&per_page=50`,
        `https://api.quran.com/api/v4/verses/by_page/${pageNum}?words=true&word_fields=v2_page,code_v2,line_number,position,char_type_name,page_number&per_page=50`,
      ];

      for (const url of authEndpoints) {
        try {
          const apiRes = await fetch(url, {
            headers: {
              'x-auth-token': accessToken,
              'Authorization': `Bearer ${accessToken}`,
              'x-client-id': clientId,
              'Accept': 'application/json',
            },
          });

          if (apiRes.ok) {
            const json = await apiRes.json();
            if (json && Array.isArray(json.verses) && json.verses.length > 0) {
              rawVerses = json.verses;
              break;
            }
          }
        } catch {
          // ignore and try next
        }
      }
    }
  }

  // 2. If OAuth was missing, failed, or returned no verses, gracefully fall back to public Quran API
  if (!rawVerses) {
    try {
      const publicUrl = `https://api.quran.com/api/v4/verses/by_page/${pageNum}?words=true&word_fields=v2_page,code_v2,line_number,position,char_type_name,page_number&per_page=50`;
      const publicRes = await fetch(publicUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (publicRes.ok) {
        const json = await publicRes.json();
        if (json && Array.isArray(json.verses) && json.verses.length > 0) {
          rawVerses = json.verses;
        }
      }
    } catch (err) {
      console.warn(`Public Quran API fallback fetch error for page ${pageNum}:`, err);
    }
  }

  if (!rawVerses) {
    return {
      statusCode: 502,
      data: {
        error: 'Pati një problem gjatë marrjes së të dhënave të faqes nga API e Kuranit.',
      },
    };
  }

  // Transform to allowed fields only.
  // NOTE: words are intentionally NOT filtered by page here. A verse that spans a page
  // break carries words whose `v2_page` is the following page, and that following page's
  // API response does not repeat them. Dropping them here loses Quranic text permanently.
  // Page routing is performed client-side by `v2_page` across the [N-1, N, N+1] window.
  const cleanVerses: CleanVerse[] = rawVerses
    .map((verse: any) => {
      const chapterId = verse.chapter_id || parseInt(String(verse.verse_key || '1:1').split(':')[0], 10) || 1;
      const words: CleanWord[] = Array.isArray(verse.words)
        ? verse.words
            .map((w: any) => ({
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
    })
    .filter((verse: CleanVerse) => verse.words.length > 0);

  return {
    statusCode: 200,
    data: {
      page_number: pageNum,
      verses: cleanVerses,
    },
  };
}

// Netlify Function Event Handler Export
export const handler = async (event: any) => {
  const pageStr = event.queryStringParameters?.page;
  const result = await fetchQuranPageData(pageStr);

  return {
    statusCode: result.statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    body: JSON.stringify(result.data),
  };
};
