import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Auth helpers
export const signUp = async (email: string, password: string, username: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      }
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Game data helpers
export const getCharacter = async (playerId: string) => {
  const { data, error } = await (supabase
    .from('characters') as any)
    .select('*')
    .eq('player_id', playerId)
    .single()
  
  return { character: data, error }
}

export const createCharacter = async (characterData: any) => {
  const { data, error } = await (supabase
    .from('characters') as any)
    .insert([characterData])
    .select()
    .single()
  
  return { character: data, error }
}

export const updateCharacter = async (characterId: string, updates: any) => {
  const { data, error } = await (supabase
    .from('characters') as any)
    .update(updates)
    .eq('id', characterId)
    .select()
    .single()
  
  return { character: data, error }
}

export const getCharacterClasses = async () => {
  const { data, error } = await supabase
    .from('character_classes')
    .select('*')
    .order('name')
  
  return { classes: data, error }
}

export const getLocations = async () => {
  const { data, error } = await supabase
    .from('locations')
    .select(`
      *,
      farming_spots (
        *,
        mob_spawns (
          *,
          mob:mobs (*)
        )
      )
    `)
    .order('min_level')
  
  return { locations: data, error }
}

export const getFarmingSpots = async (locationId: string) => {
  const { data, error } = await supabase
    .from('farming_spots')
    .select(`
      *,
      mob_spawns (
        *,
        mob:mobs (*)
      )
    `)
    .eq('location_id', locationId)
  
  return { spots: data, error }
}

export const occupySpot = async (spotId: string, characterId: string) => {
  const { data, error } = await (supabase as any).rpc('occupy_farming_spot', {
    spot_id: spotId,
    character_id: characterId
  })
  
  return { success: data, error }
}

export const leaveSpot = async (spotId: string, characterId: string) => {
  const { data, error } = await (supabase as any).rpc('leave_farming_spot', {
    spot_id: spotId,
    character_id: characterId
  })
  
  return { success: data, error }
}

export const getCharacterInventory = async (characterId: string) => {
  const { data, error } = await supabase
    .from('character_inventory')
    .select(`
      *,
      item:items (*)
    `)
    .eq('character_id', characterId)
    .order('slot_position', { ascending: true, nullsFirst: false })
  
  return { inventory: data, error }
}

export const getCharacterSkills = async (characterId: string) => {
  const { data, error } = await supabase
    .from('character_skills')
    .select(`
      *,
      skill:skills (
        *,
        nodes:skill_nodes (*)
      )
    `)
    .eq('character_id', characterId)
  
  return { skills: data, error }
}

// Real-time subscriptions
export const subscribeToCharacterUpdates = (characterId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`character_${characterId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'characters',
        filter: `id=eq.${characterId}`
      }, 
      callback
    )
    .subscribe()
}

export const subscribeToSpotUpdates = (locationId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`location_${locationId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'farming_spots',
        filter: `location_id=eq.${locationId}`
      }, 
      callback
    )
    .subscribe()
}

export const subscribeToGameEvents = (callback: (payload: any) => void) => {
  return supabase
    .channel('game_events')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'game_events'
      }, 
      callback
    )
    .subscribe()
}

// Combat system
export const initiateCombat = async (characterId: string, mobId: string) => {
  const { data, error } = await (supabase as any).rpc('initiate_combat', {
    character_id: characterId,
    mob_id: mobId
  })
  
  return { combat: data, error }
}

export const performAttack = async (characterId: string, skillId?: string) => {
  const { data, error } = await (supabase as any).rpc('perform_attack', {
    character_id: characterId,
    skill_id: skillId
  })
  
  return { result: data, error }
}

// Utility functions
export const calculateStats = (character: any) => {
  const baseStats = {
    health: character.vitality * 10 + 100,
    mana: character.energy * 5 + 50,
    stamina: character.vitality * 5 + character.dexterity * 3 + 100,
    attack_damage: character.strength * 2 + character.dexterity,
    magic_damage: character.intelligence * 2.5,
    defense: character.vitality * 1.5 + character.strength * 0.5,
    magic_resistance: character.energy + character.intelligence * 0.3,
    critical_chance: Math.min(character.luck * 0.1 + character.dexterity * 0.05, 50),
    critical_damage: 150 + character.strength * 0.5,
    attack_speed: 100 + character.dexterity * 0.8,
    movement_speed: 100 + character.dexterity * 0.5
  }
  
  return baseStats
}
