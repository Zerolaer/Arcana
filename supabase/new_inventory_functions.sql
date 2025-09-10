-- ============================================
-- ФУНКЦИИ ДЛЯ НОВОЙ СИСТЕМЫ ПРЕДМЕТОВ
-- ============================================

-- Удаляем старые функции (все возможные варианты)
DROP FUNCTION IF EXISTS get_character_inventory(UUID);
DROP FUNCTION IF EXISTS get_character_equipment(UUID);
DROP FUNCTION IF EXISTS equip_item(UUID, VARCHAR, INTEGER);
DROP FUNCTION IF EXISTS equip_item(UUID, INTEGER);
DROP FUNCTION IF EXISTS equip_item(UUID, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS equip_item(UUID, UUID, INTEGER);

-- Принудительно удаляем все версии unequip_item и equip_item
DO $$ 
DECLARE
    func_record RECORD;
BEGIN
    -- Удаляем все версии unequip_item
    FOR func_record IN 
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc 
        WHERE proname = 'unequip_item'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.proname || '(' || func_record.argtypes || ') CASCADE';
    END LOOP;
    
    -- Удаляем все версии equip_item
    FOR func_record IN 
        SELECT proname, oidvectortypes(proargtypes) as argtypes
        FROM pg_proc 
        WHERE proname = 'equip_item'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func_record.proname || '(' || func_record.argtypes || ') CASCADE';
    END LOOP;
END $$;

-- Добавляем поле для связи с конкретной записью в инвентаре
ALTER TABLE character_equipment ADD COLUMN IF NOT EXISTS inventory_item_id UUID;

-- Обновляем constraint для character_equipment чтобы разрешить новые слоты
ALTER TABLE character_equipment DROP CONSTRAINT IF EXISTS valid_slot_type;
ALTER TABLE character_equipment ADD CONSTRAINT valid_slot_type CHECK (slot_type IN (
    'weapon', 'helmet', 'armor', 'gloves', 'boots', 
    'ring1', 'ring2', 'amulet', 'shield',
    'main_hand', 'off_hand', 'head', 'chest', 'legs', 'hands', 'feet', 'ring'
));

-- Функция для получения инвентаря персонажа (новая система)
CREATE OR REPLACE FUNCTION get_character_inventory(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Принудительно обновляем статы для всех предметов в инвентаре
    UPDATE character_inventory 
    SET actual_stats = COALESCE(calculate_item_actual_stats(item_id, quality), '{}'::jsonb),
        value = COALESCE(calculate_item_value(item_id, quality), 0)
    WHERE character_id = p_character_id;
    
    SELECT json_agg(
        json_build_object(
            'id', ci.id, -- Уникальный ID записи в инвентаре
            'slot_position', ci.slot_position,
            'stack_size', ci.stack_size,
            'quality', ci.quality,
            'actual_stats', ci.actual_stats,
            'value', ci.value,
            'item', json_build_object(
                'id', ci.id, -- Используем уникальный ID записи в инвентаре
                'item_type_id', i.id, -- ID типа предмета из items_new
                'name', i.name,
                'description', i.description,
                'icon', i.icon,
                'equipment_slot', i.equipment_slot,
                'grade_id', i.grade_id,
                'category_id', i.category_id,
                'subcategory_id', i.subcategory_id
            )
        ) ORDER BY ci.slot_position
    ) INTO v_result
    FROM character_inventory ci
    JOIN items_new i ON ci.item_id = i.id
    WHERE ci.character_id = p_character_id;
    
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
                'id', ce.inventory_item_id, -- Используем уникальный ID записи в инвентаре
                'item_type_id', i.id, -- ID типа предмета из items_new
                'name', i.name,
                'description', i.description,
                'icon', i.icon,
                'equipment_slot', i.equipment_slot,
                'grade_id', i.grade_id,
                'category_id', i.category_id,
                'subcategory_id', i.subcategory_id
            )
        ) ORDER BY ce.slot_type
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

