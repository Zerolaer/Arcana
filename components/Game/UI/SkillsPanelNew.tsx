'use client'

import { useState, useEffect } from 'react'
import { Character } from '@/types/game'
import { PassiveSkill } from '@/types/skills'
import { getAvailablePassiveSkills, getLearnedPassiveSkills } from '@/lib/passiveSkills'
import { getAvailableSkills, ActiveSkill } from '@/lib/activeSkills'
import { supabase } from '@/lib/supabase'

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
  const [className, setClassName] = useState<string>('archer')

  // Загружаем навыки при изменении персонажа
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
          if (character.class_id) {
            const { data: classData } = await (supabase as any)
              .from('character_classes')
              .select('name')
              .eq('id', character.class_id)
              .single()
            
            if (classData) {
              const classMapping: { [key: string]: string } = {
                'Лучник': 'archer',
                'Маг': 'mage', 
                'Берсерк': 'berserker',
                'Ассасин': 'assassin'
              }
              
              const classNameKey = classMapping[classData.name] || 'archer'
              setClassName(classNameKey)
              const activeSkills = getAvailableSkills(classNameKey, character.level)
              setAvailableActiveSkills(activeSkills)
            }
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
      alert('Недостаточно золота!')
      return
    }

    try {
      // Вызываем SQL функцию для изучения навыка
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
        const updates = {
          gold: character.gold - data.gold_spent
        }
        
        await onUpdateCharacter(updates)
        
        // Обновляем список навыков
        const activeSkills = getAvailableSkills(className, character.level)
        setAvailableActiveSkills(activeSkills)
        
        setShowPurchaseModal(false)
        setSelectedSkill(null)
        
        alert(`Навык "${skill.name}" изучен!`)
      } else {
        alert(data.error || 'Ошибка при изучении навыка')
      }
    } catch (error) {
      console.error('Ошибка покупки навыка:', error)
      alert('Ошибка при покупке навыка')
    }
  }

  // Обработчик клика по активному навыку
  const handleActiveSkillClick = (skill: ActiveSkill) => {
    if (skill.is_learned) {
      // Навык уже изучен - показать информацию
      alert(`Навык "${skill.name}" уже изучен!`)
    } else if (skill.level_requirement <= character.level) {
      // Можно изучить - показать модал покупки
      setSelectedSkill(skill)
      setShowPurchaseModal(true)
    } else {
      // Недостаточный уровень
      alert(`Требуется ${skill.level_requirement} уровень для изучения этого навыка`)
    }
  }

  return (
    <div className="flex h-full">
      {/* Пассивные навыки - левая колонка */}
      <div className="w-1/2 p-4 border-r border-dark-300">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="mr-2">🛡️</span>
          Пассивные Навыки
        </h3>
        
        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          {availablePassiveSkills.map((skill) => (
            <div
              key={skill.id}
              className={`p-3 rounded-lg border transition-all ${
                skill.is_learned
                  ? 'bg-green-900/30 border-green-600 text-green-100'
                  : character.level >= skill.level_requirement
                  ? 'bg-blue-900/30 border-blue-600 text-blue-100'
                  : 'bg-gray-900/30 border-gray-600 text-gray-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                {/* Иконка навыка (пока заглушка) */}
                <div className="w-12 h-12 bg-dark-400 border border-dark-300 rounded flex items-center justify-center">
                  <span className="text-2xl">{skill.icon}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{skill.name}</h4>
                    <span className={`text-sm px-2 py-1 rounded ${
                      skill.is_learned
                        ? 'bg-green-600 text-white'
                        : character.level >= skill.level_requirement
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {skill.is_learned ? 'Изучен' : `Ур. ${skill.level_requirement}`}
                    </span>
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
            </div>
          ))}
        </div>
      </div>

      {/* Активные навыки - правая колонка */}
      <div className="w-1/2 p-4">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="mr-2">⚔️</span>
          Активные Навыки
        </h3>
        
        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          {availableActiveSkills.map((skill) => (
            <div
              key={skill.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                skill.is_learned
                  ? 'bg-green-900/30 border-green-600 text-green-100'
                  : character.level >= skill.level_requirement
                  ? 'bg-yellow-900/30 border-yellow-600 text-yellow-100 hover:bg-yellow-800/40'
                  : 'bg-gray-900/30 border-gray-600 text-gray-400'
              }`}
              onClick={() => handleActiveSkillClick(skill)}
            >
              <div className="flex items-center space-x-3">
                {/* Иконка навыка (пока заглушка) */}
                <div className="w-12 h-12 bg-dark-400 border border-dark-300 rounded flex items-center justify-center">
                  <span className="text-2xl">{skill.icon}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{skill.name}</h4>
                    <span className={`text-sm px-2 py-1 rounded ${
                      skill.is_learned
                        ? 'bg-green-600 text-white'
                        : character.level >= skill.level_requirement
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {skill.is_learned ? 'Изучен' : `Ур. ${skill.level_requirement}`}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-300 mt-1">{skill.description}</p>
                  
                  {/* Информация о навыке */}
                  <div className="mt-2 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Урон: {skill.base_damage}</span>
                      <span>Мана: {skill.mana_cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Перезарядка: {skill.cooldown}с</span>
                      {!skill.is_learned && skill.cost_to_learn > 0 && (
                        <span className="text-gold-400">Цена: {skill.cost_to_learn}💰</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модал покупки навыка */}
      {showPurchaseModal && selectedSkill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-100 border border-dark-300 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Изучение навыка</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-dark-400 border border-dark-300 rounded flex items-center justify-center">
                  <span className="text-3xl">{selectedSkill.icon}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">{selectedSkill.name}</h4>
                  <p className="text-sm text-gray-300">{selectedSkill.description}</p>
                </div>
              </div>
              
              <div className="bg-dark-200 p-3 rounded">
                <div className="text-sm space-y-1">
                  <div>Урон: {selectedSkill.base_damage}</div>
                  <div>Мана: {selectedSkill.mana_cost}</div>
                  <div>Перезарядка: {selectedSkill.cooldown}с</div>
                  <div>Тип: {selectedSkill.skill_type}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white">Стоимость:</span>
                <span className="text-gold-400 font-bold">{selectedSkill.cost_to_learn}💰</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white">Ваше золото:</span>
                <span className="text-gold-400 font-bold">{character.gold}💰</span>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPurchaseModal(false)
                  setSelectedSkill(null)
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => purchaseSkill(selectedSkill)}
                disabled={character.gold < selectedSkill.cost_to_learn || isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
              >
                {isLoading ? 'Покупка...' : 'Изучить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
