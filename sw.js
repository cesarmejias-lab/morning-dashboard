const CACHE_NAME = 'morning-dashboard-v6';

// App shell files carry the code, so they are served network-first: a deploy
// reaches clients on their next load instead of the one after it. Everything
// else in STATIC_ASSETS stays cache-first.
const APP_SHELL = /(^|\/)(index\.html|dashboard\.js|clz-radar\.js|weather-verdict\.js|todoist\.js|styles\.css)$/;

const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './dashboard.js',
  './clz-radar.js',
  './weather-verdict.js',
  './todoist.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './music-collection.json'
];

// Install Event — cache static resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // `cache: 'reload'` bypasses the HTTP cache so a new version never
      // precaches stale copies of the assets it is meant to refresh
      .then(cache => cache.addAll(
        STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' }))
      ))
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

// Network-First — prefer fresh, keep a copy so the cache can serve us offline
function networkFirst(req) {
  return fetch(req)
    .then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      }
      return response;
    })
    .catch(() => caches.match(req).then(cached => {
      if (cached) return cached;
      // A navigation whose exact URL was never cached still has the
      // precached shell to fall back on
      return req.mode === 'navigate' ? caches.match('./index.html') : Response.error();
    }));
}

// Cache-First with background revalidation — for assets that rarely change
function cacheFirst(req) {
  return caches.match(req).then(cached => {
    if (cached) {
      // Refresh the cache in the background (Stale-While-Revalidate feel)
      fetch(req).then(fresh => {
        if (fresh.ok) {
          caches.open(CACHE_NAME).then(cache => cache.put(req, fresh));
        }
      }).catch(() => { /* ignore network error when updating */ });

      return cached;
    }

    return fetch(req).then(fresh => {
      if (fresh.ok) {
        const copy = fresh.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      }
      return fresh;
    });
  });
}

// Fetch Event — smart caching strategy
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET requests
  if (req.method !== 'GET') return;

  // Personal data: never intercepted, never cached. Two reasons — a cached copy
  // would serve stale tasks, and task content should not sit in Cache Storage
  // in the clear. See docs/superpowers/specs/2026-08-14-morning-utility-weather-todoist-design.md
  if (url.hostname === 'api.todoist.com') return;

  // API endpoints (Open-Meteo, Hacker News, Discogs)
  const isApiRequest = url.hostname.includes('open-meteo.com') ||
                       url.hostname.includes('firebaseio.com') ||
                       url.hostname.includes('discogs.com');

  // The HTML entry point and the code it loads
  const isAppShell = url.origin === self.location.origin &&
                     (req.mode === 'navigate' ||
                      url.pathname.endsWith('/') ||
                      APP_SHELL.test(url.pathname));

  event.respondWith(
    isApiRequest || isAppShell ? networkFirst(req) : cacheFirst(req)
  );
});
