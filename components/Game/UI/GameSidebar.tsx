'use client'

import { Character } from '@/types/game'
import { User, Backpack, Zap, Map, Swords, Target, Users } from 'lucide-react'

interface GameSidebarProps {
  character: Character
  activePanel: string | null
  onPanelChange: (panel: string | null) => void
}

type SidebarItem = {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  badge?: string | number
  color: string
}

export default function GameSidebar({ character, activePanel, onPanelChange }: GameSidebarProps) {
  const sidebarItems: SidebarItem[] = [
    {
      id: 'character',
      name: 'Персонаж',
      icon: <User className="w-5 h-5" />,
      description: 'Характеристики и развитие',
      badge: character.stat_points > 0 ? character.stat_points : undefined,
      color: 'blue'
    },
    {
      id: 'inventory',
      name: 'Инвентарь',
      icon: <Backpack className="w-5 h-5" />,
      description: 'Предметы и экипировка',
      color: 'green'
    },
    {
      id: 'skills',
      name: 'Навыки',
      icon: <Zap className="w-5 h-5" />,
      description: 'Умения и способности',
      badge: character.skill_points > 0 ? character.skill_points : undefined,
      color: 'purple'
    },
    {
      id: 'location',
      name: 'Карта',
      icon: <Map className="w-5 h-5" />,
      description: 'Локации и путешествия',
      color: 'yellow'
    },
    {
      id: 'combat',
      name: 'Бой',
      icon: <Swords className="w-5 h-5" />,
      description: 'Сражения и фарминг',
      badge: character.is_in_combat ? '!' : undefined,
      color: 'red'
    }
  ]

  const getItemColor = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive ? 'border-blue-400 bg-blue-500/10 text-blue-300' : 'border-dark-300/50 text-dark-400 hover:border-blue-400/50 hover:text-blue-300',
      green: isActive ? 'border-green-400 bg-green-500/10 text-green-300' : 'border-dark-300/50 text-dark-400 hover:border-green-400/50 hover:text-green-300',
      purple: isActive ? 'border-purple-400 bg-purple-500/10 text-purple-300' : 'border-dark-300/50 text-dark-400 hover:border-purple-400/50 hover:text-purple-300',
      yellow: isActive ? 'border-yellow-400 bg-yellow-500/10 text-yellow-300' : 'border-dark-300/50 text-dark-400 hover:border-yellow-400/50 hover:text-yellow-300',
      red: isActive ? 'border-red-400 bg-red-500/10 text-red-300' : 'border-dark-300/50 text-dark-400 hover:border-red-400/50 hover:text-red-300',
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getBadgeColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-green-500 text-white',
      purple: 'bg-purple-500 text-white',
      yellow: 'bg-yellow-500 text-black',
      red: 'bg-red-500 text-white animate-pulse',
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="w-64 game-panel m-4 mr-0 p-4 flex flex-col">
      {/* Sidebar Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white mb-2">Игровое меню</h2>
        <div className="h-px bg-gradient-to-r from-transparent via-dark-300/50 to-transparent"></div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = activePanel === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onPanelChange(item.id)}
              className={`
                w-full p-3 rounded-lg border transition-all duration-200 text-left relative
                ${getItemColor(item.color, isActive)}
                ${isActive ? 'shadow-lg' : 'hover:bg-dark-200/30'}
              `}
            >
              <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 ${isActive ? '' : 'opacity-70'}`}>
                  {item.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className={`text-xs ${isActive ? 'opacity-80' : 'opacity-60'} truncate`}>
                    {item.description}
                  </div>
                </div>

                {/* Badge */}
                {item.badge && (
                  <div className={`
                    flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                    ${getBadgeColor(item.color)}
                  `}>
                    {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                  </div>
                )}
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-r-full bg-current opacity-60`}></div>
              )}
            </button>
          )
        })}
      </nav>

      {/* Character Quick Info */}
      <div className="mt-6 pt-4 border-t border-dark-300/30">
        <div className="text-xs text-dark-500 space-y-2">
          <div className="flex justify-between">
            <span>Уровень:</span>
            <span className="text-white font-semibold">{character.level}</span>
          </div>
          <div className="flex justify-between">
            <span>Класс:</span>
            <span className="text-primary-400 truncate ml-2">{character.class_id}</span>
          </div>
          {character.current_spot_id && (
            <div className="flex justify-between">
              <span>Спот:</span>
              <span className="text-green-400">Занят</span>
            </div>
          )}
        </div>

        {/* Online Status */}
        <div className="mt-3 flex items-center space-x-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${character.is_online ? 'bg-green-400' : 'bg-gray-400'}`}></div>
          <span className={character.is_online ? 'text-green-400' : 'text-gray-400'}>
            {character.is_online ? 'В сети' : 'Не в сети'}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 space-y-2">
        {character.is_in_combat && (
          <button className="w-full p-2 bg-red-500/20 border border-red-400/30 rounded text-red-300 text-sm hover:bg-red-500/30 transition-colors">
            ⚔️ В бою
          </button>
        )}
        
        {character.is_afk_farming && (
          <button className="w-full p-2 bg-green-500/20 border border-green-400/30 rounded text-green-300 text-sm hover:bg-green-500/30 transition-colors">
            🤖 АФК фарм активен
          </button>
        )}
        
        {!character.is_in_combat && !character.is_afk_farming && (
          <button 
            onClick={() => onPanelChange('combat')}
            className="w-full p-2 bg-primary-500/20 border border-primary-400/30 rounded text-primary-300 text-sm hover:bg-primary-500/30 transition-colors"
          >
            ⚔️ Начать бой
          </button>
        )}
      </div>
    </div>
  )
}
