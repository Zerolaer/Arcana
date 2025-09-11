-- ОБНОВЛЕНИЕ СИСТЕМЫ УРОВНЕЙ - ФИНАЛЬНАЯ ВЕРСИЯ
-- Устанавливаем новые требования к опыту для комфортной прокачки

-- 1. Обновляем experience_to_next для всех персонажей согласно новой формуле
UPDATE characters SET 
    experience_to_next = CASE level
        WHEN 1 THEN 55   -- 1→2
        WHEN 2 THEN 101  -- 2→3
        WHEN 3 THEN 168  -- 3→4
        WHEN 4 THEN 256  -- 4→5
        WHEN 5 THEN 368  -- 5→6
        WHEN 6 THEN 502  -- 6→7
        WHEN 7 THEN 659  -- 7→8
        WHEN 8 THEN 841  -- 8→9
        WHEN 9 THEN 1048 -- 9→10
        WHEN 10 THEN 1280 -- 10→11
        WHEN 11 THEN 1538 -- 11→12
        WHEN 12 THEN 1823 -- 12→13
        WHEN 13 THEN 2135 -- 13→14
        WHEN 14 THEN 2474 -- 14→15
        WHEN 15 THEN 2843 -- 15→16
        WHEN 16 THEN 3240 -- 16→17
        WHEN 17 THEN 3666 -- 17→18
        WHEN 18 THEN 4123 -- 18→19
        WHEN 19 THEN 4611 -- 19→20
        WHEN 20 THEN 5130 -- 20→21
        ELSE 6000 -- Для уровней выше 20
    END
WHERE level >= 1;

-- 2. Сбрасываем опыт всех персонажей к 0 (начинаем с чистого листа)
UPDATE characters SET 
    experience = 0
WHERE level >= 1;

-- 3. Проверяем результат
SELECT 
    '=== ОБНОВЛЕННАЯ СИСТЕМА УРОВНЕЙ ===' as info;

SELECT 
    name,
    level,
    experience,
    experience_to_next,
    'Требует ' || experience_to_next || ' опыта до следующего уровня' as progress_info
FROM characters 
ORDER BY level, name;

-- 4. Показываем сколько мобов нужно для уровней
SELECT 
    '=== ТРЕБОВАНИЯ ДЛЯ ПЕРВЫХ 10 УРОВНЕЙ ===' as info;

SELECT 
    level,
    experience_to_next,
    CEIL(experience_to_next / 12.0) as goblins_needed,
    CEIL(experience_to_next / 52.0) as spiders_needed
FROM characters 
WHERE level BETWEEN 1 AND 10
ORDER BY level;

SELECT '✅ СИСТЕМА УРОВНЕЙ ОБНОВЛЕНА!' as result;
SELECT 'Теперь прокачка комфортная: 5-31 гоблина для первых 5 уровней' as note;
