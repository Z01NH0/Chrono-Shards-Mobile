/* ============================================================
   Chrono Shards — Service Worker v4
   Estratégia: Network-First para HTML, Cache-First para assets
   SkipWaiting agressivo para forçar atualização imediata
   ============================================================ */

const CACHE_VERSION = "chrono-shards-v4-mobile-patch";
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

/* ── INSTALL (Agressivo: Skip Waiting Imediato) ── */
self.addEventListener("install", event => {
  console.log("[SW v4] Installing new service worker version...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log("[SW v4] Precaching assets...");
      return Promise.allSettled(PRECACHE_URLS.map(url => cache.add(url)));
    })
  );
  // Força a ativação imediata, ignorando service workers antigos
  self.skipWaiting();
  console.log("[SW v4] SkipWaiting ativado - nova versão assumindo controle");
});

/* ── ACTIVATE (Limpa caches antigos agressivamente) ── */
self.addEventListener("activate", event => {
  console.log("[SW v4] Activating and cleaning old caches...");
  const KEEP = [STATIC_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then(keys => {
      console.log("[SW v4] Caches existentes:", keys);
      return Promise.all(
        keys
          .filter(key => !KEEP.includes(key))
          .map(key => {
            console.log("[SW v4] Deletando cache antigo:", key);
            return caches.delete(key);
          })
      );
    })
  );
  // Força o service worker a assumir controle de todos os clientes imediatamente
  self.clients.claim();
  console.log("[SW v4] Clients claimed - novo SW em controle total");
});

/* ── FETCH (Network-First para HTML, Cache-First para assets) ── */
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  const isHtmlRequest = event.request.destination === "document" || url.pathname.endsWith(".html");

  /* Ignorar requests de extensões ou não-http */
  if (!url.protocol.startsWith("http")) return;

  if (isHtmlRequest) {
    /* Network-First para HTML: sempre tenta buscar a versão mais recente */
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200) return response;
          const copy = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => cache.put(event.request, copy));
          console.log("[SW v4] HTML atualizado da rede:", url.pathname);
          return response;
        })
        .catch(() => {
          console.log("[SW v4] Rede indisponível, usando cache para:", url.pathname);
          return caches.match(event.request).then(cached => {
            return cached || caches.match("./index.html");
          });
        })
    );
  } else {
    /* Cache-First para assets (imagens, ícones, etc) */
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;

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
            console.log("[SW v4] Asset não disponível:", url.pathname);
            return null;
          });
      })
    );
  }
});

/* ── MESSAGE (Permite que o cliente force uma atualização) ── */
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW v4] Recebido comando SKIP_WAITING do cliente");
    self.skipWaiting();
  }
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

console.log("[SW v4] Service Worker v4 carregado com sucesso");
