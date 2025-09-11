-- ОБНОВЛЕНИЕ СИСТЕМЫ ОПЫТА ДЛЯ СУЩЕСТВУЮЩИХ ПЕРСОНАЖЕЙ
-- Применяем новую систему прогрессии уровней

-- 1. Функция для расчета опыта по новой системе
CREATE OR REPLACE FUNCTION calculate_experience_for_level(level INTEGER)
RETURNS BIGINT AS $$
DECLARE
    base_experience BIGINT := 1000;
    exponential_factor DECIMAL := 1.15;
    linear_factor BIGINT := 500;
    exponential_part BIGINT;
    linear_part BIGINT;
BEGIN
    IF level <= 1 THEN
        RETURN 0;
    END IF;
    
    exponential_part := FLOOR(base_experience * POWER(exponential_factor, level - 2));
    linear_part := linear_factor * (level - 2);
    
    RETURN exponential_part + linear_part;
END;
$$ LANGUAGE plpgsql;

-- 2. Функция для расчета общего опыта для уровня
CREATE OR REPLACE FUNCTION calculate_total_experience_for_level(level INTEGER)
RETURNS BIGINT AS $$
DECLARE
    total BIGINT := 0;
    i INTEGER;
BEGIN
    FOR i IN 2..level LOOP
        total := total + calculate_experience_for_level(i);
    END LOOP;
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- 3. Обновляем существующих персонажей
UPDATE characters 
SET 
    -- Пересчитываем experience_to_next по новой системе
    experience_to_next = calculate_experience_for_level(level + 1),
    
    -- Если у персонажа есть опыт, но он меньше требуемого для уровня
    -- то устанавливаем опыт в соответствии с уровнем
    experience = GREATEST(
        experience, 
        calculate_total_experience_for_level(level)
    )
WHERE level > 1;

-- 4. Для персонажей 1 уровня устанавливаем правильные значения
UPDATE characters 
SET 
    experience = 0,
    experience_to_next = 1000,
    level = 1
WHERE level = 1;

-- 5. Проверяем результат
SELECT 
    '=== ОБНОВЛЕННЫЕ ПЕРСОНАЖИ ===' as info;

SELECT 
    name,
    level,
    experience,
    experience_to_next,
    calculate_total_experience_for_level(level) as expected_total_exp,
    experience >= calculate_total_experience_for_level(level) as exp_valid
FROM characters 
ORDER BY level DESC, experience DESC;

-- 6. Показываем прогрессию для первых 10 уровней
SELECT 
    '=== ПРОГРЕССИЯ ОПЫТА ===' as info;

SELECT 
    level,
    calculate_experience_for_level(level + 1) as exp_required,
    calculate_total_experience_for_level(level) as total_exp
FROM generate_series(1, 10) as level
ORDER BY level;

-- 7. Удаляем временные функции
DROP FUNCTION IF EXISTS calculate_experience_for_level(INTEGER);
DROP FUNCTION IF EXISTS calculate_total_experience_for_level(INTEGER);

SELECT '✅ СИСТЕМА ОПЫТА ОБНОВЛЕНА!' as result;
