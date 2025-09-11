import { Character } from '@/types/game'

/**
 * Единая система расчета характеристик персонажа
 * Новая упрощенная система с 4 классами
 */

export interface CalculatedStats {
  // Ресурсы
  max_health: number
  max_mana: number
  
  // Боевые характеристики
  attack_damage: number
  magic_damage: number
  defense: number
  magic_resistance: number
  critical_chance: number
  critical_damage: number
  attack_speed: number
  accuracy: number
  
  // Регенерация
  health_regen: number
  mana_regen: number
}

/**
 * Базовые модификаторы характеристик для новой системы
 */
const BASE_STAT_MODIFIERS = {
  // Ресурсы
  health_per_endurance: 15,
  mana_per_intelligence: 8,
  
  // Боевые характеристики
  attack_damage_per_strength: 2.5,
  attack_damage_per_agility: 1.5,
  magic_damage_per_spell_power: 3.0,
  magic_damage_per_intelligence: 1.0,
  defense_per_armor: 2.0,
  defense_per_endurance: 1.0,
  magic_resistance_per_resistance: 2.5,
  
  // Критические характеристики
  critical_chance_per_agility: 0.15,
  critical_damage_per_strength: 0.8,
  
  // Скорость и точность
  attack_speed_per_agility: 1.2,
  accuracy_per_precision: 1.0,
  
  // Регенерация (базовая)
  base_health_regen: 1.0,
  base_mana_regen: 1.0,
  
  // Базовые значения
  base_health: 100,
  base_mana: 50,
  base_critical_chance: 5.0,
  base_critical_damage: 150.0,
  base_attack_speed: 100.0,
  base_accuracy: 85.0
}

/**
 * Рассчитывает все характеристики персонажа на основе новых статов
 */
export function calculateCharacterStats(character: Character, equipmentBonuses: any = {}): CalculatedStats {
  const { 
    agility, precision, evasion, intelligence, spell_power, resistance,
    strength, endurance, armor, stealth 
  } = character
  
  // Добавляем бонусы от экипировки к базовым характеристикам
  const totalAgility = agility + (equipmentBonuses.agility_bonus || 0)
  const totalPrecision = precision + (equipmentBonuses.precision_bonus || 0)
  const totalEvasion = evasion + (equipmentBonuses.evasion_bonus || 0)
  const totalIntelligence = intelligence + (equipmentBonuses.intelligence_bonus || 0)
  const totalSpellPower = spell_power + (equipmentBonuses.spell_power_bonus || 0)
  const totalResistance = resistance + (equipmentBonuses.resistance_bonus || 0)
  const totalStrength = strength + (equipmentBonuses.strength_bonus || 0)
  const totalEndurance = endurance + (equipmentBonuses.endurance_bonus || 0)
  const totalArmor = armor + (equipmentBonuses.armor_bonus || 0)
  const totalStealth = stealth + (equipmentBonuses.stealth_bonus || 0)
  
  // Ресурсы
  const max_health = Math.round(
    BASE_STAT_MODIFIERS.base_health + 
    totalEndurance * BASE_STAT_MODIFIERS.health_per_endurance +
    (equipmentBonuses.health || 0)
  )
  
  const max_mana = Math.round(
    BASE_STAT_MODIFIERS.base_mana + 
    totalIntelligence * BASE_STAT_MODIFIERS.mana_per_intelligence +
    (equipmentBonuses.mana || 0)
  )
  
  // Боевые характеристики
  const attack_damage = Math.round(
    totalStrength * BASE_STAT_MODIFIERS.attack_damage_per_strength +
    totalAgility * BASE_STAT_MODIFIERS.attack_damage_per_agility +
    (equipmentBonuses.attack_damage || 0)
  )
  
  const magic_damage = Math.round(
    totalSpellPower * BASE_STAT_MODIFIERS.magic_damage_per_spell_power +
    totalIntelligence * BASE_STAT_MODIFIERS.magic_damage_per_intelligence +
    (equipmentBonuses.magic_damage || 0)
  )
  
  const defense = Math.round(
    totalArmor * BASE_STAT_MODIFIERS.defense_per_armor +
    totalEndurance * BASE_STAT_MODIFIERS.defense_per_endurance +
    (equipmentBonuses.defense || 0)
  )
  
  const magic_resistance = Math.round(
    totalResistance * BASE_STAT_MODIFIERS.magic_resistance_per_resistance +
    (equipmentBonuses.magic_resistance || 0)
  )
  
  // Критические характеристики
  const critical_chance = Math.min(
    BASE_STAT_MODIFIERS.base_critical_chance +
    totalAgility * BASE_STAT_MODIFIERS.critical_chance_per_agility +
    (equipmentBonuses.critical_chance || 0),
    50.0 // Максимум 50%
  )
  
  const critical_damage = Math.round(
    (BASE_STAT_MODIFIERS.base_critical_damage + 
    totalStrength * BASE_STAT_MODIFIERS.critical_damage_per_strength +
    (equipmentBonuses.critical_damage || 0)) * 100
  ) / 100
  
  // Скорость и точность
  const attack_speed = Math.round(
    (BASE_STAT_MODIFIERS.base_attack_speed + 
    totalAgility * BASE_STAT_MODIFIERS.attack_speed_per_agility +
    (equipmentBonuses.attack_speed || 0)) * 100
  ) / 100
  
  const accuracy = Math.min(
    BASE_STAT_MODIFIERS.base_accuracy +
    totalPrecision * BASE_STAT_MODIFIERS.accuracy_per_precision +
    (equipmentBonuses.accuracy || 0),
    95.0 // Максимум 95%
  )
  
  // Регенерация
  const health_regen = Math.round(
    (BASE_STAT_MODIFIERS.base_health_regen + 
    totalEndurance * 0.1 + 
    (equipmentBonuses.health_regen || 0)) * 100
  ) / 100
  
  const mana_regen = Math.round(
    (BASE_STAT_MODIFIERS.base_mana_regen + 
    totalIntelligence * 0.1 + 
    (equipmentBonuses.mana_regen || 0)) * 100
  ) / 100
  
  return {
    max_health,
    max_mana,
    attack_damage,
    magic_damage,
    defense,
    magic_resistance,
    critical_chance,
    critical_damage,
    attack_speed,
    accuracy,
    health_regen,
    mana_regen
  }
}

