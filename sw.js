// ══════════════════════════════════════════════════════════════
//  STANDIN CORP — SERVICE WORKER  (sw.js)
//  Enables PWA offline caching via Cache-First strategy
// ══════════════════════════════════════════════════════════════

const CACHE_NAME = 'standin-corp-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // Google Fonts are cached on first load automatically via the fetch handler
];

// ── Install: pre-cache shell assets ──────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: purge old caches ────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: Network-first for Firebase, Cache-first for statics ─
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always go live for Firebase / Google APIs
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('firebase.googleapis.com') ||
    url.hostname.includes('googleapis.com')
  ) {
    return; // default browser fetch
  }

  // Cache-first for everything else (fonts, icons, app shell)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache valid GET responses
        if (
          event.request.method === 'GET' &&
          response.status === 200 &&
          (url.origin === self.location.origin ||
           url.hostname.includes('fonts.googleapis.com') ||
           url.hostname.includes('fonts.gstatic.com'))
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // If offline and not cached, return the app shell
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
