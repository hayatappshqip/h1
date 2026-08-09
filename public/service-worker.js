/**
 * Hayat Service Worker - Offline Shell Cache
 * CACHE_NAME: hayat-app-shell-v44
 *
 * v44:
 *  - fonti lokal Uthmani shtohet ne app shell (offline i vertete)
 *  - ikonat PWA shtohen ne cache
 *  - CDN i fontit ruhet me strategji cache-first (kerkesa CORS)
 *  - komenti i versionit tani perputhet me CACHE_NAME
 */

const CACHE_VERSION = 'v44';
const CACHE_NAME = `hayat-app-shell-${CACHE_VERSION}`;

// Burime kritike per guaskën offline. Nese ndonje deshton, instalimi nuk bllokohet.
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/quran-corpus-v2-chunked/manifest.json',
  '/fonts/UthmanicHafs1Ver18.woff2',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

// Origjinat e jashtme qe lejohen te ruhen ne cache (fonti si rezerve).
const CACHEABLE_EXTERNAL_HOSTS = ['cdn.jsdelivr.net'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // addAll deshton i gjithi nese nje burim kthen 404; e bejme tolerant.
      await Promise.all(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[Hayat SW] Nuk u ruajt ne cache:', url, err && err.message);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isExternalFont = CACHEABLE_EXTERNAL_HOSTS.includes(url.hostname);

  // Fonti nga CDN: cache-first. Pergjigjet jane CORS, prandaj ruhen dhe
  // funksionojne edhe offline pas ngarkimit te pare.
  if (isExternalFont) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          if (res && (res.status === 200 || res.type === 'opaque')) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(event.request, copy));
          }
          return res;
        }).catch(() => cached);
      })
    );
    return;
  }

  // Origjina te tjera te jashtme (audio streaming, API) nuk kalojne nga cache.
  if (url.origin !== location.origin && !url.hostname.includes('quran')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Kthe nga cache dhe fresko ne sfond nese ka rrjet.
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {
          // Mungesa e rrjetit konsumohet ne heshtje.
        });
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html') || caches.match('/');
        }
      });
    })
  );
});
