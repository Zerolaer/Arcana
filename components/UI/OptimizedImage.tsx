'use client'

import { useState, useCallback, memo } from 'react'
import { ImageIcon, AlertCircle } from 'lucide-react'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  fallback?: string
  loading?: 'lazy' | 'eager'
  quality?: number
  width?: number
  height?: number
}

const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className = '',
  style,
  fallback = '/images/placeholder.png',
  loading = 'lazy',
  quality = 80,
  width,
  height
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const handleError = useCallback(() => {
    setImageError(true)
    setIsLoading(false)
  }, [])

  const handleLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  // Generate optimized src with WebP support
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    // If it's already a data URL or external URL, return as is
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('http')) {
      return originalSrc
    }

    // For local images, we could add WebP conversion here
    // For now, just return the original src
    return originalSrc
  }, [])

  const optimizedSrc = getOptimizedSrc(src)
  const displaySrc = imageError ? fallback : optimizedSrc

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
        </div>
      )}
      
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Ошибка загрузки</p>
          </div>
        </div>
      )}

      <img
        src={displaySrc}
        alt={alt}
        loading={loading}
        width={width}
        height={height}
        onError={handleError}
        onLoad={handleLoad}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${imageError ? 'opacity-50' : ''}`}
        style={{
          objectFit: 'cover',
          ...style
        }}
      />
    </div>
  )
})

export default OptimizedImage
