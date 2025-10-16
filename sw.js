const CACHE_NAME = 'divination-v5'; // ⚡ 更新版本號（每次改要加1）
const urlsToCache = [
  '/join-dc-Divination/',
  '/join-dc-Divination/index.html',
  '/join-dc-Divination/manifest.json',
  '/join-dc-Divination/images/medieval-carrot-placeholder.jpg',
  '/join-dc-Divination/images/carrot-thumb.png',
  '/join-dc-Divination/images/icon-192.png',
  '/join-dc-Divination/images/icon-512.png'
];

// ⚙️ 安裝事件：快取靜態資源
self.addEventListener('install', e => {
  console.log('Service Worker: 安裝中');
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: 正在快取靜態內容');
      return cache.addAll(urlsToCache);
    })
  );
});

// 🚀 啟用新版本時清除舊快取
self.addEventListener('activate', e => {
  console.log('Service Worker: 啟用中');
  self.clients.claim();
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Service Worker: 刪除舊快取', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// 🌐 攔截請求：離線時使用快取，但跳過 manifest.json 與 API
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // 🚫 跳過 manifest、API、或非 GET 請求
  if (
    url.includes('api') ||
    e.request.method !== 'GET'
  ) {
    console.log('Service Worker: 跳過網路請求', url);
    return;
  }

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(response => {
      if (response) {
        console.log('Service Worker: 從快取回傳', url);
        return response;
      }
      return fetch(e.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, responseToCache));
        console.log('Service Worker: 從網路獲取並快取', url);
        return networkResponse;
      });
    }).catch(err => {
      console.warn('Service Worker: 離線且無快取', url, err);
    })
  );
});
