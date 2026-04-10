// StandIn Corp — Service Worker v2
const CACHE = 'standin-v2';
const OFFLINE_ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(OFFLINE_ASSETS);
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

// Network-first, cache-fallback
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  // Don't intercept Firebase API requests
  if (e.request.url.includes('firebaseapp.com') ||
      e.request.url.includes('googleapis.com') ||
      e.request.url.includes('firestore.googleapis.com')) return;
  e.respondWith(
    fetch(e.request).then(function(res) {
      if (res && res.status === 200) {
        var clone = res.clone();
        caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
      }
      return res;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});

self.addEventListener('message', function(e) {
  if (e.data === 'GET_VERSION') {
    e.source.postMessage({ type: 'VERSION', version: CACHE });
  }
});
