const CACHE_NAME = 'anak-hebat-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Hanya tangani GET dan non-API
  if (e.request.method === 'GET' && !e.request.url.includes('script.google.com')) {
    e.respondWith(
      caches.match(e.request).then((res) => {
        return res || fetch(e.request).catch(() => {
          return caches.match('./index.html');
        });
      })
    );
  }
});
