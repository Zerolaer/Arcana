'use client'

import { useState, useEffect, useCallback } from 'react'
import { Character } from '@/types/game'
import { toast } from 'react-hot-toast'
import { Plus, Minus, RotateCcw, Crown, TrendingUp, Sword, Shield, Star, Zap, Eye, Package } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { GameItem } from '../../UI/ItemTooltip'
import ItemTooltip from '../../UI/ItemTooltip'

interface CharacterPanelProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
  isLoading: boolean
}

interface EquipmentSlot {
  slotType: string
  item?: GameItem
  currentDurability?: number
  upgradeLevel?: number
  equippedAt?: string
}

const equipmentSlots = [
  { key: 'weapon', name: 'Основное оружие', icon: <Sword className="w-5 h-5 text-red-400" />, position: 'top-left' },
  { key: 'offhand', name: 'Доп. оружие', icon: <Sword className="w-5 h-5 text-orange-400" />, position: 'top-right' },
  { key: 'helmet', name: 'Голова', icon: <Crown className="w-5 h-5 text-blue-400" />, position: 'left' },
  { key: 'earrings', name: 'Серьги', icon: <Star className="w-5 h-5 text-pink-400" />, position: 'right' },
  { key: 'armor', name: 'Доспехи', icon: <Shield className="w-5 h-5 text-green-400" />, position: 'left' },
  { key: 'amulet', name: 'Ожерелье', icon: <Crown className="w-5 h-5 text-gold-400" />, position: 'right' },
  { key: 'belt', name: 'Пояс', icon: <Zap className="w-5 h-5 text-yellow-400" />, position: 'left' },
  { key: 'ring1', name: 'Кольцо 1', icon: <Star className="w-5 h-5 text-purple-400" />, position: 'right' },
  { key: 'pants', name: 'Поножи', icon: <Shield className="w-5 h-5 text-cyan-400" />, position: 'left' },
  { key: 'ring2', name: 'Кольцо 2', icon: <Star className="w-5 h-5 text-purple-400" />, position: 'right' },
  { key: 'boots', name: 'Ботинки', icon: <Eye className="w-5 h-5 text-indigo-400" />, position: 'bottom' }
]

