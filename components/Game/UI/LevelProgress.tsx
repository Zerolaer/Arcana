'use client'

import { Character } from '@/types/game'
import { Star, TrendingUp, Award } from 'lucide-react'
import { getLevelProgressInfo, formatExperience, getLevelColor, getExperienceProgressColor } from '@/lib/levelSystemV2'

interface LevelProgressProps {
  character: Character
  showDetails?: boolean
  className?: string
}

export default function LevelProgress({ character, showDetails = true, className = '' }: LevelProgressProps) {
  // Используем новую систему прогрессии
  const progressInfo = getLevelProgressInfo(character)
  const experiencePercentage = progressInfo.progressPercent
  const experienceToNext = progressInfo.experienceToNext

  // Используем функции из новой системы
  const levelColor = getLevelColor(progressInfo.level)
  const progressColor = getExperienceProgressColor(experiencePercentage)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Level Display */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Star className="w-6 h-6 text-gold-400" />
          <span className={`text-3xl font-bold ${levelColor}`}>
            {progressInfo.level}
          </span>
          {progressInfo.isMilestone && (
            <div title="Milestone Level!">
              <Award className="w-5 h-5 text-gold-400" />
            </div>
          )}
        </div>
        <p className="text-sm text-gray-400">Уровень персонажа</p>
      </div>

      {/* Experience Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">Опыт</span>
          <span className="text-gray-300">
            {formatExperience(progressInfo.experience)} / {formatExperience(progressInfo.experienceRequired)}
          </span>
        </div>
        
        <div className="relative">
          <div className="w-full h-3 bg-dark-300 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${progressColor} transition-all duration-500 ease-out`}
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
              {formatExperience(experienceToNext)}
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
            {progressInfo.isMilestone && (
              <div className="text-xs text-gold-400 mt-1">
                +{progressInfo.statPointsReward - 5} за milestone!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}