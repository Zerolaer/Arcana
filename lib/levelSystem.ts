/**
 * СИСТЕМА ПРОГРЕССИИ УРОВНЕЙ
 * Основана на принципах современных MMO (BDO, WoW, FFXIV)
 * 
 * Ключевые принципы:
 * 1. Каждый уровень начинается с 0% и идет до 100%
 * 2. Экспоненциальный рост требований опыта
 * 3. Долгая и осмысленная прокачка
 * 4. Награды за каждый уровень
 */

export interface LevelData {
  level: number
  experienceRequired: number
  totalExperience: number
  statPointsReward: number
  isMilestone: boolean // Каждые 10 уровней - особые награды
}

/**
 * Базовые параметры прогрессии
 */
const LEVEL_CONFIG = {
  // Базовое количество опыта для 2 уровня
  baseExperience: 1000,
  
  // Экспоненциальный множитель (как в BDO)
  exponentialFactor: 1.15,
  
  // Линейный множитель для высоких уровней
  linearFactor: 500,
  
  // Максимальный уровень
  maxLevel: 100,
  
  // Очки характеристик за уровень
  statPointsPerLevel: 5,
  
  // Дополнительные очки за каждые 10 уровней
  milestoneBonus: 10
}

/**
 * Рассчитывает требуемый опыт для достижения определенного уровня
 * Формула: base * (exponentialFactor ^ (level-1)) + linearFactor * (level-1)
 * 
 * Примеры:
 * Level 1 → 2: 1,000 exp
 * Level 2 → 3: 1,150 exp  
 * Level 3 → 4: 1,322 exp
 * Level 10 → 11: 2,594 exp
 * Level 20 → 21: 6,727 exp
 * Level 50 → 51: 1,083,657 exp
 */
export function calculateExperienceForLevel(level: number): number {
  if (level <= 1) return 0
  
  const exponential = LEVEL_CONFIG.baseExperience * Math.pow(LEVEL_CONFIG.exponentialFactor, level - 2)
  const linear = LEVEL_CONFIG.linearFactor * (level - 2)
  
  return Math.floor(exponential + linear)
}

/**
 * Рассчитывает общий накопленный опыт для уровня
 */
export function calculateTotalExperienceForLevel(level: number): number {
  let total = 0
  for (let i = 2; i <= level; i++) {
    total += calculateExperienceForLevel(i)
  }
  return total
}

/**
 * Получает данные уровня
 */
export function getLevelData(level: number): LevelData {
  const experienceRequired = calculateExperienceForLevel(level + 1)
  const totalExperience = calculateTotalExperienceForLevel(level)
  const isMilestone = level % 10 === 0
  
  let statPointsReward = LEVEL_CONFIG.statPointsPerLevel
  if (isMilestone) {
    statPointsReward += LEVEL_CONFIG.milestoneBonus
  }
  
  return {
    level,
    experienceRequired,
    totalExperience,
    statPointsReward,
    isMilestone
  }
}

/**
 * Рассчитывает текущий уровень на основе общего опыта
 */
export function calculateLevelFromExperience(totalExperience: number): number {
  let level = 1
  let accumulatedExp = 0
  
  while (level < LEVEL_CONFIG.maxLevel) {
    const expForNextLevel = calculateExperienceForLevel(level + 1)
    if (accumulatedExp + expForNextLevel > totalExperience) {
      break
    }
    accumulatedExp += expForNextLevel
    level++
  }
  
  return level
}

/**
 * Рассчитывает прогресс внутри текущего уровня (0-100%)
 */
export function calculateLevelProgress(totalExperience: number): {
  level: number
  currentLevelExp: number
  requiredExp: number
  progressPercent: number
  experienceToNext: number
} {
  const level = calculateLevelFromExperience(totalExperience)
  const totalExpForCurrentLevel = calculateTotalExperienceForLevel(level)
  const requiredExpForNextLevel = calculateExperienceForLevel(level + 1)
  
  const currentLevelExp = totalExperience - totalExpForCurrentLevel
  
  // ИСПРАВЛЕНИЕ: Ограничиваем прогресс максимум 100%
  let progressPercent = 0
  if (requiredExpForNextLevel > 0) {
    progressPercent = (currentLevelExp / requiredExpForNextLevel) * 100
    // Если опыт больше требуемого для следующего уровня, ограничиваем до 100%
    if (progressPercent > 100) {
      progressPercent = 100
    }
  }
  
  const experienceToNext = Math.max(0, requiredExpForNextLevel - currentLevelExp)
  
  return {
    level,
    currentLevelExp: Math.max(0, currentLevelExp),
    requiredExp: requiredExpForNextLevel,
    progressPercent: Math.max(0, Math.min(100, progressPercent)),
    experienceToNext
  }
}

/**
 * Проверяет, достаточно ли опыта для повышения уровня
 */
export function checkLevelUp(currentExperience: number, newExperience: number): {
  leveledUp: boolean
  newLevel: number
  newStatPoints: number
  experienceToNext: number
} {
  const currentLevel = calculateLevelFromExperience(currentExperience)
  const newLevel = calculateLevelFromExperience(newExperience)
  
  if (newLevel > currentLevel) {
    const levelData = getLevelData(newLevel)
    const progress = calculateLevelProgress(newExperience)
    
    return {
      leveledUp: true,
      newLevel,
      newStatPoints: levelData.statPointsReward,
      experienceToNext: progress.experienceToNext
    }
  }
  
  const progress = calculateLevelProgress(newExperience)
  return {
    leveledUp: false,
    newLevel: currentLevel,
    newStatPoints: 0,
    experienceToNext: progress.experienceToNext
  }
}

/**
 * Получает информацию о прогрессе для UI
 */
export function getLevelProgressInfo(character: { level: number; experience: number }) {
  const progress = calculateLevelProgress(character.experience)
  const levelData = getLevelData(progress.level)
  
  return {
    level: progress.level,
    experience: progress.currentLevelExp,
    experienceToNext: progress.experienceToNext,
    experienceRequired: progress.requiredExp,
    progressPercent: progress.progressPercent,
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
  if (level >= 80) return 'text-purple-400' // Легендарный
  if (level >= 60) return 'text-orange-400' // Эпический  
  if (level >= 40) return 'text-blue-400'   // Редкий
  if (level >= 20) return 'text-green-400'  // Необычный
  return 'text-gray-400' // Обычный
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
export function getLevelProgressionExamples(): Array<{level: number, expRequired: number, totalExp: number}> {
  const examples = []
  for (let level = 1; level <= 20; level++) {
    const expRequired = calculateExperienceForLevel(level + 1)
    const totalExp = calculateTotalExperienceForLevel(level)
    examples.push({ level, expRequired, totalExp })
  }
  return examples
}

// Экспортируем конфиг для использования в других модулях
export { LEVEL_CONFIG }
