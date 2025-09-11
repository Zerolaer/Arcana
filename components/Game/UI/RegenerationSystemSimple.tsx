'use client'

import { useEffect, useRef, useCallback } from 'react'
import { Character } from '@/types/game'
import { calculateCharacterStats } from '@/lib/characterStats'

interface RegenerationSystemSimpleProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
  isInCombat?: boolean
}

export default function RegenerationSystemSimple({ 
  character, 
  onUpdateCharacter, 
  isInCombat = false 
}: RegenerationSystemSimpleProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
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

      // Рассчитываем восстановление
      const healthRegen = calculatedStats.health_regen
      const manaRegen = calculatedStats.mana_regen

      // Применяем регенерацию
      const updates: Partial<Character> = {}
      
      if (needsHealthRegen) {
        const newHealth = Math.min(
          character.health + healthRegen,
          calculatedStats.max_health
        )
        if (newHealth !== character.health) {
          updates.health = newHealth
        }
      }
      
      if (needsManaRegen) {
        const newMana = Math.min(
          character.mana + manaRegen,
          calculatedStats.max_mana
        )
        if (newMana !== character.mana) {
          updates.mana = newMana
        }
      }

      // Обновляем только если есть изменения
      if (Object.keys(updates).length > 0) {
        isUpdating.current = true
        await onUpdateCharacter(updates)
        isUpdating.current = false
      }

    } catch (error) {
      console.error('Ошибка регенерации:', error)
    }
  }, [character, isInCombat, onUpdateCharacter])

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

  // Компонент не рендерит ничего видимого
  return null
}
