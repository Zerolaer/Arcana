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
  onUpdateCharacter: (updates: Partial<Character>, silent?: boolean) => Promise<boolean>
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
        console.log('Загружаем навыки для персонажа:', character.id, 'уровень:', character.level, 'класс:', character.class_id)
        
        // Временно используем только статические данные для отладки
        console.log('Используем статические данные навыков')
        
        // Пассивные навыки
        const passiveSkills = getAvailablePassiveSkills(character.level)
        console.log('Пассивные навыки:', passiveSkills)
        setAvailablePassiveSkills(passiveSkills)
        
        // Активные навыки - загружаем название класса по UUID
        try {
          const { data: classData, error: classError } = await (supabase as any)
            .from('character_classes')
            .select('name')
            .eq('id', character.class_id)
            .single()
          
          if (classError) {
            console.error('Ошибка загрузки класса:', classError)
          } else if (classData) {
            console.log('Название класса:', classData.name)
            
            const classMapping = {
              'Лучник': 'archer',
              'Маг': 'mage', 
              'Берсерк': 'berserker',
              'Ассасин': 'assassin'
            }
            
            const classNameKey = classMapping[classData.name as keyof typeof classMapping] as keyof typeof getAvailableSkills
            console.log('Ключ класса:', classNameKey)
            
            if (classNameKey) {
              setClassName(classNameKey)
              const activeSkills = getAvailableSkills(classNameKey, character.level)
              console.log('Активные навыки:', activeSkills)
              console.log('Количество активных навыков:', activeSkills.length)
              setAvailableActiveSkills(activeSkills)
            } else {
              console.error('Не найден ключ класса для:', classData.name)
              console.log('Доступные ключи:', Object.keys(classMapping))
            }
          }
        } catch (error) {
          console.error('Ошибка при загрузке класса:', error)
        }
        
        // Загружаем пассивные навыки из базы данных
        const { data: passiveSkillsData, error: passiveError } = await (supabase as any)
          .rpc('get_character_passive_skills', { p_character_id: character.id })
        
        if (passiveError) {
          console.error('Ошибка загрузки пассивных навыков:', passiveError)
          // Fallback на статические данные
          const passiveSkills = getAvailablePassiveSkills(character.level)
          setAvailablePassiveSkills(passiveSkills)
        } else {
          console.log('Пассивные навыки из БД:', passiveSkillsData)
          // Преобразуем данные из БД в формат компонента
          const formattedPassiveSkills = passiveSkillsData.map((skill: any) => ({
            id: skill.skill_key,
            name: skill.name,
            description: skill.description,
            level_requirement: skill.level_requirement,
            icon: '⭐',
            stat_bonuses: {},
            is_learned: skill.is_learned
          }))
          setAvailablePassiveSkills(formattedPassiveSkills)
        }

        // Загружаем активные навыки из базы данных (только для класса персонажа)
        const { data: activeSkillsData, error: activeError } = await (supabase as any)
          .rpc('get_character_class_skills', { p_character_id: character.id })
        
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
          console.log('Активные навыки из БД:', activeSkillsData)
          
          // Преобразуем данные из БД в формат компонента
          const formattedActiveSkills = activeSkillsData.map((skill: any) => ({
            id: skill.skill_key,
            name: skill.name,
            description: skill.description,
            level_requirement: skill.level_requirement,
            icon: '⚔️',
            skill_type: 'attack',
            damage_type: 'physical',
            base_damage: 0,
            mana_cost: 0,
            cooldown: 0,
            scaling_stat: 'strength' as const,
            scaling_ratio: 1.0,
            class_requirements: [className],
            cost_to_learn: skill.cost_to_learn,
            is_learned: skill.is_learned,
            nodes: []
          }))
          
          console.log('Форматированные активные навыки:', formattedActiveSkills)
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
      // Обновляем золото персонажа (тихо, без показа "Обновление")
      await onUpdateCharacter({ 
        gold: character.gold - skill.cost_to_learn 
      }, true) // silent = true
      
      // Обновляем локальное состояние навыков
      setAvailableActiveSkills(prevSkills => 
        prevSkills.map(s => 
          s.id === skill.id 
            ? { ...s, is_learned: true }
            : s
        )
      )
      
      setShowPurchaseModal(false)
      alert(`Навык "${skill.name}" изучен!`)
      
      // Сохраняем в БД
      const { data, error } = await (supabase as any)
        .rpc('learn_active_skill', { 
          p_character_id: character.id, 
          p_skill_key: skill.id 
        })

      if (error) {
        console.error('Ошибка при изучении навыка:', error)
        alert('Ошибка при изучении навыка: ' + error.message)
        return
      }

      console.log('Результат изучения навыка:', data)

      if (data && data.success) {
        // Навык успешно изучен в БД
        console.log('Навык успешно изучен в базе данных:', data.skill_learned)
        
        if (data.already_learned) {
          console.log('Навык уже был изучен ранее')
        }
        
        // Перезагружаем навыки из БД (только для класса персонажа)
        const { data: skillsData } = await (supabase as any)
          .rpc('get_character_class_skills', { p_character_id: character.id })
        
        if (skillsData) {
          const formattedSkills = skillsData.map((skillData: any) => ({
            id: skillData.skill_key,
            name: skillData.name,
            description: skillData.description,
            level_requirement: skillData.level_requirement,
            icon: '⚔️',
            skill_type: 'attack',
            damage_type: 'physical',
            base_damage: 0,
            mana_cost: 0,
            cooldown: 0,
            scaling_stat: 'strength' as const,
            scaling_ratio: 1.0,
            class_requirements: [className],
            cost_to_learn: skillData.cost_to_learn,
            is_learned: skillData.is_learned,
            nodes: []
          }))
          setAvailableActiveSkills(formattedSkills)
        }
      } else {
        console.error('Ошибка изучения в БД:', data?.error)
        alert('Ошибка при сохранении в БД: ' + (data?.error || 'Неизвестная ошибка'))
        
        // Возвращаем золото если навык не изучился
        await onUpdateCharacter({ 
          gold: character.gold + skill.cost_to_learn 
        }, true)
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
    <div className="flex-1 game-content p-4 space-y-4">
      {/* Skills Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-180px)]">
        
        {/* Пассивные навыки */}
        <div className="game-panel p-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span>Пассивные навыки</span>
            </h2>
            <p className="text-gray-400 text-sm">Автоматически изучаются по достижению уровня</p>
          </div>
          
          <div className="h-[calc(100%-70px)] overflow-y-auto">
            <div className="flex flex-col gap-3 pt-2 pb-2">
              {availablePassiveSkills.map((skill) => (
                <div 
                  key={skill.id}
                  className={`skill-card ${skill.is_learned ? 'skill-card--learned' : 'skill-card--locked'}`}
                >
                  {/* Иконка навыка */}
                  <div className="text-3xl flex-shrink-0">📦</div>
                  
                  {/* Информация о навыке */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-semibold text-white">
                        {skill.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        Уровень {skill.level_requirement}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-2">{skill.description}</p>
                    
                    {/* Бонусы статов */}
                    <div className="text-xs">
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
        <div className="game-panel p-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Sword className="w-5 h-5 text-yellow-400" />
              <span>Активные навыки</span>
            </h2>
            <p className="text-gray-400 text-sm">Изучаются за золото по достижению уровня</p>
          </div>
          
          <div className="h-[calc(100%-70px)] overflow-y-auto">
            <div className="flex flex-col gap-3 pt-2 pb-2">
              {availableActiveSkills.map((skill) => (
                <div 
                  key={skill.id}
                  className={`skill-card ${skill.is_learned ? 'skill-card--learned' : 'skill-card--locked'}`}
                  onClick={() => handleSkillClick(skill)}
                >
                  {/* Иконка навыка */}
                  <div className="text-3xl flex-shrink-0">📦</div>
                  
                  {/* Информация о навыке */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-semibold text-white">
                        {skill.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        Уровень {skill.level_requirement}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-300 mb-2">{skill.description}</p>
                    
                    {/* Информация о навыке */}
                    <div className="flex items-center gap-4 text-xs">
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
                  </div>
                  
                  {/* Стоимость изучения */}
                  {!skill.is_learned && (
                    <div className="flex-shrink-0">
                      <div className="text-xs text-yellow-400 flex items-center space-x-1">
                        <span>💰</span>
                        <span>{skill.cost_to_learn}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно покупки навыка */}
      {showPurchaseModal && selectedSkill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="game-panel p-4 max-w-md w-full mx-4">
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