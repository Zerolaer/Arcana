'use client'

import { memo, useRef, useImperativeHandle, forwardRef } from 'react'
import { Character } from '@/types/game'
import { Mob } from '@/types/world'
import CombatSkillPanel from '../UI/CombatSkillPanel'

interface CombatState {
  isInCombat: boolean
  currentMobs: Mob[]
  battleLog: string[]
  isPlayerTurn: boolean
  currentMana: number
  selectedSkill: any
}

interface CombatInterfaceProps {
  character: Character
  combatState: CombatState
  onAttack: () => void
  onSkillSelect: (skill: any) => void
  onEndCombat: () => void
}

export interface CombatInterfaceRef {
  startCooldown: (skillId: string, cooldown: number) => void
}

const CombatInterface = forwardRef<CombatInterfaceRef, CombatInterfaceProps>(
  function CombatInterface({ 
    character, 
    combatState, 
    onAttack, 
    onSkillSelect, 
    onEndCombat 
  }, ref) {
    const skillPanelRef = useRef<any>(null)

    useImperativeHandle(ref, () => ({
      startCooldown: (skillId: string, cooldown: number) => {
        skillPanelRef.current?.startCooldown(skillId, cooldown)
      }
    }))

    if (!combatState.isInCombat) {
      return null
    }

    const aliveMobs = combatState.currentMobs.filter(mob => mob.health > 0)

    return (
      <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center">
        <div className="bg-dark-800 rounded-lg border border-primary-400/30 p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          {/* Заголовок боя */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Бой</h2>
            <button
              onClick={onEndCombat}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
            >
              Покинуть бой
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Левая панель - враги */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Противники</h3>
              {combatState.currentMobs.map((mob, index) => (
                <div
                  key={`${mob.id}-${index}`}
                  className={`p-3 rounded border ${
                    mob.health <= 0 
                      ? 'opacity-30 grayscale border-red-500/30 bg-red-500/10' 
                      : 'border-red-400/50 bg-red-500/10'
                  }`}
                >
                  {mob.health <= 0 && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <span className="text-2xl font-bold text-red-400">💀 УБИТ</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">{mob.name}</span>
                    <span className="text-sm text-gray-400">Ур. {mob.level}</span>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">{mob.description}</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-red-300">HP:</span>
                      <span className="text-white">
                        {Math.ceil(mob.health)} / {Math.ceil(mob.max_health)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(0, (mob.health / mob.max_health) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Центральная панель - лог боя */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Лог боя</h3>
              <div className="bg-dark-700 rounded border border-gray-600/30 p-3 h-64 overflow-y-auto">
                {combatState.battleLog.length === 0 ? (
                  <p className="text-gray-400 text-center">Бой еще не начался...</p>
                ) : (
                  <div className="space-y-1">
                    {combatState.battleLog.map((log, index) => (
                      <div key={index} className="text-sm text-gray-300">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Правая панель - скилы и действия */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Действия</h3>
              
              {/* Информация о персонаже */}
              <div className="bg-dark-700 rounded border border-gray-600/30 p-3">
                <div className="text-sm text-gray-300 mb-2">
                  <div className="flex justify-between">
                    <span>HP:</span>
                    <span className="text-white">
                      {Math.ceil(character.health)} / {Math.ceil(character.max_health)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>MP:</span>
                    <span className="text-white">
                      {Math.ceil(combatState.currentMana)} / {Math.ceil(character.max_mana)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Скилы */}
              <CombatSkillPanel
                ref={skillPanelRef}
                character={character}
                onSkillSelect={onSkillSelect}
                selectedSkill={combatState.selectedSkill}
              />

              {/* Кнопка атаки */}
              <button
                onClick={onAttack}
                disabled={!combatState.isPlayerTurn || aliveMobs.length === 0}
                className="w-full px-4 py-3 bg-primary-500/20 text-primary-400 rounded-lg border border-primary-400/50 hover:bg-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aliveMobs.length === 0 ? 'Все враги побеждены!' : 'Атаковать'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

export default memo(CombatInterface)