/**
 * Обновляет характеристики персонажа в базе данных
 */
export async function updateCharacterStatsInDB(characterId: string, calculatedStats: CalculatedStats) {
  const { supabase } = await import('@/lib/supabase')
  
  try {
    const { error } = await (supabase as any)
      .from('characters')
      .update(calculatedStats)
      .eq('id', characterId)
    
    if (error) {
      console.error('Error updating character stats:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error updating character stats:', error)
    return false
  }
}

/**
 * Получает бонусы от экипировки для новой системы
 */
export function getEquipmentBonuses(equipment: any[]): any {
  if (!equipment || !Array.isArray(equipment)) return {}
  
  const bonuses = {
    // Новые базовые характеристики
    agility_bonus: 0,
    precision_bonus: 0,
    evasion_bonus: 0,
    intelligence_bonus: 0,
    spell_power_bonus: 0,
    resistance_bonus: 0,
    strength_bonus: 0,
    endurance_bonus: 0,
    armor_bonus: 0,
    stealth_bonus: 0,
    
    // Боевые характеристики
    attack_damage: 0,
    magic_damage: 0,
    defense: 0,
    magic_resistance: 0,
    
    // Ресурсы
    health: 0,
    mana: 0,
    
    // Дополнительные эффекты
    critical_chance: 0,
    critical_damage: 0,
    attack_speed: 0,
    accuracy: 0,
    health_regen: 0,
    mana_regen: 0
  }
  
  equipment.forEach(slot => {
    if (slot?.item?.stats) {
      const stats = slot.item.stats
      
      // Новые базовые характеристики
      bonuses.agility_bonus += stats.agility_bonus || 0
      bonuses.precision_bonus += stats.precision_bonus || 0
      bonuses.evasion_bonus += stats.evasion_bonus || 0
      bonuses.intelligence_bonus += stats.intelligence_bonus || 0
      bonuses.spell_power_bonus += stats.spell_power_bonus || 0
      bonuses.resistance_bonus += stats.resistance_bonus || 0
      bonuses.strength_bonus += stats.strength_bonus || 0
      bonuses.endurance_bonus += stats.endurance_bonus || 0
      bonuses.armor_bonus += stats.armor_bonus || 0
      bonuses.stealth_bonus += stats.stealth_bonus || 0
      
      // Боевые характеристики
      bonuses.attack_damage += stats.attack_damage || 0
      bonuses.magic_damage += stats.magic_damage || 0
      bonuses.defense += stats.defense || 0
      bonuses.magic_resistance += stats.magic_resistance || 0
      
      // Ресурсы
      bonuses.health += stats.health || 0
      bonuses.mana += stats.mana || 0
      
      // Дополнительные эффекты
      bonuses.critical_chance += stats.critical_chance || 0
      bonuses.critical_damage += stats.critical_damage || 0
      bonuses.attack_speed += stats.attack_speed || 0
      bonuses.accuracy += stats.accuracy || 0
      bonuses.health_regen += stats.health_regen || 0
      bonuses.mana_regen += stats.mana_regen || 0
    }
  })
  
  return bonuses
}

/**
 * Проверяет, нужно ли обновить характеристики персонажа
 */
export function shouldUpdateStats(character: Character, calculatedStats: CalculatedStats): boolean {
  return (
    character.max_health !== calculatedStats.max_health ||
    character.max_mana !== calculatedStats.max_mana ||
    character.attack_damage !== calculatedStats.attack_damage ||
    character.magic_damage !== calculatedStats.magic_damage ||
    character.defense !== calculatedStats.defense ||
    character.magic_resistance !== calculatedStats.magic_resistance ||
    Math.abs(character.critical_chance - calculatedStats.critical_chance) > 0.01 ||
    Math.abs(character.critical_damage - calculatedStats.critical_damage) > 0.01 ||
    Math.abs(character.attack_speed - calculatedStats.attack_speed) > 0.01 ||
    Math.abs(character.accuracy - calculatedStats.accuracy) > 0.01 ||
    Math.abs(character.health_regen - calculatedStats.health_regen) > 0.01 ||
    Math.abs(character.mana_regen - calculatedStats.mana_regen) > 0.01
  )
}
