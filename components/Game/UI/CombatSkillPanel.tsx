'use client'

import { useState, useEffect } from 'react'
import { Character } from '@/types/game'
import { ActiveSkill } from '@/types/skills'
import { getActiveSkillData } from '@/lib/activeSkills'
import { Sword, Zap, Shield, Target, Clock, Droplets } from 'lucide-react'

interface CombatSkillPanelProps {
  character: Character
  onSkillSelect: (skillId: string) => void
  currentMana: number
  className?: string
}

interface LearnedSkill extends ActiveSkill {
  isLearned: boolean
  isOnCooldown: boolean
  cooldownRemaining: number
}

export default function CombatSkillPanel({ 
  character, 
  onSkillSelect, 
  currentMana,
  className = '' 
}: CombatSkillPanelProps) {
  const [learnedSkills, setLearnedSkills] = useState<LearnedSkill[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Получаем название класса персонажа
  const getClassNameFromCharacter = (character: Character): string => {
    const name = character.name?.toLowerCase() || ''
    
    if (name.includes('лучник') || name.includes('archer')) return 'archer'
    else if (name.includes('маг') || name.includes('mage')) return 'mage'
    else if (name.includes('берсерк') || name.includes('berserker')) return 'berserker'
    else if (name.includes('ассасин') || name.includes('assassin')) return 'assassin'
    
    return 'archer'
  }

  // Загружаем изученные скиллы
  useEffect(() => {
    const loadLearnedSkills = async () => {
      try {
        setIsLoading(true)
        
        // Получаем название класса
        const className = getClassNameFromCharacter(character)
        
        // Получаем все скиллы класса
        const { getAvailableSkills } = await import('@/lib/activeSkills')
        const allSkills = getAvailableSkills(className, character.level, [])
        
        // Фильтруем только изученные скиллы (уровень 1 или купленные)
        const learned = allSkills
          .filter(skill => skill.is_learned)
          .map(skill => ({
            ...skill,
            isLearned: true,
            isOnCooldown: false,
            cooldownRemaining: 0
          }))
        
        setLearnedSkills(learned)
      } catch (error) {
        console.error('Ошибка загрузки скиллов:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLearnedSkills()
  }, [character.level, character.name])

  // Получаем иконку для типа скилла
  const getSkillTypeIcon = (skillType: string) => {
    switch (skillType) {
      case 'active': return <Sword className="w-4 h-4" />
      case 'aoe': return <Target className="w-4 h-4" />
      case 'buff': return <Zap className="w-4 h-4" />
      case 'barrier': return <Shield className="w-4 h-4" />
      case 'ultimate': return <Zap className="w-4 h-4" />
      default: return <Sword className="w-4 h-4" />
    }
  }

  // Получаем цвет для типа скилла
  const getSkillTypeColor = (skillType: string) => {
    switch (skillType) {
      case 'active': return 'text-red-400'
      case 'aoe': return 'text-green-400'
      case 'buff': return 'text-blue-400'
      case 'barrier': return 'text-purple-400'
      case 'ultimate': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  // Проверяем, можно ли использовать скилл
  const canUseSkill = (skill: LearnedSkill) => {
    if (!skill.isLearned) return false
    if (skill.isOnCooldown) return false
    if (currentMana < skill.mana_cost) return false
    return true
  }

  // Обработчик выбора скилла
  const handleSkillClick = (skill: LearnedSkill) => {
    if (canUseSkill(skill)) {
      onSkillSelect(skill.id)
    }
  }

  if (isLoading) {
    return (
      <div className={`bg-dark-200/50 rounded-lg p-4 ${className}`}>
        <div className="text-center text-gray-400">
          Загрузка скиллов...
        </div>
      </div>
    )
  }

  if (learnedSkills.length === 0) {
    return (
      <div className={`bg-dark-200/50 rounded-lg p-4 ${className}`}>
        <div className="text-center text-gray-400">
          <Sword className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Нет изученных скиллов</p>
          <p className="text-sm">Изучите скиллы в панели навыков</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-dark-200/50 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
        <Sword className="w-5 h-5 text-yellow-400" />
        <span>Выберите скилл</span>
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {learnedSkills.map((skill) => {
          const canUse = canUseSkill(skill)
          const isNotEnoughMana = currentMana < skill.mana_cost
          
          return (
            <button
              key={skill.id}
              onClick={() => handleSkillClick(skill)}
              disabled={!canUse}
              className={`
                relative p-3 rounded-lg border-2 transition-all duration-200
                ${canUse 
                  ? 'border-yellow-400/50 bg-yellow-400/10 hover:border-yellow-400 hover:bg-yellow-400/20 cursor-pointer' 
                  : 'border-gray-600/30 bg-gray-800/20 cursor-not-allowed opacity-50'
                }
                ${isNotEnoughMana ? 'border-red-400/30 bg-red-400/5' : ''}
              `}
            >
              {/* Иконка скилла */}
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{skill.icon}</span>
                <div className={`${getSkillTypeColor(skill.skill_type)}`}>
                  {getSkillTypeIcon(skill.skill_type)}
                </div>
              </div>
              
              {/* Название скилла */}
              <h4 className="text-white font-semibold text-sm mb-1 truncate">
                {skill.name}
              </h4>
              
              {/* Описание */}
              <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                {skill.description}
              </p>
              
              {/* Статы скилла */}
              <div className="space-y-1">
                {/* Урон */}
                {skill.base_damage > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Урон:</span>
                    <span className="text-red-400 font-semibold">
                      {skill.base_damage}
                    </span>
                  </div>
                )}
                
                {/* Стоимость маны */}
                {skill.mana_cost > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span className={`font-semibold ${isNotEnoughMana ? 'text-red-400' : 'text-blue-400'}`}>
                      {skill.mana_cost}
                    </span>
                  </div>
                )}
                
                {/* Кулдаун */}
                {skill.cooldown > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-400">
                      {skill.cooldown}с
                    </span>
                  </div>
                )}
              </div>
              
              {/* Индикаторы состояния */}
              {skill.isOnCooldown && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  CD
                </div>
              )}
              
              {isNotEnoughMana && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  MP
                </div>
              )}
            </button>
          )
        })}
      </div>
      
      {/* Базовая атака */}
      <div className="mt-4 pt-4 border-t border-gray-600/30">
        <button
          onClick={() => onSkillSelect('basic_attack')}
          className="w-full p-3 rounded-lg border-2 border-gray-500/50 bg-gray-800/20 hover:border-gray-400 hover:bg-gray-800/40 transition-all duration-200"
        >
          <div className="flex items-center justify-center space-x-2">
            <Sword className="w-5 h-5 text-gray-400" />
            <span className="text-white font-semibold">Базовая атака</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Обычная атака без затрат маны
          </p>
        </button>
      </div>
    </div>
  )
}
