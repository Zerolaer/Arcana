-- ================================================
-- ПОЛНОЕ ОБНОВЛЕНИЕ ПАССИВНЫХ НАВЫКОВ
-- ================================================

-- 1. Функция для получения пассивных навыков персонажа по классу и уровню
CREATE OR REPLACE FUNCTION get_character_passive_skills(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_character RECORD;
    v_class_name TEXT;
    v_result JSON;
BEGIN
    -- Получаем информацию о персонаже
    SELECT c.level, cc.name as class_name
    INTO v_character
    FROM characters c
    JOIN character_classes cc ON c.class_id = cc.id
    WHERE c.id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN '[]'::JSON;
    END IF;
    
    v_class_name := v_character.class_name;
    
    -- Возвращаем пассивные навыки в зависимости от класса
    CASE v_class_name
        WHEN 'Лучник' THEN
            SELECT json_agg(
                json_build_object(
                    'id', skill_id,
                    'name', skill_name,
                    'description', skill_description,
                    'level_requirement', level_req,
                    'icon', skill_icon,
                    'stat_bonuses', stat_bonuses,
                    'is_learned', level_req <= v_character.level,
                    'class_requirements', ARRAY['Лучник']
                )
            ) INTO v_result
            FROM (
                VALUES 
                ('archer_precision', 'Точность Стрелка', 'Увеличивает точность и дальность атаки', 1, '🎯', '{"precision": 8, "agility": 5}'),
                ('wind_dance', 'Танец Ветра', 'Повышает скорость атаки и уклонение', 5, '💨', '{"agility": 10, "evasion": 8}'),
                ('hunter_instincts', 'Инстинкты Охотника', 'Улучшает критический урон и скрытность', 10, '🦅', '{"precision": 12, "stealth": 6}'),
                ('eagle_eye', 'Орлиный Глаз', 'Максимально увеличивает точность и дальность', 15, '👁️', '{"precision": 15, "agility": 8}'),
                ('storm_archer', 'Стрелок Бури', 'Легендарная точность и скорость', 20, '⚡', '{"precision": 20, "agility": 15, "evasion": 10}')
            ) AS skills(skill_id, skill_name, skill_description, level_req, skill_icon, stat_bonuses);
            
        WHEN 'Маг' THEN
            SELECT json_agg(
                json_build_object(
                    'id', skill_id,
                    'name', skill_name,
                    'description', skill_description,
                    'level_requirement', level_req,
                    'icon', skill_icon,
                    'stat_bonuses', stat_bonuses,
                    'is_learned', level_req <= v_character.level,
                    'class_requirements', ARRAY['Маг']
                )
            ) INTO v_result
            FROM (
                VALUES 
                ('arcane_knowledge', 'Арканные Знания', 'Увеличивает магическую силу и интеллект', 1, '📚', '{"intelligence": 10, "spell_power": 8}'),
                ('mana_mastery', 'Владение Маной', 'Улучшает регенерацию маны и сопротивление', 5, '💙', '{"intelligence": 12, "resistance": 10}'),
                ('elemental_affinity', 'Стихийное Сродство', 'Усиливает магический урон и точность', 10, '🔥', '{"spell_power": 15, "precision": 8}'),
                ('arcane_shield', 'Арканный Щит', 'Создает магическую защиту', 15, '🛡️', '{"resistance": 15, "intelligence": 10}'),
                ('archmage_power', 'Сила Архимага', 'Максимальная магическая мощь', 20, '👑', '{"intelligence": 20, "spell_power": 18, "resistance": 12}')
            ) AS skills(skill_id, skill_name, skill_description, level_req, skill_icon, stat_bonuses);
            
        WHEN 'Берсерк' THEN
            SELECT json_agg(
                json_build_object(
                    'id', skill_id,
                    'name', skill_name,
                    'description', skill_description,
                    'level_requirement', level_req,
                    'icon', skill_icon,
                    'stat_bonuses', stat_bonuses,
                    'is_learned', level_req <= v_character.level,
                    'class_requirements', ARRAY['Берсерк']
                )
            ) INTO v_result
            FROM (
                VALUES 
                ('berserker_rage', 'Ярость Берсерка', 'Увеличивает силу и выносливость', 1, '😡', '{"strength": 12, "endurance": 8}'),
                ('iron_skin', 'Железная Кожа', 'Повышает броню и здоровье', 5, '🛡️', '{"armor": 12, "endurance": 10}'),
                ('bloodthirst', 'Кровожадность', 'Увеличивает урон и скорость атаки', 10, '🩸', '{"strength": 15, "agility": 8}'),
                ('unstoppable_force', 'Неудержимая Сила', 'Максимальная физическая мощь', 15, '💥', '{"strength": 18, "endurance": 12}'),
                ('legendary_berserker', 'Легендарный Берсерк', 'Абсолютная ярость и разрушение', 20, '⚔️', '{"strength": 25, "endurance": 18, "armor": 15}')
            ) AS skills(skill_id, skill_name, skill_description, level_req, skill_icon, stat_bonuses);
            
        WHEN 'Ассасин' THEN
            SELECT json_agg(
                json_build_object(
                    'id', skill_id,
                    'name', skill_name,
                    'description', skill_description,
                    'level_requirement', level_req,
                    'icon', skill_icon,
                    'stat_bonuses', stat_bonuses,
                    'is_learned', level_req <= v_character.level,
                    'class_requirements', ARRAY['Ассасин']
                )
            ) INTO v_result
            FROM (
                VALUES 
                ('shadow_step', 'Теневой Шаг', 'Увеличивает скрытность и ловкость', 1, '🌑', '{"stealth": 12, "agility": 8}'),
                ('deadly_precision', 'Смертоносная Точность', 'Улучшает точность и критический урон', 5, '🎯', '{"precision": 10, "stealth": 8}'),
                ('shadow_mastery', 'Владение Тенями', 'Максимальная скрытность и уклонение', 10, '👤', '{"stealth": 15, "evasion": 10}'),
                ('assassin_blade', 'Клинок Ассасина', 'Увеличивает урон из невидимости', 15, '🗡️', '{"stealth": 18, "precision": 12}'),
                ('shadow_lord', 'Повелитель Теней', 'Абсолютное владение скрытностью', 20, '👑', '{"stealth": 25, "agility": 15, "precision": 15}')
            ) AS skills(skill_id, skill_name, skill_description, level_req, skill_icon, stat_bonuses);
            
        ELSE
            v_result := '[]'::JSON;
    END CASE;
    
    RETURN COALESCE(v_result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql;

-- 2. Функция для расчета бонусов от пассивных навыков
CREATE OR REPLACE FUNCTION calculate_passive_skill_bonuses(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_character RECORD;
    v_class_name TEXT;
    v_bonuses JSON;
BEGIN
    -- Получаем информацию о персонаже
    SELECT c.level, cc.name as class_name
    INTO v_character
    FROM characters c
    JOIN character_classes cc ON c.class_id = cc.id
    WHERE c.id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN '{}'::JSON;
    END IF;
    
    v_class_name := v_character.class_name;
    
    -- Рассчитываем бонусы в зависимости от класса и уровня
    CASE v_class_name
        WHEN 'Лучник' THEN
            SELECT json_build_object(
                'agility', CASE WHEN v_character.level >= 1 THEN 5 ELSE 0 END + 
                          CASE WHEN v_character.level >= 5 THEN 10 ELSE 0 END + 
                          CASE WHEN v_character.level >= 15 THEN 8 ELSE 0 END + 
                          CASE WHEN v_character.level >= 20 THEN 15 ELSE 0 END,
                'precision', CASE WHEN v_character.level >= 1 THEN 8 ELSE 0 END + 
                            CASE WHEN v_character.level >= 10 THEN 12 ELSE 0 END + 
                            CASE WHEN v_character.level >= 15 THEN 15 ELSE 0 END + 
                            CASE WHEN v_character.level >= 20 THEN 20 ELSE 0 END,
                'evasion', CASE WHEN v_character.level >= 5 THEN 8 ELSE 0 END + 
                          CASE WHEN v_character.level >= 20 THEN 10 ELSE 0 END,
                'stealth', CASE WHEN v_character.level >= 10 THEN 6 ELSE 0 END
            ) INTO v_bonuses;
            
        WHEN 'Маг' THEN
            SELECT json_build_object(
                'intelligence', CASE WHEN v_character.level >= 1 THEN 10 ELSE 0 END + 
                               CASE WHEN v_character.level >= 5 THEN 12 ELSE 0 END + 
                               CASE WHEN v_character.level >= 15 THEN 10 ELSE 0 END + 
                               CASE WHEN v_character.level >= 20 THEN 20 ELSE 0 END,
                'spell_power', CASE WHEN v_character.level >= 1 THEN 8 ELSE 0 END + 
                              CASE WHEN v_character.level >= 10 THEN 15 ELSE 0 END + 
                              CASE WHEN v_character.level >= 20 THEN 18 ELSE 0 END,
                'resistance', CASE WHEN v_character.level >= 5 THEN 10 ELSE 0 END + 
                             CASE WHEN v_character.level >= 15 THEN 15 ELSE 0 END + 
                             CASE WHEN v_character.level >= 20 THEN 12 ELSE 0 END,
                'precision', CASE WHEN v_character.level >= 10 THEN 8 ELSE 0 END
            ) INTO v_bonuses;
            
        WHEN 'Берсерк' THEN
            SELECT json_build_object(
                'strength', CASE WHEN v_character.level >= 1 THEN 12 ELSE 0 END + 
                           CASE WHEN v_character.level >= 10 THEN 15 ELSE 0 END + 
                           CASE WHEN v_character.level >= 15 THEN 18 ELSE 0 END + 
                           CASE WHEN v_character.level >= 20 THEN 25 ELSE 0 END,
                'endurance', CASE WHEN v_character.level >= 1 THEN 8 ELSE 0 END + 
                            CASE WHEN v_character.level >= 5 THEN 10 ELSE 0 END + 
                            CASE WHEN v_character.level >= 15 THEN 12 ELSE 0 END + 
                            CASE WHEN v_character.level >= 20 THEN 18 ELSE 0 END,
                'armor', CASE WHEN v_character.level >= 5 THEN 12 ELSE 0 END + 
                        CASE WHEN v_character.level >= 20 THEN 15 ELSE 0 END,
                'agility', CASE WHEN v_character.level >= 10 THEN 8 ELSE 0 END
            ) INTO v_bonuses;
            
        WHEN 'Ассасин' THEN
            SELECT json_build_object(
                'stealth', CASE WHEN v_character.level >= 1 THEN 12 ELSE 0 END + 
                          CASE WHEN v_character.level >= 5 THEN 8 ELSE 0 END + 
                          CASE WHEN v_character.level >= 10 THEN 15 ELSE 0 END + 
                          CASE WHEN v_character.level >= 15 THEN 18 ELSE 0 END + 
                          CASE WHEN v_character.level >= 20 THEN 25 ELSE 0 END,
                'agility', CASE WHEN v_character.level >= 1 THEN 8 ELSE 0 END + 
                          CASE WHEN v_character.level >= 20 THEN 15 ELSE 0 END,
                'precision', CASE WHEN v_character.level >= 5 THEN 10 ELSE 0 END + 
                            CASE WHEN v_character.level >= 15 THEN 12 ELSE 0 END + 
                            CASE WHEN v_character.level >= 20 THEN 15 ELSE 0 END,
                'evasion', CASE WHEN v_character.level >= 10 THEN 10 ELSE 0 END
            ) INTO v_bonuses;
            
        ELSE
            v_bonuses := '{}'::JSON;
    END CASE;
    
    RETURN COALESCE(v_bonuses, '{}'::JSON);
END;
$$ LANGUAGE plpgsql;

-- 3. Обновляем функцию расчета характеристик с пассивными навыками
CREATE OR REPLACE FUNCTION update_character_calculated_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_class_name TEXT;
    v_passive_bonuses JSON;
BEGIN
    -- Получаем название класса
    SELECT cc.name INTO v_class_name
    FROM character_classes cc
    WHERE cc.id = NEW.class_id;
    
    -- Получаем бонусы от пассивных навыков
    SELECT calculate_passive_skill_bonuses(NEW.id) INTO v_passive_bonuses;
    
    -- Применяем бонусы от пассивных навыков к базовым характеристикам
    NEW.agility = NEW.agility + COALESCE((v_passive_bonuses->>'agility')::INTEGER, 0);
    NEW.precision = NEW.precision + COALESCE((v_passive_bonuses->>'precision')::INTEGER, 0);
    NEW.evasion = NEW.evasion + COALESCE((v_passive_bonuses->>'evasion')::INTEGER, 0);
    NEW.intelligence = NEW.intelligence + COALESCE((v_passive_bonuses->>'intelligence')::INTEGER, 0);
    NEW.spell_power = NEW.spell_power + COALESCE((v_passive_bonuses->>'spell_power')::INTEGER, 0);
    NEW.resistance = NEW.resistance + COALESCE((v_passive_bonuses->>'resistance')::INTEGER, 0);
    NEW.strength = NEW.strength + COALESCE((v_passive_bonuses->>'strength')::INTEGER, 0);
    NEW.endurance = NEW.endurance + COALESCE((v_passive_bonuses->>'endurance')::INTEGER, 0);
    NEW.armor = NEW.armor + COALESCE((v_passive_bonuses->>'armor')::INTEGER, 0);
    NEW.stealth = NEW.stealth + COALESCE((v_passive_bonuses->>'stealth')::INTEGER, 0);
    
    -- Calculate derived stats based on base stats
    NEW.max_health = 100 + (NEW.endurance * 15);
    NEW.max_mana = 50 + (NEW.intelligence * 8);
    
    NEW.attack_damage = (NEW.strength * 2.5) + (NEW.agility * 1.5);
    NEW.magic_damage = (NEW.spell_power * 3.0) + (NEW.intelligence * 1.0);
    NEW.defense = (NEW.armor * 2.0) + (NEW.endurance * 1.0);
    NEW.magic_resistance = NEW.resistance * 2.5;
    
    NEW.critical_chance = 5.0 + (NEW.agility * 0.15);
    NEW.critical_damage = 150.0 + (NEW.strength * 0.8);
    NEW.attack_speed = 100.0 + (NEW.agility * 1.2);
    NEW.accuracy = 85.0 + (NEW.precision * 1.0);
    
    -- Регенерация с правильным округлением
    NEW.health_regen = ROUND(1.0 + (NEW.endurance * 0.1));
    NEW.mana_regen = ROUND(1.0 + (NEW.intelligence * 0.1));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Обновляем существующих персонажей с новыми пассивными навыками
UPDATE characters SET 
    level = level -- Это заставит триггер пересчитать характеристики
WHERE id IN (
    SELECT id FROM characters
);

-- 5. Проверяем, что функции работают
SELECT 
    c.name,
    c.level,
    cc.name as class_name,
    c.agility,
    c.precision,
    c.strength,
    c.intelligence,
    c.spell_power,
    c.stealth
FROM characters c
JOIN character_classes cc ON c.class_id = cc.id
LIMIT 5;

-- 6. Тестируем функцию получения пассивных навыков
SELECT get_character_passive_skills(c.id) as passive_skills
FROM characters c
LIMIT 1;

-- 7. Тестируем функцию расчета бонусов
SELECT calculate_passive_skill_bonuses(c.id) as passive_bonuses
FROM characters c
LIMIT 1;
