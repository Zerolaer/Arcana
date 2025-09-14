// Compression utilities for API responses and data

interface CompressionOptions {
  level?: number // 1-9, higher = better compression
  threshold?: number // Minimum size to compress (bytes)
}

class CompressionManager {
  private isSupported: boolean = false
  private compressionStream: CompressionStream | null = null
  private decompressionStream: DecompressionStream | null = null

  constructor() {
    this.checkSupport()
  }

  private checkSupport() {
    this.isSupported = 'CompressionStream' in window && 'DecompressionStream' in window
  }

  async compress(data: string, options: CompressionOptions = {}): Promise<Uint8Array> {
    if (!this.isSupported) {
      // Fallback: return original data as Uint8Array
      return new TextEncoder().encode(data)
    }

    const { level = 6, threshold = 1024 } = options

    // Don't compress small data
    if (data.length < threshold) {
      return new TextEncoder().encode(data)
    }

    try {
      const encoder = new TextEncoder()
      const dataStream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(data))
          controller.close()
        }
      })

      const compressedStream = dataStream.pipeThrough(
        new CompressionStream('gzip')
      )

      const chunks: Uint8Array[] = []
      const reader = compressedStream.getReader()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }

      // Combine chunks
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      const result = new Uint8Array(totalLength)
      let offset = 0

      for (const chunk of chunks) {
        result.set(chunk, offset)
        offset += chunk.length
      }

      return result
    } catch (error) {
      console.error('Compression failed:', error)
      return new TextEncoder().encode(data)
    }
  }

  async decompress(compressedData: Uint8Array): Promise<string> {
    if (!this.isSupported) {
      // Fallback: treat as plain text
      return new TextDecoder().decode(compressedData)
    }

    try {
      const dataStream = new ReadableStream({
        start(controller) {
          controller.enqueue(compressedData)
          controller.close()
        }
      })

      const decompressedStream = dataStream.pipeThrough(
        new DecompressionStream('gzip')
      )

      const chunks: Uint8Array[] = []
      const reader = decompressedStream.getReader()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }

      // Combine chunks
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      const result = new Uint8Array(totalLength)
      let offset = 0

      for (const chunk of chunks) {
        result.set(chunk, offset)
        offset += chunk.length
      }

      return new TextDecoder().decode(result)
    } catch (error) {
      console.error('Decompression failed:', error)
      return new TextDecoder().decode(compressedData)
    }
  }

  // Compress JSON data
  async compressJSON(data: any): Promise<Uint8Array> {
    const jsonString = JSON.stringify(data)
    return this.compress(jsonString)
  }

  // Decompress JSON data
  async decompressJSON(compressedData: Uint8Array): Promise<any> {
    const jsonString = await this.decompress(compressedData)
    return JSON.parse(jsonString)
  }

  // Get compression ratio
  getCompressionRatio(original: string, compressed: Uint8Array): number {
    const originalSize = new TextEncoder().encode(original).length
    const compressedSize = compressed.length
    return ((originalSize - compressedSize) / originalSize) * 100
  }

  isCompressionSupported(): boolean {
    return this.isSupported
  }
}

// Singleton instance
export const compressionManager = new CompressionManager()

// Enhanced fetch with compression
export async function compressedFetch(
  url: string, 
  options: RequestInit & { compress?: boolean } = {}
): Promise<Response> {
  const { compress = true, ...fetchOptions } = options

  if (!compress || !compressionManager.isCompressionSupported()) {
    return fetch(url, fetchOptions)
  }

  // Add compression headers
  const headers = new Headers(fetchOptions.headers)
  headers.set('Accept-Encoding', 'gzip, deflate, br')
  headers.set('Content-Encoding', 'gzip')

  // Compress request body if present
  if (fetchOptions.body) {
    let body = fetchOptions.body
    
    if (typeof body === 'string') {
      const compressed = await compressionManager.compress(body)
      body = compressed.buffer as ArrayBuffer
    }
    
    return fetch(url, {
      ...fetchOptions,
      headers,
      body
    })
  }

  return fetch(url, {
    ...fetchOptions,
    headers
  })
}

// Cache with compression
export class CompressedCache {
  private cache = new Map<string, Uint8Array>()
  private maxSize: number
  private currentSize: number = 0

  constructor(maxSize: number = 50 * 1024 * 1024) { // 50MB default
    this.maxSize = maxSize
  }

  async set(key: string, data: any): Promise<void> {
    const compressed = await compressionManager.compressJSON(data)
    
    // Check if adding this would exceed max size
    if (this.currentSize + compressed.length > this.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, compressed)
    this.currentSize += compressed.length
  }

  async get(key: string): Promise<any | null> {
    const compressed = this.cache.get(key)
    if (!compressed) return null

    try {
      return await compressionManager.decompressJSON(compressed)
    } catch (error) {
      console.error('Failed to decompress cached data:', error)
      this.cache.delete(key)
      return null
    }
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  delete(key: string): void {
    const compressed = this.cache.get(key)
    if (compressed) {
      this.currentSize -= compressed.length
      this.cache.delete(key)
    }
  }

  clear(): void {
    this.cache.clear()
    this.currentSize = 0
  }

  private evictOldest(): void {
    const firstKey = this.cache.keys().next().value
    if (firstKey) {
      this.delete(firstKey)
    }
  }

  getSize(): number {
    return this.currentSize
  }

  getMaxSize(): number {
    return this.maxSize
  }
}

// Global compressed cache instance
export const compressedCache = new CompressedCache()

// Utility functions
export function shouldCompress(data: any): boolean {
  if (typeof data === 'string') {
    return data.length > 1024 // Compress strings > 1KB
  }
  
  if (typeof data === 'object') {
    const jsonString = JSON.stringify(data)
    return jsonString.length > 1024
  }
  
  return false
}

export function getCompressionSavings(original: string, compressed: Uint8Array): {
  originalSize: number
  compressedSize: number
  savings: number
  ratio: number
} {
  const originalSize = new TextEncoder().encode(original).length
  const compressedSize = compressed.length
  const savings = originalSize - compressedSize
  const ratio = compressionManager.getCompressionRatio(original, compressed)

  return {
    originalSize,
    compressedSize,
    savings,
    ratio
  }
}
