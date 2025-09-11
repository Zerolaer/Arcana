import { getLevelProgressionExamples, calculateExperienceForLevel, calculateLevelFromExperience } from './levelSystem'

/**
 * Тестирует новую систему прогрессии уровней
 */

export function testLevelSystem() {
  console.log('🎯 ТЕСТ НОВОЙ СИСТЕМЫ ПРОГРЕССИИ УРОВНЕЙ')
  console.log('==========================================')
  
  console.log('\n📊 ПРОГРЕССИЯ ОПЫТА (первые 20 уровней):')
  console.log('Level → Next Level | Required EXP | Total EXP')
  console.log('----------------------------------------------')
  
  const examples = getLevelProgressionExamples()
  examples.forEach(({ level, expRequired, totalExp }) => {
    const expFormatted = expRequired >= 1000 ? `${(expRequired/1000).toFixed(1)}K` : expRequired.toString()
    const totalFormatted = totalExp >= 1000 ? `${(totalExp/1000).toFixed(1)}K` : totalExp.toString()
    console.log(`${level.toString().padStart(2)} → ${(level+1).toString().padStart(2)} | ${expFormatted.padStart(10)} | ${totalFormatted.padStart(8)}`)
  })
  
  console.log('\n🚀 ПРИМЕРЫ ДОЛГОЙ ПРОКАЧКИ (как в BDO):')
  
  const milestoneLevels = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  milestoneLevels.forEach(level => {
    const expRequired = calculateExperienceForLevel(level + 1)
    const totalExp = calculateExperienceForLevel(level + 1)
    
    let expFormatted: string
    if (expRequired >= 1000000) {
      expFormatted = `${(expRequired/1000000).toFixed(1)}M`
    } else if (expRequired >= 1000) {
      expFormatted = `${(expRequired/1000).toFixed(1)}K`
    } else {
      expFormatted = expRequired.toString()
    }
    
    console.log(`Level ${level} → ${level+1}: ${expFormatted} EXP`)
  })
  
  console.log('\n⚡ КЛЮЧЕВЫЕ ОСОБЕННОСТИ:')
  console.log('✅ Каждый уровень начинается с 0% и идет до 100%')
  console.log('✅ Экспоненциальный рост требований опыта')
  console.log('✅ Долгая и осмысленная прокачка')
  console.log('✅ Каждые 10 уровней - milestone с бонусными очками')
  console.log('✅ Максимальный уровень: 100')
  console.log('✅ 5 очков характеристик за уровень + 10 за milestone')
  
  console.log('\n🎮 СРАВНЕНИЕ С BDO:')
  console.log('• BDO: годы фарма на хайэнде для 1 уровня')
  console.log('• Наша система: экспоненциальный рост, но достижимо')
  console.log('• Level 50 → 51: ~1M EXP (серьезная прокачка)')
  console.log('• Level 80 → 81: ~10M EXP (эндгейм контент)')
  
  console.log('\n💡 ПРЕИМУЩЕСТВА:')
  console.log('• Мотивация играть долго')
  console.log('• Чувство прогресса')
  console.log('• Ценность каждого уровня')
  console.log('• Социальный статус высоких уровней')
}

// Экспортируем для использования в консоли браузера
if (typeof window !== 'undefined') {
  (window as any).testLevelSystem = testLevelSystem
}
