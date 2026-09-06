const CACHE_NAME = 'diet-max-cache-v2';
const urlsToCache = ['./index.html', './manifest.json'];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', event => {
    // 防止缓存导致 GitHub API 或外部脚本加载失败
    if (event.request.url.includes('api.github.com') || event.request.url.includes('cdn.staticfile')) {
        return; 
    }
    
    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) return response;
            return fetch(event.request).then(response => {
                if(!response || response.status !== 200 || response.type !== 'basic') return response;
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => { cache.put(event.request, responseToCache); });
                return response;
            });
        }).catch(() => {
            console.error("Fetch failed; returning offline page instead.", event.request.url);
        })
    );
});