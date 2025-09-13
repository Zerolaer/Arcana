'use client'

import { useState, useEffect } from 'react'
import { Character } from '@/types/game'
import { Map, MapPin, Users, Target, TrendingUp, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { getLocationBackground } from '@/lib/locationBackgrounds'

interface LocationPanelProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
  isLoading: boolean
}

interface Location {
  id: string
  name: string
  description: string
  min_level: number
  max_level: number | null
  experience_bonus: number
  gold_bonus: number
  image: string
}

interface FarmingSpot {
  id: string
  name: string
  description: string
  max_occupancy: number
  current_occupancy: number
  drop_rate_bonus: number
  rare_drop_bonus: number
}

export default function LocationPanel({ character, onUpdateCharacter, isLoading }: LocationPanelProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [farmingSpots, setFarmingSpots] = useState<FarmingSpot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      const { data, error } = await (supabase
        .from('locations') as any)
        .select('*')
        .order('min_level')

      if (error) {
        console.error('Error loading locations:', error)
        toast.error('Ошибка загрузки локаций')
        return
      }

      if (data) {
        setLocations(data)
        // Set current location as selected if available
        const currentLocation = data.find((loc: any) => loc.id === character.current_location_id)
        if (currentLocation) {
          setSelectedLocation(currentLocation)
          loadFarmingSpots(currentLocation.id)
        }
      }
    } catch (error) {
      console.error('Error loading locations:', error)
      toast.error('Ошибка подключения')
    } finally {
      setLoading(false)
    }
  }

  const loadFarmingSpots = async (locationId: string) => {
    try {
      const { data, error } = await (supabase
        .from('farming_spots') as any)
        .select('*')
        .eq('location_id', locationId)

      if (error) {
        console.error('Error loading farming spots:', error)
        return
      }

      if (data) {
        setFarmingSpots(data)
      }
    } catch (error) {
      console.error('Error loading farming spots:', error)
    }
  }

  const travelToLocation = async (location: Location) => {
    if (location.min_level > character.level) {
      toast.error(`Требуется ${location.min_level} уровень для посещения этой локации`)
      return
    }

    const success = await onUpdateCharacter({
      current_location_id: location.id,
      current_spot_id: undefined // Clear current spot when traveling
    })

    if (success) {
      setSelectedLocation(location)
      loadFarmingSpots(location.id)
      toast.success(`Перемещение в ${location.name}`)
    }
  }

  const canAccessLocation = (location: Location) => {
    return character.level >= location.min_level && 
           (location.max_level === null || character.level <= location.max_level)
  }

  const getLocationStatusColor = (location: Location) => {
    if (location.id === character.current_location_id) return 'border-green-400 bg-green-500/10'
    if (canAccessLocation(location)) return 'border-blue-400/50'
    return 'border-red-400/30 bg-red-500/5'
  }

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="loading-spinner mr-3" />
        <span className="text-white">Загрузка локаций...</span>
      </div>
    )
  }

  return (
    <div className="flex-1 game-content p-4 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Locations List */}
        <div className="game-panel p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            <span>Доступные локации</span>
          </h2>

          <div className="space-y-3">
            {locations.map((location) => {
              const isAccessible = canAccessLocation(location)
              const isCurrent = location.id === character.current_location_id

              return (
                <div
                  key={location.id}
                  onClick={() => isAccessible && !isCurrent && travelToLocation(location)}
                  className={`relative overflow-hidden rounded border transition-colors duration-200 ${getLocationStatusColor(location)} 
                    ${isAccessible && !isCurrent ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  style={{ 
                    backgroundImage: `url(${getLocationBackground(location.name).image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  
                  {/* Полупрозрачный фон для контента */}
                  <div className="absolute inset-0 bg-black/70 rounded" />
                  
                  {/* Контент */}
                  <div className="relative z-10 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{location.image}</div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white">{location.name}</span>
                          {isCurrent && (
                            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded">
                              Текущая
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-dark-400">
                          Уровень: {location.min_level}
                          {location.max_level && ` - ${location.max_level}`}
                        </div>
                      </div>
                    </div>

                    {!isAccessible && (
                      <div className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded">
                        Заблокировано
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-dark-300 mb-3">{location.description}</p>

                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3 text-purple-400" />
                      <span className="text-purple-300">
                        +{((location.experience_bonus - 1) * 100).toFixed(0)}% опыта
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-gold-400">💰</span>
                      <span className="text-gold-300">
                        +{((location.gold_bonus - 1) * 100).toFixed(0)}% золота
                      </span>
                    </div>
                  </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Farming Spots */}
        <div className="game-panel p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5 text-red-400" />
            <span>Места для фарма</span>
          </h2>

          {selectedLocation ? (
            <div className="space-y-3">
              {farmingSpots.length > 0 ? (
                farmingSpots.map((spot) => {
                  const isOccupied = spot.current_occupancy >= spot.max_occupancy
                  const isCurrentSpot = character.current_spot_id === spot.id

                  return (
                    <div
                      key={spot.id}
                      className={`p-4 rounded border transition-colors duration-200 ${
                        isCurrentSpot 
                          ? 'border-green-400 bg-green-500/10' 
                          : isOccupied 
                            ? 'border-red-400/30 bg-red-500/5' 
                            : 'border-blue-400/50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white">{spot.name}</span>
                          {isCurrentSpot && (
                            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-300 rounded">
                              Занят вами
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 text-xs">
                          <Users className="w-3 h-3 text-dark-400" />
                          <span className={`${isOccupied ? 'text-red-400' : 'text-green-400'}`}>
                            {spot.current_occupancy}/{spot.max_occupancy}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-dark-300 mb-3">{spot.description}</p>

                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <span className="text-blue-400">📦</span>
                          <span className="text-blue-300">
                            +{((spot.drop_rate_bonus - 1) * 100).toFixed(0)}% дроп
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="text-purple-400">✨</span>
                          <span className="text-purple-300">
                            +{((spot.rare_drop_bonus - 1) * 100).toFixed(0)}% редкий
                          </span>
                        </div>
                      </div>

                      {isOccupied && !isCurrentSpot && (
                        <div className="mt-3 flex items-center space-x-2 text-xs text-red-400">
                          <Clock className="w-3 h-3" />
                          <span>Место занято другими игроками</span>
                        </div>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🏜️</div>
                  <p className="text-dark-400">Нет доступных мест для фарма в этой локации</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📍</div>
              <p className="text-dark-400">Выберите локацию, чтобы увидеть места для фарма</p>
            </div>
          )}
        </div>
      </div>

      {/* Location Details */}
      {selectedLocation && (
        <div className="game-panel p-6">
          <h2 className="text-lg font-bold text-white mb-4">
            Детали локации: {selectedLocation.name}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-dark-200/30 rounded border border-dark-300/30 p-4 text-center">
              <div className="text-2xl mb-2">{selectedLocation.image}</div>
              <div className="font-semibold text-white">{selectedLocation.name}</div>
            </div>

            <div className="bg-dark-200/30 rounded border border-dark-300/30 p-4">
              <div className="text-sm text-dark-400 mb-1">Уровень</div>
              <div className="font-bold text-white">
                {selectedLocation.min_level}
                {selectedLocation.max_level && ` - ${selectedLocation.max_level}`}
              </div>
            </div>

            <div className="bg-dark-200/30 rounded border border-dark-300/30 p-4">
              <div className="text-sm text-dark-400 mb-1">Бонус опыта</div>
              <div className="font-bold text-purple-400">
                +{((selectedLocation.experience_bonus - 1) * 100).toFixed(0)}%
              </div>
            </div>

            <div className="bg-dark-200/30 rounded border border-dark-300/30 p-4">
              <div className="text-sm text-dark-400 mb-1">Бонус золота</div>
              <div className="font-bold text-gold-400">
                +{((selectedLocation.gold_bonus - 1) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-dark-300">{selectedLocation.description}</p>
          </div>
        </div>
      )}

      {/* Coming Soon Features */}
      <div className="game-panel p-6 text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h3 className="text-xl font-bold text-white mb-2">Готовится к запуску!</h3>
        <p className="text-dark-400 max-w-2xl mx-auto">
          Система спотов и АФК фарминга. Занимайте лучшие места, конкурируйте с другими игроками
          за редкий лут и опыт. Каждая локация содержит уникальных мобов и предметы!
        </p>
      </div>
    </div>
  )
}
