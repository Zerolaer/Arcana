-- Проверка сохранения навыков
-- Проверяем что навыки действительно сохраняются в БД

-- 1. Показываем все изученные навыки
SELECT 'ВСЕ ИЗУЧЕННЫЕ НАВЫКИ:' as info;

SELECT 
    c.name as character_name,
    c.level as character_level,
    cc.name as class_name,
    a_skills.skill_key,
    a_skills.name as skill_name,
    a_skills.level_requirement,
    cas.is_learned,
    cas.learned_at
FROM character_active_skills cas
JOIN characters c ON c.id = cas.character_id
JOIN character_classes cc ON cc.id = c.class_id
JOIN active_skills a_skills ON a_skills.id = cas.skill_id
WHERE cas.is_learned = true
ORDER BY c.name, a_skills.level_requirement;

-- 2. Показываем количество изученных навыков по персонажам
SELECT 'КОЛИЧЕСТВО ИЗУЧЕННЫХ НАВЫКОВ ПО ПЕРСОНАЖАМ:' as info;

SELECT 
    c.name as character_name,
    cc.name as class_name,
    COUNT(cas.skill_id) as learned_skills_count
FROM characters c
JOIN character_classes cc ON cc.id = c.class_id
LEFT JOIN character_active_skills cas ON (
    cas.character_id = c.id AND 
    cas.is_learned = true
)
GROUP BY c.id, c.name, cc.name
ORDER BY c.name;

-- 3. Тестируем функцию get_character_class_skills для каждого персонажа
SELECT 'ТЕСТ ФУНКЦИИ get_character_class_skills:' as info;

SELECT 
    c.name as character_name,
    cc.name as class_name,
    get_character_class_skills(c.id) as skills_from_function
FROM characters c
JOIN character_classes cc ON cc.id = c.class_id
ORDER BY c.name;

-- 4. Проверяем есть ли записи в character_active_skills
SELECT 'ВСЕ ЗАПИСИ В character_active_skills:' as info;

SELECT 
    cas.character_id,
    cas.skill_id,
    cas.is_learned,
    cas.learned_at,
    c.name as character_name,
    a_skills.name as skill_name
FROM character_active_skills cas
LEFT JOIN characters c ON c.id = cas.character_id
LEFT JOIN active_skills a_skills ON a_skills.id = cas.skill_id
ORDER BY cas.character_id, cas.skill_id;

-- 5. Показываем навыки для каждого класса
SELECT 'НАВЫКИ ПО КЛАССАМ:' as info;

SELECT 
    cc.name as class_name,
    COUNT(a_skills.id) as total_skills
FROM character_classes cc
LEFT JOIN active_skills a_skills ON a_skills.class_requirements @> ARRAY[cc.name]::VARCHAR[]
GROUP BY cc.id, cc.name
ORDER BY cc.name;

SELECT '✅ ПРОВЕРКА СОХРАНЕНИЯ ЗАВЕРШЕНА!' as result;
