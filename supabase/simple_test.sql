-- Простой тест функций навыков
-- Проверяем что функции работают без ошибок

-- 1. Показываем первого персонажа
SELECT 'ПЕРВЫЙ ПЕРСОНАЖ:' as info;
SELECT 
    c.name,
    c.level,
    cc.name as class_name
FROM characters c
JOIN character_classes cc ON cc.id = c.class_id
LIMIT 1;

-- 2. Тестируем функцию get_skills_for_class
SELECT 'ТЕСТ get_skills_for_class:' as info;
SELECT get_skills_for_class('Archer') as archer_skills;

-- 3. Тестируем функцию get_character_class_skills для первого персонажа
SELECT 'ТЕСТ get_character_class_skills:' as info;
SELECT 
    c.name,
    get_character_class_skills(c.id) as skills
FROM characters c
LIMIT 1;

-- 4. Показываем структуру данных
SELECT 'СТРУКТУРА active_skills:' as info;
SELECT 
    skill_key,
    name,
    class_requirements
FROM active_skills 
LIMIT 2;

SELECT '✅ ПРОСТОЙ ТЕСТ ЗАВЕРШЕН!' as result;
