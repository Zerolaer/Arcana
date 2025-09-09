-- ============================================
-- ИСПРАВЛЕНИЕ equipment_slot ДЛЯ СУЩЕСТВУЮЩИХ ПРЕДМЕТОВ
-- ============================================

-- Обновляем оружие
UPDATE items SET equipment_slot = 'weapon' WHERE type = 'weapon';

-- Обновляем броню по подтипам
UPDATE items SET equipment_slot = 'helmet' WHERE type = 'armor' AND subtype = 'helmet';
UPDATE items SET equipment_slot = 'armor' WHERE type = 'armor' AND subtype = 'chest';
UPDATE items SET equipment_slot = 'gloves' WHERE type = 'armor' AND subtype = 'gloves';
UPDATE items SET equipment_slot = 'boots' WHERE type = 'armor' AND subtype = 'boots';
UPDATE items SET equipment_slot = 'shield' WHERE type = 'armor' AND subtype = 'shield';

-- Для брони без подтипа ставим 'armor'
UPDATE items SET equipment_slot = 'armor' WHERE type = 'armor' AND equipment_slot IS NULL;

-- Обновляем аксессуары
UPDATE items SET equipment_slot = 'ring1' WHERE type = 'accessory' AND subtype = 'ring';
UPDATE items SET equipment_slot = 'amulet' WHERE type = 'accessory' AND subtype = 'amulet';

-- Для аксессуаров без подтипа ставим 'ring1'
UPDATE items SET equipment_slot = 'ring1' WHERE type = 'accessory' AND equipment_slot IS NULL;

-- Проверяем результат
SELECT 
    item_key, 
    name, 
    type, 
    subtype, 
    equipment_slot 
FROM items 
WHERE equipment_slot IS NOT NULL 
ORDER BY type, name;

-- Проверяем инвентарь персонажа после обновления
SELECT 
    ci.slot_position,
    i.name,
    i.type,
    i.subtype,
    i.equipment_slot,
    ci.stack_size
FROM character_inventory ci
JOIN items i ON ci.item_id = i.id
WHERE ci.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692'
ORDER BY ci.slot_position;
