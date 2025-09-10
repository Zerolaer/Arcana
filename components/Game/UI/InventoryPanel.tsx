'use client'

import { Character } from '@/types/game'
import { Backpack, Package, ShoppingCart } from 'lucide-react'

interface InventoryPanelProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
  isLoading: boolean
}

export default function InventoryPanel({ character, onUpdateCharacter, isLoading }: InventoryPanelProps) {
  // Sample items for demonstration
  const sampleItems = [
    { id: 1, name: "Меч новичка", type: "weapon", rarity: "common", icon: "⚔️", stats: "Урон: 10", price: 50 },
    { id: 2, name: "Зелье здоровья", type: "consumable", rarity: "uncommon", icon: "🧪", stats: "Восстановление: 50 HP", price: 25 },
    { id: 3, name: "Кольцо силы", type: "accessory", rarity: "rare", icon: "💍", stats: "Сила: +5", price: 200 },
    { id: 4, name: "Эпический шлем", type: "armor", rarity: "epic", icon: "🛡️", stats: "Защита: 25", price: 500 },
    { id: 5, name: "Легендарный посох", type: "weapon", rarity: "legendary", icon: "🔮", stats: "Магия: 50", price: 1000 }
  ]

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: "text-gray-400",
      uncommon: "text-green-400", 
      rare: "text-blue-400",
      epic: "text-purple-400",
      legendary: "text-yellow-400",
      mythic: "text-red-400"
    }
    return colors[rarity as keyof typeof colors] || "text-gray-400"
  }

  return (
    <div className="flex-1 game-content p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Backpack className="w-6 h-6 text-green-400" />
            <span>Инвентарь</span>
          </h1>
          <p className="text-gray-400 mt-1">Управление предметами и экипировкой</p>
        </div>
        
        {/* Inventory Stats */}
        <div className="text-right">
          <div className="text-sm text-gray-400">Слотов:</div>
          <div className="text-xl font-bold text-white">
            {sampleItems.length} / 50
          </div>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex space-x-3">
        <button className="game-button game-button--compact">
          Все
        </button>
        <button className="game-button game-button--compact game-button--secondary">
          Оружие
        </button>
        <button className="game-button game-button--compact game-button--secondary">
          Броня
        </button>
        <button className="game-button game-button--compact game-button--secondary">
          Зелья
        </button>
        <button className="game-button game-button--compact game-button--secondary">
          Прочее
        </button>
      </div>

      {/* Items Grid */}
      <div className="game-panel p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
          {sampleItems.map((item) => (
            <div 
              key={item.id}
              className={`item-card item-card--${item.rarity}`}
            >
              {/* Item Icon */}
              <div className="text-center mb-3">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className={`text-sm font-semibold ${getRarityColor(item.rarity)} text-center`}>
                  {item.name}
                </div>
              </div>
              
              {/* Item Stats */}
              <div className="mb-3">
                <div className="text-xs text-gray-400 text-center">
                  {item.stats}
                </div>
              </div>
              
              {/* Item Price */}
              <div className="flex items-center justify-center pt-2 border-t border-white/10">
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-400 font-medium text-sm">{item.price}</span>
                  <span className="text-yellow-400">🪙</span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Empty slots */}
          {Array.from({ length: 25 }, (_, i) => (
            <div 
              key={`empty-${i}`}
              className="item-card border-dashed border-white/20 bg-transparent hover:border-white/30 hover:box-shadow-none"
            >
              <div className="h-full flex items-center justify-center">
                <div className="text-3xl text-white/20">+</div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button className="game-button game-button--secondary">
            Продать все
          </button>
          <button className="game-button game-button--warning">
            Автосортировка
          </button>
        </div>
      </div>

      {/* Equipment Panel */}
      <div className="game-panel p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Package className="w-5 h-5 text-blue-400" />
          <span>Экипированные предметы</span>
        </h2>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {[
            { slot: 'helmet', name: 'Шлем', icon: '⛑️' },
            { slot: 'weapon', name: 'Оружие', icon: '⚔️' },
            { slot: 'chest', name: 'Броня', icon: '🦺' },
            { slot: 'legs', name: 'Штаны', icon: '👖' },
            { slot: 'boots', name: 'Обувь', icon: '🥾' },
            { slot: 'gloves', name: 'Перчатки', icon: '🧤' },
            { slot: 'ring', name: 'Кольцо', icon: '💍' },
            { slot: 'amulet', name: 'Амулет', icon: '📿' }
          ].map((slot) => (
            <div key={slot.slot} className="text-center">
              <div className="item-card border-dashed border-white/30 bg-transparent hover:border-white/40 mb-2">
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="text-2xl text-white/40 mb-1">{slot.icon}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">{slot.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
