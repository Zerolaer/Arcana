-- ============================================
-- ПРОСТОЙ ТЕСТ ЭКИПИРОВКИ
-- ============================================

-- Тестируем экипировку деревянного меча
SELECT equip_item(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    'wooden_sword',
    0
);

-- Проверяем результат
SELECT 
    ce.slot_type,
    i.name,
    i.type
FROM character_equipment ce
JOIN items i ON ce.item_id = i.id
WHERE ce.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692';

-- Проверяем инвентарь после экипировки
SELECT 
    ci.slot_position,
    i.name,
    i.type,
    i.equipment_slot
FROM character_inventory ci
JOIN items i ON ci.item_id = i.id
WHERE ci.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692'
ORDER BY ci.slot_position;
