const CACHE_NAME = 'diet-max-cache-v2';
const urlsToCache = ['./index.html', './manifest.json'];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', event => {
    // 防止缓存 GitHub API 请求导致同步失败
    if (event.request.url.includes('api.github.com')) return;
    
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) return response;
            return fetch(event.request).then(response => {
                if(!response || response.status !== 200 || response.type !== 'basic') return response;
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => { cache.put(event.request, responseToCache); });
                return response;
            });
        })
    );
});