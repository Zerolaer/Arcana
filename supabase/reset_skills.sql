-- Сброс изученных навыков
-- Используйте для тестирования

-- 1. Показываем текущие изученные навыки
SELECT 'ТЕКУЩИЕ ИЗУЧЕННЫЕ НАВЫКИ:' as info;

SELECT 
    c.name as character_name,
    a_skills.name as skill_name,
    cas.is_learned
FROM character_active_skills cas
JOIN characters c ON c.id = cas.character_id
JOIN active_skills a_skills ON a_skills.id = cas.skill_id
WHERE cas.is_learned = true;

-- 2. Очищаем все изученные навыки
DELETE FROM character_active_skills;

-- 3. Показываем результат
SELECT 'РЕЗУЛЬТАТ ОЧИСТКИ:' as info;
SELECT COUNT(*) as remaining_skills FROM character_active_skills;

-- 4. Показываем всех персонажей и их золото
SELECT 'ПЕРСОНАЖИ И ЗОЛОТО:' as info;

SELECT 
    name,
    level,
    gold
FROM characters
ORDER BY name;

SELECT '✅ НАВЫКИ СБРОШЕНЫ!' as result;
