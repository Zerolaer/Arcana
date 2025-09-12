import { Character } from '@/types/game'
import { Mob, CombatRewards, CombatLogEntry } from '@/types/world'
import { supabase } from '@/lib/supabase'
import { processXpGain } from './levelSystemV2'

// Система боя
export class CombatSystem {
  
  // Расчет урона
  static calculateDamage(attacker: { attack: number; level: number }, defender: { defense: number; level: number }): number {
    const baseAttack = attacker.attack
    const defense = defender.defense
    const levelModifier = 1 + (attacker.level * 0.05) // 5% за уровень
    
    // Базовый урон с учетом защиты
    let damage = Math.max(1, Math.floor((baseAttack * levelModifier) - (defense * 0.7)))
    
    // Случайность ±20%
    const randomFactor = 0.8 + (Math.random() * 0.4)
    damage = Math.floor(damage * randomFactor)
    
    // Критический удар (10% шанс, x2 урон)
    const isCritical = Math.random() < 0.1
    if (isCritical) {
      damage *= 2
    }
    
    return Math.max(1, damage)
  }

  // Расчет шанса попадания
  static calculateHitChance(attacker: { level: number }, defender: { level: number }): number {
    const levelDiff = attacker.level - defender.level
    let hitChance = 0.85 // Базовый шанс 85%
    
    // Модификатор по уровню (±2% за уровень разницы)
    hitChance += levelDiff * 0.02
    
    // Ограничиваем от 10% до 95%
    return Math.max(0.1, Math.min(0.95, hitChance))
  }

  // Основная функция боя
  static async simulateCombat(character: Character, mob: Mob): Promise<CombatRewards | null> {
    console.log(`🗡️ Начинается бой: ${character.name} vs ${mob.name}`)
    
    // Копируем здоровье для симуляции
    let playerHealth = character.health
    let mobHealth = mob.health
    
    const combatLog: CombatLogEntry[] = []
    let turn = 0
    const maxTurns = 50 // Защита от бесконечного боя
    
    while (playerHealth > 0 && mobHealth > 0 && turn < maxTurns) {
      turn++
      
      // Ход игрока
      const playerHitChance = this.calculateHitChance(character, mob)
      if (Math.random() < playerHitChance) {
        const damage = this.calculateDamage(
          { attack: character.attack_damage, level: character.level },
          { defense: mob.defense, level: mob.level }
        )
        mobHealth -= damage
        
        combatLog.push({
          id: `player_${turn}`,
          timestamp: Date.now(),
          action: damage > (character.attack_damage * 1.8) ? 'critical' : 'attack',
          actor: 'player',
          damage,
          message: `${character.name} наносит ${damage} урона`
        })
        
        console.log(`⚔️ Игрок наносит ${damage} урона. HP моба: ${Math.max(0, mobHealth)}`)
      } else {
        combatLog.push({
          id: `player_miss_${turn}`,
          timestamp: Date.now(),
          action: 'miss',
          actor: 'player',
          message: `${character.name} промахивается`
        })
        console.log(`❌ Игрок промахивается`)
      }
      
      if (mobHealth <= 0) break
      
      // Ход моба
      const mobHitChance = this.calculateHitChance(mob, character)
      if (Math.random() < mobHitChance) {
        const damage = this.calculateDamage(
          { attack: mob.attack_damage || mob.attack, level: mob.level },
          { defense: character.defense, level: character.level }
        )
        playerHealth -= damage
        
        combatLog.push({
          id: `mob_${turn}`,
          timestamp: Date.now(),
          action: damage > ((mob.attack_damage || mob.attack) * 1.8) ? 'critical' : 'attack',
          actor: 'mob',
          damage,
          message: `${mob.name} наносит ${damage} урона`
        })
        
        console.log(`🔥 Моб наносит ${damage} урона. HP игрока: ${Math.max(0, playerHealth)}`)
      } else {
        combatLog.push({
          id: `mob_miss_${turn}`,
          timestamp: Date.now(),
          action: 'miss',
          actor: 'mob',
          message: `${mob.name} промахивается`
        })
        console.log(`❌ Моб промахивается`)
      }
    }
    
    // Определяем победителя
    const playerWon = mobHealth <= 0 && playerHealth > 0
    
    if (!playerWon) {
      console.log(`💀 Игрок проиграл бой`)
      // В случае поражения игрок теряет немного здоровья, но не умирает
      await this.updatePlayerAfterDefeat(character)
      return null
    }
    
    console.log(`🏆 Игрок победил!`)
    
    // Расчет наград
    const rewards = await this.calculateRewards(character, mob)
    
    // Обновляем игрока в базе данных
    await this.updatePlayerAfterVictory(character, rewards, playerHealth)
    
    return rewards
  }

