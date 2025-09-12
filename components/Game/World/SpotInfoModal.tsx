'use client'

import { useState } from 'react'
import { Character } from '@/types/game'
import { FarmSpot, Mob } from '@/types/world'
import { X, Sword, Shield, Heart, Zap, Trophy, Coins, Package, Users, Target } from 'lucide-react'

interface SpotInfoModalProps {
  spot: FarmSpot
  character: Character
  isOpen: boolean
  onClose: () => void
  onStartFarming: (spot: FarmSpot, activeSkills: string[]) => Promise<void>
  activeSkills: string[]
}

export default function SpotInfoModal({ 
  spot, 
  character, 
  isOpen, 
  onClose, 
  onStartFarming,
  activeSkills 
}: SpotInfoModalProps) {
  const [isFarming, setIsFarming] = useState(false)
  const [isAutoFarming, setIsAutoFarming] = useState(false)

  // Отладочная информация
  console.log('🔍 SpotInfoModal Debug:', {
    activeSkills: activeSkills.length,
    activeSkillsList: activeSkills
  })

  if (!isOpen) return null

  // Группируем мобов по типам
  const mobGroups = spot.mobs.reduce((acc, mob) => {
    const key = mob.name
    if (!acc[key]) {
      acc[key] = {
        mob: mob,
        count: 0,
        totalHealth: 0,
        totalAttack: 0,
        totalExperience: 0,
        totalGold: 0
      }
    }
    acc[key].count++
    acc[key].totalHealth += mob.health
    acc[key].totalAttack += mob.attack
    acc[key].totalExperience += mob.experience_reward
    acc[key].totalGold += mob.gold_reward
    return acc
  }, {} as Record<string, {
    mob: Mob
    count: number
    totalHealth: number
    totalAttack: number
    totalExperience: number
    totalGold: number
  }>)

  // Определяем сложность боя
  const avgLevel = spot.mobs.reduce((sum, mob) => sum + mob.level, 0) / spot.mobs.length
  const levelDiff = avgLevel - character.level
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

  const handleStartFarming = async () => {
    setIsFarming(true)
    try {
      await onStartFarming(spot, activeSkills)
    } catch (error) {
      console.error('Farming error:', error)
    } finally {
      setIsFarming(false)
    }
  }

  const handleAutoFarming = async () => {
    if (activeSkills.length === 0) {
      alert('Нет активных скиллов для боя!')
      return
    }

    setIsAutoFarming(true)
    console.log('🤖 Начинаем автофарм спота:', spot.name)
    
    const autoFarmLoop = async () => {
      try {
        while (isAutoFarming) {
          await onStartFarming(spot, activeSkills)
          
          // Небольшая пауза между боями
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        console.error('Ошибка во время автофарма:', error)
      } finally {
        setIsAutoFarming(false)
      }
    }
    
    // Запускаем цикл автофарма
    autoFarmLoop()
  }

  const handleStopAutoFarming = () => {
    setIsAutoFarming(false)
    console.log('⏹️ Автофарм остановлен')
  }

  const totalExperience = spot.mobs.reduce((sum, mob) => sum + mob.experience_reward, 0)
  const totalGold = spot.mobs.reduce((sum, mob) => sum + mob.gold_reward, 0)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-dark-100 border border-dark-300 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-dark-200 rounded-lg flex items-center justify-center text-2xl">
              {spot.mobs[0]?.icon || '⚔️'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{spot.name}</h2>
              <p className="text-gray-400 text-sm">Группа из {spot.mobs.length} мобов</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Информация о сложности */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-dark-200/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-5 h-5 text-blue-400" />
              <span className="text-white font-semibold">Сложность</span>
            </div>
            <div className={`text-lg font-bold ${difficultyColor}`}>{difficulty}</div>
            <div className="text-sm text-gray-400">Средний уровень: {avgLevel.toFixed(1)}</div>
          </div>

          <div className="bg-dark-200/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">Шанс победы</span>
            </div>
            <div className="text-lg font-bold text-green-400">{winChance}%</div>
            <div className="text-sm text-gray-400">Примерно</div>
          </div>

          <div className="bg-dark-200/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">Мобов в группе</span>
            </div>
            <div className="text-lg font-bold text-purple-400">{spot.mobs.length}</div>
            <div className="text-sm text-gray-400">Всего</div>
          </div>
        </div>

        {/* Список мобов */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Sword className="w-5 h-5 text-red-400" />
            <span>Мобы в споте</span>
          </h3>
          
          <div className="space-y-3">
            {Object.values(mobGroups).map((group, index) => (
              <div key={index} className="bg-dark-200/30 border border-dark-300/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{group.mob.icon}</span>
                    <div>
                      <h4 className="text-white font-semibold">{group.mob.name}</h4>
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-yellow-400">Ур. {group.mob.level}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400">x{group.count}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-green-400">+{group.totalExperience} опыта</div>
                    <div className="text-sm text-yellow-400">+{group.totalGold} золота</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-gray-300">HP:</span>
                    <span className="text-white">{group.totalHealth}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sword className="w-4 h-4 text-orange-400" />
                    <span className="text-gray-300">Атака:</span>
                    <span className="text-white">{group.totalAttack}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Защита:</span>
                    <span className="text-white">{group.mob.defense}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">Скорость:</span>
                    <span className="text-white">{(group.mob as any).speed || 100}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Возможные награды */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Package className="w-5 h-5 text-green-400" />
            <span>Возможные награды</span>
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-200/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">Опыт</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">+{totalExperience}</div>
              <div className="text-sm text-gray-400">За всю группу</div>
            </div>
            
            <div className="bg-dark-200/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-semibold">Золото</span>
              </div>
              <div className="text-2xl font-bold text-yellow-400">+{totalGold}</div>
              <div className="text-sm text-gray-400">За всю группу</div>
            </div>
          </div>
        </div>

        {/* Активные скиллы */}
        {activeSkills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <span>Активные скиллы</span>
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {activeSkills.map((skillId, index) => (
                <div key={index} className="bg-blue-600/20 border border-blue-400/50 rounded-lg px-3 py-2 text-sm text-blue-400">
                  Скилл {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Кнопки действий */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Отмена
          </button>
          
          <button
            onClick={handleStartFarming}
            disabled={isFarming || activeSkills.length === 0}
            className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              isFarming || activeSkills.length === 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isFarming ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Фарм...</span>
              </>
            ) : activeSkills.length === 0 ? (
              <>
                <Sword className="w-4 h-4" />
                <span>Нет активных скиллов</span>
              </>
            ) : (
              <>
                <Sword className="w-4 h-4" />
                <span>Начать фарм</span>
              </>
            )}
          </button>
          
          {/* Кнопка автофарма */}
          {!isAutoFarming ? (
            <button
              onClick={handleAutoFarming}
              disabled={activeSkills.length === 0}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                activeSkills.length === 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {activeSkills.length === 0 ? (
                <>
                  <Sword className="w-4 h-4" />
                  <span>Нет активных скиллов</span>
                </>
              ) : (
                <>
                  <Sword className="w-4 h-4" />
                  <span>Авто-бой</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleStopAutoFarming}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <div className="animate-pulse rounded-full h-4 w-4 bg-white"></div>
              <span>Остановить</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
