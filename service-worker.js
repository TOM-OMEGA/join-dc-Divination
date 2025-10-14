self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('divination-cache').then((cache) => {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json',
        './images/medieval-carrot-placeholder.jpg',
        './images/carrot-thumb.png',
        './images/icon-192.png'
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