export default function CharacterPanelUnified({ character, onUpdateCharacter, isLoading }: CharacterPanelProps) {
  const [tempStats, setTempStats] = useState({
    strength: 0,
    dexterity: 0,
    intelligence: 0,
    vitality: 0,
    energy: 0,
    luck: 0
  })
  const [equipment, setEquipment] = useState<EquipmentSlot[]>([])
  const [equipmentLoading, setEquipmentLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<{ item: GameItem, slotType: string } | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const totalAllocatedPoints = Object.values(tempStats).reduce((sum, val) => sum + val, 0)
  const remainingPoints = character.stat_points - totalAllocatedPoints

  const statInfo = [
    {
      key: 'strength' as const,
      name: 'Сила',
      icon: <Sword className="w-4 h-4 text-red-400" />,
      effects: ['Физический урон: +2 за очко', 'Здоровье: +10 за очко']
    },
    {
      key: 'dexterity' as const,
      name: 'Ловкость', 
      icon: <Zap className="w-4 h-4 text-yellow-400" />,
      effects: ['Скорость атаки: +0.8% за очко', 'Критический шанс: +0.05% за очко']
    },
    {
      key: 'intelligence' as const,
      name: 'Интеллект',
      icon: <Eye className="w-4 h-4 text-blue-400" />,
      effects: ['Магический урон: +2.5 за очко', 'Мана: +5 за очко']
    },
    {
      key: 'vitality' as const,
      name: 'Живучесть',
      icon: <Shield className="w-4 h-4 text-green-400" />,
      effects: ['Здоровье: +10 за очко', 'Защита: +1.5 за очко']
    },
    {
      key: 'energy' as const,
      name: 'Энергия',
      icon: <Star className="w-4 h-4 text-purple-400" />,
      effects: ['Мана: +5 за очко', 'Магическая защита: +1 за очко']
    },
    {
      key: 'luck' as const,
      name: 'Удача',
      icon: <Crown className="w-4 h-4 text-gold-400" />,
      effects: ['Критический шанс: +0.1% за очко', 'Редкие предметы: +0.05% за очко']
    }
  ]

  // Загрузка экипировки
  const loadEquipment = useCallback(async () => {
    try {
      setEquipmentLoading(true)
      
      const { data, error } = await (supabase as any)
        .rpc('get_character_equipment', { p_character_id: character.id })

      if (error) {
        console.error('Error loading equipment:', error)
        return
      }

      const equipmentData = equipmentSlots.map(slot => {
        const equippedItem = data?.find((item: any) => item.slot_type === slot.key)
        
        if (equippedItem) {
          return {
            slotType: slot.key,
            item: {
              id: equippedItem.item.id,
              name: equippedItem.item.name,
              description: equippedItem.item.description,
              rarity: equippedItem.item.rarity,
              type: equippedItem.item.type,
              subType: equippedItem.item.subType,
              icon: equippedItem.item.icon,
              level: equippedItem.item.level,
              stats: equippedItem.item.stats,
              value: equippedItem.item.value,
              stackable: false,
              stackSize: 1,
              durability: equippedItem.item.durability,
              setBonus: equippedItem.item.setBonus,
              requirements: equippedItem.item.requirements
            },
            currentDurability: equippedItem.current_durability,
            upgradeLevel: equippedItem.upgrade_level,
            equippedAt: equippedItem.equipped_at
          }
        } else {
          return {
            slotType: slot.key,
            item: undefined
          }
        }
      })

      setEquipment(equipmentData)
    } catch (error) {
      console.error('Error loading equipment:', error)
    } finally {
      setEquipmentLoading(false)
    }
  }, [character.id])

  useEffect(() => {
    loadEquipment()
  }, [loadEquipment])

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

    // Recalculate derived stats
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

  // Функция для снятия экипировки
  const unequipItem = async (slotType: string) => {
    try {
      const { error } = await (supabase as any)
        .rpc('unequip_item', { 
          p_character_id: character.id, 
          p_slot_type: slotType 
        })

      if (error) {
        console.error('Error unequipping item:', error)
        toast.error('Ошибка снятия предмета')
        return
      }

      toast.success('Предмет снят')
      loadEquipment() // Перезагружаем экипировку
    } catch (error) {
      console.error('Error unequipping item:', error)
      toast.error('Ошибка снятия предмета')
    }
  }

  return (
    <div className="flex-1 game-content p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Crown className="w-5 h-5 text-gold-400" />
            <span>Персонаж</span>
          </h1>
          <p className="text-dark-400 text-sm">Развитие и характеристики вашего героя</p>
        </div>

        {/* Available Points */}
        <div className="text-right">
          <div className="text-xs text-dark-400">Доступно очков:</div>
          <div className="text-xl font-bold text-primary-400">{remainingPoints}</div>
        </div>
      </div>

      {/* Main Content - Three Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-full">
        
        {/* 1. Характеристики */}
        <div className="game-panel p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span>Характеристики</span>
          </h2>

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
                          className="w-6 h-6 rounded bg-red-500/20 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-red-400 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <div className="w-6 text-center text-xs text-white font-semibold">
                          {tempValue}
                        </div>

                        <button
                          onClick={() => adjustTempStat(stat.key, 1)}
                          disabled={remainingPoints <= 0}
                          className="w-6 h-6 rounded bg-green-500/20 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-green-400 transition-colors relative group"
                        >
                          <Plus className="w-3 h-3" />
                          
                          {/* Tooltip */}
                          <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                            <div className="bg-dark-100 border border-dark-300 rounded-lg p-3 text-xs text-white whitespace-nowrap shadow-xl">
                              <div className="text-gray-300 mb-1">Текущее значение:</div>
                              <div className="text-white font-semibold mb-2">{currentValue}</div>
                              <div className="text-green-400 font-semibold">
                                +{tempValue + 1} → {totalValue + 1}
                              </div>
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
                className="px-3 py-2 bg-dark-300/20 hover:bg-dark-300/40 text-dark-400 hover:text-white rounded-md transition-all duration-200 border border-dark-300/50"
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
              { name: 'Физический урон', value: Math.floor(character.attack_damage), icon: '⚔️' },
              { name: 'Магический урон', value: Math.floor(character.magic_damage), icon: '🔮' },
              { name: 'Защита', value: Math.floor(character.defense), icon: '🛡️' },
              { name: 'Магическая защита', value: Math.floor(character.magic_resistance), icon: '✨' },
              { name: 'Критический шанс', value: `${character.critical_chance.toFixed(1)}%`, icon: '💥' },
              { name: 'Критический урон', value: `${character.critical_damage.toFixed(0)}%`, icon: '⚡' },
              { name: 'Скорость атаки', value: `${character.attack_speed.toFixed(0)}%`, icon: '🏃' },
              { name: 'Скорость движения', value: `${character.movement_speed.toFixed(0)}%`, icon: '💨' },
              { name: 'Регенерация HP', value: `${(character.health_regen || 1.0).toFixed(1)}/сек`, icon: '❤️', color: 'text-red-400' },
              { name: 'Регенерация MP', value: `${(character.mana_regen || 1.0).toFixed(1)}/сек`, icon: '💙', color: 'text-blue-400' },
              { name: 'Регенерация Stamina', value: `${(character.stamina_regen || 1.0).toFixed(1)}/сек`, icon: '💚', color: 'text-green-400' }
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

          {/* Equipment Grid 2x6 */}
          <div className="grid grid-cols-2 gap-2">
            {equipmentSlots.map((slot) => {
              const equippedItem = equipment.find(eq => eq.slotType === slot.key)
              
              return (
                <div key={slot.key} className="relative">
                  <div 
                    className="w-16 h-16 bg-dark-200/30 border-2 border-dashed border-dark-300/50 rounded-lg flex flex-col items-center justify-center p-1 cursor-pointer hover:border-dark-300/70 transition-colors"
                    onClick={(e) => {
                      if (equippedItem?.item) {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setTooltipPosition({
                          x: rect.right + 10,
                          y: rect.top
                        })
                        setSelectedItem({
                          item: equippedItem.item,
                          slotType: slot.key
                        })
                      }
                    }}
                  >
                    {equippedItem?.item ? (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="text-lg mb-0.5">{equippedItem.item.icon}</div>
                        <div className="text-xs text-center text-white font-semibold truncate w-full leading-tight">
                          {equippedItem.item.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {equippedItem.item.level} ур.
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        <div className="opacity-50 text-sm">{slot.icon}</div>
                        <div className="text-xs text-center mt-0.5 leading-tight">{slot.name}</div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Equipment Item Tooltip */}
      {selectedItem && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <div className="bg-dark-100 border border-dark-300 rounded-lg p-4 shadow-xl max-w-xs">
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-lg">{selectedItem.item.icon}</div>
              <div>
                <div className="text-white font-semibold text-sm">{selectedItem.item.name}</div>
                <div className="text-gray-400 text-xs">Уровень {selectedItem.item.level}</div>
              </div>
            </div>
            
            <div className="text-xs text-gray-300 mb-3">
              {selectedItem.item.description}
            </div>

            {selectedItem.item.stats && Object.keys(selectedItem.item.stats).length > 0 && (
              <div className="space-y-1 mb-3">
                {Object.entries(selectedItem.item.stats).map(([key, value]) => (
                  <div key={key} className="text-xs text-green-400">
                    +{value} {key}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                unequipItem(selectedItem.slotType)
                setSelectedItem(null)
              }}
              className="w-full px-3 py-1 bg-red-500/80 hover:bg-red-500 text-white text-xs rounded transition-colors pointer-events-auto"
            >
              Снять предмет
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close tooltip */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSelectedItem(null)}
        />
      )}
    </div>
  )
}
