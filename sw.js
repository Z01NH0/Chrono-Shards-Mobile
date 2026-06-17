/* ============================================================
   Chrono Shards — Service Worker
   Estratégia: Cache-First para assets estáticos,
   Network-First com fallback para o restante.
   ============================================================ */

const CACHE_VERSION = "chrono-shards-v3";
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

/* Arquivos que devem estar disponíveis offline imediatamente */
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./screenshots/showcase-1.png",
  "./screenshots/showcase-2.png",
  "./screenshots/showcase-3.png",
  "./screenshots/showcase-4.png"
];

/* ── INSTALL ── */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache =>
      Promise.allSettled(PRECACHE_URLS.map(url => cache.add(url)))
    )
  );
  self.skipWaiting();
});

/* ── ACTIVATE ── */
self.addEventListener("activate", event => {
  const KEEP = [STATIC_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => !KEEP.includes(key))
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ── FETCH ── */
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  /* Ignorar requests de extensões ou não-http */
  if (!url.protocol.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      /* Cache-First: retorna do cache se disponível */
      if (cached) return cached;

      /* Network com fallback dinâmico */
      return fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200 || response.type === "opaque") {
            return response;
          }
          const copy = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => {
          /* Fallback para o index.html em caso de falha de rede */
          if (event.request.destination === "document") {
            return caches.match("./index.html");
          }
        });
    })
  );
});

/* ── PUSH (preparado para notificações futuras) ── */
self.addEventListener("push", event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Chrono Shards";
  const options = {
    body: data.body || "Nova atualização disponível!",
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-192.png"
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
