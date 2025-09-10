'use client'

import { useState, useEffect } from 'react'
import { Character } from '@/types/game'
import { Continent, Zone, FarmSpot, Mob } from '@/types/world'
import { WORLD_DATA, getAvailableContinents, getAvailableZones } from '@/lib/worldData'
import { Map, Sword, Users, Trophy, Lock, ChevronRight } from 'lucide-react'
import MobAttackModal from './MobAttackModal'
import { CombatSystem } from '@/lib/combatSystem'
import { toast } from 'react-hot-toast'

interface WorldMapProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
}

type ViewMode = 'world' | 'continent' | 'zone'

export default function WorldMapNew({ character, onUpdateCharacter }: WorldMapProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('world')
  const [selectedContinent, setSelectedContinent] = useState<Continent | null>(null)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [selectedSpot, setSelectedSpot] = useState<FarmSpot | null>(null)
  const [hoveredSpot, setHoveredSpot] = useState<FarmSpot | null>(null)
  const [selectedMob, setSelectedMob] = useState<Mob | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  // Выбор моба для атаки
  const handleMobSelect = (mob: Mob) => {
    setSelectedMob(mob)
    setIsModalOpen(true)
  }

  // Атака моба
  const handleAttackMob = async (mob: Mob) => {
    try {
      const result = await CombatSystem.simulateCombat(character, mob)
      
      if (result) {
        // Обновляем персонажа локально
        const updates = {
          experience: character.experience + result.experience,
          gold: character.gold + result.gold,
          health: Math.max(1, character.health - Math.floor(Math.random() * 20)), // Потеря здоровья в бою
        }
        
        if (result.level_up) {
          updates.level = character.level + 1
          updates.stat_points = character.stat_points + 5
          updates.skill_points = character.skill_points + 1
          updates.max_health = character.max_health + 20
          updates.max_mana = character.max_mana + 10
          updates.health = updates.max_health // Полное восстановление при повышении уровня
          updates.mana = updates.max_mana
          
          toast.success(`🎉 Повышение уровня! Теперь ${updates.level} уровень!`)
        }
        
        await onUpdateCharacter(updates)
        
        return result
      } else {
        toast.error('💀 Вы проиграли бой! Потеряно немного здоровья.')
        
        // Обновляем здоровье после поражения
        const newHealth = Math.max(1, Math.floor(character.health * 0.75))
        await onUpdateCharacter({ health: newHealth })
        
        return null
      }
    } catch (error) {
      console.error('Combat error:', error)
      toast.error('Ошибка во время боя')
      return null
    }
  }

  // Закрытие модального окна
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMob(null)
  }

  // Рендер континентов на карте мира
  const renderWorldMap = () => {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-blue-900/20 to-green-900/20 rounded-lg border border-primary-400/30">
        {/* Заголовок карты */}
        <div className="absolute top-4 left-4 z-10">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Map className="w-6 h-6 text-blue-400" />
            <span>Карта Мира</span>
          </h2>
        </div>

        {/* Сетка континентов 3x2 */}
        <div className="absolute inset-0 p-8 pt-16">
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

    const availableZones = getAvailableZones(selectedContinent.id, character.level)

    return (
      <div className="relative w-full h-full bg-gradient-to-br from-gray-900/40 to-gray-800/30 rounded-lg border border-primary-400/30">
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
        <div className="absolute inset-0 p-8 pt-16">
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
      <div className="relative w-full h-full bg-gradient-to-br from-green-900/20 to-brown-900/20 rounded-lg border border-primary-400/30">
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
        <div className="absolute inset-0 p-8 pt-16">
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
                onClick={() => setSelectedSpot(spot)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl mb-1">
                      {spot.mobs[0]?.icon || '👹'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {spot.mobs.length} мобов
                    </div>
                  </div>
                </div>

                {/* Tooltip при наведении */}
                {hoveredSpot?.id === spot.id && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-dark-100 border border-primary-400/50 rounded p-2 z-20 min-w-48">
                    <h4 className="text-sm font-bold text-white mb-1">{spot.name}</h4>
                    <div className="space-y-1">
                      {spot.mobs.map((mob) => (
                        <div key={mob.id} className="flex items-center justify-between text-xs">
                          <span className="text-gray-300">{mob.icon} {mob.name}</span>
                          <span className="text-yellow-400">{mob.level} ур.</span>
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

            {viewMode === 'continent' && selectedContinent && getAvailableZones(selectedContinent.id, character.level).map((zone) => (
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
    </div>
  )
}
