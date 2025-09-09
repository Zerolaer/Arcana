'use client'

import { useState, useEffect, useCallback } from 'react'
import { Character } from '@/types/game'
import { supabase } from '@/lib/supabase'
import { Package, Search, Sort, Trash2 } from 'lucide-react'
import DraggableItem from '../../UI/DraggableItem'
import InventorySlot from '../../UI/InventorySlot'
import { GameItem } from '../../UI/ItemTooltip'
import { toast } from 'react-hot-toast'

interface DatabaseInventoryPanelProps {
  character: Character
  onUpdateCharacter: (character: Partial<Character>) => Promise<void>
  isLoading: boolean
}

type FilterType = 'all' | 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material'

interface InventorySlot {
  slotPosition: number
  stackSize?: number
  currentDurability?: number
  upgradeLevel?: number
  obtainedAt?: string
  item?: GameItem
}

export default function DatabaseInventoryPanel({ character, onUpdateCharacter, isLoading }: DatabaseInventoryPanelProps) {
  const [inventory, setInventory] = useState<(GameItem | null)[]>(new Array(48).fill(null))
  const [loading, setLoading] = useState(true)
  const [draggedItem, setDraggedItem] = useState<GameItem | null>(null)
  const [draggedFromIndex, setDraggedFromIndex] = useState<number | undefined>()
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Загрузка инвентаря из базы данных
  const loadInventory = useCallback(async () => {
    try {
      setLoading(true)
      
      const { data, error } = await (supabase as any)
        .rpc('get_character_inventory', { p_character_id: character.id })

      if (error) {
        console.error('Error loading inventory:', error)
        toast.error('Ошибка загрузки инвентаря')
        return
      }

      // Создаем массив из 48 слотов
      const inventorySlots = new Array(48).fill(null)
      
      // Заполняем слоты данными из базы
      if (data && Array.isArray(data)) {
        data.forEach((inventoryItem: any) => {
          if (inventoryItem.slot_position >= 0 && inventoryItem.slot_position < 48) {
            const gameItem: GameItem = {
              id: inventoryItem.item.id,
              name: inventoryItem.item.name,
              description: inventoryItem.item.description,
              rarity: inventoryItem.item.rarity,
              type: inventoryItem.item.type,
              subType: inventoryItem.item.subType,
              icon: inventoryItem.item.icon,
              level: inventoryItem.item.level,
              stats: inventoryItem.item.stats,
              value: inventoryItem.item.value,
              stackable: inventoryItem.item.stackable,
              stackSize: inventoryItem.stack_size,
              durability: inventoryItem.item.durability,
              setBonus: inventoryItem.item.setBonus,
              requirements: inventoryItem.item.requirements
            }
            inventorySlots[inventoryItem.slot_position] = gameItem
          }
        })
      }

      setInventory(inventorySlots)
    } catch (error) {
      console.error('Error loading inventory:', error)
      toast.error('Ошибка загрузки инвентаря')
    } finally {
      setLoading(false)
    }
  }, [character.id])

  // Загружаем инвентарь при монтировании компонента
  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  // Перемещение предметов в инвентаре
  const handleDrop = useCallback(async (item: GameItem, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    try {
      const { data, error } = await (supabase as any)
        .rpc('move_inventory_item', {
          p_character_id: character.id,
          p_from_slot: fromIndex,
          p_to_slot: toIndex
        })

      if (error) {
        console.error('Error moving item:', error)
        toast.error('Ошибка перемещения предмета')
        return
      }

      if (data?.success) {
        // Обновляем локальное состояние
        setInventory(prev => {
          const newInventory = [...prev]
          const targetItem = newInventory[toIndex]

          if (data.action === 'stacked') {
            // Предметы были объединены в стопку
            newInventory[fromIndex] = null
            // toIndex остается с обновленной стопкой (это будет обновлено при следующей загрузке)
            toast.success(`Предметы объединены в стопку`)
          } else if (data.action === 'swapped') {
            // Предметы поменялись местами
            newInventory[fromIndex] = targetItem
            newInventory[toIndex] = item
            toast.success(`Предметы поменялись местами`)
          } else if (data.action === 'moved') {
            // Предмет просто перемещен
            newInventory[fromIndex] = null
            newInventory[toIndex] = item
            toast.success(`Предмет перемещен`)
          }

          return newInventory
        })

        // Перезагружаем инвентарь для синхронизации
        setTimeout(loadInventory, 100)
      } else {
        toast.error(data?.error || 'Ошибка перемещения предмета')
      }
    } catch (error) {
      console.error('Error moving item:', error)
      toast.error('Ошибка перемещения предмета')
    }

    handleDragEnd()
  }, [character.id, loadInventory])

  const handleDragStart = useCallback((item: GameItem, slotIndex: number) => {
    setDraggedItem(item)
    setDraggedFromIndex(slotIndex)
  }, [])

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null)
    setDraggedFromIndex(undefined)
  }, [])

  const handleSlotClick = useCallback((slotIndex: number) => {
    // Можно добавить логику для использования предметов по клику
    const item = inventory[slotIndex]
    if (item && item.type === 'consumable') {
      // Логика использования расходника
      console.log('Using consumable:', item.name)
    }
  }, [inventory])

  // Автосортировка инвентаря
  const handleSortInventory = async () => {
    try {
      const { data, error } = await (supabase as any)
        .rpc('sort_inventory', { p_character_id: character.id })

      if (error) {
        console.error('Error sorting inventory:', error)
        toast.error('Ошибка сортировки')
        return
      }

      if (data?.success) {
        toast.success(`Инвентарь отсортирован (${data.items_count} предметов)`)
        await loadInventory()
      } else {
        toast.error(data?.error || 'Ошибка сортировки')
      }
    } catch (error) {
      console.error('Error sorting inventory:', error)
      toast.error('Ошибка сортировки')
    }
  }

  // Удаление предмета (для тестирования)
  const handleDeleteItem = async (slotIndex: number) => {
    try {
      const { data, error } = await (supabase as any)
        .rpc('remove_item_from_inventory', {
          p_character_id: character.id,
          p_slot_position: slotIndex,
          p_quantity: 1
        })

      if (error) {
        console.error('Error removing item:', error)
        toast.error('Ошибка удаления предмета')
        return
      }

      if (data?.success) {
        toast.success(`Предмет удален`)
        await loadInventory()
      } else {
        toast.error(data?.error || 'Ошибка удаления предмета')
      }
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Ошибка удаления предмета')
    }
  }

  // Фильтрация инвентаря
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

  if (loading) {
    return (
      <div className="game-content h-full flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="loading-spinner" />
          <span className="text-white">Загрузка инвентаря...</span>
        </div>
      </div>
    )
  }

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
            disabled={loading || isLoading}
            className="game-button game-button--compact game-button--secondary flex items-center space-x-1"
          >
            <Sort className="w-4 h-4" />
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
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-xs text-white opacity-0 hover:opacity-100 transition-opacity"
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
            Drag & Drop для перестановки • Данные из Supabase
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setSearchTerm('')}
              className="game-button game-button--secondary game-button--compact"
            >
              Очистить поиск
            </button>
            <button 
              onClick={() => setActiveFilter('all')}
              className="game-button game-button--warning game-button--compact"
            >
              Сбросить фильтр
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {(isLoading || loading) && (
        <div className="absolute inset-0 bg-dark-100/50 backdrop-blur-sm flex items-center justify-center">
          <div className="loading-spinner" />
        </div>
      )}
    </div>
  )
}
