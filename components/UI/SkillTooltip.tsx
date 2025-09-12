'use client'

import { ReactNode } from 'react'
import { ActiveSkill } from '@/types/skills'

interface SkillTooltipProps {
  skill: ActiveSkill
  children?: ReactNode
  className?: string
  onActivate?: () => void
  onClose?: () => void
  isActive?: boolean
  position?: { x: number; y: number }
}

const skillTypeNames = {
  active: 'Активный',
  aoe: 'Область',
  buff: 'Усиление',
  barrier: 'Защита',
  ultimate: 'Ультимативный'
}

const damageTypeNames = {
  physical: 'Физический',
  magical: 'Магический'
}

const scalingStatNames: Record<string, string> = {
  strength: 'Сила',
  agility: 'Ловкость',
  intelligence: 'Интеллект',
  spell_power: 'Сила заклинаний',
  stealth: 'Скрытность',
  endurance: 'Выносливость'
}

export default function SkillTooltip({ 
  skill, 
  children, 
  className, 
  onActivate,
  onClose,
  isActive = false,
  position
}: SkillTooltipProps) {
  const tooltipContent = (
    <div className="skill-tooltip max-w-sm">
      {/* Header */}
      <div className="mb-3">
        <div className="text-lg font-bold text-white mb-1">
          {skill.name}
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-400 font-semibold">
            {skillTypeNames[skill.skill_type]}
          </span>
          <span className="text-gray-400">
            Ур. {skill.level_requirement}
          </span>
        </div>
        <div className="text-xs text-gray-400 capitalize mt-1">
          {damageTypeNames[skill.damage_type]} урон
        </div>
      </div>

      {/* Description */}
      {skill.description && (
        <div className="text-sm text-gray-300 mb-3 italic">
          "{skill.description}"
        </div>
      )}

      {/* Stats */}
      <div className="border-t border-white/20 pt-3 mt-3">
        <div className="text-sm font-semibold text-green-400 mb-2">Характеристики:</div>
        
        {skill.base_damage > 0 && (
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Урон:</span>
            <span className="text-white font-medium">{skill.base_damage}</span>
          </div>
        )}
        
        {skill.mana_cost > 0 && (
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Мана:</span>
            <span className="text-blue-400 font-medium">{skill.mana_cost}</span>
          </div>
        )}
        
        {skill.cooldown > 0 && (
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Перезарядка:</span>
            <span className="text-yellow-400 font-medium">{skill.cooldown}с</span>
          </div>
        )}
        
        {skill.scaling_stat && skill.scaling_ratio > 0 && (
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Масштабирование:</span>
            <span className="text-purple-400 font-medium">
              {scalingStatNames[skill.scaling_stat]} ×{skill.scaling_ratio}
            </span>
          </div>
        )}
      </div>

      {/* Action Button */}
      {onActivate && (
        <div className="border-t border-white/10 pt-3 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onActivate()
              if (onClose) onClose()
            }}
            className={`w-full px-3 py-2 text-white text-sm rounded-md transition-colors flex items-center justify-center space-x-2 ${
              isActive 
                ? 'bg-yellow-600 hover:bg-yellow-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
            style={{ pointerEvents: 'auto', zIndex: 10000 }}
          >
            <span>{isActive ? '⏸️' : '▶️'}</span>
            <span>{isActive ? 'Деактивировать' : 'Активировать'}</span>
          </button>
        </div>
      )}
    </div>
  )

  // Если есть позиция, рендерим как абсолютно позиционированный элемент
  if (position) {
    return (
      <div
        className="fixed z-50 pointer-events-none"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -100%)'
        }}
      >
        <div className="tooltip-content animate-tooltip-show">
          {tooltipContent}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {children}
    </div>
  )
}
