const CACHE_NAME = 'kupala-static-v5';
const DYNAMIC_CACHE_NAME = 'kupala-dynamic-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/content/home.html',
  '/content/about.html',
  '/icons/icon-64.png',
  '/icons/icon-128.png',
  '/icons/icon-256.png',
  'https://unpkg.com/chota@latest',
  'https://cdn.socket.io/4.5.4/socket.io.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (event.request.method !== 'GET') {
    return;
  }

  if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/app.js') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/index.html')));
    return;
  }

  if (url.origin !== self.location.origin && !url.origin.includes('unpkg.com') && !url.origin.includes('cdn.socket.io')) {
    return;
  }

  if (url.pathname.startsWith('/content/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/content/home.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request);
    })
  );
});

self.addEventListener('push', (event) => {
  let data = { 
    title: '🌿 Купальские Заметки', 
    body: 'Новое событие',
    icon: '/icons/icon-128.png',
    badge: '/icons/icon-64.png'
  };
  
  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200],
    data: { url: '/', timestamp: Date.now() },
    actions: [
      { action: 'open', title: 'Открыть' },
      { action: 'close', title: 'Закрыть' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});