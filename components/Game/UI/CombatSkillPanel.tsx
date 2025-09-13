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
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)

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
        
        // Получаем изученные скиллы из базы данных
        const { supabase } = await import('@/lib/supabase')
        const { data, error } = await (supabase as any).rpc('get_character_learned_skills', {
          p_character_id: character.id
        })
        
        if (error) {
          console.error('Ошибка загрузки скиллов из БД:', error)
          
          // Fallback: используем хардкод скиллы
          const className = getClassNameFromCharacter(character)
          const fallbackSkill = getActiveSkillData('', className)
          
          if (fallbackSkill) {
            const learned: LearnedSkill[] = [{
              ...fallbackSkill,
              isLearned: true,
              isOnCooldown: false,
              cooldownRemaining: 0
            }]
            setLearnedSkills(learned)
          } else {
            setLearnedSkills([])
          }
          return
        }
        
        if (data && Array.isArray(data)) {
          const learned: LearnedSkill[] = data.map((skillData: any) => ({
            id: skillData.id,
            name: skillData.name,
            description: skillData.description || 'Описание недоступно',
            icon: skillData.icon || '⚔️',
            skill_type: skillData.skill_type || 'active',
            damage_type: skillData.damage_type || 'physical',
            base_damage: skillData.base_damage || 0,
            mana_cost: skillData.mana_cost || 0,
            cooldown: skillData.cooldown || 0,
            scaling_stat: skillData.scaling_stat || 'strength',
            scaling_ratio: skillData.scaling_ratio || 0,
            level_requirement: skillData.level_requirement || 1,
            class_requirements: skillData.class_requirements || [],
            cost_to_learn: skillData.cost_to_learn || 0,
            is_learned: true,
            nodes: [],
            isLearned: true,
            isOnCooldown: false,
            cooldownRemaining: 0
          }))
          setLearnedSkills(learned)
        } else {
          setLearnedSkills([])
        }
      } catch (error) {
        console.error('Ошибка загрузки скиллов:', error)
        setLearnedSkills([])
      } finally {
        setIsLoading(false)
      }
    }

    loadLearnedSkills()
  }, [character.id, character.level])

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
      setSelectedSkillId(skill.id)
      onSkillSelect(skill.id)
    }
  }

  // Обработчик выбора базовой атаки
  const handleBasicAttack = () => {
    setSelectedSkillId('basic_attack')
    onSkillSelect('basic_attack')
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

  return (
    <div className={`bg-dark-200/50 rounded-lg p-4 ${className}`}>
      <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
        <Sword className="w-5 h-5 text-yellow-400" />
        <span>Панель скиллов</span>
      </h3>
      
      {/* Сетка скиллов */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {learnedSkills.map((skill) => {
          const canUse = canUseSkill(skill)
          const isNotEnoughMana = currentMana < skill.mana_cost
          const isSelected = selectedSkillId === skill.id
          
          return (
            <div key={skill.id} className="relative group">
              <button
                onClick={() => handleSkillClick(skill)}
                disabled={!canUse}
                className={`
                  relative w-16 h-16 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center
                  ${isSelected 
                    ? 'border-green-400 bg-green-400/20' 
                    : canUse 
                      ? 'border-yellow-400/50 bg-yellow-400/10 hover:border-yellow-400 hover:bg-yellow-400/20 cursor-pointer' 
                      : 'border-gray-600/30 bg-gray-800/20 cursor-not-allowed opacity-50'
                  }
                  ${isNotEnoughMana ? 'border-red-400/30 bg-red-400/5' : ''}
                `}
              >
                {/* Иконка скилла */}
                <span className="text-2xl mb-1">{skill.icon}</span>
                
                {/* Стоимость маны */}
                {skill.mana_cost > 0 && (
                  <div className="flex items-center space-x-1 text-xs">
                    <Droplets className="w-3 h-3 text-blue-400" />
                    <span className={`font-semibold ${isNotEnoughMana ? 'text-red-400' : 'text-blue-400'}`}>
                      {skill.mana_cost}
                    </span>
                  </div>
                )}
                
                {/* Индикаторы состояния */}
                {skill.isOnCooldown && (
                  <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                    CD
                  </div>
                )}
                
                {isNotEnoughMana && (
                  <div className="absolute bottom-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                    MP
                  </div>
                )}
              </button>
              
              {/* Тултип с подробной информацией */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-64">
                <div className="text-white font-semibold text-sm mb-1">{skill.name}</div>
                <div className="text-gray-300 text-xs mb-2">{skill.description}</div>
                
                <div className="space-y-1 text-xs">
                  {skill.base_damage > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Урон:</span>
                      <span className="text-red-400 font-semibold">{skill.base_damage}</span>
                    </div>
                  )}
                  
                  {skill.mana_cost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Мана:</span>
                      <span className="text-blue-400 font-semibold">{skill.mana_cost}</span>
                    </div>
                  )}
                  
                  {skill.cooldown > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Кулдаун:</span>
                      <span className="text-gray-400">{skill.cooldown}с</span>
                    </div>
                  )}
                  
                  {skill.scaling_ratio > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Масштаб:</span>
                      <span className="text-yellow-400">{(skill.scaling_ratio * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </div>
                
                {/* Стрелка тултипа */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-600"></div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Базовая атака */}
      <div className="pt-4 border-t border-gray-600/30">
        <div className="text-center text-gray-400 text-sm mb-2">Базовая атака</div>
        <div className="flex justify-center">
          <div className="relative group">
            <button
              onClick={handleBasicAttack}
              className={`
                w-16 h-16 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center
                ${selectedSkillId === 'basic_attack' 
                  ? 'border-green-400 bg-green-400/20' 
                  : 'border-gray-500/50 bg-gray-800/20 hover:border-gray-400 hover:bg-gray-800/40'
                }
              `}
            >
              <Sword className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-400">Атака</span>
            </button>
            
            {/* Тултип для базовой атаки */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-48">
              <div className="text-white font-semibold text-sm mb-1">Базовая атака</div>
              <div className="text-gray-300 text-xs mb-2">Стандартная атака без затрат маны</div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Урон:</span>
                  <span className="text-red-400 font-semibold">100% от атаки</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Мана:</span>
                  <span className="text-green-400 font-semibold">0</span>
                </div>
              </div>
              
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-600"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Сообщение о выборе скилла */}
      <div className="mt-4 text-center">
        {selectedSkillId ? (
          <div className="text-green-400 text-sm">
            ✓ Скилл выбран: {selectedSkillId === 'basic_attack' ? 'Базовая атака' : learnedSkills.find(s => s.id === selectedSkillId)?.name}
          </div>
        ) : (
          <div className="text-yellow-400 text-sm">
            🎯 Выберите скилл для атаки
          </div>
        )}
      </div>
    </div>
  )
}