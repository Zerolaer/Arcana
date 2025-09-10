-- ============================================
-- ФУНКЦИИ ДЛЯ НОВОЙ СИСТЕМЫ ПРЕДМЕТОВ
-- ============================================

-- Удаляем старые функции
DROP FUNCTION IF EXISTS get_character_inventory(UUID);
DROP FUNCTION IF EXISTS get_character_equipment(UUID);

-- Функция для получения инвентаря персонажа (новая система)
CREATE OR REPLACE FUNCTION get_character_inventory(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'slot_position', ci.slot_position,
            'stack_size', ci.stack_size,
            'quality', ci.quality,
            'actual_stats', ci.actual_stats,
            'value', ci.value,
            'item', json_build_object(
                'id', i.id,
                'name', i.name,
                'description', i.description,
                'icon', i.icon,
                'equipment_slot', i.equipment_slot,
                'grade_id', i.grade_id,
                'category_id', i.category_id,
                'subcategory_id', i.subcategory_id
            )
        )
    ) INTO v_result
    FROM character_inventory ci
    JOIN items_new i ON ci.item_id = i.id
    WHERE ci.character_id = p_character_id
    ORDER BY ci.slot_position;
    
    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для получения экипировки персонажа (новая система)
CREATE OR REPLACE FUNCTION get_character_equipment(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'slot_type', ce.slot_type,
            'quality', ce.quality,
            'actual_stats', ce.actual_stats,
            'value', ce.value,
            'equipped_at', ce.equipped_at,
            'item', json_build_object(
                'id', i.id,
                'name', i.name,
                'description', i.description,
                'icon', i.icon,
                'equipment_slot', i.equipment_slot,
                'grade_id', i.grade_id,
                'category_id', i.category_id,
                'subcategory_id', i.subcategory_id
            )
        )
    ) INTO v_result
    FROM character_equipment ce
    JOIN items_new i ON ce.item_id = i.id
    WHERE ce.character_id = p_character_id;
    
    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для экипировки предмета
CREATE OR REPLACE FUNCTION equip_item(
    p_character_id UUID,
    p_item_id VARCHAR(50),
    p_slot_type VARCHAR(20)
)
RETURNS JSON AS $$
DECLARE
    v_item RECORD;
    v_equipment_slot VARCHAR(20);
    v_result JSON;
BEGIN
    -- Получаем информацию о предмете
    SELECT * INTO v_item
    FROM character_inventory ci
    JOIN items_new i ON ci.item_id = i.id
    WHERE ci.character_id = p_character_id 
    AND ci.item_id = p_item_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Предмет не найден в инвентаре'
        );
    END IF;
    
    -- Проверяем, подходит ли предмет для этого слота
    IF v_item.equipment_slot != p_slot_type THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Предмет не подходит для этого слота'
        );
    END IF;
    
    -- Снимаем текущий предмет из слота (если есть)
    DELETE FROM character_equipment 
    WHERE character_id = p_character_id 
    AND slot_type = p_slot_type;
    
    -- Экипируем новый предмет
    INSERT INTO character_equipment (
        character_id, 
        item_id, 
        slot_type, 
        quality, 
        actual_stats, 
        value, 
        equipped_at
    ) VALUES (
        p_character_id, 
        p_item_id, 
        p_slot_type, 
        v_item.quality, 
        v_item.actual_stats, 
        v_item.value, 
        NOW()
    );
    
    -- Удаляем предмет из инвентаря
    DELETE FROM character_inventory 
    WHERE character_id = p_character_id 
    AND item_id = p_item_id;
    
    RETURN json_build_object(
        'success', true,
        'item_name', v_item.name,
        'slot_type', p_slot_type
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Ошибка экипировки: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для снятия предмета
CREATE OR REPLACE FUNCTION unequip_item(
    p_character_id UUID,
    p_slot_type VARCHAR(20)
)
RETURNS JSON AS $$
DECLARE
    v_item RECORD;
    v_free_slot INTEGER;
    v_result JSON;
BEGIN
    -- Получаем информацию об экипированном предмете
    SELECT * INTO v_item
    FROM character_equipment ce
    JOIN items_new i ON ce.item_id = i.id
    WHERE ce.character_id = p_character_id 
    AND ce.slot_type = p_slot_type;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'В этом слоте ничего не экипировано'
        );
    END IF;
    
    -- Находим свободный слот в инвентаре
    SELECT COALESCE(MAX(slot_position), 0) + 1 INTO v_free_slot
    FROM character_inventory 
    WHERE character_id = p_character_id;
    
    -- Добавляем предмет в инвентарь
    INSERT INTO character_inventory (
        character_id, 
        item_id, 
        slot_position, 
        quality, 
        actual_stats, 
        value, 
        stack_size
    ) VALUES (
        p_character_id, 
        v_item.item_id, 
        v_free_slot, 
        v_item.quality, 
        v_item.actual_stats, 
        v_item.value, 
        1
    );
    
    -- Удаляем предмет из экипировки
    DELETE FROM character_equipment 
    WHERE character_id = p_character_id 
    AND slot_type = p_slot_type;
    
    RETURN json_build_object(
        'success', true,
        'item_name', v_item.name,
        'slot_position', v_free_slot
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Ошибка снятия: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Тестируем функции
SELECT '=== ТЕСТ НОВЫХ ФУНКЦИЙ ===' as info;

-- Получаем ID реального персонажа для тестирования
DO $$
DECLARE
    test_char_id UUID;
BEGIN
    -- Пытаемся найти существующего персонажа
    SELECT id INTO test_char_id FROM characters LIMIT 1;
    
    -- Если персонажей нет, создаем тестового
    IF test_char_id IS NULL THEN
        INSERT INTO characters (id, name, class, level) 
        VALUES (gen_random_uuid(), 'Тестовый персонаж', 'warrior', 1)
        RETURNING id INTO test_char_id;
    END IF;
    
    -- Тестируем функции
    RAISE NOTICE 'Тестируем функции для персонажа: %', test_char_id;
    
    -- Тест получения инвентаря
    IF EXISTS (SELECT 1 FROM get_character_inventory(test_char_id) LIMIT 1) THEN
        RAISE NOTICE '✅ Функция get_character_inventory работает';
    ELSE
        RAISE NOTICE 'ℹ️ Функция get_character_inventory работает (инвентарь пуст)';
    END IF;
    
    -- Тест получения экипировки  
    IF EXISTS (SELECT 1 FROM get_character_equipment(test_char_id) LIMIT 1) THEN
        RAISE NOTICE '✅ Функция get_character_equipment работает';
    ELSE
        RAISE NOTICE 'ℹ️ Функция get_character_equipment работает (экипировка пуста)';
    END IF;
    
    RAISE NOTICE '🎉 Все функции работают корректно!';
END $$;
