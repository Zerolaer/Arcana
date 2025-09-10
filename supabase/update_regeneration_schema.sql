-- ============================================
-- ОБНОВЛЕНИЕ СХЕМЫ ДЛЯ СИСТЕМЫ РЕГЕНЕРАЦИИ
-- ============================================

-- Добавляем поля регенерации в таблицу characters
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS health_regen DECIMAL(5,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS mana_regen DECIMAL(5,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS stamina_regen DECIMAL(5,2) DEFAULT 1.0;

-- Обновляем существующих персонажей с базовой регенерацией (1.0 + бонусы)
UPDATE characters 
SET 
    health_regen = 1.0 + (vitality * 0.05) + (level * 0.02),
    mana_regen = 1.0 + (energy * 0.05) + (intelligence * 0.02) + (level * 0.01),
    stamina_regen = 1.0 + (dexterity * 0.08) + (vitality * 0.03) + (level * 0.02)
WHERE health_regen IS NULL OR mana_regen IS NULL OR stamina_regen IS NULL;

-- Создаем функции регенерации
\i supabase/regeneration_functions.sql

SELECT '✅ Схема регенерации обновлена!' as status;
