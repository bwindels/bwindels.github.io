const VERSION = "0.0.1";
const FILES = ["brawl.js","brawl.css","index.html"];
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(`brawl-${VERSION}`).then(function(cache) {
            return cache.addAll(FILES);
        })
    );
});
