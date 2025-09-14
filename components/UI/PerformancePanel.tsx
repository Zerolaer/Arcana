'use client'

import { useState, useEffect } from 'react'
import { usePerformanceMonitor } from '@/lib/performanceMetrics'
import { BarChart3, Zap, Clock, HardDrive, Wifi, WifiOff } from 'lucide-react'

export default function PerformancePanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [metrics, setMetrics] = useState<any[]>([])
  const [webVitals, setWebVitals] = useState<any>({})
  const [isOnline, setIsOnline] = useState(true)
  
  const {
    getMetrics,
    getWebVitals,
    getAverageMetric,
    getSlowestMetrics,
    clearMetrics
  } = usePerformanceMonitor()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const updateMetrics = () => {
      setMetrics(getMetrics())
      setWebVitals(getWebVitals())
    }

    const interval = setInterval(updateMetrics, 1000)
    updateMetrics()

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [getMetrics, getWebVitals])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const formatValue = (value: number) => {
    if (value < 1000) return `${value.toFixed(1)}ms`
    return `${(value / 1000).toFixed(2)}s`
  }

  const getVitalColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'text-green-400'
    if (value <= thresholds.poor) return 'text-yellow-400'
    return 'text-red-400'
  }

  const slowestMetrics = getSlowestMetrics(5)

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-dark-800/90 backdrop-blur-sm border border-gray-600/50 rounded-lg p-3 text-white hover:bg-dark-700/90 transition-all"
        title="Performance Metrics"
      >
        <BarChart3 className="w-5 h-5" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-dark-800/95 backdrop-blur-sm border border-gray-600/50 rounded-lg p-4 text-white max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Performance
            </h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-xs">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          {/* Web Vitals */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 text-gray-300">Web Vitals</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>FCP:</span>
                <span className={getVitalColor(webVitals.FCP || 0, { good: 1800, poor: 3000 })}>
                  {webVitals.FCP ? formatValue(webVitals.FCP) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>LCP:</span>
                <span className={getVitalColor(webVitals.LCP || 0, { good: 2500, poor: 4000 })}>
                  {webVitals.LCP ? formatValue(webVitals.LCP) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>FID:</span>
                <span className={getVitalColor(webVitals.FID || 0, { good: 100, poor: 300 })}>
                  {webVitals.FID ? formatValue(webVitals.FID) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>CLS:</span>
                <span className={getVitalColor(webVitals.CLS || 0, { good: 0.1, poor: 0.25 })}>
                  {webVitals.CLS ? webVitals.CLS.toFixed(3) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>TTFB:</span>
                <span className={getVitalColor(webVitals.TTFB || 0, { good: 800, poor: 1800 })}>
                  {webVitals.TTFB ? formatValue(webVitals.TTFB) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 text-gray-300">Memory</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Used:</span>
                <span>{formatValue(getAverageMetric('memory-used'))}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span>{formatValue(getAverageMetric('memory-total'))}</span>
              </div>
            </div>
          </div>

          {/* Slowest Operations */}
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2 text-gray-300">Slowest Operations</h4>
            <div className="space-y-1 text-xs">
              {slowestMetrics.map((metric, index) => (
                <div key={index} className="flex justify-between">
                  <span className="truncate max-w-32" title={metric.name}>
                    {metric.name}
                  </span>
                  <span className="text-red-400">{formatValue(metric.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={clearMetrics}
              className="flex-1 px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 px-3 py-1 bg-gray-500/20 text-gray-400 rounded text-xs hover:bg-gray-500/30"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
