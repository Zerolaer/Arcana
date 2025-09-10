-- ============================================
-- ИСПРАВЛЕНИЕ РЕГЕНЕРАЦИИ ДЛЯ СУЩЕСТВУЮЩИХ ПЕРСОНАЖЕЙ
-- ============================================

-- Обновляем регенерацию для всех существующих персонажей
UPDATE characters 
SET 
    health_regen = 1.0 + (vitality * 0.05) + (level * 0.02),
    mana_regen = 1.0 + (energy * 0.05) + (intelligence * 0.02) + (level * 0.01),
    stamina_regen = 1.0 + (dexterity * 0.08) + (vitality * 0.03) + (level * 0.02),
    updated_at = NOW()
WHERE health_regen IS NULL OR mana_regen IS NULL OR stamina_regen IS NULL;

-- Показываем результат
SELECT 
    id,
    name,
    level,
    vitality,
    energy,
    intelligence,
    dexterity,
    health_regen,
    mana_regen,
    stamina_regen
FROM characters 
ORDER BY created_at DESC 
LIMIT 5;

SELECT '✅ Регенерация для существующих персонажей обновлена!' as status;
