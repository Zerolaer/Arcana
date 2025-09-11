-- ИСПРАВЛЕНИЕ ФУНКЦИЙ ИНВЕНТАРЯ И ЭКИПИРОВКИ
-- Обновляем функции для работы с новой схемой

-- 1. Исправляем функцию get_character_inventory
CREATE OR REPLACE FUNCTION get_character_inventory(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'slot_position', ci.slot_position,
            'quantity', ci.quantity,
            'item', json_build_object(
                'id', i.id,
                'item_key', i.item_key,
                'name', i.name,
                'description', i.description,
                'rarity', i.rarity,
                'type', i.type,
                'subtype', i.subtype,
                'icon', i.icon,
                'level_requirement', i.level_requirement,
                'class_requirement', i.class_requirement,
                'base_value', i.base_value,
                'stackable', i.stackable,
                'max_stack', i.max_stack,
                'max_durability', i.max_durability,
                'set_name', i.set_name,
                'set_bonus', i.set_bonus,
                'requirements_stats', i.requirements_stats,
                -- NEW 10 STATS
                'agility_bonus', i.agility_bonus,
                'precision_bonus', i.precision_bonus,
                'evasion_bonus', i.evasion_bonus,
                'intelligence_bonus', i.intelligence_bonus,
                'spell_power_bonus', i.spell_power_bonus,
                'resistance_bonus', i.resistance_bonus,
                'strength_bonus', i.strength_bonus,
                'endurance_bonus', i.endurance_bonus,
                'armor_bonus', i.armor_bonus,
                'stealth_bonus', i.stealth_bonus,
                -- DERIVED STATS
                'attack_damage', i.attack_damage,
                'defense', i.defense,
                'health', i.health,
                'mana', i.mana,
                'magic_damage', i.magic_damage,
                'magic_resistance', i.magic_resistance,
                'critical_chance', i.critical_chance,
                'critical_damage', i.critical_damage,
                'attack_speed', i.attack_speed,
                'accuracy', i.accuracy,
                'health_regen', i.health_regen,
                'mana_regen', i.mana_regen
            ),
            'obtained_at', ci.created_at
        ) ORDER BY ci.slot_position
    )
    INTO v_result
    FROM character_inventory ci
    JOIN items i ON ci.item_id = i.id
    WHERE ci.character_id = p_character_id;
    
    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Исправляем функцию get_character_equipment
CREATE OR REPLACE FUNCTION get_character_equipment(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'slot', ce.slot,
            'equipped_at', ce.equipped_at,
            'item', json_build_object(
                'id', i.id,
                'item_key', i.item_key,
                'name', i.name,
                'description', i.description,
                'rarity', i.rarity,
                'type', i.type,
                'subtype', i.subtype,
                'icon', i.icon,
                'level_requirement', i.level_requirement,
                'class_requirement', i.class_requirement,
                'base_value', i.base_value,
                'stackable', i.stackable,
                'max_stack', i.max_stack,
                'max_durability', i.max_durability,
                'set_name', i.set_name,
                'set_bonus', i.set_bonus,
                'requirements_stats', i.requirements_stats,
                -- NEW 10 STATS
                'agility_bonus', i.agility_bonus,
                'precision_bonus', i.precision_bonus,
                'evasion_bonus', i.evasion_bonus,
                'intelligence_bonus', i.intelligence_bonus,
                'spell_power_bonus', i.spell_power_bonus,
                'resistance_bonus', i.resistance_bonus,
                'strength_bonus', i.strength_bonus,
                'endurance_bonus', i.endurance_bonus,
                'armor_bonus', i.armor_bonus,
                'stealth_bonus', i.stealth_bonus,
                -- DERIVED STATS
                'attack_damage', i.attack_damage,
                'defense', i.defense,
                'health', i.health,
                'mana', i.mana,
                'magic_damage', i.magic_damage,
                'magic_resistance', i.magic_resistance,
                'critical_chance', i.critical_chance,
                'critical_damage', i.critical_damage,
                'attack_speed', i.attack_speed,
                'accuracy', i.accuracy,
                'health_regen', i.health_regen,
                'mana_regen', i.mana_regen
            )
        )
    )
    INTO v_result
    FROM character_equipment ce
    JOIN items i ON ce.item_id = i.id
    WHERE ce.character_id = p_character_id;
    
    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
