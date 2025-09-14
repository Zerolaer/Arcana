'use client'

import { memo } from 'react'
import { Zone } from '@/types/world'
import { Lock } from 'lucide-react'
import { getLocationBackground } from '@/lib/locationBackgrounds'

interface ZoneCardProps {
  zone: Zone
  isAvailable: boolean
  isCurrent?: boolean
  onClick: () => void
}

const ZoneCard = memo(function ZoneCard({ 
  zone, 
  isAvailable, 
  isCurrent = false, 
  onClick 
}: ZoneCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border-2 flex items-center justify-center cursor-pointer group ${
        isAvailable
          ? 'border-purple-400/50'
          : 'border-gray-600/30 bg-gray-800/20'
      }`}
      style={isAvailable ? {
        backgroundImage: `url(${getLocationBackground(zone.name).image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : undefined}
      onClick={isAvailable ? onClick : undefined}
    >
      {isAvailable ? (
        <>
          {/* Полупрозрачный фон для контента */}
          <div className="absolute inset-0 bg-black/70 rounded-lg" />
          
          {/* Контент */}
          <div className="relative z-10 text-center p-4">
            <div className="text-3xl mb-2">🏰</div>
            <h3 className="text-lg font-bold text-white mb-1">{zone.name}</h3>
            <p className="text-sm text-gray-300 mb-2">{zone.description}</p>
            <div className="text-xs text-gray-400">
              Уровни: {zone.level_range.min}-{zone.level_range.max}
            </div>
            <div className="text-xs text-green-300 mt-1">
              Спотов: {zone.farm_spots.length}
            </div>
            {isCurrent && (
              <div className="text-xs text-blue-300 mt-1 font-medium">
                Текущая зона
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center p-4 opacity-50">
          <Lock className="w-6 h-6 text-gray-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Требуется {zone.level_range.min} ур.</p>
        </div>
      )}
    </div>
  )
})

export default ZoneCard
