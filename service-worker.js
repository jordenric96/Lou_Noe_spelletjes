const CACHE_NAME = 'speelkwartier-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './css/memory.css',
  './css/doolhof.css',
  './css/blokken.css',
  './js/main.js',
  './js/memory.js',
  './js/doolhof.js',
  './js/blokken.js',
  './assets/images/icon.png'
  // Voeg hier eventueel andere belangrijke plaatjes toe als je wilt
];

// Installeren (Bestanden downloaden)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Ophalen (Als je offline bent, pak uit cache)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
