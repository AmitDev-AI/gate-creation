/*
 * GATE Prep Hub service worker.
 *
 * Source of truth: scripts/sw-template.js
 * The build script fills in the cache version and the precache list, then writes dist/sw.js.
 *
 * Strategy:
 *  - Precaches every built asset on install, so a first visit is enough to go offline.
 *  - Navigations: network first (fresh app when online), cached index.html when offline.
 *  - Hashed assets: cache first (they are immutable).
 *  - User progress lives in IndexedDB, never in the cache, so updating never touches it.
 */

const VERSION = '__CACHE_VERSION__';
const PRECACHE = __PRECACHE_MANIFEST__;
const CACHE_NAME = `gate-prep-hub-${VERSION}`;
const CACHE_PREFIX = 'gate-prep-hub-';

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // addAll() rejects the whole batch if one file fails, so add individually.
      await Promise.allSettled(PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' }))));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          await cache.put('/index.html', response.clone());
          return response;
        } catch {
          const cache = await caches.open(CACHE_NAME);
          const cached = (await cache.match('/index.html')) || (await cache.match(request));
          return (
            cached ||
            new Response('<h1>Offline</h1><p>Open the app once while online to cache it.</p>', {
              status: 503,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            })
          );
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;

      try {
        const response = await fetch(request);
        if (response.ok && response.type === 'basic') {
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        return Response.error();
      }
    })(),
  );
});
