-- СИСТЕМА НАВЫКОВ - SQL СХЕМА
-- Создаем таблицы для пассивных и активных навыков

-- 1. Таблица пассивных навыков
CREATE TABLE IF NOT EXISTS passive_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    level_requirement INTEGER NOT NULL,
    icon VARCHAR(10) DEFAULT '🛡️',
    
    -- Бонусы к статам (10 новых статов)
    strength_bonus INTEGER DEFAULT 0,
    agility_bonus INTEGER DEFAULT 0,
    intelligence_bonus INTEGER DEFAULT 0,
    precision_bonus INTEGER DEFAULT 0,
    evasion_bonus INTEGER DEFAULT 0,
    spell_power_bonus INTEGER DEFAULT 0,
    resistance_bonus INTEGER DEFAULT 0,
    endurance_bonus INTEGER DEFAULT 0,
    armor_bonus INTEGER DEFAULT 0,
    stealth_bonus INTEGER DEFAULT 0,
    
    -- Метаданные
    class_requirements VARCHAR(50)[], -- Для будущего развития
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Таблица активных навыков
CREATE TABLE IF NOT EXISTS active_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    level_requirement INTEGER NOT NULL,
    icon VARCHAR(10) DEFAULT '⚔️',
    
    -- Характеристики навыка
    skill_type VARCHAR(20) CHECK (skill_type IN ('active', 'aoe', 'buff', 'barrier', 'ultimate')) DEFAULT 'active',
    damage_type VARCHAR(20) CHECK (damage_type IN ('physical', 'magical')) DEFAULT 'physical',
    base_damage INTEGER DEFAULT 0,
    mana_cost INTEGER DEFAULT 0,
    cooldown INTEGER DEFAULT 0,
    scaling_stat VARCHAR(20) CHECK (scaling_stat IN ('strength', 'agility', 'intelligence', 'spell_power', 'endurance', 'stealth')) DEFAULT 'strength',
    scaling_ratio DECIMAL(5,2) DEFAULT 1.0,
    
    -- Требования и стоимость
    class_requirements VARCHAR(50)[] NOT NULL,
    cost_to_learn INTEGER DEFAULT 0,
    
    -- Метаданные
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Таблица изученных пассивных навыков персонажа
CREATE TABLE IF NOT EXISTS character_passive_skills (
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES passive_skills(id) ON DELETE CASCADE,
    is_learned BOOLEAN DEFAULT false,
    learned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (character_id, skill_id)
);

-- 4. Таблица изученных активных навыков персонажа
CREATE TABLE IF NOT EXISTS character_active_skills (
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES active_skills(id) ON DELETE CASCADE,
    is_learned BOOLEAN DEFAULT false,
    skill_level INTEGER DEFAULT 1,
    learned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (character_id, skill_id)
);

-- 5. Таблица нодов развития навыков (заглушка для будущего)
CREATE TABLE IF NOT EXISTS skill_nodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill_id UUID REFERENCES active_skills(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    damage_multiplier DECIMAL(5,2) DEFAULT 1.0,
    cooldown_reduction INTEGER DEFAULT 0,
    mana_cost_reduction INTEGER DEFAULT 0,
    additional_effects TEXT[],
    icon VARCHAR(10) DEFAULT '🌟',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Таблица изученных нодов персонажа
CREATE TABLE IF NOT EXISTS character_skill_nodes (
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    node_id UUID REFERENCES skill_nodes(id) ON DELETE CASCADE,
    is_unlocked BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (character_id, node_id)
);

-- Создаем индексы для производительности
CREATE INDEX IF NOT EXISTS idx_passive_skills_level ON passive_skills(level_requirement);
CREATE INDEX IF NOT EXISTS idx_active_skills_level ON active_skills(level_requirement);
CREATE INDEX IF NOT EXISTS idx_active_skills_class ON active_skills USING GIN(class_requirements);
CREATE INDEX IF NOT EXISTS idx_character_passive_skills_char ON character_passive_skills(character_id);
CREATE INDEX IF NOT EXISTS idx_character_active_skills_char ON character_active_skills(character_id);
CREATE INDEX IF NOT EXISTS idx_skill_nodes_skill ON skill_nodes(skill_id);

-- Триггеры для updated_at
CREATE TRIGGER update_passive_skills_updated_at 
    BEFORE UPDATE ON passive_skills 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_active_skills_updated_at 
    BEFORE UPDATE ON active_skills 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для получения изученных пассивных навыков персонажа
CREATE OR REPLACE FUNCTION get_character_passive_skills(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'skill_key', ps.skill_key,
            'name', ps.name,
            'description', ps.description,
            'level_requirement', ps.level_requirement,
            'icon', ps.icon,
            'is_learned', COALESCE(cps.is_learned, false),
            'stat_bonuses', json_build_object(
                'strength', ps.strength_bonus,
                'agility', ps.agility_bonus,
                'intelligence', ps.intelligence_bonus,
                'precision', ps.precision_bonus,
                'evasion', ps.evasion_bonus,
                'spell_power', ps.spell_power_bonus,
                'resistance', ps.resistance_bonus,
                'endurance', ps.endurance_bonus,
                'armor', ps.armor_bonus,
                'stealth', ps.stealth_bonus
            )
        )
    ) INTO result
    FROM passive_skills ps
    LEFT JOIN character_passive_skills cps ON ps.id = cps.skill_id AND cps.character_id = p_character_id
    ORDER BY ps.level_requirement;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- Функция для получения изученных активных навыков персонажа
CREATE OR REPLACE FUNCTION get_character_active_skills(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'skill_key', a_skills.skill_key,
            'name', a_skills.name,
            'description', a_skills.description,
            'level_requirement', a_skills.level_requirement,
            'icon', a_skills.icon,
            'skill_type', a_skills.skill_type,
            'damage_type', a_skills.damage_type,
            'base_damage', a_skills.base_damage,
            'mana_cost', a_skills.mana_cost,
            'cooldown', a_skills.cooldown,
            'scaling_stat', a_skills.scaling_stat,
            'scaling_ratio', a_skills.scaling_ratio,
            'cost_to_learn', a_skills.cost_to_learn,
            'is_learned', COALESCE(cas.is_learned, false),
            'skill_level', COALESCE(cas.skill_level, 1)
        )
    ) INTO result
    FROM active_skills a_skills
    LEFT JOIN character_active_skills cas ON a_skills.id = cas.skill_id AND cas.character_id = p_character_id
    ORDER BY a_skills.level_requirement;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- Функция для изучения активного навыка
CREATE OR REPLACE FUNCTION learn_active_skill(p_character_id UUID, p_skill_key VARCHAR)
RETURNS JSON AS $$
DECLARE
    v_skill_id UUID;
    v_cost INTEGER;
    v_character_gold INTEGER;
BEGIN
    -- Получаем ID навыка и его стоимость
    SELECT id, cost_to_learn INTO v_skill_id, v_cost
    FROM active_skills a_skills
    WHERE a_skills.skill_key = p_skill_key;
    
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

SELECT '✅ СИСТЕМА НАВЫКОВ СОЗДАНА!' as result;
