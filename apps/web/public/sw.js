/* LEDGER's service worker for the React app.

   The single file ships its own worker (ledger/sw.js), and it can be tiny: five
   files, all named, all precached. The app cannot do that, because Next writes
   its chunks with content hashes - a hand-written precache list would be a list
   of filenames that change on every deploy. So this worker caches by *rule*:

     · the app shell (`/`, the manifest, the icons) is precached on install, so
       a cold start with no network still gets a screen;
     · navigations are network-first with the cached shell as the fallback, so a
       deploy is picked up on the next visit and an offline visit still opens;
     · `/_next/static/*` is content-addressed and therefore cache-first forever:
       the same URL never means different bytes;
     · everything else same-origin is stale-while-revalidate, which keeps the
       game's own files fresh without ever blocking a paint;
     · anything cross-origin is left alone - there is nothing cross-origin the
       game needs, and a worker that swallows somebody else's API is a worker
       that hides a bug.

   The save lives in localStorage, which a service worker cannot see or touch:
   clearing the cache never touches a player's run. Bump CACHE to evict. */
const CACHE = 'ledger-app-v1';
const SHELL = ['/', '/manifest.webmanifest', '/icon.svg', '/icon-192.png', '/icon-512.png', '/icon-maskable-512.png', '/apple-touch-icon.png'];

self.addEventListener('install', function (ev) {
  ev.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return Promise.all(SHELL.map(function (u) { return c.add(u).catch(function () {}); })); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (ev) {
  ev.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

/* a navigation missed by the network gets the shell that was precached */
async function pageFromCache(req) {
  const c = await caches.open(CACHE);
  const hit = await c.match(req, { ignoreSearch: true });
  if (hit) return hit;
  return c.match('/');
}

self.addEventListener('fetch', function (ev) {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;      /* not ours to cache */

  if (req.mode === 'navigate') {
    ev.respondWith(
      fetch(req)
        .then(function (res) {
          const copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
          return res;
        })
        .catch(function () { return pageFromCache(req).then(function (hit) { return hit || Response.error(); }); })
    );
    return;
  }

  const immutable = url.pathname.startsWith('/_next/static/');
  if (immutable) {
    ev.respondWith(
      caches.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (res) {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
          }
          return res;
        });
      })
    );
    return;
  }

  ev.respondWith(
    caches.match(req).then(function (hit) {
      const net = fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
        }
        return res;
      }).catch(function () { return hit || Response.error(); });
      return hit || net;                                 /* stale-while-revalidate */
    })
  );
});
