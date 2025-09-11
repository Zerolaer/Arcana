-- Минимальная проверка таблиц навыков
-- Показывает только то, что точно существует

-- 1. Проверяем какие таблицы есть
SELECT 'ТАБЛИЦЫ НАВЫКОВ:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%skill%'
ORDER BY table_name;

-- 2. Проверяем структуру passive_skills
SELECT 'КОЛОНКИ passive_skills:' as info;
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'passive_skills'
ORDER BY ordinal_position;

-- 3. Проверяем структуру active_skills
SELECT 'КОЛОНКИ active_skills:' as info;
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'active_skills'
ORDER BY ordinal_position;

-- 4. Проверяем есть ли данные (только основные колонки)
SELECT 'ДАННЫЕ passive_skills:' as info;
SELECT id, name, level_requirement FROM passive_skills LIMIT 3;

SELECT 'ДАННЫЕ active_skills:' as info;
SELECT id, name, level_requirement FROM active_skills LIMIT 3;

-- 5. Проверяем количество записей
SELECT 'КОЛИЧЕСТВО ЗАПИСЕЙ:' as info;
SELECT 'passive_skills' as table_name, COUNT(*) as count FROM passive_skills
UNION ALL
SELECT 'active_skills' as table_name, COUNT(*) as count FROM active_skills;
