self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('divination-v1').then(cache => {
      return cache.addAll([
        '/join-dc-Divination/',
        '/join-dc-Divination/index.html',
        '/join-dc-Divination/manifest.json',
        '/join-dc-Divination/images/medieval-carrot-placeholder.jpg'
      ]);
    })
  );
});
