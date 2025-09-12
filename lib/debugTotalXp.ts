import { calculateTotalXpForLevel, calculateXpToNext } from './levelSystemV2'

/**
 * Отладка расчета общего опыта для уровней
 */
export function debugTotalXp() {
  console.log('🔍 ОТЛАДКА РАСЧЕТА ОБЩЕГО ОПЫТА')
  console.log('=' .repeat(50))
  
  for (let level = 1; level <= 5; level++) {
    const totalXp = calculateTotalXpForLevel(level)
    const xpToNext = calculateXpToNext(level)
    
    console.log(`Уровень ${level}:`)
    console.log(`  Общий опыт для достижения: ${totalXp}`)
    console.log(`  Опыт до следующего уровня: ${xpToNext}`)
    console.log('')
  }
  
  // Проверяем конкретно 2 уровень
  console.log('🔍 ДЕТАЛЬНАЯ ПРОВЕРКА 2 УРОВНЯ:')
  const level2TotalXp = calculateTotalXpForLevel(2)
  const level2XpToNext = calculateXpToNext(2)
  
  console.log(`2 уровень - общий опыт: ${level2TotalXp}`)
  console.log(`2 уровень - опыт до следующего: ${level2XpToNext}`)
  
  // Проверяем, что происходит с опытом 60 на 2 уровне
  const character = { level: 2, experience: 60 }
  const totalXpForCurrentLevel = calculateTotalXpForLevel(character.level)
  const currentLevelProgress = character.experience - totalXpForCurrentLevel
  
  console.log(`\nПерсонаж 2 уровня с 60 опытом:`)
  console.log(`  Общий опыт персонажа: ${character.experience}`)
  console.log(`  Общий опыт для 2 уровня: ${totalXpForCurrentLevel}`)
  console.log(`  Прогресс: ${currentLevelProgress}`)
  console.log(`  Процент: ${(currentLevelProgress / level2XpToNext) * 100}%`)
}

// Запускаем отладку если файл выполняется напрямую
if (typeof window === 'undefined') {
  debugTotalXp()
}
