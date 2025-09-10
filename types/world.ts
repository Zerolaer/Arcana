// Типы для новой системы карты и боевки

export interface Mob {
  id: string
  name: string
  level: number
  health: number
  attack: number // Для совместимости с фронтендом
  attack_damage?: number // Реальное поле в БД
  defense: number
  experience_reward: number
  gold_reward: number
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'elite' | 'boss'
  loot_table: LootDrop[]
}

export interface LootDrop {
  item_id: string
  drop_rate: number // 0-100%
  quantity_min: number
  quantity_max: number
}

export interface FarmSpot {
  id: string
  name: string
  position: { x: number; y: number } // Позиция на сетке карты
  mobs: Mob[]
  level_range: { min: number; max: number }
  zone_id: string
}

export interface Zone {
  id: string
  name: string
  description: string
  level_range: { min: number; max: number }
  continent_id: string
  farm_spots: FarmSpot[]
  unlock_requirements?: {
    level?: number
    completed_zones?: string[]
  }
}

export interface Continent {
  id: string
  name: string
  description: string
  level_range: { min: number; max: number }
  zones: Zone[]
  map_position: { x: number; y: number }
  color_theme: string
  unlock_requirements?: {
    level?: number
    completed_continents?: string[]
  }
}

export interface WorldMap {
  continents: Continent[]
  current_continent?: string
  current_zone?: string
}

// Состояние боя
export interface CombatState {
  player_health: number
  mob_health: number
  turn: 'player' | 'mob'
  combat_log: CombatLogEntry[]
  rewards?: CombatRewards
}

export interface CombatLogEntry {
  id: string
  timestamp: number
  action: 'attack' | 'defend' | 'critical' | 'miss' | 'heal'
  actor: 'player' | 'mob'
  damage?: number
  message: string
}

export interface CombatRewards {
  experience: number
  gold: number
  items: LootDrop[]
  level_up?: boolean
}

// Статистика фарма
export interface FarmingStats {
  zone_id: string
  time_spent: number // в секундах
  mobs_killed: number
  experience_gained: number
  gold_gained: number
  items_found: number
}
