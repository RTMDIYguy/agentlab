const CACHE_NAME = "assessment-generator-v1";
const APP_SHELL = [
  "/",
  "/assessment-generator",
  "/manifest.webmanifest",
  "/assessment-icon.svg",
];

function shouldCache(request, response) {
  const url = new URL(request.url);
  const staticAsset =
    url.pathname.startsWith("/assets/") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".woff2");

  return (
    url.origin === self.location.origin &&
    response.ok &&
    response.type === "basic" &&
    (APP_SHELL.includes(url.pathname) || staticAsset)
  );
}

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  // Never cache API or authenticated endpoints — responses may contain
  // session-specific data that must not be served to other users or stale.
  const url = new URL(event.request.url);
  if (
    url.pathname.startsWith("/api/") ||
    event.request.credentials === "include"
  )
    return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (shouldCache(event.request, response)) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() =>
        caches
          .match(event.request)
          .then(cached => cached || caches.match("/assessment-generator"))
      )
  );
});
