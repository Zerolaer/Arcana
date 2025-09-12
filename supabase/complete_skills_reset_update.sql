-- ================================================
-- ПОЛНОЕ ОБНОВЛЕНИЕ СИСТЕМЫ НАВЫКОВ С СБРОСОМ
-- ================================================

-- Функция для сброса всех навыков персонажа
CREATE OR REPLACE FUNCTION reset_character_skills(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Удаляем все изученные навыки персонажа
    DELETE FROM character_skills 
    WHERE character_id = p_character_id;
    
    -- Возвращаем успешный результат
    v_result := json_build_object(
        'success', true,
        'message', 'Все навыки персонажа сброшены'
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения навыков класса персонажа
CREATE OR REPLACE FUNCTION get_character_class_skills(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_character RECORD;
    v_class_name TEXT;
    v_result JSON;
BEGIN
    -- Получаем информацию о персонаже
    SELECT c.*, cc.name as class_name
    INTO v_character
    FROM characters c
    JOIN character_classes cc ON c.class_id = cc.id
    WHERE c.id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Персонаж не найден');
    END IF;
    
    v_class_name := v_character.class_name;
    
    -- Возвращаем навыки в зависимости от класса
    CASE v_class_name
        WHEN 'Лучник' THEN
            SELECT json_agg(
                json_build_object(
                    'skill_key', skill_id,
                    'name', skill_name,
                    'description', skill_description,
                    'level_requirement', level_req,
                    'icon', skill_icon,
                    'cost_to_learn', cost,
                    'is_learned', level_req <= v_character.level
                )
            ) INTO v_result
            FROM (
                VALUES 
                ('archer_basic_shot', 'Точный Выстрел', 'Базовый выстрел из лука с умеренным уроном', 1, '🏹', 0),
                ('archer_power_shot', 'Мощный Выстрел', 'Заряженный выстрел с повышенным уроном', 5, '🎯', 100),
                ('archer_arrow_rain', 'Дождь Стрел', 'Обстреливает область несколькими стрелами', 10, '☔', 500),
                ('archer_hawk_eye', 'Глаз Ястреба', 'Увеличивает точность и критический урон', 15, '👁️', 1000),
                ('archer_warding_barrier', 'Защитный Барьер', 'Создает барьер, поглощающий урон', 20, '🛡️', 2000),
                ('archer_storm_volley', 'Штормовой Залп', 'Массивная атака с множественными выстрелами и лечением', 25, '⛈️', 5000)
            ) AS skills(skill_id, skill_name, skill_description, level_req, skill_icon, cost);
            
        WHEN 'Маг' THEN
            SELECT json_agg(
                json_build_object(
                    'skill_key', skill_id,
                    'name', skill_name,
                    'description', skill_description,
                    'level_requirement', level_req,
                    'icon', skill_icon,
                    'cost_to_learn', cost,
                    'is_learned', level_req <= v_character.level
                )
            ) INTO v_result
            FROM (
                VALUES 
                ('mage_basic_bolt', 'Магическая Стрела', 'Базовая магическая атака', 1, '🔮', 0),
                ('mage_fireball', 'Огненный Шар', 'Мощный огненный снаряд с поджогом', 5, '🔥', 100),
                ('mage_chain_lightning', 'Цепная Молния', 'Молния, перескакивающая между врагами', 10, '⚡', 500),
                ('mage_arcane_empowerment', 'Чародейское Усиление', 'Увеличивает магический урон и регенерацию маны', 15, '✨', 1000),
                ('mage_mana_shield', 'Мана-Щит', 'Создает щит, поглощающий урон за счет маны', 20, '🔵', 2000),
                ('mage_meteor_shower', 'Метеоритный Дождь', 'Призывает метеориты на область с лечением', 25, '☄️', 5000)
            ) AS skills(skill_id, skill_name, skill_description, level_req, skill_icon, cost);
            
        WHEN 'Берсерк' THEN
            SELECT json_agg(
                json_build_object(
                    'skill_key', skill_id,
                    'name', skill_name,
                    'description', skill_description,
                    'level_requirement', level_req,
                    'icon', skill_icon,
                    'cost_to_learn', cost,
                    'is_learned', level_req <= v_character.level
                )
            ) INTO v_result
            FROM (
                VALUES 
                ('berserker_basic_strike', 'Мощный Удар', 'Базовый физический удар', 1, '🪓', 0),
                ('berserker_devastating_blow', 'Опустошающий Удар', 'Сокрушительная атака с высоким уроном', 5, '💥', 100),
                ('berserker_whirlwind', 'Смерч', 'Вращательная атака, поражающая всех вокруг', 10, '🌪️', 500),
                ('berserker_bloodlust', 'Кровожадность', 'Увеличивает физический урон и скорость атаки', 15, '🩸', 1000),
                ('berserker_iron_skin', 'Железная Кожа', 'Временно увеличивает броню и сопротивление', 20, '🛡️', 2000),
                ('berserker_apocalypse', 'Апокалипсис', 'Массивная атака с восстановлением здоровья', 25, '💀', 5000)
            ) AS skills(skill_id, skill_name, skill_description, level_req, skill_icon, cost);
            
        WHEN 'Ассасин' THEN
            SELECT json_agg(
                json_build_object(
                    'skill_key', skill_id,
                    'name', skill_name,
                    'description', skill_description,
                    'level_requirement', level_req,
                    'icon', skill_icon,
                    'cost_to_learn', cost,
                    'is_learned', level_req <= v_character.level
                )
            ) INTO v_result
            FROM (
                VALUES 
                ('assassin_basic_stab', 'Быстрый Укол', 'Быстрая атака с высокой скоростью', 1, '🗡️', 0),
                ('assassin_backstab', 'Удар в Спину', 'Скрытая атака с критическим уроном', 5, '🗡️', 100),
                ('assassin_poison_dart', 'Ядовитая Стрела', 'Атака с ядом, поражающая нескольких врагов', 10, '🟢', 500),
                ('assassin_shadow_cloak', 'Теневой Плащ', 'Увеличивает скрытность и критический урон', 15, '👤', 1000),
                ('assassin_smoke_bomb', 'Дымовая Бомба', 'Создает дымовую завесу для защиты', 20, '💨', 2000),
                ('assassin_death_mark', 'Метка Смерти', 'Массивная атака с восстановлением при убийстве', 25, '💀', 5000)
            ) AS skills(skill_id, skill_name, skill_description, level_req, skill_icon, cost);
            
        ELSE
            v_result := json_build_array();
    END CASE;
    
    RETURN COALESCE(v_result, json_build_array());
END;
$$ LANGUAGE plpgsql;

-- Функция для изучения навыка
CREATE OR REPLACE FUNCTION learn_character_skill(p_character_id UUID, p_skill_key TEXT)
RETURNS JSON AS $$
DECLARE
    v_character RECORD;
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
    
    -- Проверяем, не изучен ли уже навык
    SELECT EXISTS(
        SELECT 1 FROM character_skills 
        WHERE character_id = p_character_id 
        AND skill_id = p_skill_key
    ) INTO v_already_learned;
    
    IF v_already_learned THEN
        RETURN json_build_object('success', true, 'already_learned', true);
    END IF;
    
    -- Получаем стоимость и требования навыка
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
                WHEN 'berserker_devastating_blow' THEN v_skill_cost := 100; v_skill_level_req := 5;
                WHEN 'berserker_whirlwind' THEN v_skill_cost := 500; v_skill_level_req := 10;
                WHEN 'berserker_bloodlust' THEN v_skill_cost := 1000; v_skill_level_req := 15;
                WHEN 'berserker_iron_skin' THEN v_skill_cost := 2000; v_skill_level_req := 20;
                WHEN 'berserker_apocalypse' THEN v_skill_cost := 5000; v_skill_level_req := 25;
                ELSE RETURN json_build_object('success', false, 'error', 'Неизвестный навык');
            END CASE;
        WHEN 'Ассасин' THEN
            CASE p_skill_key
                WHEN 'assassin_basic_stab' THEN v_skill_cost := 0; v_skill_level_req := 1;
                WHEN 'assassin_backstab' THEN v_skill_cost := 100; v_skill_level_req := 5;
                WHEN 'assassin_poison_dart' THEN v_skill_cost := 500; v_skill_level_req := 10;
                WHEN 'assassin_shadow_cloak' THEN v_skill_cost := 1000; v_skill_level_req := 15;
                WHEN 'assassin_smoke_bomb' THEN v_skill_cost := 2000; v_skill_level_req := 20;
                WHEN 'assassin_death_mark' THEN v_skill_cost := 5000; v_skill_level_req := 25;
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
    
    -- Добавляем навык
    INSERT INTO character_skills (character_id, skill_id, level, damage, cooldown, mana_cost)
    VALUES (p_character_id, p_skill_key, 1, 0, 0, 0);
    
    RETURN json_build_object('success', true, 'cost', v_skill_cost);
END;
$$ LANGUAGE plpgsql;

-- Принудительно обновляем статы всех персонажей для применения изменений
UPDATE characters SET level = level WHERE id IN (SELECT id FROM characters);
