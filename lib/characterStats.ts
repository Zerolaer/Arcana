import { Character } from '@/types/game'

/**
 * Единая система расчета характеристик персонажа
 * Все расчеты должны использовать эту систему для консистентности
 */

export interface CalculatedStats {
  // Ресурсы
  max_health: number
  max_mana: number
  max_stamina: number
  
  // Боевые характеристики
  attack_damage: number
  magic_damage: number
  defense: number
  magic_resistance: number
  critical_chance: number
  critical_damage: number
  attack_speed: number
  movement_speed: number
  
  // Регенерация
  health_regen: number
  mana_regen: number
  stamina_regen: number
}

/**
 * Базовые модификаторы характеристик (без экипировки)
 */
const BASE_STAT_MODIFIERS = {
  // Ресурсы
  health_per_vitality: 10,
  mana_per_energy: 5,
  stamina_per_vitality: 5,
  stamina_per_dexterity: 3,
  
  // Боевые характеристики
  attack_damage_per_strength: 2,
  attack_damage_per_dexterity: 1,
  magic_damage_per_intelligence: 2.5,
  defense_per_vitality: 1.5,
  defense_per_strength: 0.5,
  magic_resistance_per_energy: 1,
  magic_resistance_per_intelligence: 0.3,
  
  // Критические характеристики
  critical_chance_per_luck: 0.1,
  critical_chance_per_dexterity: 0.05,
  critical_damage_per_strength: 0.5,
  
  // Скорость
  attack_speed_per_dexterity: 0.8,
  movement_speed_per_dexterity: 0.5,
  
  // Регенерация (базовая)
  base_health_regen: 1.0,
  base_mana_regen: 1.0,
  base_stamina_regen: 1.0,
  
  // Базовые значения
  base_health: 100,
  base_mana: 50,
  base_stamina: 100,
  base_critical_chance: 5.0,
  base_critical_damage: 150.0,
  base_attack_speed: 100.0,
  base_movement_speed: 100.0
}

/**
 * Рассчитывает все характеристики персонажа на основе базовых статов
 */
