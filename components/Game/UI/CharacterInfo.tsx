'use client'

import { Character } from '@/types/game'
import { User, Calendar, MapPin, Clock, Crown } from 'lucide-react'
import LevelProgress from './LevelProgress'
import ResourceBars from './ResourceBars'
import StatsDisplay from './StatsDisplay'

interface CharacterInfoProps {
  character: Character
  showFullStats?: boolean
  className?: string
}

export default function CharacterInfo({ character, showFullStats = true, className = '' }: CharacterInfoProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getClassColor = (className: string) => {
    const colors: { [key: string]: string } = {
      'warrior': 'text-red-400',
      'mage': 'text-blue-400',
      'rogue': 'text-green-400',
      'priest': 'text-purple-400',
      'paladin': 'text-yellow-400',
      'hunter': 'text-orange-400',
      'warlock': 'text-pink-400',
      'death_knight': 'text-gray-400',
      'shaman': 'text-cyan-400',
      'druid': 'text-emerald-400',
      'monk': 'text-amber-400',
      'demon_hunter': 'text-violet-400'
    }
    return colors[className.toLowerCase()] || 'text-gray-400'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Character Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Crown className="w-6 h-6 text-gold-400" />
          <h2 className="text-2xl font-bold text-white">{character.name}</h2>
        </div>
        
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span className={getClassColor(character.class_id)}>
              {character.class_id}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>Создан {formatDate(character.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Level and Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LevelProgress character={character} />
        <ResourceBars character={character} />
      </div>

      {/* Stats */}
      {showFullStats && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
            <Crown className="w-5 h-5 text-primary-400" />
            <span>Характеристики</span>
          </h3>
          <StatsDisplay character={character} />
        </div>
      )}

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-dark-300">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <span>Текущее местоположение</span>
          </h4>
          <p className="text-sm text-gray-400">
            {character.current_location_id || 'Не определено'}
          </p>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300 flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Последняя активность</span>
          </h4>
          <p className="text-sm text-gray-400">
            {formatDate(character.last_activity)}
          </p>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-center space-x-6 pt-4 border-t border-dark-300">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${character.is_online ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-sm text-gray-300">
            {character.is_online ? 'Онлайн' : 'Оффлайн'}
          </span>
        </div>
        
        {character.is_in_combat && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-red-400">В бою</span>
          </div>
        )}
        
        {character.is_afk_farming && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-sm text-yellow-400">АФК фарм</span>
          </div>
        )}
      </div>
    </div>
  )
}