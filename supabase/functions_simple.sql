-- ============================================
-- ФУНКЦИИ ДЛЯ РАБОТЫ С ИНВЕНТАРЕМ (ПРОСТЫЕ)
-- ============================================

-- Функция для получения инвентаря персонажа
CREATE OR REPLACE FUNCTION get_character_inventory(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'slot_position', ci.slot_position,
            'stack_size', ci.stack_size,
            'current_durability', ci.current_durability,
            'upgrade_level', ci.upgrade_level,
            'obtained_at', ci.obtained_at,
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
                    'damage', i.base_damage + COALESCE(ci.bonus_damage, 0),
                    'defense', i.base_defense + COALESCE(ci.bonus_defense, 0),
                    'health', i.base_health + COALESCE(ci.bonus_health, 0),
                    'mana', i.base_mana + COALESCE(ci.bonus_mana, 0),
                    'critChance', i.base_crit_chance + COALESCE(ci.bonus_crit_chance, 0),
                    'critDamage', i.base_crit_damage + COALESCE(ci.bonus_crit_damage, 0),
                    'speed', i.base_speed + COALESCE(ci.bonus_speed, 0)
                ),
                'value', i.base_value,
                'stackable', i.stackable,
                'stackSize', ci.stack_size,
                'durability', CASE 
                    WHEN i.max_durability > 0 THEN json_build_object(
                        'current', COALESCE(ci.current_durability, i.max_durability),
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
        ) ORDER BY ci.slot_position
    ) INTO v_result
    FROM character_inventory ci
    JOIN items i ON ci.item_id = i.id
    WHERE ci.character_id = p_character_id;

    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- Функция для перемещения предметов в инвентаре
CREATE OR REPLACE FUNCTION move_inventory_item(
    p_character_id UUID,
    p_from_slot INTEGER,
    p_to_slot INTEGER
)
RETURNS JSON AS $$
DECLARE
    v_from_item character_inventory%ROWTYPE;
    v_to_item character_inventory%ROWTYPE;
    v_item items%ROWTYPE;
