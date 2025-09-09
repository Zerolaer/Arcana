-- Тестируем данные инвентаря

-- 1. Проверяем что возвращает get_character_inventory
SELECT '=== GET_CHARACTER_INVENTORY ===' as info;
SELECT get_character_inventory('66b45795-cef1-4ac6-8462-d3acd7729692'::uuid);

-- 2. Проверяем структуру данных напрямую
SELECT '=== ПРЯМОЙ ЗАПРОС ===' as info;
SELECT 
    ci.slot_position,
    ci.item_id,
    i.id as item_uuid,
    i.item_key,
    i.name,
    i.type,
    i.equipment_slot
FROM character_inventory ci
JOIN items i ON ci.item_id = i.id
WHERE ci.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692'
ORDER BY ci.slot_position;

-- 3. Проверяем функцию get_character_inventory
SELECT '=== ФУНКЦИЯ GET_CHARACTER_INVENTORY ===' as info;
SELECT routine_definition 
FROM information_schema.routines 
WHERE routine_name = 'get_character_inventory';
