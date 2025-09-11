import { Character } from '@/types/game'
import { calculateCharacterStats } from './characterStats'
import { calculateCombatPower } from './combatPower'

/**
 * Тестирует связь базовых статов с боевыми характеристиками
 */

// Создаем тестового персонажа с базовыми статами
const testCharacter: Character = {
  id: 'test-id',
  player_id: 'test-player',
  name: 'Test Character',
  class_id: 'test-class',
  level: 10,
  experience: 1000,
  experience_to_next: 2000,
  
  // Базовые статы (которые вкачиваем)
  agility: 20,
  precision: 15,
  evasion: 10,
  intelligence: 25,
  spell_power: 30,
  resistance: 12,
  strength: 35,
  endurance: 18,
  armor: 22,
  stealth: 8,
  
  // Очки характеристик
  stat_points: 5,
  
  // Ресурсы (будут рассчитаны)
  health: 100,
  max_health: 100,
  mana: 50,
  max_mana: 50,
  
  // Боевые характеристики (будут рассчитаны)
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
  
  // Регенерация (будет рассчитана)
  health_regen: 0,
  mana_regen: 0,
  
  // Экономика
  gold: 1000,
  
  // Локация и статус
  current_location_id: 'test-location',
  is_in_combat: false,
  is_afk_farming: false,
  
  // Время
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_activity: new Date().toISOString(),
  is_online: true
}

