
const STATIC_CACHE = 'ethrion-static-v1';
const DYNAMIC_CACHE = 'ethrion-dynamic-v1';
const STATIC_ASSETS = [
  '/', '/offline.html', '/styles/mobile.css', '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(STATIC_ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => ![STATIC_CACHE, DYNAMIC_CACHE].includes(k)).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Network-first for dynamic (e.g., /lab), cache-first for static
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/lab')) {
    e.respondWith(
      fetch(e.request).then(res => {
        const resClone = res.clone();
        caches.open(DYNAMIC_CACHE).then(c => c.put(e.request, resClone));
        return res;
      }).catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        const resClone = res.clone();
        caches.open(STATIC_CACHE).then(c => c.put(e.request, resClone));
        return res;
      }).catch(() => caches.match('/offline.html')))
    );
  }
});
