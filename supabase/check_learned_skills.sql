-- Проверка изученных навыков
-- Показывает какие навыки изучены персонажами

-- 1. Показываем всех персонажей и их изученные навыки
SELECT 'ИЗУЧЕННЫЕ НАВЫКИ ПЕРСОНАЖЕЙ:' as info;

SELECT 
    c.name as character_name,
    c.level as character_level,
    c.gold as character_gold,
    a_skills.name as skill_name,
    a_skills.level_requirement,
    cas.is_learned,
    cas.learned_at
FROM characters c
LEFT JOIN character_active_skills cas ON cas.character_id = c.id
LEFT JOIN active_skills a_skills ON a_skills.id = cas.skill_id
WHERE cas.is_learned = true
ORDER BY c.name, a_skills.level_requirement;

-- 2. Показываем количество изученных навыков по персонажам
SELECT 'КОЛИЧЕСТВО ИЗУЧЕННЫХ НАВЫКОВ:' as info;

SELECT 
    c.name as character_name,
    COUNT(cas.skill_id) as learned_skills_count
FROM characters c
LEFT JOIN character_active_skills cas ON (
    cas.character_id = c.id AND 
    cas.is_learned = true
)
GROUP BY c.id, c.name
ORDER BY c.name;

-- 3. Показываем все записи в character_active_skills
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

-- 4. Проверяем есть ли дубликаты
SELECT 'ПРОВЕРКА ДУБЛИКАТОВ:' as info;

SELECT 
    character_id,
    skill_id,
    COUNT(*) as count
FROM character_active_skills
GROUP BY character_id, skill_id
HAVING COUNT(*) > 1;

SELECT '✅ ПРОВЕРКА ЗАВЕРШЕНА!' as result;
