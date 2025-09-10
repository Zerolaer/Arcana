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
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, transform: 'translateX(-50%)' })
  const timeoutRef = useRef<NodeJS.Timeout>()
  const triggerRef = useRef<HTMLDivElement>(null)

  // Use controlled state if provided, otherwise use internal state
  const isVisible = controlledIsOpen !== undefined ? controlledIsOpen : internalIsVisible
  const setIsVisible = onOpenChange || setInternalIsVisible

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return

    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    
    // Примерные размеры тултипа (можем настроить)
    const tooltipWidth = 320 // примерная ширина тултипа
    const tooltipHeight = 200 // примерная высота тултипа
    const margin = 10 // отступ от краев экрана

    let x = rect.left + scrollX + rect.width / 2
    let y = rect.top + scrollY
    let transformX = '-50%' // центрируем по X
    let transformY = '0%'

    // Определяем оптимальную позицию
    if (position === 'auto' || position === 'top') {
      // Пробуем разместить сверху
      if (rect.top > tooltipHeight + margin) {
        y = rect.top + scrollY - margin
        transformY = '-100%' // размещаем сверху
      } else {
        // Размещаем снизу
        y = rect.bottom + scrollY + margin
        transformY = '0%'
      }
    }

    // Проверяем горизонтальные границы
    const tooltipLeft = x - tooltipWidth / 2
    const tooltipRight = x + tooltipWidth / 2

    if (tooltipLeft < margin) {
      // Слишком близко к левому краю
      x = margin + tooltipWidth / 2
      transformX = '-50%'
    } else if (tooltipRight > viewportWidth - margin) {
      // Слишком близко к правому краю
      x = viewportWidth - margin - tooltipWidth / 2
      transformX = '-50%'
    }

    // Дополнительная проверка для очень узких экранов
    if (tooltipWidth > viewportWidth - 2 * margin) {
      x = viewportWidth / 2
      transformX = '-50%'
    }

    // Проверяем вертикальные границы
    if (position === 'auto') {
      const tooltipTop = transformY === '-100%' ? y - tooltipHeight : y
      const tooltipBottom = transformY === '-100%' ? y : y + tooltipHeight

      if (tooltipTop < margin) {
        // Тултип выходит за верхний край, размещаем снизу
        y = rect.bottom + scrollY + margin
        transformY = '0%'
      } else if (tooltipBottom > viewportHeight - margin) {
        // Тултип выходит за нижний край, размещаем сверху
        y = rect.top + scrollY - margin
        transformY = '-100%'
      }
    }

    setTooltipPosition({ 
      x, 
      y, 
      transform: `translateX(${transformX}) translateY(${transformY})` 
    })
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

  // Пересчитываем позицию при изменении размера окна или скролле
  useEffect(() => {
    if (!isVisible) return

    const handleResize = () => {
      if (isVisible) {
        updatePosition()
      }
    }

    const handleScroll = () => {
      if (isVisible) {
        updatePosition()
      }
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, true) // capture phase для всех скроллов

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isVisible])

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
          transform: tooltipPosition.transform,
          zIndex: 9999,
          pointerEvents: trigger === 'click' ? 'auto' : 'none',
          maxWidth: '320px',
          width: 'max-content'
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
