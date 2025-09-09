import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'MMORPG Web Game',
  description: 'Classic MMORPG experience with modern UI',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
              fontFamily: 'Orbitron, monospace',
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
