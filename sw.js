var CACHE = 'vistoria-fpj-v2';
var ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './excel-export.js',
  './manifest.json',
  './vendor/exceljs.min.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key !== CACHE;
      }).map(function (key) {
        return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  var cache = await caches.open(CACHE);
  var cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;
  try {
    var fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (error) {
    if (request.mode === 'navigate') {
      var fallback = await cache.match('./index.html');
      if (fallback) return fallback;
    }
    throw error;
  }
}
