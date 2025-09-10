'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Character } from '@/types/game'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

// Game UI Components
import GameHeader from './UI/GameHeader'
import GameSidebar from './UI/GameSidebar'
import CharacterPanelNew from './UI/CharacterPanelNew'
import InventoryGrid from './UI/InventoryGrid'
import SkillsTree from './UI/SkillsTree'
import LocationMap from './UI/LocationMap'
import CombatInterface from './UI/CombatInterface'

interface GameInterfaceProps {
  character: Character
  user: User
  onLogout: () => void
}

type ActivePanel = 'character' | 'inventory' | 'skills' | 'location' | 'combat' | null

export default function GameInterface({ character: initialCharacter, user, onLogout }: GameInterfaceProps) {
  const [character, setCharacter] = useState<Character>(initialCharacter)
  const [activePanel, setActivePanel] = useState<ActivePanel>('character')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Subscribe to character updates
    const channel = supabase
      .channel(`character_${character.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'characters',
          filter: `id=eq.${character.id}`
        }, 
        (payload: any) => {
          console.log('Character updated:', payload)
          if (payload.new) {
            setCharacter(payload.new as Character)
          }
        }
      )
      .subscribe()

    // Update last activity
    updateLastActivity()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [character.id])

  const updateLastActivity = async () => {
    try {
      await (supabase
        .from('characters') as any)
        .update({
          last_activity: new Date().toISOString(),
          is_online: true
        })
        .eq('id', character.id)
    } catch (error) {
      console.error('Error updating activity:', error)
    }
  }

  const updateCharacterData = async (updates: Partial<Character>): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const { data, error } = await (supabase
        .from('characters') as any)
        .update(updates)
        .eq('id', character.id)
        .select()
        .single()

      if (error) {
        toast.error('Ошибка обновления персонажа')
        console.error('Character update error:', error)
        return false
      }

      if (data) {
        setCharacter(data)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error updating character:', error)
      toast.error('Произошла ошибка')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleInventoryMove = async (fromIndex: number, toIndex: number): Promise<boolean> => {
    try {
      const { data, error } = await (supabase as any).rpc('move_inventory_item', {
        p_character_id: character.id,
        p_from_slot: fromIndex,
        p_to_slot: toIndex
      })

      if (error) {
        console.error('Error moving item:', error)
        toast.error('Ошибка перемещения предмета')
        return false
      }

      return data?.success || false
    } catch (error) {
      console.error('Error moving item:', error)
      toast.error('Ошибка подключения к серверу')
      return false
    }
  }

  const handleItemUse = async (item: any, index: number): Promise<boolean> => {
    try {
      // Implement item usage logic here
      toast.success(`Использован предмет: ${item.name}`)
      return true
    } catch (error) {
      console.error('Error using item:', error)
      toast.error('Ошибка использования предмета')
      return false
    }
  }

  const handleItemDrop = async (item: any, index: number): Promise<boolean> => {
    try {
      // Implement item dropping logic here
      toast.success(`Предмет удален: ${item.name}`)
      return true
    } catch (error) {
      console.error('Error dropping item:', error)
      toast.error('Ошибка удаления предмета')
      return false
    }
  }

  const handleLearnSkill = async (skillId: string): Promise<boolean> => {
    try {
      // Implement skill learning logic here
      toast.success('Навык изучен!')
      return true
    } catch (error) {
      console.error('Error learning skill:', error)
      toast.error('Ошибка изучения навыка')
      return false
    }
  }

  const handleUpgradeSkill = async (skillId: string): Promise<boolean> => {
    try {
      // Implement skill upgrade logic here
      toast.success('Навык улучшен!')
      return true
    } catch (error) {
      console.error('Error upgrading skill:', error)
      toast.error('Ошибка улучшения навыка')
      return false
    }
  }

  const handleSelectNode = async (skillId: string, nodeId: string): Promise<boolean> => {
    try {
      // Implement node selection logic here
      toast.success('Нода выбрана!')
      return true
    } catch (error) {
      console.error('Error selecting node:', error)
      toast.error('Ошибка выбора ноды')
      return false
    }
  }

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'character':
        return (
          <CharacterPanelNew
            character={character}
            onUpdateCharacter={updateCharacterData}
            isLoading={isLoading}
          />
        )
      case 'inventory':
        return (
          <InventoryGrid
            inventory={[]} // This should be loaded from the database
            onMoveItem={handleInventoryMove}
            onUseItem={handleItemUse}
            onDropItem={handleItemDrop}
            isLoading={isLoading}
          />
        )
      case 'skills':
        return (
          <SkillsTree
            character={character}
            skills={[]} // This should be loaded from the database
            availableSkills={[]} // This should be loaded from the database
            onLearnSkill={handleLearnSkill}
            onUpgradeSkill={handleUpgradeSkill}
            onSelectNode={handleSelectNode}
            isLoading={isLoading}
          />
        )
      case 'location':
        return (
          <LocationMap
            character={character}
            onUpdateCharacter={updateCharacterData}
            isLoading={isLoading}
          />
        )
      case 'combat':
        return (
          <CombatInterface
            character={character}
            onUpdateCharacter={updateCharacterData}
            isLoading={isLoading}
          />
        )
      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Добро пожаловать в игру!
              </h2>
              <p className="text-dark-400">
                Выберите панель из меню слева для начала приключения
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="full-height bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 flex flex-col relative">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/3 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Game Header */}
      <GameHeader 
        character={character}
        user={user}
        onLogout={onLogout}
      />

      {/* Main Game Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <GameSidebar 
          character={character}
          activePanel={activePanel}
          onPanelChange={setActivePanel}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {renderActivePanel()}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-dark-100/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="game-panel p-6 flex items-center space-x-3">
            <div className="loading-spinner" />
            <span className="text-white">Обновление...</span>
          </div>
        </div>
      )}
    </div>
  )
}