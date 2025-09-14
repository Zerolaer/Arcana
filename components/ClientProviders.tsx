'use client'

import ServiceWorkerProvider from '@/components/ServiceWorkerProvider'
import PerformancePanel from '@/components/UI/PerformancePanel'

export default function ClientProviders() {
  return (
    <>
      <ServiceWorkerProvider />
      <PerformancePanel />
    </>
  )
}
