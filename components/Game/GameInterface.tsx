'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Character } from '@/types/game'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

// Game UI Components
import GameHeader from './UI/GameHeader'
import GameSidebar from './UI/GameSidebar'
import CharacterPanel from './UI/CharacterPanel'
import InventoryPanel from './UI/InventoryPanel'
import LocationPanel from './UI/LocationPanel'
import SkillsPanel from './UI/SkillsPanel'
import CombatPanel from './UI/CombatPanel'

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
        (payload) => {
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
      await supabase
        .from('characters')
        .update({ 
          last_activity: new Date().toISOString(),
          is_online: true 
        })
        .eq('id', character.id)
    } catch (error) {
      console.error('Error updating activity:', error)
    }
  }

  const updateCharacterData = async (updates: Partial<Character>) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from('characters')
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

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'character':
        return (
          <CharacterPanel
            character={character}
            onUpdateCharacter={updateCharacterData}
            isLoading={isLoading}
          />
        )
      case 'inventory':
        return (
          <InventoryPanel
            character={character}
            onUpdateCharacter={updateCharacterData}
            isLoading={isLoading}
          />
        )
      case 'skills':
        return (
          <SkillsPanel
            character={character}
            onUpdateCharacter={updateCharacterData}
            isLoading={isLoading}
          />
        )
      case 'location':
        return (
          <LocationPanel
            character={character}
            onUpdateCharacter={updateCharacterData}
            isLoading={isLoading}
          />
        )
      case 'combat':
        return (
          <CombatPanel
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
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 flex flex-col">
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
      <div className="flex-1 flex">
        {/* Sidebar */}
        <GameSidebar 
          character={character}
          activePanel={activePanel}
          onPanelChange={setActivePanel}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
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
