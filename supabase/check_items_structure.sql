-- Проверяем структуру таблицы items

SELECT '=== СТРУКТУРА ТАБЛИЦЫ ITEMS ===' as info;
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'items' 
ORDER BY ordinal_position;

-- Проверяем данные в таблице items
SELECT '=== ДАННЫЕ В ТАБЛИЦЕ ITEMS ===' as info;
SELECT 
    id,
    item_key,
    name,
    type,
    equipment_slot
FROM items 
LIMIT 5;
