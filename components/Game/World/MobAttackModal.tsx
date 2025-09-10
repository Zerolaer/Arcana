'use client'

import { useState } from 'react'
import { Character } from '@/types/game'
import { Mob, CombatRewards } from '@/types/world'
import { X, Sword, Shield, Heart, Zap, Trophy, Coins, Package } from 'lucide-react'

interface MobAttackModalProps {
  mob: Mob
  character: Character
  isOpen: boolean
  onClose: () => void
  onAttack: (mob: Mob) => Promise<CombatRewards | null>
}

export default function MobAttackModal({ mob, character, isOpen, onClose, onAttack }: MobAttackModalProps) {
  const [isAttacking, setIsAttacking] = useState(false)
  const [combatResult, setCombatResult] = useState<CombatRewards | null>(null)

  if (!isOpen) return null

  // Определяем сложность боя
  const levelDiff = mob.level - character.level
  const difficulty = levelDiff <= -5 ? 'Очень легко' : 
                    levelDiff <= -2 ? 'Легко' : 
                    levelDiff <= 2 ? 'Средне' : 
                    levelDiff <= 5 ? 'Сложно' : 'Очень сложно'

  const difficultyColor = levelDiff <= -5 ? 'text-gray-400' : 
                         levelDiff <= -2 ? 'text-green-400' : 
                         levelDiff <= 2 ? 'text-yellow-400' : 
                         levelDiff <= 5 ? 'text-orange-400' : 'text-red-400'

  // Примерный шанс победы
  const winChance = Math.max(10, Math.min(95, 75 - (levelDiff * 10)))

  const handleAttack = async () => {
    setIsAttacking(true)
    try {
      const result = await onAttack(mob)
      setCombatResult(result)
    } catch (error) {
      console.error('Combat error:', error)
    } finally {
      setIsAttacking(false)
    }
  }

  const handleClose = () => {
    setCombatResult(null)
    onClose()
  }

  // Если есть результат боя, показываем его
  if (combatResult) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-dark-100 border border-primary-400/50 rounded-lg p-6 max-w-md w-full mx-4">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <span>Победа!</span>
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Награды */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-lg text-yellow-400 font-semibold mb-2">
                Вы победили {mob.name}!
              </div>
              {combatResult.level_up && (
                <div className="text-lg text-green-400 font-bold mb-2">
                  🎉 ПОВЫШЕНИЕ УРОВНЯ! 🎉
                </div>
              )}
            </div>

            {/* Опыт и золото */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-200/30 border border-blue-400/30 rounded p-3 text-center">
                <Zap className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <div className="text-sm text-gray-400">Опыт</div>
                <div className="text-lg font-bold text-blue-400">+{combatResult.experience}</div>
              </div>
              <div className="bg-dark-200/30 border border-yellow-400/30 rounded p-3 text-center">
                <Coins className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <div className="text-sm text-gray-400">Золото</div>
                <div className="text-lg font-bold text-yellow-400">+{combatResult.gold}</div>
              </div>
            </div>

            {/* Предметы */}
            {combatResult.items && combatResult.items.length > 0 && (
              <div className="bg-dark-200/30 border border-purple-400/30 rounded p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Package className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-white">Найденные предметы:</span>
                </div>
                <div className="space-y-1">
                  {combatResult.items.map((item, index) => (
                    <div key={index} className="text-sm text-gray-300">
                      • {item.item_id} x{Math.floor(Math.random() * (item.quantity_max - item.quantity_min + 1)) + item.quantity_min}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleClose}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              Продолжить
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-100 border border-primary-400/50 rounded-lg p-6 max-w-md w-full mx-4">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Sword className="w-6 h-6 text-red-400" />
            <span>Атака</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Информация о мобе */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="text-4xl">{mob.icon}</div>
            <div>
              <h3 className="text-lg font-bold text-white">{mob.name}</h3>
              <div className="text-sm text-gray-400">Уровень {mob.level}</div>
              <div className={`text-sm font-semibold ${difficultyColor}`}>
                {difficulty}
              </div>
            </div>
          </div>

          {/* Характеристики моба */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-dark-200/30 border border-red-400/30 rounded p-2 text-center">
              <Heart className="w-4 h-4 text-red-400 mx-auto mb-1" />
              <div className="text-xs text-gray-400">HP</div>
              <div className="text-sm font-bold text-red-400">{mob.health}</div>
            </div>
            <div className="bg-dark-200/30 border border-orange-400/30 rounded p-2 text-center">
              <Sword className="w-4 h-4 text-orange-400 mx-auto mb-1" />
              <div className="text-xs text-gray-400">Атака</div>
              <div className="text-sm font-bold text-orange-400">{mob.attack}</div>
            </div>
            <div className="bg-dark-200/30 border border-blue-400/30 rounded p-2 text-center">
              <Shield className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <div className="text-xs text-gray-400">Защита</div>
              <div className="text-sm font-bold text-blue-400">{mob.defense}</div>
            </div>
          </div>

          {/* Награды */}
          <div className="bg-dark-200/20 border border-dark-300/50 rounded p-3 mb-4">
            <div className="text-sm font-semibold text-white mb-2">Возможные награды:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-blue-400" />
                <span className="text-gray-300">Опыт: {mob.experience_reward}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Coins className="w-3 h-3 text-yellow-400" />
                <span className="text-gray-300">Золото: {mob.gold_reward}</span>
              </div>
            </div>
            {mob.loot_table && mob.loot_table.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-gray-400 mb-1">Возможная добыча:</div>
                {mob.loot_table.map((loot, index) => (
                  <div key={index} className="text-xs text-gray-300">
                    • {loot.item_id} ({loot.drop_rate}%)
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Шанс победы */}
          <div className="bg-dark-200/20 border border-dark-300/50 rounded p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Шанс победы:</span>
              <span className={`text-sm font-bold ${winChance >= 70 ? 'text-green-400' : winChance >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                ~{winChance}%
              </span>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleAttack}
            disabled={isAttacking}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-semibold py-2 px-4 rounded transition-colors flex items-center justify-center space-x-2"
          >
            {isAttacking ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Бой...</span>
              </>
            ) : (
              <>
                <Sword className="w-4 h-4" />
                <span>Атаковать</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
