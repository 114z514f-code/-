const CACHE_NAME = 'diet-max-cache-v6';
const urlsToCache = [
    './index.html',
    './manifest.json'
];

self.addEventListener('install', event => {
    // 强制新版本的 Service Worker 立即进入 waiting 状态
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('activate', event => {
    // 激活时，立即接管所有受控的页面
    event.waitUntil(self.clients.claim());
    
    // 遍历所有缓存，如果缓存名字跟当前 CACHE_NAME 不一致，直接删掉！
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    // 网络优先策略 (Network First)
    event.respondWith(
        fetch(event.request).then(response => {
            // 如果成功从网络拿到了最新数据，就把最新的存进缓存里备份
            if(response && response.status === 200 && response.type === 'basic') {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });
            }
            return response;
        }).catch(() => {
            // 如果断网了或者请求失败，就去本地缓存里找
            return caches.match(event.request);
        })
    );
});