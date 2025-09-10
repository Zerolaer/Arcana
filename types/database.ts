export interface Database {
  public: {
    Functions: {
      get_character_inventory: {
        Args: {
          p_character_id: string
        }
        Returns: any
      }
      get_character_equipment: {
        Args: {
          p_character_id: string
        }
        Returns: any
      }
      move_inventory_item: {
        Args: {
          p_character_id: string
          p_from_slot: number
          p_to_slot: number
        }
        Returns: { success: boolean; error?: string }
      }
      occupy_farming_spot: {
        Args: {
          spot_id: string
          character_id: string
        }
        Returns: boolean
      }
      leave_farming_spot: {
        Args: {
          spot_id: string
          character_id: string
        }
        Returns: boolean
      }
      initiate_combat: {
        Args: {
          character_id: string
          mob_id: string
        }
        Returns: any
      }
      perform_attack: {
        Args: {
          character_id: string
          skill_id?: string
        }
        Returns: any
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
          strength: number
          dexterity: number
          intelligence: number
          vitality: number
          energy: number
          luck: number
          stat_points: number
          skill_points: number
          health: number
          max_health: number
          mana: number
          max_mana: number
          stamina: number
          max_stamina: number
          attack_damage: number
          magic_damage: number
          defense: number
          magic_resistance: number
          critical_chance: number
          critical_damage: number
          attack_speed: number
          movement_speed: number
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
          strength?: number
          dexterity?: number
          intelligence?: number
          vitality?: number
          energy?: number
          luck?: number
          stat_points?: number
          skill_points?: number
          health?: number
          max_health?: number
          mana?: number
          max_mana?: number
          stamina?: number
          max_stamina?: number
          attack_damage?: number
          magic_damage?: number
          defense?: number
          magic_resistance?: number
          critical_chance?: number
          critical_damage?: number
          attack_speed?: number
          movement_speed?: number
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
          strength?: number
          dexterity?: number
          intelligence?: number
          vitality?: number
          energy?: number
          luck?: number
          stat_points?: number
          skill_points?: number
          health?: number
          max_health?: number
          mana?: number
          max_mana?: number
          stamina?: number
          max_stamina?: number
          attack_damage?: number
          magic_damage?: number
          defense?: number
          magic_resistance?: number
          critical_chance?: number
          critical_damage?: number
          attack_speed?: number
          movement_speed?: number
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
          base_strength: number
          base_dexterity: number
          base_intelligence: number
          base_vitality: number
          base_energy: number
          base_luck: number
          strength_per_level: number
          dexterity_per_level: number
          intelligence_per_level: number
          vitality_per_level: number
          energy_per_level: number
          luck_per_level: number
          starting_skills: string[]
          icon: string
          primary_stat: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          base_strength?: number
          base_dexterity?: number
          base_intelligence?: number
          base_vitality?: number
          base_energy?: number
          base_luck?: number
          strength_per_level?: number
          dexterity_per_level?: number
          intelligence_per_level?: number
          vitality_per_level?: number
          energy_per_level?: number
          luck_per_level?: number
          starting_skills?: string[]
          icon: string
          primary_stat: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          base_strength?: number
          base_dexterity?: number
          base_intelligence?: number
          base_vitality?: number
          base_energy?: number
          base_luck?: number
          strength_per_level?: number
          dexterity_per_level?: number
          intelligence_per_level?: number
          vitality_per_level?: number
          energy_per_level?: number
          luck_per_level?: number
          starting_skills?: string[]
          icon?: string
          primary_stat?: string
          created_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          description: string
          min_level: number
          max_level: number | null
          experience_bonus: number
          gold_bonus: number
          image: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          min_level?: number
          max_level?: number | null
          experience_bonus?: number
          gold_bonus?: number
          image: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          min_level?: number
          max_level?: number | null
          experience_bonus?: number
          gold_bonus?: number
          image?: string
          created_at?: string
        }
      }
      farming_spots: {
        Row: {
          id: string
          location_id: string
          name: string
          description: string
          max_occupancy: number
          current_occupancy: number
          occupied_by: string[]
          drop_rate_bonus: number
          rare_drop_bonus: number
          coordinates: { x: number; y: number }
          created_at: string
        }
        Insert: {
          id?: string
          location_id: string
          name: string
          description: string
          max_occupancy?: number
          current_occupancy?: number
          occupied_by?: string[]
          drop_rate_bonus?: number
          rare_drop_bonus?: number
          coordinates: { x: number; y: number }
          created_at?: string
        }
        Update: {
          id?: string
          location_id?: string
          name?: string
          description?: string
          max_occupancy?: number
          current_occupancy?: number
          occupied_by?: string[]
          drop_rate_bonus?: number
          rare_drop_bonus?: number
          coordinates?: { x: number; y: number }
          created_at?: string
        }
      }
      mobs: {
        Row: {
          id: string
          name: string
          description: string
          level: number
          health: number
          attack_damage: number
          defense: number
          magic_resistance: number
          aggressive: boolean
          respawn_time: number
          experience_reward: number
          gold_reward: number
          loot_table_id: string
          image: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          level: number
          health: number
          attack_damage: number
          defense: number
          magic_resistance: number
          aggressive?: boolean
          respawn_time?: number
          experience_reward: number
          gold_reward: number
          loot_table_id: string
          image: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          level?: number
          health?: number
          attack_damage?: number
          defense?: number
          magic_resistance?: number
          aggressive?: boolean
          respawn_time?: number
          experience_reward?: number
          gold_reward?: number
          loot_table_id?: string
          image?: string
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          name: string
          description: string
          item_type: string
          slot: string | null
          rarity: string
          level_requirement: number
          class_requirement: string[] | null
          strength_bonus: number | null
          dexterity_bonus: number | null
          intelligence_bonus: number | null
          vitality_bonus: number | null
          energy_bonus: number | null
          luck_bonus: number | null
          attack_damage: number | null
          magic_damage: number | null
          defense: number | null
          magic_resistance: number | null
          special_effects: string[] | null
          vendor_price: number
          stack_size: number
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          item_type: string
          slot?: string | null
          rarity: string
          level_requirement?: number
          class_requirement?: string[] | null
          strength_bonus?: number | null
          dexterity_bonus?: number | null
          intelligence_bonus?: number | null
          vitality_bonus?: number | null
          energy_bonus?: number | null
          luck_bonus?: number | null
          attack_damage?: number | null
          magic_damage?: number | null
          defense?: number | null
          magic_resistance?: number | null
          special_effects?: string[] | null
          vendor_price?: number
          stack_size?: number
          icon: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          item_type?: string
          slot?: string | null
          rarity?: string
          level_requirement?: number
          class_requirement?: string[] | null
          strength_bonus?: number | null
          dexterity_bonus?: number | null
          intelligence_bonus?: number | null
          vitality_bonus?: number | null
          energy_bonus?: number | null
          luck_bonus?: number | null
          attack_damage?: number | null
          magic_damage?: number | null
          defense?: number | null
          magic_resistance?: number | null
          special_effects?: string[] | null
          vendor_price?: number
          stack_size?: number
          icon?: string
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
          required_class: string[] | null
          mana_cost: number
          stamina_cost: number
          cooldown: number
          base_damage: number
          damage_type: string
          scaling_stat: string
          scaling_ratio: number
          available_nodes: string[]
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          skill_type: string
          required_level?: number
          required_class?: string[] | null
          mana_cost?: number
          stamina_cost?: number
          cooldown?: number
          base_damage?: number
          damage_type: string
          scaling_stat: string
          scaling_ratio?: number
          available_nodes?: string[]
          icon: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          skill_type?: string
          required_level?: number
          required_class?: string[] | null
          mana_cost?: number
          stamina_cost?: number
          cooldown?: number
          base_damage?: number
          damage_type?: string
          scaling_stat?: string
          scaling_ratio?: number
          available_nodes?: string[]
          icon?: string
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
          quantity?: number
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
      character_skills: {
        Row: {
          character_id: string
          skill_id: string
          level: number
          selected_nodes: string[]
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
          selected_nodes?: string[]
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
          selected_nodes?: string[]
          damage?: number
          cooldown?: number
          mana_cost?: number
          created_at?: string
          updated_at?: string
        }
      }
      game_events: {
        Row: {
          id: string
          type: string
          character_id: string
          data: any
          timestamp: string
        }
        Insert: {
          id?: string
          type: string
          character_id: string
          data: any
          timestamp?: string
        }
        Update: {
          id?: string
          type?: string
          character_id?: string
          data?: any
          timestamp?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
