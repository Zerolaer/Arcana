'use client'

import { useState, useEffect } from 'react'
import { Character } from '@/types/game'
import { Swords, Award, Package, Activity } from 'lucide-react'

interface CombatSidebarProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
}

interface CombatLog {
  id: string
  type: 'combat' | 'loot' | 'level' | 'quest'
  message: string
  timestamp: Date
  details?: any
}

export default function CombatSidebar({ character, onUpdateCharacter }: CombatSidebarProps) {
  const [combatLogs, setCombatLogs] = useState<CombatLog[]>([])
  const [recentLoot, setRecentLoot] = useState<any[]>([])

  // Sample combat logs
  useEffect(() => {
    const sampleLogs: CombatLog[] = [
      {
        id: '1',
        type: 'combat',
        message: 'Победил Лесного волка',
        timestamp: new Date(Date.now() - 60000),
        details: { damage: 45, exp: 25, gold: 12 }
      },
      {
        id: '2', 
        type: 'loot',
        message: 'Получен: Зелье здоровья',
        timestamp: new Date(Date.now() - 120000)
      },
      {
        id: '3',
        type: 'combat',
        message: 'Атаковал Гоблина-разбойника', 
        timestamp: new Date(Date.now() - 180000),
        details: { damage: 32, exp: 18, gold: 8 }
      }
    ]
    setCombatLogs(sampleLogs)
  }, [])

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'combat': return <Swords className="w-4 h-4 text-red-400" />
      case 'loot': return <Package className="w-4 h-4 text-green-400" />
      case 'level': return <Award className="w-4 h-4 text-yellow-400" />
      default: return <Activity className="w-4 h-4 text-blue-400" />
    }
  }

  const getLogColor = (type: string) => {
    switch (type) {
      case 'combat': return 'border-red-500/30 bg-red-500/10'
      case 'loot': return 'border-green-500/30 bg-green-500/10'
      case 'level': return 'border-yellow-500/30 bg-yellow-500/10'
      default: return 'border-blue-500/30 bg-blue-500/10'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}с назад`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}м назад`
    const hours = Math.floor(minutes / 60)
    return `${hours}ч назад`
  }

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Quick Combat Actions */}
      <div className="game-panel p-4">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
          <Swords className="w-5 h-5 text-red-400" />
          <span>Быстрые действия</span>
        </h3>
        
        <div className="space-y-2">
          <button className="w-full game-button game-button--compact game-button--danger">
            Атаковать
          </button>
          <button className="w-full game-button game-button--compact game-button--success">
            Использовать зелье
          </button>
          <button className="w-full game-button game-button--compact game-button--warning">
            Отступить
          </button>
        </div>
      </div>

      {/* Combat Status */}
      <div className="game-panel p-4">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <span>Статус</span>
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">В бою:</span>
            <span className={character.is_in_combat ? "text-red-400" : "text-green-400"}>
              {character.is_in_combat ? "Да" : "Нет"}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Локация:</span>
            <span className="text-white">Лесная поляна</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Противников:</span>
            <span className="text-yellow-400">3 поблизости</span>
          </div>
        </div>
      </div>

      {/* Recent Loot */}
      <div className="game-panel p-4">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
          <Package className="w-5 h-5 text-green-400" />
          <span>Найденное</span>
        </h3>
        
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {[
            { name: "Зелье здоровья", rarity: "common", icon: "🧪" },
            { name: "Медная монета", rarity: "common", icon: "🪙" },
            { name: "Кожаные перчатки", rarity: "uncommon", icon: "🧤" }
          ].map((item, index) => (
            <div key={index} className={`flex items-center space-x-2 p-2 rounded border item-card--${item.rarity} text-sm`}>
              <span className="text-lg">{item.icon}</span>
              <span className="text-white flex-1">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Combat Log */}
      <div className="game-panel p-4 flex-1">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
          <Award className="w-5 h-5 text-yellow-400" />
          <span>Боевой лог</span>
        </h3>
        
        <div className="space-y-2 max-h-64 overflow-y-auto game-content">
          {combatLogs.map((log) => (
            <div 
              key={log.id}
              className={`p-3 rounded border text-sm ${getLogColor(log.type)}`}
            >
              <div className="flex items-start space-x-2">
                {getLogIcon(log.type)}
                <div className="flex-1">
                  <div className="text-white font-medium">{log.message}</div>
                  {log.details && (
                    <div className="text-xs text-gray-400 mt-1 flex space-x-3">
                      {log.details.damage && <span>Урон: {log.details.damage}</span>}
                      {log.details.exp && <span className="text-purple-400">+{log.details.exp} опыта</span>}
                      {log.details.gold && <span className="text-yellow-400">+{log.details.gold} золота</span>}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(log.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
