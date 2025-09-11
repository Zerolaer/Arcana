-- Тест функции изучения навыка
-- Проверяем что функция работает правильно

-- 1. Найдем первого персонажа для теста
SELECT 'ТЕСТОВЫЙ ПЕРСОНАЖ:' as info;
SELECT 
    id,
    name,
    level,
    gold
FROM characters 
LIMIT 1;

-- 2. Найдем первый активный навык для теста
SELECT 'ТЕСТОВЫЙ НАВЫК:' as info;
SELECT 
    id,
    skill_key,
    name,
    level_requirement
FROM active_skills 
ORDER BY level_requirement
LIMIT 1;

-- 3. Тестируем функцию (замените UUID на реальные значения)
/*
-- Пример теста (раскомментируйте и замените UUID):
SELECT learn_active_skill(
    'YOUR_CHARACTER_UUID_HERE',
    'basic_strike'
) as test_result;
*/

-- 4. Проверяем что функция существует
SELECT 'ПРОВЕРКА ФУНКЦИИ:' as info;
SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname = 'learn_active_skill'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

SELECT '✅ ТЕСТ ГОТОВ!' as result;
