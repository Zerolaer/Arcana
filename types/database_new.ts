export interface Database {
  public: {
    Functions: {
      get_character_inventory: {
        Args: {
          p_character_id: string
        }
        Returns: {
          id: string
          item_key: string
          name: string
          description: string
          rarity: string
          type: string
          subtype: string
          icon: string
          level_requirement: number
          class_requirement: string
          base_damage: number
          base_defense: number
          base_health: number
          base_mana: number
          base_crit_chance: number
          base_crit_damage: number
          base_speed: number
          base_value: number
          max_durability: number
          stackable: boolean
          max_stack: number
          set_name: string
          set_bonus: string
          requirements_stats: any
          created_at: string
          quantity: number
          slot_position: number
          is_equipped: boolean
        }[]
      }
      apply_regeneration: {
        Args: {
          p_character_id: string
        }
        Returns: {
          success: boolean
          new_health: number
          new_mana: number
          health_regen_rate: number
          mana_regen_rate: number
        }
      }
    }
    Tables: {
      players: {
        Row: {
          id: string
          username: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      characters: {
        Row: {
          id: string
          player_id: string
          name: string
          class_id: string
          subclass_id: string | null
          level: number
          experience: number
          experience_to_next: number
          agility: number
          precision: number
          evasion: number
          intelligence: number
          spell_power: number
          resistance: number
          strength: number
          endurance: number
          armor: number
          stealth: number
          stat_points: number
          health: number
          max_health: number
          mana: number
          max_mana: number
          attack_damage: number
          magic_damage: number
          defense: number
          magic_resistance: number
          critical_chance: number
          critical_damage: number
          attack_speed: number
          accuracy: number
          gold: number
          current_location_id: string
          current_spot_id: string | null
          is_online: boolean
          is_in_combat: boolean
          is_afk_farming: boolean
          last_activity: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          name: string
          class_id: string
          subclass_id?: string | null
          level?: number
          experience?: number
          experience_to_next?: number
          agility?: number
          precision?: number
          evasion?: number
          intelligence?: number
          spell_power?: number
          resistance?: number
          strength?: number
          endurance?: number
          armor?: number
          stealth?: number
          stat_points?: number
          health?: number
          max_health?: number
          mana?: number
          max_mana?: number
          attack_damage?: number
          magic_damage?: number
          defense?: number
          magic_resistance?: number
          critical_chance?: number
          critical_damage?: number
          attack_speed?: number
          accuracy?: number
          gold?: number
          current_location_id?: string
          current_spot_id?: string | null
          is_online?: boolean
          is_in_combat?: boolean
          is_afk_farming?: boolean
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          name?: string
          class_id?: string
          subclass_id?: string | null
          level?: number
          experience?: number
          experience_to_next?: number
          agility?: number
          precision?: number
          evasion?: number
          intelligence?: number
          spell_power?: number
          resistance?: number
          strength?: number
          endurance?: number
          armor?: number
          stealth?: number
          stat_points?: number
          health?: number
          max_health?: number
          mana?: number
          max_mana?: number
          attack_damage?: number
          magic_damage?: number
          defense?: number
          magic_resistance?: number
          critical_chance?: number
          critical_damage?: number
          attack_speed?: number
          accuracy?: number
          gold?: number
          current_location_id?: string
          current_spot_id?: string | null
          is_online?: boolean
          is_in_combat?: boolean
          is_afk_farming?: boolean
          last_activity?: string
          created_at?: string
          updated_at?: string
        }
      }
      character_classes: {
        Row: {
          id: string
          name: string
          description: string
          base_agility: number
          base_precision: number
          base_evasion: number
          base_intelligence: number
          base_spell_power: number
          base_resistance: number
          base_strength: number
          base_endurance: number
          base_armor: number
          base_stealth: number
          agility_per_level: number
          precision_per_level: number
          evasion_per_level: number
          intelligence_per_level: number
          spell_power_per_level: number
          resistance_per_level: number
          strength_per_level: number
          endurance_per_level: number
          armor_per_level: number
          stealth_per_level: number
          starting_skills: string[]
          icon: string
          primary_stats: string[]
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          base_agility?: number
          base_precision?: number
          base_evasion?: number
          base_intelligence?: number
          base_spell_power?: number
          base_resistance?: number
          base_strength?: number
          base_endurance?: number
          base_armor?: number
          base_stealth?: number
          agility_per_level?: number
          precision_per_level?: number
          evasion_per_level?: number
          intelligence_per_level?: number
          spell_power_per_level?: number
          resistance_per_level?: number
          strength_per_level?: number
          endurance_per_level?: number
          armor_per_level?: number
          stealth_per_level?: number
          starting_skills?: string[]
          icon: string
          primary_stats: string[]
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          base_agility?: number
          base_precision?: number
          base_evasion?: number
          base_intelligence?: number
          base_spell_power?: number
          base_resistance?: number
          base_strength?: number
          base_endurance?: number
          base_armor?: number
          base_stealth?: number
          agility_per_level?: number
          precision_per_level?: number
          evasion_per_level?: number
          intelligence_per_level?: number
          spell_power_per_level?: number
          resistance_per_level?: number
          strength_per_level?: number
          endurance_per_level?: number
          armor_per_level?: number
          stealth_per_level?: number
          starting_skills?: string[]
          icon?: string
          primary_stats?: string[]
          created_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          name: string
          description: string
          skill_type: string
          required_level: number
          required_class: string[]
          mana_cost: number
          cooldown: number
          base_damage: number
          damage_type: string
          scaling_stat: string
          scaling_ratio: number
          special_effects: string[]
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          skill_type: string
          required_level?: number
          required_class?: string[]
          mana_cost?: number
          cooldown?: number
          base_damage?: number
          damage_type: string
          scaling_stat: string
          scaling_ratio?: number
          special_effects?: string[]
          icon: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          skill_type?: string
          required_level?: number
          required_class?: string[]
          mana_cost?: number
          cooldown?: number
          base_damage?: number
          damage_type?: string
          scaling_stat?: string
          scaling_ratio?: number
          special_effects?: string[]
          icon?: string
          created_at?: string
        }
      }
      character_skills: {
        Row: {
          character_id: string
          skill_id: string
          level: number
          damage: number
          cooldown: number
          mana_cost: number
          created_at: string
          updated_at: string
        }
        Insert: {
          character_id: string
          skill_id: string
          level?: number
          damage?: number
          cooldown?: number
          mana_cost?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          character_id?: string
          skill_id?: string
          level?: number
          damage?: number
          cooldown?: number
          mana_cost?: number
          created_at?: string
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          item_key: string
          name: string
          description: string
          rarity: string
          type: string
          subtype: string
          icon: string
          level_requirement: number
          class_requirement: string
          base_damage: number
          base_defense: number
          base_health: number
          base_mana: number
          base_crit_chance: number
          base_crit_damage: number
          base_speed: number
          base_value: number
          max_durability: number
          stackable: boolean
          max_stack: number
          set_name: string
          set_bonus: string
          requirements_stats: any
          created_at: string
        }
        Insert: {
          id?: string
          item_key: string
          name: string
          description?: string
          rarity?: string
          type: string
          subtype?: string
          icon?: string
          level_requirement?: number
          class_requirement?: string
          base_damage?: number
          base_defense?: number
          base_health?: number
          base_mana?: number
          base_crit_chance?: number
          base_crit_damage?: number
          base_speed?: number
          base_value?: number
          max_durability?: number
          stackable?: boolean
          max_stack?: number
          set_name?: string
          set_bonus?: string
          requirements_stats?: any
          created_at?: string
        }
        Update: {
          id?: string
          item_key?: string
          name?: string
          description?: string
          rarity?: string
          type?: string
          subtype?: string
          icon?: string
          level_requirement?: number
          class_requirement?: string
          base_damage?: number
          base_defense?: number
          base_health?: number
          base_mana?: number
          base_crit_chance?: number
          base_crit_damage?: number
          base_speed?: number
          base_value?: number
          max_durability?: number
          stackable?: boolean
          max_stack?: number
          set_name?: string
          set_bonus?: string
          requirements_stats?: any
          created_at?: string
        }
      }
      character_inventory: {
        Row: {
          character_id: string
          item_id: string
          quantity: number
          slot_position: number | null
          is_equipped: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          character_id: string
          item_id: string
          quantity: number
          slot_position?: number | null
          is_equipped?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          character_id?: string
          item_id?: string
          quantity?: number
          slot_position?: number | null
          is_equipped?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          description: string
          level_requirement: number
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          level_requirement?: number
          icon: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          level_requirement?: number
          icon?: string
          created_at?: string
        }
      }
      farming_spots: {
        Row: {
          id: string
          location_id: string
          name: string
          description: string
          level_requirement: number
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          location_id: string
          name: string
          description: string
          level_requirement?: number
          icon: string
          created_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          name?: string
          description?: string
          level_requirement?: number
          icon?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
