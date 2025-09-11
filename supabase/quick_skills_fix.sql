-- Быстрое исправление системы навыков
-- Выполните этот скрипт если навыки не изучаются

-- 1. Убедимся что все таблицы существуют
CREATE TABLE IF NOT EXISTS passive_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    level_requirement INTEGER NOT NULL,
    stat_bonuses JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS active_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    level_requirement INTEGER NOT NULL,
    cost INTEGER NOT NULL DEFAULT 100,
    class_requirements TEXT[] DEFAULT '{}',
    stat_bonuses JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS character_passive_skills (
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES passive_skills(id) ON DELETE CASCADE,
    is_learned BOOLEAN DEFAULT false,
    learned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (character_id, skill_id)
);

CREATE TABLE IF NOT EXISTS character_active_skills (
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES active_skills(id) ON DELETE CASCADE,
    is_learned BOOLEAN DEFAULT false,
    learned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (character_id, skill_id)
);

-- 2. Пересоздаем функцию изучения активных навыков
DROP FUNCTION IF EXISTS learn_active_skill(UUID, TEXT);

CREATE OR REPLACE FUNCTION learn_active_skill(
    p_character_id UUID,
    p_skill_key TEXT
)
RETURNS JSON AS $$
DECLARE
    v_skill_id UUID;
    v_cost INTEGER;
    v_character_gold INTEGER;
    v_character_level INTEGER;
BEGIN
    -- Получаем информацию о навыке
    SELECT id, cost INTO v_skill_id, v_cost
    FROM active_skills
    WHERE skill_key = p_skill_key;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Skill not found');
    END IF;
    
    -- Получаем информацию о персонаже
    SELECT gold, level INTO v_character_gold, v_character_level
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

-- 3. Пересоздаем функцию получения активных навыков персонажа
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
            'cost', a_skills.cost,
            'level_requirement', a_skills.level_requirement,
            'stat_bonuses', a_skills.stat_bonuses
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

SELECT '✅ СИСТЕМА НАВЫКОВ ИСПРАВЛЕНА!' as result;
