'use client'

import { useState, useRef } from 'react'
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
  showActions = false
}: DraggableItemProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const dragStartPos = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if it's a right click or if we're clicking on a button
    if (e.button !== 0 || (e.target as HTMLElement).closest('button')) {
      return
    }
    
    e.preventDefault()
    setIsDragging(true)
    dragStartPos.current = { x: e.clientX, y: e.clientY }
    
    if (onDragStart) {
      onDragStart(item, slotIndex)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const deltaX = e.clientX - dragStartPos.current.x
        const deltaY = e.clientY - dragStartPos.current.y
        
        dragRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.1) rotate(5deg)`
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      if (dragRef.current) {
        dragRef.current.style.transform = ''
      }
      if (onDragEnd) {
        onDragEnd()
      }
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

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
    >
      <div
        ref={dragRef}
        className={`
          draggable-item 
          inventory-slot occupied 
          ${getRarityBorderColor()} 
          ${getRarityGlow()}
          ${isDragging ? 'dragging' : ''}
          ${className}
        `}
        onMouseDown={handleMouseDown}
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

        {/* Durability Indicator */}
        {item.durability && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b">
            <div 
              className={`h-full rounded-b transition-all duration-300 ${
                (item.durability.current / item.durability.max) > 0.5 ? 'bg-green-400' :
                (item.durability.current / item.durability.max) > 0.25 ? 'bg-yellow-400' : 'bg-red-400'
              }`}
              style={{ 
                width: `${(item.durability.current / item.durability.max) * 100}%` 
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
