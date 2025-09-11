import { useState, useEffect, useMemo } from 'react'
import { Character } from '@/types/game'
import { calculateCharacterStats, getEquipmentBonuses, CalculatedStats } from './characterStats'

interface UseCharacterStatsProps {
  character: Character
  equipment?: any[]
}

export function useCharacterStats({ character, equipment = [] }: UseCharacterStatsProps) {
  const [calculatedStats, setCalculatedStats] = useState<CalculatedStats | null>(null)
  const [equipmentBonuses, setEquipmentBonuses] = useState<any>({})

  // Рассчитываем бонусы от экипировки
  useEffect(() => {
    const bonuses = getEquipmentBonuses(equipment)
    setEquipmentBonuses(bonuses)
    console.log('🎯 Equipment bonuses calculated:', bonuses)
  }, [equipment])

  // Рассчитываем итоговые статы персонажа
  useEffect(() => {
    const stats = calculateCharacterStats(character, equipmentBonuses)
    setCalculatedStats(stats)
    console.log('📊 Character stats calculated:', {
      base: {
        agility: character.agility,
        precision: character.precision,
        evasion: character.evasion,
        intelligence: character.intelligence,
        spell_power: character.spell_power,
        resistance: character.resistance,
        strength: character.strength,
        endurance: character.endurance,
        armor: character.armor,
        stealth: character.stealth
      },
      equipment: equipmentBonuses,
      calculated: stats
    })
  }, [character, equipmentBonuses])

  // Сравниваем с текущими статами персонажа
  const statsChanged = useMemo(() => {
    if (!calculatedStats) return false
    
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
      Math.abs(character.health_regen - calculatedStats.health_regen) > 0.01 ||
      Math.abs(character.mana_regen - calculatedStats.mana_regen) > 0.01
    )
  }, [character, calculatedStats])

  return {
    calculatedStats,
    equipmentBonuses,
    statsChanged,
    // Показываем итоговые статы (базовые + экипировка)
    totalStats: calculatedStats ? {
      ...calculatedStats,
      // Добавляем базовые статы с бонусами
      agility: character.agility + (equipmentBonuses.agility_bonus || 0),
      precision: character.precision + (equipmentBonuses.precision_bonus || 0),
      evasion: character.evasion + (equipmentBonuses.evasion_bonus || 0),
      intelligence: character.intelligence + (equipmentBonuses.intelligence_bonus || 0),
      spell_power: character.spell_power + (equipmentBonuses.spell_power_bonus || 0),
      resistance: character.resistance + (equipmentBonuses.resistance_bonus || 0),
      strength: character.strength + (equipmentBonuses.strength_bonus || 0),
      endurance: character.endurance + (equipmentBonuses.endurance_bonus || 0),
      armor: character.armor + (equipmentBonuses.armor_bonus || 0),
      stealth: character.stealth + (equipmentBonuses.stealth_bonus || 0)
    } : null
  }
}
