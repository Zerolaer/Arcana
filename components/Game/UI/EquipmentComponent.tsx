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
  quality?: number
  upgrade_level?: number
  equipped_at?: string
}

// Макет экипировки как на картинке - слоты вокруг большого персонажа
const equipmentSlots = [
  // Левая колонка
  { key: 'amulet', name: 'Амулет', icon: '📿', position: 'left', index: 0 },
  { key: 'weapon', name: 'Оружие', icon: '⚔️', position: 'left', index: 1 },
  { key: 'armor', name: 'Доспехи', icon: '🦺', position: 'left', index: 2 },
  { key: 'gloves', name: 'Перчатки', icon: '🧤', position: 'left', index: 3 },
  { key: 'boots', name: 'Ботинки', icon: '👢', position: 'left', index: 4 },
  
  // Правая колонка
  { key: 'helmet', name: 'Шлем', icon: '🪖', position: 'right', index: 0 },
  { key: 'shield', name: 'Щит', icon: '🛡️', position: 'right', index: 1 },
  { key: 'ring1', name: 'Кольцо 1', icon: '💍', position: 'right', index: 2 },
  { key: 'ring2', name: 'Кольцо 2', icon: '💍', position: 'right', index: 3 },
  // Пустой слот для симметрии
  { key: 'empty', name: '', icon: '', position: 'right', index: 4 },
]

// Маппинг классов по ID (временное решение)
const CLASS_NAMES: Record<string, string> = {
  // Из supabase/test_data.sql (основные классы)
  'warrior': 'Воин',
  'mage': 'Маг',
  'rogue': 'Разбойник',
  'priest': 'Жрец',
  'paladin': 'Паладин',
  'hunter': 'Охотник',
  'warlock': 'Варлок',
  'death_knight': 'Рыцарь Смерти',
  'shaman': 'Шаман',
  'monk': 'Монах',
  'druid': 'Друид',
  'bard': 'Бард',
  'ranger': 'Следопыт',
  'sorcerer': 'Чародей',
  'barbarian': 'Варвар',
  'fighter': 'Боец',
  'cleric': 'Клирик',
  'wizard': 'Волшебник',
  'thief': 'Вор',
  'knight': 'Рыцарь',
  'archer': 'Лучник',
  'assassin': 'Убийца',
  'necromancer': 'Некромант',
  'berserker': 'Берсерк'
}

// Маппинг аватарок для классов (эмодзи и изображения)
// Соответствует классам из supabase/data.sql
const CLASS_AVATARS: Record<string, { emoji: string; image?: string }> = {
  // Классы с полноценными картинками (из твоих 4 картинок)
  'Маг': { emoji: '🔮', image: '/avatars/mage.png' }, // Маг - полноценная картинка
  'Берсерк': { emoji: '🪓', image: '/avatars/berserker.png' }, // Берсерк - полноценная картинка
  'Лучник': { emoji: '🏹', image: '/avatars/archer.png' }, // Лучник - полноценная картинка
  'Убийца': { emoji: '🗡️', image: '/avatars/rogue.png' }, // Убийца (вместо Разбойника) - полноценная картинка
  
  // Остальные классы с эмодзи (пока нет картинок)
  'Воин': { emoji: '⚔️' }, // Воин - мечи
  'Паладин': { emoji: '🛡️' }, // Паладин - щит
  'Некромант': { emoji: '💀' }, // Некромант - череп
  'Друид': { emoji: '🌿' }, // Друид - листья
  'Монах': { emoji: '👊' }, // Монах - кулак
  'Варлок': { emoji: '🔥' }, // Варлок - огонь
  'Рыцарь Смерти': { emoji: '⚰️' }, // Рыцарь Смерти - гроб
  'Следопыт': { emoji: '🦅' } // Следопыт - орел
}

