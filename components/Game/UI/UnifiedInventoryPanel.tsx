'use client'

import { useState, useEffect, useCallback } from 'react'
import { Character } from '@/types/game'
import { supabase } from '@/lib/supabase'
import { Package, Search, ArrowUpDown, Trash2, Sword, Shield, Crown, Zap, Eye, Star } from 'lucide-react'
import DraggableItem from '../../UI/DraggableItem'
import InventorySlot from '../../UI/InventorySlot'
import ItemTooltip, { GameItem } from '../../UI/ItemTooltip'
import { toast } from 'react-hot-toast'
import { useCharacterStats } from '@/lib/useCharacterStats'

interface UnifiedInventoryPanelProps {
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

interface EquipmentSlot {
  slotType: string
  item?: GameItem
  quality?: number
  upgradeLevel?: number
  equippedAt?: string
}

const equipmentSlots = [
  { key: 'weapon', name: 'Оружие', icon: <Sword className="w-5 h-5 text-red-400" />, position: 'center' },
  { key: 'helmet', name: 'Шлем', icon: <Crown className="w-5 h-5 text-blue-400" />, position: 'top' },
  { key: 'armor', name: 'Броня', icon: <Shield className="w-5 h-5 text-green-400" />, position: 'center' },
  { key: 'gloves', name: 'Перчатки', icon: <Zap className="w-5 h-5 text-yellow-400" />, position: 'left' },
  { key: 'boots', name: 'Ботинки', icon: <Eye className="w-5 h-5 text-purple-400" />, position: 'right' },
  { key: 'shield', name: 'Щит', icon: <Shield className="w-5 h-5 text-cyan-400" />, position: 'left' },
  { key: 'ring1', name: 'Кольцо 1', icon: <Star className="w-5 h-5 text-pink-400" />, position: 'bottom-left' },
  { key: 'ring2', name: 'Кольцо 2', icon: <Star className="w-5 h-5 text-pink-400" />, position: 'bottom-right' },
  { key: 'amulet', name: 'Амулет', icon: <Crown className="w-5 h-5 text-gold-400" />, position: 'bottom' }
]

export default function UnifiedInventoryPanel({ character, onUpdateCharacter, isLoading }: UnifiedInventoryPanelProps) {
  // Инвентарь состояние
  const [inventory, setInventory] = useState<(GameItem | null)[]>(new Array(48).fill(null))
  const [inventoryLoading, setInventoryLoading] = useState(true)
  const [draggedItem, setDraggedItem] = useState<GameItem | null>(null)
  const [draggedFromIndex, setDraggedFromIndex] = useState<number | undefined>()
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [openTooltips, setOpenTooltips] = useState<Set<number>>(new Set())

  // Экипировка состояние
  const [equipment, setEquipment] = useState<EquipmentSlot[]>([])
  const [equipmentLoading, setEquipmentLoading] = useState(true)

  // Используем хук для расчета статов с учетом экипировки
  const { calculatedStats, equipmentBonuses, statsChanged } = useCharacterStats({
    character,
    equipment: equipment?.filter(slot => slot.item).map(slot => ({ item: slot.item })) || []
  })

  // Функции для управления тултипами
  const closeTooltip = useCallback((slotIndex: number) => {
    setOpenTooltips(prev => {
      const newSet = new Set(prev)
      newSet.delete(slotIndex)
      return newSet
    })
  }, [])

  // Загрузка инвентаря
  const loadInventory = useCallback(async () => {
    try {
      setInventoryLoading(true)
      const { data, error } = await (supabase as any).rpc('get_character_inventory', {
        p_character_id: character.id
      })

      if (error) {
        console.error('Error loading inventory:', error)
        toast.error('Ошибка загрузки инвентаря')
        return
      }

      // Создаем массив инвентаря
      const inventoryArray = new Array(48).fill(null)
      data?.forEach((item: any) => {
        if (item.slot_position && item.slot_position > 0 && item.slot_position <= 48) {
          inventoryArray[item.slot_position - 1] = {
            id: item.item_id,
            name: item.item_name,
            description: item.item_description,
            rarity: item.rarity,
            type: item.item_type,
            icon: item.icon,
            level_requirement: item.level_requirement,
            stats: {}, // Базовые статы предмета
            value: 0, // Стоимость предмета
            quantity: item.quantity,
            quality: item.quality,
            upgradeLevel: item.upgrade_level,
            obtainedAt: item.obtained_at
          }
        }
      })

      setInventory(inventoryArray)
    } catch (error) {
      console.error('Error loading inventory:', error)
      toast.error('Ошибка подключения к серверу')
    } finally {
      setInventoryLoading(false)
    }
  }, [character.id])

  // Загрузка экипировки
  const loadEquipment = useCallback(async () => {
    try {
      setEquipmentLoading(true)
      const { data, error } = await (supabase as any).rpc('get_character_equipment', {
        p_character_id: character.id
      })

      if (error) {
        console.error('Error loading equipment:', error)
        toast.error('Ошибка загрузки экипировки')
        return
      }

      // Инициализируем слоты экипировки
      const equipmentSlots: EquipmentSlot[] = [
        { slotType: 'weapon' },
        { slotType: 'helmet' },
        { slotType: 'armor' },
        { slotType: 'gloves' },
        { slotType: 'boots' },
        { slotType: 'shield' },
        { slotType: 'ring1' },
        { slotType: 'ring2' },
        { slotType: 'amulet' }
      ]

      // Заполняем экипированные предметы
      data?.forEach((item: any) => {
        const slot = equipmentSlots.find(s => s.slotType === item.slot_type)
        if (slot) {
          slot.item = {
            id: item.item_id,
            name: item.item_name,
            description: item.item_description,
            rarity: item.rarity,
            type: item.item_type,
            icon: item.icon,
            level_requirement: item.level_requirement,
            stats: {}, // Базовые статы предмета
            value: 0, // Стоимость предмета
            quantity: 1,
            quality: item.quality,
            upgradeLevel: item.upgrade_level,
            obtainedAt: item.equipped_at
          }
          slot.quality = item.quality
          slot.upgradeLevel = item.upgrade_level
          slot.equippedAt = item.equipped_at
        }
      })

      setEquipment(equipmentSlots)
    } catch (error) {
      console.error('Error loading equipment:', error)
      toast.error('Ошибка подключения к серверу')
    } finally {
      setEquipmentLoading(false)
    }
  }, [character.id])

  useEffect(() => {
    loadInventory()
    loadEquipment()
  }, [loadInventory, loadEquipment])

  // Фильтрация инвентаря
  const filteredInventory = inventory.filter((item, index) => {
    if (!item) return false
    if (activeFilter !== 'all' && item.type !== activeFilter) return false
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  // Обработка перетаскивания предметов
  const handleDragStart = (item: GameItem, fromIndex: number) => {
    setDraggedItem(item)
    setDraggedFromIndex(fromIndex)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDraggedFromIndex(undefined)
  }

  const handleDrop = async (toIndex: number) => {
    if (!draggedItem || draggedFromIndex === undefined) return

    try {
      // Обновляем инвентарь
      const newInventory = [...inventory]
      newInventory[draggedFromIndex] = null
      newInventory[toIndex] = draggedItem

      setInventory(newInventory)

      // Обновляем позиции в базе данных
      await (supabase as any).rpc('move_inventory_item', {
        p_character_id: character.id,
        p_from_slot: draggedFromIndex + 1,
        p_to_slot: toIndex + 1
      })

      toast.success('Предмет перемещен')
    } catch (error) {
      console.error('Error moving item:', error)
      toast.error('Ошибка перемещения предмета')
      // Возвращаем предмет на место
      setInventory(inventory)
    }
  }

  // Обработка клика по предмету
  const handleItemClick = (item: GameItem, slotIndex: number) => {
    if (openTooltips.has(slotIndex)) {
      closeTooltip(slotIndex)
    } else {
      setOpenTooltips(new Set([slotIndex]))
    }
  }

  // Обработка экипировки предмета
  const handleEquipItem = async (item: GameItem, slotIndex: number) => {
    try {
      // Определяем тип слота для экипировки
      const slotType = item.type === 'weapon' ? 'weapon' : 
                     item.type === 'armor' ? 'armor' : 
                     item.type === 'accessory' ? 'ring1' : 'weapon'

      // Экипируем предмет
      const { error } = await (supabase as any).rpc('equip_item', {
        p_character_id: character.id,
        p_item_id: item.id,
        p_slot_type: slotType
      })

      if (error) throw error

      // Убираем предмет из инвентаря
      const newInventory = [...inventory]
      newInventory[slotIndex] = null
      setInventory(newInventory)

      // Перезагружаем экипировку
      await loadEquipment()

      toast.success('Предмет экипирован')
    } catch (error) {
      console.error('Error equipping item:', error)
      toast.error('Ошибка экипировки предмета')
    }
  }

  return (
    <div className="flex-1 game-content p-4">
      <div className="flex h-full gap-4">
        {/* Левая секция - Инвентарь (70%) */}
        <div className="flex-1 w-[70%]">
          <div className="game-panel p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Инвентарь</h2>
                <span className="text-sm text-gray-400">
                  {inventory.filter(item => item !== null).length}/48
                </span>
              </div>
              
              {/* Фильтры и поиск */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск предметов..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value as FilterType)}
                  className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Все предметы</option>
                  <option value="weapon">Оружие</option>
                  <option value="armor">Броня</option>
                  <option value="accessory">Аксессуары</option>
                  <option value="consumable">Расходники</option>
                  <option value="material">Материалы</option>
                </select>
              </div>
            </div>

            {/* Сетка инвентаря */}
            <div className="grid grid-cols-8 gap-1 h-[calc(100%-80px)] overflow-y-auto">
              {Array.from({ length: 48 }, (_, index) => {
                const item = inventory[index]
                const isFiltered = item && !filteredInventory.includes(item)
                
                return (
                  <div
                    key={index}
                    className={`aspect-square border-2 rounded-lg transition-all duration-200 ${
                      isFiltered 
                        ? 'border-gray-600 opacity-30' 
                        : 'border-dark-600 hover:border-blue-500'
                    }`}
                    onDrop={(e) => {
                      e.preventDefault()
                      handleDrop(index)
                    }}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {item ? (
                      <DraggableItem
                        item={item}
                        onDragStart={() => handleDragStart(item, index)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleItemClick(item, index)}
                        className="w-full h-full"
                      />
                    ) : (
                      <InventorySlot
                        slotIndex={index}
                        onDrop={() => handleDrop(index)}
                        className="w-full h-full"
                      />
                    )}
                    
                    {/* Тултип */}
                    {item && openTooltips.has(index) && (
                      <div className="absolute z-50 mt-2">
                        <ItemTooltip
                          item={item}
                          onClose={() => closeTooltip(index)}
                          onEquip={() => handleEquipItem(item, index)}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Правая секция - Экипировка (30%) */}
        <div className="w-[30%]">
          <div className="game-panel p-4 h-full">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-semibold text-white">Экипировка</h2>
            </div>

            {/* Сетка экипировки */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {equipmentSlots.map((slot) => {
                const equippedItem = equipment.find(e => e.slotType === slot.key)
                
                return (
                  <div
                    key={slot.key}
                    className={`aspect-square border-2 rounded-lg p-2 flex flex-col items-center justify-center transition-all duration-200 ${
                      equippedItem?.item 
                        ? 'border-green-500 bg-green-500/10' 
                        : 'border-dark-600 hover:border-gray-500'
                    }`}
                  >
                    {equippedItem?.item ? (
                      <div className="text-center">
                        <div className="text-2xl mb-1">{equippedItem.item.icon}</div>
                        <div className="text-xs text-gray-300 truncate">
                          {equippedItem.item.name}
                        </div>
                        {equippedItem.quality && (
                          <div className="text-xs text-yellow-400">
                            +{equippedItem.quality}%
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">
                        {slot.icon}
                        <div className="text-xs mt-1">{slot.name}</div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Бонусы от экипировки */}
            {equipmentBonuses && Object.keys(equipmentBonuses).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-300">Бонусы от экипировки:</h3>
                <div className="space-y-1 text-xs">
                  {Object.entries(equipmentBonuses).map(([stat, bonus]) => (
                    <div key={stat} className="flex justify-between">
                      <span className="text-gray-400 capitalize">{stat}:</span>
                      <span className="text-green-400">+{String(bonus)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
