-- Тестируем функции с актуальными слотами из инвентаря

-- 1. Проверяем текущий инвентарь
SELECT 
    ci.slot_position,
    i.name,
    i.type,
    i.equipment_slot,
    i.base_health,
    i.base_mana
FROM character_inventory ci
JOIN items i ON ci.item_id = i.id
WHERE ci.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692'
ORDER BY ci.slot_position;

-- 2. Тестируем использование зелья здоровья (слот 10)
SELECT 'Тест зелья здоровья (слот 10):' as test;
SELECT use_consumable(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    10
);

-- 3. Тестируем использование зелья маны (слот 8) 
SELECT 'Тест зелья маны (слот 8):' as test;
SELECT use_consumable(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    8
);

-- 4. Проверяем экипировку
SELECT 'Текущая экипировка:' as test;
SELECT 
    ce.slot_type,
    i.name,
    i.type
FROM character_equipment ce
JOIN items i ON ce.item_id = i.id
WHERE ce.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692';

-- 5. Тестируем снятие деревянного меча
SELECT 'Тест снятия меча:' as test;
SELECT unequip_item(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    'weapon'
);

-- 6. Проверяем инвентарь после снятия меча
SELECT 'Инвентарь после снятия меча:' as test;
SELECT 
    ci.slot_position,
    i.name,
    i.type
FROM character_inventory ci
JOIN items i ON ci.item_id = i.id
WHERE ci.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692'
ORDER BY ci.slot_position;
