'use client'

import { Character } from '@/types/game'
import { Zap, Target, Layers } from 'lucide-react'
import { getAvailablePassiveSkills, getClassNameById } from '@/lib/passiveSkills'

interface SkillsPanelProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
  isLoading: boolean
}

export default function SkillsPanel({ character, onUpdateCharacter, isLoading }: SkillsPanelProps) {
  // Получаем пассивные навыки для класса персонажа
  const className = getClassNameById(character.class_id)
  const passiveSkills = getAvailablePassiveSkills(className, character.level)

  return (
    <div className="flex-1 game-content p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Навыки</h1>
          <p className="text-dark-400">Класс: {className}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-dark-400">Уровень:</div>
          <div className="text-xl font-bold text-purple-400">{character.level}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Skills */}
        <div className="game-panel p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5 text-red-400" />
            <span>Активные навыки</span>
          </h2>

          <div className="space-y-3">
            {[
              { name: 'Базовая атака', level: 1, icon: '⚔️', description: 'Стандартная атака оружием', cooldown: '1с' },
              { name: 'Лечение', level: 1, icon: '💚', description: 'Восстанавливает здоровье', cooldown: '3с' }
            ].map((skill) => (
              <div
                key={skill.name}
                className="p-4 bg-dark-200/30 rounded border border-dark-300/30 cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-dark-300/30 rounded border border-dark-300/50 flex items-center justify-center text-xl">
                    {skill.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{skill.name}</span>
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                        Ур. {skill.level}
                      </span>
                    </div>
                    <div className="text-sm text-dark-400">{skill.description}</div>
                  </div>
                  <div className="text-xs text-dark-500">
                    {skill.cooldown}
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="text-xs text-dark-500">Доступные ноды:</div>
                  <div className="flex space-x-2">
                    <div className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-400/30">
                      Нода 1
                    </div>
                    <div className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs border border-green-400/30">
                      Нода 2
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Passive Skills */}
        <div className="game-panel p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <span>Пассивные навыки</span>
          </h2>

          <div className="space-y-3">
            {passiveSkills.map((skill) => (
              <div
                key={skill.id}
                className={`p-4 rounded border ${
                  skill.is_learned 
                    ? 'bg-green-500/10 border-green-400/30' 
                    : 'bg-dark-200/30 border-dark-300/30 opacity-50'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-10 h-10 rounded border flex items-center justify-center text-xl ${
                    skill.is_learned 
                      ? 'bg-green-500/20 border-green-400/50' 
                      : 'bg-dark-300/30 border-dark-300/50'
                  }`}>
                    {skill.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{skill.name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        skill.is_learned 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {skill.is_learned ? 'Изучен' : `Ур. ${skill.level_requirement}`}
                      </span>
                    </div>
                    <div className="text-sm text-dark-400">{skill.description}</div>
                  </div>
                </div>

                {skill.is_learned && (
                  <div className="mt-3 space-y-1">
                    <div className="text-xs text-green-400 font-semibold">Бонусы:</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(skill.stat_bonuses).map(([stat, value]) => (
                        value > 0 && (
                          <div key={stat} className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded border border-green-400/30">
                            +{value} {stat}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {!skill.is_learned && (
                  <div className="text-xs text-dark-600">
                    Требуется: уровень {skill.level_requirement}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skill Tree Preview */}
      <div className="game-panel p-6">
        <h2 className="text-lg font-bold text-white mb-4">Дерево навыков</h2>
        
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🌳</div>
          <h3 className="text-xl font-bold text-white mb-2">Развернутое дерево навыков</h3>
          <p className="text-dark-400 mb-4">
            Уникальная система развития с нодами для каждого навыка.
            Создавайте собственные билды и комбинации способностей!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-dark-200/30 rounded border border-dark-300/30 p-4">
              <div className="text-2xl mb-2">⚔️</div>
              <div className="font-semibold text-white">Боевые навыки</div>
              <div className="text-sm text-dark-400">Урон и атаки</div>
            </div>
            
            <div className="bg-dark-200/30 rounded border border-dark-300/30 p-4">
              <div className="text-2xl mb-2">🛡️</div>
              <div className="font-semibold text-white">Защитные навыки</div>
              <div className="text-sm text-dark-400">Защита и выживание</div>
            </div>
            
            <div className="bg-dark-200/30 rounded border border-dark-300/30 p-4">
              <div className="text-2xl mb-2">🔮</div>
              <div className="font-semibold text-white">Магические навыки</div>
              <div className="text-sm text-dark-400">Заклинания и эффекты</div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="game-panel p-6 text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h3 className="text-xl font-bold text-white mb-2">Система навыков в разработке!</h3>
        <p className="text-dark-400">
          Уникальная система с нодами для каждого навыка позволит создавать неповторимые билды.
          Каждый игрок сможет развить своего персонажа по-своему!
        </p>
      </div>
    </div>
  )
}
