-- БЫСТРОЕ ИСПРАВЛЕНИЕ ТЕКУЩЕГО ПЕРСОНАЖА
-- Сбрасываем опыт персонажа к правильным значениям для его уровня

-- 1. Сбрасываем опыт всех персонажей к значениям соответствующим их уровню
UPDATE characters 
SET 
    experience = CASE 
        WHEN level = 1 THEN 0
        WHEN level = 2 THEN 1000  -- Опыт для достижения 2 уровня
        WHEN level = 3 THEN 2150  -- 1000 + 1150
        WHEN level = 4 THEN 3472  -- 2150 + 1322
        ELSE 0  -- Для остальных уровней сбрасываем к 0
    END,
    experience_to_next = CASE 
        WHEN level = 1 THEN 1000
        WHEN level = 2 THEN 1150
        WHEN level = 3 THEN 1322
        WHEN level = 4 THEN 1520
        ELSE 1000
    END
WHERE level BETWEEN 1 AND 4;

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
ORDER BY level, name;

SELECT '✅ ПЕРСОНАЖИ ИСПРАВЛЕНЫ!' as result;
