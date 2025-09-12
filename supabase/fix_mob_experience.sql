-- ================================================
-- ИСПРАВЛЕНИЕ НАГРАД МОБОВ - СБАЛАНСИРОВАННЫЙ ОПЫТ
-- ================================================

-- Обновляем награды мобов для более сбалансированной прокачки
-- Теперь нужно 8-12 мобов для повышения уровня на начальных уровнях

UPDATE mobs SET experience_reward = 7 WHERE name = 'Лесной Слизень';
UPDATE mobs SET experience_reward = 9 WHERE name = 'Дикий Кролик';
UPDATE mobs SET experience_reward = 12 WHERE name = 'Молодой Волк';
UPDATE mobs SET experience_reward = 15 WHERE name = 'Гигантский Паук';
UPDATE mobs SET experience_reward = 18 WHERE name = 'Лесной Страж';

UPDATE mobs SET experience_reward = 22 WHERE name = 'Теневой Волк';
UPDATE mobs SET experience_reward = 26 WHERE name = 'Злобный Орк';
UPDATE mobs SET experience_reward = 30 WHERE name = 'Лесная Ведьма';
UPDATE mobs SET experience_reward = 34 WHERE name = 'Древний Ent';
UPDATE mobs SET experience_reward = 38 WHERE name = 'Король Медведь';

UPDATE mobs SET experience_reward = 42 WHERE name = 'Горный Тролль';
UPDATE mobs SET experience_reward = 46 WHERE name = 'Ледяной Элементаль';
UPDATE mobs SET experience_reward = 50 WHERE name = 'Грифон';
UPDATE mobs SET experience_reward = 54 WHERE name = 'Каменный Голем';
UPDATE mobs SET experience_reward = 58 WHERE name = 'Драконенок';

UPDATE mobs SET experience_reward = 62 WHERE name = 'Скелет-Воин';
UPDATE mobs SET experience_reward = 66 WHERE name = 'Призрак';
UPDATE mobs SET experience_reward = 70 WHERE name = 'Мумия';
UPDATE mobs SET experience_reward = 74 WHERE name = 'Лич';
UPDATE mobs SET experience_reward = 78 WHERE name = 'Древний Дракон';

-- Проверяем результат
SELECT name, level, experience_reward, 
       CASE 
         WHEN level <= 5 THEN '8-12 мобов для повышения уровня'
         WHEN level <= 10 THEN '6-8 мобов для повышения уровня'
         WHEN level <= 15 THEN '5-6 мобов для повышения уровня'
         ELSE '4-5 мобов для повышения уровня'
       END as progression_note
FROM mobs 
ORDER BY level;