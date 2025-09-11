-- ============================================
-- ФУНКЦИИ ДРОПА ПРЕДМЕТОВ С МОНСТРОВ
-- ============================================

-- Функция для получения дропа с монстра
CREATE OR REPLACE FUNCTION get_mob_loot(
    p_mob_id UUID,
    p_character_level INTEGER DEFAULT 1
)
RETURNS TABLE (
    item_id UUID,
    item_name TEXT,
    item_icon TEXT,
    item_type TEXT,
    rarity TEXT,
    quantity INTEGER,
    drop_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id as item_id,
        i.name as item_name,
        i.icon as item_icon,
        i.item_type,
        i.rarity,
        CASE 
            WHEN ld.quantity_min = ld.quantity_max THEN ld.quantity_min
            ELSE ld.quantity_min + FLOOR(RANDOM() * (ld.quantity_max - ld.quantity_min + 1))
        END as quantity,
        ld.drop_rate
    FROM mobs m
    JOIN loot_tables lt ON m.loot_table_id = lt.id
    JOIN loot_drops ld ON lt.id = ld.loot_table_id
    JOIN items i ON ld.item_id = i.id
    WHERE m.id = p_mob_id
    AND (ld.level_requirement IS NULL OR ld.level_requirement <= p_character_level)
    ORDER BY ld.drop_rate DESC;
END;
$$ LANGUAGE plpgsql;

-- Функция для обработки дропа предметов
CREATE OR REPLACE FUNCTION process_mob_loot(
    p_character_id UUID,
    p_mob_id UUID,
    p_character_level INTEGER DEFAULT 1
)
RETURNS JSON AS $$
DECLARE
    v_loot_items RECORD;
    v_dropped_items JSON[] := '{}';
    v_item_count INTEGER := 0;
    v_random_number DECIMAL(5,2);
    v_available_slot INTEGER;
    v_inventory_item RECORD;
BEGIN
    -- Получаем все возможные предметы для дропа
    FOR v_loot_items IN 
        SELECT * FROM get_mob_loot(p_mob_id, p_character_level)
    LOOP
        -- Генерируем случайное число от 0 до 100
        v_random_number := RANDOM() * 100;
        
        -- Проверяем, выпал ли предмет
        IF v_random_number <= v_loot_items.drop_rate THEN
            -- Ищем свободный слот в инвентаре
            v_available_slot := -1;
            
            -- Проверяем, можно ли добавить к существующему стеку
            IF v_loot_items.item_type = 'consumable' OR v_loot_items.item_type = 'material' THEN
                SELECT slot_position INTO v_available_slot
                FROM character_inventory ci
                JOIN items i ON ci.item_id = i.id
                WHERE ci.character_id = p_character_id 
                AND i.id = v_loot_items.item_id
                AND ci.quantity < i.stack_size
                LIMIT 1;
            END IF;
            
            -- Если не нашли существующий стек, ищем пустой слот
            IF v_available_slot = -1 THEN
                SELECT slot_position INTO v_available_slot
                FROM character_inventory ci
                WHERE ci.character_id = p_character_id 
                AND ci.item_id IS NULL
                ORDER BY slot_position
                LIMIT 1;
            END IF;
            
            -- Если нашли слот, добавляем предмет
            IF v_available_slot != -1 THEN
                -- Проверяем, есть ли уже такой предмет в этом слоте
                SELECT * INTO v_inventory_item
                FROM character_inventory ci
                WHERE ci.character_id = p_character_id 
                AND ci.slot_position = v_available_slot;
                
                IF v_inventory_item.item_id IS NULL THEN
                    -- Добавляем новый предмет
                    INSERT INTO character_inventory (
                        character_id, 
                        item_id, 
                        slot_position, 
                        quantity
                    ) VALUES (
                        p_character_id, 
                        v_loot_items.item_id, 
                        v_available_slot, 
                        v_loot_items.quantity
                    );
                ELSE
                    -- Добавляем к существующему стеку
                    UPDATE character_inventory 
                    SET quantity = quantity + v_loot_items.quantity
                    WHERE id = v_inventory_item.id;
                END IF;
                
                -- Добавляем в список выпавших предметов
                v_dropped_items := array_append(v_dropped_items, 
                    json_build_object(
                        'item_name', v_loot_items.item_name,
                        'item_icon', v_loot_items.item_icon,
                        'item_type', v_loot_items.item_type,
                        'rarity', v_loot_items.rarity,
                        'quantity', v_loot_items.quantity,
                        'slot_position', v_available_slot
                    )
                );
                
                v_item_count := v_item_count + 1;
            END IF;
        END IF;
    END LOOP;
    
    RETURN json_build_object(
        'success', true,
        'items_dropped', v_dropped_items,
        'total_items', v_item_count
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- Функция для тестирования дропа (для отладки)
CREATE OR REPLACE FUNCTION test_mob_loot(
    p_mob_id UUID,
    p_character_level INTEGER DEFAULT 1
)
RETURNS TABLE (
    item_name TEXT,
    drop_rate DECIMAL(5,2),
    quantity_min INTEGER,
    quantity_max INTEGER,
    level_req INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.name,
        ld.drop_rate,
        ld.quantity_min,
        ld.quantity_max,
        ld.level_requirement
    FROM mobs m
    JOIN loot_tables lt ON m.loot_table_id = lt.id
    JOIN loot_drops ld ON lt.id = ld.loot_table_id
    JOIN items i ON ld.item_id = i.id
    WHERE m.id = p_mob_id
    ORDER BY ld.drop_rate DESC;
END;
$$ LANGUAGE plpgsql;

-- Проверяем, что функции созданы
SELECT '✅ Функции дропа предметов созданы!' as status;