BEGIN
    -- Проверяем валидность слотов
    IF p_from_slot < 0 OR p_from_slot > 47 OR p_to_slot < 0 OR p_to_slot > 47 THEN
        RETURN json_build_object('success', false, 'error', 'Invalid slot numbers');
    END IF;

    IF p_from_slot = p_to_slot THEN
        RETURN json_build_object('success', true, 'action', 'no_change');
    END IF;

    -- Получаем предмет из исходного слота
    SELECT * INTO v_from_item 
    FROM character_inventory 
    WHERE character_id = p_character_id AND slot_position = p_from_slot;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'No item in source slot');
    END IF;

    -- Получаем информацию о предмете
    SELECT * INTO v_item FROM items WHERE id = v_from_item.item_id;

    -- Проверяем целевой слот
    SELECT * INTO v_to_item 
    FROM character_inventory 
    WHERE character_id = p_character_id AND slot_position = p_to_slot;
    
    IF FOUND THEN
        -- Целевой слот занят
        IF v_to_item.item_id = v_from_item.item_id AND v_item.stackable THEN
            -- Можно объединить стопки
            DECLARE
                v_total_stack INTEGER := v_from_item.stack_size + v_to_item.stack_size;
            BEGIN
                IF v_total_stack <= v_item.max_stack THEN
                    -- Объединяем стопки
                    UPDATE character_inventory 
                    SET stack_size = v_total_stack 
                    WHERE id = v_to_item.id;
                    
                    DELETE FROM character_inventory WHERE id = v_from_item.id;
                    
                    RETURN json_build_object(
                        'success', true, 
                        'action', 'stacked',
                        'total_stack', v_total_stack
                    );
                END IF;
            END;
        END IF;
        
        -- Меняем предметы местами
        UPDATE character_inventory 
        SET slot_position = -1 
        WHERE id = v_from_item.id;
        
        UPDATE character_inventory 
        SET slot_position = p_from_slot 
        WHERE id = v_to_item.id;
        
        UPDATE character_inventory 
        SET slot_position = p_to_slot 
        WHERE id = v_from_item.id;
        
        RETURN json_build_object(
            'success', true, 
            'action', 'swapped'
        );
    ELSE
        -- Целевой слот свободен, просто перемещаем
        UPDATE character_inventory 
        SET slot_position = p_to_slot 
        WHERE id = v_from_item.id;
        
        RETURN json_build_object(
            'success', true, 
            'action', 'moved'
        );
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- Функция для добавления предмета в инвентарь персонажа
CREATE OR REPLACE FUNCTION add_item_to_inventory(
    p_character_id UUID,
    p_item_key VARCHAR,
    p_stack_size INTEGER DEFAULT 1,
    p_slot_position INTEGER DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_item items%ROWTYPE;
    v_existing_inventory character_inventory%ROWTYPE;
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

    -- Проверяем, можно ли складывать предметы в стопки
    IF v_item.stackable THEN
        -- Ищем существующую стопку этого предмета
        SELECT * INTO v_existing_inventory 
        FROM character_inventory 
        WHERE character_id = p_character_id 
        AND item_id = v_item.id 
        AND stack_size < v_item.max_stack
        ORDER BY stack_size DESC
        LIMIT 1;
        
        IF FOUND THEN
            -- Добавляем к существующей стопке
            UPDATE character_inventory 
            SET stack_size = LEAST(stack_size + p_stack_size, v_item.max_stack)
            WHERE id = v_existing_inventory.id;
            
            RETURN json_build_object(
                'success', true,
                'action', 'stacked',
                'slot_position', v_existing_inventory.slot_position
            );
        END IF;
    END IF;

    -- Ищем свободный слот
    IF p_slot_position IS NOT NULL THEN
        -- Проверяем указанный слот
        SELECT slot_position INTO v_free_slot 
        FROM character_inventory 
        WHERE character_id = p_character_id AND slot_position = p_slot_position;
        
        IF FOUND THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Slot ' || p_slot_position || ' is already occupied'
            );
        END IF;
        
        v_free_slot := p_slot_position;
    ELSE
        -- Ищем первый свободный слот
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
    END IF;

    -- Если нет свободных слотов
    IF v_free_slot IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Inventory is full'
        );
    END IF;

    -- Добавляем предмет в инвентарь
    INSERT INTO character_inventory (
        character_id, 
        item_id, 
        slot_position, 
        stack_size,
        current_durability
    ) VALUES (
        p_character_id, 
        v_item.id, 
        v_free_slot, 
        p_stack_size,
        CASE WHEN v_item.max_durability > 0 THEN v_item.max_durability ELSE NULL END
    );

    RETURN json_build_object(
        'success', true,
        'action', 'added',
        'slot_position', v_free_slot,
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

-- Функция для автосортировки инвентаря
CREATE OR REPLACE FUNCTION sort_inventory(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_items RECORD;
    v_slot INTEGER := 0;
BEGIN
    -- Получаем все предметы, отсортированные по редкости, типу и названию
    FOR v_items IN
        SELECT ci.*, i.rarity, i.type, i.name,
               CASE i.rarity
                   WHEN 'mythic' THEN 6
                   WHEN 'legendary' THEN 5
                   WHEN 'epic' THEN 4
                   WHEN 'rare' THEN 3
                   WHEN 'uncommon' THEN 2
                   ELSE 1
               END as rarity_order
        FROM character_inventory ci
        JOIN items i ON ci.item_id = i.id
        WHERE ci.character_id = p_character_id
        ORDER BY rarity_order DESC, i.type, i.name
    LOOP
        UPDATE character_inventory 
        SET slot_position = v_slot 
        WHERE id = v_items.id;
        
        v_slot := v_slot + 1;
    END LOOP;

    RETURN json_build_object(
        'success', true,
        'action', 'sorted',
        'items_count', v_slot
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- Функция для удаления предмета из инвентаря
CREATE OR REPLACE FUNCTION remove_item_from_inventory(
    p_character_id UUID,
    p_slot_position INTEGER,
    p_quantity INTEGER DEFAULT 1
)
RETURNS JSON AS $$
DECLARE
    v_item character_inventory%ROWTYPE;
BEGIN
    SELECT * INTO v_item 
    FROM character_inventory 
    WHERE character_id = p_character_id AND slot_position = p_slot_position;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'No item in specified slot');
    END IF;

    IF p_quantity >= v_item.stack_size THEN
        -- Удаляем весь стак
        DELETE FROM character_inventory WHERE id = v_item.id;
        RETURN json_build_object(
            'success', true, 
            'action', 'removed_all',
            'quantity', v_item.stack_size
        );
    ELSE
        -- Уменьшаем размер стака
        UPDATE character_inventory 
        SET stack_size = stack_size - p_quantity 
        WHERE id = v_item.id;
        
        RETURN json_build_object(
            'success', true, 
            'action', 'reduced_stack',
            'quantity', p_quantity,
            'remaining', v_item.stack_size - p_quantity
        );
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- Функция для получения стартовых предметов
CREATE OR REPLACE FUNCTION give_starting_items(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON[];
    v_temp JSON;
BEGIN
    -- Даем стартовые предметы новому персонажу
    SELECT add_item_to_inventory(p_character_id, 'wooden_sword', 1, 0) INTO v_temp;
    v_result := array_append(v_result, v_temp);
    
    SELECT add_item_to_inventory(p_character_id, 'leather_armor', 1, 1) INTO v_temp;
    v_result := array_append(v_result, v_temp);
    
    SELECT add_item_to_inventory(p_character_id, 'health_potion_small', 5, 2) INTO v_temp;
    v_result := array_append(v_result, v_temp);
    
    SELECT add_item_to_inventory(p_character_id, 'iron_ore', 10, 3) INTO v_temp;
    v_result := array_append(v_result, v_temp);

    RETURN json_build_object(
        'success', true,
        'message', 'Starting items given',
        'details', array_to_json(v_result)
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Failed to give starting items: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

SELECT '✅ Функции созданы! Система полностью готова!' as status;
