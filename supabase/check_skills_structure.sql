-- Проверка структуры таблиц навыков
-- Показывает какие колонки есть и какие нужно добавить

SELECT 'СТРУКТУРА ТАБЛИЦЫ passive_skills:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'passive_skills'
ORDER BY ordinal_position;

SELECT 'СТРУКТУРА ТАБЛИЦЫ active_skills:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'active_skills'
ORDER BY ordinal_position;

-- Проверяем есть ли данные
SELECT 'ДАННЫЕ В ТАБЛИЦАХ:' as info;
SELECT 'passive_skills' as table_name, COUNT(*) as count FROM passive_skills;
SELECT 'active_skills' as table_name, COUNT(*) as count FROM active_skills;

-- Показываем первые записи
SELECT 'ПЕРВЫЕ ЗАПИСИ passive_skills:' as info;
SELECT * FROM passive_skills LIMIT 3;

SELECT 'ПЕРВЫЕ ЗАПИСИ active_skills:' as info;
SELECT * FROM active_skills LIMIT 3;
