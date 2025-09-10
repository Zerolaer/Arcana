'use client'

import { useState, useEffect, useCallback } from 'react'
import { Character } from '@/types/game'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import ItemTooltip, { GameItem } from '../../UI/ItemTooltip'

interface EquipmentComponentProps {
  character: Character
  onUpdateCharacter?: (updates: Partial<Character>) => Promise<boolean>
  onEquipmentChange?: () => void // Callback для уведомления об изменениях экипировки
  layout?: 'character' | 'inventory' // Тип макета (не используется, всегда один макет)
}

interface EquipmentSlot {
  slot_type: string  // Исправлено: в БД используется slot_type
  item?: GameItem
  current_durability?: number
  upgrade_level?: number
  equipped_at?: string
}

// ЕДИНЫЙ макет экипировки - персонаж в центре, слоты вокруг (5x3)
const equipmentLayout = [
  { key: 'amulet', name: 'Амулет', icon: '📿', row: 0, col: 0 },
  { key: 'helmet', name: 'Голова', icon: '🪖', row: 0, col: 1 },
  { key: 'gloves', name: 'Перчатки', icon: '🧤', row: 0, col: 2 },
  { key: 'weapon', name: 'Основное оружие', icon: '⚔️', row: 1, col: 0 },
  // row: 1, col: 1 - ПЕРСОНАЖ (заглушка)
  { key: 'shield', name: 'Щит', icon: '🛡️', row: 1, col: 2 },
  { key: 'armor', name: 'Доспехи', icon: '🦺', row: 2, col: 0 },
  // row: 2, col: 1 - ПЕРСОНАЖ (продолжение)
  { key: 'ring1', name: 'Кольцо 1', icon: '💍', row: 2, col: 2 },
  { key: 'boots', name: 'Ботинки', icon: '👢', row: 3, col: 0 },
  // row: 3, col: 1 - ПЕРСОНАЖ (продолжение)
  { key: 'ring2', name: 'Кольцо 2', icon: '💍', row: 3, col: 2 },
]

export default function EquipmentComponent({ 
  character, 
  onUpdateCharacter, 
  onEquipmentChange
}: EquipmentComponentProps) {
  const [equipment, setEquipment] = useState<EquipmentSlot[]>([])
  const [loading, setLoading] = useState(true)

  // Загрузка экипировки
  const loadEquipment = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await (supabase as any)
        .rpc('get_character_equipment', { p_character_id: character.id })

      if (error) {
        console.error('Error loading equipment:', error)
        return
      }

      console.log('Equipment data from DB:', data) // Для отладки
      console.log('Equipment data type:', typeof data, Array.isArray(data))
      if (data && data.length > 0) {
        console.log('First equipment item:', data[0])
        console.log('Equipment slots found:', data.map((eq: any) => eq.slot_type))
      }
      setEquipment(data || [])
    } catch (error) {
      console.error('Error loading equipment:', error)
    } finally {
      setLoading(false)
    }
  }, [character.id])

  useEffect(() => {
    loadEquipment()
  }, [loadEquipment])

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
        await loadEquipment()
        // Уведомляем родительский компонент об изменении
        onEquipmentChange?.()
        // Обновляем характеристики персонажа если есть функция
        if (onUpdateCharacter) {
          const updatedChar = { ...character }
          await onUpdateCharacter(updatedChar)
        }
      } else {
        toast.error(data?.error || 'Ошибка снятия предмета')
      }
    } catch (error) {
      console.error('Error unequipping item:', error)
      toast.error('Ошибка снятия предмета')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="relative">
        {/* ЕДИНАЯ СЕТКА 5x3 - персонаж в центре, слоты вокруг */}
        <div 
          className="grid grid-cols-3 gap-2"
          style={{ gridTemplateRows: 'repeat(5, 60px)' }}
        >
          {Array.from({ length: 15 }, (_, index) => {
            const row = Math.floor(index / 3)
            const col = index % 3
            const slot = equipmentLayout.find(s => s.row === row && s.col === col)
            
            // ЗАГЛУШКА ПЕРСОНАЖА В ЦЕНТРЕ (позиции 1,1 - 2,1 - 3,1)
            if ((row === 1 || row === 2 || row === 3) && col === 1) {
              if (row === 1) {
                return (
                  <div key={`character-head-${index}`} className="w-16 h-16 flex items-center justify-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-400/30 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                  </div>
                )
              }
              if (row === 2) {
                return (
                  <div key={`character-body-${index}`} className="w-16 h-16 flex items-center justify-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-400/20 rounded flex items-center justify-center">
                      <span className="text-xl text-primary-300">👕</span>
                    </div>
                  </div>
                )
              }
              if (row === 3) {
                return (
                  <div key={`character-legs-${index}`} className="w-16 h-16 flex items-center justify-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-400/20 rounded flex items-center justify-center">
                      <span className="text-lg text-primary-300">👖</span>
                    </div>
                  </div>
                )
              }
            }

            // Если нет слота - пустая ячейка
            if (!slot) {
              return <div key={`empty-${index}`} className="w-16 h-16"></div>
            }

            // СЛОТЫ ЭКИПИРОВКИ
            const equippedItem = equipment.find(eq => eq.slot_type === slot.key)
            const hasItem = !!equippedItem?.item
            
            // Отладка
            if (slot.key === 'armor') {
              console.log(`Checking slot ${slot.key}:`, {
                equipmentLength: equipment.length,
                equipmentSlots: equipment.map((eq: EquipmentSlot) => eq.slot_type),
                foundItem: equippedItem,
                hasItem
              })
            }
            
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
                      </div>
                    </div>
                  </ItemTooltip>
                ) : (
                  <div className="w-16 h-16 bg-dark-200/30 border border-dark-300/50 rounded-lg flex flex-col items-center justify-center p-1 opacity-40">
                    <div className="text-lg">{slot.icon}</div>
                    <div className="text-xs text-gray-500 mt-0.5 text-center leading-tight">
                      {slot.name.split(' ')[0]}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}