export function calculateCharacterStats(character: Character, equipmentBonuses: any = {}): CalculatedStats {
  const { strength, dexterity, intelligence, vitality, energy, luck } = character
  
  // Добавляем бонусы от экипировки к базовым характеристикам
  const totalStrength = strength + (equipmentBonuses.strength_bonus || 0)
  const totalDexterity = dexterity + (equipmentBonuses.dexterity_bonus || 0)
  const totalIntelligence = intelligence + (equipmentBonuses.intelligence_bonus || 0)
  const totalVitality = vitality + (equipmentBonuses.vitality_bonus || 0)
  const totalEnergy = energy + (equipmentBonuses.energy_bonus || 0)
  const totalLuck = luck + (equipmentBonuses.luck_bonus || 0)
  
  // Ресурсы
  const max_health = Math.round(
    BASE_STAT_MODIFIERS.base_health + 
    totalVitality * BASE_STAT_MODIFIERS.health_per_vitality +
    (equipmentBonuses.health || 0)
  )
  
  const max_mana = Math.round(
    BASE_STAT_MODIFIERS.base_mana + 
    totalEnergy * BASE_STAT_MODIFIERS.mana_per_energy +
    totalIntelligence * BASE_STAT_MODIFIERS.mana_per_energy +
    (equipmentBonuses.mana || 0)
  )
  
  const max_stamina = Math.round(
    BASE_STAT_MODIFIERS.base_stamina + 
    totalVitality * BASE_STAT_MODIFIERS.stamina_per_vitality +
    totalDexterity * BASE_STAT_MODIFIERS.stamina_per_dexterity +
    (equipmentBonuses.stamina || 0)
  )
  
  // Боевые характеристики
  const attack_damage = Math.round(
    totalStrength * BASE_STAT_MODIFIERS.attack_damage_per_strength +
    totalDexterity * BASE_STAT_MODIFIERS.attack_damage_per_dexterity +
    (equipmentBonuses.attack_damage || 0)
  )
  
  const magic_damage = Math.round(
    totalIntelligence * BASE_STAT_MODIFIERS.magic_damage_per_intelligence +
    (equipmentBonuses.magic_damage || 0)
  )
  
  const defense = Math.round(
    totalVitality * BASE_STAT_MODIFIERS.defense_per_vitality +
    totalStrength * BASE_STAT_MODIFIERS.defense_per_strength +
    (equipmentBonuses.defense || 0)
  )
  
  const magic_resistance = Math.round(
    totalEnergy * BASE_STAT_MODIFIERS.magic_resistance_per_energy +
    totalIntelligence * BASE_STAT_MODIFIERS.magic_resistance_per_intelligence +
    (equipmentBonuses.magic_resistance || 0)
  )
  
  // Критические характеристики
  const critical_chance = Math.min(
    BASE_STAT_MODIFIERS.base_critical_chance +
    totalLuck * BASE_STAT_MODIFIERS.critical_chance_per_luck +
    totalDexterity * BASE_STAT_MODIFIERS.critical_chance_per_dexterity +
    (equipmentBonuses.critical_chance || 0),
    50.0 // Максимум 50%
  )
  
  const critical_damage = Math.round(
    (BASE_STAT_MODIFIERS.base_critical_damage + 
    totalStrength * BASE_STAT_MODIFIERS.critical_damage_per_strength +
    (equipmentBonuses.critical_damage || 0)) * 100
  ) / 100
  
  // Скорость
  const attack_speed = Math.round(
    (BASE_STAT_MODIFIERS.base_attack_speed + 
    totalDexterity * BASE_STAT_MODIFIERS.attack_speed_per_dexterity +
    (equipmentBonuses.attack_speed || 0)) * 100
  ) / 100
  
  const movement_speed = Math.round(
    (BASE_STAT_MODIFIERS.base_movement_speed + 
    totalDexterity * BASE_STAT_MODIFIERS.movement_speed_per_dexterity +
    (equipmentBonuses.movement_speed || 0)) * 100
  ) / 100
  
  // Регенерация
  const health_regen = Math.round(
    (BASE_STAT_MODIFIERS.base_health_regen + 
    totalVitality * 0.1 + 
    (equipmentBonuses.health_regen || 0)) * 100
  ) / 100
  
  const mana_regen = Math.round(
    (BASE_STAT_MODIFIERS.base_mana_regen + 
    totalEnergy * 0.1 + 
    totalIntelligence * 0.05 +
    (equipmentBonuses.mana_regen || 0)) * 100
  ) / 100
  
  const stamina_regen = Math.round(
    (BASE_STAT_MODIFIERS.base_stamina_regen + 
    totalVitality * 0.05 + 
    totalDexterity * 0.1 +
    (equipmentBonuses.stamina_regen || 0)) * 100
  ) / 100
  
  return {
    max_health,
    max_mana,
    max_stamina,
    attack_damage,
    magic_damage,
    defense,
    magic_resistance,
    critical_chance,
    critical_damage,
    attack_speed,
    movement_speed,
    health_regen,
    mana_regen,
    stamina_regen
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
 * Получает бонусы от экипировки (заглушка, будет реализована позже)
 */
export function getEquipmentBonuses(equipment: any[]): any {
  // TODO: Реализовать расчет бонусов от экипировки
  return {}
}

/**
 * Проверяет, нужно ли обновить характеристики персонажа
 */
export function shouldUpdateStats(character: Character, calculatedStats: CalculatedStats): boolean {
  return (
    character.max_health !== calculatedStats.max_health ||
    character.max_mana !== calculatedStats.max_mana ||
    character.max_stamina !== calculatedStats.max_stamina ||
    character.attack_damage !== calculatedStats.attack_damage ||
    character.magic_damage !== calculatedStats.magic_damage ||
    character.defense !== calculatedStats.defense ||
    character.magic_resistance !== calculatedStats.magic_resistance ||
    Math.abs(character.critical_chance - calculatedStats.critical_chance) > 0.01 ||
    Math.abs(character.critical_damage - calculatedStats.critical_damage) > 0.01 ||
    Math.abs(character.attack_speed - calculatedStats.attack_speed) > 0.01 ||
    Math.abs(character.movement_speed - calculatedStats.movement_speed) > 0.01 ||
    Math.abs(character.health_regen - calculatedStats.health_regen) > 0.01 ||
    Math.abs(character.mana_regen - calculatedStats.mana_regen) > 0.01 ||
    Math.abs(character.stamina_regen - calculatedStats.stamina_regen) > 0.01
  )
}
