'use client'

import { useState, useEffect, useCallback } from 'react'
import { Character } from '@/types/game'
import { supabase } from '@/lib/supabase'
import { Package, Search, ArrowUpDown } from 'lucide-react'
import DraggableItem from '../../UI/DraggableItem'
import ItemTooltip, { GameItem } from '../../UI/ItemTooltip'
import { toast } from 'react-hot-toast'
import EquipmentComponent from './EquipmentComponent'

interface InventoryPanelProps {
  character: Character
  onUpdateCharacter: (character: Partial<Character>) => Promise<boolean>
  isLoading: boolean
}

type FilterType = 'all' | 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material'

export default function InventoryPanel({ character, onUpdateCharacter, isLoading }: InventoryPanelProps) {
  console.log('🎮🎮🎮 ИСПРАВЛЕННЫЙ ИНВЕНТАРЬ ЗАГРУЖЕН!')
  
  // Инвентарь состояние
  const [inventory, setInventory] = useState<(GameItem | null)[]>(new Array(48).fill(null))
  const [loading, setLoading] = useState(true)
  const [draggedItem, setDraggedItem] = useState<GameItem | null>(null)
  const [draggedFromIndex, setDraggedFromIndex] = useState<number | undefined>()
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [openTooltips, setOpenTooltips] = useState<Set<number>>(new Set())

  // Загрузка инвентаря
  const loadInventory = useCallback(async () => {
    try {
      setLoading(true)
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
            stats: {},
            value: 0,
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
      setLoading(false)
    }
  }, [character.id])

  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  // Фильтрация инвентаря
  const filteredInventory = inventory.filter((item, index) => {
    if (!item) return false
    if (activeFilter !== 'all' && item.type !== activeFilter) return false
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  // Обработка перетаскивания
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
      const newInventory = [...inventory]
      newInventory[draggedFromIndex] = null
      newInventory[toIndex] = draggedItem
      setInventory(newInventory)

      await (supabase as any).rpc('move_inventory_item', {
        p_character_id: character.id,
        p_item_id: draggedItem.id,
        p_from_slot: draggedFromIndex + 1,
        p_to_slot: toIndex + 1
      })

      toast.success('Предмет перемещен')
    } catch (error) {
      console.error('Error moving item:', error)
      toast.error('Ошибка перемещения предмета')
      loadInventory() // Откатываем изменения
    } finally {
      setDraggedItem(null)
      setDraggedFromIndex(undefined)
    }
  }

  const handleItemClick = (item: GameItem, index: number) => {
    setOpenTooltips(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const handleEquipItem = async (item: GameItem, slotIndex: number) => {
    try {
      const slotType = item.type === 'weapon' ? 'weapon' :
        item.type === 'armor' ? 'armor' :
          item.type === 'accessory' ? 'ring' : 'weapon'

      await (supabase as any).rpc('equip_item', {
        p_character_id: character.id,
        p_item_id: item.id,
        p_slot_type: slotType
      })

      const newInventory = [...inventory]
      newInventory[slotIndex] = null
      setInventory(newInventory)

      toast.success('Предмет экипирован')
    } catch (error) {
      console.error('Error equipping item:', error)
      toast.error('Ошибка экипировки предмета')
    }
  }

  const handleSellItem = async (item: GameItem, index: number) => {
    try {
      await (supabase as any).rpc('sell_item', {
        p_character_id: character.id,
        p_item_id: item.id,
        p_slot_position: index + 1,
        p_quantity: item.quantity || 1
      })

      const newInventory = [...inventory]
      newInventory[index] = null
      setInventory(newInventory)

      await onUpdateCharacter({ gold: character.gold + (item.value * (item.quantity || 1)) })
      toast.success(`Продан ${item.name} за ${item.value * (item.quantity || 1)} золота`)
    } catch (error) {
      console.error('Error selling item:', error)
      toast.error('Ошибка продажи предмета')
    }
  }

  const handleSortInventory = () => {
    const sortedItems = inventory.filter(item => item !== null).sort((a, b) => {
      if (!a || !b) return 0
      const rarityOrder = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common']
      const rarityA = rarityOrder.indexOf(a.rarity)
      const rarityB = rarityOrder.indexOf(b.rarity)

      if (rarityA !== rarityB) return rarityA - rarityB
      return a.name.localeCompare(b.name)
    })

    const newInventory = new Array(48).fill(null)
    sortedItems.forEach((item, index) => {
      newInventory[index] = item
    })
    setInventory(newInventory)
    toast.success('Инвентарь отсортирован')
  }

  const itemCount = inventory.filter(item => item !== null).length

  if (loading) {
    return (
      <div className="flex-1 game-content p-4 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="loading-spinner" />
          <span className="text-white">Загрузка инвентаря...</span>
        </div>
      </div>
    )
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
                <h2 className="text-2xl font-bold text-red-400 animate-pulse">🎮 ИСПРАВЛЕННЫЙ ИНВЕНТАРЬ 🎮</h2>
                <span className="text-sm text-gray-400">
                  {itemCount}/48 предметов
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
                    className="pl-9 pr-3 py-1 rounded-md bg-dark-700 border border-dark-600 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value as FilterType)}
                  className="px-3 py-1 rounded-md bg-dark-700 border border-dark-600 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">Все</option>
                  <option value="weapon">Оружие</option>
                  <option value="armor">Броня</option>
                  <option value="accessory">Аксессуары</option>
                  <option value="consumable">Расходники</option>
                  <option value="material">Материалы</option>
                </select>
                <button
                  onClick={handleSortInventory}
                  className="p-2 rounded-md bg-dark-700 hover:bg-dark-600 border border-dark-600 text-white transition-colors duration-200"
                  title="Сортировать инвентарь"
                >
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Сетка инвентаря - БЕЗ ЛИШНИХ ОБЕРТОК */}
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
                    {item && !isFiltered ? (
                      <DraggableItem
                        item={item}
                        slotIndex={index}
                        onDragStart={(draggedItem, fromIndex) => handleDragStart(draggedItem, fromIndex)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleItemClick(item, index)}
                        onEquip={() => handleEquipItem(item, index)}
                        onUse={() => toast.success(`Использован ${item.name}`)}
                        onSell={() => handleSellItem(item, index)}
                        className="w-full h-full"
                        showActions={true}
                      />
                    ) : (
                      <div className="w-full h-full bg-dark-800/50 rounded-lg flex items-center justify-center text-gray-500">
                        {/* Пустой слот */}
                      </div>
                    )}
                    {item && openTooltips.has(index) && (
                      <div className="absolute z-50 mt-2">
                        <ItemTooltip
                          item={item}
                          onClose={() => setOpenTooltips(prev => {
                            const newSet = new Set(prev)
                            newSet.delete(index)
                            return newSet
                          })}
                          onEquip={() => handleEquipItem(item, index)}
                          onUse={() => toast.success(`Использован ${item.name}`)}
                          onSell={() => handleSellItem(item, index)}
                          isEquipped={false}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Правая секция - Экипировка (30%) - ИСПОЛЬЗУЕМ КОМПОНЕНТ ИЗ СТРАНИЦЫ ПЕРСОНАЖА */}
        <div className="w-[30%]">
          <EquipmentComponent 
            character={character}
            onUpdateCharacter={onUpdateCharacter}
            layout="inventory"
          />
        </div>
      </div>
    </div>
  )
}