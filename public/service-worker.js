const CACHE_NAME = "next-pwa-cache-v1";
const urlsToCache = ["/favicon.ico", "/manifest.json", "/android-chrome-192x192.png", "/android-chrome-512x512.png"];

// Install event: Cache files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event: Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event: Serve cached files if available
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Serve cached response if available, otherwise fetch from network
        return (
          response ||
          fetch(event.request).then((fetchResponse) => {
            // Optionally cache new requests
            return caches.open(CACHE_NAME).then((cache) => {
              if (event.request.url.startsWith("http") && !event.request.url.includes("/api")) {
                cache.put(event.request, fetchResponse.clone());
              }
              return fetchResponse;
            });
          })
        );
      })
      .catch(() => {
        // Optional: Fallback for offline
        if (event.request.destination === "document") {
          return caches.match("/");
        }
      })
  );
});
