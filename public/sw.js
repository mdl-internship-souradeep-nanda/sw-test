const CACHE = 'my-cache';

self.addEventListener('install', (event) => {
  console.log('The service worker is being installed.');

  // event.skipWaiting();
});

const fromCache = async (request) => {
  const cache = await caches.open(CACHE);
  const result = await cache.match(request);
  return result;
};

const fromNetwork = async (request) => {
  const response = fetch(request);
  return response;
};

const cacheFirstStrategy = async (request) => {
  const result = await fromCache(request);
  if (result) {
    return result.clone();
  }
  const networkResponse = await fromNetwork(request);
  const cache = await caches.open(CACHE);
  await cache.put(request, networkResponse.clone());
  return networkResponse.clone();
};

self.addEventListener('fetch', (event) => {
  if (event.request.url.match(/info/)) {
    event.respondWith(fromNetwork(event.request));
    return;
  }

  console.log('The service worker is serving the asset.', event.request);

  event.respondWith(cacheFirstStrategy(event.request));
});
