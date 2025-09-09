-- Тестируем экипировку с текущими предметами

-- 1. Проверяем текущий инвентарь
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

-- 2. Проверяем экипировку
SELECT 'Текущая экипировка:' as info;
SELECT 
    ce.slot_type,
    i.name,
    i.type
FROM character_equipment ce
JOIN items i ON ce.item_id = i.id
WHERE ce.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692';

-- 3. Тестируем снятие деревянного меча (если он экипирован)
SELECT 'Тест снятия меча:' as test;
SELECT unequip_item(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    'weapon'
);

-- 4. Тестируем экипировку кожаной брони (слот 1)
SELECT 'Тест экипировки брони:' as test;
SELECT equip_item(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    'leather_armor',
    1
);

-- 5. Тестируем экипировку кольца мистика (слот 6)
SELECT 'Тест экипировки кольца:' as test;
SELECT equip_item(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    'mystic_ring',
    6
);

-- 6. Проверяем результат
SELECT 'Результат после тестов:' as info;
SELECT 
    ce.slot_type,
    i.name,
    i.type
FROM character_equipment ce
JOIN items i ON ce.item_id = i.id
WHERE ce.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692';

-- 7. Добавляем зелья для тестирования
SELECT 'Добавляем зелья для теста:' as info;
INSERT INTO character_inventory (character_id, item_id, slot_position, stack_size, current_durability, upgrade_level)
SELECT 
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    i.id,
    20,
    1,
    NULL,
    0
FROM items i 
WHERE i.item_key = 'small_health_potion'
LIMIT 1;

-- 8. Тестируем зелье
SELECT 'Тест зелья здоровья:' as test;
SELECT use_consumable(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    20
);
