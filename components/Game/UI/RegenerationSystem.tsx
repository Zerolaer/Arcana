'use client'

import { useEffect, useCallback, useRef } from 'react'
import { Character } from '@/types/game'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

interface RegenerationSystemProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
  isInCombat?: boolean
}

export default function RegenerationSystem({ 
  character, 
  onUpdateCharacter, 
  isInCombat = false 
}: RegenerationSystemProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastRegenTime = useRef<number>(Date.now())

  // Функция для применения регенерации
  const applyRegeneration = useCallback(async () => {
    try {
      // Не регенерируем в бою
      if (isInCombat || character.is_in_combat) {
        return
      }

      // Проверяем, нужно ли регенерировать
      const needsHealthRegen = character.health < character.max_health
      const needsManaRegen = character.mana < character.max_mana
      const needsStaminaRegen = character.stamina < character.max_stamina

      if (!needsHealthRegen && !needsManaRegen && !needsStaminaRegen) {
        return
      }

      // Если регенерация не определена, устанавливаем базовые значения
      if (!character.health_regen || !character.mana_regen || !character.stamina_regen) {
        const baseHealthRegen = 1.0 + (character.vitality * 0.05) + (character.level * 0.02)
        const baseManaRegen = 1.0 + (character.energy * 0.05) + (character.intelligence * 0.02) + (character.level * 0.01)
        const baseStaminaRegen = 1.0 + (character.dexterity * 0.08) + (character.vitality * 0.03) + (character.level * 0.02)

        await onUpdateCharacter({
          health_regen: Math.round(baseHealthRegen * 100) / 100,
          mana_regen: Math.round(baseManaRegen * 100) / 100,
          stamina_regen: Math.round(baseStaminaRegen * 100) / 100
        })
        return
      }

      // Вызываем функцию регенерации из базы данных
      const { data, error } = await (supabase as any)
        .rpc('apply_regeneration', { p_character_id: character.id })

      if (error) {
        console.error('Error applying regeneration:', error)
        return
      }

      if (data?.success) {
        // Обновляем состояние персонажа
        const updates: Partial<Character> = {
          health: data.new_health,
          mana: data.new_mana,
          stamina: data.new_stamina
        }

        // Обновляем регенерацию, если она изменилась
        if (data.health_regen_rate !== character.health_regen) {
          updates.health_regen = data.health_regen_rate
        }
        if (data.mana_regen_rate !== character.mana_regen) {
          updates.mana_regen = data.mana_regen_rate
        }
        if (data.stamina_regen_rate !== character.stamina_regen) {
          updates.stamina_regen = data.stamina_regen_rate
        }

        await onUpdateCharacter(updates)

        // Показываем уведомление о регенерации (только если что-то восстановилось)
        if (data.health_restored > 0 || data.mana_restored > 0 || data.stamina_restored > 0) {
          const restored = []
          if (data.health_restored > 0) restored.push(`+${data.health_restored} HP`)
          if (data.mana_restored > 0) restored.push(`+${data.mana_restored} MP`)
          if (data.stamina_restored > 0) restored.push(`+${data.stamina_restored} Stamina`)
          
          if (restored.length > 0) {
            toast.success(restored.join(', '), {
              duration: 2000,
              position: 'bottom-right'
            })
          }
        }
      }
    } catch (error) {
      console.error('Error in regeneration system:', error)
    }
  }, [character, onUpdateCharacter, isInCombat])

  // Функция для пересчета регенерации при изменении экипировки
  const recalculateRegeneration = useCallback(async () => {
    try {
      const { data, error } = await (supabase as any)
        .rpc('calculate_character_regeneration', { p_character_id: character.id })

      if (error) {
        console.error('Error calculating regeneration:', error)
        return
      }

      if (data?.success) {
        const updates: Partial<Character> = {
          health_regen: data.health_regen,
          mana_regen: data.mana_regen,
          stamina_regen: data.stamina_regen
        }

        await onUpdateCharacter(updates)
      }
    } catch (error) {
      console.error('Error recalculating regeneration:', error)
    }
  }, [character.id, onUpdateCharacter])

  // Запускаем таймер регенерации
  useEffect(() => {
    // Очищаем предыдущий интервал
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Запускаем новый интервал каждую секунду
    intervalRef.current = setInterval(() => {
      applyRegeneration()
    }, 1000)

    // Очищаем интервал при размонтировании
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [applyRegeneration])

  // Пересчитываем регенерацию при изменении характеристик или экипировки
  useEffect(() => {
    recalculateRegeneration()
  }, [
    character.level,
    character.strength,
    character.dexterity,
    character.intelligence,
    character.vitality,
    character.energy,
    recalculateRegeneration
  ])

  // Компонент не рендерит ничего видимого
  return null
}
