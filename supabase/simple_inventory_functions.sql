-- ПРОСТЫЕ ФУНКЦИИ ИНВЕНТАРЯ И ЭКИПИРОВКИ
-- Упрощенные версии без сложных JSON конструкций

-- 1. Простая функция инвентаря
CREATE OR REPLACE FUNCTION get_character_inventory(p_character_id UUID)
RETURNS TABLE (
    slot_position INTEGER,
    quantity INTEGER,
    item_id UUID,
    item_name TEXT,
    item_icon TEXT,
    item_rarity TEXT,
    item_type TEXT,
    item_subtype TEXT,
    item_level INTEGER,
    item_value INTEGER,
    obtained_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.slot_position,
        ci.quantity,
        i.id as item_id,
        i.name as item_name,
        i.icon as item_icon,
        i.rarity as item_rarity,
        i.type as item_type,
        i.subtype as item_subtype,
        i.level_requirement as item_level,
        i.base_value as item_value,
        ci.created_at as obtained_at
    FROM character_inventory ci
    JOIN items i ON ci.item_id = i.id
    WHERE ci.character_id = p_character_id
    ORDER BY ci.slot_position;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Простая функция экипировки
CREATE OR REPLACE FUNCTION get_character_equipment(p_character_id UUID)
RETURNS TABLE (
    slot TEXT,
    item_id UUID,
    item_name TEXT,
    item_icon TEXT,
    item_rarity TEXT,
    item_type TEXT,
    item_subtype TEXT,
    item_level INTEGER,
    item_value INTEGER,
    equipped_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ce.slot,
        i.id as item_id,
        i.name as item_name,
        i.icon as item_icon,
        i.rarity as item_rarity,
        i.type as item_type,
        i.subtype as item_subtype,
        i.level_requirement as item_level,
        i.base_value as item_value,
        ce.equipped_at
    FROM character_equipment ce
    JOIN items i ON ce.item_id = i.id
    WHERE ce.character_id = p_character_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
