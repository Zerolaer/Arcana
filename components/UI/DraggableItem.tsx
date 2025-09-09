'use client'

import { useState, useRef, useEffect } from 'react'
import ItemTooltip, { GameItem } from './ItemTooltip'

interface DraggableItemProps {
  item: GameItem
  slotIndex: number
  onDragStart?: (item: GameItem, slotIndex: number) => void
  onDragEnd?: () => void
  className?: string
  showStackCount?: boolean
  onUse?: () => void
  onEquip?: () => void
  onUnequip?: () => void
  showActions?: boolean
  isEquipped?: boolean
}

export default function DraggableItem({ 
  item, 
  slotIndex, 
  onDragStart, 
  onDragEnd,
  className = '',
  showStackCount = true,
  onUse,
  onEquip,
  onUnequip,
  showActions = false,
  isEquipped = false
}: DraggableItemProps) {
  
  // Debug logging
  console.log('🔍 DraggableItem rendered:', {
    itemName: item.name,
    isEquipped,
    itemIsEquipped: item.isEquipped,
    'isEquipped === true': isEquipped === true,
    'item.isEquipped === true': item.isEquipped === true
  })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const dragStartPos = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    console.log('🚨 DraggableItem handleMouseDown CALLED!', { item: item.name, button: e.button })
    
    // ВРЕМЕННО ОТКЛЮЧАЕМ ДРАГ & ДРОП
    console.log('🚨 MouseDown - drag & drop DISABLED for now')
    return
    
    // Don't start drag if it's a right click or if we're clicking on a button
    if (e.button !== 0 || (e.target as HTMLElement).closest('button')) {
      console.log('🚨 MouseDown ignored - right click or button')
      return
    }
    
    console.log('🚨 MouseDown - NOT starting drag immediately')
    // Don't start drag immediately - let click work first
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    
    // Add global listeners to detect if it's a drag or click
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleClick = (e: React.MouseEvent) => {
    console.log('🚨 DraggableItem handleClick CALLED!', { item: item.name, type: item.type })
    
    // Don't handle click if we're clicking on a button (let the button handle it)
    if ((e.target as HTMLElement).closest('button')) {
      console.log('🚨 Click on button, ignoring')
      return
    }
    
    console.log('🖱️ DraggableItem clicked - opening tooltip')
    
    // Просто логируем - Tooltip сам обработает клик
  }

  const handleMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - dragStartPos.current.x
    const deltaY = e.clientY - dragStartPos.current.y
    
    // Only start dragging if mouse moved more than 5 pixels
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      console.log('🚨 MouseMove - starting drag!')
      setIsDragging(true)
      
      if (dragRef.current) {
        dragRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`
        dragRef.current.style.opacity = '0.8'
      }
      
      if (onDragStart) {
        onDragStart(item, slotIndex)
      }
    }
  }

  const handleMouseUp = (e: MouseEvent) => {
    console.log('🚨 MouseUp - cleaning up listeners')
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    
    if (isDragging) {
      console.log('🚨 MouseUp - ending drag')
      setIsDragging(false)
      
      if (dragRef.current) {
        dragRef.current.style.transform = ''
        dragRef.current.style.opacity = ''
      }
      
      if (onDragEnd) {
        onDragEnd()
      }
    } else {
      console.log('🚨 MouseUp - it was a click, calling handleClick')
      // It was a click, not a drag - call handleClick
      handleClick(e as any)
    }
  }

  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const getRarityBorderColor = () => {
    const rarityColors = {
      common: 'border-gray-500/50',
      uncommon: 'border-green-500/50',
      rare: 'border-blue-500/50',
      epic: 'border-purple-500/50',
      legendary: 'border-yellow-500/50',
      mythic: 'border-red-500/50'
    }
    return rarityColors[item.rarity] || 'border-gray-500/50'
  }

  const getRarityGlow = () => {
    if (isDragging) return ''
    
    const rarityGlows = {
      common: '',
      uncommon: 'shadow-green-500/20',
      rare: 'shadow-blue-500/20', 
      epic: 'shadow-purple-500/20',
      legendary: 'shadow-yellow-500/30',
      mythic: 'shadow-red-500/30'
    }
    return rarityGlows[item.rarity] || ''
  }

  return (
    <ItemTooltip 
      item={item}
      onUse={onUse}
      onEquip={onEquip}
      onUnequip={onUnequip}
      showActions={showActions}
      isEquipped={isEquipped}
    >
      <div
        ref={dragRef}
        className={`
          draggable-item 
          inventory-slot occupied 
          ${getRarityBorderColor()} 
          ${getRarityGlow()}
          ${isDragging ? 'dragging' : ''}
          ${isEquipped ? 'ring-2 ring-blue-500 ring-opacity-75' : ''}
          ${className}
        `}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        style={{
          borderWidth: '2px',
          borderStyle: 'solid',
        }}
      >
        <div className="item-icon">
          {item.icon}
        </div>
        
        {/* Stack Count */}
        {showStackCount && item.stackable && item.stackSize && item.stackSize > 1 && (
          <div className="item-stack-count">
            {item.stackSize}
          </div>
        )}

        {/* Equipped Indicator */}
        {isEquipped && (
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
            E
          </div>
        )}

        {/* Durability Indicator */}
        {item.durability && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                (item.durability.current / item.durability.max) > 0.5 ? 'bg-green-400' :
                (item.durability.current / item.durability.max) > 0.25 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{
                width: `${Math.min((item.durability.current / item.durability.max) * 100, 100)}%`
              }}
            />
          </div>
        )}

        {/* Rarity Glow Effect */}
        {item.rarity !== 'common' && !isDragging && (
          <div
            className={`absolute inset-0 rounded-lg pointer-events-none ${getRarityGlow()}`}
            style={{
              boxShadow: `inset 0 0 20px ${
                item.rarity === 'uncommon' ? 'rgba(16, 185, 129, 0.1)' :
                item.rarity === 'rare' ? 'rgba(59, 130, 246, 0.1)' :
                item.rarity === 'epic' ? 'rgba(139, 92, 246, 0.1)' :
                item.rarity === 'legendary' ? 'rgba(245, 158, 11, 0.15)' :
                item.rarity === 'mythic' ? 'rgba(239, 68, 68, 0.15)' : 'transparent'
              }`
            }}
          />
        )}
      </div>
    </ItemTooltip>
  )
}