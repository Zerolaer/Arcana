-- Базовый тест системы навыков
-- Только то, что точно работает

-- 1. Проверяем таблицы
SELECT 'ТАБЛИЦЫ:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE '%skill%';

-- 2. Проверяем колонки passive_skills
SELECT 'КОЛОНКИ passive_skills:' as info;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'passive_skills';

-- 3. Проверяем колонки active_skills
SELECT 'КОЛОНКИ active_skills:' as info;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'active_skills';

-- 4. Проверяем данные
SELECT 'ДАННЫЕ passive_skills:' as info;
SELECT COUNT(*) as count FROM passive_skills;

SELECT 'ДАННЫЕ active_skills:' as info;
SELECT COUNT(*) as count FROM active_skills;

-- 5. Показываем первые записи
SELECT 'ПЕРВЫЕ ЗАПИСИ passive_skills:' as info;
SELECT id, name FROM passive_skills LIMIT 2;

SELECT 'ПЕРВЫЕ ЗАПИСИ active_skills:' as info;
SELECT id, name FROM active_skills LIMIT 2;
