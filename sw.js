// StandIn Corp — Service Worker v3
const CACHE = 'standin-v3';

self.addEventListener('install', function(e) {
  self.skipWaiting();
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

// Network-first, cache-fallback — skip Firebase and non-GET requests
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var url = e.request.url;
  // Never intercept Firebase, Google APIs, or font requests
  if (url.includes('firebaseapp.com') ||
      url.includes('googleapis.com') ||
      url.includes('gstatic.com') ||
      url.includes('fonts.googleapis.com') ||
      url.includes('firestore.googleapis.com')) {
    return; // Let browser handle normally
  }
  e.respondWith(
    fetch(e.request).then(function(res) {
      // Only cache valid same-origin responses
      if (res && res.status === 200 && res.type === 'basic') {
        var clone = res.clone();
        caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
      }
      return res;
    }).catch(function() {
      return caches.match(e.request).then(function(cached) {
        return cached || new Response('Offline — please reconnect.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});

self.addEventListener('message', function(e) {
  if (e.data === 'GET_VERSION') {
    e.source.postMessage({ type: 'VERSION', version: CACHE });
  }
});
