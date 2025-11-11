const CACHE_NAME = 'auraeye-v1';

const spiritualReminders = [
  {
    title: "Time to Breathe 🌬️",
    body: "Take a moment to breathe deeply and reconnect with your inner peace. Your soul energy awaits."
  },
  {
    title: "Meditation Reminder 🧘",
    body: "It's been 5 hours! Take a peaceful break and meditate for a few minutes to recharge your spirit."
  },
  {
    title: "Check Your Aura ✨",
    body: "Your energy field may have shifted. Take a moment to scan your aura and see how you're doing!"
  },
  {
    title: "Breathe & Center 💫",
    body: "Pause, breathe, and center yourself. Your spiritual journey needs these mindful moments."
  },
  {
    title: "Aura Check-In 🌈",
    body: "How is your energy today? Check your aura to see what colors are shining through!"
  },
  {
    title: "Mindful Moment 🕉️",
    body: "Take a 5-minute meditation break. Your mind and spirit will thank you!"
  }
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(self.clients.claim());
});

// Push event - handles background push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  
  let notificationData;
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      // If not JSON, use default
      notificationData = {
        title: event.data.text() || 'AuraEye Reminder',
        body: 'Check in with your spiritual journey',
      };
    }
  } else {
    // Use a random spiritual reminder
    const reminder = spiritualReminders[Math.floor(Math.random() * spiritualReminders.length)];
    notificationData = reminder;
  }

  const options = {
    body: notificationData.body,
    icon: '/logo.png',
    badge: '/logo.png',
    tag: 'spiritual-reminder',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      url: notificationData.url || '/',
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
      },
      {
        action: 'close',
        title: 'Dismiss',
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open or focus the app
  event.waitUntil(
    self.clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((clientList) => {
      // Check if a window is already open
      for (const client of clientList) {
        if (client.url.includes(event.notification.data.url) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(event.notification.data.url);
      }
    })
  );
});

// Basic fetch handler for offline support
self.addEventListener('fetch', (event) => {
  // Let the browser handle the request normally
  event.respondWith(fetch(event.request));
});
