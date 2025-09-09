-- Тестируем экипировку с текущими предметами

-- 1. Проверяем текущую экипировку
SELECT 'Текущая экипировка:' as info;
SELECT 
    ce.slot_type,
    i.name,
    i.type
FROM character_equipment ce
JOIN items i ON ce.item_id = i.id
WHERE ce.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692';

-- 2. Тестируем экипировку деревянного меча (слот 0)
SELECT 'Тест экипировки меча:' as test;
SELECT equip_item(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    'wooden_sword',
    0
);

-- 3. Тестируем экипировку кольчуги (слот 5)
SELECT 'Тест экипировки кольчуги:' as test;
SELECT equip_item(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    'chain_mail',
    5
);

-- 4. Тестируем экипировку робы архимага (слот 4)
SELECT 'Тест экипировки робы:' as test;
SELECT equip_item(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    'archmage_robe',
    4
);

-- 5. Проверяем результат экипировки
SELECT 'Результат экипировки:' as info;
SELECT 
    ce.slot_type,
    i.name,
    i.type
FROM character_equipment ce
JOIN items i ON ce.item_id = i.id
WHERE ce.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692';

-- 6. Тестируем снятие меча
SELECT 'Тест снятия меча:' as test;
SELECT unequip_item(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    'weapon'
);

-- 7. Проверяем инвентарь после снятия
SELECT 'Инвентарь после снятия меча:' as info;
SELECT 
    ci.slot_position,
    i.name,
    i.type
FROM character_inventory ci
JOIN items i ON ci.item_id = i.id
WHERE ci.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692'
ORDER BY ci.slot_position;

-- 8. Добавляем зелье для тестирования
SELECT 'Добавляем зелье:' as info;
INSERT INTO character_inventory (character_id, item_id, slot_position, stack_size, current_durability, upgrade_level)
SELECT 
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    i.id,
    15,
    1,
    NULL,
    0
FROM items i 
WHERE i.item_key = 'small_health_potion'
LIMIT 1;

-- 9. Тестируем зелье
SELECT 'Тест зелья:' as test;
SELECT use_consumable(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    15
);
