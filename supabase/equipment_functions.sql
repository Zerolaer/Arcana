-- ============================================
-- ФУНКЦИИ ДЛЯ СИСТЕМЫ ЭКИПИРОВКИ
-- ============================================

-- Функция для получения экипированных предметов персонажа
CREATE OR REPLACE FUNCTION get_character_equipment(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'slot_type', ce.slot_type,
            'current_durability', ce.current_durability,
            'upgrade_level', ce.upgrade_level,
            'equipped_at', ce.equipped_at,
            'item', json_build_object(
                'id', i.item_key,
                'name', i.name,
                'description', i.description,
                'rarity', i.rarity,
                'type', i.type,
                'subType', i.subtype,
                'icon', i.icon,
                'level', i.level_requirement,
                'stats', json_build_object(
                    'damage', i.base_damage + COALESCE(ce.bonus_damage, 0),
                    'defense', i.base_defense + COALESCE(ce.bonus_defense, 0),
                    'health', i.base_health + COALESCE(ce.bonus_health, 0),
                    'mana', i.base_mana + COALESCE(ce.bonus_mana, 0),
                    'critChance', i.base_crit_chance + COALESCE(ce.bonus_crit_chance, 0),
                    'critDamage', i.base_crit_damage + COALESCE(ce.bonus_crit_damage, 0),
                    'speed', i.base_speed + COALESCE(ce.bonus_speed, 0)
                ),
                'value', i.base_value,
                'durability', CASE 
                    WHEN i.max_durability > 0 THEN json_build_object(
                        'current', COALESCE(ce.current_durability, i.max_durability),
                        'max', i.max_durability
                    )
                    ELSE NULL
                END,
                'setBonus', i.set_bonus,
                'requirements', json_build_object(
                    'level', i.level_requirement,
                    'class', i.class_requirement,
                    'stats', i.requirements_stats
                ),
                'equipment_slot', i.equipment_slot
            )
        ) ORDER BY 
            CASE ce.slot_type
                WHEN 'weapon' THEN 1
                WHEN 'helmet' THEN 2
                WHEN 'armor' THEN 3
                WHEN 'gloves' THEN 4
                WHEN 'boots' THEN 5
                WHEN 'shield' THEN 6
                WHEN 'ring1' THEN 7
                WHEN 'ring2' THEN 8
                WHEN 'amulet' THEN 9
                ELSE 10
            END
    ) INTO v_result
    FROM character_equipment ce
    JOIN items i ON ce.item_id = i.id
    WHERE ce.character_id = p_character_id;

    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- Функция для экипировки предмета
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
        -- (здесь можно добавить логику для поиска свободного слота)
        RETURN json_build_object(
            'success', false,
            'error', 'Equipment slot ' || v_equipment_slot || ' is already occupied'
        );
    END IF;

    -- Экипируем предмет
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

-- Функция для снятия предмета
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

-- Функция для использования расходника
CREATE OR REPLACE FUNCTION use_consumable(
    p_character_id UUID,
    p_slot_position INTEGER
)
RETURNS JSON AS $$
DECLARE
    v_inventory_item character_inventory%ROWTYPE;
    v_item items%ROWTYPE;
    v_character characters%ROWTYPE;
BEGIN
    -- Получаем предмет из инвентаря
    SELECT * INTO v_inventory_item 
    FROM character_inventory 
    WHERE character_id = p_character_id AND slot_position = p_slot_position;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No item found at slot ' || p_slot_position
        );
    END IF;

    -- Получаем информацию о предмете
    SELECT * INTO v_item FROM items WHERE id = v_inventory_item.item_id;

    -- Проверяем, что это расходник
    IF v_item.type != 'consumable' THEN
        RETURN json_build_object(
            'success', false,
            'error', 'This item cannot be used'
        );
    END IF;

    -- Получаем данные персонажа
    SELECT * INTO v_character FROM characters WHERE id = p_character_id;

    -- Применяем эффекты расходника (здесь можно добавить логику восстановления HP/MP)
    -- Пока просто удаляем предмет
    DELETE FROM character_inventory WHERE id = v_inventory_item.id;

    RETURN json_build_object(
        'success', true,
        'action', 'used',
        'item_name', v_item.name,
        'effects', json_build_object(
            'health_restored', v_item.base_health,
            'mana_restored', v_item.base_mana
        )
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

SELECT '✅ Функции экипировки созданы!' as status;
