import { processXpGain, getLevelProgressInfo, calculateXpToNext } from './levelSystemV2'

/**
 * Отладка проблемы с опытом на 2 уровне
 */
export function debugLevel2Experience() {
  console.log('🔍 ОТЛАДКА ПРОБЛЕМЫ С ОПЫТОМ НА 2 УРОВНЕ')
  console.log('=' .repeat(60))
  
  // Проверяем требования для 2 уровня
  console.log('\n📊 ТРЕБОВАНИЯ ДЛЯ УРОВНЕЙ:')
  console.log(`Опыт для 1→2 уровня: ${calculateXpToNext(1)}`)
  console.log(`Опыт для 2→3 уровня: ${calculateXpToNext(2)}`)
  
  // Симулируем персонажа 2 уровня с 0 опыта
  let character = { level: 2, experience: 0 }
  
  console.log('\n📊 НАЧАЛЬНОЕ СОСТОЯНИЕ (2 уровень, 0 опыта):')
  let progressInfo = getLevelProgressInfo(character)
  console.log(`Уровень: ${progressInfo.level}`)
  console.log(`Опыт: ${progressInfo.experience}`)
  console.log(`Опыт до следующего уровня: ${progressInfo.experienceToNext}`)
  console.log(`Процент прогресса: ${progressInfo.progressPercent.toFixed(1)}%`)
  
  // Симулируем убийство мобов по 10 опыта каждый
  console.log('\n🎯 УБИЙСТВО МОБОВ НА 2 УРОВНЕ:')
  for (let i = 1; i <= 10; i++) {
    const experienceGained = 10
    const xpResult = processXpGain(character.level, character.experience, experienceGained)
    
    // Обновляем персонажа
    character = {
      level: xpResult.newLevel,
      experience: xpResult.newXpProgress
    }
    
    progressInfo = getLevelProgressInfo(character)
    
    console.log(`\nМоб ${i}: +${experienceGained} опыта`)
    console.log(`  Уровень: ${character.level}`)
    console.log(`  Опыт: ${character.experience}`)
    console.log(`  Опыт до следующего уровня: ${progressInfo.experienceToNext}`)
    console.log(`  Процент прогресса: ${progressInfo.progressPercent.toFixed(1)}%`)
    
    if (xpResult.levelsGained > 0) {
      console.log(`  🎉 ПОВЫШЕНИЕ УРОВНЯ! +${xpResult.levelsGained} уровень(ов)`)
    }
    
    // Останавливаемся после повышения уровня
    if (xpResult.levelsGained > 0) {
      break
    }
  }
  
  // Проверяем, что происходит с опытом на 2 уровне
  console.log('\n🔍 ДЕТАЛЬНАЯ ПРОВЕРКА 2 УРОВНЯ:')
  character = { level: 2, experience: 0 }
  
  // Добавляем опыт по 1 единице
  for (let exp = 1; exp <= 20; exp++) {
    const xpResult = processXpGain(character.level, character.experience, 1)
    character = {
      level: xpResult.newLevel,
      experience: xpResult.newXpProgress
    }
    
    progressInfo = getLevelProgressInfo(character)
    
    if (exp % 5 === 0 || xpResult.levelsGained > 0) {
      console.log(`+${exp} опыта: Уровень ${character.level}, Опыт ${character.experience}, Прогресс ${progressInfo.progressPercent.toFixed(1)}%`)
    }
    
    if (xpResult.levelsGained > 0) {
      console.log(`  🎉 ПОВЫШЕНИЕ УРОВНЯ!`)
      break
    }
  }
  
  console.log('\n' + '=' .repeat(60))
  console.log('🏁 ОТЛАДКА ЗАВЕРШЕНА')
}

// Запускаем отладку если файл выполняется напрямую
if (typeof window === 'undefined') {
  debugLevel2Experience()
}
