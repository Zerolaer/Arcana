-- ================================================
-- ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ИЗУЧЕННЫХ СКИЛЛОВ ПЕРСОНАЖА
-- ================================================

-- Удаляем существующие функции, если они есть
DROP FUNCTION IF EXISTS get_character_learned_skills(UUID);
DROP FUNCTION IF EXISTS get_character_available_skills(UUID);
DROP FUNCTION IF EXISTS learn_skill(UUID, UUID);

-- Функция для получения изученных скиллов персонажа из новой схемы
CREATE OR REPLACE FUNCTION get_character_learned_skills(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_character_class_name TEXT;
BEGIN
    -- Получаем название класса персонажа
    SELECT cc.name INTO v_character_class_name
    FROM characters c
    JOIN character_classes cc ON cc.id = c.class_id
    WHERE c.id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Персонаж не найден');
    END IF;
    
    -- Получаем изученные скиллы персонажа
    SELECT json_agg(
        json_build_object(
            'id', s.id,
            'name', s.name,
            'description', s.description,
            'skill_type', s.skill_type,
            'level_requirement', s.required_level,
            'mana_cost', s.mana_cost,
            'cooldown', s.cooldown,
            'base_damage', s.base_damage,
            'damage_type', s.damage_type,
            'scaling_stat', s.scaling_stat,
            'scaling_ratio', s.scaling_ratio,
            'special_effects', s.special_effects,
            'icon', s.icon,
            'is_learned', true,
            'level', cs.level
        ) ORDER BY s.required_level
    ) INTO v_result
    FROM character_skills cs
    JOIN skills s ON s.id = cs.skill_id
    WHERE cs.character_id = p_character_id
    AND s.required_class @> ARRAY[v_character_class_name]::TEXT[];
    
    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- Функция для получения всех доступных скиллов класса (изученных и не изученных)
CREATE OR REPLACE FUNCTION get_character_available_skills(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_character_class_name TEXT;
    v_character_level INTEGER;
BEGIN
    -- Получаем информацию о персонаже
    SELECT cc.name, c.level INTO v_character_class_name, v_character_level
    FROM characters c
    JOIN character_classes cc ON cc.id = c.class_id
    WHERE c.id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Персонаж не найден');
    END IF;
    
    -- Получаем все скиллы класса с информацией об изучении
    SELECT json_agg(
        json_build_object(
            'id', s.id,
            'name', s.name,
            'description', s.description,
            'skill_type', s.skill_type,
            'level_requirement', s.required_level,
            'mana_cost', s.mana_cost,
            'cooldown', s.cooldown,
            'base_damage', s.base_damage,
            'damage_type', s.damage_type,
            'scaling_stat', s.scaling_stat,
            'scaling_ratio', s.scaling_ratio,
            'special_effects', s.special_effects,
            'icon', s.icon,
            'is_learned', COALESCE(cs.skill_id IS NOT NULL, false),
            'can_learn', s.required_level <= v_character_level,
            'level', COALESCE(cs.level, 0)
        ) ORDER BY s.required_level
    ) INTO v_result
    FROM skills s
    LEFT JOIN character_skills cs ON (
        cs.skill_id = s.id AND 
        cs.character_id = p_character_id
    )
    WHERE s.required_class @> ARRAY[v_character_class_name]::TEXT[];
    
    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- Функция для изучения скилла
CREATE OR REPLACE FUNCTION learn_skill(
    p_character_id UUID,
    p_skill_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_skill_cost INTEGER;
    v_character_gold INTEGER;
    v_character_level INTEGER;
    v_skill_level_req INTEGER;
    v_already_learned BOOLEAN;
BEGIN
    -- Получаем информацию о скилле и персонаже
    SELECT s.required_level, 100 INTO v_skill_level_req, v_skill_cost
    FROM skills s
    WHERE s.id = p_skill_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Скилл не найден');
    END IF;
    
    SELECT c.level, c.gold INTO v_character_level, v_character_gold
    FROM characters c
    WHERE c.id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Персонаж не найден');
    END IF;
    
    -- Проверяем уровень
    IF v_character_level < v_skill_level_req THEN
        RETURN json_build_object('success', false, 'error', 'Недостаточный уровень');
    END IF;
    
    -- Проверяем, не изучен ли уже
    SELECT EXISTS(
        SELECT 1 FROM character_skills 
        WHERE character_id = p_character_id AND skill_id = p_skill_id
    ) INTO v_already_learned;
    
    IF v_already_learned THEN
        RETURN json_build_object('success', false, 'error', 'Скилл уже изучен');
    END IF;
    
    -- Проверяем золото
    IF v_character_gold < v_skill_cost THEN
        RETURN json_build_object('success', false, 'error', 'Недостаточно золота');
    END IF;
    
    -- Списываем золото
    UPDATE characters 
    SET gold = gold - v_skill_cost 
    WHERE id = p_character_id;
    
    -- Добавляем скилл
    INSERT INTO character_skills (character_id, skill_id, level)
    VALUES (p_character_id, p_skill_id, 1);
    
    RETURN json_build_object('success', true, 'gold_spent', v_skill_cost);
END;
$$ LANGUAGE plpgsql;
