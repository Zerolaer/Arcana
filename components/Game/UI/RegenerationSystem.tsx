'use client'

import { useEffect, useCallback, useRef } from 'react'
import { Character } from '@/types/game'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { calculateCharacterStats } from '@/lib/characterStats'

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

      // Используем рассчитанные характеристики
      const calculatedStats = calculateCharacterStats(character)

      // Проверяем, нужно ли регенерировать
      const needsHealthRegen = character.health < calculatedStats.max_health
      const needsManaRegen = character.mana < calculatedStats.max_mana

      if (!needsHealthRegen && !needsManaRegen) {
        return
      }

      // Используем рассчитанные значения регенерации
      const healthRegen = calculatedStats.health_regen
      const manaRegen = calculatedStats.mana_regen

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
        // Обновляем регенерацию, если она изменилась (с небольшой погрешностью)
        if (data.health_regen_rate && Math.abs(data.health_regen_rate - (character.health_regen || 0)) > 0.01) {
          updates.health_regen = data.health_regen_rate
        }
        if (data.mana_regen_rate && Math.abs(data.mana_regen_rate - (character.mana_regen || 0)) > 0.01) {
          updates.mana_regen = data.mana_regen_rate
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
  }, [character.id, character.health, character.mana, character.is_in_combat, onUpdateCharacter, isInCombat])

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
        // Убрали stamina_regen из новой системы

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
  }, [character.id, character.health_regen, character.mana_regen, onUpdateCharacter])

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
    if (!character.health_regen || !character.mana_regen) {
      // Добавляем небольшую задержку, чтобы избежать частых вызовов
      const timeoutId = setTimeout(() => {
        recalculateRegeneration()
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [
    character.level,
    character.strength,
    character.agility,
    character.intelligence,
    character.endurance,
    character.spell_power
  ])

  // Компонент не рендерит ничего видимого
  return null
}
