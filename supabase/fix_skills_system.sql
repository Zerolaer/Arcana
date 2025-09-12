-- ============================================
-- ИСПРАВЛЕНИЕ СИСТЕМЫ СКИЛЛОВ
-- ============================================

-- Добавляем поле skill_key в таблицу skills
ALTER TABLE skills ADD COLUMN IF NOT EXISTS skill_key TEXT;

-- Обновляем существующие скиллы с их ключами
UPDATE skills SET skill_key = 'archer_basic_shot' WHERE name = 'Выстрел с натяжкой';
UPDATE skills SET skill_key = 'archer_power_shot' WHERE name = 'Двойной выстрел';
UPDATE skills SET skill_key = 'archer_arrow_rain' WHERE name = 'Град стрел';
UPDATE skills SET skill_key = 'archer_hawk_eye' WHERE name = 'Инстинкты охотника';
UPDATE skills SET skill_key = 'archer_warding_barrier' WHERE name = 'Танец ветра';
UPDATE skills SET skill_key = 'archer_storm_volley' WHERE name = 'Смертоносный шквал';

UPDATE skills SET skill_key = 'mage_basic_bolt' WHERE name = 'Искра';
UPDATE skills SET skill_key = 'mage_fireball' WHERE name = 'Чародейский залп';
UPDATE skills SET skill_key = 'mage_chain_lightning' WHERE name = 'Взрывная волна';
UPDATE skills SET skill_key = 'mage_arcane_empowerment' WHERE name = 'Сила маны';
UPDATE skills SET skill_key = 'mage_mana_shield' WHERE name = 'Магический щит';
UPDATE skills SET skill_key = 'mage_meteor_shower' WHERE name = 'Поглощающее пламя';

UPDATE skills SET skill_key = 'berserker_basic_strike' WHERE name = 'Мощный удар';
UPDATE skills SET skill_key = 'berserker_cleave' WHERE name = 'Рассекающий взмах';
UPDATE skills SET skill_key = 'berserker_whirlwind' WHERE name = 'Вихрь ярости';
UPDATE skills SET skill_key = 'berserker_rage' WHERE name = 'Гнев берсерка';
UPDATE skills SET skill_key = 'berserker_stone_skin' WHERE name = 'Кожа камня';
UPDATE skills SET skill_key = 'berserker_blood_storm' WHERE name = 'Кровавый шторм';

UPDATE skills SET skill_key = 'assassin_heart_strike' WHERE name = 'Удар в сердце';
UPDATE skills SET skill_key = 'assassin_shadow_flash' WHERE name = 'Теневая вспышка';
UPDATE skills SET skill_key = 'assassin_blade_dance' WHERE name = 'Танец клинков';
UPDATE skills SET skill_key = 'assassin_shadow_hunter' WHERE name = 'Тень охотника';
UPDATE skills SET skill_key = 'assassin_smoke_screen' WHERE name = 'Дымовая завеса';
UPDATE skills SET skill_key = 'assassin_blood_ritual' WHERE name = 'Ритуал крови';

-- Исправляем функцию learn_character_skill
CREATE OR REPLACE FUNCTION learn_character_skill(p_character_id UUID, p_skill_key TEXT)
RETURNS JSON AS $$
DECLARE
    v_character RECORD;
    v_skill RECORD;
    v_skill_cost INTEGER;
    v_skill_level_req INTEGER;
    v_result JSON;
    v_already_learned BOOLEAN;
