'use client'

import { useState, useEffect } from 'react'
import { Character, Location, FarmingSpot, Mob } from '@/types/game'
import { MapPin, Users, Sword, Star, Clock, Zap, Shield, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { getLocationBackground } from '@/lib/locationBackgrounds'
import { useLocations } from '@/lib/useDataCache'

interface LocationMapProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
  isLoading?: boolean
  className?: string
}

interface LocationWithSpots extends Location {
  farming_spots: (FarmingSpot & {
    mob_spawns: (MobSpawn & { mob: Mob })[]
  })[]
}

interface MobSpawn {
  mob_id: string
  spawn_rate: number
  max_concurrent: number
  mob: Mob
}

export default function LocationMap({ character, onUpdateCharacter, isLoading = false, className = '' }: LocationMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationWithSpots | null>(null)
  const [selectedSpot, setSelectedSpot] = useState<FarmingSpot | null>(null)
  
  // Используем кешированные данные
  const { data: locations, loading, error, refetch } = useLocations()

  useEffect(() => {
    if (locations && locations.length > 0) {
      setSelectedLocation(locations[0] as LocationWithSpots)
    }
  }, [locations])

  // Обработка ошибок
  useEffect(() => {
    if (error) {
      toast.error('Ошибка загрузки локаций')
    }
  }, [error])

  const canAccessLocation = (location: Location) => {
    return character.level >= location.min_level && 
           (location.max_level ? character.level <= location.max_level : true)
  }

  const getLocationColor = (location: Location) => {
    if (!canAccessLocation(location)) return 'text-gray-500'
    if (character.current_location_id === location.id) return 'text-green-400'
    return 'text-blue-400'
  }

  const getSpotStatus = (spot: FarmingSpot) => {
    const isOccupied = spot.current_occupancy >= spot.max_occupancy
    const isPlayerOccupied = spot.occupied_by.includes(character.id)
    
    if (isPlayerOccupied) return 'player'
    if (isOccupied) return 'occupied'
    return 'available'
  }

  const getSpotColor = (spot: FarmingSpot) => {
    const status = getSpotStatus(spot)
    switch (status) {
      case 'player': return 'border-green-500 bg-green-500/10 text-green-400'
      case 'occupied': return 'border-red-500 bg-red-500/10 text-red-400'
      case 'available': return 'border-blue-500 bg-blue-500/10 text-blue-400'
      default: return 'border-gray-500 bg-gray-500/10 text-gray-400'
    }
  }

  const handleLocationSelect = (location: LocationWithSpots) => {
    setSelectedLocation(location)
    setSelectedSpot(null)
  }

  const handleSpotSelect = (spot: FarmingSpot) => {
    setSelectedSpot(spot)
  }

  const handleOccupySpot = async (spot: FarmingSpot) => {
    if (getSpotStatus(spot) !== 'available') {
      toast.error('Спот занят или недоступен')
      return
    }

    try {
      const { success, error } = await (supabase as any).rpc('occupy_farming_spot', {
        spot_id: spot.id,
        character_id: character.id
      })

      if (error) {
        console.error('Error occupying spot:', error)
        toast.error('Ошибка занятия спота')
        return
      }

      if (success) {
        toast.success('Спот успешно занят!')
        // Update character location
        await onUpdateCharacter({
          current_location_id: spot.location_id,
          current_spot_id: spot.id
        })
        // Reload locations to update occupancy
        refetch()
      }
    } catch (error) {
      console.error('Error occupying spot:', error)
      toast.error('Ошибка подключения к серверу')
    }
  }

  const handleLeaveSpot = async () => {
    if (!character.current_spot_id) return

    try {
      const { success, error } = await (supabase as any).rpc('leave_farming_spot', {
        spot_id: character.current_spot_id,
        character_id: character.id
      })

      if (error) {
        console.error('Error leaving spot:', error)
        toast.error('Ошибка покидания спота')
        return
      }

      if (success) {
        toast.success('Спот покинут')
        // Update character location
        await onUpdateCharacter({
          current_spot_id: undefined
        })
        // Reload locations to update occupancy
        refetch()
      }
    } catch (error) {
      console.error('Error leaving spot:', error)
      toast.error('Ошибка подключения к серверу')
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="flex items-center space-x-2 text-white">
          <div className="loading-spinner" />
          <span>Загрузка локаций...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Карта мира</h3>
        </div>
        
        {character.current_spot_id && (
          <button
            onClick={handleLeaveSpot}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg"
          >
            Покинуть спот
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Locations List */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-300">Локации</h4>
          
          <div className="space-y-2">
            {locations?.map((location) => (
              <div
                key={location.id}
                onClick={() => handleLocationSelect(location)}
                className={`relative overflow-hidden rounded-lg border-2 cursor-pointer transition-colors duration-200 ${
                  selectedLocation?.id === location.id
                    ? 'border-primary-500'
                    : canAccessLocation(location)
                    ? 'border-blue-500/50'
                    : 'border-gray-500/50 opacity-50 cursor-not-allowed'
                }`}
                style={{ 
                  backgroundImage: `url(${getLocationBackground(location.name).image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* Полупрозрачный фон для контента */}
                <div className="absolute inset-0 bg-black/70 rounded-lg" />
                
                {/* Контент */}
                <div className="relative z-10 p-4">
                <div className="flex items-center justify-between">
                  <h5 className={`font-medium ${getLocationColor(location)}`}>
                    {location.name}
                  </h5>
                  <div className="text-xs text-gray-400">
                    {location.min_level}-{location.max_level || '∞'} ур.
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {location.description}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3" />
                      <span>+{location.experience_bonus}% опыта</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span>+{location.gold_bonus}% золота</span>
                    </div>
                  </div>
                  
                  {character.current_location_id === location.id && (
                    <div className="text-xs text-green-400 font-medium">
                      Текущая
                    </div>
                  )}
                </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Farming Spots */}
        <div className="lg:col-span-2 space-y-4">
          {selectedLocation ? (
            <>
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-300">
                  Споты фарминга - {selectedLocation.name}
                </h4>
                <div className="text-sm text-gray-400">
                  {selectedLocation.farming_spots.length} спотов
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedLocation.farming_spots.map((spot) => {
                  const status = getSpotStatus(spot)
                  const isPlayerOccupied = status === 'player'
                  
                  return (
                    <div
                      key={spot.id}
                      onClick={() => handleSpotSelect(spot)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${
                        selectedSpot?.id === spot.id
                          ? 'border-primary-500 bg-primary-500/10'
                          : getSpotColor(spot)
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{spot.name}</h5>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">
                              {spot.current_occupancy}/{spot.max_occupancy}
                            </span>
                          </div>
                          
                          {isPlayerOccupied && (
                            <div className="text-xs text-green-400 font-medium">
                              Ваш спот
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {spot.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>Дроп: +{spot.drop_rate_bonus}%</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Zap className="w-3 h-3" />
                            <span>Редкий дроп: +{spot.rare_drop_bonus}%</span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          Мобы: {spot.mob_spawns.map(spawn => (spawn as any).mob?.name || 'Неизвестный моб').join(', ')}
                        </div>
                      </div>
                      
                      {status === 'available' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOccupySpot(spot)
                          }}
                          className="w-full mt-3 game-button game-button--compact"
                        >
                          Занять спот
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center p-8 text-gray-400">
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <p>Выберите локацию для просмотра спотов</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}