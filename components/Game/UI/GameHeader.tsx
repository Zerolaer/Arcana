'use client'

import { User } from '@supabase/supabase-js'
import { Character } from '@/types/game'
import { LogOut, Settings, Bell, Coins, MapPin } from 'lucide-react'
import { getLevelProgressInfo, formatExperience } from '@/lib/levelSystemV2'
import { calculateCombatPower, formatCombatPower, getCombatPowerColor } from '@/lib/combatPower'
import { calculateCharacterStats } from '@/lib/characterStats'

interface GameHeaderProps {
  character: Character
  user: User
  onLogout: () => void
}

export default function GameHeader({ character, user, onLogout }: GameHeaderProps) {
  // Используем рассчитанные характеристики для консистентности
  const calculatedStats = calculateCharacterStats(character)
  
  // Безопасные значения - не превышаем максимум
  const safeHealth = Math.min(character.health, calculatedStats.max_health)
  const safeMana = Math.min(character.mana, calculatedStats.max_mana)
  
  const healthPercentage = (safeHealth / calculatedStats.max_health) * 100
  const manaPercentage = (safeMana / calculatedStats.max_mana) * 100
  // Используем новую систему прогрессии
  const progressInfo = getLevelProgressInfo(character)
  const expPercentage = progressInfo.progressPercent
  
  // Расчет боевой мощи
  const combatStats = calculateCombatPower(character)

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="game-panel m-4 mb-0 p-4">
      <div className="flex items-center justify-between">
        {/* Character Info */}
        <div className="flex items-center space-x-4">
          {/* Level Square */}
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex flex-col items-center justify-center text-white shadow-lg">
            <div className="text-lg font-bold leading-none">{character.level}</div>
            <div className="text-xs leading-none opacity-80">{Math.floor(expPercentage)}%</div>
          </div>

          {/* Resource Bars */}
          <div className="max-w-[240px]">
            <div className="space-y-2">
              {/* Health Bar */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-red-300 w-6">HP</span>
                <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600 min-w-[120px]">
                  <div 
                    className="h-full bg-red-500 transition-all duration-300 min-w-[2px]"
                    style={{ width: `${Math.max(healthPercentage, 1)}%` }}
                  />
                </div>
                <span className="text-xs text-red-300 w-16 text-right">
                  {formatNumber(safeHealth)}/{formatNumber(calculatedStats.max_health)}
                </span>
              </div>

              {/* Mana Bar */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-blue-300 w-6">MP</span>
                <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600 min-w-[120px]">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300 min-w-[2px]"
                    style={{ width: `${Math.max(manaPercentage, 1)}%` }}
                  />
                </div>
                <span className="text-xs text-blue-300 w-16 text-right">
                  {formatNumber(safeMana)}/{formatNumber(calculatedStats.max_mana)}
                </span>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <h1 className="text-xl font-bold text-white">{character.name}</h1>
            {character.current_location_id && (
              <div className="flex items-center space-x-1 text-xs text-blue-400 mt-1">
                <MapPin className="w-3 h-3" />
                <span>В игре</span>
              </div>
            )}
          </div>
        </div>

        {/* Currency and Actions */}
        <div className="flex items-center space-x-4">
          {/* Gold */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-gold-500/20 border border-gold-400/30 rounded-lg">
            <Coins className="w-4 h-4 text-gold-400" />
            <span className="text-gold-300 font-semibold">
              {character.gold.toLocaleString()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button className="p-2 text-dark-400 rounded-lg">
              <Bell className="w-5 h-5" />
            </button>
            
            <button className="p-2 text-dark-400 rounded-lg">
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              onClick={onLogout}
              className="p-2 text-dark-400 rounded-lg"
              title="Выйти из игры"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Combat Stats Row */}
      <div className="mt-4 pt-3 border-t border-dark-300/30">
        <div className="flex items-center justify-between text-xs text-dark-400">
          <div className="flex items-center space-x-6">
            <span className={`font-semibold ${getCombatPowerColor(combatStats.combatPower, character.level)}`}>
              Общая БМ: {formatCombatPower(combatStats.combatPower)}
            </span>
            <span>⚔️ Урон: <span className="text-white font-semibold">{combatStats.totalDamage}</span></span>
            <span>🛡️ Защита: <span className="text-white font-semibold">{combatStats.totalDefense}</span></span>
            <span>✨ Крит. множ: <span className="text-white font-semibold">{combatStats.criticalMultiplier}x</span></span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span>Очки характеристик: <span className="text-primary-400 font-semibold">{character.stat_points}</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}
