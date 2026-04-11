// StandIn Corp — Service Worker v5
// KEY CHANGE: index.html is now NETWORK-FIRST (not cache-first) so devices
// always get the latest JS/HTML when online. Firestore sync relies on fresh JS.
const CACHE = 'standin-v5';

// URLs to never intercept (Firebase, Google APIs, fonts)
const BYPASS = [
  'firebaseapp.com', 'googleapis.com', 'gstatic.com',
  'fonts.googleapis.com', 'firestore.googleapis.com',
  'identitytoolkit', 'securetoken', 'firebase'
];

// Assets that are safe to serve from cache-first (immutable/versioned)
const CACHE_FIRST = [
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(['./manifest.json']);
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var url = e.request.url;

  // Bypass Firebase and Google API requests entirely
  if (BYPASS.some(function(u) { return url.indexOf(u) !== -1; })) return;

  // Cache-first for CDN assets (fonts, libraries)
  if (CACHE_FIRST.some(function(u) { return url.indexOf(u) !== -1; })) {
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        if (cached) return cached;
        return fetch(e.request).then(function(res) {
          if (res && res.status === 200) {
            var clone = res.clone();
            caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
          }
          return res;
        });
      })
    );
    return;
  }

  // NETWORK-FIRST for HTML pages — always fetch latest when online
  var isNavigation = e.request.mode === 'navigate' ||
                     url.endsWith('index.html') ||
                     url.endsWith('/');

  if (isNavigation) {
    e.respondWith(
      fetch(e.request).then(function(res) {
        if (res && res.status === 200) {
          var clone = res.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
        }
        return res;
      }).catch(function() {
        return caches.match(e.request).then(function(cached) {
          return cached || caches.match('./index.html');
        });
      })
    );
    return;
  }

  // Default: stale-while-revalidate
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var fetchPromise = fetch(e.request).then(function(res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var clone = res.clone();
          caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
        }
        return res;
      }).catch(function() {
        return new Response(
          '<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:3rem"><h2>You are offline</h2><p>Please check your connection and reload.</p></body></html>',
          { status: 503, headers: { 'Content-Type': 'text/html' } }
        );
      });
      return cached || fetchPromise;
    })
  );
});

self.addEventListener('message', function(e) {
  if (e.data === 'GET_VERSION') e.source.postMessage({ type: 'VERSION', version: CACHE });
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
