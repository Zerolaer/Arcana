-- Исправление ошибки "Skill already learned"
-- Проблема: навык уже изучен, но UI не знает об этом

-- 1. Показываем все изученные навыки
SELECT 'ВСЕ ИЗУЧЕННЫЕ НАВЫКИ:' as info;

SELECT 
    c.name as character_name,
    a_skills.skill_key,
    a_skills.name as skill_name,
    cas.is_learned,
    cas.learned_at
FROM character_active_skills cas
JOIN characters c ON c.id = cas.character_id
JOIN active_skills a_skills ON a_skills.id = cas.skill_id
WHERE cas.is_learned = true
ORDER BY c.name, a_skills.level_requirement;

-- 2. Исправляем функцию изучения навыка
-- Теперь она будет возвращать успех если навык уже изучен
DROP FUNCTION IF EXISTS learn_active_skill(UUID, TEXT);

CREATE OR REPLACE FUNCTION learn_active_skill(
    p_character_id UUID,
    p_skill_key TEXT
)
RETURNS JSON AS $$
DECLARE
    v_skill_id UUID;
    v_character_gold INTEGER;
    v_character_level INTEGER;
    v_cost INTEGER := 100;
    v_skill_level_requirement INTEGER;
    v_already_learned BOOLEAN := false;
BEGIN
    -- Получаем информацию о навыке
    SELECT id, level_requirement 
    INTO v_skill_id, v_skill_level_requirement
    FROM active_skills
    WHERE skill_key = p_skill_key;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Skill not found: ' || p_skill_key);
    END IF;
    
    -- Получаем информацию о персонаже
    SELECT gold, level 
    INTO v_character_gold, v_character_level
    FROM characters 
    WHERE id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Character not found');
    END IF;
    
    -- Проверяем уровень персонажа
    IF v_character_level < v_skill_level_requirement THEN
        RETURN json_build_object('success', false, 'error', 'Level requirement not met');
    END IF;
    
    -- Проверяем не изучен ли уже навык
    SELECT EXISTS (
        SELECT 1 FROM character_active_skills 
        WHERE character_id = p_character_id 
        AND skill_id = v_skill_id 
        AND is_learned = true
    ) INTO v_already_learned;
    
    IF v_already_learned THEN
        -- Навык уже изучен - возвращаем успех без списания денег
        RETURN json_build_object(
            'success', true, 
            'gold_spent', 0,
            'skill_learned', p_skill_key,
            'already_learned', true
        );
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
    
    -- Проверяем что навык действительно сохранен
    IF NOT EXISTS (
        SELECT 1 FROM character_active_skills 
        WHERE character_id = p_character_id 
        AND skill_id = v_skill_id 
        AND is_learned = true
    ) THEN
        RETURN json_build_object('success', false, 'error', 'Failed to save skill');
    END IF;
    
    RETURN json_build_object(
        'success', true, 
        'gold_spent', v_cost,
        'skill_learned', p_skill_key,
        'already_learned', false
    );
END;
$$ LANGUAGE plpgsql;

-- 3. Улучшаем функцию получения активных навыков
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
            'cost_to_learn', 100
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

-- 4. Функция для очистки изученных навыков (для тестирования)
CREATE OR REPLACE FUNCTION clear_character_skills(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM character_active_skills 
    WHERE character_id = p_character_id;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN json_build_object(
        'success', true,
        'deleted_skills', v_deleted_count
    );
END;
$$ LANGUAGE plpgsql;

SELECT '✅ ФУНКЦИИ ИСПРАВЛЕНЫ!' as result;
