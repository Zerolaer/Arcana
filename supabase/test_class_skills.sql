-- Тест фильтрации навыков по классу
-- Проверяем что показываются только нужные навыки

-- 1. Показываем всех персонажей и их классы
SELECT 'ПЕРСОНАЖИ И ИХ КЛАССЫ:' as info;

SELECT 
    c.name as character_name,
    c.level,
    cc.name as class_name
FROM characters c
JOIN character_classes cc ON cc.id = c.class_id
ORDER BY c.name;

-- 2. Тестируем функцию для каждого персонажа
SELECT 'ТЕСТ ФУНКЦИИ ДЛЯ КАЖДОГО ПЕРСОНАЖА:' as info;

SELECT 
    c.name as character_name,
    cc.name as class_name,
    get_character_class_skills(c.id) as skills
FROM characters c
JOIN character_classes cc ON cc.id = c.class_id
ORDER BY c.name;

-- 3. Показываем навыки для каждого класса отдельно
SELECT 'НАВЫКИ ПО КЛАССАМ:' as info;

SELECT 
    'Archer' as class_name,
    json_array_length(get_skills_for_class('Archer')) as skills_count,
    get_skills_for_class('Archer') as skills
UNION ALL
SELECT 
    'Mage' as class_name,
    json_array_length(get_skills_for_class('Mage')) as skills_count,
    get_skills_for_class('Mage') as skills
UNION ALL
SELECT 
    'Berserker' as class_name,
    json_array_length(get_skills_for_class('Berserker')) as skills_count,
    get_skills_for_class('Berserker') as skills
UNION ALL
SELECT 
    'Assassin' as class_name,
    json_array_length(get_skills_for_class('Assassin')) as skills_count,
    get_skills_for_class('Assassin') as skills;

-- 4. Проверяем есть ли навыки без ограничений по классу
SELECT 'НАВЫКИ БЕЗ ОГРАНИЧЕНИЙ ПО КЛАССУ:' as info;

SELECT 
    skill_key,
    name,
    class_requirements
FROM active_skills 
WHERE class_requirements = '{}'::TEXT[];

SELECT '✅ ТЕСТ ФИЛЬТРАЦИИ ЗАВЕРШЕН!' as result;