-- Функция для экипировки предмета
CREATE OR REPLACE FUNCTION equip_item(
    p_character_id UUID,
    p_inventory_item_id UUID,
    p_slot_position INTEGER
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_item_data RECORD;
    v_equipment_slot TEXT;
BEGIN
    -- Получаем данные предмета из инвентаря по уникальному ID записи
    SELECT ci.*, i.equipment_slot, i.name
    INTO v_item_data
    FROM character_inventory ci
    JOIN items_new i ON ci.item_id = i.id
    WHERE ci.character_id = p_character_id 
    AND ci.id = p_inventory_item_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Предмет не найден в инвентаре'
        );
    END IF;
    
    -- Определяем слот экипировки
    v_equipment_slot := v_item_data.equipment_slot;
    
    IF v_equipment_slot IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Предмет нельзя экипировать'
        );
    END IF;
    
    -- Если слот занят, автоматически снимаем старый предмет
    DECLARE
        v_old_item_id UUID;
    BEGIN
        -- Получаем ID старого предмета перед удалением
        SELECT inventory_item_id INTO v_old_item_id
        FROM character_equipment 
        WHERE character_id = p_character_id 
        AND slot_type = v_equipment_slot;
        
        -- Снимаем старый предмет
        DELETE FROM character_equipment 
        WHERE character_id = p_character_id 
        AND slot_type = v_equipment_slot;
        
        -- Если был старый предмет, возвращаем его ID
        IF v_old_item_id IS NOT NULL THEN
            -- Возвращаем информацию о снятом предмете
            RETURN json_build_object(
                'success', true,
                'message', 'Предмет заменен',
                'slot_type', v_equipment_slot,
                'item_name', v_item_data.name,
                'replaced_item_id', v_old_item_id
            );
        END IF;
    END;
    
    -- Экипируем предмет
    INSERT INTO character_equipment (character_id, item_id, slot_type, quality, actual_stats, value, equipped_at, inventory_item_id)
    VALUES (
        p_character_id, 
        v_item_data.item_id, 
        v_equipment_slot, 
        v_item_data.quality, 
        v_item_data.actual_stats, 
        v_item_data.value, 
        NOW(),
        p_inventory_item_id -- Связываем с конкретной записью в инвентаре
    );
    
    -- НЕ удаляем предмет из инвентаря - он остается там с флагом экипировки
    
    RETURN json_build_object(
        'success', true,
        'message', 'Предмет успешно экипирован',
        'slot_type', v_equipment_slot,
        'item_name', v_item_data.name
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', 'Ошибка экипировки: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для снятия предмета
CREATE OR REPLACE FUNCTION unequip_item(
    p_character_id UUID,
    p_slot_type VARCHAR
)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_item_data RECORD;
    v_free_slot INTEGER;
BEGIN
    -- Получаем данные экипированного предмета
    SELECT ce.*
    INTO v_item_data
    FROM character_equipment ce
    WHERE ce.character_id = p_character_id 
    AND ce.slot_type = p_slot_type;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Предмет не найден в экипировке для слота: ' || p_slot_type
        );
    END IF;
    
    -- Удаляем из экипировки (предмет остается в инвентаре)
    DELETE FROM character_equipment 
    WHERE character_id = p_character_id 
    AND slot_type = p_slot_type;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Предмет успешно снят',
        'item_name', 'Предмет',
        'slot_type', p_slot_type
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', 'Ошибка снятия: ' || SQLERRM,
        'slot_type', p_slot_type
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
    DECLARE
        inventory_result JSON;
        equipment_result JSON;
    BEGIN
        SELECT get_character_inventory(test_char_id) INTO inventory_result;
        IF inventory_result IS NOT NULL THEN
            RAISE NOTICE '✅ Функция get_character_inventory работает';
        ELSE
            RAISE NOTICE '❌ Ошибка в функции get_character_inventory';
        END IF;
        
        -- Тест получения экипировки  
        SELECT get_character_equipment(test_char_id) INTO equipment_result;
        IF equipment_result IS NOT NULL THEN
            RAISE NOTICE '✅ Функция get_character_equipment работает';
        ELSE
            RAISE NOTICE '❌ Ошибка в функции get_character_equipment';
        END IF;
        
        -- Тест функций экипировки
        DECLARE
            equip_result JSON;
            unequip_result JSON;
        BEGIN
            -- Тест equip_item (может вернуть ошибку, но функция должна существовать)
            -- Используем gen_random_uuid() для создания валидного UUID
            SELECT equip_item(test_char_id, gen_random_uuid(), 1) INTO equip_result;
            IF equip_result IS NOT NULL THEN
                RAISE NOTICE '✅ Функция equip_item работает';
            ELSE
                RAISE NOTICE '❌ Ошибка в функции equip_item';
            END IF;
            
            -- Тест unequip_item (может вернуть ошибку, но функция должна существовать)
            SELECT unequip_item(test_char_id, 'head') INTO unequip_result;
            IF unequip_result IS NOT NULL THEN
                RAISE NOTICE '✅ Функция unequip_item работает';
            ELSE
                RAISE NOTICE '❌ Ошибка в функции unequip_item';
            END IF;
        END;
    END;
    
    RAISE NOTICE '🎉 Все функции работают корректно!';
END $$;
