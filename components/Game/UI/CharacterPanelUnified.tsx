'use client'

import { useState } from 'react'
import { Character } from '@/types/game'
import { toast } from 'react-hot-toast'
import { Plus, Minus, RotateCcw, Crown, TrendingUp, Sword, Shield, Star, Zap, Eye, Package } from 'lucide-react'
import EquipmentComponent from './EquipmentComponent'
import { calculateCharacterStats } from '@/lib/characterStats'
import { syncCharacterStats } from '@/lib/characterSync'

interface CharacterPanelProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
  isLoading: boolean
}



export default function CharacterPanelUnified({ character, onUpdateCharacter, isLoading }: CharacterPanelProps) {
  const [tempStats, setTempStats] = useState({
    agility: 0,
    precision: 0,
    evasion: 0,
    intelligence: 0,
    spell_power: 0,
    resistance: 0,
    strength: 0,
    endurance: 0,
    armor: 0,
    stealth: 0
  })
  const [equipmentKey, setEquipmentKey] = useState(0) // Для принудительного обновления EquipmentComponent
  
  // Рассчитываем актуальные характеристики
  const calculatedStats = calculateCharacterStats(character)

  const totalAllocatedPoints = Object.values(tempStats).reduce((sum, val) => sum + val, 0)
  const remainingPoints = character.stat_points - totalAllocatedPoints

  const statInfo = [
    {
      key: 'agility' as const,
      name: 'Ловкость',
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
      effects: ['Скорость атаки: +1.2% за очко', 'Критический шанс: +0.15% за очко', 'Физический урон: +1.5 за очко']
    },
    {
      key: 'precision' as const,
      name: 'Меткость',
      icon: <Eye className="w-4 h-4 text-blue-400" />,
      effects: ['Точность: +1% за очко', 'Дальность атаки']
    },
    {
      key: 'evasion' as const,
      name: 'Уклонение',
      icon: <Shield className="w-4 h-4 text-green-400" />,
      effects: ['Шанс избежать удара']
    },
    {
      key: 'intelligence' as const,
      name: 'Интеллект',
      icon: <Eye className="w-4 h-4 text-blue-400" />,
      effects: ['Мана: +8 за очко', 'Магический урон: +1 за очко', 'Регенерация маны: +0.1/сек за очко']
    },
    {
      key: 'spell_power' as const,
      name: 'Сила заклинаний',
      icon: <Star className="w-4 h-4 text-purple-400" />,
      effects: ['Магический урон: +3 за очко']
    },
    {
      key: 'resistance' as const,
      name: 'Сопротивление',
      icon: <Shield className="w-4 h-4 text-green-400" />,
      effects: ['Магическая защита: +2.5 за очко']
    },
    {
      key: 'strength' as const,
      name: 'Сила',
      icon: <Sword className="w-4 h-4 text-red-400" />,
      effects: ['Физический урон: +2.5 за очко', 'Критический урон: +0.8% за очко']
    },
    {
      key: 'endurance' as const,
      name: 'Выносливость',
      icon: <Shield className="w-4 h-4 text-green-400" />,
      effects: ['Здоровье: +15 за очко', 'Защита: +1 за очко', 'Регенерация HP: +0.1/сек за очко']
    },
    {
      key: 'armor' as const,
      name: 'Броня',
      icon: <Shield className="w-4 h-4 text-gray-400" />,
      effects: ['Защита: +2 за очко']
    },
    {
      key: 'stealth' as const,
      name: 'Скрытность',
      icon: <Eye className="w-4 h-4 text-indigo-400" />,
      effects: ['Урон из невидимости: +1.8 за очко', 'Шанс критического удара']
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
      agility: 0,
      precision: 0,
      evasion: 0,
      intelligence: 0,
      spell_power: 0,
      resistance: 0,
      strength: 0,
      endurance: 0,
      armor: 0,
      stealth: 0
    })
  }

  const applyStatChanges = async () => {
    if (totalAllocatedPoints === 0) {
      toast.error('Нет изменений для применения')
      return
    }

    const newStats = {
      agility: character.agility + tempStats.agility,
      precision: character.precision + tempStats.precision,
      evasion: character.evasion + tempStats.evasion,
      intelligence: character.intelligence + tempStats.intelligence,
      spell_power: character.spell_power + tempStats.spell_power,
      resistance: character.resistance + tempStats.resistance,
      strength: character.strength + tempStats.strength,
      endurance: character.endurance + tempStats.endurance,
      armor: character.armor + tempStats.armor,
      stealth: character.stealth + tempStats.stealth,
      stat_points: remainingPoints
    }

    // Recalculate derived stats using unified system
    const tempCharacter = { ...character, ...newStats }
    const calculatedStats = calculateCharacterStats(tempCharacter)
    
    const updates = {
      ...newStats,
      ...calculatedStats,
      health: Math.min(character.health, calculatedStats.max_health),
      mana: Math.min(character.mana, calculatedStats.max_mana)
    }

    const success = await onUpdateCharacter(updates)
    if (success) {
      // Синхронизируем характеристики в БД
      await syncCharacterStats({ ...character, ...updates })
      resetTempStats()
      toast.success('Характеристики обновлены!')
    }
  }

  const getStatValue = (stat: keyof typeof tempStats) => {
    return character[stat] + tempStats[stat]
  }

  const getStatEffects = () => []


  return (
    <div className="flex-1 game-content p-4">
      {/* Main Content - Three Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-full">
        
        {/* 1. Характеристики */}
        <div className="game-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <span>Характеристики</span>
            </h2>
            <div className="text-right">
              <div className="text-xs text-dark-400">Доступно очков:</div>
              <div className="text-lg font-bold text-primary-400">{remainingPoints}</div>
            </div>
          </div>

          <div className="space-y-3">
            {statInfo.map((stat) => {
              const currentValue = character[stat.key]
              const tempValue = tempStats[stat.key]
              const totalValue = getStatValue(stat.key)

              return (
                <div key={stat.key} className="border border-dark-300/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 relative group">
                      {stat.icon}
                      <span className="font-semibold text-white text-sm cursor-help">{stat.name}</span>
                      
                      {/* Tooltip for stat effects */}
                      <div className="absolute left-0 top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        <div className="bg-dark-100 border border-dark-300 rounded-lg p-3 text-xs text-white whitespace-nowrap shadow-xl">
                          <div className="text-gray-300 mb-2 font-semibold">Эффекты:</div>
                          {stat.effects.map((effect, index) => (
                            <div key={index} className="text-white mb-1">
                              • {effect}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="font-bold text-white text-sm">
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
                          className="w-6 h-6 rounded bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-red-400"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <div className="w-6 text-center text-xs text-white font-semibold">
                          {tempValue}
                        </div>

                        <button
                          onClick={() => adjustTempStat(stat.key, 1)}
                          disabled={remainingPoints <= 0}
                          className="w-6 h-6 rounded bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-green-400 relative group"
                        >
                          <Plus className="w-3 h-3" />
                          
                          {/* Tooltip */}
                          <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                            <div className="bg-dark-100 border border-dark-300 rounded-lg p-3 text-xs text-white shadow-xl max-w-xs">
                              <div className="text-gray-300 mb-1">Текущее значение:</div>
                              <div className="text-white font-semibold mb-2">{currentValue}</div>
                              <div className="text-green-400 font-semibold mb-2">
                                +{tempValue + 1} → {totalValue + 1}
                              </div>
                              {false && (
                                <div className="border-t border-dark-300 pt-2 mt-2">
                                  <div className="text-gray-300 mb-1">Эффекты:</div>
                                  {[].map((effect, idx) => (
                                    <div key={idx} className="text-green-300 text-xs">
                                      {effect}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Buttons */}
          {totalAllocatedPoints > 0 && (
            <div className="flex space-x-2 mt-4">
              <button
                onClick={applyStatChanges}
                disabled={isLoading}
                className="flex-1 game-button py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Применить
              </button>
              
              <button
                onClick={resetTempStats}
                className="px-3 py-2 bg-dark-300/20 text-dark-400 rounded-md border border-dark-300/50"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 2. Боевые характеристики */}
        <div className="game-panel p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Sword className="w-5 h-5 text-red-400" />
            <span>Боевые характеристики</span>
          </h2>

          <div className="space-y-2">
            {[
              { name: 'Физический урон', value: Math.floor(calculatedStats.attack_damage), icon: '⚔️' },
              { name: 'Магический урон', value: Math.floor(calculatedStats.magic_damage), icon: '🔮' },
              { name: 'Защита', value: Math.floor(calculatedStats.defense), icon: '🛡️' },
              { name: 'Магическая защита', value: Math.floor(calculatedStats.magic_resistance), icon: '✨' },
              { name: 'Критический шанс', value: `${calculatedStats.critical_chance.toFixed(1)}%`, icon: '💥' },
              { name: 'Критический урон', value: `${calculatedStats.critical_damage.toFixed(0)}%`, icon: '⚡' },
              { name: 'Скорость атаки', value: `${calculatedStats.attack_speed.toFixed(0)}%`, icon: '🏃' },
              { name: 'Точность', value: `${calculatedStats.accuracy.toFixed(0)}%`, icon: '🎯' },
              { name: 'Регенерация HP', value: `${Math.round(calculatedStats.health_regen)}/сек`, icon: '❤️', color: 'text-red-400' },
              { name: 'Регенерация MP', value: `${Math.round(calculatedStats.mana_regen)}/сек`, icon: '💙', color: 'text-blue-400' }
            ].map((stat) => (
              <div key={stat.name} className="flex items-center justify-between p-2 bg-dark-200/30 rounded border border-dark-300/30">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{stat.icon}</span>
                  <span className="text-xs text-dark-300">{stat.name}</span>
                </div>
                <span className={`font-semibold text-sm ${stat.color || 'text-white'}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Экипировка */}
        <div className="game-panel p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Package className="w-5 h-5 text-purple-400" />
            <span>Экипировка</span>
          </h2>

          <EquipmentComponent 
            key={equipmentKey}
            character={character}
            onUpdateCharacter={onUpdateCharacter}
            layout="character"
          />
        </div>
      </div>

    </div>
  )
}
