-- Финальный тест системы навыков
-- Только то что точно работает

-- 1. Проверяем таблицы
SELECT 'ТАБЛИЦЫ НАВЫКОВ:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE '%skill%'
ORDER BY table_name;

-- 2. Проверяем количество записей
SELECT 'КОЛИЧЕСТВО ЗАПИСЕЙ:' as info;
SELECT 'passive_skills' as table_name, COUNT(*) as count FROM passive_skills
UNION ALL
SELECT 'active_skills' as table_name, COUNT(*) as count FROM active_skills
UNION ALL
SELECT 'character_passive_skills' as table_name, COUNT(*) as count FROM character_passive_skills
UNION ALL
SELECT 'character_active_skills' as table_name, COUNT(*) as count FROM character_active_skills;

-- 3. Показываем первые навыки
SELECT 'ПЕРВЫЕ ПАССИВНЫЕ НАВЫКИ:' as info;
SELECT id, name, level_requirement FROM passive_skills ORDER BY level_requirement LIMIT 3;

SELECT 'ПЕРВЫЕ АКТИВНЫЕ НАВЫКИ:' as info;
SELECT id, name, level_requirement FROM active_skills ORDER BY level_requirement LIMIT 3;

-- 4. Проверяем функции
SELECT 'ПРОВЕРКА ФУНКЦИЙ:' as info;
SELECT 'learn_active_skill' as function_name, 'EXISTS' as status 
WHERE EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'learn_active_skill')
UNION ALL
SELECT 'get_character_active_skills' as function_name, 'EXISTS' as status 
WHERE EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_character_active_skills')
UNION ALL
SELECT 'get_character_passive_skills' as function_name, 'EXISTS' as status 
WHERE EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_character_passive_skills');

SELECT '✅ ТЕСТ ЗАВЕРШЕН!' as result;
