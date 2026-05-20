const CACHE_NAME = 'morning-dashboard-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './dashboard.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './music-collection.json'
];

// Install Event — cache static resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate Event — cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event — smart caching strategy
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests
  if (req.method !== 'GET') return;

  // Strategy for API endpoints (Open-Meteo, Frankfurter, Hacker News, Discogs):
  // Network-First with a fallback to cache or offline messages
  const isApiRequest = url.hostname.includes('open-meteo.com') ||
                       url.hostname.includes('frankfurter.dev') ||
                       url.hostname.includes('firebaseio.com') ||
                       url.hostname.includes('discogs.com');

  if (isApiRequest) {
    event.respondWith(
      fetch(req)
        .then(response => {
          // Cache a clone of the successful API response for offline fallback
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to return from cache
          return caches.match(req);
        })
    );
  } else {
    // Cache-First with Network Fallback strategy for local dashboard static assets
    event.respondWith(
      caches.match(req).then(cachedResponse => {
        if (cachedResponse) {
          // Dynamically fetch and update cache in the background (Stale-While-Revalidate feel)
          fetch(req).then(networkResponse => {
            if (networkResponse.ok) {
              caches.open(CACHE_NAME).then(cache => cache.put(req, networkResponse));
            }
          }).catch(() => { /* ignore network error when updating */ });
          
          return cachedResponse;
        }

        return fetch(req).then(networkResponse => {
          if (networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          }
          return networkResponse;
        });
      })
    );
  }
});
