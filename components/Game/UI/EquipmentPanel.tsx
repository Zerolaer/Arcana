'use client'

import { useState, useEffect, useCallback } from 'react'
import { Character } from '@/types/game'
import { supabase } from '@/lib/supabase'
import { GameItem } from '../../UI/ItemTooltip'
import ItemTooltip from '../../UI/ItemTooltip'
import { toast } from 'react-hot-toast'
import { 
  Sword, Shield, Crown, Zap, Eye, 
  Shield as ShieldIcon, Star, 
  RotateCcw, Plus, Minus 
} from 'lucide-react'

interface EquipmentPanelProps {
  character: Character
  onUpdateCharacter: (character: Partial<Character>) => Promise<boolean>
  isLoading: boolean
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
  { key: 'shield', name: 'Щит', icon: <ShieldIcon className="w-5 h-5 text-cyan-400" />, position: 'left' },
  { key: 'ring1', name: 'Кольцо 1', icon: <Star className="w-5 h-5 text-pink-400" />, position: 'bottom-left' },
  { key: 'ring2', name: 'Кольцо 2', icon: <Star className="w-5 h-5 text-pink-400" />, position: 'bottom-right' },
  { key: 'amulet', name: 'Амулет', icon: <Crown className="w-5 h-5 text-gold-400" />, position: 'bottom' }
]

