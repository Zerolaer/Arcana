-- Исправление типов массивов для фильтрации навыков
-- Проблема: несовместимость типов character varying[] и text[]

-- 1. Сначала посмотрим какие типы у колонок
SELECT 'ТИПЫ КОЛОНОК:' as info;

SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'active_skills' 
AND column_name = 'class_requirements';

-- 2. Исправляем функцию get_skills_for_class
DROP FUNCTION IF EXISTS get_skills_for_class(TEXT);

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
    WHERE a_skills.class_requirements @> ARRAY[p_class_name]::VARCHAR[]
    OR a_skills.class_requirements = '{}'::VARCHAR[];
    
    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 3. Исправляем функцию get_character_class_skills
DROP FUNCTION IF EXISTS get_character_class_skills(UUID);

CREATE OR REPLACE FUNCTION get_character_class_skills(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_character_class_name VARCHAR;
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
    WHERE a_skills.class_requirements @> ARRAY[v_character_class_name]::VARCHAR[];
    
    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 4. Исправляем функцию get_character_active_skills
DROP FUNCTION IF EXISTS get_character_active_skills(UUID);

CREATE OR REPLACE FUNCTION get_character_active_skills(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_character_class_id UUID;
    v_character_class_name VARCHAR;
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
    WHERE a_skills.class_requirements @> ARRAY[v_character_class_name]::VARCHAR[]
    OR a_skills.class_requirements = '{}'::VARCHAR[]; -- Навыки без ограничений по классу
    
    RETURN COALESCE(v_result, '[]'::json);
END;
$$ LANGUAGE plpgsql;

-- 5. Тестируем функции
SELECT 'ТЕСТ ИСПРАВЛЕННЫХ ФУНКЦИЙ:' as info;

-- Показываем навыки для каждого класса
SELECT 
    'Archer' as class_name,
    json_array_length(get_skills_for_class('Archer')) as skills_count
UNION ALL
SELECT 
    'Mage' as class_name,
    json_array_length(get_skills_for_class('Mage')) as skills_count
UNION ALL
SELECT 
    'Berserker' as class_name,
    json_array_length(get_skills_for_class('Berserker')) as skills_count
UNION ALL
SELECT 
    'Assassin' as class_name,
    json_array_length(get_skills_for_class('Assassin')) as skills_count;

-- 6. Показываем данные для отладки
SELECT 'ДАННЫЕ ДЛЯ ОТЛАДКИ:' as info;

SELECT 
    skill_key,
    name,
    class_requirements,
    pg_typeof(class_requirements) as type_info
FROM active_skills 
LIMIT 3;

SELECT '✅ ТИПЫ МАССИВОВ ИСПРАВЛЕНЫ!' as result;
