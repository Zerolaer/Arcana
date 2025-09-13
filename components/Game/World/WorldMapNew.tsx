'use client'

import { useState, useEffect } from 'react'
import { Character } from '@/types/game'
import { Continent, Zone, FarmSpot, Mob } from '@/types/world'
import { WORLD_DATA, getAvailableContinents, getAvailableZones } from '@/lib/balancedWorldData'
import { Map, Sword, Users, Trophy, Lock, ChevronRight } from 'lucide-react'
import MobAttackModal from './MobAttackModal'
import { CombatSystem } from '@/lib/combatSystem'
import { processXpGain } from '@/lib/levelSystemV2'
import { useActiveSkills } from '@/lib/useActiveSkills'
import { AutoCombatSystem } from '@/lib/autoCombatSystem'
import { getActiveSkillData } from '@/lib/activeSkills'
import CombatSkillPanel from '../UI/CombatSkillPanel'

// Временная функция для определения класса персонажа
// TODO: Получать название класса из базы данных
function getClassNameFromCharacter(character: Character): string {
  // Fallback: определяем класс по имени персонажа
  const name = character.name?.toLowerCase() || ''
  
  if (name.includes('лучник') || name.includes('archer')) return 'archer'
  else if (name.includes('маг') || name.includes('mage')) return 'mage'
  else if (name.includes('берсерк') || name.includes('berserker')) return 'berserker'
  else if (name.includes('ассасин') || name.includes('assassin')) return 'assassin'
  
  // По умолчанию возвращаем лучника
  return 'archer'
}

interface WorldMapProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
  onUpdateCharacterStats: (updates: Partial<Character>) => void
  activeSkills: ReturnType<typeof useActiveSkills>
}

type ViewMode = 'world' | 'continent' | 'zone'

