import { useState, useCallback } from 'react'

export interface ActiveSkillState {
  id: string
  isActive: boolean
  cooldown: number
  lastUsed: number
}

export function useActiveSkills() {
  const [activeSkills, setActiveSkills] = useState<Map<string, ActiveSkillState>>(new Map())

  // Активация/деактивация скилла
  const toggleSkill = useCallback((skillId: string, cooldown: number) => {
    setActiveSkills(prev => {
      const newMap = new Map(prev)
      const current = newMap.get(skillId)
      
      if (current) {
        // Переключаем состояние
        newMap.set(skillId, {
          ...current,
          isActive: !current.isActive
        })
      } else {
        // Добавляем новый скилл
        newMap.set(skillId, {
          id: skillId,
          isActive: true,
          cooldown,
          lastUsed: 0
        })
      }
      
      return newMap
    })
  }, [])

  // Получение активных скиллов
  const getActiveSkills = useCallback(() => {
    return Array.from(activeSkills.values())
      .filter(skill => skill.isActive)
      .map(skill => skill.id)
  }, [activeSkills])

  // Проверка доступности скилла
  const isSkillReady = useCallback((skillId: string) => {
    const skill = activeSkills.get(skillId)
    if (!skill || !skill.isActive) return false
    
    const now = Date.now()
    const timeSinceLastUse = now - skill.lastUsed
    return timeSinceLastUse >= skill.cooldown * 1000
  }, [activeSkills])

  // Использование скилла
  const useSkill = useCallback((skillId: string) => {
    setActiveSkills(prev => {
      const newMap = new Map(prev)
      const skill = newMap.get(skillId)
      
      if (skill && skill.isActive) {
        newMap.set(skillId, {
          ...skill,
          lastUsed: Date.now()
        })
      }
      
      return newMap
    })
  }, [])

  // Сброс всех скиллов
  const resetSkills = useCallback(() => {
    setActiveSkills(new Map())
  }, [])

  return {
    activeSkills: activeSkills,
    toggleSkill,
    getActiveSkills,
    isSkillReady,
    useSkill,
    resetSkills
  }
}
