'use client'

import { Character } from '@/types/game'
import { Heart, Zap, Activity } from 'lucide-react'
import { calculateCharacterStats } from '@/lib/characterStats'

interface ResourceBarsProps {
  character: Character
  showLabels?: boolean
  className?: string
}

export default function ResourceBars({ character, showLabels = true, className = '' }: ResourceBarsProps) {
  // Используем рассчитанные характеристики
  const calculatedStats = calculateCharacterStats(character)
  
  const resources = [
    {
      name: 'Здоровье',
      icon: <Heart className="w-4 h-4 text-red-500" />,
      current: character.health,
      max: calculatedStats.max_health,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-400'
    },
    {
      name: 'Мана',
      icon: <Zap className="w-4 h-4 text-blue-500" />,
      current: character.mana,
      max: calculatedStats.max_mana,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400'
    },
  ]

  const getPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100)
  }

  const getBarWidth = (current: number, max: number) => {
    return `${getPercentage(current, max)}%`
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {resources.map((resource, index) => {
        const percentage = getPercentage(resource.current, resource.max)
        const isLow = percentage < 25
        const isCritical = percentage < 10

        return (
          <div key={index} className="space-y-1">
            {showLabels && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  {resource.icon}
                  <span className="text-gray-300">{resource.name}</span>
                </div>
                <span className={`font-medium ${resource.textColor}`}>
                  {resource.current.toLocaleString()} / {resource.max.toLocaleString()}
                </span>
              </div>
            )}
            
            <div className="relative">
              <div className="w-full h-2 bg-dark-300 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${resource.color} transition-all duration-300 ease-out ${
                    isCritical ? 'animate-pulse' : ''
                  }`}
                  style={{ width: getBarWidth(resource.current, resource.max) }}
                />
                
                {/* Glow effect for low resources */}
                {isLow && (
                  <div 
                    className={`absolute inset-0 rounded-full ${resource.bgColor} blur-sm opacity-50`}
                    style={{ width: getBarWidth(resource.current, resource.max) }}
                  />
                )}
              </div>
              
              {/* Percentage indicator */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs font-medium ${isLow ? 'text-white drop-shadow-lg' : 'text-transparent'}`}>
                  {Math.round(percentage)}%
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}