export default function EquipmentComponent({ 
  character, 
  onUpdateCharacter, 
  onEquipmentChange
}: EquipmentComponentProps) {
  const [equipment, setEquipment] = useState<EquipmentSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [characterClass, setCharacterClass] = useState<{ name: string; icon: string } | null>(null)

  // Загрузка информации о классе
  const loadCharacterClass = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('character_classes')
        .select('name, icon')
        .eq('id', character.class_id)
        .single()

      if (error) {
        console.error('Error loading character class:', error)
        return
      }

      if (data) {
        setCharacterClass(data)
      }
    } catch (error) {
      console.error('Error loading character class:', error)
    }
  }, [character.class_id])

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
    loadCharacterClass()
  }, [loadEquipment, loadCharacterClass])

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
        
        // Обновляем локальное состояние вместо полной перезагрузки
        setEquipment(prev => {
          const newEquipment = { ...prev }
          delete (newEquipment as any)[slotType]
          return newEquipment
        })
        
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

  // Функция для рендера слота экипировки
  const renderEquipmentSlot = (slot: typeof equipmentSlots[0]) => {
    if (slot.key === 'empty') {
      return <div className="w-16 h-16"></div>
    }

    const equippedItem = equipment.find(eq => eq.slot_type === slot.key)
    const hasItem = !!equippedItem?.item
    
    // Отладка для armor слота
    if (slot.key === 'armor') {
      console.log(`Checking slot ${slot.key}:`, {
        equipmentLength: equipment.length,
        equipmentSlots: equipment.map((eq: EquipmentSlot) => eq.slot_type),
        foundItem: equippedItem,
        hasItem
      })
    }
    
    return (
      <div key={slot.key} className="relative mb-2">
        {hasItem && equippedItem?.item ? (
          <ItemTooltip
            item={equippedItem.item}
            onUnequip={() => handleUnequipItem(slot.key)}
            onClose={() => {}} // Закрытие тултипа будет обработано в самом ItemTooltip
            showActions={true}
            isEquipped={true}
          >
            <div className="w-16 h-16 rounded-lg flex flex-col items-center justify-center p-1 cursor-pointer bg-dark-200/50 border-2 border-solid border-gold-400/60 transition-colors">
              <div className="text-lg">{equippedItem.item.icon}</div>
            </div>
          </ItemTooltip>
        ) : (
          <div className="w-16 h-16 bg-dark-200/30 border border-dark-300/50 rounded-lg flex flex-col items-center justify-center p-1 opacity-40">
            <div className="text-sm">{slot.icon}</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      {/* ОСНОВНАЯ ЭКИПИРОВКА */}
      <div className="flex items-center justify-center gap-8 mb-6">
        
        {/* ЛЕВАЯ КОЛОНКА СЛОТОВ */}
        <div className="flex flex-col items-center justify-center">
          {equipmentSlots
            .filter(slot => slot.position === 'left')
            .sort((a, b) => a.index - b.index)
            .map(slot => renderEquipmentSlot(slot))
          }
        </div>

        {/* ЦЕНТРАЛЬНЫЙ ПЕРСОНАЖ */}
        <div className="flex flex-col items-center justify-center">
          {/* Информация о персонаже */}
          <div className="text-center mb-4">
            <div className="text-white font-semibold">{character.name}</div>
            <div className="text-sm text-gray-400">Lv {character.level} {characterClass?.name || 'Загрузка...'}</div>
          </div>
          
          {/* Большая фигура персонажа */}
          <div className="relative w-48 h-64 bg-gradient-to-b from-dark-100/20 to-dark-200/40 border border-dark-300/30 rounded-lg flex items-center justify-center overflow-hidden">
            {/* Аватарка класса */}
            {(() => {
              const avatarData = CLASS_AVATARS[character.class_id]
              if (avatarData?.image) {
                // Показываем изображение если оно есть
                return (
                  <img 
                    src={avatarData.image} 
                    alt={characterClass?.name || 'Персонаж'}
                    className="w-full h-full object-cover opacity-90"
                    onError={(e) => {
                      // Если изображение не загрузилось, показываем эмодзи класса
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        const emojiDiv = document.createElement('div')
                        emojiDiv.className = 'text-8xl opacity-80 absolute inset-0 flex items-center justify-center'
                        emojiDiv.textContent = characterClass?.icon || avatarData.emoji || '👤'
                        parent.appendChild(emojiDiv)
                      }
                    }}
                  />
                )
              } else {
                // Показываем эмодзи класса из базы данных или fallback
                return (
                  <div className="text-8xl opacity-80">
                    {characterClass?.icon || avatarData?.emoji || '👤'}
                  </div>
                )
              }
            })()}
            
            {/* Дополнительная информация о классе */}
            <div className="absolute bottom-2 left-2 right-2 text-center">
              <div className="text-xs text-gray-400 bg-dark-200/50 rounded px-2 py-1">
                {characterClass?.name || 'Загрузка...'}
              </div>
            </div>
          </div>
          
          {/* Базовые характеристики под персонажем */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div className="text-center">
              <div className="text-green-400 font-semibold">{character.health}</div>
              <div className="text-gray-400">Health Points</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-semibold">{character.mana}</div>
              <div className="text-gray-400">Magic Power</div>
            </div>
            <div className="text-center">
              <div className="text-red-400 font-semibold">{character.strength + character.dexterity}</div>
              <div className="text-gray-400">Attack</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 font-semibold">{character.intelligence}</div>
              <div className="text-gray-400">Intelligence</div>
            </div>
          </div>

        </div>

        {/* ПРАВАЯ КОЛОНКА СЛОТОВ */}
        <div className="flex flex-col items-center justify-center">
          {equipmentSlots
            .filter(slot => slot.position === 'right')
            .sort((a, b) => a.index - b.index)
            .map(slot => renderEquipmentSlot(slot))
          }
        </div>
        
      </div>

      {/* ОТДЕЛЬНЫЕ ПУСТЫЕ ЯЧЕЙКИ ПОД ЭКИПИРОВКОЙ */}
      <div className="space-y-2">
        {/* Первая линия */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`line1-${index}`} className="w-12 h-12 bg-dark-200/20 border border-dashed border-dark-300/30 rounded-lg flex items-center justify-center opacity-40">
              <div className="text-dark-500 text-xs">+</div>
            </div>
          ))}
        </div>
        
        {/* Вторая линия */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={`line2-${index}`} className="w-12 h-12 bg-dark-200/20 border border-dashed border-dark-300/30 rounded-lg flex items-center justify-center opacity-40">
              <div className="text-dark-500 text-xs">+</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}