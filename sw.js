/**
 * Service Worker for AAA YVR 办事处 PWA
 * Enables offline functionality, caching, and background sync
 */

const CACHE_NAME = 'aaa-yvr-v1';
const RUNTIME_CACHE = 'aaa-yvr-runtime-v1';
const ASSETS_TO_CACHE = [
  '/daisys-secret-place/',
  '/daisys-secret-place/index.html',
  '/daisys-secret-place/app.js',
  '/daisys-secret-place/style.css',
  '/daisys-secret-place/manifest.json'
];

// Install: Cache essential assets on first install
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(ASSETS_TO_CACHE).catch(err => {
          console.log('[ServiceWorker] Some assets failed to cache:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
            .map(name => {
              console.log('[ServiceWorker] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Network-first for HTML, cache-first for assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // HTML pages: network-first
  if (request.headers.get('Accept')?.includes('text/html') || url.pathname.endsWith('/') || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const cacheName = RUNTIME_CACHE;
            caches.open(cacheName).then(cache => {
              cache.put(request, response.clone());
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then(cached => {
            return cached || caches.match('/daisys-secret-place/index.html');
          });
        })
    );
    return;
  }
  
  // Assets (JS, CSS, images): cache-first
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          return cached;
        }
        
        return fetch(request)
          .then(response => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
            
            return response;
          })
          .catch(err => {
            console.log('[ServiceWorker] Fetch failed for:', url.href, err);
            return new Response('Offline - resource not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
