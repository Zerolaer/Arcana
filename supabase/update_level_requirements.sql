-- ОБНОВЛЕНИЕ ТРЕБОВАНИЙ К УРОВНЯМ
-- Увеличиваем требования опыта для медленной прокачки

-- 1. Функция для расчета XP по новой формуле (увеличенные требования)
CREATE OR REPLACE FUNCTION calculate_xp_to_next_v3(level INTEGER)
RETURNS BIGINT AS $$
DECLARE
    base BIGINT := 100;        -- Было 50, стало 100
    linear BIGINT := 50;       -- Было 20, стало 50
    quadratic BIGINT := 80;    -- Было 35, стало 80
    cubic DECIMAL := 0.5;      -- Было 0.3, стало 0.5
    soft_cap_level INTEGER := 80;
    soft_cap_multiplier DECIMAL := 1.2;
    formula DECIMAL;
    result BIGINT;
BEGIN
    IF level >= 100 THEN
        RETURN 0; -- На 100 уровне прокачка останавливается
    END IF;
    
    -- Основная формула: base + lin·L + quad·L² + cubic·L³
    formula := base + (linear * level) + (quadratic * level * level) + (cubic * level * level * level);
    
    -- Софт-кап после 80 уровня
    IF level >= soft_cap_level THEN
        formula := formula * soft_cap_multiplier;
    END IF;
    
    result := ROUND(formula);
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 2. Обновляем всех персонажей с новыми требованиями
UPDATE characters 
SET 
    experience_to_next = calculate_xp_to_next_v3(level)
WHERE level >= 1;

-- 3. Проверяем результат
SELECT 
    '=== НОВЫЕ ТРЕБОВАНИЯ К УРОВНЯМ ===' as info;

SELECT 
    name,
    level,
    experience,
    experience_to_next,
    stat_points
FROM characters 
ORDER BY level, name;

-- 4. Показываем прогрессию по новой формуле
SELECT 
    '=== ПРОГРЕССИЯ ПО НОВОЙ ФОРМУЛЕ (МЕДЛЕННАЯ) ===' as info;

SELECT 
    level,
    calculate_xp_to_next_v3(level) as xp_required,
    'XP для следующего уровня' as description
FROM generate_series(1, 15) as level
ORDER BY level;

-- 5. Показываем сколько мобов нужно для уровня
SELECT 
    '=== МОБОВ НУЖНО ДЛЯ УРОВНЯ (СРЕДНИЙ МОБ 15 XP) ===' as info;

SELECT 
    1 as level,
    calculate_xp_to_next_v3(1) as xp_required,
    15 as avg_xp_per_mob,
    CEIL(calculate_xp_to_next_v3(1)::DECIMAL / 15.0) as mobs_needed,
    'Мобов для следующего уровня' as description
UNION ALL
SELECT 
    2 as level,
    calculate_xp_to_next_v3(2) as xp_required,
    15 as avg_xp_per_mob,
    CEIL(calculate_xp_to_next_v3(2)::DECIMAL / 15.0) as mobs_needed,
    'Мобов для следующего уровня' as description
UNION ALL
SELECT 
    5 as level,
    calculate_xp_to_next_v3(5) as xp_required,
    15 as avg_xp_per_mob,
    CEIL(calculate_xp_to_next_v3(5)::DECIMAL / 15.0) as mobs_needed,
    'Мобов для следующего уровня' as description
UNION ALL
SELECT 
    10 as level,
    calculate_xp_to_next_v3(10) as xp_required,
    15 as avg_xp_per_mob,
    CEIL(calculate_xp_to_next_v3(10)::DECIMAL / 15.0) as mobs_needed,
    'Мобов для следующего уровня' as description;

-- 6. Удаляем временную функцию
DROP FUNCTION IF EXISTS calculate_xp_to_next_v3(INTEGER);

SELECT '✅ ТРЕБОВАНИЯ К УРОВНЯМ УВЕЛИЧЕНЫ! Прокачка стала медленнее.' as result;
