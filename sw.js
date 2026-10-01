// SW v7 — 앱 셸 캐싱 + 공유 대상(share_target)이 동작하려면 PWA 설치가 필요해서 최소한으로 둔다
// 네트워크 우선: PC에서 수정한 index.html·tv.html·videos.json 이 바로 반영되고, 오프라인일 때만 캐시를 쓴다
const CACHE_NAME = 'hometrainer-v8';
const ASSETS = ['./', './index.html', './tv.html', './videos.json', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
