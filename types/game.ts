// Core Game Types
export interface Player {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  player_id: string;
  name: string;
  class_id: string;
  subclass_id?: string;
  level: number;
  experience: number;
  experience_to_next: number;
  
  // Base stats
  strength: number;
  dexterity: number;
  intelligence: number;
  vitality: number;
  energy: number;
  luck: number;
  
  // Available stat points
  stat_points: number;
  skill_points: number;
  
  // Resources
  health: number;
  max_health: number;
  mana: number;
  max_mana: number;
  stamina: number;
  max_stamina: number;
  
  // Combat stats (calculated)
  attack_damage: number;
  magic_damage: number;
  defense: number;
  magic_resistance: number;
  critical_chance: number;
  critical_damage: number;
  attack_speed: number;
  movement_speed: number;
  
  // Regeneration stats
  health_regen: number;
  mana_regen: number;
  stamina_regen: number;
  
  // Economy
  gold: number;
  
  // Location
  current_location_id: string;
  current_spot_id?: string;
  
  // Status
  is_online: boolean;
  is_in_combat: boolean;
  is_afk_farming: boolean;
  last_activity: string;
  
  created_at: string;
  updated_at: string;
}

export interface CharacterClass {
  id: string;
  name: string;
  description: string;
  
  // Base stat bonuses
  base_strength: number;
  base_dexterity: number;
  base_intelligence: number;
  base_vitality: number;
  base_energy: number;
  base_luck: number;
  
  // Stat growth per level
  strength_per_level: number;
  dexterity_per_level: number;
  intelligence_per_level: number;
  vitality_per_level: number;
  energy_per_level: number;
  luck_per_level: number;
  
  // Starting skills
  starting_skills: string[];
  
  icon: string;
  primary_stat: 'strength' | 'dexterity' | 'intelligence' | 'vitality' | 'energy';
  created_at: string;
}

export interface Subclass {
  id: string;
  class_id: string;
  name: string;
  description: string;
  required_level: number;
  
  // Additional stat bonuses
  bonus_strength: number;
  bonus_dexterity: number;
  bonus_intelligence: number;
  bonus_vitality: number;
  bonus_energy: number;
  bonus_luck: number;
  
  // Unique skills
  unique_skills: string[];
  
  icon: string;
  created_at: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  skill_type: 'active' | 'passive' | 'aoe';
  
  // Requirements
  required_level: number;
  required_class?: string[];
  
  // Resource costs
  mana_cost: number;
  stamina_cost: number;
  cooldown: number;
  
  // Base damage/effects
  base_damage: number;
  damage_type: 'physical' | 'magical' | 'true';
  scaling_stat: 'strength' | 'dexterity' | 'intelligence';
  scaling_ratio: number;
  
  // Available nodes
  available_nodes: string[];
  
  icon: string;
  created_at: string;
}

export interface SkillNode {
  id: string;
  skill_id: string;
  name: string;
  description: string;
  
  // Effects
  damage_multiplier?: number;
  cooldown_reduction?: number;
  mana_cost_reduction?: number;
  additional_effects?: string[];
  
  icon: string;
}

export interface CharacterSkill {
  character_id: string;
  skill_id: string;
  level: number;
  selected_nodes: string[];
  
  // Calculated values
  damage: number;
  cooldown: number;
  mana_cost: number;
  
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  
  // Level requirements
  min_level: number;
  max_level?: number;
  
  // Environment effects
  experience_bonus: number;
  gold_bonus: number;
  
  image: string;
  created_at: string;
}

export interface FarmingSpot {
  id: string;
  location_id: string;
  name: string;
  description: string;
  
  // Occupancy
  max_occupancy: number;
  current_occupancy: number;
  occupied_by: string[]; // character IDs
  
  // Mob spawns
  mob_spawns: MobSpawn[];
  
  // Drop bonuses
  drop_rate_bonus: number;
  rare_drop_bonus: number;
  
  coordinates: {
    x: number;
    y: number;
  };
  
  created_at: string;
}

export interface Mob {
  id: string;
  name: string;
  description: string;
  
  // Stats
  level: number;
  health: number;
  attack_damage: number;
  defense: number;
  magic_resistance: number;
  
  // Behavior
  aggressive: boolean;
  respawn_time: number; // in seconds
  
  // Rewards
  experience_reward: number;
  gold_reward: number;
  
  // Loot table
  loot_table_id: string;
  
  image: string;
  created_at: string;
}

export interface MobSpawn {
  mob_id: string;
  spawn_rate: number; // mobs per minute
  max_concurrent: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  
  // Basic properties
  item_type: 'weapon' | 'armor' | 'accessory' | 'consumable' | 'material' | 'quest';
  slot?: 'weapon' | 'helmet' | 'chest' | 'legs' | 'boots' | 'gloves' | 'ring' | 'amulet';
  
  // Rarity and value
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  level_requirement: number;
  class_requirement?: string[];
  
  // Stats
  strength_bonus?: number;
  dexterity_bonus?: number;
  intelligence_bonus?: number;
  vitality_bonus?: number;
  energy_bonus?: number;
  luck_bonus?: number;
  
  attack_damage?: number;
  magic_damage?: number;
  defense?: number;
  magic_resistance?: number;
  
  // Special effects
  special_effects?: string[];
  
  // Economy
  vendor_price: number;
  stack_size: number;
  
  icon: string;
  created_at: string;
}

export interface CharacterInventory {
  character_id: string;
  item_id: string;
  quantity: number;
  slot_position?: number; // for equipped items
  is_equipped: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface LootTable {
  id: string;
  name: string;
  drops: LootDrop[];
}

export interface LootDrop {
  item_id: string;
  drop_rate: number; // percentage 0-100
  quantity_min: number;
  quantity_max: number;
  level_requirement?: number;
}

// Combat System
export interface CombatLog {
  id: string;
  character_id: string;
  mob_id: string;
  
  // Combat details
  damage_dealt: number;
  damage_taken: number;
  critical_hits: number;
  skills_used: string[];
  
  // Results
  victory: boolean;
  experience_gained: number;
  gold_gained: number;
  items_dropped: string[];
  
  duration: number; // in seconds
  timestamp: string;
}

// Real-time updates
export interface GameEvent {
  type: 'level_up' | 'item_drop' | 'death' | 'pvp_challenge' | 'spot_occupied' | 'spot_freed';
  character_id: string;
  data: any;
  timestamp: string;
}

// UI State
export interface GameUI {
  activePanel: 'character' | 'inventory' | 'skills' | 'map' | 'combat' | null;
  chatOpen: boolean;
  settingsOpen: boolean;
}

// Game Session
export interface GameSession {
  character: Character | null;
  isLoading: boolean;
  error: string | null;
  ui: GameUI;
}