  // Расчет наград за победу
  static async calculateRewards(character: Character, mob: Mob): Promise<CombatRewards> {
    const levelDiff = mob.level - character.level
    const difficultyMultiplier = Math.max(0.5, 1 + (levelDiff * 0.1)) // Больше наград за сложных мобов
    
    // Базовые награды
    let experience = Math.floor(mob.experience_reward * difficultyMultiplier)
    let gold = Math.floor(mob.gold_reward * difficultyMultiplier)
    
    // Бонус за первое убийство моба этого типа (можно добавить позже)
    // if (isFirstKill) {
    //   experience *= 2
    //   gold *= 2
    // }
    
    // Случайность в наградах ±20%
    const randomFactor = 0.8 + (Math.random() * 0.4)
    experience = Math.floor(experience * randomFactor)
    gold = Math.floor(gold * randomFactor)
    
    // Проверяем повышение уровня с помощью новой системы
    const xpResult = processXpGain(character.level, character.experience, experience)
    const levelUp = xpResult.levelsGained > 0
    
    // Получаем добычу предметов из базы данных
    const lootedItems = await this.getMobLoot(mob.id)
    
    console.log(`🎁 Награды: ${experience} опыта, ${gold} золота, ${lootedItems.length} предметов`)
    if (levelUp) console.log(`🎉 ПОВЫШЕНИЕ УРОВНЯ!`)
    
    return {
      experience,
      gold,
      items: lootedItems,
      level_up: levelUp
    }
  }

  // Обновление игрока после победы
  static async updatePlayerAfterVictory(character: Character, rewards: CombatRewards, remainingHealth: number) {
    try {
      const newGold = character.gold + rewards.gold
      
      // Используем новую систему уровней
      const xpResult = processXpGain(character.level, character.experience, rewards.experience)
      
      let updates: any = {
        experience: xpResult.newXpProgress,
        gold: newGold,
        health: Math.max(1, remainingHealth) // Минимум 1 HP
      }
      
      // Если повышение уровня
      if (xpResult.levelsGained > 0) {
        const newLevel = xpResult.newLevel
        const newStatPoints = character.stat_points + xpResult.totalStatPointsGained
        
        // Увеличиваем базовые характеристики
        const newMaxHealth = character.max_health + (20 * xpResult.levelsGained) // +20 HP за каждый уровень
        const newMaxMana = character.max_mana + (10 * xpResult.levelsGained) // +10 MP за каждый уровень
        
        updates = {
          ...updates,
          level: newLevel,
          experience_to_next: xpResult.xpToNext,
          stat_points: newStatPoints,
          max_health: newMaxHealth,
          max_mana: newMaxMana,
          health: newMaxHealth, // Полное восстановление при повышении уровня
          mana: newMaxMana
        }
        
        console.log(`📈 Новый уровень: ${newLevel} (+${xpResult.levelsGained}), новый макс HP: ${newMaxHealth}, очков характеристик: +${xpResult.totalStatPointsGained}`)
      }
      
      // Обновляем в базе данных
      const { error } = await (supabase as any)
        .from('characters')
        .update(updates)
        .eq('id', character.id)
      
      if (error) {
        console.error('Error updating character after victory:', error)
        throw error
      }
      
      // Добавляем предметы в инвентарь (если есть)
      if (rewards.items && rewards.items.length > 0) {
        await this.addItemsToInventory(character.id, rewards.items)
      }
      
    } catch (error) {
      console.error('Error in updatePlayerAfterVictory:', error)
      throw error
    }
  }

