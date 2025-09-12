-- ================================================
-- ОБНОВЛЕНИЕ МОБОВ НА КАРТЕ - СБАЛАНСИРОВАННЫЕ НАГРАДЫ
-- ================================================

-- Обновляем награды существующих мобов
UPDATE mobs SET experience_reward = 7 WHERE name = 'Лесной слайм';
UPDATE mobs SET experience_reward = 9 WHERE name = 'Дикий кролик';
UPDATE mobs SET experience_reward = 12 WHERE name = 'Дикий волк';
UPDATE mobs SET experience_reward = 15 WHERE name = 'Гигантский паук';
UPDATE mobs SET experience_reward = 18 WHERE name = 'Лесной страж';
UPDATE mobs SET experience_reward = 26 WHERE name = 'Лесной орк';
UPDATE mobs SET experience_reward = 38 WHERE name = 'Пещерная летучая мышь';
UPDATE mobs SET experience_reward = 58 WHERE name = 'Каменный голем';
UPDATE mobs SET experience_reward = 70 WHERE name = 'Теневой убийца';
UPDATE mobs SET experience_reward = 78 WHERE name = 'Скелет-воин';
UPDATE mobs SET experience_reward = 90 WHERE name = 'Некромант';
UPDATE mobs SET experience_reward = 110 WHERE name = 'Древний лич';
UPDATE mobs SET experience_reward = 130 WHERE name = 'Огненный элементаль';
UPDATE mobs SET experience_reward = 150 WHERE name = 'Лавовый голем';
UPDATE mobs SET experience_reward = 200 WHERE name = 'Огненный дракон';

-- Добавляем новых мобов, если их нет
INSERT INTO mobs (name, description, level, health, attack_damage, defense, magic_resistance, aggressive, respawn_time, experience_reward, gold_reward, image) 
SELECT 'Дикий кролик', 'Быстрый пушистый зверек.', 2, 60, 12, 3, 1, false, 25, 9, 8, '🐰'
WHERE NOT EXISTS (SELECT 1 FROM mobs WHERE name = 'Дикий кролик');

INSERT INTO mobs (name, description, level, health, attack_damage, defense, magic_resistance, aggressive, respawn_time, experience_reward, gold_reward, image) 
SELECT 'Лесной страж', 'Древесный голем-защитник.', 6, 150, 22, 12, 4, false, 75, 18, 25, '🌳'
WHERE NOT EXISTS (SELECT 1 FROM mobs WHERE name = 'Лесной страж');

-- Добавляем связи мобов с локациями
INSERT INTO mob_spawns (spot_id, mob_id, spawn_rate, max_concurrent)
SELECT 
  (SELECT id FROM farming_spots WHERE name = 'Поляна слаймов'),
  (SELECT id FROM mobs WHERE name = 'Дикий кролик'),
  1.5, 2
WHERE NOT EXISTS (
  SELECT 1 FROM mob_spawns ms
  JOIN farming_spots fs ON ms.spot_id = fs.id
  JOIN mobs m ON ms.mob_id = m.id
  WHERE fs.name = 'Поляна слаймов' AND m.name = 'Дикий кролик'
);

INSERT INTO mob_spawns (spot_id, mob_id, spawn_rate, max_concurrent)
SELECT 
  (SELECT id FROM farming_spots WHERE name = 'Волчье логово'),
  (SELECT id FROM mobs WHERE name = 'Дикий кролик'),
  0.8, 1
WHERE NOT EXISTS (
  SELECT 1 FROM mob_spawns ms
  JOIN farming_spots fs ON ms.spot_id = fs.id
  JOIN mobs m ON ms.mob_id = m.id
  WHERE fs.name = 'Волчье логово' AND m.name = 'Дикий кролик'
);

INSERT INTO mob_spawns (spot_id, mob_id, spawn_rate, max_concurrent)
SELECT 
  (SELECT id FROM farming_spots WHERE name = 'Паучье гнездо'),
  (SELECT id FROM mobs WHERE name = 'Лесной страж'),
  0.5, 1
WHERE NOT EXISTS (
  SELECT 1 FROM mob_spawns ms
  JOIN farming_spots fs ON ms.spot_id = fs.id
  JOIN mobs m ON ms.mob_id = m.id
  WHERE fs.name = 'Паучье гнездо' AND m.name = 'Лесной страж'
);

-- Проверяем результат
SELECT 
  m.name, 
  m.level, 
  m.experience_reward,
  fs.name as farming_spot,
  ms.spawn_rate
FROM mobs m
LEFT JOIN mob_spawns ms ON m.id = ms.mob_id
LEFT JOIN farming_spots fs ON ms.spot_id = fs.id
ORDER BY m.level, m.name;
