-- Простые функции для системы навыков
-- Без обращения к несуществующим колонкам

-- 1. Простая функция изучения активного навыка
DROP FUNCTION IF EXISTS learn_active_skill(UUID, TEXT);

CREATE OR REPLACE FUNCTION learn_active_skill(
    p_character_id UUID,
    p_skill_key TEXT
)
RETURNS JSON AS $$
DECLARE
    v_skill_id UUID;
    v_character_gold INTEGER;
    v_cost INTEGER := 100; -- Фиксированная стоимость
BEGIN
    -- Получаем ID навыка
    SELECT id INTO v_skill_id
    FROM active_skills
    WHERE skill_key = p_skill_key;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Skill not found');
    END IF;
    
    -- Получаем золото персонажа
    SELECT gold INTO v_character_gold
    FROM characters 
    WHERE id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Character not found');
    END IF;
    
    -- Проверяем достаточно ли золота
    IF v_character_gold < v_cost THEN
        RETURN json_build_object('success', false, 'error', 'Not enough gold');
    END IF;
    
    -- Изучаем навык
    INSERT INTO character_active_skills (character_id, skill_id, is_learned)
    VALUES (p_character_id, v_skill_id, true)
    ON CONFLICT (character_id, skill_id) 
    DO UPDATE SET is_learned = true;
    
    -- Списываем золото
    UPDATE characters 
    SET gold = gold - v_cost
    WHERE id = p_character_id;
    
    RETURN json_build_object('success', true, 'gold_spent', v_cost);
END;
$$ LANGUAGE plpgsql;

-- 2. Простая функция получения активных навыков персонажа
DROP FUNCTION IF EXISTS get_character_active_skills(UUID);

CREATE OR REPLACE FUNCTION get_character_active_skills(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'skill_key', a_skills.skill_key,
            'name', a_skills.name,
            'description', a_skills.description,
            'is_learned', COALESCE(cas.is_learned, false),
            'level_requirement', a_skills.level_requirement,
            'cost', 100
        ) ORDER BY a_skills.level_requirement
    ) INTO v_result
    FROM active_skills a_skills
    LEFT JOIN character_active_skills cas ON (
        cas.skill_id = a_skills.id AND 
        cas.character_id = p_character_id
    );
    
    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 3. Простая функция получения пассивных навыков персонажа
DROP FUNCTION IF EXISTS get_character_passive_skills(UUID);

CREATE OR REPLACE FUNCTION get_character_passive_skills(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'skill_key', p_skills.skill_key,
            'name', p_skills.name,
            'description', p_skills.description,
            'is_learned', COALESCE(cps.is_learned, false),
            'level_requirement', p_skills.level_requirement
        ) ORDER BY p_skills.level_requirement
    ) INTO v_result
    FROM passive_skills p_skills
    LEFT JOIN character_passive_skills cps ON (
        cps.skill_id = p_skills.id AND 
        cps.character_id = p_character_id
    );
    
    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

SELECT '✅ ПРОСТЫЕ ФУНКЦИИ СОЗДАНЫ!' as result;
