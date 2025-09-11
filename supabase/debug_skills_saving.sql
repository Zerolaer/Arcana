-- Отладка сохранения навыков
-- Проверяем почему навыки не сохраняются

-- 1. Проверяем есть ли данные в таблицах навыков
SELECT 'ДАННЫЕ В ТАБЛИЦАХ НАВЫКОВ:' as info;

SELECT 'passive_skills' as table_name, COUNT(*) as count FROM passive_skills
UNION ALL
SELECT 'active_skills' as table_name, COUNT(*) as count FROM active_skills
UNION ALL
SELECT 'character_passive_skills' as table_name, COUNT(*) as count FROM character_passive_skills
UNION ALL
SELECT 'character_active_skills' as table_name, COUNT(*) as count FROM character_active_skills;

-- 2. Показываем все активные навыки
SELECT 'ВСЕ АКТИВНЫЕ НАВЫКИ:' as info;

SELECT 
    id,
    skill_key,
    name,
    level_requirement,
    class_requirements
FROM active_skills 
ORDER BY level_requirement, name;

-- 3. Показываем всех персонажей
SELECT 'ПЕРСОНАЖИ:' as info;

SELECT 
    id,
    name,
    level,
    class_id
FROM characters
ORDER BY name;

-- 4. Проверяем есть ли изученные навыки
SELECT 'ИЗУЧЕННЫЕ НАВЫКИ:' as info;

SELECT 
    cas.character_id,
    cas.skill_id,
    cas.is_learned,
    cas.learned_at,
    c.name as character_name,
    a_skills.name as skill_name
FROM character_active_skills cas
LEFT JOIN characters c ON c.id = cas.character_id
LEFT JOIN active_skills a_skills ON a_skills.id = cas.skill_id
ORDER BY cas.character_id, cas.skill_id;

-- 5. Тестируем функцию изучения навыка (найдем первого персонажа и первый навык)
SELECT 'ТЕСТ ИЗУЧЕНИЯ НАВЫКА:' as info;

-- Найдем первого персонажа
WITH test_character AS (
    SELECT id, name, level, class_id FROM characters LIMIT 1
),
test_skill AS (
    SELECT id, skill_key, name FROM active_skills ORDER BY level_requirement LIMIT 1
)
SELECT 
    tc.name as character_name,
    ts.name as skill_name,
    ts.skill_key
FROM test_character tc, test_skill ts;

-- 6. Проверяем функции
SELECT 'ПРОВЕРКА ФУНКЦИЙ:' as info;

SELECT 
    proname as function_name,
    pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname IN ('learn_active_skill', 'get_character_class_skills', 'get_character_active_skills')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY proname;

SELECT '✅ ОТЛАДКА ЗАВЕРШЕНА!' as result;
