'use client'

import { User } from '@supabase/supabase-js'
import { Character } from '@/types/game'
import { LogOut, Settings, Bell, Crown, Coins, MapPin } from 'lucide-react'

interface GameHeaderProps {
  character: Character
  user: User
  onLogout: () => void
}

export default function GameHeader({ character, user, onLogout }: GameHeaderProps) {
  const healthPercentage = (character.health / character.max_health) * 100
  const manaPercentage = (character.mana / character.max_mana) * 100
  const staminaPercentage = (character.stamina / character.max_stamina) * 100
  const expPercentage = character.experience_to_next > 0 ? (character.experience / character.experience_to_next) * 100 : 0

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
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            {character.name.charAt(0).toUpperCase()}
          </div>

          {/* Name and Level */}
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">{character.name}</h1>
              <div className="flex items-center space-x-1 px-2 py-1 bg-gold-500/20 border border-gold-400/30 rounded text-gold-400 text-sm">
                <Crown className="w-3 h-3" />
                <span>Ур. {character.level}</span>
              </div>
              {character.current_location_id && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded text-blue-400 text-sm">
                  <MapPin className="w-3 h-3" />
                  <span>В игре</span>
                </div>
              )}
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center space-x-2 text-xs text-dark-400 mt-1">
              {character.is_in_combat && (
                <span className="text-red-400 animate-pulse">⚔️ В бою</span>
              )}
              {character.is_afk_farming && (
                <span className="text-green-400">🤖 АФК фарм</span>
              )}
              {character.is_online && !character.is_in_combat && !character.is_afk_farming && (
                <span className="text-green-400">🟢 В сети</span>
              )}
            </div>
          </div>
        </div>

        {/* Resource Bars */}
        <div className="flex-1 max-w-md mx-8">
          <div className="space-y-2">
            {/* Health Bar */}
            <div className="flex items-center space-x-3">
              <span className="text-xs text-red-300 w-12">HP</span>
              <div className="flex-1 stat-bar">
                <div 
                  className="stat-bar-fill health-bar"
                  style={{ width: `${healthPercentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                  {formatNumber(character.health)}/{formatNumber(character.max_health)}
                </div>
              </div>
            </div>

            {/* Mana Bar */}
            <div className="flex items-center space-x-3">
              <span className="text-xs text-blue-300 w-12">MP</span>
              <div className="flex-1 stat-bar">
                <div 
                  className="stat-bar-fill mana-bar"
                  style={{ width: `${manaPercentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                  {formatNumber(character.mana)}/{formatNumber(character.max_mana)}
                </div>
              </div>
            </div>

            {/* Stamina Bar */}
            <div className="flex items-center space-x-3">
              <span className="text-xs text-green-300 w-12">ST</span>
              <div className="flex-1 stat-bar">
                <div 
                  className="stat-bar-fill stamina-bar"
                  style={{ width: `${staminaPercentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                  {formatNumber(character.stamina)}/{formatNumber(character.max_stamina)}
                </div>
              </div>
            </div>

            {/* Experience Bar */}
            <div className="flex items-center space-x-3">
              <span className="text-xs text-purple-300 w-12">EXP</span>
              <div className="flex-1 stat-bar">
                <div 
                  className="stat-bar-fill experience-bar"
                  style={{ width: `${expPercentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                  {formatNumber(character.experience)}/{formatNumber(character.experience_to_next)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Currency and Actions */}
        <div className="flex items-center space-x-4">
          {/* Gold */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-gold-500/20 border border-gold-400/30 rounded-lg">
            <Coins className="w-4 h-4 text-gold-400" />
            <span className="text-gold-300 font-semibold">
              {formatNumber(character.gold)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button className="p-2 text-dark-400 hover:text-white transition-colors rounded-lg hover:bg-dark-200/50">
              <Bell className="w-5 h-5" />
            </button>
            
            <button className="p-2 text-dark-400 hover:text-white transition-colors rounded-lg hover:bg-dark-200/50">
              <Settings className="w-5 h-5" />
            </button>
            
            <button
              onClick={onLogout}
              className="p-2 text-dark-400 hover:text-red-400 transition-colors rounded-lg hover:bg-dark-200/50"
              title="Выйти из игры"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="mt-4 pt-3 border-t border-dark-300/30">
        <div className="flex items-center justify-between text-xs text-dark-400">
          <div className="flex items-center space-x-6">
            <span>⚔️ Урон: <span className="text-white font-semibold">{Math.floor(character.attack_damage)}</span></span>
            <span>🔮 Маг. урон: <span className="text-white font-semibold">{Math.floor(character.magic_damage)}</span></span>
            <span>🛡️ Защита: <span className="text-white font-semibold">{Math.floor(character.defense)}</span></span>
            <span>✨ Крит. шанс: <span className="text-white font-semibold">{character.critical_chance.toFixed(1)}%</span></span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span>Очки характеристик: <span className="text-primary-400 font-semibold">{character.stat_points}</span></span>
            <span>Очки навыков: <span className="text-purple-400 font-semibold">{character.skill_points}</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}
