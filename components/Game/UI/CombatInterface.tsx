'use client'

import { useState, useEffect } from 'react'
import { Character, Mob, CombatLog } from '@/types/game'
import { Sword, Shield, Zap, Target, Clock, Award, Heart, Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

interface CombatInterfaceProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
  isLoading?: boolean
  className?: string
}

interface CombatState {
  isInCombat: boolean
  currentMob: Mob | null
  combatProgress: number
  timeRemaining: number
  lastAttack: number
}

export default function CombatInterface({ character, onUpdateCharacter, isLoading = false, className = '' }: CombatInterfaceProps) {
  const [availableMobs, setAvailableMobs] = useState<Mob[]>([])
  const [combatLogs, setCombatLogs] = useState<CombatLog[]>([])
  const [selectedMob, setSelectedMob] = useState<Mob | null>(null)
  const [combatState, setCombatState] = useState<CombatState>({
    isInCombat: false,
    currentMob: null,
    combatProgress: 0,
    timeRemaining: 0,
    lastAttack: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMobs()
    loadCombatLogs()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (combatState.isInCombat && combatState.currentMob) {
      interval = setInterval(() => {
        performCombatTick()
      }, 1000) // Combat tick every second
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [combatState.isInCombat, combatState.currentMob])

  const loadMobs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('mobs')
        .select('*')
        .order('level')

      if (error) {
        console.error('Error loading mobs:', error)
        toast.error('Ошибка загрузки мобов')
        return
      }

      setAvailableMobs(data || [])
    } catch (error) {
      console.error('Error loading mobs:', error)
      toast.error('Ошибка подключения к серверу')
    } finally {
      setLoading(false)
    }
  }

  const loadCombatLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('combat_logs')
        .select('*')
        .eq('character_id', character.id)
        .order('timestamp', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error loading combat logs:', error)
        return
      }

      setCombatLogs(data || [])
    } catch (error) {
      console.error('Error loading combat logs:', error)
    }
  }

  const canFightMob = (mob: Mob) => {
    const levelDiff = Math.abs(character.level - mob.level)
    return levelDiff <= 5 // Can fight mobs within 5 levels
  }

  const getMobDifficulty = (mob: Mob) => {
    const levelDiff = mob.level - character.level
    if (levelDiff > 3) return { color: 'text-red-400', label: 'Очень сложно' }
    if (levelDiff > 1) return { color: 'text-orange-400', label: 'Сложно' }
    if (levelDiff < -1) return { color: 'text-green-400', label: 'Легко' }
    return { color: 'text-yellow-400', label: 'Нормально' }
  }

  const calculateCombatStats = (mob: Mob) => {
    const characterDamage = character.attack_damage
    const mobDamage = mob.attack_damage
    const characterDefense = character.defense
    const mobDefense = mob.defense

    // Simple combat calculation
    const damageToMob = Math.max(1, characterDamage - mobDefense)
    const damageToCharacter = Math.max(1, mobDamage - characterDefense)

    const timeToKillMob = Math.ceil(mob.health / damageToMob)
    const timeToDie = Math.ceil(character.health / damageToCharacter)

    return {
      damageToMob,
      damageToCharacter,
      timeToKillMob,
      timeToDie,
      canWin: timeToKillMob < timeToDie
    }
  }

  const startCombat = async (mob: Mob) => {
    if (combatState.isInCombat) {
      toast.error('Уже в бою!')
      return
    }

    const combatStats = calculateCombatStats(mob)
    if (!combatStats.canWin) {
      toast.error('Слишком сильный противник!')
      return
    }

    try {
      const { data, error } = await (supabase as any).rpc('initiate_combat', {
        character_id: character.id,
        mob_id: mob.id
      })

      if (error) {
        console.error('Error starting combat:', error)
        toast.error('Ошибка начала боя')
        return
      }

      setCombatState({
        isInCombat: true,
        currentMob: mob,
        combatProgress: 0,
        timeRemaining: combatStats.timeToKillMob,
        lastAttack: Date.now()
      })

      // Update character status
      await onUpdateCharacter({
        is_in_combat: true
      })

      toast.success(`Бой с ${mob.name} начался!`)
    } catch (error) {
      console.error('Error starting combat:', error)
      toast.error('Ошибка подключения к серверу')
    }
  }

  const performCombatTick = async () => {
    if (!combatState.currentMob) return

    const now = Date.now()
    const timeSinceLastAttack = now - combatState.lastAttack
    const attackInterval = 2000 // Attack every 2 seconds

    if (timeSinceLastAttack >= attackInterval) {
      try {
        const { data, error } = await (supabase as any).rpc('perform_attack', {
          character_id: character.id,
          skill_id: null
        })

        if (error) {
          console.error('Error performing attack:', error)
          return
        }

        if (data) {
          const { victory, damage_dealt, damage_taken, experience_gained, gold_gained } = data

          // Update combat progress
          const newProgress = Math.min(100, combatState.combatProgress + (damage_dealt / combatState.currentMob.health) * 100)
          
          setCombatState(prev => ({
            ...prev,
            combatProgress: newProgress,
            timeRemaining: Math.max(0, prev.timeRemaining - 1),
            lastAttack: now
          }))

          if (victory) {
            // Combat won
            await endCombat(true, experience_gained, gold_gained)
          } else if (damage_taken >= character.health) {
            // Character died
            await endCombat(false, 0, 0)
          }
        }
      } catch (error) {
        console.error('Error performing attack:', error)
      }
    }
  }

  const endCombat = async (victory: boolean, experienceGained: number, goldGained: number) => {
    setCombatState({
      isInCombat: false,
      currentMob: null,
      combatProgress: 0,
      timeRemaining: 0,
      lastAttack: 0
    })

    // Update character status
    await onUpdateCharacter({
      is_in_combat: false,
      experience: character.experience + experienceGained,
      gold: character.gold + goldGained
    })

    if (victory) {
      toast.success(`Победа! Получено: ${experienceGained} опыта, ${goldGained} золота`)
    } else {
      toast.error('Поражение!')
    }

    // Reload combat logs
    loadCombatLogs()
  }

  const stopCombat = async () => {
    if (!combatState.isInCombat) return

    setCombatState({
      isInCombat: false,
      currentMob: null,
      combatProgress: 0,
      timeRemaining: 0,
      lastAttack: 0
    })

    await onUpdateCharacter({
      is_in_combat: false
    })

    toast.success('Бой остановлен')
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center space-x-2 text-white">
          <div className="loading-spinner" />
          <span>Загрузка боевой системы...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sword className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Боевая система</h3>
        </div>
        
        {combatState.isInCombat && (
          <button
            onClick={stopCombat}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg"
          >
            Остановить бой
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Combat Status */}
        <div className="space-y-4">
          {combatState.isInCombat && combatState.currentMob ? (
            <div className="game-panel p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Target className="w-5 h-5 text-red-400" />
                <span>Текущий бой</span>
              </h4>
              
              <div className="space-y-4">
                <div className="text-center">
                  <h5 className="text-xl font-bold text-white">{combatState.currentMob.name}</h5>
                  <p className="text-sm text-gray-400">Уровень {combatState.currentMob.level}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Прогресс боя</span>
                    <span className="text-white font-medium">{Math.round(combatState.combatProgress)}%</span>
                  </div>
                  <div className="w-full h-3 bg-dark-300 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300"
                      style={{ width: `${combatState.combatProgress}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-400">Время до победы</div>
                    <div className="text-white font-medium">{combatState.timeRemaining}с</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Здоровье моба</div>
                    <div className="text-white font-medium">
                      {Math.round(combatState.currentMob.health * (1 - combatState.combatProgress / 100))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="game-panel p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span>Статус боя</span>
              </h4>
              
              <div className="text-center text-gray-400">
                <Sword className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Не в бою</p>
                <p className="text-sm">Выберите противника для начала боя</p>
              </div>
            </div>
          )}

          {/* Available Mobs */}
          <div className="game-panel p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Доступные противники</h4>
            
            <div className="space-y-3">
              {availableMobs.map((mob) => {
                const difficulty = getMobDifficulty(mob)
                const canFight = canFightMob(mob)
                const combatStats = calculateCombatStats(mob)

                return (
                  <div
                    key={mob.id}
                    className={`p-4 rounded-lg border-2 transition-colors duration-200 ${
                      canFight
                        ? 'border-blue-500/50 bg-blue-500/5 cursor-pointer'
                        : 'border-gray-500/50 bg-gray-500/5 opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => canFight && !combatState.isInCombat && startCombat(mob)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-white">{mob.name}</h5>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${difficulty.color}`}>
                          {difficulty.label}
                        </span>
                        <span className="text-xs text-gray-400">
                          Ур. {mob.level}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {mob.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                      <div>
                        <div>Здоровье: {mob.health}</div>
                        <div>Урон: {mob.attack_damage}</div>
                      </div>
                      <div>
                        <div>Защита: {mob.defense}</div>
                        <div>Награда: {mob.experience_reward} опыта</div>
                      </div>
                    </div>
                    
                    {canFight && !combatState.isInCombat && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          startCombat(mob)
                        }}
                        className="w-full mt-3 px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm"
                      >
                        Начать бой
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Combat Logs */}
        <div className="space-y-4">
          <div className="game-panel p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-400" />
              <span>Журнал боев</span>
            </h4>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {combatLogs.length > 0 ? (
                combatLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-lg border ${
                      log.victory
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-red-500/50 bg-red-500/5'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-white">Моб #{log.mob_id}</span>
                      <span className={`text-sm ${log.victory ? 'text-green-400' : 'text-red-400'}`}>
                        {log.victory ? 'Победа' : 'Поражение'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                      <div>Урон: {log.damage_dealt}</div>
                      <div>Получено: {log.damage_taken}</div>
                      <div>Опыт: +{log.experience_gained}</div>
                      <div>Золото: +{log.gold_gained}</div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Нет записей о боях</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}