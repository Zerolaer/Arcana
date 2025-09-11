-- Исправление сохранения изученных навыков
-- Проблема: навыки не сохраняются, деньги списываются

-- 1. Проверяем структуру таблицы character_active_skills
SELECT 'СТРУКТУРА character_active_skills:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'character_active_skills'
ORDER BY ordinal_position;

-- 2. Проверяем есть ли данные в таблице
SELECT 'ДАННЫЕ В character_active_skills:' as info;
SELECT COUNT(*) as count FROM character_active_skills;

-- 3. Показываем первые записи
SELECT 'ПЕРВЫЕ ЗАПИСИ character_active_skills:' as info;
SELECT * FROM character_active_skills LIMIT 5;

-- 4. Пересоздаем функцию изучения навыка с улучшенной логикой
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
        'skill_learned', p_skill_key
    );
END;
$$ LANGUAGE plpgsql;

-- 5. Пересоздаем функцию получения активных навыков с правильной логикой
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

-- 6. Тестовая функция для проверки изучения навыка
CREATE OR REPLACE FUNCTION test_skill_learning(p_character_id UUID, p_skill_key TEXT)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_skills_before INTEGER;
    v_skills_after INTEGER;
    v_gold_before INTEGER;
    v_gold_after INTEGER;
BEGIN
    -- Записываем состояние до изучения
    SELECT gold INTO v_gold_before FROM characters WHERE id = p_character_id;
    SELECT COUNT(*) INTO v_skills_before 
    FROM character_active_skills 
    WHERE character_id = p_character_id AND is_learned = true;
    
    -- Изучаем навык
    SELECT learn_active_skill(p_character_id, p_skill_key) INTO v_result;
    
    -- Записываем состояние после изучения
    SELECT gold INTO v_gold_after FROM characters WHERE id = p_character_id;
    SELECT COUNT(*) INTO v_skills_after 
    FROM character_active_skills 
    WHERE character_id = p_character_id AND is_learned = true;
    
    -- Возвращаем результат с дополнительной информацией
    RETURN json_build_object(
        'learn_result', v_result,
        'gold_before', v_gold_before,
        'gold_after', v_gold_after,
        'skills_before', v_skills_before,
        'skills_after', v_skills_after,
        'gold_spent', v_gold_before - v_gold_after,
        'skills_gained', v_skills_after - v_skills_before
    );
END;
$$ LANGUAGE plpgsql;

SELECT '✅ ФУНКЦИИ СОХРАНЕНИЯ НАВЫКОВ ИСПРАВЛЕНЫ!' as result;
