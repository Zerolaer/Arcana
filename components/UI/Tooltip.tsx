'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  children: ReactNode
  content: ReactNode
  delay?: number
  className?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  trigger?: 'hover' | 'click'
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

export default function Tooltip({ 
  children, 
  content, 
  delay = 300,
  className = '',
  position = 'auto',
  trigger = 'hover',
  isOpen: controlledIsOpen,
  onOpenChange
}: TooltipProps) {
  const [internalIsVisible, setInternalIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const timeoutRef = useRef<NodeJS.Timeout>()
  const triggerRef = useRef<HTMLDivElement>(null)

  // Use controlled state if provided, otherwise use internal state
  const isVisible = controlledIsOpen !== undefined ? controlledIsOpen : internalIsVisible
  const setIsVisible = onOpenChange || setInternalIsVisible

  const updatePosition = () => {
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
    }
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (trigger !== 'hover') return
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      updatePosition()
      setIsVisible(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (trigger !== 'hover') return
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const handleClick = (e: React.MouseEvent) => {
    console.log('🚨 Tooltip handleClick CALLED!', { trigger, isVisible })
    
    if (trigger !== 'click') {
      console.log('🚨 Tooltip - not click trigger, ignoring')
      return
    }
    
    console.log('🚨 Tooltip - toggling visibility from', isVisible, 'to', !isVisible)
    e.stopPropagation()
    updatePosition()
    setIsVisible(!isVisible)
  }

  // Close tooltip when clicking outside
  useEffect(() => {
    if (trigger === 'click' && isVisible) {
      const handleClickOutside = (e: MouseEvent) => {
        if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
          setIsVisible(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [trigger, isVisible, setIsVisible])

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
          pointerEvents: trigger === 'click' ? 'auto' : 'none'
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
        onClick={handleClick}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      {tooltipContent}
    </>
  )
}
