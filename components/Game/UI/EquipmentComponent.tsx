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
  layout?: 'character' | 'inventory' // Тип макета
}

interface EquipmentSlot {
  slotType: string
  item?: GameItem
  current_durability?: number
  upgrade_level?: number
  equipped_at?: string
}

// Единая раскладка слотов для обоих вариантов
const equipmentLayout = {
  // Макет для страницы персонажа (3x4)
  character: [
    { key: 'weapon', name: 'Основное оружие', icon: '⚔️', row: 0, col: 0 },
    { key: 'shield', name: 'Щит', icon: '🛡️', row: 0, col: 1 },
    { key: 'helmet', name: 'Голова', icon: '🪖', row: 1, col: 0 },
    { key: 'amulet', name: 'Амулет', icon: '📿', row: 1, col: 1 },
    { key: 'armor', name: 'Доспехи', icon: '🦺', row: 2, col: 0 },
    { key: 'ring1', name: 'Кольцо 1', icon: '💍', row: 2, col: 1 },
    { key: 'gloves', name: 'Перчатки', icon: '🧤', row: 3, col: 0 },
    { key: 'ring2', name: 'Кольцо 2', icon: '💍', row: 3, col: 1 },
    { key: 'boots', name: 'Ботинки', icon: '👢', row: 4, col: 0 },
    { key: 'empty', name: '', icon: '', row: 4, col: 1 }, // Пустая ячейка
  ],
  // Макет для страницы инвентаря (5x3 с персонажем в центре)
  inventory: [
    { key: 'amulet', name: 'Амулет', icon: '📿', row: 0, col: 0 },
    { key: 'helmet', name: 'Голова', icon: '🪖', row: 0, col: 1 },
    { key: 'gloves', name: 'Перчатки', icon: '🧤', row: 0, col: 2 },
    { key: 'weapon', name: 'Основное оружие', icon: '⚔️', row: 1, col: 0 },
    { key: 'shield', name: 'Щит', icon: '🛡️', row: 1, col: 2 },
    { key: 'armor', name: 'Доспехи', icon: '🦺', row: 2, col: 0 },
    { key: 'ring1', name: 'Кольцо 1', icon: '💍', row: 2, col: 2 },
    { key: 'boots', name: 'Ботинки', icon: '👢', row: 3, col: 0 },
    { key: 'ring2', name: 'Кольцо 2', icon: '💍', row: 3, col: 2 },
  ]
}

export default function EquipmentComponent({ 
  character, 
  onUpdateCharacter, 
  onEquipmentChange,
  layout = 'character' 
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

  const currentLayout = equipmentLayout[layout]
  const gridCols = layout === 'character' ? 2 : 3
  const gridRows = layout === 'character' ? 5 : 4

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
        <div 
          className={`grid grid-cols-${gridCols} gap-2`}
          style={{ gridTemplateRows: `repeat(${gridRows}, 60px)` }}
        >
          {Array.from({ length: gridCols * gridRows }, (_, index) => {
            const row = Math.floor(index / gridCols)
            const col = index % gridCols
            const slot = currentLayout.find(s => s.row === row && s.col === col)
            
            if (!slot) {
              // Для инвентарного макета - заглушка персонажа в центре
              if (layout === 'inventory') {
                if (row === 1 && col === 1) {
                  return (
                    <div key={`character-${index}`} className="w-16 h-16 flex items-center justify-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-400/30 rounded-full flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                    </div>
                  )
                }
                if (row === 2 && col === 1) {
                  return (
                    <div key={`character-body-${index}`} className="w-16 h-16 flex items-center justify-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-400/20 rounded flex items-center justify-center">
                        <span className="text-sm text-primary-300">👕</span>
                      </div>
                    </div>
                  )
                }
                if (row === 3 && col === 1) {
                  return (
                    <div key={`character-legs-${index}`} className="w-16 h-16 flex items-center justify-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500/10 to-primary-600/10 border border-primary-400/20 rounded flex items-center justify-center">
                        <span className="text-sm text-primary-300">👖</span>
                      </div>
                    </div>
                  )
                }
              }
              return <div key={`empty-${index}`} className="w-16 h-16"></div>
            }

            // Пустая ячейка
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
    </div>
  )
}
