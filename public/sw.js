/**
 * SIPA Arena — Service Worker (PWA)
 * Stratégie :
 * - Navigation (HTML / routes SPA) : Network-First avec repli sur /index.html en cache (mode hors-ligne complet pour Solo IA & Pass & Play)
 * - API GET de lecture (/api/users/.../stats|matches|progression|auth/me) : Network-First avec repli cache pour consulter son profil hors-ligne
 * - Mutations API (POST/PUT) & WebSockets : Réseau uniquement
 * - Assets statiques (JS, CSS, icônes, polices) : Stale-While-Revalidate
 */

const CACHE_NAME = 'sipa-arena-pwa-v2';
const API_CACHE_NAME = 'sipa-arena-api-v2';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== API_CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET (POST, PUT, DELETE) et les schémas non-HTTP(S)
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Ignorer le client HMR de Vite en développement
  if (
    url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/@react-refresh') ||
    url.pathname.startsWith('/node_modules/') ||
    url.searchParams.has('t')
  ) {
    return;
  }

  // 1. Requêtes API GET (profil, stats, progression, historique) : Network-First avec cache de secours hors-ligne
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(JSON.stringify({ offline: true, error: 'Mode hors-ligne actif' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        })
    );
    return;
  }

  // 2. Navigation SPA (routes /arene-de-jeu, /arene-de-jeu/ia, /profil, /login...) : Network-First -> /index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', clone));
          }
          return response;
        })
        .catch(async () => {
          const cachedIndex = await caches.match('/index.html');
          const cachedRoot = await caches.match('/');
          return cachedIndex || cachedRoot;
        })
    );
    return;
  }

  // 3. Assets statiques (JS, CSS, images, icônes, polices, webmanifest) : Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkFetch = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && (networkResponse.status === 200 || networkResponse.status === 0)) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});

