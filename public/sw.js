const CACHE = 'my-cache';

self.addEventListener('install', (event) => {
  console.log('The service worker is being installed.');

  caches.delete(CACHE);
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
    return result;
  }
  const networkPromise = fromNetwork(request);
  const cachePromise = caches.open(CACHE);
  const [networkResponse, cache]
    = await Promise.all([networkPromise, cachePromise]);
  await cache.put(request, networkResponse.clone());
  return networkResponse;
};

const shouldRouteBeIntercepted = (url) => {
  const isBlacklisted =
    /sockjs-node/.test(url) ||
    /chrome-extension/.test(url) ||
    /hot-update/.test(url);
  return !isBlacklisted;
};

self.addEventListener('fetch', (event) => {
  // Some react monitoring route, ignore this
  if (!shouldRouteBeIntercepted(event.request.url)) {
    event.respondWith(fromNetwork(event.request));
    return;
  }

  console.log('The service worker is serving the asset.', event.request.url);

  event.respondWith(cacheFirstStrategy(event.request));
});
