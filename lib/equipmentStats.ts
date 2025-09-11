import { Character } from '@/types/game'
import { supabase } from './supabase'
import { EquipmentBonuses } from './characterStats'

/**
 * Получает бонусы с экипировки персонажа
 */
export async function getEquipmentBonuses(characterId: string): Promise<EquipmentBonuses> {
  try {
    const { data, error } = await (supabase as any)
      .rpc('get_equipment_bonuses', { p_character_id: characterId })

    if (error) {
      console.error('Error loading equipment bonuses:', error)
      return getEmptyBonuses()
    }

    // Если функция вернула данные, используем их
    if (data) {
      return data
    }

    // Иначе загружаем экипировку и считаем бонусы вручную
    const { data: equipment, error: equipmentError } = await supabase
      .from('character_equipment')
      .select(`
        item_id,
        items!inner (
          agility_bonus,
          precision_bonus,
          evasion_bonus,
          intelligence_bonus,
          spell_power_bonus,
          resistance_bonus,
          strength_bonus,
          endurance_bonus,
          armor_bonus,
          stealth_bonus,
          attack_damage,
          defense
        )
      `)
      .eq('character_id', characterId)

    if (equipmentError) {
      console.error('Error loading equipment:', equipmentError)
      return getEmptyBonuses()
    }

    const bonuses = getEmptyBonuses()

    if (equipment && Array.isArray(equipment)) {
      equipment.forEach((equippedItem: any) => {
        if (equippedItem.items) {
          const item = equippedItem.items
          
          // Новые характеристики
          bonuses.agility += item.agility_bonus || 0
          bonuses.precision += item.precision_bonus || 0
          bonuses.evasion += item.evasion_bonus || 0
          bonuses.intelligence += item.intelligence_bonus || 0
          bonuses.spell_power += item.spell_power_bonus || 0
          bonuses.resistance += item.resistance_bonus || 0
          bonuses.strength += item.strength_bonus || 0
          bonuses.endurance += item.endurance_bonus || 0
          bonuses.armor += item.armor_bonus || 0
          bonuses.stealth += item.stealth_bonus || 0
          
          // Боевые характеристики
          bonuses.attack_damage += item.attack_damage || 0
          bonuses.defense += item.defense || 0
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
    agility: 0,
    precision: 0,
    evasion: 0,
    intelligence: 0,
    spell_power: 0,
    resistance: 0,
    strength: 0,
    endurance: 0,
    armor: 0,
    stealth: 0,
    attack_damage: 0,
    defense: 0,
    health: 0,
    mana: 0,
    magic_damage: 0,
    magic_resistance: 0,
    critical_chance: 0,
    critical_damage: 0,
    attack_speed: 0,
    accuracy: 0,
    health_regen: 0,
    mana_regen: 0
  }
}

/**
 * Рассчитывает статы персонажа с учетом экипировки
 */
export async function calculateCharacterStatsWithEquipment(character: Character): Promise<any> {
  const equipmentBonuses = await getEquipmentBonuses(character.id)
  
  // Импортируем функцию расчета статов
  const { calculateCharacterStats } = await import('./characterStats')
  
  // Рассчитываем статы с бонусами от экипировки
  return calculateCharacterStats(character, equipmentBonuses)
}