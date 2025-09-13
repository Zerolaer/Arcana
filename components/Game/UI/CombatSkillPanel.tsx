'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Character } from '@/types/game'
import { ActiveSkill } from '@/types/skills'
import { getActiveSkillData } from '@/lib/activeSkills'
import { supabase } from '@/lib/supabase'
import { Sword, Zap, Shield, Target, Clock, Droplets, Lock } from 'lucide-react'

interface CombatSkillPanelProps {
  character: Character
  onSkillSelect: (skillId: string, skillData?: LearnedSkill) => void
  currentMana: number
  className?: string
  onSkillUsed?: (skillId: string) => void
}

interface LearnedSkill extends ActiveSkill {
  isLearned: boolean
  isOnCooldown: boolean
  cooldownRemaining: number
}

const CombatSkillPanel = forwardRef<any, CombatSkillPanelProps>(({ 
  character, 
  onSkillSelect, 
  currentMana,
  className = '',
  onSkillUsed
}, ref) => {
  const [learnedSkills, setLearnedSkills] = useState<LearnedSkill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({})

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
    const skill = skillSlots.find(s => s?.id === skillId)
    if (!skill) return

    // Проверяем кулдаун
    if (skillCooldowns[skillId] > 0) {
      alert('Скилл на кулдауне!')
      return
    }

    // Проверяем ману
    if (skill.mana_cost > currentMana) {
      alert('Недостаточно маны!')
      return
    }

    setSelectedSkillId(skillId)
    onSkillSelect(skillId, skill)
  }

  // Функция для запуска кулдауна скилла
  const startCooldown = (skillId: string, cooldown: number) => {
    setSkillCooldowns(prev => ({
      ...prev,
      [skillId]: cooldown
    }))
  }

  // Обновляем кулдауны каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      setSkillCooldowns(prev => {
        const newCooldowns = { ...prev }
        let hasChanges = false
        
        Object.keys(newCooldowns).forEach(skillId => {
          if (newCooldowns[skillId] > 0) {
            newCooldowns[skillId]--
            hasChanges = true
          }
        })
        
        return hasChanges ? newCooldowns : prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Экспортируем функцию для родительского компонента
  useImperativeHandle(ref, () => ({
    startCooldown
  }), [])

  // Создаем массив из 6 ячеек (базовая атака + изученные скиллы + пустые ячейки)
  const createSkillSlots = () => {
    const slots: (LearnedSkill | null)[] = []
    
    // Первая ячейка - базовая атака
    const basicAttack: LearnedSkill = {
      id: 'basic_attack',
      name: 'Базовая атака',
      description: 'Обычная атака без дополнительных эффектов',
      icon: '⚔️',
      skill_type: 'active',
      base_damage: 1.0,
      mana_cost: 0,
      cooldown: 0,
      scaling_ratio: 1.0,
      level_requirement: 1,
      class_requirements: ['all'],
      damage_type: 'physical',
      scaling_stat: 'strength',
      cost_to_learn: 0,
      is_learned: true,
      isLearned: true,
      isOnCooldown: false,
      cooldownRemaining: 0,
      nodes: []
    }
    slots.push(basicAttack)
    
    // Добавляем изученные скиллы
    for (let i = 1; i < 6; i++) {
      if (i - 1 < learnedSkills.length) {
        slots.push(learnedSkills[i - 1])
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
      
      {/* Сетка 1x6 для 6 ячеек скиллов в одну строчку */}
      <div className="grid grid-cols-6 gap-3">
        {skillSlots.map((skill, index) => (
          <div
            key={index}
            className={`
              relative w-16 h-16 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all duration-200
              ${skill 
                ? selectedSkillId === skill.id
                  ? 'border-yellow-400 bg-yellow-400/20' 
                  : skillCooldowns[skill.id] > 0
                    ? 'border-gray-600 bg-gray-800/50 opacity-50 cursor-not-allowed'
                    : currentMana >= skill.mana_cost || skill.mana_cost === 0
                      ? 'border-gray-500 bg-gray-700/50 hover:border-gray-400 hover:bg-gray-600/50'
                      : 'border-red-400 bg-red-400/10 opacity-50 cursor-not-allowed'
                : 'border-gray-600 bg-gray-800/50 cursor-not-allowed'
              }
            `}
            onClick={() => skill && (currentMana >= skill.mana_cost || skill.mana_cost === 0) && handleSkillClick(skill.id)}
            title={skill ? `${skill.name}\n${skill.description}\nУрон: ${skill.base_damage}\nМана: ${skill.mana_cost}\nПерезарядка: ${skill.cooldown}с` : 'Пустая ячейка'}
          >
            {skill ? (
              <>
                {/* Иконка скилла */}
                <div className={`text-2xl ${skillCooldowns[skill.id] > 0 ? 'opacity-30' : ''}`}>
                  {skill.icon}
                </div>
                
                {/* Кулдаун оверлей */}
                {skillCooldowns[skill.id] > 0 && (
                  <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
                    <div className="text-white font-bold text-lg">
                      {skillCooldowns[skill.id]}
                    </div>
                  </div>
                )}
                
                {/* Индикатор маны */}
                {skill.mana_cost > 0 && skillCooldowns[skill.id] === 0 && (
                  <div className="absolute top-1 right-1 bg-blue-600 text-white text-xs px-1 rounded">
                    {skill.mana_cost}
                  </div>
                )}
                
                {/* Индикатор перезарядки (только если не на кулдауне) */}
                {skill.cooldown > 0 && skillCooldowns[skill.id] === 0 && (
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
    </div>
  )
})

CombatSkillPanel.displayName = 'CombatSkillPanel'

export default CombatSkillPanel