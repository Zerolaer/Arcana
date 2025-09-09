'use client'

import { User } from '@supabase/supabase-js'
import { Character } from '@/types/game'
import { LogOut, Settings, Bell, Crown, Coins, MapPin } from 'lucide-react'

interface GameHeaderProps {
  character: Character
  user: User
  onLogout: () => void
}

export default function GameHeader({ character, user, onLogout }: GameHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-md border-b border-white/10">
      {/* Left: Game Title */}
      <div className="flex items-center space-x-4">
        <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text font-game">
          ARCANA
        </h1>
        
        {/* Character Name Badge */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg">
          <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded flex items-center justify-center text-sm font-bold text-white">
            {character.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-white font-medium">{character.name}</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-4">
        {/* Mail/Notifications */}
        <button className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
          <Bell className="w-5 h-5" />
          <span className="text-sm">Почта</span>
        </button>

        {/* Exit */}
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/10"
        >
          <div className="w-4 h-4 bg-red-500 rounded-sm" />
          <span className="text-sm">Выход</span>
        </button>
      </div>
    </div>
  )
}
