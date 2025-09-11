-- ОЧИСТКА БАЗЫ ДАННЫХ ОТ ЛИШНИХ ТАБЛИЦ
-- Удаляем дублирующиеся и устаревшие таблицы из Supabase

-- 1. Удаляем дублирующиеся таблицы
DROP TABLE IF EXISTS character_equipment_new CASCADE;
DROP TABLE IF EXISTS character_inventory_new CASCADE;
DROP TABLE IF EXISTS combat_logs CASCADE;
DROP TABLE IF EXISTS farm_spots CASCADE;

-- 2. Удаляем устаревшие системы
DROP TABLE IF EXISTS continents CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS game_events CASCADE;

-- 3. Удаляем старую систему лута
DROP TABLE IF EXISTS item_loot_pool_items CASCADE;
DROP TABLE IF EXISTS item_loot_pools CASCADE;
DROP TABLE IF EXISTS item_stats CASCADE;
DROP TABLE IF EXISTS mob_loot CASCADE;

-- 4. Проверяем что осталось
SELECT '=== ОСТАВШИЕСЯ ТАБЛИЦЫ ===' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 5. Считаем количество записей в основных таблицах
SELECT '=== СТАТИСТИКА ТАБЛИЦ ===' as info;
SELECT 
    'characters' as table_name, COUNT(*) as records FROM characters
UNION ALL
SELECT 
    'items' as table_name, COUNT(*) as records FROM items
UNION ALL
SELECT 
    'character_inventory' as table_name, COUNT(*) as records FROM character_inventory
UNION ALL
SELECT 
    'character_equipment' as table_name, COUNT(*) as records FROM character_equipment
ORDER BY table_name;
