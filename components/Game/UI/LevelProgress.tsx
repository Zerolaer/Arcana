'use client'

import { Character } from '@/types/game'
import { Star, TrendingUp, Award } from 'lucide-react'

interface LevelProgressProps {
  character: Character
  showDetails?: boolean
  className?: string
}

export default function LevelProgress({ character, showDetails = true, className = '' }: LevelProgressProps) {
  const experiencePercentage = (character.experience / character.experience_to_next) * 100
  const experienceToNext = character.experience_to_next - character.experience

  const getLevelColor = (level: number) => {
    if (level >= 100) return 'text-gold-400'
    if (level >= 50) return 'text-purple-400'
    if (level >= 25) return 'text-blue-400'
    return 'text-green-400'
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'from-gold-400 to-gold-600'
    if (percentage >= 75) return 'from-purple-400 to-purple-600'
    if (percentage >= 50) return 'from-blue-400 to-blue-600'
    if (percentage >= 25) return 'from-green-400 to-green-600'
    return 'from-gray-400 to-gray-600'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Level Display */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Star className="w-6 h-6 text-gold-400" />
          <span className={`text-3xl font-bold ${getLevelColor(character.level)}`}>
            {character.level}
          </span>
        </div>
        <p className="text-sm text-gray-400">Уровень персонажа</p>
      </div>

      {/* Experience Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">Опыт</span>
          <span className="text-gray-300">
            {character.experience.toLocaleString()} / {character.experience_to_next.toLocaleString()}
          </span>
        </div>
        
        <div className="relative">
          <div className="w-full h-3 bg-dark-300 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getProgressColor(experiencePercentage)} transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(experiencePercentage, 100)}%` }}
            />
          </div>
          
          {/* Progress percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-white drop-shadow-lg">
              {Math.round(experiencePercentage)}%
            </span>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-300">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">До следующего уровня</span>
            </div>
            <span className="text-lg font-bold text-blue-400">
              {experienceToNext.toLocaleString()}
            </span>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Award className="w-4 h-4 text-gold-400" />
              <span className="text-sm text-gray-300">Очки характеристик</span>
            </div>
            <span className="text-lg font-bold text-gold-400">
              {character.stat_points}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}