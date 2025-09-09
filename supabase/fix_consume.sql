-- ============================================
-- ИСПРАВЛЕНИЕ ФУНКЦИИ USE_CONSUMABLE
-- ============================================

-- Пересоздаем функцию use_consumable с восстановлением HP/MP
CREATE OR REPLACE FUNCTION use_consumable(
    p_character_id UUID,
    p_slot_position INTEGER
)
RETURNS JSON AS $$
DECLARE
    v_inventory_item character_inventory%ROWTYPE;
    v_item items%ROWTYPE;
    v_character characters%ROWTYPE;
    v_new_health INTEGER;
    v_new_mana INTEGER;
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

    -- Вычисляем новое здоровье и ману
    v_new_health := LEAST(v_character.health + COALESCE(v_item.base_health, 0), v_character.max_health);
    v_new_mana := LEAST(v_character.mana + COALESCE(v_item.base_mana, 0), v_character.max_mana);

    -- Обновляем здоровье и ману персонажа
    UPDATE characters 
    SET 
        health = v_new_health,
        mana = v_new_mana
    WHERE id = p_character_id;

    -- Удаляем предмет из инвентаря
    DELETE FROM character_inventory WHERE id = v_inventory_item.id;

    RETURN json_build_object(
        'success', true,
        'action', 'used',
        'item_name', v_item.name,
        'effects', json_build_object(
            'health_restored', COALESCE(v_item.base_health, 0),
            'mana_restored', COALESCE(v_item.base_mana, 0),
            'new_health', v_new_health,
            'new_mana', v_new_mana
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

-- Тестируем использование зелья
SELECT use_consumable(
    '66b45795-cef1-4ac6-8462-d3acd7729692'::uuid,
    7
);

-- Проверяем здоровье и ману персонажа
SELECT 
    name,
    health,
    max_health,
    mana,
    max_mana
FROM characters 
WHERE id = '66b45795-cef1-4ac6-8462-d3acd7729692';
