-- Простая проверка структуры таблиц навыков
-- Без обращения к несуществующим колонкам

-- 1. Проверяем какие таблицы существуют
SELECT 'СУЩЕСТВУЮЩИЕ ТАБЛИЦЫ:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%skill%'
ORDER BY table_name;

-- 2. Проверяем структуру passive_skills
SELECT 'СТРУКТУРА passive_skills:' as info;
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'passive_skills'
ORDER BY ordinal_position;

-- 3. Проверяем структуру active_skills
SELECT 'СТРУКТУРА active_skills:' as info;
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'active_skills'
ORDER BY ordinal_position;

-- 4. Проверяем есть ли данные (только существующие колонки)
SELECT 'ДАННЫЕ В passive_skills:' as info;
SELECT * FROM passive_skills LIMIT 3;

SELECT 'ДАННЫЕ В active_skills:' as info;
SELECT * FROM active_skills LIMIT 3;
