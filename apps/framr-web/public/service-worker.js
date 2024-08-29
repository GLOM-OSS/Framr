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

  const manifest = await response.json();
  const baseHref = manifest.start_url;

  return baseHref;
};

const addResourcesToCache = async (resources) => {
  const cache = await caches.open('v2');
  await cache.addAll(resources);
};

const cacheResponse = async (request, response) => {
  const cache = await caches.open('v2');
  if (request.url.startsWith('http') || request.url.startsWith('https')) {
    await cache.put(request, response);
  }
};

const networkErrorResponse = new Response('Network error happened', {
  status: 408,
  headers: { 'Content-Type': 'text/plain' },
});

async function fetchAndCache(request) {
  try {
    const networkResponse = await fetch(request);
    // response can only be used once so we clone a copy for cache
    cacheResponse(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const fallbackResponse = await caches.match(await fetchBaseHref());
    if (fallbackResponse) {
      return fallbackResponse;
    }

    // Even when the fallback response is not available,
    // return a predefined network error response
    return networkErrorResponse;
  }
}

/**
 * This function gets a requests, and if the network is open
 * fetches the response from the network,
 * else verifies if the cache has the resource and returns that
 * else returns a custom error response
 *
 * @param request
 * @returns Response to request
 */
const fetchRequestResponse = async (request) => {
  if (navigator.onLine) {
    return await fetchAndCache(request);
  }
  // Try to get the resource from the cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  return networkErrorResponse;
};

// Enable navigation preload
const enableNavigationPreload = async () => {
  if (self.registration.navigationPreload) {
    await self.registration.navigationPreload.enable();
  }
};

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      enableNavigationPreload();
    })()
  );
});

self.addEventListener('install', (event) => {
  event.waitUntil(async () => {
    await addResourcesToCache([await fetchBaseHref()]);
  });
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetchRequestResponse(event.request));
});
