-- ================================================
-- ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ ХАРАКТЕРИСТИК ПЕРСОНАЖЕЙ
-- ================================================

-- Функция для принудительного обновления характеристик персонажа
CREATE OR REPLACE FUNCTION force_update_character_stats(p_character_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_character RECORD;
    v_class_name TEXT;
    v_passive_bonuses JSON;
    v_base_stats RECORD;
BEGIN
    -- Получаем базовые характеристики персонажа (без бонусов)
    SELECT 
        c.agility, c.precision, c.evasion, c.intelligence, c.spell_power, 
        c.resistance, c.strength, c.endurance, c.armor, c.stealth,
        c.level, cc.name as class_name
    INTO v_base_stats
    FROM characters c
    JOIN character_classes cc ON c.class_id = cc.id
    WHERE c.id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Получаем бонусы от пассивных навыков
    SELECT calculate_passive_skill_bonuses(p_character_id) INTO v_passive_bonuses;
    
    -- Обновляем характеристики с учетом пассивных навыков
    UPDATE characters SET
        -- Базовые характеристики с бонусами от пассивных навыков
        agility = v_base_stats.agility + COALESCE((v_passive_bonuses->>'agility')::INTEGER, 0),
        precision = v_base_stats.precision + COALESCE((v_passive_bonuses->>'precision')::INTEGER, 0),
        evasion = v_base_stats.evasion + COALESCE((v_passive_bonuses->>'evasion')::INTEGER, 0),
        intelligence = v_base_stats.intelligence + COALESCE((v_passive_bonuses->>'intelligence')::INTEGER, 0),
        spell_power = v_base_stats.spell_power + COALESCE((v_passive_bonuses->>'spell_power')::INTEGER, 0),
        resistance = v_base_stats.resistance + COALESCE((v_passive_bonuses->>'resistance')::INTEGER, 0),
        strength = v_base_stats.strength + COALESCE((v_passive_bonuses->>'strength')::INTEGER, 0),
        endurance = v_base_stats.endurance + COALESCE((v_passive_bonuses->>'endurance')::INTEGER, 0),
        armor = v_base_stats.armor + COALESCE((v_passive_bonuses->>'armor')::INTEGER, 0),
        stealth = v_base_stats.stealth + COALESCE((v_passive_bonuses->>'stealth')::INTEGER, 0),
        updated_at = NOW()
    WHERE id = p_character_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Функция для обновления всех персонажей
CREATE OR REPLACE FUNCTION update_all_characters_with_passive_skills()
RETURNS INTEGER AS $$
DECLARE
    v_character RECORD;
    v_updated_count INTEGER := 0;
BEGIN
    -- Обновляем каждого персонажа
    FOR v_character IN 
        SELECT id FROM characters
    LOOP
        IF force_update_character_stats(v_character.id) THEN
            v_updated_count := v_updated_count + 1;
        END IF;
    END LOOP;
    
    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- Обновляем всех персонажей
SELECT update_all_characters_with_passive_skills() as updated_characters;

-- Проверяем результат
SELECT 
    c.name,
    c.level,
    cc.name as class_name,
    c.agility,
    c.precision,
    c.strength,
    c.intelligence,
    c.spell_power,
    c.stealth,
    c.attack_damage,
    c.magic_damage,
    c.defense
FROM characters c
JOIN character_classes cc ON c.class_id = cc.id
ORDER BY c.created_at DESC
LIMIT 5;
