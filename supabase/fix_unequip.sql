-- ============================================
-- ИСПРАВЛЕНИЕ ФУНКЦИИ UNEQUIP_ITEM
-- ============================================

-- Пересоздаем функцию unequip_item с исправлениями
CREATE OR REPLACE FUNCTION unequip_item(
    p_character_id UUID,
    p_slot_type VARCHAR
)
RETURNS JSON AS $$
DECLARE
    v_equipment character_equipment%ROWTYPE;
    v_item items%ROWTYPE;
    v_free_slot INTEGER;
BEGIN
    -- Получаем экипированный предмет
    SELECT * INTO v_equipment 
    FROM character_equipment 
    WHERE character_id = p_character_id AND slot_type = p_slot_type;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No item equipped in slot ' || p_slot_type
        );
    END IF;

    -- Получаем информацию о предмете
    SELECT * INTO v_item FROM items WHERE id = v_equipment.item_id;

    -- Ищем свободный слот в инвентаре
    WITH occupied_slots AS (
        SELECT slot_position FROM character_inventory 
        WHERE character_id = p_character_id
    )
    SELECT s.slot_num INTO v_free_slot
    FROM generate_series(0, 47) s(slot_num)
    LEFT JOIN occupied_slots os ON s.slot_num = os.slot_position
    WHERE os.slot_position IS NULL
    ORDER BY s.slot_num
    LIMIT 1;

    -- Если нет свободных слотов
    IF v_free_slot IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Inventory is full'
        );
    END IF;

    -- Добавляем предмет обратно в инвентарь
    INSERT INTO character_inventory (
        character_id,
        item_id,
        slot_position,
        stack_size,
        current_durability,
        upgrade_level
    ) VALUES (
        p_character_id,
        v_equipment.item_id,
        v_free_slot,
        1,
        v_equipment.current_durability,
        v_equipment.upgrade_level
    );

    -- Удаляем из экипировки
    DELETE FROM character_equipment WHERE id = v_equipment.id;

    RETURN json_build_object(
        'success', true,
        'action', 'unequipped',
        'slot_type', p_slot_type,
        'item_name', v_item.name,
        'inventory_slot', v_free_slot
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- Тестируем снятие деревянного меча
SELECT unequip_item(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    'weapon'
);

-- Проверяем результат
SELECT 
    ci.slot_position,
    i.name,
    i.type
FROM character_inventory ci
JOIN items i ON ci.item_id = i.id
WHERE ci.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692'
ORDER BY ci.slot_position;
