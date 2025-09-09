-- ============================================
-- ИСПРАВЛЕНИЕ ФУНКЦИИ EQUIP_ITEM
-- ============================================

-- Пересоздаем функцию equip_item с исправлениями
CREATE OR REPLACE FUNCTION equip_item(
    p_character_id UUID,
    p_item_key VARCHAR,
    p_slot_position INTEGER
)
RETURNS JSON AS $$
DECLARE
    v_item items%ROWTYPE;
    v_equipment_slot VARCHAR;
    v_existing_equipment character_equipment%ROWTYPE;
    v_inventory_item character_inventory%ROWTYPE;
    v_free_slot INTEGER;
    v_result JSON;
BEGIN
    -- Получаем информацию о предмете
    SELECT * INTO v_item FROM items WHERE item_key = p_item_key;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false, 
            'error', 'Item not found: ' || p_item_key
        );
    END IF;

    -- Проверяем, можно ли экипировать этот предмет
    IF v_item.equipment_slot IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'This item cannot be equipped'
        );
    END IF;

    -- Проверяем, есть ли предмет в инвентаре
    SELECT * INTO v_inventory_item 
    FROM character_inventory 
    WHERE character_id = p_character_id 
    AND item_id = v_item.id 
    AND slot_position = p_slot_position;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Item not found in inventory at slot ' || p_slot_position
        );
    END IF;

    -- Определяем слот экипировки
    v_equipment_slot := v_item.equipment_slot;
    
    -- Для колец используем ring1 или ring2
    IF v_equipment_slot = 'ring1' THEN
        -- Проверяем, есть ли уже кольцо в ring1
        SELECT * INTO v_existing_equipment 
        FROM character_equipment 
        WHERE character_id = p_character_id AND slot_type = 'ring1';
        
        IF NOT FOUND THEN
            v_equipment_slot := 'ring1';
        ELSE
            -- Проверяем ring2
            SELECT * INTO v_existing_equipment 
            FROM character_equipment 
            WHERE character_id = p_character_id AND slot_type = 'ring2';
            
            IF NOT FOUND THEN
                v_equipment_slot := 'ring2';
            ELSE
                RETURN json_build_object(
                    'success', false,
                    'error', 'Both ring slots are occupied'
                );
            END IF;
        END IF;
    END IF;

    -- Проверяем, занят ли слот экипировки
    SELECT * INTO v_existing_equipment 
    FROM character_equipment 
    WHERE character_id = p_character_id AND slot_type = v_equipment_slot;
    
    IF FOUND THEN
        -- Снимаем текущий предмет и возвращаем в инвентарь
        -- Ищем свободный слот для текущего предмета
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

        IF v_free_slot IS NULL THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Cannot unequip current item - inventory is full'
            );
        END IF;

        -- Возвращаем текущий предмет в инвентарь
        INSERT INTO character_inventory (
            character_id,
            item_id,
            slot_position,
            stack_size,
            current_durability,
            upgrade_level
        ) VALUES (
            p_character_id,
            v_existing_equipment.item_id,
            v_free_slot,
            1,
            v_existing_equipment.current_durability,
            v_existing_equipment.upgrade_level
        );

        -- Удаляем текущий предмет из экипировки
        DELETE FROM character_equipment WHERE id = v_existing_equipment.id;
    END IF;

    -- Экипируем новый предмет
    INSERT INTO character_equipment (
        character_id,
        slot_type,
        item_id,
        current_durability,
        upgrade_level
    ) VALUES (
        p_character_id,
        v_equipment_slot,
        v_item.id,
        CASE WHEN v_item.max_durability > 0 THEN v_item.max_durability ELSE NULL END,
        0
    );

    -- Удаляем предмет из инвентаря
    DELETE FROM character_inventory 
    WHERE character_id = p_character_id 
    AND item_id = v_item.id 
    AND slot_position = p_slot_position;

    RETURN json_build_object(
        'success', true,
        'action', 'equipped',
        'slot_type', v_equipment_slot,
        'item_name', v_item.name
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- Тестируем экипировку кольчуги
SELECT equip_item(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    'chain_mail',
    5
);

-- Проверяем результат
SELECT 
    ce.slot_type,
    i.name,
    i.type
FROM character_equipment ce
JOIN items i ON ce.item_id = i.id
WHERE ce.character_id = '66b45795-cef1-4ac6-8462-d3acd7729692';
