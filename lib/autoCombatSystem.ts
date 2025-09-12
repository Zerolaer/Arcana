import { Character } from '@/types/game'
import { Mob, FarmSpot } from '@/types/world'
import { ActiveSkill } from '@/types/skills'
import { getAvailableSkills } from './activeSkills'

export interface CombatResult {
  success: boolean
  experience: number
  gold: number
  items: any[]
  mobsDefeated: number
  totalDamage: number
  skillsUsed: string[]
  damageTaken: number
  manaUsed: number
}

export interface AutoCombatOptions {
  maxRounds: number
  usePotions: boolean
  stopOnLowHealth: boolean
  stopOnLowMana: boolean
}

export class AutoCombatSystem {
  private character: Character
  private spot: FarmSpot
  private activeSkills: string[]
  private skillCooldowns: Map<string, number>
  private options: AutoCombatOptions

  constructor(
    character: Character, 
    spot: FarmSpot, 
    activeSkills: string[], 
    options: AutoCombatOptions = {
      maxRounds: 100,
      usePotions: true,
      stopOnLowHealth: true,
      stopOnLowMana: false
    }
  ) {
    this.character = character
    this.spot = spot
    this.activeSkills = activeSkills
    this.skillCooldowns = new Map()
    this.options = options
  }

  // Основной метод автоматического боя
  async executeCombat(): Promise<CombatResult> {
    const result: CombatResult = {
      success: false,
      experience: 0,
      gold: 0,
      items: [],
      mobsDefeated: 0,
      totalDamage: 0,
      skillsUsed: [],
      damageTaken: 0,
      manaUsed: 0
    }

    // Проверяем, есть ли активные скиллы
    if (this.activeSkills.length === 0) {
      console.log('❌ Нет активных скиллов для боя!')
      return result
    }

    let currentMobs = [...this.spot.mobs]
    let currentHealth = this.character.health
    let currentMana = this.character.mana
    let round = 0

    console.log(`🤖 Начинаем автоматический бой с ${currentMobs.length} мобами, активных скиллов: ${this.activeSkills.length}`)

    while (currentMobs.length > 0 && round < this.options.maxRounds) {
      round++
      console.log(`🔄 Раунд ${round}, мобов осталось: ${currentMobs.length}`)

      // Проверяем условия остановки
      if (this.shouldStopCombat(currentHealth, currentMana)) {
        console.log('⏹️ Останавливаем бой по условиям')
        break
      }

      // Выбираем скилл для использования
      const skillToUse = this.selectSkill(currentMana)
      
      if (skillToUse) {
        // Используем скилл
        const skillResult = this.useSkill(skillToUse, currentMobs)
        currentMobs = skillResult.remainingMobs
        currentHealth = Math.max(0, currentHealth - skillResult.damageTaken)
        currentMana = Math.max(0, currentMana - skillResult.manaUsed)
        result.totalDamage += skillResult.damageDealt
        result.damageTaken += skillResult.damageTaken
        result.manaUsed += skillResult.manaUsed
        result.skillsUsed.push(skillToUse)
        
        // Обновляем кулдаун скилла
        this.markSkillUsed(skillToUse)
        
        console.log(`⚔️ Использован скилл ${skillToUse}, урон: ${skillResult.damageDealt}, получен урон: ${skillResult.damageTaken}, мана: ${skillResult.manaUsed}`)
      } else {
        // Базовая атака
        const basicAttack = this.basicAttack(currentMobs)
        currentMobs = basicAttack.remainingMobs
        currentHealth = Math.max(0, currentHealth - basicAttack.damageTaken)
        result.totalDamage += basicAttack.damageDealt
        result.damageTaken += basicAttack.damageTaken
        
        console.log(`👊 Базовая атака, урон: ${basicAttack.damageDealt}, получен урон: ${basicAttack.damageTaken}`)
      }

      // Удаляем мертвых мобов
      const aliveMobs = currentMobs.filter(mob => mob.health > 0)
      result.mobsDefeated += currentMobs.length - aliveMobs.length
      currentMobs = aliveMobs

      // Небольшая задержка для реалистичности
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Если все мобы побеждены
    if (currentMobs.length === 0) {
      result.success = true
      result.experience = this.spot.mobs.reduce((sum, mob) => sum + mob.experience_reward, 0)
      result.gold = this.spot.mobs.reduce((sum, mob) => sum + mob.gold_reward, 0)
      console.log(`✅ Бой завершен успешно! Опыт: ${result.experience}, Золото: ${result.gold}`)
    } else {
      console.log(`❌ Бой не завершен, мобов осталось: ${currentMobs.length}`)
    }

    return result
  }

  // Выбор скилла для использования
  private selectSkill(currentMana: number): string | null {
    const availableSkills = this.getAvailableSkills()
    
    for (const skillId of this.activeSkills) {
      const skill = availableSkills.find(s => s.id === skillId)
      if (skill && currentMana >= skill.mana_cost && this.isSkillReady(skillId)) {
        return skillId
      }
    }
    
    return null
  }

  // Проверка готовности скилла (кулдаун)
  private isSkillReady(skillId: string): boolean {
    const skillData = this.getAvailableSkills().find(s => s.id === skillId)
    if (!skillData) return false
    
    const lastUsed = this.skillCooldowns.get(skillId) || 0
    const now = Date.now()
    const timeSinceLastUse = now - lastUsed
    
    return timeSinceLastUse >= skillData.cooldown * 1000
  }

  // Использование скилла (обновление кулдауна)
  private markSkillUsed(skillId: string): void {
    this.skillCooldowns.set(skillId, Date.now())
  }

  // Получение доступных скиллов
  private getAvailableSkills(): ActiveSkill[] {
    // Временное решение - используем имя персонажа для определения класса
    // Это нужно будет исправить, получив название класса из базы данных
    const name = this.character.name?.toLowerCase() || ''
    let className = 'archer' // fallback
    
    if (name.includes('лучник') || name.includes('archer')) className = 'archer'
    else if (name.includes('маг') || name.includes('mage')) className = 'mage'
    else if (name.includes('берсерк') || name.includes('berserker')) className = 'berserker'
    else if (name.includes('ассасин') || name.includes('assassin')) className = 'assassin'
    
    // Пока используем только первый скил (автоматически изученный)
    // В будущем нужно будет получать изученные скиллы из базы данных
    return getAvailableSkills(className, this.character.level, [])
  }

  // Использование скилла
  private useSkill(skillId: string, mobs: Mob[]): {
    remainingMobs: Mob[]
    damageDealt: number
    damageTaken: number
    manaUsed: number
  } {
    const skill = this.getAvailableSkills().find(s => s.id === skillId)
    if (!skill) {
      return { remainingMobs: mobs, damageDealt: 0, damageTaken: 0, manaUsed: 0 }
    }

    let totalDamage = 0
    let totalDamageTaken = 0
    const remainingMobs = [...mobs]

    // Определяем цели для атаки
    const targets = this.getTargets(skill, mobs)

    // Атакуем каждую цель
    for (const target of targets) {
      const damage = this.calculateDamage(skill, target)
      const mobIndex = remainingMobs.findIndex(m => m.id === target.id)
      
      if (mobIndex !== -1) {
        remainingMobs[mobIndex].health = Math.max(0, remainingMobs[mobIndex].health - damage)
        totalDamage += damage
      }
    }

    // Мобы атакуют в ответ
    for (const mob of remainingMobs) {
      if (mob.health > 0) {
        const mobDamage = this.calculateMobDamage(mob)
        totalDamageTaken += mobDamage
        console.log(`👹 ${mob.name} наносит урон: ${mobDamage} (атака: ${mob.attack}, защита: ${this.character.defense})`)
      }
    }

    return {
      remainingMobs,
      damageDealt: totalDamage,
      damageTaken: totalDamageTaken,
      manaUsed: skill.mana_cost
    }
  }

  // Базовая атака
  private basicAttack(mobs: Mob[]): {
    remainingMobs: Mob[]
    damageDealt: number
    damageTaken: number
  } {
    const target = mobs[0] // Атакуем первого моба
    if (!target) {
      return { remainingMobs: mobs, damageDealt: 0, damageTaken: 0 }
    }

    const damage = this.calculateBasicDamage(target)
    const remainingMobs = [...mobs]
    const mobIndex = remainingMobs.findIndex(m => m.id === target.id)
    
    if (mobIndex !== -1) {
      remainingMobs[mobIndex].health = Math.max(0, remainingMobs[mobIndex].health - damage)
    }

    // Мобы атакуют в ответ
    let totalDamageTaken = 0
    for (const mob of remainingMobs) {
      if (mob.health > 0) {
        const mobDamage = this.calculateMobDamage(mob)
        totalDamageTaken += mobDamage
        console.log(`👹 ${mob.name} наносит урон (базовая атака): ${mobDamage} (атака: ${mob.attack}, защита: ${this.character.defense})`)
      }
    }

    return {
      remainingMobs,
      damageDealt: damage,
      damageTaken: totalDamageTaken
    }
  }

  // Получение целей для атаки
  private getTargets(skill: ActiveSkill, mobs: Mob[]): Mob[] {
    // Если скилл AOE, атакуем всех мобов
    if (skill.skill_type === 'aoe') {
      return mobs.filter(mob => mob.health > 0)
    }
    
    // Иначе атакуем первого живого моба
    return mobs.filter(mob => mob.health > 0).slice(0, 1)
  }

  // Расчет урона от скилла
  private calculateDamage(skill: ActiveSkill, target: Mob): number {
    const baseDamage = skill.base_damage
    const statBonus = this.getStatBonus(skill.scaling_stat)
    const totalDamage = baseDamage + statBonus
    
    // Простое применение защиты
    const finalDamage = Math.max(1, totalDamage - target.defense)
    
    console.log(`⚔️ Скилл ${skill.name}: базовый урон ${baseDamage} + бонус стата ${statBonus} = ${totalDamage}, итого ${Math.round(finalDamage)} (защита моба: ${target.defense})`)
    
    return Math.round(finalDamage)
  }

  // Расчет урона от базовой атаки
  private calculateBasicDamage(target: Mob): number {
    const baseDamage = this.character.attack_damage
    const finalDamage = Math.max(1, baseDamage - target.defense)
    
    console.log(`👊 Базовая атака: урон ${baseDamage}, итого ${Math.round(finalDamage)} (защита моба: ${target.defense})`)
    
    return Math.round(finalDamage)
  }

  // Расчет урона от моба
  private calculateMobDamage(mob: Mob): number {
    const baseDamage = mob.attack
    const finalDamage = Math.max(1, baseDamage - this.character.defense)
    
    return Math.round(finalDamage)
  }

  // Получение бонуса от стата
  private getStatBonus(stat: string): number {
    const statValue = this.character[stat as keyof Character] as number || 0
    return Math.round(statValue * 2.0) // Увеличиваем бонус от статов для скиллов
  }

  // Проверка условий остановки
  private shouldStopCombat(health: number, mana: number): boolean {
    if (this.options.stopOnLowHealth && health < this.character.max_health * 0.2) {
      return true
    }
    
    if (this.options.stopOnLowMana && mana < this.character.max_mana * 0.1) {
      return true
    }
    
    return false
  }
}
