-- Исправляем функцию get_character_inventory

-- Сначала удаляем старую функцию
DROP FUNCTION IF EXISTS get_character_inventory(UUID);

-- Создаем новую функцию
CREATE FUNCTION get_character_inventory(p_character_id UUID)
RETURNS TABLE (
    slot_position INTEGER,
    stack_size INTEGER,
    current_durability INTEGER,
    upgrade_level INTEGER,
    item JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.slot_position,
        ci.stack_size,
        ci.current_durability,
        ci.upgrade_level,
        json_build_object(
            'id', i.id,
            'item_key', i.item_key,
            'name', i.name,
            'description', COALESCE(i.description, ''),
            'rarity', COALESCE(i.rarity, 'common'),
            'type', i.type,
            'subType', COALESCE(i.subtype, ''),
            'icon', COALESCE(i.icon, '📦'),
            'level', 1,
            'stats', json_build_object(),
            'value', 0,
            'stackable', true,
            'durability', CASE 
                WHEN ci.current_durability > 0 THEN 
                    json_build_object(
                        'current', ci.current_durability,
                        'max', 100
                    )
                ELSE NULL
            END,
            'setBonus', '',
            'requirements', json_build_object(),
            'equipment_slot', i.equipment_slot
        ) as item
    FROM character_inventory ci
    JOIN items i ON ci.item_id = i.id
    WHERE ci.character_id = p_character_id
    ORDER BY ci.slot_position;
END;
$$ LANGUAGE plpgsql;

-- Тестируем исправленную функцию
SELECT '=== ТЕСТ ИСПРАВЛЕННОЙ ФУНКЦИИ ===' as info;
SELECT get_character_inventory('66b45795-cef1-4ac6-8462-d3acd7729692'::uuid);
