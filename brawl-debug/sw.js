const VERSION = "0.0.11";
const FILES = ["brawl.js","brawl.css","index.html","icon-192.png"];
const cacheName = `brawl-${VERSION}`;

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(FILES);
        })
    );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== cacheName) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(cacheName)
        .then(cache => cache.match(event.request))
        .then((response) => response || fetch(event.request))
  );
});