  // Обновление игрока после поражения
  static async updatePlayerAfterDefeat(character: Character) {
    try {
      // Игрок теряет 25% текущего здоровья, но не меньше 1 HP
      const newHealth = Math.max(1, Math.floor(character.health * 0.75))
      
      const { error } = await (supabase as any)
        .from('characters')
        .update({ health: newHealth })
        .eq('id', character.id)
      
      if (error) {
        console.error('Error updating character after defeat:', error)
        throw error
      }
      
      console.log(`💔 Игрок потерял здоровье: ${character.health} -> ${newHealth}`)
      
    } catch (error) {
      console.error('Error in updatePlayerAfterDefeat:', error)
      throw error
    }
  }


  // Получение лута моба из базы данных
  static async getMobLoot(mobId: string): Promise<any[]> {
    try {
      // Получаем лут-таблицу моба и предметы с шансом дропа
      const { data, error } = await (supabase as any)
        .from('mob_loot')
        .select(`
          drop_rate,
          quantity_min,
          quantity_max,
          item:items_new (
            id,
            name,
            icon,
            grade_id
          )
        `)
        .eq('mob_id', mobId)
      
      if (error) {
        console.error('Error fetching mob loot:', error)
        return []
      }
      
      // Фильтруем предметы по шансу дропа
      const lootedItems = []
      for (const loot of data || []) {
        if (Math.random() * 100 < (loot as any).drop_rate) {
          const quantity = Math.floor(Math.random() * ((loot as any).quantity_max - (loot as any).quantity_min + 1)) + (loot as any).quantity_min
          
          // Генерируем случайное качество (50-100%)
          const quality = 50 + Math.random() * 50
          
          lootedItems.push({
            item_id: (loot as any).item.id,
            item_name: (loot as any).item.name,
            item_icon: (loot as any).item.icon,
            quantity: quantity,
            quality: Math.round(quality * 100) / 100 // Округляем до 2 знаков
          })
        }
      }
      
      console.log(`🎲 Выпало ${lootedItems.length} предметов из ${data?.length || 0} возможных`)
      return lootedItems
      
    } catch (error) {
      console.error('Error in getMobLoot:', error)
      return []
    }
  }

  // Добавление предметов в инвентарь
  static async addItemsToInventory(characterId: string, items: any[]) {
    try {
      // Получаем текущий инвентарь
      const { data: inventory, error: inventoryError } = await (supabase as any)
        .from('character_inventory')
        .select('slot_position')
        .eq('character_id', characterId)
        .order('slot_position')
      
      if (inventoryError) throw inventoryError
      
      // Находим свободные слоты
      const occupiedSlots = new Set(inventory?.map((item: any) => item.slot_position) || [])
      const freeSlots = []
      
      for (let i = 1; i <= 100; i++) { // 100 слотов инвентаря
        if (!occupiedSlots.has(i)) {
          freeSlots.push(i)
        }
      }
      
      // Добавляем предметы в свободные слоты
      for (let i = 0; i < items.length && i < freeSlots.length; i++) {
        const item = items[i]
        
        const { error: insertError } = await (supabase as any)
          .from('character_inventory')
          .insert({
            character_id: characterId,
            item_id: item.item_id,
            slot_position: freeSlots[i],
            stack_size: item.quantity,
            quality: item.quality
          })
        
        if (insertError) {
          console.error('Error adding item to inventory:', insertError)
        } else {
          console.log(`📦 Добавлен предмет: ${item.item_name} (${item.item_icon}) x${item.quantity} [Качество: ${item.quality}%]`)
        }
      }
      
      if (items.length > freeSlots.length) {
        console.warn(`⚠️ Не хватило места для ${items.length - freeSlots.length} предметов`)
      }
      
    } catch (error) {
      console.error('Error in addItemsToInventory:', error)
    }
  }
}
