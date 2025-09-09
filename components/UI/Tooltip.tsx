'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  children: ReactNode
  content: ReactNode
  delay?: number
  className?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
}

export default function Tooltip({ 
  children, 
  content, 
  delay = 300,
  className = '',
  position = 'auto'
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const timeoutRef = useRef<NodeJS.Timeout>()
  const triggerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (rect) {
        let x = rect.left + rect.width / 2
        let y = rect.top - 10

        // Auto positioning based on viewport
        if (position === 'auto') {
          const viewportHeight = window.innerHeight
          const viewportWidth = window.innerWidth
          
          // If too close to top, show below
          if (y < 200) {
            y = rect.bottom + 10
          }
          
          // If too close to right edge, adjust left
          if (x > viewportWidth - 200) {
            x = viewportWidth - 200
          }
          
          // If too close to left edge, adjust right
          if (x < 200) {
            x = 200
          }
        }

        setTooltipPosition({ x, y })
        setIsVisible(true)
      }
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const tooltipContent = isVisible && typeof window !== 'undefined' ? (
    createPortal(
      <div
        className={`tooltip-portal ${className}`}
        style={{
          position: 'fixed',
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          transform: 'translateX(-50%)',
          zIndex: 9999,
          pointerEvents: 'none'
        }}
      >
        <div className="tooltip-content animate-tooltip-show">
          {content}
        </div>
      </div>,
      document.body
    )
  ) : null

  return (
    <>
      <div
        ref={triggerRef}
        className="tooltip-trigger"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      {tooltipContent}
    </>
  )
}
