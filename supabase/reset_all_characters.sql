-- ПОЛНЫЙ СБРОС ВСЕХ ПЕРСОНАЖЕЙ
-- Сбрасываем всех персонажей к 1 уровню с 0 опыта

-- 1. СБРОС ВСЕХ ПЕРСОНАЖЕЙ К 1 УРОВНЮ С 0 ОПЫТА
UPDATE characters 
SET 
    level = 1,
    experience = 0,
    experience_to_next = 230,  -- XP для 2 уровня по новой формуле
    stat_points = 0,
    health = 100,
    max_health = 100,
    mana = 50,
    max_mana = 50,
    gold = 100  -- Базовое золото
WHERE level >= 1;

-- 2. Проверяем результат
SELECT 
    '=== ВСЕ ПЕРСОНАЖИ СБРОШЕНЫ ===' as info;

SELECT 
    name,
    level,
    experience,
    experience_to_next,
    stat_points,
    gold
FROM characters 
ORDER BY name;

-- 3. Показываем прогрессию
SELECT 
    '=== ПРОГРЕССИЯ ПО НОВОЙ ФОРМУЛЕ ===' as info;

SELECT 
    1 as level,
    0 as current_exp,
    230 as xp_for_next,
    'Начальный уровень' as description
UNION ALL
SELECT 
    2 as level,
    230 as current_exp,
    330 as xp_for_next,
    'Нужно 330 XP для 3 уровня' as description
UNION ALL
SELECT 
    3 as level,
    560 as current_exp,
    450 as xp_for_next,
    'Нужно 450 XP для 4 уровня' as description;

SELECT '✅ ГОТОВО! Все персонажи 1 уровня с 0 опыта.' as result;
