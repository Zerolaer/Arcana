-- Тест изучения навыка
-- Проверяем весь процесс изучения навыка

-- 1. Находим первого персонажа для теста
SELECT 'ТЕСТОВЫЙ ПЕРСОНАЖ:' as info;

SELECT 
    c.id as character_id,
    c.name as character_name,
    c.level,
    c.gold,
    cc.name as class_name
FROM characters c
JOIN character_classes cc ON cc.id = c.class_id
LIMIT 1;

-- 2. Находим первый доступный навык для этого персонажа
SELECT 'ДОСТУПНЫЙ НАВЫК ДЛЯ ТЕСТА:' as info;

SELECT 
    a_skills.id as skill_id,
    a_skills.skill_key,
    a_skills.name as skill_name,
    a_skills.level_requirement,
    a_skills.class_requirements
FROM active_skills a_skills
JOIN characters c ON c.level >= a_skills.level_requirement
JOIN character_classes cc ON cc.id = c.class_id
WHERE a_skills.class_requirements @> ARRAY[cc.name]::VARCHAR[]
LIMIT 1;

-- 3. Тестируем функцию изучения навыка (замените UUID на реальные значения)
/*
-- Пример теста (раскомментируйте и замените UUID):
SELECT test_skill_learning(
    'YOUR_CHARACTER_UUID_HERE',
    'basic_strike'
) as learning_test_result;
*/

-- 4. Показываем текущее состояние изученных навыков
SELECT 'ТЕКУЩИЕ ИЗУЧЕННЫЕ НАВЫКИ:' as info;

SELECT 
    c.name as character_name,
    a_skills.name as skill_name,
    cas.is_learned,
    cas.learned_at
FROM character_active_skills cas
JOIN characters c ON c.id = cas.character_id
JOIN active_skills a_skills ON a_skills.id = cas.skill_id
WHERE cas.is_learned = true;

-- 5. Проверяем функцию get_character_class_skills
SELECT 'ТЕСТ get_character_class_skills:' as info;

SELECT 
    c.name as character_name,
    json_array_length(get_character_class_skills(c.id)) as skills_count,
    get_character_class_skills(c.id) as skills
FROM characters c
LIMIT 1;

SELECT '✅ ТЕСТ ИЗУЧЕНИЯ НАВЫКОВ ЗАВЕРШЕН!' as result;
