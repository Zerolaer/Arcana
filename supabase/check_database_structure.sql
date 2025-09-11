-- ПРОВЕРКА СТРУКТУРЫ БАЗЫ ДАННЫХ
-- Сначала посмотрим что у нас есть в Supabase

-- 1. Все таблицы
SELECT '=== ВСЕ ТАБЛИЦЫ ===' as info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Все функции
SELECT '=== ВСЕ ФУНКЦИИ ===' as info;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;

-- 3. Все представления (views)
SELECT '=== ВСЕ ПРЕДСТАВЛЕНИЯ ===' as info;
SELECT 
    table_name as view_name
FROM information_schema.views 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 4. Все триггеры
SELECT '=== ВСЕ ТРИГГЕРЫ ===' as info;
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
ORDER BY event_object_table, trigger_name;

-- 5. Размер таблиц
SELECT '=== РАЗМЕР ТАБЛИЦ ===' as info;
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
