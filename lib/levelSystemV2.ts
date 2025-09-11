/**
 * НОВАЯ СИСТЕМА ПРОГРЕССИИ УРОВНЕЙ V2
 * Основана на логике: уровень + опыт до следующего уровня
 */

export interface LevelData {
  level: number
  xpToNext: number
  totalXpRequired: number
  statPointsReward: number
  isMilestone: boolean
}

/**
 * Параметры прогрессии (сбалансированы под комфортный темп)
 */
const LEVEL_CONFIG = {
  // Базовые параметры формулы (оптимизированы для комфортной прокачки)
  base: 30,
  linear: 15,
  quadratic: 10,
  cubic: 0.1,
  
  // Софт-кап после 80 уровня
  softCapLevel: 80,
  softCapMultiplier: 1.2,
  
  // Максимальный уровень
  maxLevel: 100,
  
  // Очки характеристик
  statPointsPerLevel: 5,
  milestoneBonus: 10
}

/**
 * Рассчитывает требуемый XP для повышения с уровня L до L+1
 * Формула: round(base + lin·L + quad·L² + cubic·L³) · S(L)
 */
export function calculateXpToNext(level: number): number {
  if (level >= LEVEL_CONFIG.maxLevel) {
    return 0 // На 100 уровне прокачка останавливается
  }
  
  const base = LEVEL_CONFIG.base
  const lin = LEVEL_CONFIG.linear
  const quad = LEVEL_CONFIG.quadratic
  const cubic = LEVEL_CONFIG.cubic
  
  // Основная формула
  const formula = base + (lin * level) + (quad * level * level) + (cubic * level * level * level)
  
  // Софт-кап после 80 уровня
  const softCapMultiplier = level >= LEVEL_CONFIG.softCapLevel ? LEVEL_CONFIG.softCapMultiplier : 1
  
  return Math.round(formula * softCapMultiplier)
}

/**
 * Рассчитывает общий накопленный XP для достижения уровня
 */
export function calculateTotalXpForLevel(level: number): number {
  let total = 0
  for (let i = 1; i < level; i++) {
    total += calculateXpToNext(i)
  }
  return total
}

/**
 * Получает данные уровня
 */
export function getLevelData(level: number): LevelData {
  const xpToNext = calculateXpToNext(level)
  const totalXpRequired = calculateTotalXpForLevel(level)
  const isMilestone = level % 10 === 0
  
  let statPointsReward = LEVEL_CONFIG.statPointsPerLevel
  if (isMilestone) {
    statPointsReward += LEVEL_CONFIG.milestoneBonus
  }
  
  return {
    level,
    xpToNext,
    totalXpRequired,
    statPointsReward,
    isMilestone
  }
}

/**
 * Обрабатывает получение XP и повышение уровня
 * Возвращает новые значения уровня и прогресса
 */
export function processXpGain(currentLevel: number, currentXpProgress: number, xpGained: number): {
  newLevel: number
  newXpProgress: number
  levelsGained: number
  totalStatPointsGained: number
  xpToNext: number
} {
  let newLevel = currentLevel
  let newXpProgress = currentXpProgress + xpGained
  let levelsGained = 0
  let totalStatPointsGained = 0
  
  // Проверяем повышение уровня
  while (newLevel < LEVEL_CONFIG.maxLevel) {
    const xpRequired = calculateXpToNext(newLevel)
    
    if (xpRequired === 0) break // Достигли максимального уровня
    
    if (newXpProgress >= xpRequired) {
      // Повышаем уровень
      newLevel++
      levelsGained++
      newXpProgress -= xpRequired
      
      // Начисляем очки характеристик
      const levelData = getLevelData(newLevel)
      totalStatPointsGained += levelData.statPointsReward
    } else {
      break // Не хватает XP для следующего уровня
    }
  }
  
  // Если достигли максимального уровня, сбрасываем прогресс
  if (newLevel >= LEVEL_CONFIG.maxLevel) {
    newXpProgress = 0
  }
  
  const xpToNext = calculateXpToNext(newLevel)
  
  return {
    newLevel,
    newXpProgress,
    levelsGained,
    totalStatPointsGained,
    xpToNext
  }
}

/**
 * Получает информацию о прогрессе для UI
 */
export function getLevelProgressInfo(character: { level: number; experience: number }) {
  const levelData = getLevelData(character.level)
  const xpToNext = calculateXpToNext(character.level)
  
  // Прогресс в процентах (0-100%)
  const progressPercent = xpToNext > 0 ? (character.experience / xpToNext) * 100 : 0
  
  return {
    level: character.level,
    experience: character.experience,
    experienceToNext: xpToNext,
    experienceRequired: xpToNext,
    progressPercent: Math.min(100, Math.max(0, progressPercent)),
    statPointsReward: levelData.statPointsReward,
    isMilestone: levelData.isMilestone,
    totalExperience: character.experience
  }
}

/**
 * Форматирует большие числа для отображения
 */
export function formatExperience(exp: number): string {
  if (exp >= 1000000) {
    return `${(exp / 1000000).toFixed(1)}M`
  }
  if (exp >= 1000) {
    return `${(exp / 1000).toFixed(1)}K`
  }
  return exp.toString()
}

/**
 * Получает цвет для отображения уровня
 */
export function getLevelColor(level: number): string {
  if (level >= 100) return 'text-gold-400' // Легендарный
  if (level >= 80) return 'text-purple-400' // Эпический
  if (level >= 60) return 'text-orange-400' // Редкий
  if (level >= 40) return 'text-blue-400' // Необычный
  if (level >= 20) return 'text-green-400' // Обычный
  return 'text-gray-400' // Начинающий
}

/**
 * Получает цвет для прогресса опыта
 */
export function getExperienceProgressColor(percent: number): string {
  if (percent >= 90) return 'from-yellow-500 to-orange-400'
  if (percent >= 70) return 'from-blue-500 to-blue-400'
  if (percent >= 50) return 'from-green-500 to-green-400'
  return 'from-gray-500 to-gray-400'
}

/**
 * Примеры прогрессии для тестирования
 */
export function getLevelProgressionExamples(): Array<{level: number, xpRequired: number, totalXp: number}> {
  const examples = []
  for (let level = 1; level <= 20; level++) {
    const xpRequired = calculateXpToNext(level)
    const totalXp = calculateTotalXpForLevel(level)
    examples.push({ level, xpRequired, totalXp })
  }
  return examples
}

/**
 * Показывает ключевые уровни
 */
export function getKeyLevels(): Array<{level: number, xpRequired: number, totalXp: number}> {
  const keyLevels = [1, 10, 20, 50, 80, 99, 100]
  return keyLevels.map(level => ({
    level,
    xpRequired: calculateXpToNext(level),
    totalXp: calculateTotalXpForLevel(level)
  }))
}

// Экспортируем конфиг для использования в других модулях
export { LEVEL_CONFIG }
