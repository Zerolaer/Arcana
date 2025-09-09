-- Отладка связей в БД

-- 1. Проверяем персонажа
SELECT '=== ПЕРСОНАЖ ===' as info;
SELECT id, name, level FROM characters WHERE id = '66b45795-cef1-4ac6-8462-d3acd7729692';

-- 2. Проверяем предметы в инвентаре
SELECT '=== ИНВЕНТАРЬ ===' as info;
SELECT 
    ci.slot_position,
    ci.item_id,
    i.item_key,
    i.name,
    i.type,
    i.equipment_slot
FROM character_inventory ci
JOIN items i ON ci.item_id = i.id
WHERE ci.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692'
ORDER BY ci.slot_position;

-- 3. Проверяем экипировку
SELECT '=== ЭКИПИРОВКА ===' as info;
SELECT 
    ce.slot_type,
    ce.item_id,
    i.item_key,
    i.name,
    i.type,
    i.equipment_slot
FROM character_equipment ce
JOIN items i ON ce.item_id = i.id
WHERE ce.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692';

-- 4. Проверяем все предметы в базе
SELECT '=== ВСЕ ПРЕДМЕТЫ ===' as info;
SELECT 
    id,
    item_key,
    name,
    type,
    equipment_slot
FROM items
ORDER BY type, name;

-- 5. Тестируем функцию equip_item с деревянным мечом
SELECT '=== ТЕСТ EQUIP_ITEM ===' as info;
SELECT equip_item(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    'wooden_sword',
    0
);

-- 6. Проверяем результат
SELECT '=== РЕЗУЛЬТАТ ПОСЛЕ EQUIP ===' as info;
SELECT 
    ci.slot_position,
    i.name,
    i.type
FROM character_inventory ci
JOIN items i ON ci.item_id = i.id
WHERE ci.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692'
ORDER BY ci.slot_position;

SELECT 
    ce.slot_type,
    i.name,
    i.type
FROM character_equipment ce
JOIN items i ON ce.item_id = i.id
WHERE ce.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692';
