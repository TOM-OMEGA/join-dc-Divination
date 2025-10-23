// ⚡ 版本號（每次修改要 +1 才會強制更新快取）
const CACHE_NAME = 'divination-v6';

// 📦 要快取的資源清單
const urlsToCache = [
  '/join-dc-Divination/',
  '/join-dc-Divination/index.html',
  '/join-dc-Divination/manifest.json',

   // 🎨 圖片與按鈕
  '/join-dc-Divination/images/medieval-carrot-placeholder.jpg',
  '/join-dc-Divination/images/carrot-thumb.png',
  '/join-dc-Divination/images/icon-192.png',
  '/join-dc-Divination/images/icon-512.png',

  '/join-dc-Divination/images/btn-start.png',
  '/join-dc-Divination/images/btn-next.png',
  '/join-dc-Divination/images/btn-draw.png',
  '/join-dc-Divination/images/btn-back.png',
  '/join-dc-Divination/images/btn-retry.png',

  '/join-dc-Divination/images/大吉.jpg',
  '/join-dc-Divination/images/中吉.jpg',
  '/join-dc-Divination/images/小吉.jpg',
  '/join-dc-Divination/images/吉.jpg',
  '/join-dc-Divination/images/凶.jpg'
];
  // 🆕 字體快取
  '/join-dc-Divination/fonts/HanyiSentyPagoda.ttf',
  '/join-dc-Divination/fonts/HanyiSentyPagoda.woff',
  '/join-dc-Divination/fonts/HanyiSentyPagoda.woff2',
  '/join-dc-Divination/fonts/MyChineseFont.woff'
];

// ⚙️ 安裝事件：快取靜態資源
self.addEventListener('install', event => {
  console.log('Service Worker: 安裝中...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: 快取中...', urlsToCache.length, '項資源');
      return cache.addAll(urlsToCache);
    })
  );
});

// 🚀 啟用事件：刪除舊快取
self.addEventListener('activate', event => {
  console.log('Service Worker: 啟用中...');
  self.clients.claim();
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Service Worker: 移除舊快取 =>', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// 🌐 攔截請求：離線優先策略
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // 🚫 跳過 manifest、API、非 GET 請求
  if (
    url.includes('api') ||
    url.includes('manifest.json') ||
    event.request.method !== 'GET'
  ) {
    console.log('Service Worker: 跳過請求 =>', url);
    return;
  }

  // 📡 離線優先：先取快取，無快取再抓網路
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(response => {
      if (response) {
        console.log('Service Worker: 從快取載入 =>', url);
        return response;
      }

      return fetch(event.request)
        .then(networkResponse => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== 'basic'
          ) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
            console.log('Service Worker: 新增到快取 =>', url);
          });

          return networkResponse;
        })
        .catch(err => {
          console.warn('Service Worker: 離線且無快取 =>', url, err);
        });
    })
  );
});
