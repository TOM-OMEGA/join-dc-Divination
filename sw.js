const CACHE_NAME = 'divination-v2'; // 更新快取版本以觸發 Service Worker 更新
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
  console.log('Service Worker: 安裝中');
  // 強制讓新 Service Worker 立即啟用
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: 正在快取所有內容');
      return cache.addAll(urlsToCache);
    })
  );
});

// 攔截請求，離線時使用快取
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(response => {
      // 如果找到快取，則回傳快取內容
      if (response) {
        console.log('Service Worker: 從快取回傳', e.request.url);
        return response;
      }
      
      // 如果快取中沒有，則從網路獲取
      return fetch(e.request).then(
        networkResponse => {
          // 檢查回應是否有效，然後存入快取
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, responseToCache);
          });
          console.log('Service Worker: 從網路獲取並快取', e.request.url);
          return networkResponse;
        }
      );
    }).catch(() => {
      // 處理離線且快取中沒有的情況
      console.log('Service Worker: 離線模式，且快取中沒有請求的資源');
      // 可以回傳一個離線頁面作為備用
      // return caches.match('/join-dc-Divination/offline.html'); 
    })
  );
});

// 啟用新版本時清理舊快取
self.addEventListener('activate', e => {
  console.log('Service Worker: 啟用中');
  // 立即讓新 Service Worker 接管頁面
  self.clients.claim(); 
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Service Worker: 正在刪除舊快取', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});