export function testStatsConnection() {
  console.log('🧪 ТЕСТИРОВАНИЕ СВЯЗИ СТАТОВ')
  console.log('=====================================')
  
  // Рассчитываем характеристики
  const calculatedStats = calculateCharacterStats(testCharacter)
  
  console.log('📊 БАЗОВЫЕ СТАТЫ (которые вкачиваем):')
  console.log(`  🏃 Agility: ${testCharacter.agility}`)
  console.log(`  🎯 Precision: ${testCharacter.precision}`)
  console.log(`  💨 Evasion: ${testCharacter.evasion}`)
  console.log(`  🧠 Intelligence: ${testCharacter.intelligence}`)
  console.log(`  ⚡ Spell Power: ${testCharacter.spell_power}`)
  console.log(`  🛡️ Resistance: ${testCharacter.resistance}`)
  console.log(`  💪 Strength: ${testCharacter.strength}`)
  console.log(`  ❤️ Endurance: ${testCharacter.endurance}`)
  console.log(`  🛡️ Armor: ${testCharacter.armor}`)
  console.log(`  🥷 Stealth: ${testCharacter.stealth}`)
  
  console.log('\n⚔️ БОЕВЫЕ ХАРАКТЕРИСТИКИ (рассчитанные):')
  console.log(`  💥 Attack Damage: ${calculatedStats.attack_damage}`)
  console.log(`  🔥 Magic Damage: ${calculatedStats.magic_damage}`)
  console.log(`  🛡️ Defense: ${calculatedStats.defense}`)
  console.log(`  🧙 Magic Resistance: ${calculatedStats.magic_resistance}`)
  console.log(`  ⚡ Critical Chance: ${calculatedStats.critical_chance.toFixed(2)}%`)
  console.log(`  💥 Critical Damage: ${calculatedStats.critical_damage.toFixed(2)}%`)
  console.log(`  🏃 Attack Speed: ${calculatedStats.attack_speed.toFixed(2)}%`)
  console.log(`  🎯 Accuracy: ${calculatedStats.accuracy.toFixed(2)}%`)
  console.log(`  💨 Dodge Chance: ${calculatedStats.dodge_chance.toFixed(2)}%`)
  console.log(`  🥷 Stealth Bonus: ${calculatedStats.stealth_bonus.toFixed(2)}`)
  
  console.log('\n💚 РЕСУРСЫ:')
  console.log(`  ❤️ Max Health: ${calculatedStats.max_health}`)
  console.log(`  💙 Max Mana: ${calculatedStats.max_mana}`)
  
  console.log('\n🔄 РЕГЕНЕРАЦИЯ:')
  console.log(`  ❤️ Health Regen: ${calculatedStats.health_regen.toFixed(2)}/сек`)
  console.log(`  💙 Mana Regen: ${calculatedStats.mana_regen.toFixed(2)}/сек`)
  
  console.log('\n⚔️ БОЕВАЯ МОЩЬ:')
  const combatStats = calculateCombatPower(testCharacter)
  console.log(`  💥 Combat Power: ${combatStats.combatPower}`)
  console.log(`  ❤️ Effective HP: ${combatStats.effectiveHP}`)
  console.log(`  ⚔️ Effective DPS: ${combatStats.effectiveDPS}`)
  console.log(`  🎯 Total Damage: ${combatStats.totalDamage}`)
  console.log(`  🛡️ Total Defense: ${combatStats.totalDefense}`)
  
  console.log('\n✅ ПРОВЕРКА СВЯЗИ:')
  
  // Проверяем что статы влияют на характеристики
  const checks = [
    {
      stat: 'strength',
      value: testCharacter.strength,
      affects: `attack_damage (${calculatedStats.attack_damage}), critical_damage (${calculatedStats.critical_damage.toFixed(2)}%)`,
      working: calculatedStats.attack_damage > 0
    },
    {
      stat: 'agility',
      value: testCharacter.agility,
      affects: `attack_damage (${calculatedStats.attack_damage}), critical_chance (${calculatedStats.critical_chance.toFixed(2)}%), attack_speed (${calculatedStats.attack_speed.toFixed(2)}%)`,
      working: calculatedStats.critical_chance > 5 || calculatedStats.attack_speed > 100
    },
    {
      stat: 'intelligence',
      value: testCharacter.intelligence,
      affects: `mana (${calculatedStats.max_mana}), magic_damage (${calculatedStats.magic_damage}), mana_regen (${calculatedStats.mana_regen.toFixed(2)})`,
      working: calculatedStats.max_mana > 50 || calculatedStats.magic_damage > 0
    },
    {
      stat: 'endurance',
      value: testCharacter.endurance,
      affects: `health (${calculatedStats.max_health}), defense (${calculatedStats.defense}), health_regen (${calculatedStats.health_regen.toFixed(2)})`,
      working: calculatedStats.max_health > 100 || calculatedStats.defense > 0
    },
    {
      stat: 'precision',
      value: testCharacter.precision,
      affects: `accuracy (${calculatedStats.accuracy.toFixed(2)}%) → DPS`,
      working: calculatedStats.accuracy > 85
    },
    {
      stat: 'evasion',
      value: testCharacter.evasion,
      affects: `dodge_chance (${calculatedStats.dodge_chance.toFixed(2)}%) → Effective HP`,
      working: calculatedStats.dodge_chance > 5
    },
    {
      stat: 'stealth',
      value: testCharacter.stealth,
      affects: `stealth_bonus (${calculatedStats.stealth_bonus.toFixed(2)}) → DPS`,
      working: calculatedStats.stealth_bonus > 0
    }
  ]
  
  checks.forEach(check => {
    const status = check.working ? '✅' : '❌'
    console.log(`  ${status} ${check.stat.toUpperCase()} (${check.value}) → ${check.affects}`)
  })
  
  const workingStats = checks.filter(check => check.working).length
  const totalStats = checks.length
  
  console.log(`\n📈 РЕЗУЛЬТАТ: ${workingStats}/${totalStats} статов влияют на характеристики`)
  
  if (workingStats === totalStats) {
    console.log('🎉 ВСЕ СТАТЫ РАБОТАЮТ ПРАВИЛЬНО!')
  } else {
    console.log('⚠️ НЕКОТОРЫЕ СТАТЫ НЕ ВЛИЯЮТ НА ХАРАКТЕРИСТИКИ')
  }
  
  return {
    working: workingStats === totalStats,
    workingStats,
    totalStats,
    calculatedStats
  }
}

// Экспортируем для использования в консоли браузера
if (typeof window !== 'undefined') {
  (window as any).testStatsConnection = testStatsConnection
}
