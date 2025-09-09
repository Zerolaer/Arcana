-- Отладка системы экипировки

-- 1. Проверяем, есть ли зелье в базе
SELECT 'Зелья в базе:' as info;
SELECT item_key, name, type, base_health, base_mana 
FROM items 
WHERE type = 'consumable';

-- 2. Проверяем текущий инвентарь
SELECT 'Текущий инвентарь:' as info;
SELECT 
    ci.slot_position,
    i.name,
    i.type,
    i.equipment_slot
FROM character_inventory ci
JOIN items i ON ci.item_id = i.id
WHERE ci.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692'
ORDER BY ci.slot_position;

-- 3. Проверяем экипировку
SELECT 'Текущая экипировка:' as info;
SELECT 
    ce.slot_type,
    i.name,
    i.type
FROM character_equipment ce
JOIN items i ON ce.item_id = i.id
WHERE ce.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692';

-- 4. Тестируем снятие меча
SELECT 'Тест снятия меча:' as test;
SELECT unequip_item(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    'weapon'
);

-- 5. Тестируем экипировку кожаной брони
SELECT 'Тест экипировки брони:' as test;
SELECT equip_item(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    'leather_armor',
    1
);

-- 6. Тестируем экипировку кольца
SELECT 'Тест экипировки кольца:' as test;
SELECT equip_item(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    'mystic_ring',
    6
);

-- 7. Проверяем результат экипировки
SELECT 'Результат экипировки:' as info;
SELECT 
    ce.slot_type,
    i.name,
    i.type
FROM character_equipment ce
JOIN items i ON ce.item_id = i.id
WHERE ce.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692';

-- 8. Проверяем инвентарь после экипировки
SELECT 'Инвентарь после экипировки:' as info;
SELECT 
    ci.slot_position,
    i.name,
    i.type
FROM character_inventory ci
JOIN items i ON ci.item_id = i.id
WHERE ci.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692'
ORDER BY ci.slot_position;
