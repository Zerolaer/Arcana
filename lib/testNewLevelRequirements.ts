import { calculateXpToNext, getLevelProgressionExamples } from './levelSystemV2'

/**
 * Тестирует новые требования к уровням
 */

export function testNewLevelRequirements() {
  console.log('🎯 НОВЫЕ ТРЕБОВАНИЯ К УРОВНЯМ (МЕДЛЕННАЯ ПРОКАЧКА)')
  console.log('====================================================')
  
  console.log('\n📊 ПРОГРЕССИЯ XP (первые 15 уровней):')
  console.log('Level | XP Required | Мобов нужно (15 XP)')
  console.log('------|-------------|---------------------')
  
  for (let level = 1; level <= 15; level++) {
    const xpRequired = calculateXpToNext(level)
    const mobsNeeded = Math.ceil(xpRequired / 15) // Средний моб дает 15 XP
    
    const xpFormatted = xpRequired >= 1000 ? `${(xpRequired/1000).toFixed(1)}K` : xpRequired.toString()
    
    console.log(`${level.toString().padStart(5)} | ${xpFormatted.padStart(11)} | ${mobsNeeded.toString().padStart(13)}`)
  }
  
  console.log('\n🚀 КЛЮЧЕВЫЕ УРОВНИ:')
  
  const keyLevels = [1, 5, 10, 15, 20, 30, 50, 80, 100]
  keyLevels.forEach(level => {
    const xpRequired = calculateXpToNext(level)
    const mobsNeeded = Math.ceil(xpRequired / 15)
    
    const xpFormatted = xpRequired >= 1000 ? `${(xpRequired/1000).toFixed(1)}K` : xpRequired.toString()
    
    const description = level === 1 ? 'Быстрый старт' :
                       level === 5 ? 'Начало игры' :
                       level === 10 ? 'Мигдейм' :
                       level === 20 ? 'Хайгейм' :
                       level === 50 ? 'Эндгейм' :
                       level === 80 ? 'Софт-кап' :
                       level === 100 ? 'Максимальный уровень' : ''
    
    console.log(`Level ${level}: ${xpFormatted} XP (~${mobsNeeded} мобов) → ${description}`)
  })
  
  console.log('\n⚡ СРАВНЕНИЕ С ПРЕДЫДУЩЕЙ СИСТЕМОЙ:')
  console.log('Старая система:')
  console.log('  1 → 2: 105 XP (~7 мобов)')
  console.log('  5 → 6: ~300 XP (~20 мобов)')
  console.log('  10 → 11: ~1.2K XP (~80 мобов)')
  
  console.log('\nНовая система:')
  console.log(`  1 → 2: ${calculateXpToNext(1)} XP (~${Math.ceil(calculateXpToNext(1) / 15)} мобов)`)
  console.log(`  5 → 6: ${calculateXpToNext(5)} XP (~${Math.ceil(calculateXpToNext(5) / 15)} мобов)`)
  console.log(`  10 → 11: ${calculateXpToNext(10)} XP (~${Math.ceil(calculateXpToNext(10) / 15)} мобов)`)
  
  console.log('\n💡 ПРЕИМУЩЕСТВА НОВОЙ СИСТЕМЫ:')
  console.log('• Медленная и осмысленная прокачка')
  console.log('• Больше времени на изучение контента')
  console.log('• Ценность каждого уровня')
  console.log('• Мотивация играть дольше')
  console.log('• Социальный статус высоких уровней')
  
  console.log('\n🎮 РЕКОМЕНДАЦИИ ПО ГЕЙМПЛЕЮ:')
  console.log('• Фокусируйся на изучении механик, а не на прокачке')
  console.log('• Каждый уровень будет значимым достижением')
  console.log('• Высокие уровни станут редкими и ценными')
  console.log('• Больше времени на фарм предметов и золота')
}

// Экспортируем для использования в консоли браузера
if (typeof window !== 'undefined') {
  (window as any).testNewLevelRequirements = testNewLevelRequirements
}
