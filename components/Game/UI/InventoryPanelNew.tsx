'use client'

import { useState, useEffect, useCallback } from 'react'
import { Character } from '@/types/game'
import { toast } from 'react-hot-toast'
import { Package, ArrowUpDown, Search, Filter, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ItemTooltip, { GameItem } from '../../UI/ItemTooltip'

interface InventoryPanelProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
  isLoading: boolean
}

interface InventoryItem {
  id: string
  item: GameItem
  slot_position: number
  quantity: number
}

interface EquipmentSlot {
  slotType: string
  item?: GameItem
}

const equipmentSlots = [
  { key: 'main_weapon', name: 'Основное оружие', icon: '⚔️' },
  { key: 'off_weapon', name: 'Доп. оружие', icon: '🛡️' },
  { key: 'head', name: 'Голова', icon: '🪖' },
  { key: 'earrings', name: 'Серьги', icon: '💎' },
  { key: 'chest', name: 'Доспехи', icon: '🦺' },
  { key: 'necklace', name: 'Ожерелье', icon: '📿' },
  { key: 'belt', name: 'Пояс', icon: '🔗' },
  { key: 'ring1', name: 'Кольцо 1', icon: '💍' },
  { key: 'legs', name: 'Поножи', icon: '🦵' },
  { key: 'ring2', name: 'Кольцо 2', icon: '💍' },
  { key: 'feet', name: 'Ботинки', icon: '👢' },
  { key: 'empty', name: '', icon: '' }, // Пустая ячейка для сетки 3x4
]

