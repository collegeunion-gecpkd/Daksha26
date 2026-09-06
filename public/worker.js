const CACHE_NAME = 'daksha26-v2';
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/daksha.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/boardData.json'
];

// Install: precache essential offline shells
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('Pre-caching partial failure', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: smart network-first for navigation, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Bypass cross-origin requests (e.g., Google Apps Script, external CDNs)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 1. Navigation requests (HTML pages): Network-First with Cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          // If network is offline, serve cached root
          return caches.match('/') || caches.match(request);
        })
    );
    return;
  }

  // 2. Static assets (/assets/, images, scripts, styles): Cache-First with Network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          // Cache only valid local static assets
          if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.svg')) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
        }
        return networkResponse;
      });
    })
  );
});