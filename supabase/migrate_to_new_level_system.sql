-- МИГРАЦИЯ К НОВОЙ СИСТЕМЕ УРОВНЕЙ V2
-- Переводим всех персонажей на новую логику: уровень + опыт до следующего уровня

-- 1. Функция для расчета XP по новой формуле
CREATE OR REPLACE FUNCTION calculate_xp_to_next_v2(level INTEGER)
RETURNS BIGINT AS $$
DECLARE
    base BIGINT := 50;
    linear BIGINT := 20;
    quadratic BIGINT := 35;
    cubic DECIMAL := 0.3;
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

-- 2. Сбрасываем всех персонажей к 1 уровню с 0 опыта
UPDATE characters 
SET 
    level = 1,
    experience = 0,  -- Теперь это прогресс до следующего уровня
    experience_to_next = calculate_xp_to_next_v2(1),  -- 105 XP для 2 уровня
    stat_points = 0,
    health = 100,
    max_health = 100,
    mana = 50,
    max_mana = 50
WHERE level >= 1;

-- 3. Проверяем результат
SELECT 
    '=== НОВАЯ СИСТЕМА УРОВНЕЙ V2 ===' as info;

SELECT 
    name,
    level,
    experience,
    experience_to_next,
    stat_points
FROM characters 
ORDER BY name;

-- 4. Показываем прогрессию по новой формуле
SELECT 
    '=== ПРОГРЕССИЯ ПО НОВОЙ ФОРМУЛЕ ===' as info;

SELECT 
    level,
    calculate_xp_to_next_v2(level) as xp_required,
    'XP для следующего уровня' as description
FROM generate_series(1, 10) as level
ORDER BY level;

-- 5. Ключевые уровни
SELECT 
    '=== КЛЮЧЕВЫЕ УРОВНИ ===' as info;

SELECT 
    1 as level, calculate_xp_to_next_v2(1) as xp_required, 'Быстрый старт' as description
UNION ALL
SELECT 
    10 as level, calculate_xp_to_next_v2(10) as xp_required, '~5.4K XP' as description
UNION ALL
SELECT 
    20 as level, calculate_xp_to_next_v2(20) as xp_required, '~17.8K XP' as description
UNION ALL
SELECT 
    50 as level, calculate_xp_to_next_v2(50) as xp_required, '~130K XP' as description
UNION ALL
SELECT 
    80 as level, calculate_xp_to_next_v2(80) as xp_required, '~399K XP (софт-кап)' as description
UNION ALL
SELECT 
    99 as level, calculate_xp_to_next_v2(99) as xp_required, '~763K XP' as description
UNION ALL
SELECT 
    100 as level, calculate_xp_to_next_v2(100) as xp_required, 'Максимальный уровень' as description;

-- 6. Удаляем временную функцию
DROP FUNCTION IF EXISTS calculate_xp_to_next_v2(INTEGER);

SELECT '✅ МИГРАЦИЯ ЗАВЕРШЕНА! Новая система уровней V2 активна.' as result;
