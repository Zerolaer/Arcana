'use client'

import { useEffect } from 'react'
import { useServiceWorker } from '@/lib/useServiceWorker'

export default function ServiceWorkerProvider() {
  const { isSupported, isRegistered, isOnline, error } = useServiceWorker()

  useEffect(() => {
    if (isSupported && isRegistered) {
      console.log('Service Worker is active and ready')
    }
    
    if (error) {
      console.error('Service Worker error:', error)
    }
  }, [isSupported, isRegistered, error])

  // Show offline indicator
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-yellow-500/90 text-black text-center py-2 z-50">
        <span className="text-sm font-medium">
          🔌 Вы находитесь в офлайн режиме. Некоторые функции могут быть недоступны.
        </span>
      </div>
    )
  }

  return null
}
