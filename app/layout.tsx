import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import ClientProviders from '@/components/ClientProviders'
import ResourcePreloader from '@/components/UI/ResourcePreloader'

export const metadata: Metadata = {
  title: 'MMORPG Web Game',
  description: 'Classic MMORPG experience with modern UI',
  // Disable caching for development
  other: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  }
}

// Separate viewport export (new Next.js 14 way)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Предотвращает зум на мобильных
  viewportFit: 'cover', // Для iPhone с вырезом
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Arcana" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="antialiased bg-dark-900 text-white min-h-screen" style={{
        backgroundColor: '#0a0a0f',
        color: '#ffffff',
        fontFamily: 'Poppins, system-ui, sans-serif'
      }}>
        <ClientProviders />
        <ResourcePreloader />
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgb(39 39 42 / 0.95)',
              color: '#f4f4f5',
              border: '1px solid rgb(82 82 91 / 0.5)',
              backdropFilter: 'blur(8px)',
              fontFamily: 'Poppins, system-ui, sans-serif',
              fontWeight: '500',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#f4f4f5',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f4f4f5',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
