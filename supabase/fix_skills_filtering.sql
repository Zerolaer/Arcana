-- Исправление фильтрации навыков по классу
-- Проблема: показываются все навыки, а не только для класса персонажа

-- 1. Сначала посмотрим какие классы и навыки у нас есть
SELECT 'КЛАССЫ В ИГРЕ:' as info;
SELECT id, name FROM character_classes ORDER BY name;

SELECT 'ВСЕ АКТИВНЫЕ НАВЫКИ:' as info;
SELECT 
    skill_key,
    name,
    level_requirement,
    class_requirements
FROM active_skills 
ORDER BY level_requirement, name;

-- 2. Исправляем функцию получения активных навыков
-- Теперь она будет фильтровать по классу персонажа
DROP FUNCTION IF EXISTS get_character_active_skills(UUID);

CREATE OR REPLACE FUNCTION get_character_active_skills(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_character_class_id UUID;
    v_character_class_name TEXT;
BEGIN
    -- Получаем класс персонажа
    SELECT class_id INTO v_character_class_id
    FROM characters 
    WHERE id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN '[]'::json;
    END IF;
    
    -- Получаем название класса
    SELECT name INTO v_character_class_name
    FROM character_classes 
    WHERE id = v_character_class_id;
    
    -- Получаем только навыки для класса персонажа
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
    )
    WHERE a_skills.class_requirements @> ARRAY[v_character_class_name]::TEXT[]
    OR a_skills.class_requirements = '{}'::TEXT[]; -- Навыки без ограничений по классу
    
    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 3. Альтернативная функция для получения навыков конкретного класса
CREATE OR REPLACE FUNCTION get_skills_for_class(p_class_name TEXT)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'skill_key', a_skills.skill_key,
            'name', a_skills.name,
            'description', a_skills.description,
            'level_requirement', a_skills.level_requirement,
            'cost_to_learn', 100
        ) ORDER BY a_skills.level_requirement
    ) INTO v_result
    FROM active_skills a_skills
    WHERE a_skills.class_requirements @> ARRAY[p_class_name]::TEXT[]
    OR a_skills.class_requirements = '{}'::TEXT[];
    
    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 4. Функция для получения навыков персонажа с фильтрацией по классу
CREATE OR REPLACE FUNCTION get_character_class_skills(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_character_class_name TEXT;
BEGIN
    -- Получаем название класса персонажа
    SELECT cc.name INTO v_character_class_name
    FROM characters c
    JOIN character_classes cc ON cc.id = c.class_id
    WHERE c.id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN '[]'::json;
    END IF;
    
    -- Получаем навыки для класса с информацией об изучении
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
    )
    WHERE a_skills.class_requirements @> ARRAY[v_character_class_name]::TEXT[];
    
    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 5. Тестируем функции
SELECT 'ТЕСТ ФУНКЦИЙ:' as info;

-- Показываем навыки для каждого класса
SELECT 
    'Archer' as class_name,
    get_skills_for_class('Archer') as skills
UNION ALL
SELECT 
    'Mage' as class_name,
    get_skills_for_class('Mage') as skills
UNION ALL
SELECT 
    'Berserker' as class_name,
    get_skills_for_class('Berserker') as skills
UNION ALL
SELECT 
    'Assassin' as class_name,
    get_skills_for_class('Assassin') as skills;

SELECT '✅ ФУНКЦИИ ФИЛЬТРАЦИИ ИСПРАВЛЕНЫ!' as result;
