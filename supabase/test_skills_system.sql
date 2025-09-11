-- Тестирование системы навыков
-- Проверяем что все таблицы и функции работают правильно

-- 1. Проверяем структуру таблиц
SELECT 'ПРОВЕРКА ТАБЛИЦ:' as test_section;

-- Проверяем пассивные навыки
SELECT 'passive_skills' as table_name, COUNT(*) as count FROM passive_skills;
SELECT 'active_skills' as table_name, COUNT(*) as count FROM active_skills;
SELECT 'character_passive_skills' as table_name, COUNT(*) as count FROM character_passive_skills;
SELECT 'character_active_skills' as table_name, COUNT(*) as count FROM character_active_skills;

-- 2. Проверяем данные навыков
SELECT 'ДАННЫЕ НАВЫКОВ:' as test_section;

-- Показываем только существующие колонки
SELECT 'passive_skills' as skill_type, name, level_requirement
FROM passive_skills 
ORDER BY level_requirement;

SELECT 'active_skills' as skill_type, name, level_requirement
FROM active_skills 
ORDER BY level_requirement;

-- 3. Проверяем функции
SELECT 'ПРОВЕРКА ФУНКЦИЙ:' as test_section;

-- Тестируем функцию получения пассивных навыков персонажа
-- (замените UUID на реальный ID персонажа)
/*
SELECT get_character_passive_skills('YOUR_CHARACTER_UUID_HERE') as passive_skills_result;
*/

-- Тестируем функцию получения активных навыков персонажа
-- (замените UUID на реальный ID персонажа)
/*
SELECT get_character_active_skills('YOUR_CHARACTER_UUID_HERE') as active_skills_result;
*/

-- 4. Проверяем изучение навыка
SELECT 'ТЕСТ ИЗУЧЕНИЯ НАВЫКА:' as test_section;

-- Найдем первого персонажа для теста
SELECT 
    'TEST_CHARACTER' as test_info,
    id,
    name,
    level,
    gold,
    class_id
FROM characters 
LIMIT 1;

-- Найдем первый доступный активный навык для теста
SELECT 
    'TEST_SKILL' as test_info,
    id,
    skill_key,
    name,
    cost,
    level_requirement,
    class_requirements
FROM active_skills 
ORDER BY level_requirement, cost
LIMIT 1;

-- 5. Проверяем функции (раскомментируйте для тестирования с реальными данными)
/*
-- Тест изучения навыка (замените UUID на реальные значения)
SELECT test_learn_skill(
    'YOUR_CHARACTER_UUID_HERE',
    'basic_strike'
) as learn_test_result;

-- Проверяем результат изучения
SELECT get_character_active_skills('YOUR_CHARACTER_UUID_HERE') as skills_after_learning;
*/

SELECT '✅ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО!' as result;
