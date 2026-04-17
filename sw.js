// StandIn Corp — Service Worker v6
// index.html = marketing website (network-first)
// app.html   = platform app (network-first)
const CACHE = 'standin-v6';

const BYPASS = [
  'firebaseapp.com', 'googleapis.com', 'gstatic.com',
  'fonts.googleapis.com', 'firestore.googleapis.com',
  'identitytoolkit', 'securetoken', 'firebase'
];

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

  if (BYPASS.some(function(u) { return url.indexOf(u) !== -1; })) return;

  // Cache-first for CDN assets
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

  // Network-first for HTML pages (index.html and app.html)
  var isNavigation = e.request.mode === 'navigate' ||
                     url.endsWith('index.html') ||
                     url.endsWith('app.html') ||
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
          return cached || caches.match('./app.html');
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for everything else
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
