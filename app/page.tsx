'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, getCurrentUser } from '@/lib/supabase'
import AuthForm from '@/components/Auth/AuthForm'
import GameLobby from '@/components/Game/GameLobby'
import GameInterface from '@/components/Game/GameInterface'
import LoadingScreen from '@/components/UI/LoadingScreen'
import { Character } from '@/types/game'

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [gameState, setGameState] = useState<'auth' | 'lobby' | 'game'>('auth')

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      // Check for existing user session
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Error getting user:', error)
        setGameState('auth')
        return
      }

      if (user) {
        console.log('🎮 App initialization: User found', user.email)
        setUser(user)
        
        // Check if user has a character
        try {
          const { data: characters, error: charactersError } = await supabase
            .from('characters')
            .select('*')
            .eq('player_id', user.id)
            .limit(1)
          
          if (charactersError) {
            console.error('❌ Error fetching characters during initialization:', charactersError)
            setGameState('lobby')
            return
          }
          
          console.log('🔍 Characters found during initialization:', characters?.length || 0)
          
          if (characters && characters.length > 0) {
            console.log('✅ Loading existing character:', characters[0].name)
            setCharacter(characters[0] as Character)
            setGameState('game')
          } else {
            console.log('➕ No character found, redirecting to creation')
            setGameState('lobby')
          }
        } catch (err) {
          console.error('❌ Character fetch error during initialization:', err)
          setGameState('lobby')
        }
      } else {
        setGameState('auth')
      }
    } catch (error) {
      console.error('Error initializing app:', error)
      setGameState('auth')
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSuccess = async (user: User) => {
    setUser(user)
    
    // Check if user already has a character
    try {
      const { data: characters, error: charactersError } = await supabase
        .from('characters')
        .select('*')
        .eq('player_id', user.id)
        .limit(1)
      
      if (charactersError) {
        console.error('Error fetching characters after login:', charactersError)
        setGameState('lobby')
        return
      }
      
      if (characters && characters.length > 0) {
        console.log('Found existing character:', characters[0].name)
        setCharacter(characters[0] as Character)
        setGameState('game')
      } else {
        console.log('No character found, redirecting to lobby')
        setGameState('lobby')
      }
    } catch (err) {
      console.error('Character check error after login:', err)
      setGameState('lobby')
    }
  }

  const handleCharacterCreated = (character: Character) => {
    setCharacter(character)
    setGameState('game')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setCharacter(null)
    setGameState('auth')
  }

  if (loading) {
    return <LoadingScreen message="Загрузка мира..." />
  }

  return (
    <main className="full-height-container bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200">
      {gameState === 'auth' && (
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      )}
      
      {gameState === 'lobby' && user && (
        <GameLobby 
          user={user} 
          onCharacterCreated={handleCharacterCreated}
          onLogout={handleLogout}
        />
      )}
      
      {gameState === 'game' && character && user && (
        <GameInterface 
          character={character}
          user={user}
          onLogout={handleLogout}
        />
      )}
    </main>
  )
}
