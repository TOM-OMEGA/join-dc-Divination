const CACHE_NAME = 'divination-v1';
const urlsToCache = [
  '/join-dc-Divination/',
  '/join-dc-Divination/index.html',
  '/join-dc-Divination/manifest.json',
  '/join-dc-Divination/images/medieval-carrot-placeholder.jpg',
  '/join-dc-Divination/images/carrot-thumb.png',
  '/join-dc-Divination/images/icon-192.png',
  '/join-dc-Divination/images/icon-512.png'
];

// 安裝事件：快取資源
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// 攔截請求，離線時使用快取
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});

// 啟用新版本時清理舊快取
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)
      )
    )
  );
});
