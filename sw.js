// StandIn Corp — Service Worker v3
const CACHE = 'standin-v3';
const SKIP_URLS = ['firebaseapp.com','googleapis.com','gstatic.com','fonts.googleapis.com'];

self.addEventListener('install', function(e) { self.skipWaiting(); });

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  if (SKIP_URLS.some(function(u){ return e.request.url.includes(u); })) return;
  e.respondWith(
    fetch(e.request).then(function(res) {
      if (res && res.status === 200 && res.type === 'basic') {
        caches.open(CACHE).then(function(c){ c.put(e.request, res.clone()); });
      }
      return res;
    }).catch(function() {
      return caches.match(e.request).then(function(cached){
        return cached || new Response('Offline', { status: 503, headers: {'Content-Type':'text/plain'} });
      });
    })
  );
});
