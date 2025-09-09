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
  level: number
  stats: ItemStats
  value: number
  stackable?: boolean
  stackSize?: number
  durability?: {
    current: number
    max: number
  }
  setBonus?: string
  requirements?: {
    level?: number
    class?: string
    stats?: ItemStats
  }
  equipment_slot?: string
  slot_position?: number
  item_key?: string
  isEquipped?: boolean
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

  const renderRequirements = () => {
    if (!item.requirements) return null

    return (
      <div className="border-t border-white/20 pt-3 mt-3">
        <div className="text-sm font-semibold text-yellow-400 mb-2">Требования:</div>
        {item.requirements.level && (
          <div className="text-sm text-gray-300">
            Уровень: {item.requirements.level}
          </div>
        )}
        {item.requirements.class && (
          <div className="text-sm text-gray-300">
            Класс: {item.requirements.class}
          </div>
        )}
      </div>
    )
  }

  const renderDurability = () => {
    if (!item.durability) return null

    const percentage = (item.durability.current / item.durability.max) * 100
    const durabilityColor = percentage > 50 ? 'text-green-400' : percentage > 25 ? 'text-yellow-400' : 'text-red-400'

    return (
      <div className="border-t border-white/20 pt-3 mt-3">
        <div className="text-sm">
          <span className="text-gray-300">Прочность: </span>
          <span className={durabilityColor}>
            {item.durability.current}/{item.durability.max}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
          <div 
            className={`h-1 rounded-full transition-all duration-300 ${
              percentage > 50 ? 'bg-green-400' : percentage > 25 ? 'bg-yellow-400' : 'bg-red-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
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

      {/* Set Bonus */}
      {item.setBonus && (
        <div className="border-t border-white/20 pt-3 mt-3">
          <div className="text-sm font-semibold text-purple-400 mb-1">Сет-бонус:</div>
          <div className="text-sm text-purple-300">{item.setBonus}</div>
        </div>
      )}

      {/* Requirements */}
      {renderRequirements()}

      {/* Durability */}
      {renderDurability()}

      {/* Value */}
      <div className="border-t border-white/20 pt-3 mt-3 flex items-center justify-between">
        <span className="text-sm text-gray-400">Стоимость:</span>
        <div className="flex items-center space-x-1">
          <span className="text-yellow-400 font-semibold">{item.value}</span>
          <span className="text-yellow-400">🪙</span>
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
            {!isEquipped && ((item.equipment_slot || (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory')) && item.type !== 'consumable' && item.type !== 'material') && onEquip && (
              <button
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
              >
                <span>⚔️</span>
                <span>Надеть</span>
              </button>
            )}
            
            {/* Кнопка "Снять" - только для экипированных предметов */}
            {isEquipped && onUnequip && (
              <button
                onClick={(e) => {
                  console.log('🔍 Unequip button clicked for item:', item.name)
                  e.stopPropagation()
                  onUnequip()
                }}
                className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors flex items-center justify-center space-x-2"
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
