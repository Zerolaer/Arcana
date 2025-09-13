'use client'

import { useState, useEffect } from 'react'
import { Character } from '@/types/game'
import { ActiveSkill } from '@/types/skills'
import { getActiveSkillData } from '@/lib/activeSkills'
import { supabase } from '@/lib/supabase'
import { Sword, Zap, Shield, Target, Clock, Droplets, Lock } from 'lucide-react'

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
        const { data, error } = await (supabase as any).rpc('get_character_learned_skills', {
          p_character_id: character.id
        })

        if (error) {
          console.error('Ошибка загрузки скиллов:', error)
          return
        }

        if (data && data.length > 0) {
          const skills: LearnedSkill[] = data.map((skill: any) => ({
            id: skill.id,
            name: skill.name,
            description: skill.description,
            icon: skill.icon,
            skill_type: skill.skill_type,
            base_damage: skill.base_damage,
            mana_cost: skill.mana_cost,
            cooldown: skill.cooldown,
            scaling_ratio: skill.scaling_ratio,
            level_requirement: skill.level_requirement,
            class_requirement: skill.class_requirement,
            damage_type: skill.damage_type,
            scaling_stat: skill.scaling_stat,
            cost_to_learn: skill.cost_to_learn,
            is_learned: true,
            isLearned: true,
            isOnCooldown: false,
            cooldownRemaining: 0,
            nodes: skill.nodes || []
          }))
          
          setLearnedSkills(skills)
        } else {
          // Если нет изученных скиллов, показываем пустые ячейки
          setLearnedSkills([])
        }
      } catch (error) {
        console.error('Ошибка загрузки скиллов:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLearnedSkills()
  }, [character.id])

  // Обработчик выбора скилла
  const handleSkillClick = (skillId: string) => {
    setSelectedSkillId(skillId)
    onSkillSelect(skillId)
  }

  // Создаем массив из 6 ячеек (изученные скиллы + пустые ячейки)
  const createSkillSlots = () => {
    const slots: (LearnedSkill | null)[] = []
    
    // Добавляем изученные скиллы
    for (let i = 0; i < 6; i++) {
      if (i < learnedSkills.length) {
        slots.push(learnedSkills[i])
      } else {
        slots.push(null)
      }
    }
    
    return slots
  }

  const skillSlots = createSkillSlots()

  if (isLoading) {
    return (
      <div className={`bg-dark-200/50 rounded-lg p-4 ${className}`}>
        <div className="text-white font-semibold mb-3">⚔️ Панель скиллов</div>
        <div className="text-gray-400 text-center py-8">Загрузка скиллов...</div>
      </div>
    )
  }

  return (
    <div className={`bg-dark-200/50 rounded-lg p-4 ${className}`}>
      <div className="text-white font-semibold mb-3">⚔️ Панель скиллов</div>
      
      {/* Сетка 2x3 для 6 ячеек скиллов */}
      <div className="grid grid-cols-3 gap-3">
        {skillSlots.map((skill, index) => (
          <div
            key={index}
            className={`
              relative w-16 h-16 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all duration-200
              ${skill 
                ? selectedSkillId === skill.id
                  ? 'border-yellow-400 bg-yellow-400/20' 
                  : currentMana >= skill.mana_cost
                    ? 'border-gray-500 bg-gray-700/50 hover:border-gray-400 hover:bg-gray-600/50'
                    : 'border-red-400 bg-red-400/10 opacity-50 cursor-not-allowed'
                : 'border-gray-600 bg-gray-800/50 cursor-not-allowed'
              }
            `}
            onClick={() => skill && currentMana >= skill.mana_cost && handleSkillClick(skill.id)}
            title={skill ? `${skill.name}\n${skill.description}\nУрон: ${skill.base_damage}\nМана: ${skill.mana_cost}\nПерезарядка: ${skill.cooldown}с` : 'Пустая ячейка'}
          >
            {skill ? (
              <>
                {/* Иконка скилла */}
                <div className="text-2xl">{skill.icon}</div>
                
                {/* Индикатор маны */}
                {skill.mana_cost > 0 && (
                  <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1 rounded">
                    {skill.mana_cost}
                  </div>
                )}
                
                {/* Индикатор перезарядки */}
                {skill.cooldown > 0 && (
                  <div className="absolute bottom-1 right-1 bg-orange-600 text-white text-xs px-1 rounded">
                    {skill.cooldown}с
                  </div>
                )}
              </>
            ) : (
              <Lock className="w-6 h-6 text-gray-500" />
            )}
          </div>
        ))}
      </div>
      
      {/* Базовая атака */}
      <div className="mt-4 pt-4 border-t border-dark-300/50">
        <div className="text-gray-400 text-sm mb-2">Базовая атака</div>
        <div
          className={`
            relative w-full h-12 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all duration-200
            ${selectedSkillId === 'basic_attack'
              ? 'border-yellow-400 bg-yellow-400/20' 
              : 'border-green-400 bg-green-400/10 hover:border-green-300 hover:bg-green-400/20'
            }
          `}
          onClick={() => handleSkillClick('basic_attack')}
          title="Базовая атака\nУрон: 100%\nМана: 0\nПерезарядка: 0с"
        >
          <Sword className="w-6 h-6 text-green-400 mr-2" />
          <span className="text-green-400 font-semibold">Базовая атака</span>
        </div>
      </div>
    </div>
  )
}