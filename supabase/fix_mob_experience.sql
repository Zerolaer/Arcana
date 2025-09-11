-- ИСПРАВЛЕНИЕ ОПЫТА МОБОВ
-- Снижаем опыт чтобы прокачка была медленнее

-- 1. Обновляем опыт мобов (снижаем в 5-10 раз)
UPDATE mobs 
SET 
    experience_reward = CASE 
        WHEN level = 1 THEN 5      -- Было 15, стало 5
        WHEN level = 3 THEN 8      -- Было 35, стало 8  
        WHEN level = 5 THEN 12     -- Было 55, стало 12
        WHEN level = 8 THEN 18     -- Было 85, стало 18
        WHEN level = 10 THEN 22    -- Было 65, стало 22
        WHEN level = 15 THEN 35    -- Было 150, стало 35
        WHEN level = 18 THEN 45    -- Было 180, стало 45
        WHEN level = 20 THEN 55    -- Было 200, стало 55
        WHEN level = 25 THEN 75    -- Было 280, стало 75
        WHEN level = 30 THEN 95    -- Было 400, стало 95
        ELSE experience_reward     -- Остальные не трогаем
    END
WHERE level BETWEEN 1 AND 30;

-- 2. Проверяем результат
SELECT 
    '=== ОБНОВЛЕННЫЕ НАГРАДЫ МОБОВ ===' as info;

SELECT 
    name,
    level,
    experience_reward,
    gold_reward,
    'XP за убийство' as description
FROM mobs 
WHERE level BETWEEN 1 AND 30
ORDER BY level;

-- 3. Показываем сколько мобов нужно для уровня
SELECT 
    '=== МОБОВ НУЖНО ДЛЯ УРОВНЯ ===' as info;

SELECT 
    1 as level,
    105 as xp_required,
    5 as xp_per_mob,
    CEIL(105.0 / 5.0) as mobs_needed,
    'Слайм 1 уровня' as mob_type
UNION ALL
SELECT 
    2 as level,
    120 as xp_required,
    8 as xp_per_mob,
    CEIL(120.0 / 8.0) as mobs_needed,
    'Волк 3 уровня' as mob_type
UNION ALL
SELECT 
    3 as level,
    140 as xp_required,
    12 as xp_per_mob,
    CEIL(140.0 / 12.0) as mobs_needed,
    'Паук 5 уровня' as mob_type
UNION ALL
SELECT 
    5 as level,
    180 as xp_required,
    18 as xp_per_mob,
    CEIL(180.0 / 18.0) as mobs_needed,
    'Орк 8 уровня' as mob_type;

SELECT '✅ ОПЫТ МОБОВ СБАЛАНСИРОВАН! Теперь нужно убивать больше мобов для уровня.' as result;
