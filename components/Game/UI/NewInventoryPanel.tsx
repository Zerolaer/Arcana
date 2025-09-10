'use client'

import { useState, useCallback } from 'react'
import { Character } from '@/types/game'
import { Package, Search, ArrowUpDown, Trash2, Filter } from 'lucide-react'
import DraggableItem from '../../UI/DraggableItem'
import InventorySlot from '../../UI/InventorySlot'
import { GameItem } from '../../UI/ItemTooltip'

interface InventoryPanelProps {
  character: Character
  onUpdateCharacter: (character: Partial<Character>) => Promise<boolean>
  isLoading: boolean
}

// Sample items data - в реальной игре это будет приходить из базы данных
const sampleItems: GameItem[] = [
  {
    id: 'iron_sword_1',
    name: 'Железный меч',
    description: 'Надежный клинок из закаленной стали. Излюбленное оружие начинающих воинов.',
    rarity: 'common',
    type: 'weapon',
    subType: 'Одноручный меч',
    icon: '⚔️',
    level: 5,
    stats: {
      damage: 45,
      critChance: 5
    },
    value: 150,
    quality: 85
  },
  {
    id: 'magic_potion_1',
    name: 'Зелье маны',
    description: 'Светящаяся синяя жидкость восстанавливает магическую энергию.',
    rarity: 'uncommon',
    type: 'consumable',
    icon: '🧪',
    level: 1,
    stats: {
      mana: 50
    },
    value: 25,
    stackable: true,
    stackSize: 5
  },
  {
    id: 'dragon_scale_armor_1',
    name: 'Доспех из чешуи дракона',
    description: 'Легендарный доспех, выкованный из чешуи древнего красного дракона. Дарует защиту от огня.',
    rarity: 'legendary',
    type: 'armor',
    subType: 'Тяжелый доспех',
    icon: '🛡️',
    level: 25,
    stats: {
      defense: 120,
      health: 200,
      critDamage: 15
    },
    value: 5000,
    setBonus: 'Комплект Драконьей стражи: +25% сопротивление огню',
    quality: 98
  },
  {
    id: 'mystic_ring_1',
    name: 'Кольцо мистика',
    description: 'Таинственное кольцо пульсирует магической энергией.',
    rarity: 'epic',
    type: 'accessory',
    subType: 'Кольцо',
    icon: '💍',
    level: 15,
    stats: {
      mana: 100,
      critChance: 12,
      speed: 8
    },
    value: 800
  },
  {
    id: 'phoenix_feather_1',
    name: 'Перо феникса',
    description: 'Редкий материал для крафтинга, пылающий вечным огнем.',
    rarity: 'mythic',
    type: 'material',
    icon: '🪶',
    level: 30,
    stats: {},
    value: 10000,
    stackable: true,
    stackSize: 1
  },
  {
    id: 'healing_potion_1',
    name: 'Большое зелье лечения',
    description: 'Мощное зелье исцеления с приятным мятным вкусом.',
    rarity: 'rare',
    type: 'consumable',
    icon: '🍶',
    level: 10,
    stats: {
      health: 150
    },
    value: 75,
    stackable: true,
    stackSize: 3
  }
]

type FilterType = 'all' | 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material'