BEGIN
    -- Получаем информацию о персонаже
    SELECT c.*, cc.name as class_name
    INTO v_character
    FROM characters c
    JOIN character_classes cc ON c.class_id = cc.id
    WHERE c.id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Персонаж не найден');
    END IF;
    
    -- Получаем информацию о скилле по skill_key
    SELECT * INTO v_skill FROM skills WHERE skill_key = p_skill_key;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Навык не найден');
    END IF;
    
    -- Проверяем, не изучен ли уже навык
    SELECT EXISTS(
        SELECT 1 FROM character_skills 
        WHERE character_id = p_character_id 
        AND skill_id = v_skill.id
    ) INTO v_already_learned;
    
    IF v_already_learned THEN
        RETURN json_build_object('success', true, 'already_learned', true);
    END IF;
    
    -- Получаем стоимость и требования навыка из статических данных
    CASE v_character.class_name
        WHEN 'Лучник' THEN
            CASE p_skill_key
                WHEN 'archer_basic_shot' THEN v_skill_cost := 0; v_skill_level_req := 1;
                WHEN 'archer_power_shot' THEN v_skill_cost := 100; v_skill_level_req := 5;
                WHEN 'archer_arrow_rain' THEN v_skill_cost := 500; v_skill_level_req := 10;
                WHEN 'archer_hawk_eye' THEN v_skill_cost := 1000; v_skill_level_req := 15;
                WHEN 'archer_warding_barrier' THEN v_skill_cost := 2000; v_skill_level_req := 20;
                WHEN 'archer_storm_volley' THEN v_skill_cost := 5000; v_skill_level_req := 25;
                ELSE RETURN json_build_object('success', false, 'error', 'Неизвестный навык');
            END CASE;
        WHEN 'Маг' THEN
            CASE p_skill_key
                WHEN 'mage_basic_bolt' THEN v_skill_cost := 0; v_skill_level_req := 1;
                WHEN 'mage_fireball' THEN v_skill_cost := 100; v_skill_level_req := 5;
                WHEN 'mage_chain_lightning' THEN v_skill_cost := 500; v_skill_level_req := 10;
                WHEN 'mage_arcane_empowerment' THEN v_skill_cost := 1000; v_skill_level_req := 15;
                WHEN 'mage_mana_shield' THEN v_skill_cost := 2000; v_skill_level_req := 20;
                WHEN 'mage_meteor_shower' THEN v_skill_cost := 5000; v_skill_level_req := 25;
                ELSE RETURN json_build_object('success', false, 'error', 'Неизвестный навык');
            END CASE;
        WHEN 'Берсерк' THEN
            CASE p_skill_key
                WHEN 'berserker_basic_strike' THEN v_skill_cost := 0; v_skill_level_req := 1;
                WHEN 'berserker_cleave' THEN v_skill_cost := 100; v_skill_level_req := 5;
                WHEN 'berserker_whirlwind' THEN v_skill_cost := 500; v_skill_level_req := 10;
                WHEN 'berserker_rage' THEN v_skill_cost := 1000; v_skill_level_req := 15;
                WHEN 'berserker_stone_skin' THEN v_skill_cost := 2000; v_skill_level_req := 20;
                WHEN 'berserker_blood_storm' THEN v_skill_cost := 5000; v_skill_level_req := 25;
                ELSE RETURN json_build_object('success', false, 'error', 'Неизвестный навык');
            END CASE;
        WHEN 'Ассасин' THEN
            CASE p_skill_key
                WHEN 'assassin_heart_strike' THEN v_skill_cost := 0; v_skill_level_req := 1;
                WHEN 'assassin_shadow_flash' THEN v_skill_cost := 100; v_skill_level_req := 5;
                WHEN 'assassin_blade_dance' THEN v_skill_cost := 500; v_skill_level_req := 10;
                WHEN 'assassin_shadow_hunter' THEN v_skill_cost := 1000; v_skill_level_req := 15;
                WHEN 'assassin_smoke_screen' THEN v_skill_cost := 2000; v_skill_level_req := 20;
                WHEN 'assassin_blood_ritual' THEN v_skill_cost := 5000; v_skill_level_req := 25;
                ELSE RETURN json_build_object('success', false, 'error', 'Неизвестный навык');
            END CASE;
        ELSE
            RETURN json_build_object('success', false, 'error', 'Неизвестный класс');
    END CASE;
    
    -- Проверяем уровень
    IF v_character.level < v_skill_level_req THEN
        RETURN json_build_object('success', false, 'error', 'Недостаточный уровень');
    END IF;
    
    -- Проверяем золото
    IF v_character.gold < v_skill_cost THEN
        RETURN json_build_object('success', false, 'error', 'Недостаточно золота');
    END IF;
    
    -- Списываем золото
    UPDATE characters 
    SET gold = gold - v_skill_cost 
    WHERE id = p_character_id;
    
    -- Добавляем навык с правильным UUID
    INSERT INTO character_skills (character_id, skill_id, level, damage, cooldown, mana_cost)
    VALUES (p_character_id, v_skill.id, 1, 0, 0, 0);
    
    RETURN json_build_object(
        'success', true, 
        'skill_learned', p_skill_key,
        'cost_paid', v_skill_cost
    );
END;
$$ LANGUAGE plpgsql;

-- Функция для получения изученных скиллов по skill_key
CREATE OR REPLACE FUNCTION get_character_learned_skills(p_character_id UUID)
RETURNS TEXT[] AS $$
DECLARE
    v_skill_keys TEXT[];
BEGIN
    SELECT ARRAY_AGG(s.skill_key)
    INTO v_skill_keys
    FROM character_skills cs
    JOIN skills s ON cs.skill_id = s.id
    WHERE cs.character_id = p_character_id
    AND s.skill_key IS NOT NULL;
    
    RETURN COALESCE(v_skill_keys, ARRAY[]::TEXT[]);
END;
$$ LANGUAGE plpgsql;