export default function EquipmentPanel({ character, onUpdateCharacter, isLoading }: EquipmentPanelProps) {
  const [equipment, setEquipment] = useState<EquipmentSlot[]>([])
  const [loading, setLoading] = useState(true)

  // Загрузка экипировки из базы данных
  const loadEquipment = useCallback(async () => {
    try {
      setLoading(true)
      
      const { data, error } = await (supabase as any)
        .rpc('get_character_equipment', { p_character_id: character.id })

      if (error) {
        console.error('Error loading equipment:', error)
        toast.error('Ошибка загрузки экипировки')
        return
      }

      // Создаем массив слотов экипировки
      const equipmentData = equipmentSlots.map(slot => {
        const equippedItem = data?.find((item: any) => item.slot_type === slot.key)
        
        if (equippedItem) {
          return {
            slotType: slot.key,
            item: {
              id: equippedItem.item.id,
              name: equippedItem.item.name,
              description: equippedItem.item.description,
              rarity: equippedItem.item.rarity,
              type: equippedItem.item.item_type,
              subType: equippedItem.item.subType || '',
              icon: equippedItem.item.icon,
              level: equippedItem.item.level_requirement,
              stats: {
                // Базовые характеристики
                strength_bonus: equippedItem.item.strength_bonus || 0,
                dexterity_bonus: equippedItem.item.dexterity_bonus || 0,
                intelligence_bonus: equippedItem.item.intelligence_bonus || 0,
                vitality_bonus: equippedItem.item.vitality_bonus || 0,
                energy_bonus: equippedItem.item.energy_bonus || 0,
                luck_bonus: equippedItem.item.luck_bonus || 0,
                
                // Боевые характеристики
                attack_damage: equippedItem.item.attack_damage || 0,
                magic_damage: equippedItem.item.magic_damage || 0,
                defense: equippedItem.item.defense || 0,
                magic_resistance: equippedItem.item.magic_resistance || 0
              },
              value: equippedItem.item.vendor_price || 0,
              stackable: false,
              stackSize: 1,
              quality: equippedItem.quality || 50,
              setBonus: equippedItem.item.setBonus || ''
            },
            quality: equippedItem.quality || 50,
            upgradeLevel: equippedItem.upgrade_level,
            equippedAt: equippedItem.equipped_at
          }
        } else {
          return {
            slotType: slot.key,
            item: undefined
          }
        }
      })

      setEquipment(equipmentData)
    } catch (error) {
      console.error('Error loading equipment:', error)
      toast.error('Ошибка загрузки экипировки')
    } finally {
      setLoading(false)
    }
  }, [character.id])

  // Загружаем экипировку при монтировании компонента
  useEffect(() => {
    loadEquipment()
  }, [loadEquipment])

  // Снятие предмета
  const handleUnequip = async (slotType: string) => {
    console.log('🔍 handleUnequip called with slotType:', slotType)
    
    try {
      const { data, error } = await (supabase as any)
        .rpc('unequip_item', {
          p_character_id: character.id,
          p_slot_type: slotType
        })

      console.log('Unequip response:', { data, error })

      if (error) {
        console.error('Error unequipping item:', error)
        toast.error(`Ошибка снятия: ${error.message}`)
        return
      }

      if (data?.success) {
        toast.success(`${data.item_name} снят и возвращен в инвентарь`)
        await loadEquipment()
      } else {
        console.error('Unequip failed:', data)
        toast.error(data?.error || 'Ошибка снятия предмета')
      }
    } catch (error) {
      console.error('Error unequipping item:', error)
      toast.error('Ошибка снятия предмета')
    }
  }

  // Получение слота по типу
  const getSlotByType = (slotType: string) => {
    return equipmentSlots.find(slot => slot.key === slotType)
  }

  // Получение экипированного предмета по типу слота
  const getEquippedItem = (slotType: string) => {
    return equipment.find(eq => eq.slotType === slotType)
  }

  if (loading) {
    return (
      <div className="game-content h-full flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="loading-spinner" />
          <span className="text-white">Загрузка экипировки...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="game-content h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-primary-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Экипировка</h2>
            <div className="text-sm text-gray-400">
              Надетые предметы и их характеристики
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-3 gap-4 p-4">
          {equipmentSlots.map((slot) => {
            const equippedItem = getEquippedItem(slot.key)
            
            return (
              <div
                key={slot.key}
                className={`relative ${
                  slot.position === 'center' ? 'col-start-2' : 
                  slot.position === 'left' ? 'col-start-1' : 
                  slot.position === 'right' ? 'col-start-3' :
                  slot.position === 'top' ? 'col-start-2 row-start-1' :
                  slot.position === 'bottom' ? 'col-start-2 row-start-3' :
                  slot.position === 'bottom-left' ? 'col-start-1 row-start-3' :
                  slot.position === 'bottom-right' ? 'col-start-3 row-start-3' :
                  'col-start-2'
                }`}
              >
                <div className="game-panel p-4 h-24 flex flex-col items-center justify-center relative group">
                  {equippedItem?.item ? (
                    <ItemTooltip
                      item={equippedItem.item}
                      onUnequip={() => handleUnequip(slot.key)}
                      showActions={true}
                      isEquipped={true}
                    >
                      <div className="flex flex-col items-center space-y-1 cursor-pointer relative">
                        <div className="text-2xl">{equippedItem.item.icon}</div>
                        <div className="text-xs text-center text-white font-semibold truncate max-w-full">
                          {equippedItem.item.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {equippedItem.item.rarity}
                        </div>
                        
                        {/* Индикатор качества */}
                        {equippedItem.quality && (
                          <div className="absolute bottom-0 left-0 right-0">
                            <div className="w-full bg-gray-700 rounded-full h-1">
                              <div 
                                className={`h-1 rounded-full transition-all duration-300 ${
                                  equippedItem.quality > 80 ? 'bg-green-500' :
                                  equippedItem.quality > 60 ? 'bg-blue-500' :
                                  equippedItem.quality > 40 ? 'bg-yellow-500' :
                                  equippedItem.quality > 20 ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                                style={{ 
                                  width: `${Math.min(equippedItem.quality, 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </ItemTooltip>
                  ) : (
                    <>
                      {/* Пустой слот */}
                      <div className="flex flex-col items-center space-y-1 text-gray-500">
                        {slot.icon}
                        <div className="text-xs text-center">
                          {slot.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          Пусто
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Equipment Stats Summary */}
      {equipment.some(eq => eq.item) && (
        <div className="border-t border-white/10 pt-4 mt-4">
          <h3 className="text-lg font-bold text-white mb-3">Бонусы от экипировки</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'damage', name: 'Урон', icon: '⚔️' },
              { key: 'defense', name: 'Защита', icon: '🛡️' },
              { key: 'health', name: 'Здоровье', icon: '❤️' },
              { key: 'mana', name: 'Мана', icon: '💙' }
            ].map(stat => {
              const totalBonus = equipment
                .filter(eq => eq.item?.stats?.[stat.key])
                .reduce((sum, eq) => sum + (eq.item?.stats?.[stat.key] || 0), 0)
              
              return (
                <div key={stat.key} className="bg-dark-200/30 rounded border border-dark-300/30 p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{stat.icon}</span>
                    <span className="text-sm text-gray-400">{stat.name}</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    +{totalBonus}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
