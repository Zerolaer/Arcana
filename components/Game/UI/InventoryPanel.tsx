'use client'

import { Character } from '@/types/game'
import { Backpack, Package, ShoppingCart } from 'lucide-react'

interface InventoryPanelProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
  isLoading: boolean
}

export default function InventoryPanel({ character, onUpdateCharacter, isLoading }: InventoryPanelProps) {
  return (
    <div className="flex-1 game-content p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Backpack className="w-6 h-6 text-green-400" />
            <span>Инвентарь</span>
          </h1>
          <p className="text-dark-400 mt-1">Управление предметами и экипировкой</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipment Slots */}
        <div className="lg:col-span-1">
          <div className="game-panel p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <Package className="w-5 h-5 text-blue-400" />
              <span>Экипировка</span>
            </h2>

            <div className="space-y-3">
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
                <div
                  key={slot.slot}
                  className="flex items-center space-x-3 p-3 bg-dark-200/30 rounded border border-dark-300/30 hover:border-dark-200 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 bg-dark-300/30 rounded border border-dark-300/50 flex items-center justify-center text-xl">
                    {slot.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{slot.name}</div>
                    <div className="text-xs text-dark-500">Пусто</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="lg:col-span-2">
          <div className="game-panel p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5 text-green-400" />
              <span>Предметы</span>
            </h2>

            <div className="inventory-grid">
              {Array.from({ length: 40 }, (_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-dark-200/30 rounded border border-dark-300/30 hover:border-dark-200 transition-colors cursor-pointer flex items-center justify-center"
                >
                  <span className="text-dark-600 text-xs">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="game-panel p-6 text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h3 className="text-xl font-bold text-white mb-2">Скоро будет готово!</h3>
        <p className="text-dark-400">
          Система инвентаря и экипировки находится в разработке. 
          Здесь вы сможете управлять предметами, экипировкой и улучшениями.
        </p>
      </div>
    </div>
  )
}
