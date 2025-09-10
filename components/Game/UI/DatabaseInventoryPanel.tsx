'use client'

import { useState, useEffect, useCallback } from 'react'
import { Character } from '@/types/game'
import { supabase } from '@/lib/supabase'
import { Package, Search, ArrowUpDown, Trash2 } from 'lucide-react'
import DraggableItem from '../../UI/DraggableItem'
import InventorySlot from '../../UI/InventorySlot'
import { GameItem } from '../../UI/ItemTooltip'
import { toast } from 'react-hot-toast'

interface DatabaseInventoryPanelProps {
  character: Character
  onUpdateCharacter: (character: Partial<Character>) => Promise<boolean>
  isLoading: boolean
}

type FilterType = 'all' | 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material'

interface InventorySlot {
  slotPosition: number
  stackSize?: number
  quality?: number
  upgradeLevel?: number
  obtainedAt?: string
  item?: GameItem
}

export default function DatabaseInventoryPanel({ character, onUpdateCharacter, isLoading }: DatabaseInventoryPanelProps) {
  const [inventory, setInventory] = useState<(GameItem | null)[]>(new Array(100).fill(null))
  const [loading, setLoading] = useState(true)
  const [draggedItem, setDraggedItem] = useState<GameItem | null>(null)
  const [draggedFromIndex, setDraggedFromIndex] = useState<number | undefined>()
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [openTooltips, setOpenTooltips] = useState<Set<number>>(new Set())

  // Функции для управления тултипами
  const closeTooltip = useCallback((slotIndex: number) => {
    setOpenTooltips(prev => {
      const newSet = new Set(prev)
      newSet.delete(slotIndex)
      return newSet
    })
  }, [])

  // Загрузка инвентаря из базы данных
  const loadInventory = useCallback(async () => {
    try {
      setLoading(true)
      
      // Загружаем инвентарь и экипировку параллельно
      const [inventoryResponse, equipmentResponse] = await Promise.all([
        (supabase as any).rpc('get_character_inventory', { p_character_id: character.id }),
        (supabase as any).rpc('get_character_equipment', { p_character_id: character.id })
      ])

      if (inventoryResponse.error) {
        console.error('Error loading inventory:', inventoryResponse.error)
        toast.error('Ошибка загрузки инвентаря')
        return
      }

      // Получаем список экипированных предметов
      const equippedItems = new Set()
      if (equipmentResponse.data && Array.isArray(equipmentResponse.data)) {
        equipmentResponse.data.forEach((equippedItem: any) => {
          if (equippedItem.item && equippedItem.item.id) {
            equippedItems.add(equippedItem.item.id)
          }
        })
      }

      console.log('Equipped items IDs:', Array.from(equippedItems))

      // Создаем массив из 100 слотов (новая система)
      const inventorySlots = new Array(100).fill(null)
      
      // Заполняем слоты данными из базы
      if (inventoryResponse.data && Array.isArray(inventoryResponse.data)) {
        inventoryResponse.data.forEach((inventoryItem: any) => {
          if (inventoryItem.slot_position >= 1 && inventoryItem.slot_position <= 100) {
            const isEquipped = equippedItems.has(inventoryItem.item.id)
            
            // Определяем тип предмета по equipment_slot
            let itemType: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material' = 'material'
            if (inventoryItem.item.equipment_slot) {
              if (inventoryItem.item.equipment_slot.includes('weapon') || inventoryItem.item.equipment_slot.includes('sword') || inventoryItem.item.equipment_slot.includes('bow') || inventoryItem.item.equipment_slot.includes('staff')) {
                itemType = 'weapon'
              } else if (inventoryItem.item.equipment_slot.includes('armor') || inventoryItem.item.equipment_slot.includes('helmet') || inventoryItem.item.equipment_slot.includes('boots') || inventoryItem.item.equipment_slot.includes('chest') || inventoryItem.item.equipment_slot.includes('legs')) {
                itemType = 'armor'
              } else if (inventoryItem.item.equipment_slot.includes('ring') || inventoryItem.item.equipment_slot.includes('amulet') || inventoryItem.item.equipment_slot.includes('necklace')) {
                itemType = 'accessory'
              }
            } else {
              // Если нет equipment_slot, определяем по названию
              if (inventoryItem.item.name.toLowerCase().includes('potion') || inventoryItem.item.name.toLowerCase().includes('зелье')) {
                itemType = 'consumable'
              } else if (inventoryItem.item.name.toLowerCase().includes('ore') || inventoryItem.item.name.toLowerCase().includes('cloth') || inventoryItem.item.name.toLowerCase().includes('руда') || inventoryItem.item.name.toLowerCase().includes('ткань')) {
                itemType = 'material'
              }
            }

            const gameItem: GameItem = {
              id: inventoryItem.item.id, // VARCHAR из items_new
              name: inventoryItem.item.name,
              description: inventoryItem.item.description || '',
              rarity: 'common', // Будет определяться по grade_id
              type: itemType,
              subType: '',
              icon: inventoryItem.item.icon,
              level: 1,
              stats: inventoryItem.actual_stats && typeof inventoryItem.actual_stats === 'object' ? inventoryItem.actual_stats : {},
              value: inventoryItem.value || 0,
              stackable: true,
              stackSize: inventoryItem.stack_size || 1,
              quality: inventoryItem.quality || 50, // новая система качества
              setBonus: '',
              equipment_slot: inventoryItem.item.equipment_slot || null,
              slot_position: inventoryItem.slot_position,
              item_key: inventoryItem.item.id, // Используем id как item_key
              isEquipped: isEquipped // Проверяем экипировку по ID
            }
            
            // Debug logging
            console.log('Item loaded:', {
              name: gameItem.name,
              type: gameItem.type,
              equipment_slot: gameItem.equipment_slot,
              isEquipped: gameItem.isEquipped,
              canEquip: !!gameItem.equipment_slot,
              itemId: gameItem.id,
              quality: gameItem.quality
            })
            inventorySlots[inventoryItem.slot_position - 1] = gameItem // -1 потому что слоты начинаются с 1
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

    // Сначала обновляем UI мгновенно (оптимистичное обновление)
    setInventory(prev => {
      const newInventory = [...prev]
      const targetItem = newInventory[toIndex]

      if (targetItem && targetItem.id === item.id && item.stackable) {
        // Объединяем стопки
        newInventory[fromIndex] = null
        newInventory[toIndex] = {
          ...targetItem,
          stackSize: (targetItem.stackSize || 1) + (item.stackSize || 1),
          slot_position: toIndex
        }
      } else if (targetItem) {
        // Меняем предметы местами
        newInventory[fromIndex] = { ...targetItem, slot_position: fromIndex }
        newInventory[toIndex] = { ...item, slot_position: toIndex }
      } else {
        // Просто перемещаем
        newInventory[fromIndex] = null
        newInventory[toIndex] = { ...item, slot_position: toIndex }
      }

      return newInventory
    })

    // Затем синхронизируем с БД в фоне (без показа loading)
    try {
      const { data, error } = await (supabase as any)
        .rpc('move_inventory_item', {
          p_character_id: character.id,
          p_from_slot: fromIndex,
          p_to_slot: toIndex
        })

      if (error) {
        console.error('Error moving item:', error)
        // В случае ошибки откатываем изменения
        loadInventory()
        toast.error('Ошибка перемещения предмета')
        return
      }

      if (data?.success) {
        // Обновляем UI на основе ответа БД (для корректных стопок)
        if (data.action === 'stacked' && data.total_stack) {
          setInventory(prev => {
            const newInventory = [...prev]
            const targetItem = newInventory[toIndex]
            if (targetItem) {
              newInventory[toIndex] = {
                ...targetItem,
                stackSize: data.total_stack
              }
            }
            return newInventory
          })
        }
        
        // Показываем уведомление только при успехе
        if (data.action === 'stacked') {
          toast.success(`Предметы объединены в стопку`)
        } else if (data.action === 'swapped') {
          toast.success(`Предметы поменялись местами`)
        } else if (data.action === 'moved') {
          toast.success(`Предмет перемещен`)
        }
      } else {
        // В случае ошибки откатываем изменения
        loadInventory()
        toast.error(data?.error || 'Ошибка перемещения предмета')
      }
    } catch (error) {
      console.error('Error moving item:', error)
      // В случае ошибки откатываем изменения
      loadInventory()
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

  // Функция для экипировки предмета
  const handleEquipItem = useCallback(async (slotIndex: number) => {
    console.log('🚨🚨🚨 handleEquipItem CALLED with slotIndex:', slotIndex)
    const item = inventory[slotIndex]
    console.log('🔍 Item at slot:', item)
    if (!item) {
      console.log('❌ No item at slot', slotIndex)
      return
    }

    console.log('🔍 Item details:', {
      id: item.id,
      name: item.name,
      type: item.type,
      equipment_slot: item.equipment_slot,
      slot_position: item.slot_position
    })

    // Экипировка предмета (только для оружия, брони, аксессуаров)
    if ((item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') && item.equipment_slot) {
      console.log('Attempting to equip item:', {
        itemId: item.id,
        itemName: item.name,
        equipmentSlot: item.equipment_slot,
        slotIndex
      })
      
      try {
        const { data, error } = await (supabase as any)
          .rpc('equip_item', {
            p_character_id: character.id,
            p_item_id: item.id,
            p_slot_position: item.slot_position
          })

        if (error) {
          console.error('Error equipping item:', error)
          toast.error(`Ошибка экипировки: ${error.message}`)
          return
        }

        console.log('Equip item response:', data)

        if (data?.success) {
          toast.success(`${data.item_name} экипирован в слот ${data.slot_type}!`)
          await loadInventory()
        } else {
          console.error('Equip item failed:', data)
          toast.error(data?.error || 'Ошибка экипировки предмета')
        }
      } catch (error) {
        console.error('Error using consumable:', error)
        toast.error('Ошибка использования предмета')
      }
    } else if (item.equipment_slot || (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory')) {
      // Экипировка предмета
      console.log('Attempting to equip item:', {
        itemId: item.id,
        itemName: item.name,
        equipmentSlot: item.equipment_slot,
        slotIndex
      })
      
      try {
        if (!item.equipment_slot) {
          console.error('Item has no equipment_slot:', item)
          toast.error('Предмет нельзя экипировать')
          return
        }

        console.log('Calling equip_item with:', {
          character_id: character.id,
          item_id: item.id,
          slot_position: item.slot_position,
          item_name: item.name
        })

        const { data, error } = await (supabase as any)
          .rpc('equip_item', {
            p_character_id: character.id,
            p_item_id: item.id,
            p_slot_position: item.slot_position
          })

        if (error) {
          console.error('Error equipping item:', error)
          toast.error(`Ошибка экипировки: ${error.message}`)
          return
        }

        console.log('Equip response:', data)
        console.log('Equip success:', data?.success)
        console.log('Equip error:', data?.error)

        if (data?.success) {
          toast.success(`${data.item_name} экипирован в слот ${data.slot_type}`)
          
          // Обновляем локальное состояние вместо полной перезагрузки
          if (item.slot_position !== undefined) {
            setInventory(prev => {
              const newInventory = [...prev]
              newInventory[item.slot_position!] = {
                ...item,
                isEquipped: true
              }
              return newInventory
            })
            
            // Закрываем тултип
            closeTooltip(item.slot_position)
          }
        } else {
          console.error('Equip failed:', data)
          toast.error(data?.error || 'Ошибка экипировки предмета')
        }
      } catch (error) {
        console.error('Error equipping item:', error)
        toast.error('Ошибка экипировки предмета')
      }
    }
  }, [inventory, character.id, loadInventory])

  // Функция для использования расходников
  const handleSlotClick = useCallback(async (slotIndex: number) => {
    console.log('🚨 handleSlotClick CALLED with slotIndex:', slotIndex)
    const item = inventory[slotIndex]
    console.log('🔍 Item at slot:', item)
    if (!item) {
      console.log('❌ No item at slot', slotIndex)
      return
    }

    if (item.type === 'consumable') {
      // Использование расходника
      console.log('Attempting to use consumable:', {
        itemId: item.id,
        itemName: item.name,
        slotIndex
      })
      
      try {
        const { data, error } = await (supabase as any)
          .rpc('use_consumable', {
            p_character_id: character.id,
            p_slot_position: item.slot_position
          })

        if (error) {
          console.error('Error using consumable:', error)
          toast.error(`Ошибка использования: ${error.message}`)
          return
        }

        console.log('Use consumable response:', data)

        if (data?.success) {
          toast.success(`${data.item_name} использован!`)
          await loadInventory()
        } else {
          console.error('Use consumable failed:', data)
          toast.error(data?.error || 'Ошибка использования предмета')
        }
      } catch (error) {
        console.error('Error using consumable:', error)
        toast.error('Ошибка использования предмета')
      }
    }
  }, [inventory, character.id, loadInventory])

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
        // Перезагружаем инвентарь для отображения отсортированного результата
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
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-400">
          {itemCount}/48 предметов • Ценность: {totalValue.toLocaleString()}🪙
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleSortInventory}
            disabled={loading}
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
                  onUse={() => handleSlotClick(index)}
                  onEquip={() => handleEquipItem(index)}
                  onUnequip={() => handleSlotClick(index)}
                  onClose={() => closeTooltip(index)}
                  showActions={true}
                  isEquipped={item.isEquipped || false}
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

      {/* Loading Overlay - только при первоначальной загрузке */}
      {loading && (
        <div className="absolute inset-0 bg-dark-100/50 backdrop-blur-sm flex items-center justify-center">
          <div className="loading-spinner" />
        </div>
      )}
    </div>
  )
}
