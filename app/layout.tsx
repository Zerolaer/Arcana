import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'MMORPG Web Game',
  description: 'Classic MMORPG experience with modern UI',
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
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cinzel+Decorative:wght@400;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased">
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
              fontFamily: 'Cinzel, serif',
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
