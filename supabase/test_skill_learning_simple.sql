-- Простой тест изучения навыка
-- Проверяем весь процесс от начала до конца

-- 1. Находим первого персонажа
SELECT 'ПЕРВЫЙ ПЕРСОНАЖ:' as info;

SELECT 
    id as character_id,
    name as character_name,
    level,
    gold,
    class_id
FROM characters
LIMIT 1;

-- 2. Находим первый активный навык
SELECT 'ПЕРВЫЙ АКТИВНЫЙ НАВЫК:' as info;

SELECT 
    id as skill_id,
    skill_key,
    name as skill_name,
    level_requirement,
    class_requirements
FROM active_skills
ORDER BY level_requirement, name
LIMIT 1;

-- 3. Очищаем изученные навыки для тестирования
DELETE FROM character_active_skills;

-- 4. Показываем что таблица очищена
SELECT 'ТАБЛИЦА ОЧИЩЕНА:' as info;
SELECT COUNT(*) as learned_skills_count FROM character_active_skills;

-- 5. Тестируем изучение навыка (замените UUID на реальные значения из шагов 1 и 2)
/*
-- Пример теста (раскомментируйте и замените UUID):
SELECT learn_active_skill(
    'YOUR_CHARACTER_UUID_HERE',
    'basic_strike'
) as learning_result;
*/

-- 6. Проверяем результат изучения
SELECT 'РЕЗУЛЬТАТ ИЗУЧЕНИЯ:' as info;

SELECT 
    cas.character_id,
    cas.skill_id,
    cas.is_learned,
    cas.learned_at,
    c.name as character_name,
    a_skills.name as skill_name
FROM character_active_skills cas
LEFT JOIN characters c ON c.id = cas.character_id
LEFT JOIN active_skills a_skills ON a_skills.id = cas.skill_id;

-- 7. Тестируем функцию получения навыков персонажа
SELECT 'НАВЫКИ ПЕРСОНАЖА:' as info;

SELECT 
    c.name as character_name,
    get_character_class_skills(c.id) as skills
FROM characters c
LIMIT 1;

SELECT '✅ ТЕСТ ГОТОВ!' as result;
