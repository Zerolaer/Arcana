import { Character } from '@/types/game'
import { calculateCharacterStats } from './characterStats'

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
  // Используем рассчитанные характеристики для консистентности
  const stats = calculateCharacterStats(character)
  const baseHP = stats.max_health
  
  // Защита снижает входящий урон
  // Формула: damage_reduction = defense / (defense + 100)
  const physicalDefense = stats.defense
  const magicDefense = stats.magic_resistance
  
  // Средняя защита для расчета эффективного HP
  const averageDefense = (physicalDefense + magicDefense) / 2
  const damageReduction = averageDefense / (averageDefense + 100)
  
  // Уклонение дополнительно защищает
  const dodgeChance = stats.dodge_chance / 100
  const evasionBonus = 1 + dodgeChance * 0.5 // 50% эффективность уклонения
  
  // Эффективное HP = базовое HP / (1 - редукция урона) * бонус уклонения
  const effectiveHP = (baseHP / (1 - damageReduction)) * evasionBonus
  
  return Math.floor(effectiveHP)
}

/**
 * Рассчитывает эффективный DPS с учетом всех модификаторов
 */
function calculateEffectiveDPS(character: Character): number {
  // Используем рассчитанные характеристики для консистентности
  const stats = calculateCharacterStats(character)
  
  // Базовый урон (физический + магический)
  const physicalDamage = stats.attack_damage
  const magicDamage = stats.magic_damage
  const totalDamage = physicalDamage + magicDamage
  
  // Скорость атаки влияет на DPS
  const attackSpeed = stats.attack_speed / 100 // Конвертируем из процентов
  
  // Критические удары увеличивают DPS
  const critChance = stats.critical_chance / 100
  const critDamage = stats.critical_damage / 100
  
  // Точность влияет на DPS (промахи снижают эффективность)
  const accuracy = stats.accuracy / 100
  
  // Скрытность дает бонус к урону (сюрприз-атаки)
  const stealthBonus = 1 + (stats.stealth_bonus / 100)
  
  // Средний урон с учетом критов, точности и скрытности
  const averageDamage = totalDamage * (1 + critChance * critDamage) * accuracy * stealthBonus
  
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
  const stats = calculateCharacterStats(character)
  const totalDamage = stats.attack_damage + stats.magic_damage
  const totalDefense = stats.defense + stats.magic_resistance
  const criticalMultiplier = 1 + (stats.critical_chance / 100) * (stats.critical_damage / 100)
  
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
