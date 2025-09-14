// Service Worker for offline caching
const CACHE_NAME = 'arcana-game-v1'
const STATIC_CACHE = 'arcana-static-v1'
const DYNAMIC_CACHE = 'arcana-dynamic-v1'

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  // Add other static assets here
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/locations/,
  /\/api\/mobs/,
  /\/api\/skills/,
  /\/api\/items/
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets...')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Static assets cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Serving from cache:', request.url)
          return cachedResponse
        }

        // Otherwise fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response
            const responseToCache = response.clone()

            // Determine which cache to use
            let cacheToUse = DYNAMIC_CACHE
            
            // Check if it's a static asset
            if (STATIC_ASSETS.includes(url.pathname)) {
              cacheToUse = STATIC_CACHE
            }
            
            // Check if it's an API call
            const isApiCall = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))
            if (isApiCall) {
              cacheToUse = DYNAMIC_CACHE
            }

            // Cache the response
            caches.open(cacheToUse)
              .then((cache) => {
                cache.put(request, responseToCache)
                console.log('Cached response:', request.url)
              })
              .catch((error) => {
                console.error('Failed to cache response:', error)
              })

            return response
          })
          .catch((error) => {
            console.error('Fetch failed:', error)
            
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/offline.html')
            }
            
            throw error
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'character-update') {
    event.waitUntil(
      // Handle offline character updates
      handleOfflineCharacterUpdate()
    )
  }
})

// Handle offline character updates
async function handleOfflineCharacterUpdate() {
  try {
    // Get pending updates from IndexedDB
    const pendingUpdates = await getPendingUpdates()
    
    if (pendingUpdates.length > 0) {
      console.log('Processing offline updates:', pendingUpdates.length)
      
      // Process each update
      for (const update of pendingUpdates) {
        try {
          await processCharacterUpdate(update)
          await removePendingUpdate(update.id)
        } catch (error) {
          console.error('Failed to process update:', error)
        }
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Placeholder functions for IndexedDB operations
async function getPendingUpdates() {
  // Implement IndexedDB logic to get pending updates
  return []
}

async function processCharacterUpdate(update) {
  // Implement logic to process character update
  console.log('Processing update:', update)
}

async function removePendingUpdate(id) {
  // Implement IndexedDB logic to remove processed update
  console.log('Removing update:', id)
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event)
  
  const options = {
    body: event.data ? event.data.text() : 'Новое уведомление',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть игру',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/icons/xmark.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('Arcana Game', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})
