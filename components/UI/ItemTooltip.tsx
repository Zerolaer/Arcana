'use client'

import { ReactNode } from 'react'
import Tooltip from './Tooltip'

export interface ItemStats {
  damage?: number
  defense?: number
  health?: number
  mana?: number
  critChance?: number
  critDamage?: number
  speed?: number
  [key: string]: number | undefined
}

export interface GameItem {
  id: string
  name: string
  description: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'
  type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material'
  subType?: string
  icon: string
  level?: number
  stats: ItemStats
  value: number
  stackable?: boolean
  stackSize?: number
  
  // НОВАЯ СИСТЕМА КАЧЕСТВА (вместо прочности)
  quality?: number // 1-100
  
  // Базовые и актуальные статы
  base_stats?: ItemStats
  actual_stats?: ItemStats
  
  setBonus?: string
  equipment_slot?: string
  slot_position?: number
  item_key?: string
  isEquipped?: boolean
  
  // Убираем requirements (по требованию пользователя)
  // requirements?: { ... }
}

interface ItemTooltipProps {
  item: GameItem
  children: ReactNode
  className?: string
  onUse?: () => void
  onEquip?: () => void
  onUnequip?: () => void
  showActions?: boolean
  isEquipped?: boolean
}

const rarityColors = {
  common: '#9ca3af',      // Gray
  uncommon: '#10b981',    // Green  
  rare: '#3b82f6',        // Blue
  epic: '#8b5cf6',        // Purple
  legendary: '#f59e0b',   // Gold
  mythic: '#ef4444'       // Red
}

const rarityNames = {
  common: 'Обычный',
  uncommon: 'Необычный',
  rare: 'Редкий', 
  epic: 'Эпический',
  legendary: 'Легендарный',
  mythic: 'Мифический'
}

const statNames: Record<string, string> = {
  damage: 'Урон',
  defense: 'Защита',
  health: 'Здоровье',
  mana: 'Мана',
  critChance: 'Шанс крита',
  critDamage: 'Урон крита',
  speed: 'Скорость'
}

