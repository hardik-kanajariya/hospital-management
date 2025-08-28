// Service Worker for Hospital Management System
// Provides offline functionality and prevents the dinosaur game

const CACHE_NAME = 'medcare-rural-v1';
const STATIC_CACHE_NAME = 'medcare-static-v1';
const DYNAMIC_CACHE_NAME = 'medcare-dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.ico',
    // Add other critical assets here
];

// Routes that should be cached
const CACHE_ROUTES = [
    /^\/$/,
    /^\/index\.html$/,
    /^\/(patients|appointments|dashboard|billing|inventory|lab|beds|records|doctors|users)$/,
    /\.(?:css|js|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot)$/
];

// Routes that should never be cached
const NO_CACHE_ROUTES = [
    /^\/api\//,
    /^\/auth\//,
    /^\/socket/
];

self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');

    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Failed to cache static assets:', error);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');

    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all pages
            self.clients.claim()
        ])
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip routes that shouldn't be cached
    if (NO_CACHE_ROUTES.some(pattern => pattern.test(url.pathname))) {
        return;
    }

    // For navigation requests (HTML pages)
    if (request.mode === 'navigate') {
        event.respondWith(
            handleNavigationRequest(request)
        );
        return;
    }

    // For other requests (assets, etc.)
    if (CACHE_ROUTES.some(pattern => pattern.test(url.pathname))) {
        event.respondWith(
            handleAssetRequest(request)
        );
    }
});

// Handle navigation requests (page loads)
async function handleNavigationRequest(request) {
    try {
        // Try network first for navigation requests
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('Network request failed, trying cache:', error);

        // Try to serve from cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // If not in cache, try to serve the main index.html
        // This allows the SPA to handle routing offline
        const indexResponse = await caches.match('/index.html');
        if (indexResponse) {
            return indexResponse;
        }

        // Last resort: return a basic offline page
        return new Response(
            getOfflinePage(),
            {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'text/html' }
            }
        );
    }
}

// Handle asset requests (CSS, JS, images, etc.)
async function handleAssetRequest(request) {
    try {
        // Check cache first for assets
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Try network
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('Failed to fetch asset:', request.url, error);

        // Return a placeholder for failed asset requests
        return new Response('', { status: 200 });
    }
}

// Generate offline page content
function getOfflinePage() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MedCare Rural - Offline</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .container {
          text-align: center;
          max-width: 600px;
          background: rgba(255, 255, 255, 0.1);
          padding: 3rem;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: #ffffff;
        }
        p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          color: #f0f0f0;
          line-height: 1.6;
        }
        .icon {
          font-size: 4rem;
          margin-bottom: 2rem;
        }
        .retry-btn {
          background: #4facfe;
          color: white;
          border: none;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .retry-btn:hover {
          background: #357ae8;
        }
        .features {
          margin-top: 2rem;
          text-align: left;
        }
        .features ul {
          list-style: none;
          padding: 0;
        }
        .features li {
          margin: 0.5rem 0;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 5px;
        }
        .features li::before {
          content: "✓ ";
          color: #4facfe;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">🏥</div>
        <h1>MedCare Rural</h1>
        <p>You're currently offline, but you can still use the hospital management system!</p>
        
        <div class="features">
          <h3>Available offline features:</h3>
          <ul>
            <li>View and manage patient records</li>
            <li>Schedule appointments</li>
            <li>Access medical records</li>
            <li>Manage inventory</li>
            <li>Create bills and invoices</li>
            <li>All data syncs when connection returns</li>
          </ul>
        </div>
        
        <button class="retry-btn" onclick="window.location.reload()">
          Try Again
        </button>
        
        <script>
          // Auto-retry when connection is restored
          window.addEventListener('online', () => {
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          });
          
          // Show connection status
          function updateConnectionStatus() {
            if (navigator.onLine) {
              document.querySelector('.retry-btn').textContent = 'Connection Restored - Click to Continue';
              document.querySelector('.retry-btn').style.background = '#4caf50';
            }
          }
          
          window.addEventListener('online', updateConnectionStatus);
          window.addEventListener('offline', updateConnectionStatus);
          updateConnectionStatus();
        </script>
      </div>
    </body>
    </html>
  `;
}

// Handle sync events (for background sync)
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        console.log('Background sync triggered');
        event.waitUntil(performBackgroundSync());
    }
});

async function performBackgroundSync() {
    try {
        // Notify the main app that sync is needed
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'BACKGROUND_SYNC',
                action: 'PERFORM_SYNC'
            });
        });
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Handle messages from the main app
self.addEventListener('message', (event) => {
    const { type, action } = event.data;

    if (type === 'SKIP_WAITING') {
        self.skipWaiting();
    } else if (type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE_NAME)
                .then(cache => cache.addAll(event.data.urls))
        );
    }
});

console.log('Service Worker loaded successfully');
