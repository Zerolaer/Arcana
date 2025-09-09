'use client'

import { useState } from 'react'
import { Character } from '@/types/game'
import { toast } from 'react-hot-toast'
import { Plus, Minus, RotateCcw, Sword, Zap, Eye, Shield, Star, Crown, TrendingUp } from 'lucide-react'

interface CharacterPanelProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
  isLoading: boolean
}

export default function CharacterPanel({ character, onUpdateCharacter, isLoading }: CharacterPanelProps) {
  const [tempStats, setTempStats] = useState({
    strength: 0,
    dexterity: 0,
    intelligence: 0,
    vitality: 0,
    energy: 0,
    luck: 0
  })

  const totalAllocatedPoints = Object.values(tempStats).reduce((sum, val) => sum + val, 0)
  const remainingPoints = character.stat_points - totalAllocatedPoints

  const statInfo = [
    {
      key: 'strength' as const,
      name: 'Сила',
      icon: <Sword className="w-4 h-4 text-red-400" />,
      description: 'Увеличивает физический урон и здоровье',
      effects: ['Физический урон: +2 за очко', 'Здоровье: +10 за очко']
    },
    {
      key: 'dexterity' as const,
      name: 'Ловкость', 
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
      description: 'Увеличивает скорость атаки и критический шанс',
      effects: ['Скорость атаки: +0.8% за очко', 'Критический шанс: +0.05% за очко']
    },
    {
      key: 'intelligence' as const,
      name: 'Интеллект',
      icon: <Eye className="w-4 h-4 text-blue-400" />,
      description: 'Увеличивает магический урон и ману',
      effects: ['Магический урон: +2.5 за очко', 'Мана: +5 за очко']
    },
    {
      key: 'vitality' as const,
      name: 'Живучесть',
      icon: <Shield className="w-4 h-4 text-green-400" />,
      description: 'Увеличивает здоровье и защиту',
      effects: ['Здоровье: +10 за очко', 'Защита: +1.5 за очко']
    },
    {
      key: 'energy' as const,
      name: 'Энергия',
      icon: <Star className="w-4 h-4 text-purple-400" />,
      description: 'Увеличивает ману и магическую защиту',
      effects: ['Мана: +5 за очко', 'Магическая защита: +1 за очко']
    },
    {
      key: 'luck' as const,
      name: 'Удача',
      icon: <Crown className="w-4 h-4 text-gold-400" />,
      description: 'Увеличивает критический шанс и находку предметов',
      effects: ['Критический шанс: +0.1% за очко', 'Редкие предметы: +0.05% за очко']
    }
  ]

  const adjustTempStat = (stat: keyof typeof tempStats, change: number) => {
    const newValue = tempStats[stat] + change
    const newTotal = totalAllocatedPoints - tempStats[stat] + newValue
    
    if (newValue < 0 || newTotal > character.stat_points) {
      return
    }
    
    setTempStats(prev => ({
      ...prev,
      [stat]: newValue
    }))
  }

  const resetTempStats = () => {
    setTempStats({
      strength: 0,
      dexterity: 0,
      intelligence: 0,
      vitality: 0,
      energy: 0,
      luck: 0
    })
  }

  const applyStatChanges = async () => {
    if (totalAllocatedPoints === 0) {
      toast.error('Нет изменений для применения')
      return
    }

    const newStats = {
      strength: character.strength + tempStats.strength,
      dexterity: character.dexterity + tempStats.dexterity,
      intelligence: character.intelligence + tempStats.intelligence,
      vitality: character.vitality + tempStats.vitality,
      energy: character.energy + tempStats.energy,
      luck: character.luck + tempStats.luck,
      stat_points: remainingPoints
    }

    // Recalculate derived stats
    const maxHealth = newStats.vitality * 10 + 100
    const maxMana = newStats.energy * 5 + 50
    const maxStamina = newStats.vitality * 5 + newStats.dexterity * 3 + 100

    const updates = {
      ...newStats,
      max_health: maxHealth,
      max_mana: maxMana,
      max_stamina: maxStamina,
      health: Math.min(character.health, maxHealth),
      mana: Math.min(character.mana, maxMana),
      stamina: Math.min(character.stamina, maxStamina),
      attack_damage: newStats.strength * 2 + newStats.dexterity,
      magic_damage: newStats.intelligence * 2.5,
      defense: newStats.vitality * 1.5 + newStats.strength * 0.5,
      magic_resistance: newStats.energy + newStats.intelligence * 0.3,
      critical_chance: Math.min(newStats.luck * 0.1 + newStats.dexterity * 0.05, 50),
      critical_damage: 150 + newStats.strength * 0.5,
      attack_speed: 100 + newStats.dexterity * 0.8,
      movement_speed: 100 + newStats.dexterity * 0.5
    }

    const success = await onUpdateCharacter(updates)
    if (success) {
      resetTempStats()
      toast.success('Характеристики обновлены!')
    }
  }

  const getStatValue = (stat: keyof typeof tempStats) => {
    return character[stat] + tempStats[stat]
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Crown className="w-6 h-6 text-gold-400" />
            <span>Персонаж</span>
          </h1>
          <p className="text-dark-400 mt-1">Развитие и характеристики вашего героя</p>
        </div>

        {/* Available Points */}
        <div className="text-right">
          <div className="text-sm text-dark-400">Доступно очков:</div>
          <div className="text-2xl font-bold text-primary-400">{remainingPoints}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stats Allocation */}
        <div className="game-panel p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span>Характеристики</span>
          </h2>

          <div className="space-y-4">
            {statInfo.map((stat) => {
              const currentValue = character[stat.key]
              const tempValue = tempStats[stat.key]
              const totalValue = getStatValue(stat.key)

              return (
                <div key={stat.key} className="border border-dark-300/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {stat.icon}
                      <span className="font-semibold text-white">{stat.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-bold text-white">
                          {currentValue}
                          {tempValue > 0 && (
                            <span className="text-green-400"> → {totalValue}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => adjustTempStat(stat.key, -1)}
                          disabled={tempValue <= 0}
                          className="w-7 h-7 rounded bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-red-400 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <div className="w-8 text-center text-sm text-white font-semibold">
                          {tempValue}
                        </div>

                        <button
                          onClick={() => adjustTempStat(stat.key, 1)}
                          disabled={remainingPoints <= 0}
                          className="w-7 h-7 rounded bg-green-500/20 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-green-400 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-dark-400 mb-2">{stat.description}</p>
                  
                  <div className="space-y-1">
                    {stat.effects.map((effect, index) => (
                      <div key={index} className="text-xs text-dark-500">
                        • {effect}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Buttons */}
          {totalAllocatedPoints > 0 && (
            <div className="flex space-x-3 mt-6">
              <button
                onClick={applyStatChanges}
                disabled={isLoading}
                className="flex-1 game-button py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Применить изменения
              </button>
              
              <button
                onClick={resetTempStats}
                className="px-4 py-2 bg-dark-300/20 hover:bg-dark-300/40 text-dark-400 hover:text-white rounded-md transition-all duration-200 border border-dark-300/50"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Combat Stats */}
        <div className="game-panel p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Sword className="w-5 h-5 text-red-400" />
            <span>Боевые характеристики</span>
          </h2>

          <div className="space-y-3">
            {[
              { name: 'Физический урон', value: Math.floor(character.attack_damage), icon: '⚔️' },
              { name: 'Магический урон', value: Math.floor(character.magic_damage), icon: '🔮' },
              { name: 'Защита', value: Math.floor(character.defense), icon: '🛡️' },
              { name: 'Магическая защита', value: Math.floor(character.magic_resistance), icon: '✨' },
              { name: 'Критический шанс', value: `${character.critical_chance.toFixed(1)}%`, icon: '💥' },
              { name: 'Критический урон', value: `${character.critical_damage.toFixed(0)}%`, icon: '⚡' },
              { name: 'Скорость атаки', value: `${character.attack_speed.toFixed(0)}%`, icon: '🏃' },
              { name: 'Скорость движения', value: `${character.movement_speed.toFixed(0)}%`, icon: '💨' }
            ].map((stat) => (
              <div key={stat.name} className="flex items-center justify-between p-3 bg-dark-200/30 rounded border border-dark-300/30">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{stat.icon}</span>
                  <span className="text-sm text-dark-300">{stat.name}</span>
                </div>
                <span className="font-semibold text-white">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Character Info */}
      <div className="game-panel p-6">
        <h2 className="text-lg font-bold text-white mb-4">Информация о персонаже</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-dark-200/30 rounded border border-dark-300/30 p-4">
            <div className="text-sm text-dark-400 mb-1">Уровень</div>
            <div className="text-2xl font-bold text-white">{character.level}</div>
            <div className="text-xs text-dark-500">
              Опыт: {character.experience.toLocaleString()}/{character.experience_to_next.toLocaleString()}
            </div>
          </div>

          <div className="bg-dark-200/30 rounded border border-dark-300/30 p-4">
            <div className="text-sm text-dark-400 mb-1">Золото</div>
            <div className="text-2xl font-bold text-gold-400">{character.gold.toLocaleString()}</div>
          </div>

          <div className="bg-dark-200/30 rounded border border-dark-300/30 p-4">
            <div className="text-sm text-dark-400 mb-1">Статус</div>
            <div className="flex items-center space-x-2">
              {character.is_in_combat && (
                <span className="text-red-400 text-sm">⚔️ В бою</span>
              )}
              {character.is_afk_farming && (
                <span className="text-green-400 text-sm">🤖 АФК фарм</span>
              )}
              {!character.is_in_combat && !character.is_afk_farming && (
                <span className="text-green-400 text-sm">🟢 Активен</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