export default function ItemTooltip({ 
  item, 
  children, 
  className, 
  onUse, 
  onEquip, 
  onUnequip, 
  showActions = false,
  isEquipped = false
}: ItemTooltipProps) {
  const renderStats = () => {
    if (!item.stats || typeof item.stats !== 'object') return null
    
    const stats = Object.entries(item.stats).filter(([_, value]) => value && value > 0)
    
    if (stats.length === 0) return null

    return (
      <div className="border-t border-white/20 pt-3 mt-3">
        <div className="text-sm font-semibold text-green-400 mb-2">Характеристики:</div>
        {stats.map(([key, value]) => (
          <div key={key} className="flex justify-between text-sm">
            <span className="text-gray-300">{statNames[key] || key}:</span>
            <span className="text-white font-medium">
              {key.includes('Chance') || key.includes('Speed') ? `${value}%` : `+${value}`}
            </span>
          </div>
        ))}
      </div>
    )
  }

  const renderQuality = () => {
    if (!item.quality) return null

    const qualityColor = item.quality >= 80 ? 'text-green-400' : 
                        item.quality >= 60 ? 'text-blue-400' : 
                        item.quality >= 40 ? 'text-yellow-400' : 
                        item.quality >= 20 ? 'text-orange-400' : 'text-red-400'

    const qualityBgColor = item.quality >= 80 ? 'bg-green-400' : 
                          item.quality >= 60 ? 'bg-blue-400' : 
                          item.quality >= 40 ? 'bg-yellow-400' : 
                          item.quality >= 20 ? 'bg-orange-400' : 'bg-red-400'

    const qualityName = item.quality >= 90 ? 'Превосходное' :
                       item.quality >= 80 ? 'Отличное' :
                       item.quality >= 60 ? 'Хорошее' :
                       item.quality >= 40 ? 'Среднее' :
                       item.quality >= 20 ? 'Плохое' : 'Ужасное'

    return (
      <div className="border-t border-white/20 pt-3 mt-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-300">Качество:</span>
          <div className="flex items-center space-x-2">
            <span className={qualityColor}>{qualityName}</span>
            <span className={qualityColor + ' font-bold'}>{item.quality}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${qualityBgColor}`}
            style={{ width: `${item.quality}%` }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Влияет на статы предмета
        </div>
      </div>
    )
  }

  const tooltipContent = (
    <div className="item-tooltip max-w-sm">
      {/* Header */}
      <div className="mb-3">
        <div 
          className="text-lg font-bold mb-1"
          style={{ color: rarityColors[item.rarity] }}
        >
          {item.name}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span 
            className="font-semibold"
            style={{ color: rarityColors[item.rarity] }}
          >
            {rarityNames[item.rarity]}
          </span>
          <span className="text-gray-400">
            Ур. {item.level}
          </span>
        </div>
        <div className="text-xs text-gray-400 capitalize mt-1">
          {item.subType || item.type}
        </div>
      </div>

      {/* Description */}
      {item.description && (
        <div className="text-sm text-gray-300 mb-3 italic">
          "{item.description}"
        </div>
      )}

      {/* Stats */}
      {renderStats()}

      {/* Quality */}
      {renderQuality()}

      {/* Set Bonus */}
      {item.setBonus && (
        <div className="border-t border-white/20 pt-3 mt-3">
          <div className="text-sm font-semibold text-purple-400 mb-1">Сет-бонус:</div>
          <div className="text-sm text-purple-300">{item.setBonus}</div>
        </div>
      )}

      {/* Value and Actions */}
      <div className="border-t border-white/20 pt-3 mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Стоимость:</span>
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400 font-semibold">{item.value}</span>
            <span className="text-yellow-400">🪙</span>
          </div>
        </div>
        <div className="text-xs text-gray-400">
          💰 Можно продать • ⚡ Можно разобрать на осколки
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="border-t border-white/10 pt-3 mt-3">
          <div className="flex flex-col space-y-2">
            {item.type === 'consumable' && onUse && (
              <button
                onClick={(e) => {
                  console.log('🚨 Use button clicked!')
                  e.stopPropagation()
                  onUse()
                }}
                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                <span>🧪</span>
                <span>Использовать</span>
              </button>
            )}
            
            {/* Кнопка "Надеть" - только для неэкипированных предметов */}
            {(() => {
              console.log('🔍 RENDERING EQUIP BUTTON FOR:', item.name, {
                isEquipped,
                equipment_slot: item.equipment_slot,
                type: item.type,
                onEquip: !!onEquip
              })
              return !(isEquipped || item.isEquipped) && (item.equipment_slot || item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') && item.type !== 'consumable' && item.type !== 'material' && onEquip
            })() && (
              <button
                onMouseDown={(e) => {
                  console.log('🚨🚨🚨 EQUIP BUTTON MOUSE DOWN!', item.name)
                  e.stopPropagation()
                }}
                onClick={(e) => {
                  console.log('🚨🚨🚨 EQUIP BUTTON CLICKED!', item.name, 'type:', item.type, 'equipment_slot:', item.equipment_slot)
                  console.log('🚨🚨🚨 onEquip function:', onEquip)
                  e.stopPropagation()
                  e.preventDefault()
                  if (onEquip) {
                    console.log('🚨🚨🚨 Calling onEquip function')
                    onEquip()
                  } else {
                    console.log('🚨🚨🚨 onEquip is null/undefined')
                  }
                }}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors flex items-center justify-center space-x-2"
                style={{ pointerEvents: 'auto', zIndex: 10000 }}
              >
                <span>⚔️</span>
                <span>Надеть</span>
              </button>
            )}
            
            {/* Кнопка "Снять" - ЖЕЛЕЗОБЕТОННЫЙ ВАРИАНТ */}
            {(isEquipped || item.isEquipped) && (
              <button
                onMouseDown={(e) => {
                  console.log('🚨🚨🚨 UNEQUIP BUTTON MOUSE DOWN!', item.name)
                  e.stopPropagation()
                }}
                onClick={(e) => {
                  console.log('🚨🚨🚨 UNEQUIP BUTTON CLICKED!', item.name)
                  e.stopPropagation()
                  e.preventDefault()
                  if (onUnequip) {
                    console.log('🚨🚨🚨 Calling onUnequip function')
                    onUnequip()
                  } else {
                    console.log('🚨🚨🚨 onUnequip is null/undefined')
                  }
                }}
                className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors flex items-center justify-center space-x-2"
                style={{ pointerEvents: 'auto', zIndex: 10000 }}
              >
                <span>👕</span>
                <span>Снять</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <Tooltip 
      content={tooltipContent} 
      className={className}
      trigger="click"
    >
      {children}
    </Tooltip>
  )
}
