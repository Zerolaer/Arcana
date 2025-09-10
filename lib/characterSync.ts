import { Character } from '@/types/game'
import { calculateCharacterStats, shouldUpdateStats, updateCharacterStatsInDB } from './characterStats'

/**
 * Синхронизирует характеристики персонажа в базе данных
 * с рассчитанными значениями на основе базовых статов
 */
export async function syncCharacterStats(character: Character): Promise<boolean> {
  try {
    // Рассчитываем актуальные характеристики
    const calculatedStats = calculateCharacterStats(character)
    
    // Проверяем, нужно ли обновление
    if (!shouldUpdateStats(character, calculatedStats)) {
      return true // Ничего обновлять не нужно
    }
    
    // Обновляем в базе данных
    const success = await updateCharacterStatsInDB(character.id, calculatedStats)
    
    if (success) {
      console.log('Character stats synced successfully:', {
        characterId: character.id,
        updatedStats: calculatedStats
      })
    } else {
      console.error('Failed to sync character stats:', character.id)
    }
    
    return success
  } catch (error) {
    console.error('Error syncing character stats:', error)
    return false
  }
}

/**
 * Синхронизирует характеристики всех персонажей пользователя
 */
export async function syncAllCharacterStats(playerId: string): Promise<boolean> {
  try {
    const { supabase } = await import('@/lib/supabase')
    
    // Получаем всех персонажей игрока
    const { data: characters, error } = await (supabase as any)
      .from('characters')
      .select('*')
      .eq('player_id', playerId)
    
    if (error) {
      console.error('Error fetching characters:', error)
      return false
    }
    
    if (!characters || characters.length === 0) {
      return true // Нет персонажей для синхронизации
    }
    
    // Синхронизируем каждого персонажа
    const syncPromises = characters.map((character: Character) => 
      syncCharacterStats(character)
    )
    
    const results = await Promise.all(syncPromises)
    const successCount = results.filter(Boolean).length
    
    console.log(`Synced ${successCount}/${characters.length} characters`)
    
    return successCount === characters.length
  } catch (error) {
    console.error('Error syncing all character stats:', error)
    return false
  }
}

/**
 * Хук для автоматической синхронизации характеристик при изменении базовых статов
 */
export function useCharacterStatsSync(character: Character) {
  const syncStats = async () => {
    return await syncCharacterStats(character)
  }
  
  return { syncStats }
}
