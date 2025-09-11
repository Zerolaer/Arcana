// Типы для системы навыков

export interface SkillNode {
  id: string
  name: string
  description: string
  damage_multiplier?: number
  cooldown_reduction?: number
  mana_cost_reduction?: number
  additional_effects?: string[]
  icon: string
}

export interface PassiveSkill {
  id: string
  name: string
  description: string
  level_requirement: number
  icon: string
  stat_bonuses: {
    strength?: number
    agility?: number
    intelligence?: number
    precision?: number
    evasion?: number
    spell_power?: number
    resistance?: number
    endurance?: number
    armor?: number
    stealth?: number
  }
  is_learned: boolean
  class_requirements?: string[] // Для будущего развития
}

export interface ActiveSkill {
  id: string
  name: string
  description: string
  level_requirement: number
  icon: string
  skill_type: 'active' | 'aoe' | 'buff' | 'barrier' | 'ultimate'
  damage_type: 'physical' | 'magical'
  base_damage: number
  mana_cost: number
  cooldown: number
  scaling_stat: 'strength' | 'agility' | 'intelligence' | 'spell_power' | 'endurance' | 'stealth'
  scaling_ratio: number
  class_requirements: string[]
  cost_to_learn: number // Золото для изучения
  is_learned: boolean
  nodes: SkillNode[] // Ноды развития (пока заглушки)
}

export interface CharacterSkills {
  character_id: string
  passive_skills: {
    [skillId: string]: boolean // Изучен ли навык
  }
  active_skills: {
    [skillId: string]: {
      is_learned: boolean
      level: number
      nodes_unlocked: string[]
    }
  }
}
