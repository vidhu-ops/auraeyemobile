export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js?v=3')
        .then((registration) => {
          console.log('✅ Service Worker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error.message, error);
        });
    });
  } else {
    console.log('Service Worker not supported in this browser');
  }
}
