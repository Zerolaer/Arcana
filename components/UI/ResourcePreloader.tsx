'use client'

import { useEffect } from 'react'

interface PreloadResource {
  href: string
  as: 'image' | 'script' | 'style' | 'font' | 'fetch'
  type?: string
  crossorigin?: 'anonymous' | 'use-credentials'
}

const CRITICAL_RESOURCES: PreloadResource[] = [
  // Critical images
  { href: '/icons/icon-192x192.png', as: 'image' },
  { href: '/icons/icon-512x512.png', as: 'image' },
  
  // Critical fonts
  { 
    href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap', 
    as: 'style' 
  },
  
  // Critical API endpoints (preconnect)
  { href: 'https://fonts.googleapis.com', as: 'fetch' },
  { href: 'https://fonts.gstatic.com', as: 'fetch' },
]

const LAZY_RESOURCES: PreloadResource[] = [
  // Location images
  { href: '/locations/peaceful_meadows.png', as: 'image' },
  { href: '/locations/dark_forest.png', as: 'image' },
  { href: '/locations/goblin_caves.png', as: 'image' },
  
  // Continent images
  { href: '/continents/continent_1.png', as: 'image' },
  { href: '/continents/continent_2.png', as: 'image' },
  { href: '/continents/continent_3.png', as: 'image' },
]

export default function ResourcePreloader() {
  useEffect(() => {
    // Preload critical resources immediately
    preloadResources(CRITICAL_RESOURCES)
    
    // Preload lazy resources after a delay
    const lazyTimer = setTimeout(() => {
      preloadResources(LAZY_RESOURCES)
    }, 2000)
    
    // Preload resources on user interaction
    const handleUserInteraction = () => {
      preloadResources(LAZY_RESOURCES)
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }
    
    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)
    document.addEventListener('touchstart', handleUserInteraction)
    
    return () => {
      clearTimeout(lazyTimer)
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }
  }, [])

  return null
}

function preloadResources(resources: PreloadResource[]) {
  resources.forEach(resource => {
    // Check if already preloaded
    const existingLink = document.querySelector(`link[href="${resource.href}"]`)
    if (existingLink) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = resource.href
    link.as = resource.as
    
    if (resource.type) {
      link.type = resource.type
    }
    
    if (resource.crossorigin) {
      link.crossOrigin = resource.crossorigin
    }
    
    // Add to head
    document.head.appendChild(link)
    
    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Preloading: ${resource.href}`)
    }
  })
}

// Hook for programmatic preloading
export function useResourcePreloader() {
  const preloadImage = (src: string) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(src)
      img.onerror = reject
      img.src = src
    })
  }

  const preloadScript = (src: string) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve(src)
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  const preloadStyle = (href: string) => {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.onload = () => resolve(href)
      link.onerror = reject
      document.head.appendChild(link)
    })
  }

  return {
    preloadImage,
    preloadScript,
    preloadStyle
  }
}
