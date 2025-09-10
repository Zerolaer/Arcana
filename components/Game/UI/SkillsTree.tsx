'use client'

import { useState, useEffect } from 'react'
import { Character, Skill, SkillNode, CharacterSkill } from '@/types/game'
import { Zap, Target, Shield, Sword, Eye, Star, Lock, CheckCircle } from 'lucide-react'

interface SkillsTreeProps {
  character: Character
  skills: CharacterSkill[]
  availableSkills: Skill[]
  onLearnSkill: (skillId: string) => Promise<boolean>
  onUpgradeSkill: (skillId: string) => Promise<boolean>
  onSelectNode: (skillId: string, nodeId: string) => Promise<boolean>
  isLoading?: boolean
  className?: string
}

export default function SkillsTree({ 
  character, 
  skills, 
  availableSkills, 
  onLearnSkill, 
  onUpgradeSkill, 
  onSelectNode,
  isLoading = false,
  className = '' 
}: SkillsTreeProps) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [skillCategories, setSkillCategories] = useState<{ [key: string]: Skill[] }>({})

  useEffect(() => {
    // Group skills by category
    const categories: { [key: string]: Skill[] } = {}
    availableSkills.forEach(skill => {
      const category = skill.skill_type || 'other'
      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(skill)
    })
    setSkillCategories(categories)
  }, [availableSkills])

  const getSkillIcon = (skillType: string) => {
    switch (skillType) {
      case 'active': return <Sword className="w-5 h-5 text-red-400" />
      case 'passive': return <Shield className="w-5 h-5 text-blue-400" />
      case 'aoe': return <Target className="w-5 h-5 text-green-400" />
      default: return <Zap className="w-5 h-5 text-gray-400" />
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 text-gray-400'
      case 'uncommon': return 'border-green-500 text-green-400'
      case 'rare': return 'border-blue-500 text-blue-400'
      case 'epic': return 'border-purple-500 text-purple-400'
      case 'legendary': return 'border-gold-500 text-gold-400'
      case 'mythic': return 'border-red-500 text-red-400'
      default: return 'border-gray-500 text-gray-400'
    }
  }

  const canLearnSkill = (skill: Skill) => {
    if (character.level < skill.required_level) return false
    if (character.skill_points < 1) return false
    if (skill.required_class && !skill.required_class.includes(character.class_id)) return false
    return true
  }

  const canUpgradeSkill = (skillId: string) => {
    const characterSkill = skills.find(s => s.skill_id === skillId)
    if (!characterSkill) return false
    if (character.skill_points < 1) return false
    return characterSkill.level < 10 // Max skill level
  }

  const getSkillLevel = (skillId: string) => {
    const characterSkill = skills.find(s => s.skill_id === skillId)
    return characterSkill?.level || 0
  }

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill)
  }

  const handleLearnSkill = async (skillId: string) => {
    await onLearnSkill(skillId)
  }

  const handleUpgradeSkill = async (skillId: string) => {
    await onUpgradeSkill(skillId)
  }

  const handleNodeClick = async (skillId: string, nodeId: string) => {
    await onSelectNode(skillId, nodeId)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Древо навыков</h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-300">
            Доступно очков: <span className="text-gold-400 font-bold">{character.skill_points}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills List */}
        <div className="lg:col-span-2 space-y-4">
          {Object.entries(skillCategories).map(([category, categorySkills]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-md font-medium text-gray-300 capitalize">
                {category === 'active' ? 'Активные навыки' : 
                 category === 'passive' ? 'Пассивные навыки' : 
                 category === 'aoe' ? 'Областные навыки' : 
                 'Другие навыки'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categorySkills.map((skill) => {
                  const skillLevel = getSkillLevel(skill.id)
                  const isLearned = skillLevel > 0
                  const canLearn = canLearnSkill(skill)
                  const canUpgrade = canUpgradeSkill(skill.id)

                  return (
                    <div
                      key={skill.id}
                      onClick={() => handleSkillClick(skill)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedSkill?.id === skill.id
                          ? 'border-primary-500 bg-primary-500/10'
                          : isLearned
                          ? 'border-green-500 bg-green-500/10 hover:border-green-400'
                          : canLearn
                          ? 'border-yellow-500 bg-yellow-500/10 hover:border-yellow-400'
                          : 'border-gray-500 bg-gray-500/10 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getSkillIcon(skill.skill_type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-white truncate">
                              {skill.name}
                            </h5>
                            {isLearned && (
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-xs text-green-400">Уровень {skillLevel}</span>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {skill.description}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="text-xs text-gray-500">
                              Требует: {skill.required_level} ур.
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {!isLearned && canLearn && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleLearnSkill(skill.id)
                                  }}
                                  className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                >
                                  Изучить
                                </button>
                              )}
                              
                              {isLearned && canUpgrade && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleUpgradeSkill(skill.id)
                                  }}
                                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                >
                                  Улучшить
                                </button>
                              )}
                              
                              {!canLearn && !isLearned && (
                                <Lock className="w-4 h-4 text-gray-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Skill Details */}
        <div className="space-y-4">
          {selectedSkill ? (
            <div className="p-4 bg-dark-200/30 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-3">
                {selectedSkill.name}
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  {getSkillIcon(selectedSkill.skill_type)}
                  <span className="text-sm text-gray-300 capitalize">
                    {selectedSkill.skill_type}
                  </span>
                </div>
                
                <p className="text-sm text-gray-400">
                  {selectedSkill.description}
                </p>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-300">
                    <strong>Требования:</strong>
                  </div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>Уровень: {selectedSkill.required_level}</li>
                    {selectedSkill.required_class && (
                      <li>Класс: {selectedSkill.required_class.join(', ')}</li>
                    )}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm text-gray-300">
                    <strong>Характеристики:</strong>
                  </div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>Урон: {selectedSkill.base_damage}</li>
                    <li>Мана: {selectedSkill.mana_cost}</li>
                    <li>Перезарядка: {selectedSkill.cooldown}с</li>
                    <li>Тип урона: {selectedSkill.damage_type}</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-dark-200/30 rounded-lg text-center">
              <Eye className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                Выберите навык для просмотра деталей
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-dark-100/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="flex items-center space-x-2 text-white">
            <div className="loading-spinner" />
            <span>Обновление навыков...</span>
          </div>
        </div>
      )}
    </div>
  )
}