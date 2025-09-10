'use client'

import { Character } from '@/types/game'
import { Heart, Zap, Star, Coins } from 'lucide-react'
import { calculateCharacterStats } from '@/lib/characterStats'

interface CharacterFooterProps {
  character: Character
}

export default function CharacterFooter({ character }: CharacterFooterProps) {
  // Используем рассчитанные характеристики
  const calculatedStats = calculateCharacterStats(character)
  
  // Calculate percentages
  const healthPercent = (character.health / calculatedStats.max_health) * 100
  const manaPercent = (character.mana / calculatedStats.max_mana) * 100
  
  // Calculate experience to next level (simple calculation)
  const expForCurrentLevel = character.level * 100
  const expForNextLevel = (character.level + 1) * 100
  const expNeeded = expForNextLevel - expForCurrentLevel
  const expCurrent = character.experience - expForCurrentLevel
  const expPercent = Math.max(0, Math.min(100, (expCurrent / expNeeded) * 100))

  return (
    <div className="bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-md border-t border-white/10 px-6 py-4">
      {/* Experience Bar - Full Width */}
      <div className="mb-3">
        <div className="relative h-2 bg-gray-800/80 rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${expPercent}%` }}
          />
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-400/50 to-emerald-300/50 animate-pulse" 
               style={{ width: `${expPercent}%` }} />
        </div>
        
        {/* EXP Text */}
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-400">
            EXP: {Math.floor(expCurrent)}/{expNeeded}
          </span>
          <span className="text-xs text-gray-400">
            До {character.level + 1} уровня: {Math.ceil(expNeeded - expCurrent)}
          </span>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="flex items-center justify-between">
        {/* Left: Level + HP/MP */}
        <div className="flex items-center space-x-4">
          {/* Level Badge */}
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full border-2 border-yellow-400/50 shadow-lg">
            <span className="text-lg font-bold text-black">{character.level}</span>
          </div>

          {/* Health Bar */}
          <div className="flex items-center space-x-3">
            <Heart className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex flex-col">
              <div className="relative w-48 h-4 bg-gray-800/80 rounded border border-red-900/50 overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-red-500 transition-all duration-300"
                  style={{ width: `${healthPercent}%` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 via-transparent to-transparent animate-pulse" />
              </div>
              <div className="text-xs text-gray-300 mt-1 flex items-center justify-between">
                <span>{character.health} / {calculatedStats.max_health}</span>
                {calculatedStats.health_regen && character.health < calculatedStats.max_health && !character.is_in_combat && (
                  <span className="text-green-400 text-xs">
                    +{calculatedStats.health_regen.toFixed(1)}/сек
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mana Bar */}
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div className="flex flex-col">
              <div className="relative w-48 h-4 bg-gray-800/80 rounded border border-blue-900/50 overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-300"
                  style={{ width: `${manaPercent}%` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-transparent to-transparent animate-pulse" />
              </div>
              <div className="text-xs text-gray-300 mt-1 flex items-center justify-between">
                <span>{character.mana} / {calculatedStats.max_mana}</span>
                {calculatedStats.mana_regen && character.mana < calculatedStats.max_mana && !character.is_in_combat && (
                  <span className="text-blue-400 text-xs">
                    +{calculatedStats.mana_regen.toFixed(1)}/сек
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Resources */}
        <div className="flex items-center space-x-6">
          {/* Gold */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 px-4 py-2 rounded-lg border border-yellow-600/30">
            <Coins className="w-5 h-5 text-yellow-400" />
            <div className="flex flex-col items-end">
              <span className="text-lg font-bold text-yellow-400">
                {character.gold.toLocaleString()}
              </span>
              <span className="text-xs text-yellow-500">Золото</span>
            </div>
          </div>

          {/* Crystals (placeholder for future) */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-900/50 to-purple-800/50 px-4 py-2 rounded-lg border border-purple-600/30 opacity-50">
            <Star className="w-5 h-5 text-purple-400" />
            <div className="flex flex-col items-end">
              <span className="text-lg font-bold text-purple-400">0</span>
              <span className="text-xs text-purple-500">Кристаллы</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
