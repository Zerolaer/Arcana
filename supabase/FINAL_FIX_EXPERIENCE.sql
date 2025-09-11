-- ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ ОПЫТА
-- ПРОСТО СБРАСЫВАЕМ ВСЕХ ПЕРСОНАЖЕЙ К 1 УРОВНЮ

-- 1. СБРОС ВСЕХ ПЕРСОНАЖЕЙ К 1 УРОВНЮ С 0 ОПЫТА
UPDATE characters 
SET 
    level = 1,
    experience = 0,  -- Сбрасываем к 0
    experience_to_next = 105,  -- XP для 2 уровня по новой формуле
    stat_points = 0,
    health = 100,
    max_health = 100,
    mana = 50,
    max_mana = 50
WHERE level >= 1;

-- 2. Проверяем результат
SELECT 
    '=== ВСЕ ПЕРСОНАЖИ СБРОШЕНЫ К 1 УРОВНЮ ===' as info;

SELECT 
    name,
    level,
    experience,
    experience_to_next,
    stat_points
FROM characters 
ORDER BY name;

SELECT '✅ ГОТОВО! Все персонажи 1 уровня с 0 опыта.' as result;
