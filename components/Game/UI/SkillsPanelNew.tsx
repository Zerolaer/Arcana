'use client'

import { useState, useEffect } from 'react'
import { Character } from '@/types/game'
import { PassiveSkill } from '@/types/skills'
import { getAvailablePassiveSkills, getLearnedPassiveSkills } from '@/lib/passiveSkills'
import { getAvailableSkills, ActiveSkill } from '@/lib/activeSkills'
import { supabase } from '@/lib/supabase'
import { BookOpen, Sword, Sparkles, Zap, Coins } from 'lucide-react'

interface SkillsPanelNewProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
  isLoading: boolean
}

export default function SkillsPanelNew({ character, onUpdateCharacter, isLoading }: SkillsPanelNewProps) {
  const [availablePassiveSkills, setAvailablePassiveSkills] = useState<PassiveSkill[]>([])
  const [availableActiveSkills, setAvailableActiveSkills] = useState<ActiveSkill[]>([])
  const [selectedSkill, setSelectedSkill] = useState<ActiveSkill | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [className, setClassName] = useState<string>('')

  useEffect(() => {
    const loadSkills = async () => {
      try {
        // Загружаем пассивные навыки из базы данных
        const { data: passiveSkillsData, error: passiveError } = await (supabase as any)
          .rpc('get_character_passive_skills', { p_character_id: character.id })
        
        if (passiveError) {
          console.error('Ошибка загрузки пассивных навыков:', passiveError)
          // Fallback на статические данные
          const passiveSkills = getAvailablePassiveSkills(character.level)
          setAvailablePassiveSkills(passiveSkills)
        } else {
          // Преобразуем данные из БД в формат компонента
          const formattedPassiveSkills = passiveSkillsData.map((skill: any) => ({
            id: skill.skill_key,
            name: skill.name,
            description: skill.description,
            level_requirement: skill.level_requirement,
            icon: skill.icon,
            stat_bonuses: skill.stat_bonuses,
            is_learned: skill.is_learned
          }))
          setAvailablePassiveSkills(formattedPassiveSkills)
        }

        // Загружаем активные навыки из базы данных
        const { data: activeSkillsData, error: activeError } = await (supabase as any)
          .rpc('get_character_active_skills', { p_character_id: character.id })
        
        if (activeError) {
          console.error('Ошибка загрузки активных навыков:', activeError)
          // Fallback на статические данные
          const classMapping = {
            'Лучник': 'archer',
            'Маг': 'mage', 
            'Берсерк': 'berserker',
            'Ассасин': 'assassin'
          }
          
          const classNameKey = classMapping[character.class_id as keyof typeof classMapping] as keyof typeof getAvailableSkills
          if (classNameKey) {
            setClassName(classNameKey)
            const activeSkills = getAvailableSkills(classNameKey, character.level)
            setAvailableActiveSkills(activeSkills)
          }
        } else {
          // Преобразуем данные из БД в формат компонента
          const formattedActiveSkills = activeSkillsData.map((skill: any) => ({
            id: skill.skill_key,
            name: skill.name,
            description: skill.description,
            level_requirement: skill.level_requirement,
            icon: skill.icon,
            skill_type: skill.skill_type,
            damage_type: skill.damage_type,
            base_damage: skill.base_damage,
            mana_cost: skill.mana_cost,
            cooldown: skill.cooldown,
            scaling_stat: skill.scaling_stat,
            scaling_ratio: skill.scaling_ratio,
            class_requirements: [className], // Упрощенно
            cost_to_learn: skill.cost_to_learn,
            is_learned: skill.is_learned,
            nodes: []
          }))
          setAvailableActiveSkills(formattedActiveSkills)
        }
      } catch (error) {
        console.error('Ошибка загрузки навыков:', error)
      }
    }

    loadSkills()
  }, [character.level, character.class_id, character.id])

  // Покупка активного навыка
  const purchaseSkill = async (skill: ActiveSkill) => {
    if (character.gold < skill.cost_to_learn) {
      alert('Недостаточно золота для изучения навыка!')
      return
    }

    try {
      const { data, error } = await (supabase as any)
        .rpc('learn_active_skill', { 
          p_character_id: character.id, 
          p_skill_key: skill.id 
        })

      if (error) {
        throw error
      }

      if (data.success) {
        // Обновляем золото персонажа
        await onUpdateCharacter({ 
          gold: character.gold - data.gold_spent 
        })
        
        // Перезагружаем навыки
        const loadSkills = async () => {
          const { data: activeSkillsData } = await (supabase as any)
            .rpc('get_character_active_skills', { p_character_id: character.id })
          
          if (activeSkillsData) {
            const formattedActiveSkills = activeSkillsData.map((skill: any) => ({
              id: skill.skill_key,
              name: skill.name,
              description: skill.description,
              level_requirement: skill.level_requirement,
              icon: skill.icon,
              skill_type: skill.skill_type,
              damage_type: skill.damage_type,
              base_damage: skill.base_damage,
              mana_cost: skill.mana_cost,
              cooldown: skill.cooldown,
              scaling_stat: skill.scaling_stat,
              scaling_ratio: skill.scaling_ratio,
              class_requirements: [className],
              cost_to_learn: skill.cost_to_learn,
              is_learned: skill.is_learned,
              nodes: []
            }))
            setAvailableActiveSkills(formattedActiveSkills)
          }
        }
        
        loadSkills()
        setShowPurchaseModal(false)
        alert(`Навык "${skill.name}" изучен!`)
      } else {
        alert(data.error || 'Ошибка при изучении навыка')
      }
    } catch (error) {
      console.error('Ошибка при покупке навыка:', error)
      alert('Ошибка при изучении навыка')
    }
  }

  // Обработчик клика по активному навыку
  const handleSkillClick = (skill: ActiveSkill) => {
    if (skill.is_learned) {
      alert(`Навык "${skill.name}" уже изучен!`)
    } else if (skill.level_requirement <= character.level) {
      setSelectedSkill(skill)
      setShowPurchaseModal(true)
    } else {
      alert(`Требуется ${skill.level_requirement} уровень для изучения этого навыка`)
    }
  }

  return (
    <div className="flex-1 game-content p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <span>Навыки</span>
          </h1>
          <p className="text-gray-400 mt-1">Развитие способностей и боевых техник</p>
        </div>
        
        {/* Skills Stats */}
        <div className="text-right">
          <div className="text-sm text-gray-400">Изучено навыков:</div>
          <div className="text-xl font-bold text-white">
            {availablePassiveSkills.filter(s => s.is_learned).length + availableActiveSkills.filter(s => s.is_learned).length}
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        
        {/* Пассивные навыки */}
        <div className="game-panel p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span>Пассивные навыки</span>
            </h2>
            <p className="text-gray-400 text-sm">Автоматически изучаются по достижению уровня</p>
          </div>
          
          <div className="h-[calc(100%-80px)] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {availablePassiveSkills.map((skill) => (
                <div 
                  key={skill.id}
                  className={`skill-card ${skill.is_learned ? 'skill-card--learned' : 'skill-card--locked'}`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📦</div>
                    <div className="text-sm font-semibold text-white mb-1">
                      {skill.name}
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      Уровень {skill.level_requirement}
                    </div>
                    
                    <p className="text-sm text-gray-300 mt-1">{skill.description}</p>
                    
                    {/* Бонусы статов */}
                    <div className="mt-2 text-xs">
                      {skill.stat_bonuses && Object.entries(skill.stat_bonuses).map(([stat, value]) => (
                        value && value > 0 ? (
                          <span key={stat} className="mr-2 text-green-400">
                            +{value} {stat}
                          </span>
                        ) : null
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Активные навыки */}
        <div className="game-panel p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sword className="w-5 h-5 text-yellow-400" />
              <span>Активные навыки</span>
            </h2>
            <p className="text-gray-400 text-sm">Изучаются за золото по достижению уровня</p>
          </div>
          
          <div className="h-[calc(100%-80px)] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              {availableActiveSkills.map((skill) => (
                <div 
                  key={skill.id}
                  className={`skill-card ${skill.is_learned ? 'skill-card--learned' : 'skill-card--locked'}`}
                  onClick={() => handleSkillClick(skill)}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📦</div>
                    <div className="text-sm font-semibold text-white mb-1">
                      {skill.name}
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      Уровень {skill.level_requirement}
                    </div>
                    
                    <p className="text-sm text-gray-300 mt-1">{skill.description}</p>
                    
                    {/* Информация о навыке */}
                    <div className="mt-2 text-xs space-y-1">
                      <div className="text-blue-400">
                        Урон: {skill.base_damage}
                      </div>
                      <div className="text-purple-400">
                        Манна: {skill.mana_cost}
                      </div>
                      <div className="text-yellow-400">
                        Кулдаун: {skill.cooldown}с
                      </div>
                    </div>
                    
                    {/* Стоимость изучения */}
                    {!skill.is_learned && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <div className="text-xs text-yellow-400 flex items-center justify-center space-x-1">
                          <span>💰</span>
                          <span>{skill.cost_to_learn} золота</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно покупки навыка */}
      {showPurchaseModal && selectedSkill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="game-panel p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              Изучить навык "{selectedSkill.name}"
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-300 mb-2">{selectedSkill.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-blue-400">
                    Урон: {selectedSkill.base_damage}
                  </div>
                  <div className="text-purple-400">
                    Манна: {selectedSkill.mana_cost}
                  </div>
                  <div className="text-yellow-400">
                    Кулдаун: {selectedSkill.cooldown}с
                  </div>
                  <div className="text-green-400">
                    Тип: {selectedSkill.skill_type}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="text-yellow-400 flex items-center space-x-2">
                  <Coins className="w-4 h-4" />
                  <span>{selectedSkill.cost_to_learn} золота</span>
                </div>
                
                <div className="flex space-x-3">
                  <button 
                    className="game-button game-button--secondary"
                    onClick={() => setShowPurchaseModal(false)}
                  >
                    Отмена
                  </button>
                  <button 
                    className="game-button"
                    onClick={() => purchaseSkill(selectedSkill)}
                  >
                    Изучить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}