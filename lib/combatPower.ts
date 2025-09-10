import { Character } from '@/types/game'

/**
 * Расчет боевой мощи (Combat Power) на основе современных MMO подходов
 * Использует формулу: БМ = Эффективное HP × Эффективный DPS
 */

export interface CombatStats {
  combatPower: number
  effectiveHP: number
  effectiveDPS: number
  totalDamage: number
  totalDefense: number
  criticalMultiplier: number
}

/**
 * Рассчитывает эффективное HP с учетом защиты и сопротивлений
 */
function calculateEffectiveHP(character: Character): number {
  const baseHP = character.max_health
  
  // Защита снижает входящий урон
  // Формула: damage_reduction = defense / (defense + 100)
  const physicalDefense = character.defense
  const magicDefense = character.magic_resistance
  
  // Средняя защита для расчета эффективного HP
  const averageDefense = (physicalDefense + magicDefense) / 2
  const damageReduction = averageDefense / (averageDefense + 100)
  
  // Эффективное HP = базовое HP / (1 - редукция урона)
  const effectiveHP = baseHP / (1 - damageReduction)
  
  return Math.floor(effectiveHP)
}

/**
 * Рассчитывает эффективный DPS с учетом всех модификаторов
 */
function calculateEffectiveDPS(character: Character): number {
  // Базовый урон (физический + магический)
  const physicalDamage = character.attack_damage
  const magicDamage = character.magic_damage
  const totalDamage = physicalDamage + magicDamage
  
  // Скорость атаки влияет на DPS
  const attackSpeed = character.attack_speed || 1.0
  
  // Критические удары увеличивают DPS
  const critChance = character.critical_chance / 100
  const critDamage = character.critical_damage / 100
  
  // Средний урон с учетом критов
  const averageDamage = totalDamage * (1 + critChance * critDamage)
  
  // Эффективный DPS = средний урон × скорость атаки
  const effectiveDPS = averageDamage * attackSpeed
  
  return Math.floor(effectiveDPS)
}

/**
 * Рассчитывает общую боевую мощь персонажа
 */
export function calculateCombatPower(character: Character): CombatStats {
  const effectiveHP = calculateEffectiveHP(character)
  const effectiveDPS = calculateEffectiveDPS(character)
  
  // Основная формула БМ = Эффективное HP × Эффективный DPS
  // Добавляем модификатор уровня для масштабирования
  const levelModifier = 1 + (character.level - 1) * 0.1
  const combatPower = Math.floor(effectiveHP * effectiveDPS * levelModifier / 1000)
  
  // Дополнительные расчеты для отображения
  const totalDamage = character.attack_damage + character.magic_damage
  const totalDefense = character.defense + character.magic_resistance
  const criticalMultiplier = 1 + (character.critical_chance / 100) * (character.critical_damage / 100)
  
  return {
    combatPower,
    effectiveHP,
    effectiveDPS,
    totalDamage: Math.floor(totalDamage),
    totalDefense: Math.floor(totalDefense),
    criticalMultiplier: Math.floor(criticalMultiplier * 100) / 100
  }
}

/**
 * Форматирует число для отображения (с сокращениями для больших чисел)
 */
export function formatCombatPower(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

/**
 * Получает цветовую схему для отображения БМ в зависимости от уровня
 */
export function getCombatPowerColor(combatPower: number, level: number): string {
  const expectedCP = level * 100 // Ожидаемая БМ для уровня
  
  if (combatPower >= expectedCP * 1.5) {
    return 'text-purple-400' // Легендарный
  }
  if (combatPower >= expectedCP * 1.2) {
    return 'text-orange-400' // Эпический
  }
  if (combatPower >= expectedCP) {
    return 'text-blue-400' // Редкий
  }
  if (combatPower >= expectedCP * 0.8) {
    return 'text-green-400' // Необычный
  }
  return 'text-gray-400' // Обычный
}
