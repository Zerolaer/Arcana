// Performance metrics collection and reporting

interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  type: 'navigation' | 'paint' | 'measure' | 'custom'
}

interface WebVitals {
  FCP: number | null // First Contentful Paint
  LCP: number | null // Largest Contentful Paint
  FID: number | null // First Input Delay
  CLS: number | null // Cumulative Layout Shift
  TTFB: number | null // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private isEnabled: boolean = true

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebVitals()
      this.initializeCustomMetrics()
    }
  }

  private initializeWebVitals() {
    // First Contentful Paint
    this.observePaint('first-contentful-paint', 'FCP')
    
    // Largest Contentful Paint
    this.observeLCP()
    
    // First Input Delay
    this.observeFID()
    
    // Cumulative Layout Shift
    this.observeCLS()
    
    // Time to First Byte
    this.observeTTFB()
  }

  private observePaint(name: string, metricName: string) {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === name) {
            this.recordMetric(metricName, entry.startTime, 'paint')
          }
        }
      })
      
      try {
        observer.observe({ entryTypes: ['paint'] })
      } catch (e) {
        console.warn('Paint observer not supported:', e)
      }
    }
  }

  private observeLCP() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.recordMetric('LCP', lastEntry.startTime, 'paint')
      })
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        console.warn('LCP observer not supported:', e)
      }
    }
  }

  private observeFID() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('FID', entry.duration, 'measure')
        }
      })
      
      try {
        observer.observe({ entryTypes: ['first-input'] })
      } catch (e) {
        console.warn('FID observer not supported:', e)
      }
    }
  }

  private observeCLS() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
            this.recordMetric('CLS', clsValue, 'measure')
          }
        }
      })
      
      try {
        observer.observe({ entryTypes: ['layout-shift'] })
      } catch (e) {
        console.warn('CLS observer not supported:', e)
      }
    }
  }

  private observeTTFB() {
    if (typeof performance !== 'undefined' && performance.timing) {
      const ttfb = performance.timing.responseStart - performance.timing.navigationStart
      this.recordMetric('TTFB', ttfb, 'navigation')
    }
  }

  private initializeCustomMetrics() {
    // Monitor component render times
    this.observeComponentRenders()
    
    // Monitor API call performance
    this.observeAPICalls()
    
    // Monitor memory usage
    this.observeMemoryUsage()
  }

  private observeComponentRenders() {
    // This would be implemented with React DevTools or custom hooks
    // For now, we'll use a simple approach
    const originalConsoleTime = console.time
    const originalConsoleTimeEnd = console.timeEnd
    
    console.time = (label: string) => {
      originalConsoleTime.call(console, label)
      this.recordMetric(`render-${label}`, typeof performance !== 'undefined' ? performance.now() : 0, 'custom')
    }
    
    console.timeEnd = (label: string) => {
      originalConsoleTimeEnd.call(console, label)
      const duration = (typeof performance !== 'undefined' ? performance.now() : 0) - (this.metrics
        ?.filter(m => m.name === `render-${label}`)
        .pop()?.value || 0)
      this.recordMetric(`render-duration-${label}`, duration, 'custom')
    }
  }

  private observeAPICalls() {
    // Monitor fetch performance
    if (typeof window !== 'undefined') {
      const originalFetch = window.fetch
      window.fetch = async (...args) => {
        const start = typeof performance !== 'undefined' ? performance.now() : 0
        const url = args[0] as string
        
        try {
          const response = await originalFetch(...args)
          const duration = (typeof performance !== 'undefined' ? performance.now() : 0) - start
          this.recordMetric(`api-${url}`, duration, 'custom')
          return response
        } catch (error) {
          const duration = (typeof performance !== 'undefined' ? performance.now() : 0) - start
          this.recordMetric(`api-error-${url}`, duration, 'custom')
          throw error
        }
      }
    }
  }

  private observeMemoryUsage() {
    if (typeof performance !== 'undefined' && 'memory' in performance && typeof setInterval !== 'undefined') {
      setInterval(() => {
        const memory = (performance as any).memory
        this.recordMetric('memory-used', memory.usedJSHeapSize, 'custom')
        this.recordMetric('memory-total', memory.totalJSHeapSize, 'custom')
        this.recordMetric('memory-limit', memory.jsHeapSizeLimit, 'custom')
      }, 30000) // Every 30 seconds
    }
  }

  recordMetric(name: string, value: number, type: PerformanceMetric['type'] = 'custom') {
    if (!this.isEnabled) return

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      type
    }

    this.metrics.push(metric)
    
    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance: ${name} = ${value.toFixed(2)}ms`)
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  getWebVitals(): WebVitals {
    const vitals: WebVitals = {
      FCP: null,
      LCP: null,
      FID: null,
      CLS: null,
      TTFB: null
    }

    this.metrics.forEach(metric => {
      if (metric.name in vitals) {
        (vitals as any)[metric.name] = metric.value
      }
    })

    return vitals
  }

  getAverageMetric(name: string): number {
    const metrics = this.metrics.filter(m => m.name === name)
    if (metrics.length === 0) return 0
    
    const sum = metrics.reduce((acc, m) => acc + m.value, 0)
    return sum / metrics.length
  }

  getSlowestMetrics(limit: number = 10): PerformanceMetric[] {
    return this.metrics
      .sort((a, b) => b.value - a.value)
      .slice(0, limit)
  }

  clearMetrics() {
    this.metrics = []
  }

  enable() {
    this.isEnabled = true
  }

  disable() {
    this.isEnabled = false
  }

  // Send metrics to analytics service
  async sendMetrics(endpoint: string) {
    if (this.metrics.length === 0) return

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: this.metrics,
          webVitals: this.getWebVitals(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
          timestamp: Date.now()
        })
      })
    } catch (error) {
      console.error('Failed to send metrics:', error)
    }
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    recordMetric: (name: string, value: number, type?: PerformanceMetric['type']) => 
      performanceMonitor.recordMetric(name, value, type),
    getMetrics: () => performanceMonitor.getMetrics(),
    getWebVitals: () => performanceMonitor.getWebVitals(),
    getAverageMetric: (name: string) => performanceMonitor.getAverageMetric(name),
    getSlowestMetrics: (limit?: number) => performanceMonitor.getSlowestMetrics(limit),
    clearMetrics: () => performanceMonitor.clearMetrics()
  }
}

// Utility functions
export function measurePerformance<T>(
  name: string, 
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = typeof performance !== 'undefined' ? performance.now() : 0
  
  const result = fn()
  
  if (result instanceof Promise) {
    return result.then((value) => {
      const duration = (typeof performance !== 'undefined' ? performance.now() : 0) - start
      performanceMonitor.recordMetric(name, duration, 'custom')
      return value
    })
  } else {
    const duration = (typeof performance !== 'undefined' ? performance.now() : 0) - start
    performanceMonitor.recordMetric(name, duration, 'custom')
    return result
  }
}

export function measureAsyncPerformance<T>(
  name: string, 
  fn: () => Promise<T>
): Promise<T> {
  const start = typeof performance !== 'undefined' ? performance.now() : 0
  
  return fn().then((value) => {
    const duration = (typeof performance !== 'undefined' ? performance.now() : 0) - start
    performanceMonitor.recordMetric(name, duration, 'custom')
    return value
  })
}
