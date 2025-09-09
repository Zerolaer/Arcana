-- ============================================
-- ТЕСТИРОВАНИЕ СИСТЕМЫ ЭКИПИРОВКИ
-- ============================================

-- 1. Проверяем, что у предметов есть equipment_slot
SELECT 
    item_key, 
    name, 
    type, 
    subtype, 
    equipment_slot 
FROM items 
WHERE equipment_slot IS NOT NULL 
ORDER BY type, name;

-- 2. Проверяем инвентарь персонажа
SELECT 
    ci.slot_position,
    i.name,
    i.type,
    i.equipment_slot,
    ci.stack_size
FROM character_inventory ci
JOIN items i ON ci.item_id = i.id
WHERE ci.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692'
ORDER BY ci.slot_position;

-- 3. Тестируем экипировку предмета (замените slot_position на реальный)
-- SELECT equip_item('66b45795-cef1-4ac6-8462-d3acd7729692', 'iron_sword', 0);

-- 4. Проверяем экипированные предметы
SELECT 
    ce.slot_type,
    i.name,
    i.type
FROM character_equipment ce
JOIN items i ON ce.item_id = i.id
WHERE ce.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692'
ORDER BY ce.slot_type;
