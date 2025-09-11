'use client'

import { useState, useEffect } from 'react'
import { Character } from '@/types/game'
import { Swords, Target, Activity, Award, Clock, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

interface CombatPanelProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
  isLoading: boolean
}

interface Mob {
  id: string
  name: string
  description: string
  level: number
  health: number
  attack_damage: number
  defense: number
  magic_resistance: number
  aggressive: boolean
  respawn_time: number
  experience_reward: number
  gold_reward: number
  image: string
}

interface CombatLog {
  id: string
  mob_name: string
  damage_dealt: number
  damage_taken: number
  victory: boolean
  experience_gained: number
  gold_gained: number
  items_dropped: string[]
  duration: number
  timestamp: string
}

export default function CombatPanel({ character, onUpdateCharacter, isLoading }: CombatPanelProps) {
  const [availableMobs, setAvailableMobs] = useState<Mob[]>([])
  const [combatLogs, setCombatLogs] = useState<CombatLog[]>([])
  const [selectedMob, setSelectedMob] = useState<Mob | null>(null)
  const [loading, setLoading] = useState(true)
  const [inCombat, setInCombat] = useState(false)
  const [combatProgress, setCombatProgress] = useState(0)

  useEffect(() => {
    loadAvailableMobs()
    loadCombatLogs()
  }, [character.current_location_id])

  const loadAvailableMobs = async () => {
    if (!character.current_location_id) {
      setLoading(false)
      return
    }

    try {
      // Get farming spots in current location
      const { data: spots, error: spotsError } = await (supabase
        .from('farming_spots') as any)
        .select(`
          id,
          mob_spawns (
            mob_id,
            mobs (*)
          )
        `)
        .eq('location_id', character.current_location_id)

      if (spotsError) {
        console.error('Error loading mobs:', spotsError)
        return
      }

      // Extract unique mobs
      const mobs: Mob[] = []
      const mobIds = new Set()

      spots?.forEach((spot: any) => {
        spot.mob_spawns?.forEach((spawn: any) => {
          const mob = spawn.mobs
          if (mob && !mobIds.has(mob.id)) {
            mobIds.add(mob.id)
            mobs.push(mob as Mob)
          }
        })
      })

      setAvailableMobs(mobs.sort((a, b) => a.level - b.level))
    } catch (error) {
      console.error('Error loading mobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCombatLogs = async () => {
    try {
      const { data, error } = await (supabase
        .from('combat_logs') as any)
        .select('*')
        .eq('character_id', character.id)
        .order('timestamp', { ascending: false })
        .limit(10)

      if (!error && data) {
        setCombatLogs(data.map((log: any) => ({
          ...log,
          mob_name: 'Враг' // We'll need to join with mobs table later
        })))
      }
    } catch (error) {
      console.error('Error loading combat logs:', error)
    }
  }

  const simulateCombat = async (mob: Mob) => {
    if (!character.current_location_id) {
      toast.error('Вы должны находиться в локации для начала боя')
      return
    }

    setInCombat(true)
    setCombatProgress(0)
    
    // Update character state
    await onUpdateCharacter({ is_in_combat: true })

    // Simulate combat duration
    const combatDuration = Math.random() * 3 + 2 // 2-5 seconds
    const startTime = Date.now()
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min((elapsed / (combatDuration * 1000)) * 100, 100)
      setCombatProgress(progress)
      
      if (progress >= 100) {
        clearInterval(progressInterval)
        completeCombat(mob)
      }
    }, 50)
  }

  const completeCombat = async (mob: Mob) => {
    // Calculate combat results
    const playerPower = character.attack_damage + character.magic_damage + character.defense
    const mobPower = mob.attack_damage + mob.defense
    
    const victory = playerPower > mobPower * 0.7 // Player has advantage
    
    let experienceGained = 0
    let goldGained = 0
    let damageTaken = 0
    let droppedItems: string[] = []
    
    if (victory) {
      experienceGained = Math.floor(mob.experience_reward * (1 + Math.random() * 0.2))
      goldGained = Math.floor(mob.gold_reward * (1 + Math.random() * 0.3))
      damageTaken = Math.floor(mob.attack_damage * 0.3)
      
      // Дроп предметов - временная простая реализация
      try {
        console.log('🎯 Processing loot for mob:', mob.name, 'ID:', mob.id)
        
        // Получаем таблицу лута для моба
        const { data: mobData, error: mobError } = await supabase
          .from('mobs')
          .select('loot_table_id')
          .eq('id', mob.id)
          .single()
        
        if (mobError) {
          console.error('Error getting mob loot table:', mobError)
          return
        }
        
        if (!mobData || !(mobData as any).loot_table_id) {
          console.log('❌ No loot table for mob:', mob.name)
          return
        }
        
        console.log('📦 Mob loot table ID:', (mobData as any).loot_table_id)
        
        // Получаем предметы из таблицы лута
        const { data: lootData, error: lootError } = await supabase
          .from('loot_drops')
          .select(`
            drop_rate,
            quantity_min,
            quantity_max,
            items (
              id,
              name,
              icon,
              item_type,
              rarity
            )
          `)
          .eq('loot_table_id', (mobData as any).loot_table_id)
        
        if (lootError) {
          console.error('Error getting loot drops:', lootError)
          return
        }
        
        console.log('🎲 Loot drops found:', lootData?.length || 0)
        
        if (lootData && lootData.length > 0) {
          const droppedItemsList: string[] = []
          
          for (const drop of lootData) {
            const randomChance = Math.random() * 100
            console.log(`🎲 Rolling for ${(drop as any).items.name}: ${randomChance.toFixed(2)}% vs ${(drop as any).drop_rate}%`)
            
            if (randomChance <= (drop as any).drop_rate) {
              const quantity = Math.floor(Math.random() * ((drop as any).quantity_max - (drop as any).quantity_min + 1)) + (drop as any).quantity_min
              
              // Добавляем предмет в инвентарь
              const { error: addError } = await (supabase as any)
                .from('character_inventory')
                .insert({
                  character_id: character.id,
                  item_id: (drop as any).items.id,
                  quantity: quantity,
                  slot_position: Math.floor(Math.random() * 100) + 1 // Временное решение
                })
              
              if (!addError) {
                droppedItemsList.push(`${(drop as any).items.name} x${quantity}`)
                console.log(`✅ Dropped: ${(drop as any).items.name} x${quantity}`)
              } else {
                console.error('Error adding item to inventory:', addError)
              }
            }
          }
          
          droppedItems = droppedItemsList
        }
        
      } catch (error) {
        console.error('Error processing loot:', error)
      }
    } else {
      damageTaken = Math.floor(mob.attack_damage * 0.8)
    }

    // Update character
    const newHealth = Math.max(1, character.health - damageTaken)
    const newExperience = character.experience + experienceGained
    const newGold = character.gold + goldGained

    // Check for level up
    let levelUp = false
    let newLevel = character.level
    let newExperienceToNext = character.experience_to_next
    let newStatPoints = character.stat_points
    let newSkillPoints = character.skill_points

    if (newExperience >= character.experience_to_next) {
      levelUp = true
      newLevel = character.level + 1
      newExperienceToNext = Math.floor(100 * Math.pow(newLevel + 1, 2.2))
      newStatPoints = character.stat_points + 5
      newSkillPoints = character.skill_points + 1
    }

    const updates = {
      health: newHealth,
      experience: newExperience,
      gold: newGold,
      is_in_combat: false,
      ...(levelUp && {
        level: newLevel,
        experience_to_next: newExperienceToNext,
        stat_points: newStatPoints,
        skill_points: newSkillPoints
      })
    }

    await onUpdateCharacter(updates)

    // Show results
    if (victory) {
      let message = `Победа! +${experienceGained} опыта, +${goldGained} золота`
      if (droppedItems.length > 0) {
        message += `\nПолучено: ${droppedItems.join(', ')}`
      }
      toast.success(message)
      if (levelUp) {
        toast.success(`Поздравляем! Вы достигли ${newLevel} уровня!`, { duration: 5000 })
      }
    } else {
      toast.error(`Поражение! -${damageTaken} здоровья`)
    }

    // Add to combat log
    const logEntry: Partial<CombatLog> = {
      mob_name: mob.name,
      damage_dealt: Math.floor(character.attack_damage * (0.8 + Math.random() * 0.4)),
      damage_taken: damageTaken,
      victory,
      experience_gained: experienceGained,
      gold_gained: goldGained,
      items_dropped: droppedItems,
      duration: 3,
      timestamp: new Date().toISOString()
    }

    setCombatLogs(prev => [logEntry as CombatLog, ...prev.slice(0, 9)])
    setInCombat(false)
    setCombatProgress(0)
  }

  const canFightMob = (mob: Mob) => {
    const levelDifference = mob.level - character.level
    return levelDifference <= 5 && character.health > character.max_health * 0.1
  }

  const getMobDifficultyColor = (mob: Mob) => {
    const levelDifference = mob.level - character.level
    if (levelDifference <= -3) return 'text-gray-400 border-gray-500/30' // Gray (trivial)
    if (levelDifference <= 0) return 'text-green-400 border-green-500/30' // Green (easy)
    if (levelDifference <= 2) return 'text-yellow-400 border-yellow-500/30' // Yellow (medium)
    if (levelDifference <= 5) return 'text-red-400 border-red-500/30' // Red (hard)
    return 'text-purple-400 border-purple-500/30' // Purple (very hard)
  }

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="loading-spinner mr-3" />
        <span className="text-white">Загрузка боевой информации...</span>
      </div>
    )
  }

  return (
    <div className="flex-1 game-content p-4 space-y-4">
      {/* Combat Progress */}
      {inCombat && (
        <div className="game-panel p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="w-5 h-5 text-red-400 animate-pulse" />
            <span className="text-white font-semibold">Идет бой с {selectedMob?.name}...</span>
          </div>
          <div className="w-full bg-dark-300/30 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-100"
              style={{ width: `${combatProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Mobs */}
        <div className="game-panel p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5 text-yellow-400" />
            <span>Доступные противники</span>
          </h2>

          {availableMobs.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {availableMobs.map((mob) => {
                const canFight = canFightMob(mob)
                const difficultyColor = getMobDifficultyColor(mob)

                return (
                  <div
                    key={mob.id}
                    onClick={() => canFight && !inCombat && setSelectedMob(mob)}
                    className={`p-3 rounded border transition-colors duration-200 ${difficultyColor} ${
                      canFight && !inCombat ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                    } ${selectedMob?.id === mob.id ? 'bg-dark-200/50 ring-2 ring-primary-500/50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">{mob.image}</div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white text-sm truncate">{mob.name}</div>
                          <div className="text-xs text-dark-400">Ур. {mob.level}</div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 ml-3">
                        <div className="text-white font-semibold text-sm">{mob.health} HP</div>
                        <div className="text-dark-400 text-xs">{mob.attack_damage} урон</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-dark-300/20">
                      <div className="flex items-center space-x-2">
                        <span className="text-purple-400">+{mob.experience_reward} XP</span>
                        <span className="text-gold-400">+{mob.gold_reward} 🪙</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-dark-400" />
                        <span className="text-dark-400">{mob.respawn_time}с</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🏜️</div>
              <p className="text-dark-400">
                {character.current_location_id 
                  ? 'В этой локации нет противников' 
                  : 'Отправьтесь в локацию, чтобы найти противников'
                }
              </p>
            </div>
          )}
        </div>

        {/* Selected Mob & Combat Actions */}
        <div className="space-y-6">
          {/* Mob Details */}
          {selectedMob && (
            <div className="game-panel p-6">
              <h2 className="text-lg font-bold text-white mb-4">Детали противника</h2>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-4xl">{selectedMob.image}</div>
                <div className="flex-1">
                  <div className="text-xl font-bold text-white">{selectedMob.name}</div>
                  <div className="text-dark-400">Уровень {selectedMob.level}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-dark-200/30 rounded p-3">
                  <div className="text-xs text-dark-400">Здоровье</div>
                  <div className="text-lg font-bold text-red-400">{selectedMob.health}</div>
                </div>
                <div className="bg-dark-200/30 rounded p-3">
                  <div className="text-xs text-dark-400">Урон</div>
                  <div className="text-lg font-bold text-orange-400">{selectedMob.attack_damage}</div>
                </div>
                <div className="bg-dark-200/30 rounded p-3">
                  <div className="text-xs text-dark-400">Защита</div>
                  <div className="text-lg font-bold text-blue-400">{selectedMob.defense}</div>
                </div>
                <div className="bg-dark-200/30 rounded p-3">
                  <div className="text-xs text-dark-400">Маг. защита</div>
                  <div className="text-lg font-bold text-purple-400">{selectedMob.magic_resistance}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm text-dark-400 mb-2">Награды за победу:</div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-purple-400">+{selectedMob.experience_reward} опыта</span>
                  <span className="text-gold-400">+{selectedMob.gold_reward} золота</span>
                </div>
              </div>

              <button
                onClick={() => simulateCombat(selectedMob)}
                disabled={!canFightMob(selectedMob) || inCombat || isLoading}
                className={`w-full game-button flex items-center justify-center space-x-2 ${
                  canFightMob(selectedMob) && !inCombat && !isLoading 
                    ? 'game-button--danger' 
                    : 'game-button--secondary'
                }`}
              >
                <Swords className="w-5 h-5" />
                <span>{inCombat ? 'В бою...' : 'Атаковать'}</span>
              </button>

              {!canFightMob(selectedMob) && (
                <div className="mt-2 text-xs text-red-400 text-center">
                  {character.health <= character.max_health * 0.1 
                    ? 'Недостаточно здоровья для боя'
                    : 'Уровень противника слишком высок'
                  }
                </div>
              )}
            </div>
          )}

          {/* Combat Log - Compact */}
          <div className="game-panel p-4">
            <h2 className="text-md font-bold text-white mb-3 flex items-center space-x-2">
              <Award className="w-4 h-4 text-gold-400" />
              <span>История боев</span>
              <span className="text-xs text-dark-400 font-normal">({combatLogs.length}/10)</span>
            </h2>

            {combatLogs.length > 0 ? (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {combatLogs.slice(0, 5).map((log, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-xs border ${
                      log.victory ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={log.victory ? 'text-green-400' : 'text-red-400'}>
                          {log.victory ? '✓' : '✗'}
                        </span>
                        <span className="text-white font-medium truncate">{log.mob_name}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-dark-400 text-xs">
                        {log.victory && (
                          <>
                            <span className="text-purple-400">+{log.experience_gained} XP</span>
                            <span className="text-gold-400">+{log.gold_gained} 🪙</span>
                          </>
                        )}
                        <span>{new Date(log.timestamp).toLocaleTimeString().slice(0, -3)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {combatLogs.length > 5 && (
                  <div className="text-center text-xs text-dark-500 py-1">
                    ... и еще {combatLogs.length - 5} боев
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-3">
                <div className="text-2xl mb-1">⚔️</div>
                <p className="text-dark-400 text-sm">История боев пуста</p>
                <p className="text-xs text-dark-500">Проведите первый бой</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Combat Tips - Compact */}
      <div className="game-panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">💡 Быстрые советы</h2>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-dark-200/20 rounded border border-dark-300/20">
            <div className="text-lg mb-1">⚔️</div>
            <div className="text-xs font-semibold text-white mb-1">Уровень мобов</div>
            <div className="text-xs text-dark-400">±2 для баланса</div>
          </div>
          
          <div className="text-center p-2 bg-dark-200/20 rounded border border-dark-300/20">
            <div className="text-lg mb-1">💊</div>
            <div className="text-xs font-semibold text-white mb-1">Здоровье</div>
            <div className="text-xs text-dark-400">Следите за HP</div>
          </div>
          
          <div className="text-center p-2 bg-dark-200/20 rounded border border-dark-300/20">
            <div className="text-lg mb-1">🎯</div>
            <div className="text-xs font-semibold text-white mb-1">Развитие</div>
            <div className="text-xs text-dark-400">Улучшайте стат.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
