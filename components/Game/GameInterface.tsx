'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Character } from '@/types/game'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

// Game UI Components
import GameHeader from './UI/GameHeader'
import GameSidebar, { ActivePanel } from './UI/GameSidebar'
import CharacterPanelUnified from './UI/CharacterPanelUnified'
import InventoryPanelNew from './UI/InventoryPanelNew'
import LocationPanel from './UI/LocationPanel'
import WorldMapNew from './World/WorldMapNew'
import SkillsPanelNew from './UI/SkillsPanelNew'
import RegenerationSystemSimple from './UI/RegenerationSystemSimple'
import AdminPanel from './Admin/AdminPanel'
import { useActiveSkills } from '@/lib/useActiveSkills'

interface GameInterfaceProps {
  character: Character
  user: User
  onLogout: () => void
}


export default function GameInterface({ character: initialCharacter, user, onLogout }: GameInterfaceProps) {
  const [character, setCharacter] = useState<Character>(initialCharacter)
  const [activePanel, setActivePanel] = useState<ActivePanel>(() => {
    // Очищаем старое значение 'combat' из localStorage
    if (typeof window !== 'undefined') {
      const savedPanel = localStorage.getItem('gameActivePanel')
      if (savedPanel === 'combat') {
        localStorage.removeItem('gameActivePanel')
        return 'character'
      }
      // Проверяем, что сохраненная панель валидна
      const validPanels = ['character', 'inventory', 'skills', 'location']
      if (savedPanel && validPanels.includes(savedPanel)) {
        return savedPanel as ActivePanel
      }
    }
    return 'character'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false)
  const activeSkills = useActiveSkills()

  // Функция для сохранения активной панели в localStorage
  const handlePanelChange = (panel: ActivePanel) => {
    setActivePanel(panel)
    if (typeof window !== 'undefined') {
      localStorage.setItem('gameActivePanel', panel || '')
    }
  }

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

  // Хоткей для админ панели
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Shift+A для открытия админ панели
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault()
        setIsAdminPanelOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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

  const updateCharacterData = async (updates: Partial<Character>, silent: boolean = false): Promise<boolean> => {
    try {
      if (!silent) {
        setIsLoading(true)
      }
      
      const { data, error } = await (supabase
        .from('characters') as any)
        .update(updates)
        .eq('id', character.id)
        .select()
        .single()

      if (error) {
        if (!silent) {
          toast.error('Ошибка обновления персонажа')
        }
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
      if (!silent) {
        toast.error('Произошла ошибка')
      }
      return false
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }

  const handleCharacterUpdate = async () => {
    // Обновляем данные персонажа из базы
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', character.id)
        .single()

      if (error) throw error
      if (data) {
        setCharacter(data)
      }
    } catch (error) {
      console.error('Error refreshing character:', error)
    }
  }

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'character':
        return (
          <CharacterPanelUnified 
            character={character}
            onUpdateCharacter={updateCharacterData}
            isLoading={isLoading}
          />
        )
      case 'inventory':
        return (
          <InventoryPanelNew
            character={character}
            onUpdateCharacter={updateCharacterData}
            isLoading={isLoading}
          />
        )
      case 'skills':
        return (
          <SkillsPanelNew 
            character={character}
            onUpdateCharacter={updateCharacterData}
            isLoading={isLoading}
          />
        )
      case 'location':
        return (
          <WorldMapNew
            character={character}
            onUpdateCharacter={updateCharacterData}
            onUpdateCharacterStats={(updates) => setCharacter(prev => ({ ...prev, ...updates }))}
            activeSkills={activeSkills}
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
          onPanelChange={handlePanelChange}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {renderActivePanel()}
        </div>
      </div>

      {/* Regeneration System */}
      <RegenerationSystemSimple 
        character={character}
        onUpdateCharacter={updateCharacterData}
        isInCombat={character.is_in_combat}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-dark-100/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="game-panel p-6 flex items-center space-x-3">
            <div className="loading-spinner" />
            <span className="text-white">Обновление...</span>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        character={character}
        onCharacterUpdate={handleCharacterUpdate}
      />
    </div>
  )
}
