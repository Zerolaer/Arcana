-- ================================================
-- ФУНКЦИИ БОЕВОЙ СИСТЕМЫ
-- ================================================

-- Функция для выполнения атаки
CREATE OR REPLACE FUNCTION perform_attack(
    p_character_id UUID,
    p_skill_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_character characters%ROWTYPE;
    v_skill skills%ROWTYPE;
    v_damage_dealt INTEGER := 0;
    v_damage_taken INTEGER := 0;
    v_mana_cost INTEGER := 0;
    v_victory BOOLEAN := false;
    v_experience_gained INTEGER := 0;
    v_gold_gained INTEGER := 0;
    v_new_health INTEGER;
    v_new_mana INTEGER;
    v_new_experience INTEGER;
    v_new_level INTEGER;
    v_character_died BOOLEAN := false;
BEGIN
    -- Получаем данные персонажа
    SELECT * INTO v_character FROM characters WHERE id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Character not found'
        );
    END IF;

    -- Проверяем, что персонаж не в бою
    IF NOT v_character.is_in_combat THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Character is not in combat'
        );
    END IF;

    -- Если указан скилл, получаем его данные
    IF p_skill_id IS NOT NULL THEN
        SELECT * INTO v_skill FROM skills WHERE id = p_skill_id;
        
        IF NOT FOUND THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Skill not found'
            );
        END IF;
        
        -- Проверяем стоимость маны
        v_mana_cost := v_skill.mana_cost;
        IF v_character.mana < v_mana_cost THEN
            RETURN json_build_object(
                'success', false,
                'error', 'Not enough mana'
            );
        END IF;
    END IF;

    -- Рассчитываем урон (упрощенная формула)
    v_damage_dealt := v_character.attack_damage + v_character.magic_damage;
    IF v_skill IS NOT NULL THEN
        v_damage_dealt := v_damage_dealt + v_skill.base_damage;
    END IF;

    -- Рассчитываем получаемый урон (упрощенная формула)
    v_damage_taken := GREATEST(1, 10 - v_character.defense);

    -- Обновляем ресурсы персонажа
    v_new_health := GREATEST(0, v_character.health - v_damage_taken);
    v_new_mana := GREATEST(0, v_character.mana - v_mana_cost);
    
    -- Проверяем, умер ли персонаж
    v_character_died := (v_new_health <= 0);
    
    -- Если персонаж умер, сбрасываем ману
    IF v_character_died THEN
        v_new_mana := 0;
    END IF;

    -- Обновляем персонажа
    UPDATE characters 
    SET 
        health = v_new_health,
        mana = v_new_mana,
        is_in_combat = NOT v_character_died,
        updated_at = NOW()
    WHERE id = p_character_id;

    -- Возвращаем результат
    RETURN json_build_object(
        'success', true,
        'victory', false, -- Упрощенная логика - всегда false для базовой атаки
        'damage_dealt', v_damage_dealt,
        'damage_taken', v_damage_taken,
        'mana_cost', v_mana_cost,
        'character_died', v_character_died,
        'new_health', v_new_health,
        'new_mana', v_new_mana,
        'experience_gained', v_experience_gained,
        'gold_gained', v_gold_gained
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- Функция для начала боя
CREATE OR REPLACE FUNCTION start_combat(
    p_character_id UUID,
    p_mob_id UUID
)
RETURNS JSON AS $$
DECLARE
    v_character characters%ROWTYPE;
    v_mob mobs%ROWTYPE;
BEGIN
    -- Получаем данные персонажа
    SELECT * INTO v_character FROM characters WHERE id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Character not found'
        );
    END IF;

    -- Получаем данные моба
    SELECT * INTO v_mob FROM mobs WHERE id = p_mob_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Mob not found'
        );
    END IF;

    -- Устанавливаем флаг боя
    UPDATE characters 
    SET 
        is_in_combat = true,
        updated_at = NOW()
    WHERE id = p_character_id;

    RETURN json_build_object(
        'success', true,
        'mob_name', v_mob.name,
        'mob_health', v_mob.health,
        'mob_max_health', v_mob.max_health
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;

-- Функция для окончания боя
CREATE OR REPLACE FUNCTION end_combat(
    p_character_id UUID,
    p_victory BOOLEAN,
    p_experience_gained INTEGER DEFAULT 0,
    p_gold_gained INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    v_character characters%ROWTYPE;
    v_new_experience INTEGER;
    v_new_gold INTEGER;
    v_leveled_up BOOLEAN := false;
    v_new_level INTEGER;
BEGIN
    -- Получаем данные персонажа
    SELECT * INTO v_character FROM characters WHERE id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Character not found'
        );
    END IF;

    -- Рассчитываем новый опыт и золото
    v_new_experience := v_character.experience + p_experience_gained;
    v_new_gold := v_character.gold + p_gold_gained;
    
    -- Проверяем повышение уровня (упрощенная логика)
    v_new_level := v_character.level;
    IF v_new_experience >= (v_character.level * 100) THEN
        v_new_level := v_character.level + 1;
        v_leveled_up := true;
    END IF;

    -- Обновляем персонажа
    UPDATE characters 
    SET 
        is_in_combat = false,
        experience = v_new_experience,
        level = v_new_level,
        gold = v_new_gold,
        updated_at = NOW()
    WHERE id = p_character_id;

    RETURN json_build_object(
        'success', true,
        'victory', p_victory,
        'experience_gained', p_experience_gained,
        'gold_gained', p_gold_gained,
        'new_experience', v_new_experience,
        'new_gold', v_new_gold,
        'leveled_up', v_leveled_up,
        'new_level', v_new_level
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Database error: ' || SQLERRM
        );
END;
$$ LANGUAGE plpgsql;