export default function InventoryPanelNew({ character, onUpdateCharacter, isLoading }: InventoryPanelProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [equipment, setEquipment] = useState<EquipmentSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')

  // Загрузка инвентаря
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

      setInventory(data || [])
    } catch (error) {
      console.error('Error loading inventory:', error)
      toast.error('Ошибка загрузки инвентаря')
    } finally {
      setLoading(false)
    }
  }, [character.id])

  // Загрузка экипировки
  const loadEquipment = useCallback(async () => {
    try {
      const { data, error } = await (supabase as any)
        .rpc('get_character_equipment', { p_character_id: character.id })

      if (error) {
        console.error('Error loading equipment:', error)
        return
      }

      setEquipment(data || [])
    } catch (error) {
      console.error('Error loading equipment:', error)
    }
  }, [character.id])

  useEffect(() => {
    loadInventory()
    loadEquipment()
  }, [loadInventory, loadEquipment])

  // Сортировка инвентаря (исправленная версия)
  const handleSortInventory = async () => {
    try {
      setLoading(true)
      
      // Сначала получаем все предметы
      const { data: currentItems, error: fetchError } = await (supabase as any)
        .rpc('get_character_inventory', { p_character_id: character.id })

      if (fetchError) {
        throw fetchError
      }

      // Сортируем предметы по редкости, типу и уровню
      const sortedItems = (currentItems || []).sort((a: InventoryItem, b: InventoryItem) => {
        const rarityOrder = { mythic: 6, legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 }
        const aRarity = rarityOrder[a.item.rarity as keyof typeof rarityOrder] || 0
        const bRarity = rarityOrder[b.item.rarity as keyof typeof rarityOrder] || 0
        
        if (aRarity !== bRarity) return bRarity - aRarity
        if (a.item.type !== b.item.type) return a.item.type.localeCompare(b.item.type)
        return b.item.level - a.item.level
      })

      // Обновляем позиции предметов в базе данных по одному
      for (let i = 0; i < sortedItems.length; i++) {
        const item = sortedItems[i]
        const newPosition = i + 1

        if (item.slot_position !== newPosition) {
          const { error: updateError } = await (supabase as any)
            .from('character_inventory')
            .update({ slot_position: newPosition })
            .eq('character_id', character.id)
            .eq('id', item.id)

          if (updateError) {
            console.error('Error updating item position:', updateError)
            throw updateError
          }
        }
      }

      toast.success(`Инвентарь отсортирован (${sortedItems.length} предметов)`)
      await loadInventory()
    } catch (error) {
      console.error('Error sorting inventory:', error)
      toast.error('Ошибка сортировки')
    } finally {
      setLoading(false)
    }
  }

  // Экипировка предмета
  const handleEquipItem = async (item: GameItem) => {
    try {
      const { data, error } = await (supabase as any)
        .rpc('equip_item', {
          p_character_id: character.id,
          p_item_key: item.item_key
        })

      if (error) {
        console.error('Error equipping item:', error)
        toast.error('Ошибка экипировки предмета')
        return
      }

      if (data?.success) {
        toast.success(`${item.name} экипирован`)
        await loadInventory()
        await loadEquipment()
        // Обновляем характеристики персонажа
        const updatedChar = { ...character }
        await onUpdateCharacter(updatedChar)
      } else {
        toast.error(data?.error || 'Ошибка экипировки предмета')
      }
    } catch (error) {
      console.error('Error equipping item:', error)
      toast.error('Ошибка экипировки предмета')
    }
  }

  // Снятие экипировки
  const handleUnequipItem = async (slotType: string) => {
    try {
      const { data, error } = await (supabase as any)
        .rpc('unequip_item', {
          p_character_id: character.id,
          p_slot_type: slotType
        })

      if (error) {
        console.error('Error unequipping item:', error)
        toast.error('Ошибка снятия предмета')
        return
      }

      if (data?.success) {
        toast.success('Предмет снят')
        await loadInventory()
        await loadEquipment()
        // Обновляем характеристики персонажа
        const updatedChar = { ...character }
        await onUpdateCharacter(updatedChar)
      } else {
        toast.error(data?.error || 'Ошибка снятия предмета')
      }
    } catch (error) {
      console.error('Error unequipping item:', error)
      toast.error('Ошибка снятия предмета')
    }
  }

  // Фильтрация предметов
  const filteredItems = inventory.filter(invItem => {
    const matchesSearch = invItem.item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = activeFilter === 'all' || invItem.item.type === activeFilter
    return matchesSearch && matchesFilter
  })

  // Подсчет предметов по типам для фильтров
  const filterOptions = [
    { value: 'all', label: 'Все', count: inventory.length },
    { value: 'weapon', label: 'Оружие', count: inventory.filter(i => i.item.type === 'weapon').length },
    { value: 'armor', label: 'Броня', count: inventory.filter(i => i.item.type === 'armor').length },
    { value: 'accessory', label: 'Аксессуары', count: inventory.filter(i => i.item.type === 'accessory').length },
    { value: 'consumable', label: 'Расходники', count: inventory.filter(i => i.item.type === 'consumable').length },
  ]

  const itemCount = inventory.length
  const totalValue = inventory.reduce((sum, item) => sum + (item.item.value * item.quantity), 0)

  if (loading && inventory.length === 0) {
    return (
      <div className="flex-1 game-content p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <span className="text-white">Загрузка инвентаря...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 game-content p-4">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-full">
        
        {/* 1. Экипировка */}
        <div className="game-panel p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Package className="w-5 h-5 text-purple-400" />
            <span>Экипировка</span>
          </h2>

          {/* Equipment Grid 3x4 */}
          <div className="grid grid-cols-3 gap-2">
            {equipmentSlots.map((slot, index) => {
              if (slot.key === 'empty') {
                return <div key={`empty-${index}`} className="w-16 h-16"></div>
              }

              const equippedItem = equipment.find(eq => eq.slotType === slot.key)
              const hasItem = !!equippedItem?.item
              
              return (
                <div key={slot.key} className="relative">
                  {hasItem && equippedItem?.item ? (
                    <ItemTooltip
                      item={equippedItem.item}
                      onUnequip={() => handleUnequipItem(slot.key)}
                      showActions={true}
                      isEquipped={true}
                    >
                      <div className="w-16 h-16 rounded-lg flex flex-col items-center justify-center p-1 cursor-pointer bg-dark-200/50 border-2 border-solid border-gold-400/60">
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <div className="text-lg">{equippedItem.item.icon}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {equippedItem.item.level} ур.
                          </div>
                        </div>
                      </div>
                    </ItemTooltip>
                  ) : (
                    <div className="w-16 h-16 rounded-lg flex flex-col items-center justify-center p-1 cursor-pointer bg-dark-200/20 border-2 border-dashed border-dark-300/30">
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 opacity-40">
                        <div className="text-sm">{slot.icon}</div>
                        <div className="text-xs text-center mt-0.5 leading-tight">{slot.name}</div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 2. Инвентарь */}
        <div className="game-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-400" />
              <span>Инвентарь</span>
            </h2>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSortInventory}
                disabled={loading}
                className="px-2 py-1 bg-dark-300/20 text-dark-400 rounded text-sm"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-400 mb-4">
            {itemCount}/48 предметов • Ценность: {totalValue.toLocaleString()}🪙
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
                className="w-full pl-10 pr-4 py-2 bg-dark-200/50 border border-dark-300/50 rounded text-white placeholder-gray-500 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-1">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setActiveFilter(option.value)}
                  className={`px-2 py-1 rounded text-xs ${
                    activeFilter === option.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-dark-300 text-gray-300'
                  }`}
                >
                  {option.label} ({option.count})
                </button>
              ))}
            </div>
          </div>

          {/* Inventory Grid */}
          <div className="grid grid-cols-6 gap-2 h-full overflow-y-auto">
            {Array.from({ length: 48 }, (_, index) => {
              const invItem = filteredItems.find(item => item.slot_position === index + 1)
              
              return (
                <div key={index} className="relative">
                  {invItem ? (
                    <ItemTooltip
                      item={invItem.item}
                      onEquip={() => handleEquipItem(invItem.item)}
                      showActions={true}
                      isEquipped={false}
                    >
                      <div className="w-12 h-12 bg-dark-200/30 border border-dark-300/50 rounded flex flex-col items-center justify-center p-1 cursor-pointer">
                        <div className="text-sm">{invItem.item.icon}</div>
                        {invItem.quantity > 1 && (
                          <div className="absolute -bottom-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {invItem.quantity}
                          </div>
                        )}
                      </div>
                    </ItemTooltip>
                  ) : (
                    <div className="w-12 h-12 bg-dark-200/10 border border-dashed border-dark-300/30 rounded flex items-center justify-center">
                      <div className="text-dark-500 text-xs">+</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
