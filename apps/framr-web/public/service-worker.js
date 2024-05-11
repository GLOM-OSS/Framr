/* eslint-disable no-restricted-globals */

// Provide configured baseHref
const fetchBaseHref = async () => {
  const manifestUrl = 'assets/manifest.json';

  const cache = await caches.open('v2');
  let response = await cache.match(manifestUrl);

  if (!response) {
    await cache.add(manifestUrl);
    response = await cache.match(manifestUrl);
  }

  const manifest = await response?.json();
  const baseHref = manifest?.start_url;

  return baseHref;
};

const addResourcesToCache = async (resources) => {
  const cache = await caches.open('v2');
  await cache.addAll(resources);
};

const putInCache = async (request, response) => {
  const cache = await caches.open('v2');
  // only cache requests from http or https,
  // this originated as extension requests
  // will also be cached and
  // creates problems on the cache.put command
  if (request.url.startsWith('http') || request.url.startsWith('https'))
    await cache.put(request, response);
};

const cacheFirst = async (request) => {
  // Try to get the resource from the cache
  const responseFromCache = await caches.match(request);
  if (responseFromCache) {
    return responseFromCache;
  }

  // Try to get the resource from the network
  try {
    const responseFromNetwork = await fetch(request);
    // response can only be used once so we clone a copy for cache
    putInCache(request, responseFromNetwork.clone());
    return responseFromNetwork;
  } catch (error) {
    const fallbackResponse = await caches.match(await fetchBaseHref());
    if (fallbackResponse) {
      return fallbackResponse;
    }

    // Even when the fallback response is not available,
    // we must always return a Response object
    return new Response('Network error happened', {
      status: 408,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
};

// Enable navigation preload
const enableNavigationPreload = async () => {
  if (self.registration.navigationPreload) {
    await self.registration.navigationPreload.enable();
  }
};

self.addEventListener('activate', (event) => {
  event.waitUntil(enableNavigationPreload());
});

self.addEventListener('install', (event) => {
  event.waitUntil(async () => {
    addResourcesToCache([await fetchBaseHref()]);
  });
});

self.addEventListener('fetch', (event) => {
  event.respondWith(cacheFirst(event.request));
});
