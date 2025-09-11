/**
 * ДЕБАГ СИСТЕМЫ ОПЫТА
 * Проверяем что происходит с опытом персонажа
 */

import { Character } from '@/types/game'
import { calculateLevelProgress, getLevelProgressInfo } from './levelSystem'

export function debugExperience(character: Character) {
  console.log('🔍 ДЕБАГ СИСТЕМЫ ОПЫТА')
  console.log('========================')
  
  console.log('\n📊 ДАННЫЕ ПЕРСОНАЖА:')
  console.log(`  Name: ${character.name}`)
  console.log(`  Level: ${character.level}`)
  console.log(`  Experience: ${character.experience}`)
  console.log(`  Experience to Next: ${character.experience_to_next}`)
  
  console.log('\n🧮 РАСЧЕТ НОВОЙ СИСТЕМЫ:')
  const progress = calculateLevelProgress(character.experience)
  console.log(`  Calculated Level: ${progress.level}`)
  console.log(`  Current Level Exp: ${progress.currentLevelExp}`)
  console.log(`  Required Exp: ${progress.requiredExp}`)
  console.log(`  Progress Percent: ${progress.progressPercent.toFixed(2)}%`)
  console.log(`  Experience to Next: ${progress.experienceToNext}`)
  
  console.log('\n🎯 РЕЗУЛЬТАТ getLevelProgressInfo:')
  const progressInfo = getLevelProgressInfo(character)
  console.log(`  Level: ${progressInfo.level}`)
  console.log(`  Experience: ${progressInfo.experience}`)
  console.log(`  Experience Required: ${progressInfo.experienceRequired}`)
  console.log(`  Progress Percent: ${progressInfo.progressPercent.toFixed(2)}%`)
  console.log(`  Experience to Next: ${progressInfo.experienceToNext}`)
  
  console.log('\n⚠️ ПРОБЛЕМЫ:')
  if (progress.progressPercent > 1000) {
    console.log(`  ❌ Прогресс больше 1000%! (${progress.progressPercent.toFixed(2)}%)`)
    console.log(`  💡 Нужно обновить данные в базе`)
  }
  
  if (character.experience > progress.requiredExp * 10) {
    console.log(`  ❌ Опыт персонажа слишком большой для уровня`)
    console.log(`  💡 Character exp: ${character.experience}, Required: ${progress.requiredExp}`)
  }
  
  console.log('\n✅ РЕШЕНИЕ:')
  console.log('  1. Выполни SQL скрипт: supabase/update_experience_system.sql')
  console.log('  2. Или сбрось опыт персонажа до 0')
}

// Экспортируем для использования в консоли браузера
if (typeof window !== 'undefined') {
  (window as any).debugExperience = debugExperience
}
