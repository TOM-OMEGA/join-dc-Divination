// ⚡ 版本號（每次修改都要 +1 才會強制更新快取）
const CACHE_NAME = 'divination-v13';

// 📦 要快取的資源清單
const urlsToCache = [
  '/join-dc-Divination/',
  '/join-dc-Divination/index.html',
  '/join-dc-Divination/manifest.json',

  // 🎨 圖片與按鈕
  '/join-dc-Divination/images/medieval-carrot-placeholder.webp',
  '/join-dc-Divination/images/carrot-thumb.png',
  '/join-dc-Divination/images/icon-192.png',
  '/join-dc-Divination/images/icon-512.png',
  '/join-dc-Divination/images/btn-start.png',
  '/join-dc-Divination/images/btn-next.png',
  '/join-dc-Divination/images/btn-draw.png',
  '/join-dc-Divination/images/btn-back.png',
  '/join-dc-Divination/images/btn-retry.png',
  '/join-dc-Divination/images/大吉.webp',
  '/join-dc-Divination/images/中吉.webp',
  '/join-dc-Divination/images/小吉.webp',
  '/join-dc-Divination/images/吉.webp',
  '/join-dc-Divination/images/凶.webp',

  // 🆕 字體
  '/join-dc-Divination/fonts/HanyiSentyPagoda-fixed.ttf',
  '/join-dc-Divination/fonts/HanyiSentyPagoda-fixed.woff',
  '/join-dc-Divination/fonts/HanyiSentyPagoda-fixed.woff2',
  '/join-dc-Divination/fonts/MyChineseFont.woff',

  // 🪶 離線 fallback 頁面
  '/join-dc-Divination/offline.html'
];

// ⚙️ 安裝事件：快取靜態資源
self.addEventListener('install', event => {
  console.log('Service Worker: 安裝中...');
  self.skipWaiting(); // 立即啟用新版本
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: 快取中...', urlsToCache.length, '項資源');
      return cache.addAll(urlsToCache);
    })
  );
});

// 🚀 啟用事件：清理舊快取
self.addEventListener('activate', event => {
  console.log('Service Worker: 啟用中...');
  self.clients.claim();
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Service Worker: 移除舊快取 =>', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// 🌐 攔截請求：網路優先 + 離線 fallback
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // 🚫 跳過不該攔截的請求
  if (url.includes('api') || event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // ✅ 成功取得 → 更新快取
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(async () => {
        // 🚨 網路失敗 → 回退快取
        const cached = await caches.match(event.request, { ignoreSearch: true });
        if (cached) return cached;

        // 🪶 若是 HTML 頁面，回傳 offline.html 作為 fallback
        if (event.request.mode === 'navigate') {
          return caches.match('/join-dc-Divination/offline.html');
        }

        // ❗ 一定要回傳 Response 才不會卡住
        return new Response('', { status: 503, statusText: 'Offline' });
      })
  );
});
