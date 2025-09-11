import { getLevelProgressionExamples, getKeyLevels, calculateXpToNext, processXpGain } from './levelSystemV2'

/**
 * Тестирует новую систему прогрессии уровней V2
 */

export function testLevelSystemV2() {
  console.log('🎯 ТЕСТ НОВОЙ СИСТЕМЫ ПРОГРЕССИИ V2')
  console.log('=====================================')
  
  console.log('\n📊 ПРОГРЕССИЯ XP (первые 20 уровней):')
  console.log('Level | XP Required | Description')
  console.log('------|-------------|-------------')
  
  const examples = getLevelProgressionExamples()
  examples.forEach(({ level, xpRequired, totalXp }) => {
    const xpFormatted = xpRequired >= 1000 ? `${(xpRequired/1000).toFixed(1)}K` : xpRequired.toString()
    const description = level === 1 ? 'Быстрый старт' : 
                       level === 10 ? 'Мигдейм' :
                       level === 20 ? 'Хайгейм' : ''
    console.log(`${level.toString().padStart(5)} | ${xpFormatted.padStart(11)} | ${description}`)
  })
  
  console.log('\n🚀 КЛЮЧЕВЫЕ УРОВНИ:')
  
  const keyLevels = getKeyLevels()
  keyLevels.forEach(({ level, xpRequired, totalXp }) => {
    const xpFormatted = xpRequired >= 1000 ? `${(xpRequired/1000).toFixed(1)}K` : xpRequired.toString()
    const totalFormatted = totalXp >= 1000 ? `${(totalXp/1000).toFixed(1)}K` : totalXp.toString()
    const description = level === 1 ? 'Старт' :
                       level === 10 ? '~42K общий XP' :
                       level === 20 ? '~119K общий XP' :
                       level === 50 ? '~3.7M общий XP' :
                       level === 80 ? '~12.6M общий XP (софт-кап)' :
                       level === 99 ? '~21M общий XP' :
                       level === 100 ? 'Максимальный уровень' : ''
    
    console.log(`Level ${level}: ${xpFormatted} XP → ${description}`)
  })
  
  console.log('\n⚡ ЛОГИКА РАБОТЫ:')
  console.log('✅ У игрока есть уровень L и прогресс XP до следующего уровня')
  console.log('✅ При получении XP: прогресс += XP')
  console.log('✅ Если прогресс >= XP_to_next(L): повышаем уровень')
  console.log('✅ Вычитаем из прогресса: прогресс -= XP_to_next(старый L)')
  console.log('✅ Повторяем пока хватает XP (возможен ап на несколько уровней)')
  console.log('✅ На 100 уровне: XP_to_next = 0, прокачка останавливается')
  
  console.log('\n🎮 ПРИМЕР РАБОТЫ:')
  
  // Тестируем получение XP
  let currentLevel = 1
  let currentXpProgress = 0
  const xpGained = 500 // Получаем 500 XP
  
  console.log(`Начальное состояние: Level ${currentLevel}, XP Progress: ${currentXpProgress}`)
  console.log(`Получаем ${xpGained} XP...`)
  
  const result = processXpGain(currentLevel, currentXpProgress, xpGained)
  
  console.log(`Результат:`)
  console.log(`  Новый уровень: ${result.newLevel}`)
  console.log(`  Новый прогресс: ${result.newXpProgress}`)
  console.log(`  Уровней получено: ${result.levelsGained}`)
  console.log(`  Очков характеристик: ${result.totalStatPointsGained}`)
  console.log(`  XP до следующего уровня: ${result.xpToNext}`)
  
  console.log('\n💡 ПРЕИМУЩЕСТВА НОВОЙ СИСТЕМЫ:')
  console.log('• Быстрый старт (1-10 уровни)')
  console.log('• Ровный мидгейм (10-60)')
  console.log('• Постепенное замедление (60-80)')
  console.log('• Софт-кап в эндгейме (80-100)')
  console.log('• Возможность апнуть на несколько уровней сразу')
  console.log('• Четкая остановка на 100 уровне')
}

// Экспортируем для использования в консоли браузера
if (typeof window !== 'undefined') {
  (window as any).testLevelSystemV2 = testLevelSystemV2
}
