const CACHE_NAME = 'auraeye-v2';
const STATIC_CACHE = 'auraeye-static-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/new-logo.jpeg',
  '/index.html'
];

// API routes that should never be cached
const API_ROUTES = ['/api/'];
const EXCLUDED_PATHS = ['/api/', '/socket', '/ws'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('⚠️ Service Worker: Cache failed', error);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Never cache API requests or WebSocket connections - always go to network
  if (EXCLUDED_PATHS.some(path => requestUrl.pathname.startsWith(path))) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Network-first strategy for navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the new response
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match('/') || caches.match(event.request);
        })
    );
    return;
  }
  
  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
      .catch(() => {
        return caches.match('/');
      })
  );
});

// CRITICAL: Handle push notifications
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received:', event);
  
  try {
    let notificationData = {
      title: 'AuraEye Spiritual Wellness',
      body: 'You have a new notification',
      icon: '/logo.png',
      badge: '/logo.png',
      tag: 'auraeye-notification',
      requireInteraction: false,
      data: { url: '/' }
    };

    if (event.data) {
      try {
        const data = event.data.json();
        notificationData = {
          title: data.title || notificationData.title,
          body: data.body || notificationData.body,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: 'auraeye-notification',
          requireInteraction: false,
          data: { url: data.url || '/' }
        };
        console.log('✅ Parsed push notification:', notificationData);
      } catch (e) {
        // If JSON parsing fails, use text as body
        notificationData.body = event.data.text();
        console.log('📝 Using text notification:', notificationData);
      }
    }

    event.waitUntil(
      self.registration.showNotification(notificationData.title, notificationData)
        .then(() => {
          console.log('✅ Notification displayed successfully');
        })
        .catch((error) => {
          console.error('❌ Failed to display notification:', error);
        })
    );
  } catch (error) {
    console.error('❌ Error handling push event:', error);
    event.waitUntil(
      self.registration.showNotification('AuraEye', {
        body: 'You have a new spiritual notification',
        icon: '/logo.png',
        badge: '/logo.png'
      })
    );
  }
});

// Handle notification clicks to navigate to the specified URL
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event.notification);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
      .then((clientList) => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not open, open it
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notification dismissed:', event.notification);
});
