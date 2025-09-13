'use client'

import { useState, useEffect } from 'react'
import { Character } from '@/types/game'
import { Mob } from '@/types/world'

interface CombatDisplayProps {
  character: Character
  mobs: Mob[]
  isVisible: boolean
  onCombatEnd: (result: CombatResult) => void
}

interface CombatResult {
  success: boolean
  experience: number
  gold: number
  finalHealth: number
  finalMana: number
  damageTaken: number
  manaUsed: number
  mobsDefeated: number
}

interface CombatState {
  currentMobs: Mob[]
  currentHealth: number
  currentMana: number
  round: number
  isPlayerTurn: boolean
  lastAction: string
  lastDamage: number
  lastMobDamage: number
}

export default function CombatDisplay({ 
  character, 
  mobs, 
  isVisible, 
  onCombatEnd 
}: CombatDisplayProps) {
  const [combatState, setCombatState] = useState<CombatState>({
    currentMobs: [...mobs],
    currentHealth: character.health,
    currentMana: character.mana,
    round: 0,
    isPlayerTurn: true,
    lastAction: '',
    lastDamage: 0,
    lastMobDamage: 0
  })

  const [isCombatActive, setIsCombatActive] = useState(false)
  const [combatProgress, setCombatProgress] = useState(0)

  // Инициализация боя
  useEffect(() => {
    if (isVisible && !isCombatActive) {
      setIsCombatActive(true)
      setCombatState({
        currentMobs: [...mobs],
        currentHealth: character.health,
        currentMana: character.mana,
        round: 0,
        isPlayerTurn: true,
        lastAction: '',
        lastDamage: 0,
        lastMobDamage: 0
      })
      setCombatProgress(0)
    }
  }, [isVisible, isCombatActive])

  // Основной цикл боя
  useEffect(() => {
    if (!isCombatActive || !isVisible) return

    const combatLoop = async () => {
      // Проверяем условия окончания боя
      if (combatState.currentMobs.length === 0) {
        // Победа
        const result: CombatResult = {
          success: true,
          experience: mobs.reduce((sum, mob) => sum + mob.experience_reward, 0),
          gold: mobs.reduce((sum, mob) => sum + mob.gold_reward, 0),
          finalHealth: combatState.currentHealth,
          finalMana: combatState.currentMana,
          damageTaken: character.health - combatState.currentHealth,
          manaUsed: character.mana - combatState.currentMana,
          mobsDefeated: mobs.length
        }
        setIsCombatActive(false)
        onCombatEnd(result)
        return
      }

      if (combatState.currentHealth <= 0) {
        // Поражение
        const result: CombatResult = {
          success: false,
          experience: 0,
          gold: 0,
          finalHealth: 0,
          finalMana: combatState.currentMana,
          damageTaken: character.health,
          manaUsed: character.mana - combatState.currentMana,
          mobsDefeated: mobs.length - combatState.currentMobs.length
        }
        setIsCombatActive(false)
        onCombatEnd(result)
        return
      }

      // Выполняем ход
      await executeTurn()
    }

    const executeTurn = async () => {
      if (combatState.isPlayerTurn) {
        // Ход игрока
        await playerTurn()
      } else {
        // Ход мобов
        await mobTurn()
      }
    }

    const playerTurn = async () => {
      const target = combatState.currentMobs[0]
      if (!target) return

      // Простая автоатака
      const damage = Math.max(1, character.attack_damage - target.defense)
      const newMobs = [...combatState.currentMobs]
      const targetIndex = newMobs.findIndex(m => m.id === target.id)
      
      if (targetIndex !== -1) {
        newMobs[targetIndex].health = Math.max(0, newMobs[targetIndex].health - damage)
      }

      setCombatState(prev => ({
        ...prev,
        currentMobs: newMobs.filter(mob => mob.health > 0),
        round: prev.round + 1,
        isPlayerTurn: false,
        lastAction: `Вы атакуете ${target.name}`,
        lastDamage: damage
      }))

      // Обновляем прогресс
      const totalMobHealth = mobs.reduce((sum, mob) => sum + mob.health, 0)
      const currentMobHealth = newMobs.reduce((sum, mob) => sum + mob.health, 0)
      const progress = Math.max(0, ((totalMobHealth - currentMobHealth) / totalMobHealth) * 100)
      setCombatProgress(progress)

      // Пауза между ходами
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const mobTurn = async () => {
      let totalMobDamage = 0
      const aliveMobs = combatState.currentMobs.filter(mob => mob.health > 0)
      
      for (const mob of aliveMobs) {
        const mobDamage = Math.max(1, mob.attack - Math.floor(character.defense * 0.5))
        totalMobDamage += mobDamage
      }

      setCombatState(prev => ({
        ...prev,
        currentHealth: Math.max(0, prev.currentHealth - totalMobDamage),
        isPlayerTurn: true,
        lastAction: `Мобы атакуют вас`,
        lastMobDamage: totalMobDamage
      }))

      // Пауза между ходами
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    combatLoop()
  }, [combatState, isCombatActive, isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-dark-800 rounded-lg p-6 w-full max-w-2xl mx-4">
        {/* Заголовок */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">⚔️ Бой</h2>
          <div className="text-sm text-gray-400">
            Раунд {combatState.round} • {combatState.isPlayerTurn ? 'Ваш ход' : 'Ход мобов'}
          </div>
        </div>

        {/* Прогресс боя */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Прогресс боя</span>
            <span>{Math.round(combatProgress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-red-500 to-yellow-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${combatProgress}%` }}
            />
          </div>
        </div>

        {/* Статы персонажа */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-dark-700 rounded-lg p-4">
            <div className="text-white font-semibold mb-2">👤 Вы</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">HP:</span>
                <span className="text-red-400">{combatState.currentHealth}/{character.max_health}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">MP:</span>
                <span className="text-blue-400">{combatState.currentMana}/{character.max_mana}</span>
              </div>
            </div>
          </div>

          <div className="bg-dark-700 rounded-lg p-4">
            <div className="text-white font-semibold mb-2">👹 Мобы</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Осталось:</span>
                <span className="text-orange-400">{combatState.currentMobs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Всего было:</span>
                <span className="text-gray-400">{mobs.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Последнее действие */}
        {combatState.lastAction && (
          <div className="bg-dark-700 rounded-lg p-4 mb-6">
            <div className="text-white font-semibold mb-2">📝 Последнее действие</div>
            <div className="text-gray-300">
              {combatState.lastAction}
              {combatState.lastDamage > 0 && (
                <span className="text-red-400 ml-2">(-{combatState.lastDamage} HP)</span>
              )}
              {combatState.lastMobDamage > 0 && (
                <span className="text-orange-400 ml-2">(-{combatState.lastMobDamage} HP)</span>
              )}
            </div>
          </div>
        )}

        {/* Список мобов */}
        <div className="space-y-2">
          <div className="text-white font-semibold mb-2">👹 Противники</div>
          {combatState.currentMobs.map((mob, index) => (
            <div key={mob.id} className="bg-dark-700 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{mob.icon}</span>
                <div>
                  <div className="text-white font-medium">{mob.name}</div>
                  <div className="text-sm text-gray-400">Уровень {mob.level}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-red-400 font-semibold">{mob.health} HP</div>
                <div className="text-sm text-gray-400">Атака: {mob.attack}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
