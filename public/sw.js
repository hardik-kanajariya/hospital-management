// Service Worker for Hospital Management System
// Provides basic HTTP handling and prevents the dinosaur game

const CACHE_NAME = 'medcare-rural-http-v1';

// Basic assets to cache for faster loading (no offline support)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  console.log('HTTP Service Worker installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching basic assets for performance...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Basic assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache basic assets:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('HTTP Service Worker activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
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

  // Skip non-GET requests - let them go directly to network
  if (request.method !== 'GET') {
    return;
  }

  // Skip API requests - always go to network
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // For navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      handleNavigationRequest(request)
    );
    return;
  }

  // For static assets, try cache first for performance
  if (request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font') {
    event.respondWith(
      handleAssetRequest(request)
    );
  }
});

// Handle navigation requests (page loads)
async function handleNavigationRequest(request) {
  try {
    // Always try network first for navigation
    const networkResponse = await fetch(request);

    // Cache successful responses for faster subsequent loads
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Navigation request failed:', error);

    // Try to serve from cache if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If not in cache, try to serve the main index.html for SPA routing
    const indexResponse = await caches.match('/index.html');
    if (indexResponse) {
      return indexResponse;
    }

    // Last resort: return a connection required page
    return new Response(
      getConnectionRequiredPage(),
      {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Handle asset requests (CSS, JS, images, fonts)
async function handleAssetRequest(request) {
  try {
    // Check cache first for better performance
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try network
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch asset:', request.url, error);

    // Return empty response for failed assets to prevent broken page
    return new Response('', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Generate connection required page
function getConnectionRequiredPage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>MedCare Rural - Connection Required</title>
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
        .status {
          margin-top: 2rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .online {
          background: rgba(76, 175, 80, 0.2);
          border-color: rgba(76, 175, 80, 0.5);
        }
        .offline {
          background: rgba(244, 67, 54, 0.2);
          border-color: rgba(244, 67, 54, 0.5);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">🏥</div>
        <h1>MedCare Rural</h1>
        <p>This application requires an internet connection to function properly.</p>
        
        <div id="status" class="status offline">
          <strong>Status:</strong> <span id="status-text">Checking connection...</span>
        </div>
        
        <button class="retry-btn" onclick="window.location.reload()">
          Try Again
        </button>
        
        <script>
          function updateConnectionStatus() {
            const statusDiv = document.getElementById('status');
            const statusText = document.getElementById('status-text');
            
            if (navigator.onLine) {
              statusDiv.className = 'status online';
              statusText.textContent = 'Internet Connected - Click "Try Again" to reload';
            } else {
              statusDiv.className = 'status offline';
              statusText.textContent = 'No Internet Connection';
            }
          }
          
          // Auto-retry when connection is restored
          window.addEventListener('online', () => {
            updateConnectionStatus();
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          });
          
          window.addEventListener('offline', updateConnectionStatus);
          
          // Initial status check
          updateConnectionStatus();
          
          // Check every 5 seconds
          setInterval(updateConnectionStatus, 5000);
        </script>
      </div>
    </body>
    </html>
  `;
}

// Handle messages from the main app
self.addEventListener('message', (event) => {
  const { type } = event.data;

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

