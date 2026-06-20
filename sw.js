/* WebApp Shell service worker — makes the shell work fully offline. */
const CACHE = 'shell-v2';
const BASE = '/webapp-shell/';
const ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.webmanifest',
  BASE + 'sw.js',
  BASE + 'icon.svg',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Let the loaded app's own cross-origin requests (CDNs, APIs) hit the network.
  if (url.origin !== self.location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);

    // Exact match first.
    let hit = await cache.match(req);
    if (hit) return hit;

    // Payloads live in the URL hash (never sent) or query — ignore search so
    // "/webapp-shell/?app=..." still resolves to the cached shell.
    hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;

    // Any navigation within scope falls back to the cached shell.
    if (req.mode === 'navigate') {
      const shell = await cache.match(BASE + 'index.html');
      if (shell) return shell;
    }

    // Otherwise go to network, caching same-origin successes for next time.
    try {
      const res = await fetch(req);
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) {
      const shell = await cache.match(BASE + 'index.html');
      if (shell) return shell;
      throw err;
    }
  })());
});
