'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, getCharacterClasses, createCharacter } from '@/lib/supabase'
import { Character, CharacterClass } from '@/types/game'
import { toast } from 'react-hot-toast'
import { LogOut, Star, Zap, Shield, Sword, Eye, Crown } from 'lucide-react'
import LoadingScreen from '@/components/UI/LoadingScreen'

interface GameLobbyProps {
  user: User
  onCharacterCreated: (character: Character) => void
  onLogout: () => void
}

export default function GameLobby({ user, onCharacterCreated, onLogout }: GameLobbyProps) {
  const [classes, setClasses] = useState<CharacterClass[]>([])
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null)
  const [characterName, setCharacterName] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    try {
      const { classes: gameClasses, error } = await getCharacterClasses()
      
      if (error) {
        toast.error('Ошибка загрузки классов')
        console.error('Classes error:', error)
        return
      }
      
      if (gameClasses) {
        setClasses(gameClasses)
        setSelectedClass(gameClasses[0])
      }
    } catch (error) {
      console.error('Error loading classes:', error)
      toast.error('Ошибка подключения к серверу')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCharacter = async () => {
    if (!selectedClass || !characterName.trim()) {
      toast.error('Выберите класс и введите имя персонажа')
      return
    }

    if (characterName.length < 3 || characterName.length > 20) {
      toast.error('Имя персонажа должно быть от 3 до 20 символов')
      return
    }

    setCreating(true)

    try {
      // Create player record if doesn't exist
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingPlayer) {
        const { error: playerError } = await (supabase
          .from('players') as any)
          .insert({
            id: user.id,
            username: user.user_metadata?.username || characterName,
            email: user.email!
          })

        if (playerError) {
          console.error('Player creation error:', playerError)
          toast.error('Ошибка создания игрока')
          return
        }
      }

      // Get first location
      const { data: firstLocation } = await (supabase
        .from('locations') as any)
        .select('id')
        .order('min_level')
        .limit(1)
        .single()

      if (!firstLocation) {
        toast.error('Ошибка: не найдена стартовая локация')
        return
      }

      // Calculate starting stats - round to integers
      const startingStats = {
        strength: Math.round(selectedClass.base_strength + (selectedClass.strength_per_level * 0)),
        dexterity: Math.round(selectedClass.base_dexterity + (selectedClass.dexterity_per_level * 0)),
        intelligence: Math.round(selectedClass.base_intelligence + (selectedClass.intelligence_per_level * 0)),
        vitality: Math.round(selectedClass.base_vitality + (selectedClass.vitality_per_level * 0)),
        energy: Math.round(selectedClass.base_energy + (selectedClass.energy_per_level * 0)),
        luck: Math.round(selectedClass.base_luck + (selectedClass.luck_per_level * 0))
      }

      const maxHealth = startingStats.vitality * 10 + 100
      const maxMana = startingStats.energy * 5 + 50
      const maxStamina = startingStats.vitality * 5 + startingStats.dexterity * 3 + 100

      const characterData = {
        player_id: user.id,
        name: characterName.trim(),
        class_id: selectedClass.id,
        level: 1,
        experience: 0,
        experience_to_next: 100,
        ...startingStats,
        stat_points: 0,
        skill_points: 1,
        health: maxHealth,
        max_health: maxHealth,
        mana: maxMana,
        max_mana: maxMana,
        stamina: maxStamina,
        max_stamina: maxStamina,
        attack_damage: Math.round(startingStats.strength * 2 + startingStats.dexterity),
        magic_damage: Math.round(startingStats.intelligence * 2.5),
        defense: Math.round(startingStats.vitality * 1.5 + startingStats.strength * 0.5),
        magic_resistance: Math.round(startingStats.energy + startingStats.intelligence * 0.3),
        critical_chance: Math.round(Math.min(startingStats.luck * 0.1 + startingStats.dexterity * 0.05, 50) * 100) / 100,
        critical_damage: Math.round((150 + startingStats.strength * 0.5) * 100) / 100,
        attack_speed: Math.round((100 + startingStats.dexterity * 0.8) * 100) / 100,
        movement_speed: Math.round((100 + startingStats.dexterity * 0.5) * 100) / 100,
        gold: 100,
        current_location_id: firstLocation.id,
        is_online: true,
        is_in_combat: false,
        is_afk_farming: false
      }

      const { character, error } = await createCharacter(characterData)
      
      if (error) {
        console.error('Character creation error:', error)
        if ((error as any)?.code === '23505') {
          toast.error('Имя персонажа уже занято')
        } else {
          toast.error('Ошибка создания персонажа')
        }
        return
      }

      if (character) {
        toast.success(`Персонаж ${character.name} создан!`)
        onCharacterCreated(character)
      }
    } catch (error) {
      console.error('Error creating character:', error)
      toast.error('Произошла ошибка при создании персонажа')
    } finally {
      setCreating(false)
    }
  }

  const getPrimaryStatIcon = (stat: string) => {
    switch (stat) {
      case 'strength': return <Sword className="w-4 h-4 text-red-400" />
      case 'dexterity': return <Zap className="w-4 h-4 text-yellow-400" />
      case 'intelligence': return <Eye className="w-4 h-4 text-blue-400" />
      case 'vitality': return <Shield className="w-4 h-4 text-green-400" />
      case 'energy': return <Star className="w-4 h-4 text-purple-400" />
      default: return <Crown className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatBarColor = (value: number, max: number = 25) => {
    const percentage = (value / max) * 100
    if (percentage >= 80) return 'bg-gradient-to-r from-red-500 to-red-400'
    if (percentage >= 60) return 'bg-gradient-to-r from-yellow-500 to-yellow-400'
    if (percentage >= 40) return 'bg-gradient-to-r from-blue-500 to-blue-400'
    return 'bg-gradient-to-r from-gray-500 to-gray-400'
  }

  if (loading) {
    return <LoadingScreen message="Загрузка классов..." />
  }

  return (
    <div className="full-height bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200 p-4 relative overflow-auto">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-game text-white mb-2">
              Создание персонажа
            </h1>
            <p className="text-dark-400">
              Добро пожаловать, {user.user_metadata?.username || user.email}! Выберите класс для вашего персонажа.
            </p>
          </div>
          
          <button
            onClick={onLogout}
            className="game-button game-button--compact game-button--secondary flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Выйти</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Class Selection */}
          <div className="lg:col-span-2">
            <div className="game-panel p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <Crown className="w-6 h-6 text-gold-400" />
                <span>Выберите класс</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {classes.map((characterClass) => (
                  <div
                    key={characterClass.id}
                    onClick={() => setSelectedClass(characterClass)}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                      selectedClass?.id === characterClass.id
                        ? 'border-primary-400 bg-primary-500/10 shadow-lg shadow-primary-500/20'
                        : 'border-dark-300/50 bg-dark-200/30 hover:border-dark-200 hover:bg-dark-200/50'
                    }`}
                  >
                    {/* Class Icon */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-3xl">{characterClass.icon}</div>
                      <div>
                        <h3 className="font-bold text-white">{characterClass.name}</h3>
                        <div className="flex items-center space-x-1 text-sm">
                          {getPrimaryStatIcon(characterClass.primary_stat)}
                          <span className="text-dark-400 capitalize">{characterClass.primary_stat}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Preview */}
                    <div className="space-y-2 mb-3">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <Sword className="w-3 h-3 text-red-400" />
                          <span className="text-dark-300">{characterClass.base_strength}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          <span className="text-dark-300">{characterClass.base_dexterity}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3 text-blue-400" />
                          <span className="text-dark-300">{characterClass.base_intelligence}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-dark-400 line-clamp-3">
                      {characterClass.description}
                    </p>

                    {/* Selection Indicator */}
                    {selectedClass?.id === characterClass.id && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-white fill-current" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Character Creation */}
          <div className="space-y-6">
            {/* Selected Class Details */}
            {selectedClass && (
              <div className="game-panel p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-4xl">{selectedClass.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedClass.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-dark-400">
                      {getPrimaryStatIcon(selectedClass.primary_stat)}
                      <span className="capitalize">{selectedClass.primary_stat}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-dark-300 mb-4">
                  {selectedClass.description}
                </p>

                {/* Detailed Stats */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-white text-sm">Начальные характеристики:</h4>
                  
                  <div className="space-y-2">
                    {[
                      { name: 'Сила', value: selectedClass.base_strength, icon: <Sword className="w-3 h-3 text-red-400" />, color: 'red' },
                      { name: 'Ловкость', value: selectedClass.base_dexterity, icon: <Zap className="w-3 h-3 text-yellow-400" />, color: 'yellow' },
                      { name: 'Интеллект', value: selectedClass.base_intelligence, icon: <Eye className="w-3 h-3 text-blue-400" />, color: 'blue' },
                      { name: 'Живучесть', value: selectedClass.base_vitality, icon: <Shield className="w-3 h-3 text-green-400" />, color: 'green' },
                      { name: 'Энергия', value: selectedClass.base_energy, icon: <Star className="w-3 h-3 text-purple-400" />, color: 'purple' },
                      { name: 'Удача', value: selectedClass.base_luck, icon: <Crown className="w-3 h-3 text-gold-400" />, color: 'gold' }
                    ].map((stat) => (
                      <div key={stat.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {stat.icon}
                          <span className="text-sm text-dark-300">{stat.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-1.5 bg-dark-300/30 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${getStatBarColor(stat.value)}`}
                              style={{ width: `${(stat.value / 25) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-white font-semibold w-6 text-right">{stat.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Character Name */}
            <div className="game-panel p-6">
              <h3 className="text-lg font-bold text-white mb-4">Имя персонажа</h3>
              
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="game-input mb-4"
                placeholder="Введите имя персонажа"
                maxLength={20}
                minLength={3}
              />
              
              <div className="text-xs text-dark-500 mb-4">
                {characterName.length}/20 символов (минимум 3)
              </div>

              <button
                onClick={handleCreateCharacter}
                disabled={creating || !selectedClass || characterName.length < 3}
                className={`w-full game-button flex items-center justify-center space-x-2 text-lg font-bold ${
                  !creating && selectedClass && characterName.length >= 3 
                    ? 'game-button--gold' 
                    : 'game-button--secondary'
                }`}
              >
                {creating && <div className="loading-spinner" />}
                <span>
                  {creating ? 'Создание персонажа...' : 'Начать приключение'}
                </span>
              </button>
            </div>

            {/* Tips */}
            <div className="game-panel p-4">
              <h4 className="font-semibold text-white text-sm mb-2 flex items-center space-x-1">
                <span>💡</span>
                <span>Совет</span>
              </h4>
              <p className="text-xs text-dark-500">
                Каждый класс имеет уникальные способности и развитие. Выберите класс, соответствующий вашему стилю игры!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