export default function WorldMapNew({ character, onUpdateCharacter, onUpdateCharacterStats, activeSkills }: WorldMapProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('world')
  const [selectedContinent, setSelectedContinent] = useState<Continent | null>(null)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [selectedSpot, setSelectedSpot] = useState<FarmSpot | null>(null)
  const [hoveredSpot, setHoveredSpot] = useState<FarmSpot | null>(null)
  const [selectedMob, setSelectedMob] = useState<Mob | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [clickedSpot, setClickedSpot] = useState<FarmSpot | null>(null)
  const [showMobSelector, setShowMobSelector] = useState(false)
  const [showBattleModal, setShowBattleModal] = useState(false)
  const [currentBattleSpot, setCurrentBattleSpot] = useState<FarmSpot | null>(null)
  const [battleStarted, setBattleStarted] = useState(false)
  const [battleEnded, setBattleEnded] = useState(false)
  const [battleResult, setBattleResult] = useState<any>(null)
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [combatState, setCombatState] = useState({
    currentMobs: [] as Mob[],
    currentHealth: 0,
    currentMana: 0,
    round: 0,
    isPlayerTurn: true,
    lastAction: '',
    lastDamage: 0,
    lastMobDamage: 0,
    battleLog: [] as string[] // Полная история боя
  })
  const { getActiveSkills } = activeSkills

  // Получаем доступные континенты для текущего уровня игрока
  const availableContinents = getAvailableContinents(character.level)

  // Выбор континента
  const handleContinentSelect = (continent: Continent) => {
    setSelectedContinent(continent)
    setViewMode('continent')
    setSelectedZone(null)
    setSelectedSpot(null)
  }

  // Выбор зоны
  const handleZoneSelect = (zone: Zone) => {
    setSelectedZone(zone)
    setViewMode('zone')
    setSelectedSpot(null)
  }

  // Возврат к миру
  const handleBackToWorld = () => {
    setViewMode('world')
    setSelectedContinent(null)
    setSelectedZone(null)
    setSelectedSpot(null)
  }

  // Возврат к континенту
  const handleBackToContinent = () => {
    setViewMode('continent')
    setSelectedZone(null)
    setSelectedSpot(null)
  }

  // Выбор моба для атаки из правой панели
  const handleMobSelect = (mob: Mob) => {
    setSelectedMob(mob)
    setIsModalOpen(true)
  }

  // Клик по ячейке на карте
  const handleSpotClick = (spot: FarmSpot) => {
    setClickedSpot(spot)
    setCurrentBattleSpot(spot)
    setShowBattleModal(true)
    setBattleStarted(false)
    setSelectedSkillId(null)
    // Сразу начинаем бой без подтверждения
    handleStartBattle()
  }

  // Выбор моба из селектора
  const handleMobSelectFromSpot = (mob: Mob) => {
    setSelectedMob(mob)
    setShowMobSelector(false)
    setClickedSpot(null)
    setIsModalOpen(true)
  }

  // Атака моба
  const handleAttackMob = async (mob: Mob) => {
    try {
      const result = await CombatSystem.simulateCombat(character, mob)
      
      if (result) {
        // Используем новую систему уровней
        const xpResult = processXpGain(character.level, character.experience, result.experience)
        const newGold = character.gold + result.gold
        
        let updates: any = {
          experience: xpResult.newXpProgress,
          gold: newGold,
          health: Math.max(1, character.health - Math.floor(Math.random() * 20)), // Потеря здоровья в бою
        }
        
        // Если повышение уровня
        if (xpResult.levelsGained > 0) {
          const newLevel = xpResult.newLevel
          const newStatPoints = character.stat_points + xpResult.totalStatPointsGained
          
          // Увеличиваем базовые характеристики
          const newMaxHealth = character.max_health + (20 * xpResult.levelsGained)
          const newMaxMana = character.max_mana + (10 * xpResult.levelsGained)
          
          updates = {
            ...updates,
            level: newLevel,
            experience_to_next: xpResult.xpToNext,
            stat_points: newStatPoints,
            max_health: newMaxHealth,
            max_mana: newMaxMana,
            health: newMaxHealth, // Полное восстановление при повышении уровня
            mana: newMaxMana
          }
          
          console.log(`🎉 Повышение уровня! Теперь ${newLevel} уровень! (+${xpResult.levelsGained} уровней)`)
        }
        
        await onUpdateCharacter(updates)
        
        return result
      } else {
        console.log('💀 Вы проиграли бой! Потеряно немного здоровья.')
        
        // Обновляем здоровье после поражения
        const newHealth = Math.max(1, Math.floor(character.health * 0.75))
        await onUpdateCharacter({ health: newHealth })
        
        return null
      }
    } catch (error) {
      console.error('Combat error:', error)
      console.error('Ошибка во время боя')
      return null
    }
  }

  // Закрытие модального окна
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMob(null)
  }

  // Закрытие селектора мобов
  const handleCloseMobSelector = () => {
    setShowMobSelector(false)
    setClickedSpot(null)
  }


  // Повторный бой
  const handleRepeatBattle = () => {
    if (!currentBattleSpot) return
    handleStartBattle()
  }

  // Начало боя
  const handleStartBattle = () => {
    if (!currentBattleSpot) return
    
    console.log('⚔️ Подготавливаем бой на споте:', currentBattleSpot.name)
    setBattleEnded(false)
    setBattleResult(null)
    
    // Создаем копии мобов с сохранением максимального HP
    const mobsWithMaxHealth = currentBattleSpot.mobs.map(mob => ({
      ...mob,
      maxHealth: mob.health // Сохраняем максимальное HP
    }))
    
    setCombatState({
      currentMobs: mobsWithMaxHealth,
      currentHealth: character.health,
      currentMana: character.mana,
      round: 1,
      isPlayerTurn: true,
      lastAction: 'Выберите скилл для атаки',
      lastDamage: 0,
      lastMobDamage: 0,
      battleLog: ['Бой подготовлен! Выберите скилл для атаки.']
    })
    
    // Обновляем HP/MP в хедере при начале боя
    onUpdateCharacterStats({
      health: character.health,
      mana: character.mana
    })
  }

  // Начать бой (когда пользователь нажимает кнопку)
  const handleStartCombat = () => {
    setBattleStarted(true)
    setCombatState(prev => ({
      ...prev,
      lastAction: 'Бой начался!',
      battleLog: [...prev.battleLog, 'Бой начался!']
    }))
  }

  // Начало автофарма
  const handleStartFarming = async (spot: FarmSpot, skills: string[], isAutoFarming: boolean = false, currentHealth?: number, currentMana?: number) => {
    console.log('🌾 Начинаем автофарм на споте:', spot.name, 'с скиллами:', skills)
    
    // Проверяем, есть ли активные скиллы
    if (skills.length === 0) {
      console.log('❌ Нет активных скиллов для боя!')
      alert('❌ Нет активных скиллов для боя! Активируйте хотя бы один скил в панели внизу.')
      return
    }

    try {
      // Используем AutoCombatSystem для автофарма
      const autoCombat = new AutoCombatSystem(character, spot, skills)
      const result = await autoCombat.executeCombat()
      
      console.log('🎯 Результат автофарма:', result)
      
      // Обновляем персонажа
      const xpResult = processXpGain(character.level, character.experience, result.experience)
      
      await onUpdateCharacter({
        level: xpResult.newLevel,
        experience: xpResult.newXpProgress,
        stat_points: character.stat_points + xpResult.totalStatPointsGained,
        max_health: 100 + (character.endurance * 15) + (xpResult.totalStatPointsGained * 5),
        max_mana: 50 + (character.intelligence * 8) + (xpResult.totalStatPointsGained * 3),
        health: result.finalHealth,
        mana: result.finalMana,
        gold: character.gold + result.gold,
        experience_to_next: xpResult.xpToNext
      })
      
      console.log('✅ Автофарм завершен успешно')
    } catch (error) {
      console.error('Ошибка при автофарме:', error)
    }
  }

  // Обработчик выбора скилла
  const handleSkillSelect = (skillId: string) => {
    setSelectedSkillId(skillId)
    console.log('🎯 Выбран скилл:', skillId)
  }

  // Обработка окончания боя
  useEffect(() => {
    if (battleEnded && battleResult) {
      handleCombatEnd(battleResult)
    }
  }, [battleEnded, battleResult])

  // Функция для определения цвета лога
  const getLogColor = (logEntry: string) => {
    if (logEntry.includes('наносите') || logEntry.includes('урона!') || logEntry.includes('Победа!') || logEntry.includes('опыта') || logEntry.includes('золота')) {
      return 'text-green-400' // Зеленый для нанесенного урона и побед
    } else if (logEntry.includes('атакуют вас') || logEntry.includes('урона!') || logEntry.includes('Поражение!') || logEntry.includes('погибли')) {
      return 'text-red-400' // Красный для полученного урона и поражений
    } else if (logEntry.includes('Бой начался') || logEntry.includes('подготовлен') || logEntry.includes('Выберите скилл')) {
      return 'text-blue-400' // Синий для информационных сообщений
    } else {
      return 'text-gray-300' // Серый для остальных
    }
  }

  // Обработчик окончания боя
  const handleCombatEnd = async (result: any) => {
    // НЕ закрываем модальное окно - показываем результат
    setBattleStarted(false)
    
    if (result.success) {
      // Подготавливаем данные для обновления, но НЕ обновляем базу данных сразу
      const xpResult = processXpGain(character.level, character.experience, result.experience)
      
      console.log(`📊 Опыт получен: ${result.experience}, текущий уровень: ${character.level}, новый уровень: ${xpResult.newLevel}`)
      console.log(`💰 Золото получено: ${result.gold}, текущее: ${character.gold}, новое: ${character.gold + result.gold}`)
      
      // Сохраняем данные для обновления в состоянии
      setBattleResult({
        ...result,
        xpResult: xpResult,
        pendingUpdates: {
          level: xpResult.newLevel,
          experience: xpResult.newXpProgress,
          stat_points: character.stat_points + xpResult.totalStatPointsGained,
          max_health: 100 + (character.endurance * 15) + (xpResult.totalStatPointsGained * 5),
          max_mana: 50 + (character.intelligence * 8) + (xpResult.totalStatPointsGained * 3),
          health: result.finalHealth,
          mana: result.finalMana,
          gold: character.gold + result.gold,
          experience_to_next: xpResult.xpToNext
        }
      })
      
      console.log(`✅ Данные подготовлены для обновления! Новый уровень: ${xpResult.newLevel}`)
    } else {
      console.log('❌ Бой проигран')
    }
  }

  // Обработчик закрытия модального окна
  const handleCloseBattleModal = async () => {
    // Если есть отложенные обновления - применяем их
    if (battleResult && battleResult.pendingUpdates) {
      console.log('🔄 Применяем отложенные обновления персонажа...')
      
      // Если повышение уровня - добавляем бонусы
      if (battleResult.xpResult && battleResult.xpResult.levelsGained > 0) {
        battleResult.pendingUpdates.max_health = battleResult.pendingUpdates.max_health! + (20 * battleResult.xpResult.levelsGained)
        battleResult.pendingUpdates.max_mana = battleResult.pendingUpdates.max_mana! + (10 * battleResult.xpResult.levelsGained)
        battleResult.pendingUpdates.health = battleResult.pendingUpdates.max_health // Полное восстановление при повышении уровня
        battleResult.pendingUpdates.mana = battleResult.pendingUpdates.max_mana
      }
      
      await onUpdateCharacter(battleResult.pendingUpdates)
      console.log('✅ Персонаж обновлен в базе данных!')
    }
    
    setShowBattleModal(false)
    setBattleStarted(false)
    setBattleEnded(false)
    setBattleResult(null)
    setCurrentBattleSpot(null)
    setCombatState({
      currentHealth: character.health,
      currentMana: character.mana,
      currentMobs: [],
      round: 0,
      isPlayerTurn: true,
      lastAction: '',
      lastDamage: 0,
      lastMobDamage: 0,
      battleLog: []
    })
  }

  // Рендер континентов на карте мира
  const renderWorldMap = () => {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-blue-900/20 to-green-900/20 rounded-lg border border-primary-400/30 flex flex-col">
        {/* Заголовок карты */}
        <div className="absolute top-4 left-4 z-10">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Map className="w-6 h-6 text-blue-400" />
            <span>Карта Мира</span>
          </h2>
        </div>

        {/* Сетка континентов 3x2 */}
        <div className="flex-1 p-8 pt-16">
          <div className="grid grid-cols-3 grid-rows-2 gap-8 h-full">
            {Array.from({ length: 6 }, (_, index) => {
              const continent = availableContinents[index]
              const isLocked = !continent
              
              return (
                <div
                  key={index}
                  className={`relative rounded-lg border-2 flex items-center justify-center cursor-pointer group ${
                    continent
                      ? `border-${continent.color_theme}-400/50 bg-gradient-to-br from-${continent.color_theme}-900/30 to-${continent.color_theme}-800/20 hover:from-${continent.color_theme}-800/40 hover:to-${continent.color_theme}-700/30`
                      : 'border-gray-600/30 bg-gray-800/20'
                  }`}
                  onClick={() => continent && handleContinentSelect(continent)}
                >
                  {continent ? (
                    <div className="text-center p-4">
                      <div className="text-4xl mb-2">🏔️</div>
                      <h3 className="text-lg font-bold text-white mb-1">{continent.name}</h3>
                      <p className="text-sm text-gray-300 mb-2">{continent.description}</p>
                      <div className="text-xs text-gray-400">
                        Уровни: {continent.level_range.min}-{continent.level_range.max}
                      </div>
                      <div className="text-xs text-blue-300 mt-1">
                        Зон: {continent.zones.length}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4 opacity-50">
                      <Lock className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Заблокировано</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    )
  }

  // Рендер зон континента
  const renderContinentMap = () => {
    if (!selectedContinent) return null

    const availableZones = getAvailableZones(character.level)

    return (
      <div className="relative w-full h-full bg-gradient-to-br from-gray-900/40 to-gray-800/30 rounded-lg border border-primary-400/30 flex flex-col">
        {/* Заголовок */}
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
          <button
            onClick={handleBackToWorld}
            className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>Карта Мира</span>
          </button>
          <ChevronRight className="w-4 h-4 text-gray-500" />
          <h2 className="text-xl font-bold text-white">{selectedContinent.name}</h2>
        </div>

        {/* Сетка зон */}
        <div className="flex-1 p-8 pt-16">
          <div className="grid grid-cols-3 gap-6 h-full">
            {selectedContinent.zones.map((zone, index) => {
              const isAvailable = availableZones.includes(zone)
              
              return (
                <div
                  key={zone.id}
                  className={`relative rounded-lg border-2 flex items-center justify-center cursor-pointer group ${
                    isAvailable
                      ? 'border-purple-400/50 bg-gradient-to-br from-purple-900/30 to-purple-800/20 hover:from-purple-800/40 hover:to-purple-700/30'
                      : 'border-gray-600/30 bg-gray-800/20'
                  }`}
                  onClick={() => isAvailable && handleZoneSelect(zone)}
                >
                  {isAvailable ? (
                    <div className="text-center p-4">
                      <div className="text-3xl mb-2">🏰</div>
                      <h3 className="text-lg font-bold text-white mb-1">{zone.name}</h3>
                      <p className="text-sm text-gray-300 mb-2">{zone.description}</p>
                      <div className="text-xs text-gray-400">
                        Уровни: {zone.level_range.min}-{zone.level_range.max}
                      </div>
                      <div className="text-xs text-green-300 mt-1">
                        Спотов: {zone.farm_spots.length}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4 opacity-50">
                      <Lock className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Требуется {zone.level_range.min} ур.</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    )
  }

  // Рендер фарм спотов зоны
  const renderZoneMap = () => {
    if (!selectedZone) return null

    const gridSize = Math.ceil(Math.sqrt(selectedZone.farm_spots.length))

    return (
      <div className="relative w-full h-full bg-gradient-to-br from-green-900/20 to-brown-900/20 rounded-lg border border-primary-400/30 flex flex-col">
        {/* Заголовок */}
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
          <button
            onClick={handleBackToWorld}
            className="text-blue-400 hover:text-blue-300"
          >
            Карта Мира
          </button>
          <ChevronRight className="w-4 h-4 text-gray-500" />
          <button
            onClick={handleBackToContinent}
            className="text-blue-400 hover:text-blue-300"
          >
            {selectedContinent?.name}
          </button>
          <ChevronRight className="w-4 h-4 text-gray-500" />
          <h2 className="text-xl font-bold text-white">{selectedZone.name}</h2>
        </div>

        {/* Сетка фарм спотов */}
        <div className="flex-1 p-8 pt-16">
          <div 
            className="grid gap-2 h-full"
            style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
          >
            {selectedZone.farm_spots.map((spot) => (
              <div
                key={spot.id}
                className="relative bg-dark-200/30 border border-dark-300/50 rounded cursor-pointer group hover:bg-dark-200/50 hover:border-yellow-400/50 transition-all"
                onMouseEnter={() => setHoveredSpot(spot)}
                onMouseLeave={() => setHoveredSpot(null)}
                onClick={() => handleSpotClick(spot)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {spot.mobs.length === 1 ? (
                    <div className="text-center">
                      <div className="text-2xl mb-1">
                        {spot.mobs[0]?.icon || '👹'}
                      </div>
                      <div className="text-xs text-gray-400">
                        Атаковать
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="grid grid-cols-2 gap-1 mb-1">
                        {spot.mobs.slice(0, 4).map((mob, index) => (
                          <div key={mob.id} className="text-sm">
                            {mob.icon}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400">
                        {spot.mobs.length} мобов
                      </div>
                    </div>
                  )}
                </div>

                {/* Индикатор множественных мобов */}
                {spot.mobs.length > 1 && (
                  <div className="absolute -top-1 -right-1 bg-yellow-400 text-dark-900 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {spot.mobs.length}
                  </div>
                )}

                {/* Оверлей при наведении - затемняем ячейку и показываем информацию поверх */}
                {hoveredSpot?.id === spot.id && (
                  <div className="absolute inset-0 bg-black/70 rounded flex flex-col items-center justify-center p-2 z-10">
                    <h4 className="text-sm font-bold text-white mb-2 text-center">{spot.name}</h4>
                    <div className="text-xs text-gray-300 mb-2 text-center">
                      {spot.mobs.length === 1 ? 'Нажмите для атаки' : 'Нажмите для выбора моба'}
                    </div>
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {spot.mobs.map((mob) => (
                        <div key={mob.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-300">{mob.icon} {mob.name}</span>
                          <span className="text-yellow-400 ml-2">{mob.level} ур.</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    )
  }

  return (
    <div className="flex-1 game-content p-4 h-full overflow-hidden">
      <div className="flex gap-4 h-full">
        
        {/* Основная карта - 70% ширины */}
        <div className="w-[70%] relative">
          {viewMode === 'world' && renderWorldMap()}
          {viewMode === 'continent' && renderContinentMap()}
          {viewMode === 'zone' && renderZoneMap()}
        </div>

        {/* Правая панель - 30% ширины */}
        <div className="w-[30%] game-panel p-6 flex flex-col overflow-hidden">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-400" />
            <span>
              {viewMode === 'world' && 'Континенты'}
              {viewMode === 'continent' && 'Зоны'}
              {viewMode === 'zone' && 'Фарм Споты'}
            </span>
          </h2>

          <div className="flex-1 overflow-y-auto space-y-2">
            {viewMode === 'world' && availableContinents.map((continent) => (
              <div
                key={continent.id}
                className="p-3 bg-dark-200/30 border border-dark-300/50 rounded cursor-pointer hover:bg-dark-200/50 hover:border-blue-400/50 transition-all"
                onClick={() => handleContinentSelect(continent)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{continent.name}</h3>
                    <p className="text-xs text-gray-400">Уровни: {continent.level_range.min}-{continent.level_range.max}</p>
                    <p className="text-xs text-blue-300">{continent.zones.length} зон</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}

            {viewMode === 'continent' && selectedContinent && getAvailableZones(character.level).map((zone) => (
              <div
                key={zone.id}
                className="p-3 bg-dark-200/30 border border-dark-300/50 rounded cursor-pointer hover:bg-dark-200/50 hover:border-purple-400/50 transition-all"
                onClick={() => handleZoneSelect(zone)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{zone.name}</h3>
                    <p className="text-xs text-gray-400">Уровни: {zone.level_range.min}-{zone.level_range.max}</p>
                    <p className="text-xs text-green-300">{zone.farm_spots.length} спотов</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}

            {viewMode === 'zone' && selectedZone && selectedZone.farm_spots.map((spot) => (
              <div key={spot.id} className="space-y-2">
                <div className="p-3 bg-dark-200/30 border border-dark-300/50 rounded">
                  <h3 className="text-white font-semibold mb-2">{spot.name}</h3>
                  <div className="space-y-1">
                    {spot.mobs.map((mob) => (
                      <div
                        key={mob.id}
                        className="flex items-center justify-between text-xs p-2 bg-dark-300/30 rounded cursor-pointer hover:bg-dark-300/50 hover:border-red-400/50 border border-transparent transition-all"
                        onClick={() => handleMobSelect(mob)}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{mob.icon}</span>
                          <div>
                            <div className="text-gray-300">{mob.name}</div>
                            <div className="text-xs text-gray-500">{mob.rarity}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-yellow-400">{mob.level} ур.</div>
                          <div className="text-xs text-green-400">+{mob.experience_reward} опыта</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Модальное окно атаки моба */}
      {selectedMob && (
        <MobAttackModal
          mob={selectedMob}
          character={character}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAttack={handleAttackMob}
        />
      )}

      {/* Селектор мобов */}
      {showMobSelector && clickedSpot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-100 border border-primary-400/50 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Sword className="w-6 h-6 text-yellow-400" />
                <span>Выберите цель</span>
              </h2>
              <button
                onClick={handleCloseMobSelector}
                className="text-gray-400 hover:text-white"
              >
                <span className="text-xl">×</span>
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-lg text-white mb-2">{clickedSpot.name}</h3>
              <p className="text-sm text-gray-400">
                В этой зоне обитает несколько видов монстров. Выберите, на кого хотите напасть:
              </p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {clickedSpot.mobs.map((mob) => (
                <div
                  key={mob.id}
                  className="p-3 bg-dark-200/30 border border-dark-300/50 rounded cursor-pointer hover:bg-dark-200/50 hover:border-red-400/50 transition-all"
                  onClick={() => handleMobSelectFromSpot(mob)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{mob.icon}</span>
                      <div>
                        <h4 className="text-white font-semibold">{mob.name}</h4>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-yellow-400">Ур. {mob.level}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-red-400">{mob.health} HP</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-orange-400">{mob.attack} атк</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-400">+{mob.experience_reward} опыта</div>
                      <div className="text-sm text-yellow-400">+{mob.gold_reward} золота</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleCloseMobSelector}
                className="game-button game-button--secondary"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Единый модал боя */}
      {showBattleModal && currentBattleSpot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-100 border border-dark-300 rounded-lg w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
            
            {/* Основной контент - две панели в ряд */}
            <div className="flex flex-1 overflow-hidden">
              {/* Левая панель - информация о бое */}
              <div className="w-1/3 bg-dark-200/30 border-r border-dark-300/50 p-4 flex flex-col">
              {/* Заголовок */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">⚔️ {currentBattleSpot.name}</h2>
                <button
                  onClick={handleCloseBattleModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Предварительная информация о бое */}
              {!battleStarted && (
                <div className="bg-dark-200/50 rounded-lg p-4 mb-4">
                  <div className="text-white font-semibold mb-3">📊 Информация о бое</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Сложность:</span>
                      <span className="text-orange-400">
                        {currentBattleSpot.mobs.length === 1 ? 'Легкая' : 
                         currentBattleSpot.mobs.length === 2 ? 'Средняя' : 'Сложная'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Мобов в группе:</span>
                      <span className="text-blue-400">{currentBattleSpot.mobs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Шанс победы:</span>
                      <span className="text-green-400">
                        {character.level >= currentBattleSpot.mobs[0]?.level ? 'Высокий' : 'Средний'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Возможные награды */}
                  <div className="mt-4">
                    <div className="text-white font-semibold mb-2 text-sm">🎁 Награды</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Опыт:</span>
                        <span className="text-yellow-400">
                          {currentBattleSpot.mobs.reduce((sum, mob) => sum + mob.experience_reward, 0)} XP
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Золото:</span>
                        <span className="text-yellow-400">
                          {currentBattleSpot.mobs.reduce((sum, mob) => sum + mob.gold_reward, 0)} G
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Статы персонажа */}
              <div className="bg-dark-200/50 rounded-lg p-4 mb-4">
                <div className="text-white font-semibold mb-3">👤 Ваши характеристики</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">HP:</span>
                    <span className="text-red-400">
                      {battleStarted ? combatState.currentHealth : character.health}/{character.max_health}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">MP:</span>
                    <span className="text-blue-400">
                      {battleStarted ? combatState.currentMana : character.mana}/{character.max_mana}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Уровень:</span>
                    <span className="text-yellow-400">{character.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Атака:</span>
                    <span className="text-orange-400">{character.attack_damage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Защита:</span>
                    <span className="text-blue-400">{character.defense}</span>
                  </div>
                  {battleStarted && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Раунд:</span>
                        <span className="text-yellow-400">{combatState.round}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Ход:</span>
                        <span className={combatState.isPlayerTurn ? "text-green-400" : "text-orange-400"}>
                          {combatState.isPlayerTurn ? 'Ваш' : 'Мобов'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Список мобов */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-3">
                  {currentBattleSpot.mobs.map((mob, index) => (
                    <div key={mob.id} className="bg-dark-200/50 rounded-lg p-3">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-3xl">{mob.icon}</span>
                        <div className="flex-1">
                          <div className="text-white font-medium">{mob.name}</div>
                          <div className="text-sm text-gray-400">Уровень {mob.level}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">HP:</span>
                          <span className="text-red-400 font-semibold">
                            {battleStarted 
                              ? (() => {
                                  const currentMob = combatState.currentMobs.find(cm => cm.id === mob.id)
                                  return currentMob 
                                    ? `${currentMob.health}/${(currentMob as any).maxHealth || currentMob.health}`
                                    : `${mob.health}/${mob.health}`
                                })()
                              : `${mob.health}/${mob.health}`
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Атака:</span>
                          <span className="text-orange-400">{mob.attack}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Защита:</span>
                          <span className="text-blue-400">{mob.defense}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Редкость:</span>
                          <span className="text-purple-400">{mob.rarity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Правая панель - бой и скиллы */}
            <div className="w-2/3 p-4 flex flex-col">
              
              {/* Лог боя */}
              <div className="bg-dark-200/50 rounded-lg p-4 mb-4 flex-1 min-h-0 flex flex-col">
                <div className="text-white font-semibold mb-3">📝 Лог боя</div>
                <div className="flex-1 overflow-y-auto space-y-2 max-h-64">
                  {combatState.battleLog.length > 0 ? (
                    [...combatState.battleLog].reverse().map((logEntry, index) => (
                      <div key={combatState.battleLog.length - index - 1} className="bg-dark-300/30 rounded p-3">
                        <div className={`text-sm ${getLogColor(logEntry)}`}>
                          {logEntry}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm italic">
                      Бой еще не начался...
                    </div>
                  )}
                </div>
              </div>

              {/* Панель скиллов */}
              {!battleStarted ? (
                <CombatSkillPanel
                  character={character}
                  onSkillSelect={handleSkillSelect}
                  currentMana={character.mana}
                  className="mb-4"
                />
              ) : combatState.isPlayerTurn ? (
                <CombatSkillPanel
                  character={character}
                  onSkillSelect={handleSkillSelect}
                  currentMana={combatState.currentMana}
                  className="mb-4"
                />
              ) : (
                <div className="bg-dark-200/50 rounded-lg p-4 mb-4 text-center">
                  <div className="text-orange-400 mb-2 text-lg">
                    ⏳ Ход мобов...
                  </div>
                  <div className="text-gray-400 text-sm">
                    Мобы атакуют автоматически
                  </div>
                </div>
              )}
            
              {/* Результаты боя */}
              {battleEnded && battleResult && (
                <div className="bg-dark-200/50 rounded-lg p-4 mb-4">
                  <div className="text-white font-semibold mb-3 text-center">
                    {battleResult.success ? '🎉 Победа!' : '💀 Поражение'}
                  </div>
                  
                  {battleResult.success && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Получено опыта:</span>
                        <span className="text-yellow-400 font-semibold">+{battleResult.experience} XP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Получено золота:</span>
                        <span className="text-yellow-400 font-semibold">+{battleResult.gold} G</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Убито мобов:</span>
                        <span className="text-orange-400 font-semibold">{battleResult.mobsDefeated}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Получено урона:</span>
                        <span className="text-red-400 font-semibold">{battleResult.damageTaken} HP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Потрачено маны:</span>
                        <span className="text-blue-400 font-semibold">{battleResult.manaUsed} MP</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={handleCloseBattleModal}
                      className="flex-1 game-button bg-gray-600 hover:bg-gray-700"
                    >
                      ✅ Завершить
                    </button>
                    <button
                      onClick={handleRepeatBattle}
                      className="flex-1 game-button bg-blue-600 hover:bg-blue-700"
                    >
                      🔄 Повторить
                    </button>
                  </div>
                </div>
              )}

              {/* Кнопка действия - только для хода игрока */}
              {battleStarted && combatState.isPlayerTurn && !battleEnded && (
                <div className="text-center">
                  <button
                    disabled={!selectedSkillId}
                    className={`game-button w-full ${!selectedSkillId ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={async () => {
                  // Ход игрока - атакуем первого моба
                  const target = combatState.currentMobs[0]
                  if (target) {
                      // Рассчитываем урон с учетом выбранного скилла
                      let totalDamage = character.attack_damage
                      let manaCost = 0
                      let skillName = 'Базовая атака'
                      
                      if (selectedSkillId && selectedSkillId !== 'basic_attack') {
                        // Используем выбранный скилл
                        console.log('🎯 Используем выбранный скилл:', selectedSkillId)
                        
                        // Получаем данные скила из базы данных
                        try {
                          const { supabase } = await import('@/lib/supabase')
                          const { data: skillData, error } = await (supabase as any)
                            .from('skills')
                            .select('*')
                            .eq('id', selectedSkillId)
                            .single()
                          
                          if (skillData && !error) {
                            totalDamage = (skillData as any).base_damage + (character.strength * (skillData as any).scaling_ratio)
                            manaCost = (skillData as any).mana_cost
                            skillName = (skillData as any).name
                            console.log(`💥 Урон скила: ${totalDamage} (базовый: ${(skillData as any).base_damage}, бонус: ${(skillData as any).scaling_ratio})`)
                          } else {
                            // Fallback: используем старую систему
                            const className = getClassNameFromCharacter(character)
                            const skillData = getActiveSkillData(selectedSkillId, className)
                            if (skillData) {
                              totalDamage = skillData.base_damage + (character.strength * skillData.scaling_ratio)
                              manaCost = skillData.mana_cost
                              skillName = skillData.name
                              console.log(`💥 Урон скила (fallback): ${totalDamage}`)
                            }
                          }
                        } catch (error) {
                          console.error('Ошибка получения данных скилла:', error)
                        }
                      }
                      
                      const finalDamage = Math.max(1, totalDamage - target.defense)
                      
                      // Проверяем, хватает ли маны
                      if (manaCost > 0 && combatState.currentMana < manaCost) {
                        console.log('❌ Недостаточно маны для скила!')
                        setCombatState(prev => ({
                          ...prev,
                          lastAction: `Недостаточно маны для скила! (нужно: ${manaCost}, есть: ${prev.currentMana})`,
                          lastDamage: 0
                        }))
                        return
                      }
                      const newMobs = [...combatState.currentMobs]
                      const targetIndex = newMobs.findIndex(m => m.id === target.id)
                      
                      if (targetIndex !== -1) {
                        newMobs[targetIndex].health = Math.max(0, newMobs[targetIndex].health - finalDamage)
                      }

                      const actionText = selectedSkillId && selectedSkillId !== 'basic_attack'
                        ? `Вы используете "${skillName}" против ${target.name} и наносите ${finalDamage} урона!`
                        : `Вы атакуете ${target.name} и наносите ${finalDamage} урона!`
                      
                      setCombatState(prev => {
                        const newState = {
                          ...prev,
                          currentMobs: newMobs.filter(mob => mob.health > 0),
                          currentMana: prev.currentMana - manaCost,
                          round: prev.round + 1,
                          isPlayerTurn: false,
                          lastAction: actionText,
                          lastDamage: finalDamage,
                          battleLog: [...prev.battleLog, actionText]
                        }
                        
                        // Обновляем HP/MP в хедере в реальном времени
                        onUpdateCharacterStats({
                          health: newState.currentHealth,
                          mana: newState.currentMana
                        })
                        
                        return newState
                      })
                      
                      // Автоматически переходим к ходу мобов через 1 секунду
                      setTimeout(() => {
                        // Ход мобов - все мобы атакуют игрока
                        setCombatState(prev => {
                          let totalMobDamage = 0
                          const aliveMobs = prev.currentMobs.filter(mob => mob.health > 0)
                        
                          for (const mob of aliveMobs) {
                            const mobDamage = Math.max(1, mob.attack - Math.floor(character.defense * 0.5))
                            totalMobDamage += mobDamage
                          }

                          const mobActionText = `Мобы атакуют вас и наносят ${totalMobDamage} урона!`
                          
                          const newState = {
                            ...prev,
                            currentHealth: Math.max(0, prev.currentHealth - totalMobDamage),
                            isPlayerTurn: true,
                            lastAction: mobActionText,
                            lastMobDamage: totalMobDamage,
                            battleLog: [...prev.battleLog, mobActionText]
                          }
                          
                          // Обновляем HP в хедере в реальном времени
                          onUpdateCharacterStats({
                            health: newState.currentHealth
                          })
                          
                          return newState
                        })
                        
                        // Автоматически переходим к следующему ходу игрока через 2 секунды
                        setTimeout(() => {
                          setCombatState(prev => {
                            // Проверяем, не закончился ли бой
                            const aliveMobs = prev.currentMobs.filter(mob => mob.health > 0)
                            
                            if (aliveMobs.length === 0) {
                              // Победа
                              const result = {
                                success: true,
                                experience: currentBattleSpot.mobs.reduce((sum, mob) => sum + mob.experience_reward, 0),
                                gold: currentBattleSpot.mobs.reduce((sum, mob) => sum + mob.gold_reward, 0),
                                finalHealth: prev.currentHealth,
                                finalMana: prev.currentMana,
                                damageTaken: character.health - prev.currentHealth,
                                manaUsed: character.mana - prev.currentMana,
                                mobsDefeated: currentBattleSpot.mobs.length
                              }
                              
                              const victoryLog = `🎉 Победа! Вы получили ${result.experience} опыта и ${result.gold} золота!`
                              
                              setBattleEnded(true)
                              setBattleResult(result)
                              
                              return {
                                ...prev,
                                battleLog: [...prev.battleLog, victoryLog]
                              }
                            } else if (prev.currentHealth <= 0) {
                              // Поражение
                              const result = {
                                success: false,
                                experience: 0,
                                gold: 0,
                                finalHealth: 0,
                                finalMana: prev.currentMana,
                                damageTaken: character.health,
                                manaUsed: character.mana - prev.currentMana,
                                mobsDefeated: currentBattleSpot.mobs.length - aliveMobs.length
                              }
                              
                              const defeatLog = `💀 Поражение! Вы погибли в бою...`
                              
                              setBattleEnded(true)
                              setBattleResult(result)
                              
                              return {
                                ...prev,
                                battleLog: [...prev.battleLog, defeatLog]
                              }
                            }
                            
                            return {
                              ...prev,
                              isPlayerTurn: true,
                              lastAction: `Ваш ход! Выберите скилл для атаки`
                            }
                          })
                        }, 2000)
                      }, 1000)
                    }

                  // Проверяем условия окончания боя
                  setTimeout(() => {
                    // Используем актуальное состояние
                    setCombatState(prev => {
                      const aliveMobs = prev.currentMobs.filter(mob => mob.health > 0)
                      
                      if (aliveMobs.length === 0) {
                        // Победа
                        const result = {
                          success: true,
                          experience: currentBattleSpot.mobs.reduce((sum, mob) => sum + mob.experience_reward, 0),
                          gold: currentBattleSpot.mobs.reduce((sum, mob) => sum + mob.gold_reward, 0),
                          finalHealth: prev.currentHealth,
                          finalMana: prev.currentMana,
                          damageTaken: character.health - prev.currentHealth,
                          manaUsed: character.mana - prev.currentMana,
                          mobsDefeated: currentBattleSpot.mobs.length
                        }
                        
                        // Добавляем запись о победе в лог
                        const victoryLog = `🎉 Победа! Вы получили ${result.experience} опыта и ${result.gold} золота!`
                        
                        setBattleEnded(true)
                        setBattleResult(result)
                        handleCombatEnd(result)
                        
                        return {
                          ...prev,
                          battleLog: [...prev.battleLog, victoryLog]
                        }
                      } else if (prev.currentHealth <= 0) {
                        // Поражение
                        const result = {
                          success: false,
                          experience: 0,
                          gold: 0,
                          finalHealth: 0,
                          finalMana: prev.currentMana,
                          damageTaken: character.health,
                          manaUsed: character.mana - prev.currentMana,
                          mobsDefeated: currentBattleSpot.mobs.length - aliveMobs.length
                        }
                        
                        // Добавляем запись о поражении в лог
                        const defeatLog = `💀 Поражение! Вы погибли в бою...`
                        
                        setBattleEnded(true)
                        setBattleResult(result)
                        handleCombatEnd(result)
                        
                        return {
                          ...prev,
                          battleLog: [...prev.battleLog, defeatLog]
                        }
                      }
                      
                      return prev
                    })
                  }, 1000)
                }}
              >
                    {selectedSkillId ? '⚔️ Использовать скилл' : '🎯 Выберите скилл'}
                  </button>
                </div>
              )}
              </div>
            </div>
            
            {/* Общий футер */}
            <div className="bg-dark-200/50 border-t border-dark-300/50 p-4 flex items-center justify-between">
              {/* Левая кнопка - Закрыть */}
              <button
                onClick={handleCloseBattleModal}
                className="game-button game-button--secondary px-6 py-2"
              >
                ❌ Закрыть
              </button>
              
              {/* Правые кнопки - Начать бой и Авто-бой */}
              <div className="flex space-x-3">
                {!battleStarted ? (
                  <>
                    <button
                      onClick={handleStartCombat}
                      className="game-button px-6 py-2"
                    >
                      ⚔️ Начать бой
                    </button>
                    <button
                      onClick={() => {/* TODO: Авто-бой */}}
                      className="game-button game-button--secondary px-6 py-2"
                    >
                      🤖 Авто-бой
                    </button>
                  </>
                ) : (
                  <div className="text-gray-400 text-sm">
                    Бой в процессе...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
