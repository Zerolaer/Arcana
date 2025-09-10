-- ============================================
-- ОБНОВЛЕНИЕ СХЕМЫ ДЛЯ СИСТЕМЫ РЕГЕНЕРАЦИИ
-- ============================================

-- Добавляем поля регенерации в таблицу characters
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS health_regen DECIMAL(5,2) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS mana_regen DECIMAL(5,2) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS stamina_regen DECIMAL(5,2) DEFAULT 2.0;

-- Обновляем существующих персонажей с базовой регенерацией
UPDATE characters 
SET 
    health_regen = 1.0 + (vitality * 0.1) + (level * 0.05),
    mana_regen = 0.5 + (energy * 0.08) + (intelligence * 0.03) + (level * 0.02),
    stamina_regen = 2.0 + (dexterity * 0.15) + (vitality * 0.05) + (level * 0.03)
WHERE health_regen IS NULL OR mana_regen IS NULL OR stamina_regen IS NULL;

-- Создаем функции регенерации
\i supabase/regeneration_functions.sql

SELECT '✅ Схема регенерации обновлена!' as status;
