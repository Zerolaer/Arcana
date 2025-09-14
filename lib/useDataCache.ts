import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import { compressedCache, shouldCompress } from './compressionUtils'

interface CacheEntry<T> {
  data: T
  timestamp: number
  loading: boolean
  error: string | null
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  refetchOnMount?: boolean
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes default

class DataCache {
  private cache = new Map<string, CacheEntry<any>>()

  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    const entry = this.cache.get(key)
    if (!entry) {
      // Check compressed cache
      const compressedData = await compressedCache.get(key)
      if (compressedData) {
        return {
          data: compressedData,
          timestamp: Date.now(),
          loading: false,
          error: null
        }
      }
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key)
      compressedCache.delete(key)
      return null
    }

    return entry
  }

  async set<T>(key: string, data: T, loading = false, error: string | null = null): Promise<void> {
    // Use compressed cache for large data
    if (shouldCompress(data)) {
      await compressedCache.set(key, data)
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      loading,
      error
    })
  }

  setLoading(key: string): void {
    const entry = this.cache.get(key)
    if (entry) {
      entry.loading = true
    }
  }

  setError(key: string, error: string): void {
    const entry = this.cache.get(key)
    if (entry) {
      entry.error = error
      entry.loading = false
    }
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    return entry ? Date.now() - entry.timestamp <= CACHE_TTL : false
  }
}

const dataCache = new DataCache()

// Hook for cached data fetching
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
} {
  const [state, setState] = useState<{
    data: T | null
    loading: boolean
    error: string | null
  }>({
    data: null,
    loading: false,
    error: null
  })

  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    dataCache.setLoading(key)

    try {
      const data = await fetcher()
      await dataCache.set(key, data)
      setState({ data, loading: false, error: null })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      dataCache.setError(key, errorMessage)
      setState(prev => ({ ...prev, loading: false, error: errorMessage }))
    }
  }, [key, fetcher])

  useEffect(() => {
    const loadCachedData = async () => {
      const cached = await dataCache.get<T>(key)
      
      if (cached && !options.refetchOnMount) {
        setState({
          data: cached.data,
          loading: cached.loading,
          error: cached.error
        })
      } else {
        refetch()
      }
    }

    loadCachedData()
  }, [key, refetch, options.refetchOnMount])

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refetch
  }
}

// Predefined hooks for common data
export function useLocations() {
  return useCachedData<any[]>(
    'locations',
    async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('min_level')

      if (error) throw error
      return data || []
    },
    { ttl: 10 * 60 * 1000 } // 10 minutes
  )
}

export function useFarmingSpots(locationId?: string) {
  return useCachedData<any[]>(
    `farming_spots_${locationId}`,
    async () => {
      if (!locationId) return []
      
      const { data, error } = await supabase
        .from('farming_spots')
        .select('*')
        .eq('location_id', locationId)

      if (error) throw error
      return data || []
    },
    { ttl: 5 * 60 * 1000 } // 5 minutes
  )
}

export function useMobs() {
  return useCachedData<any[]>(
    'mobs',
    async () => {
      const { data, error } = await supabase
        .from('mobs')
        .select('*')
        .order('level')

      if (error) throw error
      return data || []
    },
    { ttl: 15 * 60 * 1000 } // 15 minutes
  )
}

export function useCharacterInventory(characterId: string) {
  return useCachedData<any[]>(
    `inventory_${characterId}`,
    async () => {
      const { data, error } = await (supabase as any)
        .rpc('get_character_inventory', { p_character_id: characterId })

      if (error) throw error
      return data || []
    },
    { ttl: 2 * 60 * 1000 } // 2 minutes
  )
}

export function useCharacterEquipment(characterId: string) {
  return useCachedData<any[]>(
    `equipment_${characterId}`,
    async () => {
      const { data, error } = await (supabase as any)
        .rpc('get_character_equipment', { p_character_id: characterId })

      if (error) throw error
      return data || []
    },
    { ttl: 2 * 60 * 1000 } // 2 minutes
  )
}

// Clear cache when needed
export function clearCache(key?: string) {
  dataCache.clear(key)
}

export function clearAllCache() {
  dataCache.clear()
}
