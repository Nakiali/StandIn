// StandIn Corp — Service Worker v4
const CACHE = 'standin-v4';

// URLs to never intercept (Firebase, Google APIs, fonts)
const BYPASS = [
  'firebaseapp.com', 'googleapis.com', 'gstatic.com',
  'fonts.googleapis.com', 'firestore.googleapis.com',
  'identitytoolkit', 'securetoken'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(['./index.html', './manifest.json']);
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

  // Bypass Firebase and Google requests entirely — let browser handle them
  if (BYPASS.some(function(u) { return e.request.url.indexOf(u) !== -1; })) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      // Return cache immediately, then update in background (cache-first)
      var fetchPromise = fetch(e.request).then(function(res) {
        // Only cache same-origin successful responses
        if (res && res.status === 200 && res.type === 'basic') {
          var clone = res.clone(); // clone BEFORE using
          caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
        }
        return res;
      }).catch(function() {
        // Network failed — return offline fallback
        return new Response(
          '<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:3rem">'
          + '<h2>You are offline</h2><p>Please check your connection and reload.</p></body></html>',
          { status: 503, headers: { 'Content-Type': 'text/html' } }
        );
      });
      return cached || fetchPromise;
    })
  );
});

self.addEventListener('message', function(e) {
  if (e.data === 'GET_VERSION') e.source.postMessage({ type: 'VERSION', version: CACHE });
});
