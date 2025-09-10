'use client'

import { Character } from '@/types/game'
import { Sword, Zap, Eye, Shield, Star, Crown, Heart, Zap as ManaIcon, Activity } from 'lucide-react'
import { calculateCharacterStats } from '@/lib/characterStats'

interface StatsDisplayProps {
  character: Character
  showDerived?: boolean
  className?: string
}

export default function StatsDisplay({ character, showDerived = true, className = '' }: StatsDisplayProps) {
  // Используем рассчитанные характеристики для консистентности
  const calculatedStats = calculateCharacterStats(character)
  const baseStats = [
    {
      key: 'strength' as const,
      name: 'Сила',
      icon: <Sword className="w-4 h-4 text-red-400" />,
      value: character.strength,
      color: 'text-red-400'
    },
    {
      key: 'dexterity' as const,
      name: 'Ловкость',
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
      value: character.dexterity,
      color: 'text-yellow-400'
    },
    {
      key: 'intelligence' as const,
      name: 'Интеллект',
      icon: <Eye className="w-4 h-4 text-blue-400" />,
      value: character.intelligence,
      color: 'text-blue-400'
    },
    {
      key: 'vitality' as const,
      name: 'Живучесть',
      icon: <Shield className="w-4 h-4 text-green-400" />,
      value: character.vitality,
      color: 'text-green-400'
    },
    {
      key: 'energy' as const,
      name: 'Энергия',
      icon: <Star className="w-4 h-4 text-purple-400" />,
      value: character.energy,
      color: 'text-purple-400'
    },
    {
      key: 'luck' as const,
      name: 'Удача',
      icon: <Crown className="w-4 h-4 text-gold-400" />,
      value: character.luck,
      color: 'text-gold-400'
    }
  ]

  const derivedStats = [
    {
      name: 'Здоровье',
      icon: <Heart className="w-4 h-4 text-red-500" />,
      current: character.health,
      max: calculatedStats.max_health,
      color: 'text-red-500',
      showBar: true
    },
    {
      name: 'Мана',
      icon: <ManaIcon className="w-4 h-4 text-blue-500" />,
      current: character.mana,
      max: calculatedStats.max_mana,
      color: 'text-blue-500',
      showBar: true
    },
    {
      name: 'Выносливость',
      icon: <Activity className="w-4 h-4 text-green-500" />,
      current: character.stamina,
      max: calculatedStats.max_stamina,
      color: 'text-green-500',
      showBar: true
    },
    {
      name: 'Физический урон',
      icon: <Sword className="w-4 h-4 text-gray-400" />,
      value: calculatedStats.attack_damage,
      color: 'text-gray-400'
    },
    {
      name: 'Магический урон',
      icon: <Eye className="w-4 h-4 text-gray-400" />,
      value: calculatedStats.magic_damage,
      color: 'text-gray-400'
    },
    {
      name: 'Защита',
      icon: <Shield className="w-4 h-4 text-gray-400" />,
      value: calculatedStats.defense,
      color: 'text-gray-400'
    },
    {
      name: 'Маг. защита',
      icon: <Star className="w-4 h-4 text-gray-400" />,
      value: calculatedStats.magic_resistance,
      color: 'text-gray-400'
    },
    {
      name: 'Критический шанс',
      icon: <Crown className="w-4 h-4 text-gray-400" />,
      value: `${calculatedStats.critical_chance}%`,
      color: 'text-gray-400'
    },
    {
      name: 'Критический урон',
      icon: <Zap className="w-4 h-4 text-gray-400" />,
      value: `${calculatedStats.critical_damage}%`,
      color: 'text-gray-400'
    },
    {
      name: 'Скорость атаки',
      icon: <Activity className="w-4 h-4 text-gray-400" />,
      value: `${calculatedStats.attack_speed}%`,
      color: 'text-gray-400'
    }
  ]

  const getBarColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage > 75) return 'bg-green-500'
    if (percentage > 50) return 'bg-yellow-500'
    if (percentage > 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Base Stats */}
      <div className="grid grid-cols-2 gap-3">
        {baseStats.map((stat) => (
          <div key={stat.key} className="flex items-center justify-between p-3 bg-dark-200/30 rounded-lg">
            <div className="flex items-center space-x-2">
              {stat.icon}
              <span className="text-sm text-gray-300">{stat.name}</span>
            </div>
            <span className={`font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Derived Stats */}
      {showDerived && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary-400" />
            <span>Боевые характеристики</span>
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            {derivedStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-dark-200/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  {stat.icon}
                  <span className="text-sm text-gray-300">{stat.name}</span>
                </div>
                
                {stat.showBar ? (
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${stat.color}`}>
                      {stat.current}/{stat.max}
                    </span>
                    <div className="w-16 h-2 bg-dark-300 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getBarColor(stat.current, stat.max)} transition-all duration-300`}
                        style={{ width: `${(stat.current / stat.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <span className={`font-bold ${stat.color}`}>{stat.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}