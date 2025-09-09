-- Проверяем инвентарь персонажа
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

-- Проверяем экипировку
SELECT 
    ce.slot_type,
    i.name,
    i.type
FROM character_equipment ce
JOIN items i ON ce.item_id = i.id
WHERE ce.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692';

-- Тестируем использование зелья из правильного слота
-- Сначала найдем зелье
SELECT 
    ci.slot_position,
    i.name,
    i.base_health,
    i.base_mana
FROM character_inventory ci
JOIN items i ON ci.item_id = i.id
WHERE ci.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692'
AND i.type = 'consumable';
