'use client'

import { useState } from 'react'
import { GameItem } from './ItemTooltip'

interface InventorySlotProps {
  slotIndex: number
  item?: GameItem | null
  onDrop?: (item: GameItem, fromIndex: number, toIndex: number) => void
  onSlotClick?: (slotIndex: number) => void
  className?: string
  draggedItem?: GameItem | null
  draggedFromIndex?: number
}

export default function InventorySlot({ 
  slotIndex, 
  item, 
  onDrop, 
  onSlotClick,
  className = '',
  draggedItem,
  draggedFromIndex
}: InventorySlotProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleMouseEnter = () => {
    if (draggedItem && draggedFromIndex !== undefined) {
      setIsDragOver(true)
    }
  }

  const handleMouseLeave = () => {
    setIsDragOver(false)
  }

  const handleMouseUp = () => {
    if (isDragOver && draggedItem && draggedFromIndex !== undefined && onDrop) {
      onDrop(draggedItem, draggedFromIndex, slotIndex)
    }
    setIsDragOver(false)
  }

  const handleClick = () => {
    if (onSlotClick) {
      onSlotClick(slotIndex)
    }
  }

  const canAcceptItem = () => {
    if (!draggedItem) return true
    if (!item) return true // Empty slot can accept any item
    
    // Check if items can stack
    if (item.id === draggedItem.id && item.stackable && draggedItem.stackable) {
      const currentStack = item.stackSize || 1
      const maxStack = 99 // Default max stack size
      return currentStack < maxStack
    }
    
    return false // Can't drop on occupied slot with different item
  }

  return (
    <div
      className={`
        inventory-slot 
        drop-zone
        ${item ? 'occupied' : 'empty'}
        ${isDragOver && canAcceptItem() ? 'drag-over' : ''}
        ${!canAcceptItem() && isDragOver ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      {!item && (
        <div className="text-gray-600 text-2xl opacity-50">
          +
        </div>
      )}
      
      {/* Visual feedback for valid drop zone */}
      {isDragOver && canAcceptItem() && (
        <div className="absolute inset-0 border-2 border-blue-400 bg-blue-400/10 rounded-lg animate-pulse" />
      )}
      
      {/* Visual feedback for invalid drop zone */}
      {isDragOver && !canAcceptItem() && (
        <div className="absolute inset-0 border-2 border-red-400 bg-red-400/10 rounded-lg">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-red-400 text-2xl">✕</span>
          </div>
        </div>
      )}
      
      {/* Slot number indicator (for debugging, can be removed) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-0 left-0 text-xs text-gray-500 bg-black/50 px-1 rounded">
          {slotIndex}
        </div>
      )}
    </div>
  )
}
