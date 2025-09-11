import { Character } from '@/types/game'
import { supabase } from './supabase'

/**
 * Интерфейс для бонусов с экипировки
 */
export interface EquipmentBonuses {
  // Базовые характеристики
  strength_bonus: number
  dexterity_bonus: number
  intelligence_bonus: number
  vitality_bonus: number
  energy_bonus: number
  luck_bonus: number
  
  // Боевые характеристики
  attack_damage: number
  magic_damage: number
  defense: number
  magic_resistance: number
  
  // Ресурсы (для совместимости)
  health: number
  mana: number
  stamina: number
}

/**
 * Получает бонусы с экипировки персонажа
 */
export async function getEquipmentBonuses(characterId: string): Promise<EquipmentBonuses> {
  try {
    const { data, error } = await (supabase as any)
      .rpc('get_character_equipment', { p_character_id: characterId })

    if (error) {
      console.error('Error loading equipment:', error)
      return getEmptyBonuses()
    }

    const bonuses: EquipmentBonuses = getEmptyBonuses()

    if (data && Array.isArray(data)) {
      data.forEach((equippedItem: any) => {
        if (equippedItem.item) {
          const item = equippedItem.item
          
          // Базовые характеристики
          bonuses.strength_bonus += item.strength_bonus || 0
          bonuses.dexterity_bonus += item.dexterity_bonus || 0
          bonuses.intelligence_bonus += item.intelligence_bonus || 0
          bonuses.vitality_bonus += item.vitality_bonus || 0
          bonuses.energy_bonus += item.energy_bonus || 0
          bonuses.luck_bonus += item.luck_bonus || 0
          
          // Боевые характеристики
          bonuses.attack_damage += item.attack_damage || 0
          bonuses.magic_damage += item.magic_damage || 0
          bonuses.defense += item.defense || 0
          bonuses.magic_resistance += item.magic_resistance || 0
        }
      })
    }

    return bonuses
  } catch (error) {
    console.error('Error getting equipment bonuses:', error)
    return getEmptyBonuses()
  }
}

/**
 * Возвращает пустые бонусы
 */
function getEmptyBonuses(): EquipmentBonuses {
  return {
    strength_bonus: 0,
    dexterity_bonus: 0,
    intelligence_bonus: 0,
    vitality_bonus: 0,
    energy_bonus: 0,
    luck_bonus: 0,
    attack_damage: 0,
    magic_damage: 0,
    defense: 0,
    magic_resistance: 0,
    health: 0,
    mana: 0,
    stamina: 0
  }
}

/**
 * Рассчитывает итоговые характеристики персонажа с учетом экипировки
 */
export async function calculateCharacterStatsWithEquipment(character: Character): Promise<any> {
  const equipmentBonuses = await getEquipmentBonuses(character.id)
  
  // Импортируем функцию расчета статов
  const { calculateCharacterStats } = await import('./characterStats')
  
  // Рассчитываем статы с бонусами от экипировки
  return calculateCharacterStats(character, equipmentBonuses)
}
