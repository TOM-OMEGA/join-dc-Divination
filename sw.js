self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('divination-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/images/medieval-carrot-placeholder.jpg',
        '/images/carrot-thumb.png'
      ]);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});
