-- Исправление функции изучения активных навыков
-- Проблема: деньги снимаются, но навык не изучается

-- Удаляем старую функцию если есть
DROP FUNCTION IF EXISTS learn_active_skill(UUID, TEXT);

-- Создаем исправленную функцию изучения активных навыков
CREATE OR REPLACE FUNCTION learn_active_skill(
    p_character_id UUID,
    p_skill_key TEXT
)
RETURNS JSON AS $$
DECLARE
    v_skill_id UUID;
    v_cost INTEGER;
    v_character_gold INTEGER;
    v_character_class TEXT;
    v_skill_class_requirements TEXT[];
    v_skill_level_requirement INTEGER;
BEGIN
    -- Получаем информацию о навыке
    SELECT 
        id, 
        cost, 
        level_requirement,
        class_requirements
    INTO 
        v_skill_id, 
        v_cost, 
        v_skill_level_requirement,
        v_skill_class_requirements
    FROM active_skills
    WHERE skill_key = p_skill_key;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Skill not found');
    END IF;
    
    -- Получаем информацию о персонаже
    SELECT 
        gold,
        level
    INTO 
        v_character_gold,
        v_character_class
    FROM characters 
    WHERE id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Character not found');
    END IF;
    
    -- Проверяем уровень персонажа
    IF v_character_class < v_skill_level_requirement THEN
        RETURN json_build_object('success', false, 'error', 'Level requirement not met');
    END IF;
    
    -- Проверяем достаточно ли золота
    IF v_character_gold < v_cost THEN
        RETURN json_build_object('success', false, 'error', 'Not enough gold');
    END IF;
    
    -- Проверяем не изучен ли уже навык
    IF EXISTS (
        SELECT 1 FROM character_active_skills 
        WHERE character_id = p_character_id 
        AND skill_id = v_skill_id 
        AND is_learned = true
    ) THEN
        RETURN json_build_object('success', false, 'error', 'Skill already learned');
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
    
    RETURN json_build_object(
        'success', true, 
        'gold_spent', v_cost,
        'skill_learned', p_skill_key
    );
END;
$$ LANGUAGE plpgsql;

-- Также исправим функцию получения изученных активных навыков
DROP FUNCTION IF EXISTS get_character_active_skills(UUID);

CREATE OR REPLACE FUNCTION get_character_active_skills(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', cas.skill_id,
            'skill_key', a_skills.skill_key,
            'name', a_skills.name,
            'description', a_skills.description,
            'is_learned', cas.is_learned,
            'cost', a_skills.cost,
            'level_requirement', a_skills.level_requirement,
            'stat_bonuses', COALESCE(a_skills.stat_bonuses, '{}')
        ) ORDER BY a_skills.level_requirement
    ) INTO v_result
    FROM character_active_skills cas
    JOIN active_skills a_skills ON a_skills.id = cas.skill_id
    WHERE cas.character_id = p_character_id;
    
    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- Тестовая функция для проверки изучения навыка
CREATE OR REPLACE FUNCTION test_learn_skill(p_character_id UUID, p_skill_key TEXT)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Вызываем функцию изучения
    SELECT learn_active_skill(p_character_id, p_skill_key) INTO v_result;
    
    -- Возвращаем результат с дополнительной информацией
    RETURN json_build_object(
        'learn_result', v_result,
        'character_gold_after', (SELECT gold FROM characters WHERE id = p_character_id),
        'learned_skills_count', (SELECT COUNT(*) FROM character_active_skills WHERE character_id = p_character_id AND is_learned = true)
    );
END;
$$ LANGUAGE plpgsql;

SELECT '✅ ФУНКЦИИ ИЗУЧЕНИЯ НАВЫКОВ ИСПРАВЛЕНЫ!' as result;
