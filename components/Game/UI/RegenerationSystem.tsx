'use client'

import { useEffect, useCallback, useRef } from 'react'
import { Character } from '@/types/game'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

interface RegenerationSystemProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>, silent?: boolean) => Promise<boolean>
  isInCombat?: boolean
}

export default function RegenerationSystem({ 
  character, 
  onUpdateCharacter, 
  isInCombat = false 
}: RegenerationSystemProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastRegenTime = useRef<number>(Date.now())
  const isUpdating = useRef<boolean>(false)

  // Функция для применения регенерации
  const applyRegeneration = useCallback(async () => {
    try {
      // Предотвращаем множественные одновременные обновления
      if (isUpdating.current) {
        return
      }

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
        isUpdating.current = true
        const baseHealthRegen = 1.0 + (character.vitality * 0.05) + (character.level * 0.02)
        const baseManaRegen = 1.0 + (character.energy * 0.05) + (character.intelligence * 0.02) + (character.level * 0.01)
        const baseStaminaRegen = 1.0 + (character.dexterity * 0.08) + (character.vitality * 0.03) + (character.level * 0.02)

        await onUpdateCharacter({
          health_regen: Math.round(baseHealthRegen * 100) / 100,
          mana_regen: Math.round(baseManaRegen * 100) / 100,
          stamina_regen: Math.round(baseStaminaRegen * 100) / 100
        }, true) // Тихое обновление
        isUpdating.current = false
        return
      }

      // Вызываем функцию регенерации из базы данных
      const { data, error } = await (supabase as any)
        .rpc('apply_regeneration', { p_character_id: character.id })

      if (error) {
        // Тихо обрабатываем ошибки регенерации
        return
      }

      if (data?.success) {
        // Обновляем состояние персонажа только если есть реальные изменения
        const updates: Partial<Character> = {}
        
        if (data.new_health !== character.health) {
          updates.health = data.new_health
        }
        if (data.new_mana !== character.mana) {
          updates.mana = data.new_mana
        }
        if (data.new_stamina !== character.stamina) {
          updates.stamina = data.new_stamina
        }

        // Обновляем регенерацию, если она изменилась (с небольшой погрешностью)
        if (data.health_regen_rate && Math.abs(data.health_regen_rate - (character.health_regen || 0)) > 0.01) {
          updates.health_regen = data.health_regen_rate
        }
        if (data.mana_regen_rate && Math.abs(data.mana_regen_rate - (character.mana_regen || 0)) > 0.01) {
          updates.mana_regen = data.mana_regen_rate
        }
        if (data.stamina_regen_rate && Math.abs(data.stamina_regen_rate - (character.stamina_regen || 0)) > 0.01) {
          updates.stamina_regen = data.stamina_regen_rate
        }

        // Обновляем только если есть изменения
        if (Object.keys(updates).length > 0) {
          isUpdating.current = true
          await onUpdateCharacter(updates, true) // Тихое обновление
          isUpdating.current = false
        }

        // Регенерация происходит тихо, без уведомлений
      }
    } catch (error) {
      // Тихо обрабатываем ошибки регенерации
    }
  }, [character, onUpdateCharacter, isInCombat])

  // Функция для пересчета регенерации при изменении экипировки
  const recalculateRegeneration = useCallback(async () => {
    try {
      const { data, error } = await (supabase as any)
        .rpc('calculate_character_regeneration', { p_character_id: character.id })

      if (error) {
        // Тихо обрабатываем ошибки расчета регенерации
        return
      }

      if (data?.success) {
        const updates: Partial<Character> = {}
        
        // Обновляем только если значения действительно изменились
        if (Math.abs(data.health_regen - (character.health_regen || 0)) > 0.01) {
          updates.health_regen = data.health_regen
        }
        if (Math.abs(data.mana_regen - (character.mana_regen || 0)) > 0.01) {
          updates.mana_regen = data.mana_regen
        }
        if (Math.abs(data.stamina_regen - (character.stamina_regen || 0)) > 0.01) {
          updates.stamina_regen = data.stamina_regen
        }

        // Обновляем только если есть изменения
        if (Object.keys(updates).length > 0) {
          isUpdating.current = true
          await onUpdateCharacter(updates, true) // Тихое обновление
          isUpdating.current = false
        }
      }
    } catch (error) {
      // Тихо обрабатываем ошибки пересчета регенерации
    }
  }, [character.id, character.health_regen, character.mana_regen, character.stamina_regen, onUpdateCharacter])

  // Запускаем таймер регенерации
  useEffect(() => {
    // Очищаем предыдущий интервал
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Запускаем новый интервал каждые 2 секунды (реже обновлений)
    intervalRef.current = setInterval(() => {
      applyRegeneration()
    }, 2000)

    // Очищаем интервал при размонтировании
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [applyRegeneration])

  // Пересчитываем регенерацию при изменении характеристик или экипировки
  useEffect(() => {
    // Только если регенерация не определена или равна 0
    if (!character.health_regen || !character.mana_regen || !character.stamina_regen) {
      // Добавляем небольшую задержку, чтобы избежать частых вызовов
      const timeoutId = setTimeout(() => {
        recalculateRegeneration()
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [
    character.level,
    character.strength,
    character.dexterity,
    character.intelligence,
    character.vitality,
    character.energy
  ])

  // Компонент не рендерит ничего видимого
  return null
}