export default function NewInventoryPanel({ character, onUpdateCharacter, isLoading }: InventoryPanelProps) {
  const [inventory, setInventory] = useState<(GameItem | null)[]>(() => {
    // Initialize with sample items and empty slots (6x8 = 48 slots total)
    const slots = new Array(48).fill(null)
    sampleItems.forEach((item, index) => {
      if (index < slots.length) {
        slots[index] = item
      }
    })
    return slots
  })

  const [draggedItem, setDraggedItem] = useState<GameItem | null>(null)
  const [draggedFromIndex, setDraggedFromIndex] = useState<number | undefined>()
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const handleDragStart = useCallback((item: GameItem, slotIndex: number) => {
    setDraggedItem(item)
    setDraggedFromIndex(slotIndex)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null)
    setDraggedFromIndex(undefined)
  }, [])

  const handleDrop = useCallback((item: GameItem, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    setInventory(prev => {
      const newInventory = [...prev]
      const targetItem = newInventory[toIndex]

      // If target slot has same stackable item, try to stack
      if (targetItem && targetItem.id === item.id && item.stackable && targetItem.stackable) {
        const totalStack = (targetItem.stackSize || 1) + (item.stackSize || 1)
        const maxStack = 99 // Default max stack

        if (totalStack <= maxStack) {
          // Stack items
          newInventory[toIndex] = {
            ...targetItem,
            stackSize: totalStack
          }
          newInventory[fromIndex] = null
        }
        return newInventory
      }

      // Swap items
      newInventory[fromIndex] = targetItem
      newInventory[toIndex] = item
      
      return newInventory
    })

    handleDragEnd()
  }, [handleDragEnd])

  const handleSlotClick = useCallback((slotIndex: number) => {
    // Handle right-click actions, item usage, etc.
    console.log('Slot clicked:', slotIndex)
  }, [])

  const handleDeleteItem = (slotIndex: number) => {
    setInventory(prev => {
      const newInventory = [...prev]
      newInventory[slotIndex] = null
      return newInventory
    })
  }

  const handleSortInventory = () => {
    setInventory(prev => {
      const items = prev.filter(item => item !== null) as GameItem[]
      
      // Sort by rarity, then by level, then by name
      const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']
      items.sort((a, b) => {
        const rarityDiff = rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity)
        if (rarityDiff !== 0) return rarityDiff
        
        const levelDiff = b.level - a.level
        if (levelDiff !== 0) return levelDiff
        
        return a.name.localeCompare(b.name)
      })

      const newInventory = new Array(48).fill(null)
      items.forEach((item, index) => {
        newInventory[index] = item
      })
      
      return newInventory
    })
  }

  const filteredInventory = inventory.map((item, index) => {
    if (!item) return { item: null, index }
    
    // Apply filter
    if (activeFilter !== 'all' && item.type !== activeFilter) {
      return { item: null, index }
    }
    
    // Apply search
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return { item: null, index }
    }
    
    return { item, index }
  })

  const itemCount = inventory.filter(item => item !== null).length
  const totalValue = inventory.reduce((sum, item) => sum + (item?.value || 0), 0)

  return (
    <div className="game-content h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Package className="w-6 h-6 text-primary-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Инвентарь</h2>
            <div className="text-sm text-gray-400">
              {itemCount}/48 предметов • Ценность: {totalValue.toLocaleString()}🪙
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSortInventory}
            className="game-button game-button--compact game-button--secondary flex items-center space-x-1"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>Сортировка</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск предметов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="game-input pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 overflow-x-auto pb-1">
          {[
            { key: 'all', label: 'Все', icon: '📦' },
            { key: 'weapon', label: 'Оружие', icon: '⚔️' },
            { key: 'armor', label: 'Броня', icon: '🛡️' },
            { key: 'accessory', label: 'Аксессуары', icon: '💍' },
            { key: 'consumable', label: 'Расходники', icon: '🧪' },
            { key: 'material', label: 'Материалы', icon: '🔮' }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as FilterType)}
              className={`game-button game-button--compact ${
                activeFilter === filter.key ? 'game-button--gold' : 'game-button--secondary'
              } flex items-center space-x-1 whitespace-nowrap`}
            >
              <span>{filter.icon}</span>
              <span className="text-xs">{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 gap-2 p-2">
          {filteredInventory.map(({ item, index }) => (
            <div key={index} className="relative">
              {item ? (
                <DraggableItem
                  item={item}
                  slotIndex={index}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ) : (
                <InventorySlot
                  slotIndex={index}
                  item={null}
                  onDrop={handleDrop}
                  onSlotClick={handleSlotClick}
                  draggedItem={draggedItem}
                  draggedFromIndex={draggedFromIndex}
                />
              )}
              
              {/* Quick delete button (only for items, only in dev mode) */}
              {item && process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => handleDeleteItem(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-xs text-white opacity-0"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-white/10 pt-4 mt-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Drag & Drop для перестановки предметов
          </div>
          <div className="flex space-x-2">
            <button className="game-button game-button--secondary game-button--compact">
              Продать все серые
            </button>
            <button className="game-button game-button--warning game-button--compact">
              Очистить фильтр
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-dark-100/50 backdrop-blur-sm flex items-center justify-center">
          <div className="loading-spinner" />
        </div>
      )}
    </div>
  )
}
