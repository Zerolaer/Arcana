'use client'

import { useState, useCallback } from 'react'
import { Package, Search, ArrowUpDown, Trash2, Filter } from 'lucide-react'
import DraggableItem from '../../UI/DraggableItem'
import InventorySlot from '../../UI/InventorySlot'
import { GameItem } from '../../UI/ItemTooltip'

interface InventoryGridProps {
  inventory: (GameItem | null)[]
  onMoveItem: (fromIndex: number, toIndex: number) => Promise<boolean>
  onUseItem: (item: GameItem, index: number) => Promise<boolean>
  onDropItem: (item: GameItem, index: number) => Promise<boolean>
  isLoading?: boolean
  className?: string
}

type FilterType = 'all' | 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material'
type SortType = 'name' | 'rarity' | 'level' | 'value'

export default function InventoryGrid({ 
  inventory, 
  onMoveItem, 
  onUseItem, 
  onDropItem, 
  isLoading = false,
  className = '' 
}: InventoryGridProps) {
  const [draggedItem, setDraggedItem] = useState<GameItem | null>(null)
  const [draggedFromIndex, setDraggedFromIndex] = useState<number | undefined>()
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [sortType, setSortType] = useState<SortType>('name')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filterOptions: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'Все предметы', count: inventory.filter(item => item !== null).length },
    { value: 'weapon', label: 'Оружие', count: inventory.filter(item => item?.type === 'weapon').length },
    { value: 'armor', label: 'Броня', count: inventory.filter(item => item?.type === 'armor').length },
    { value: 'accessory', label: 'Аксессуары', count: inventory.filter(item => item?.type === 'accessory').length },
    { value: 'consumable', label: 'Расходники', count: inventory.filter(item => item?.type === 'consumable').length },
    { value: 'material', label: 'Материалы', count: inventory.filter(item => item?.type === 'material').length }
  ]

  const sortOptions: { value: SortType; label: string }[] = [
    { value: 'name', label: 'По имени' },
    { value: 'rarity', label: 'По редкости' },
    { value: 'level', label: 'По уровню' },
    { value: 'value', label: 'По ценности' }
  ]

  const getRarityOrder = (rarity: string) => {
    const order = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']
    return order.indexOf(rarity)
  }

  const filteredAndSortedInventory = useCallback(() => {
    let filtered = inventory.filter(item => {
      if (!item) return false
      
      const matchesFilter = activeFilter === 'all' || item.type === activeFilter
      const matchesSearch = searchTerm === '' || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesFilter && matchesSearch
    })

    // Sort the filtered items
    filtered.sort((a, b) => {
      if (!a || !b) return 0
      
      switch (sortType) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'rarity':
          return getRarityOrder(b.rarity) - getRarityOrder(a.rarity)
        case 'level':
          return (b.level || 0) - (a.level || 0)
        case 'value':
          return (b.value || 0) - (a.value || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [inventory, activeFilter, searchTerm, sortType])

  const handleDragStart = (item: GameItem, index: number) => {
    setDraggedItem(item)
    setDraggedFromIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDraggedFromIndex(undefined)
  }

  const handleDrop = async (targetIndex: number) => {
    if (!draggedItem || draggedFromIndex === undefined) return

    if (draggedFromIndex !== targetIndex) {
      await onMoveItem(draggedFromIndex, targetIndex)
    }

    handleDragEnd()
  }

  const handleItemUse = async (item: GameItem, index: number) => {
    await onUseItem(item, index)
  }

  const handleItemDrop = async (item: GameItem, index: number) => {
    await onDropItem(item, index)
  }

  const renderInventorySlot = (item: GameItem | null, index: number) => {
    const isDraggedOver = !!(draggedItem && draggedFromIndex !== index)
    const isEmpty = item === null

    return (
      <InventorySlot
        key={index}
        item={item}
        slotIndex={index}
        onDragStart={(item) => handleDragStart(item, index)}
        onDragEnd={handleDragEnd}
        onDrop={() => handleDrop(index)}
        onUse={(item) => handleItemUse(item, index)}
        onDropItem={(item) => handleItemDrop(item, index)}
        isDraggedOver={isDraggedOver}
        isEmpty={isEmpty}
        className="transition-all duration-200 hover:scale-105"
      />
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Инвентарь</h3>
          <span className="text-sm text-gray-400">
            ({inventory.filter(item => item !== null).length}/48)
          </span>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-1 px-3 py-1 bg-dark-200/50 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-dark-200/70 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Фильтры</span>
        </button>
      </div>

      {/* Filters and Search */}
      {showFilters && (
        <div className="space-y-4 p-4 bg-dark-200/30 rounded-lg">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск предметов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-300 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeFilter === option.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-300 text-gray-300 hover:bg-dark-400'
                }`}
              >
                <span>{option.label}</span>
                <span className="text-xs opacity-75">({option.count})</span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">Сортировка:</span>
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
              className="px-3 py-1 bg-dark-300 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Inventory Grid */}
      <div className="grid grid-cols-8 gap-2 p-4 bg-dark-200/30 rounded-lg">
        {Array.from({ length: 48 }, (_, index) => {
          const item = inventory[index] || null
          return renderInventorySlot(item, index)
        })}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-dark-100/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2 text-white">
            <div className="loading-spinner" />
            <span>Обновление инвентаря...</span>
          </div>
        </div>
      )}
    </div>
  )
}