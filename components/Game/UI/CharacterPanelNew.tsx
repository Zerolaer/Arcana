'use client'

import { useState } from 'react'
import { Character } from '@/types/game'
import { toast } from 'react-hot-toast'
import { Plus, Minus, RotateCcw, Crown, TrendingUp, Package, User, Shield } from 'lucide-react'
import EquipmentPanel from './EquipmentPanel'
import CharacterInfo from './CharacterInfo'
import StatsDisplay from './StatsDisplay'
import LevelProgress from './LevelProgress'
import ResourceBars from './ResourceBars'

interface CharacterPanelProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
  isLoading: boolean
}

export default function CharacterPanel({ character, onUpdateCharacter, isLoading }: CharacterPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'equipment'>('overview')
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
      description: 'Увеличивает физический урон и здоровье',
      effects: ['Физический урон: +2 за очко', 'Здоровье: +10 за очко']
    },
    {
      key: 'dexterity' as const,
      name: 'Ловкость', 
      description: 'Увеличивает скорость атаки и критический шанс',
      effects: ['Скорость атаки: +0.8% за очко', 'Критический шанс: +0.05% за очко']
    },
    {
      key: 'intelligence' as const,
      name: 'Интеллект',
      description: 'Увеличивает магический урон и ману',
      effects: ['Магический урон: +2.5 за очко', 'Мана: +5 за очко']
    },
    {
      key: 'vitality' as const,
      name: 'Живучесть',
      description: 'Увеличивает здоровье и защиту',
      effects: ['Здоровье: +10 за очко', 'Защита: +1.5 за очко']
    },
    {
      key: 'energy' as const,
      name: 'Энергия',
      description: 'Увеличивает ману и магическую защиту',
      effects: ['Мана: +5 за очко', 'Магическая защита: +1 за очко']
    },
    {
      key: 'luck' as const,
      name: 'Удача',
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

    // Recalculate derived stats - round to integers
    const maxHealth = Math.round(newStats.vitality * 10 + 100)
    const maxMana = Math.round(newStats.energy * 5 + 50)
    const maxStamina = Math.round(newStats.vitality * 5 + newStats.dexterity * 3 + 100)

    const updates = {
      ...newStats,
      max_health: maxHealth,
      max_mana: maxMana,
      max_stamina: maxStamina,
      health: Math.min(character.health, maxHealth),
      mana: Math.min(character.mana, maxMana),
      stamina: Math.min(character.stamina, maxStamina),
      attack_damage: Math.round(newStats.strength * 2 + newStats.dexterity),
      magic_damage: Math.round(newStats.intelligence * 2.5),
      defense: Math.round(newStats.vitality * 1.5 + newStats.strength * 0.5),
      magic_resistance: Math.round(newStats.energy + newStats.intelligence * 0.3),
      critical_chance: Math.round(Math.min(newStats.luck * 0.1 + newStats.dexterity * 0.05, 50) * 100) / 100,
      critical_damage: Math.round((150 + newStats.strength * 0.5) * 100) / 100,
      attack_speed: Math.round((100 + newStats.dexterity * 0.8) * 100) / 100,
      movement_speed: Math.round((100 + newStats.dexterity * 0.5) * 100) / 100
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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Character Info */}
      <CharacterInfo character={character} showFullStats={false} />
      
      {/* Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="game-panel p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary-400" />
            <span>Ресурсы</span>
          </h3>
          <ResourceBars character={character} />
        </div>
        
        <div className="game-panel p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Crown className="w-5 h-5 text-gold-400" />
            <span>Прогресс</span>
          </h3>
          <LevelProgress character={character} />
        </div>
      </div>
    </div>
  )

  const renderStats = () => (
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
                        className="w-7 h-7 rounded bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-red-400"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <div className="w-8 text-center text-sm text-white font-semibold">
                        {tempValue}
                      </div>

                      <button
                        onClick={() => adjustTempStat(stat.key, 1)}
                        disabled={remainingPoints <= 0}
                        className="w-7 h-7 rounded bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-green-400"
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
              className="px-4 py-2 bg-dark-300/20 text-dark-400 rounded-md border border-dark-300/50"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Combat Stats */}
      <div className="game-panel p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-red-400" />
          <span>Боевые характеристики</span>
        </h2>
        <StatsDisplay character={character} />
      </div>
    </div>
  )

  return (
    <div className="flex-1 game-content p-6 space-y-6">
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
        {activeTab === 'stats' && (
          <div className="text-right">
            <div className="text-sm text-dark-400">Доступно очков:</div>
            <div className="text-2xl font-bold text-primary-400">{remainingPoints}</div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-dark-200/30 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors duration-200 ${
            activeTab === 'overview'
              ? 'bg-primary-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-dark-300/50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Обзор</span>
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors duration-200 ${
            activeTab === 'stats'
              ? 'bg-primary-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-dark-300/50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Характеристики</span>
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors duration-200 ${
            activeTab === 'equipment'
              ? 'bg-primary-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-dark-300/50'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Экипировка</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'stats' && renderStats()}
      {activeTab === 'equipment' && (
        <EquipmentPanel 
          character={character}
          onUpdateCharacter={onUpdateCharacter}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}