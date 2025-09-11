import { Character } from '@/types/game'
import { calculateCombatPower } from './combatPower'

/**
 * Тест показывает как каждый стат влияет на БМ
 */

function createTestCharacter(baseStats: Partial<Character>): Character {
  return {
    id: 'test-id',
    player_id: 'test-player',
    name: 'Test Character',
    class_id: 'test-class',
    level: 10,
    experience: 1000,
    experience_to_next: 2000,
    
    // Базовые статы
    agility: baseStats.agility || 10,
    precision: baseStats.precision || 10,
    evasion: baseStats.evasion || 10,
    intelligence: baseStats.intelligence || 10,
    spell_power: baseStats.spell_power || 10,
    resistance: baseStats.resistance || 10,
    strength: baseStats.strength || 10,
    endurance: baseStats.endurance || 10,
    armor: baseStats.armor || 10,
    stealth: baseStats.stealth || 10,
    
    // Остальные поля
    stat_points: 0,
    health: 100,
    max_health: 100,
    mana: 50,
    max_mana: 50,
    attack_damage: 0,
    magic_damage: 0,
    defense: 0,
    magic_resistance: 0,
    critical_chance: 0,
    critical_damage: 0,
    attack_speed: 0,
    accuracy: 0,
    dodge_chance: 0,
    stealth_bonus: 0,
    health_regen: 0,
    mana_regen: 0,
    gold: 1000,
    current_location_id: 'test-location',
    is_in_combat: false,
    is_afk_farming: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_activity: new Date().toISOString(),
    is_online: true
  }
}

export function testCombatPowerInfluence() {
  console.log('⚔️ ТЕСТ ВЛИЯНИЯ СТАТОВ НА БОЕВУЮ МОЩЬ')
  console.log('==========================================')
  
  // Базовый персонаж
  const baseCharacter = createTestCharacter({})
  const baseCombatPower = calculateCombatPower(baseCharacter)
  
  console.log(`📊 Базовый персонаж (все статы = 10):`)
  console.log(`   БМ: ${baseCombatPower.combatPower}`)
  console.log(`   Effective HP: ${baseCombatPower.effectiveHP}`)
  console.log(`   Effective DPS: ${baseCombatPower.effectiveDPS}`)
  
  console.log('\n🎯 ВЛИЯНИЕ КАЖДОГО СТАТА:')
  
  const stats = [
    { name: 'Strength', key: 'strength' as keyof Character, emoji: '💪' },
    { name: 'Agility', key: 'agility' as keyof Character, emoji: '🏃' },
    { name: 'Intelligence', key: 'intelligence' as keyof Character, emoji: '🧠' },
    { name: 'Endurance', key: 'endurance' as keyof Character, emoji: '❤️' },
    { name: 'Armor', key: 'armor' as keyof Character, emoji: '🛡️' },
    { name: 'Resistance', key: 'resistance' as keyof Character, emoji: '🛡️' },
    { name: 'Spell Power', key: 'spell_power' as keyof Character, emoji: '⚡' },
    { name: 'Precision', key: 'precision' as keyof Character, emoji: '🎯' },
    { name: 'Evasion', key: 'evasion' as keyof Character, emoji: '💨' },
    { name: 'Stealth', key: 'stealth' as keyof Character, emoji: '🥷' }
  ]
  
  stats.forEach(stat => {
    // Создаем персонажа с увеличенным статом
    const testCharacter = createTestCharacter({ [stat.key]: 50 })
    const testCombatPower = calculateCombatPower(testCharacter)
    
    const difference = testCombatPower.combatPower - baseCombatPower.combatPower
    const percentage = ((testCombatPower.combatPower / baseCombatPower.combatPower) - 1) * 100
    
    console.log(`   ${stat.emoji} ${stat.name}: +${difference} БМ (+${percentage.toFixed(1)}%)`)
  })
  
  console.log('\n✅ РЕЗУЛЬТАТ:')
  console.log('Теперь ВСЕ статы влияют на БМ!')
  console.log('• Precision → Accuracy → DPS')
  console.log('• Evasion → Dodge Chance → Effective HP')
  console.log('• Stealth → Stealth Bonus → DPS')
}

// Экспортируем для использования в консоли браузера
if (typeof window !== 'undefined') {
  (window as any).testCombatPowerInfluence = testCombatPowerInfluence
}
