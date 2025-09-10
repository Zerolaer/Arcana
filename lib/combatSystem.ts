import { Character } from '@/types/game'
import { Mob, CombatRewards, CombatLogEntry } from '@/types/world'
import { supabase } from '@/lib/supabase'

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
    const rewards = this.calculateRewards(character, mob)
    
    // Обновляем игрока в базе данных
    await this.updatePlayerAfterVictory(character, rewards, playerHealth)
    
    return rewards
  }

  // Расчет наград за победу
  static calculateRewards(character: Character, mob: Mob): CombatRewards {
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
    
    // Проверяем повышение уровня
    const newExperience = character.experience + experience
    const experienceToNext = character.experience_to_next
    const levelUp = newExperience >= experienceToNext
    
    // Добыча предметов
    const lootedItems = mob.loot_table.filter(loot => {
      return Math.random() * 100 < loot.drop_rate
    })
    
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
      const newExperience = character.experience + rewards.experience
      const newGold = character.gold + rewards.gold
      
      let updates: any = {
        experience: newExperience,
        gold: newGold,
        health: Math.max(1, remainingHealth) // Минимум 1 HP
      }
      
      // Если повышение уровня
      if (rewards.level_up) {
        const newLevel = character.level + 1
        const newExperienceToNext = this.calculateExperienceToNextLevel(newLevel)
        const newStatPoints = character.stat_points + 5 // 5 очков за уровень
        const newSkillPoints = character.skill_points + 1 // 1 очко навыков за уровень
        
        // Увеличиваем базовые характеристики
        const newMaxHealth = character.max_health + 20 // +20 HP за уровень
        const newMaxMana = character.max_mana + 10 // +10 MP за уровень
        
        updates = {
          ...updates,
          level: newLevel,
          experience_to_next: newExperienceToNext,
          stat_points: newStatPoints,
          skill_points: newSkillPoints,
          max_health: newMaxHealth,
          max_mana: newMaxMana,
          health: newMaxHealth, // Полное восстановление при повышении уровня
          mana: newMaxMana
        }
        
        console.log(`📈 Новый уровень: ${newLevel}, новый макс HP: ${newMaxHealth}`)
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

  // Расчет опыта до следующего уровня
  static calculateExperienceToNextLevel(level: number): number {
    // Прогрессивная формула: каждый уровень требует больше опыта
    return Math.floor(100 * Math.pow(1.2, level - 1))
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
      const occupiedSlots = new Set(inventory?.map(item => item.slot_position) || [])
      const freeSlots = []
      
      for (let i = 1; i <= 100; i++) { // 100 слотов инвентаря
        if (!occupiedSlots.has(i)) {
          freeSlots.push(i)
        }
      }
      
      // Добавляем предметы в свободные слоты
      for (let i = 0; i < items.length && i < freeSlots.length; i++) {
        const item = items[i]
        const quantity = Math.floor(Math.random() * (item.quantity_max - item.quantity_min + 1)) + item.quantity_min
        
        const { error: insertError } = await (supabase as any)
          .from('character_inventory')
          .insert({
            character_id: characterId,
            item_id: item.item_id,
            slot_position: freeSlots[i],
            stack_size: quantity
          })
        
        if (insertError) {
          console.error('Error adding item to inventory:', insertError)
        } else {
          console.log(`📦 Добавлен предмет: ${item.item_id} x${quantity}`)
        }
      }
      
    } catch (error) {
      console.error('Error in addItemsToInventory:', error)
    }
  }
}
