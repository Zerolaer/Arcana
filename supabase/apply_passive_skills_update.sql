-- ================================================
-- ПРИМЕНЕНИЕ ОБНОВЛЕНИЯ ПАССИВНЫХ НАВЫКОВ
-- ================================================

-- 1. Создаем функции для пассивных навыков
\i passive_skills_functions.sql

-- 2. Обновляем существующих персонажей с новыми пассивными навыками
UPDATE characters SET 
    level = level -- Это заставит триггер пересчитать характеристики
WHERE id IN (
    SELECT id FROM characters
);

-- 3. Проверяем, что функции работают
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

-- 4. Тестируем функцию получения пассивных навыков
SELECT get_character_passive_skills(c.id) as passive_skills
FROM characters c
LIMIT 1;

-- 5. Тестируем функцию расчета бонусов
SELECT calculate_passive_skill_bonuses(c.id) as passive_bonuses
FROM characters c
LIMIT 1;
