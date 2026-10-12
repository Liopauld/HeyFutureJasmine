/**
 * 🏴‍☠️ HeyFutureJasmine! — Service Worker
 * Provides offline caching for static app shells, web fonts, textures, and assets.
 */

const CACHE_NAME = "hfj-static-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/favicon.svg",
  "/apple-touch-icon.png",
  "/site.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key.startsWith("hfj-static-") && key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // CacheStorage only supports HTTP(S) GET requests; browser extensions also
  // issue requests through controlled pages.
  if (request.method !== "GET" || !["http:", "https:"].includes(url.protocol)) {
    return;
  }

  // Do not cache backend API requests or external mutation endpoints
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Network-first for navigation requests (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match("/index.html")) || (await cache.match("/"));
      })
    );
    return;
  }

  // Cache-first strategy for static assets (fonts, scripts, styles, images)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          const responseToCache = response.clone();
          event.waitUntil(
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseToCache))
              .catch(() => { /* Cache failures must not break the network response. */ })
          );

          return response;
        })
        .catch(() => {
          // If offline and request is an image, fallback can be handled
          return Response.error();
        });
    })
  );
});
