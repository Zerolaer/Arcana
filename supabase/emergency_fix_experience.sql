-- ЭКСТРЕННОЕ ИСПРАВЛЕНИЕ ОПЫТА - ПРОСТОЕ РЕШЕНИЕ
-- Сбрасываем ВСЕХ персонажей к 1 уровню с 0 опыта

-- 1. СБРОС ВСЕХ ПЕРСОНАЖЕЙ К 1 УРОВНЮ
UPDATE characters 
SET 
    level = 1,
    experience = 0,
    experience_to_next = 1000,
    stat_points = 0,
    health = 100,
    max_health = 100,
    mana = 50,
    max_mana = 50
WHERE level >= 1;

-- 2. Проверяем что получилось
SELECT 
    '=== ВСЕ ПЕРСОНАЖИ СБРОШЕНЫ К 1 УРОВНЮ ===' as info;

SELECT 
    name,
    level,
    experience,
    experience_to_next,
    stat_points,
    health,
    max_health
FROM characters 
ORDER BY name;

-- 3. Показываем правильную прогрессию
SELECT 
    '=== ПРАВИЛЬНАЯ ПРОГРЕССИЯ ===' as info;

SELECT 
    1 as level,
    0 as current_exp,
    1000 as exp_for_next_level,
    'Начальный уровень' as description
UNION ALL
SELECT 
    2 as level,
    1000 as current_exp,
    1150 as exp_for_next_level,
    'Нужно 1150 опыта для 3 уровня' as description
UNION ALL
SELECT 
    3 as level,
    2150 as current_exp,
    1322 as exp_for_next_level,
    'Нужно 1322 опыта для 4 уровня' as description;

SELECT '✅ ВСЕ ИСПРАВЛЕНО! Теперь все персонажи 1 уровня с 0 опыта.' as result;
