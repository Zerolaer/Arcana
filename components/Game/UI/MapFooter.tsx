'use client'

import { useState } from 'react'
import { Character } from '@/types/game'
import { ActiveSkill } from '@/types/skills'
import { getAvailableSkills } from '@/lib/activeSkills'
import { useActiveSkills } from '@/lib/useActiveSkills'
import { Heart, Zap, FlaskConical } from 'lucide-react'
import ItemTooltip from '../../UI/ItemTooltip'

interface MapFooterProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
}

export default function MapFooter({ character, onUpdateCharacter }: MapFooterProps) {
  const { activeSkills, toggleSkill, getActiveSkills } = useActiveSkills()
  const [hoveredSkill, setHoveredSkill] = useState<ActiveSkill | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Получаем доступные скиллы для класса
  const getClassNameById = (classId: string) => {
    const classMapping: { [key: string]: string } = {
      '1': 'archer',
      '2': 'mage', 
      '3': 'berserker',
      '4': 'assassin'
    }
    return classMapping[classId] || 'archer'
  }

  const className = getClassNameById(character.class_id)
  const availableSkills = getAvailableSkills(className, character.level)

  // Обработка активации/деактивации скилла
  const handleSkillToggle = (skillId: string) => {
    const skill = availableSkills.find(s => s.id === skillId)
    if (skill) {
      toggleSkill(skillId, skill.cooldown)
    }
  }

  // Обработка наведения на скилл
  const handleSkillHover = (skill: ActiveSkill, event: React.MouseEvent) => {
    setHoveredSkill(skill)
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    })
  }

  const handleSkillLeave = () => {
    setHoveredSkill(null)
  }

  // Расчет процентов для баров
  const healthPercent = (character.health / character.max_health) * 100
  const manaPercent = (character.mana / character.max_mana) * 100

  return (
    <div className="bg-dark-100 border border-dark-300 rounded-lg p-4">
      <div className="flex items-center justify-between">
        {/* Левая часть - Бары ХП/МП */}
        <div className="flex items-center space-x-6">
          {/* Бар ХП */}
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-400" />
            <div className="w-32 bg-dark-200 rounded-full h-3">
              <div 
                className="bg-red-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${healthPercent}%` }}
              />
            </div>
            <span className="text-white text-sm font-medium">
              {character.health}/{character.max_health}
            </span>
          </div>

          {/* Бар МП */}
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-blue-400" />
            <div className="w-32 bg-dark-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${manaPercent}%` }}
              />
            </div>
            <span className="text-white text-sm font-medium">
              {character.mana}/{character.max_mana}
            </span>
          </div>
        </div>

        {/* Центральная часть - Панель скиллов */}
        <div className="flex items-center space-x-2">
          {Array.from({ length: 6 }, (_, index) => {
            const skill = availableSkills[index]
            const isActive = skill ? activeSkills.get(skill.id)?.isActive || false : false
            const isLocked = !skill || (skill && skill.level_requirement > character.level)
            
            return (
              <div
                key={index}
                className="relative"
                onMouseEnter={skill && !isLocked ? (e) => handleSkillHover(skill, e) : undefined}
                onMouseLeave={handleSkillLeave}
              >
                <button
                  className={`
                    w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl
                    transition-all duration-200 hover:scale-105
                    ${isLocked
                      ? 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed'
                      : isActive 
                        ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400' 
                        : 'border-dark-300 bg-dark-200 hover:border-blue-400 text-white'
                    }
                  `}
                  onClick={() => skill && !isLocked && handleSkillToggle(skill.id)}
                  disabled={isLocked}
                >
                  {isLocked ? '🔒' : (skill ? skill.icon : '?')}
                </button>
                
                {/* Индикатор активности */}
                {isActive && !isLocked && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-dark-100" />
                )}
                
                {/* Индикатор уровня для заблокированных скиллов */}
                {isLocked && skill && (
                  <div className="absolute -bottom-1 -right-1 bg-gray-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {skill.level_requirement}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Правая часть - Слоты для зелий */}
        <div className="flex items-center space-x-2">
          {/* Зелье ХП */}
          <div className="w-12 h-12 rounded-lg border-2 border-dark-300 bg-dark-200 flex items-center justify-center text-2xl hover:border-red-400 transition-colors cursor-pointer">
            <FlaskConical className="w-6 h-6 text-red-400" />
          </div>
          
          {/* Зелье МП */}
          <div className="w-12 h-12 rounded-lg border-2 border-dark-300 bg-dark-200 flex items-center justify-center text-2xl hover:border-blue-400 transition-colors cursor-pointer">
            <FlaskConical className="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Тултип скилла */}
      {hoveredSkill && (
        <ItemTooltip
          item={{
            id: hoveredSkill.id,
            name: hoveredSkill.name,
            description: hoveredSkill.description,
            rarity: 'common',
            type: 'weapon',
            icon: hoveredSkill.icon,
            value: 0,
            stats: {
              damage: hoveredSkill.base_damage,
              mana_cost: hoveredSkill.mana_cost,
              cooldown: hoveredSkill.cooldown
            }
          }}
          position={tooltipPosition}
          onClose={() => setHoveredSkill(null)}
          showActivateButton={true}
          isActive={activeSkills.get(hoveredSkill.id)?.isActive || false}
          onActivate={() => handleSkillToggle(hoveredSkill.id)}
        />
      )}
    </div>
  )
}
