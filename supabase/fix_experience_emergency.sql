-- ЭКСТРЕННОЕ ИСПРАВЛЕНИЕ ОПЫТА
-- Сбрасываем опыт всех персонажей к правильным значениям

-- 1. Сбрасываем опыт всех персонажей
UPDATE characters 
SET 
    experience = 0,
    experience_to_next = 1000,
    level = 1,
    stat_points = 0
WHERE level >= 1;

-- 2. Проверяем результат
SELECT 
    '=== ИСПРАВЛЕННЫЕ ПЕРСОНАЖИ ===' as info;

SELECT 
    name,
    level,
    experience,
    experience_to_next,
    stat_points
FROM characters 
ORDER BY name;

SELECT '✅ ВСЕ ПЕРСОНАЖИ СБРОШЕНЫ К 1 УРОВНЮ!' as result;
