'use client'

import { memo } from 'react'
import { Continent } from '@/types/world'
import { Lock } from 'lucide-react'
import { getContinentBackground } from '@/lib/locationBackgrounds'

interface ContinentCardProps {
  continent: Continent
  isLocked: boolean
  onClick: () => void
}

const ContinentCard = memo(function ContinentCard({ 
  continent, 
  isLocked, 
  onClick 
}: ContinentCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border-2 flex items-center justify-center cursor-pointer group ${
        continent
          ? `border-${continent.color_theme}-400/50`
          : 'border-gray-600/30 bg-gray-800/20'
      }`}
      style={continent ? {
        backgroundImage: `url(${getContinentBackground(continent.id).image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : undefined}
      onClick={continent && !isLocked ? onClick : undefined}
    >
      {/* Полупрозрачный фон для контента */}
      {continent && <div className="absolute inset-0 bg-black/70 rounded-lg" />}
      {continent ? (
        <div className="relative z-10 text-center p-4">
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
})

export default ContinentCard
