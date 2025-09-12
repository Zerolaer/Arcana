-- Insert initial game data
-- Классы теперь определены в complete_classes_overhaul.sql

-- Skills
INSERT INTO skills (name, description, skill_type, required_level, mana_cost, stamina_cost, cooldown, base_damage, damage_type, scaling_stat, scaling_ratio, available_nodes, icon) VALUES

-- Universal skills
('Базовая атака', 'Стандартная атака оружием или заклинанием', 'active', 1, 0, 5, 1, 50, 'physical', 'strength', 1.0, '{"Сила удара", "Точность"}', '⚔️'),
('Лечение', 'Восстанавливает здоровье', 'active', 1, 20, 0, 3, 0, 'magical', 'intelligence', 0.8, '{"Усиленное лечение", "Быстрое восстановление"}', '💚'),

-- Warrior skills
('Мощный удар', 'Сильная атака с увеличенным уроном', 'active', 5, 0, 15, 4, 120, 'physical', 'strength', 1.5, '{"Сокрушительный удар", "Кровотечение"}', '💥'),
('Защитная стойка', 'Увеличивает защиту на время', 'active', 8, 0, 10, 8, 0, 'physical', 'strength', 0.5, '{"Железная кожа", "Отражение урона"}', '🛡️'),
('Берсерк', 'Увеличивает скорость атаки, но снижает защиту', 'active', 15, 0, 25, 15, 0, 'physical', 'strength', 0.3, '{"Кровавая ярость", "Неудержимость"}', '😡'),

-- Archer skills
('Точный выстрел', 'Прицельный выстрел с высоким шансом критического урона', 'active', 5, 0, 10, 3, 80, 'physical', 'dexterity', 1.3, '{"Пробивание брони", "Мультивыстрел"}', '🎯'),
('Дождь стрел', 'Атакует несколько целей в области', 'aoe', 10, 0, 20, 8, 60, 'physical', 'dexterity', 1.0, '{"Увеличенная область", "Ядовитые стрелы"}', '☔'),
('Ловушка', 'Ставит ловушку, которая замедляет врагов', 'active', 12, 15, 0, 6, 40, 'physical', 'dexterity', 0.8, '{"Взрывная ловушка", "Множественные ловушки"}', '🪤'),

-- Mage skills
('Огненный шар', 'Метает огненный снаряд во врага', 'active', 3, 25, 0, 2, 90, 'magical', 'intelligence', 1.2, '{"Поджог", "Увеличенный размер"}', '🔥'),
('Ледяная стрела', 'Замораживающая атака, замедляет врага', 'active', 6, 30, 0, 4, 75, 'magical', 'intelligence', 1.1, '{"Глубокая заморозка", "Ледяные осколки"}', '🧊'),
('Цепная молния', 'Молния, которая переходит между врагами', 'aoe', 12, 40, 0, 6, 100, 'magical', 'intelligence', 1.3, '{"Больше целей", "Повышенный урон"}', '⚡'),

-- Paladin skills
('Священный удар', 'Атака, наносящая урон и лечащая союзников', 'active', 5, 20, 10, 5, 80, 'magical', 'intelligence', 1.0, '{"Массовое лечение", "Увеличенный урон"}', '✨'),
('Благословение', 'Увеличивает характеристики союзников', 'active', 8, 35, 0, 12, 0, 'magical', 'intelligence', 0.4, '{"Длительное действие", "Дополнительные эффекты"}', '🙏'),
('Божественная защита', 'Делает неуязвимым на короткое время', 'active', 20, 50, 0, 30, 0, 'magical', 'intelligence', 0.2, '{"Увеличенная длительность", "Отражение урона"}', '⛪');

-- Skill nodes
INSERT INTO skill_nodes (skill_id, name, description, damage_multiplier, cooldown_reduction, mana_cost_reduction, additional_effects, icon) VALUES
-- Basic Attack nodes
((SELECT id FROM skills WHERE name = 'Базовая атака'), 'Сила удара', 'Увеличивает урон атаки на 25%', 1.25, 0, 0, '{}', '💪'),
((SELECT id FROM skills WHERE name = 'Базовая атака'), 'Точность', 'Увеличивает шанс критического удара на 10%', 1.0, 0, 0, '{"crit_chance_bonus_10"}', '🎯'),

-- Healing nodes
((SELECT id FROM skills WHERE name = 'Лечение'), 'Усиленное лечение', 'Увеличивает количество лечения на 50%', 1.5, 0, 0, '{}', '💉'),
((SELECT id FROM skills WHERE name = 'Лечение'), 'Быстрое восстановление', 'Сокращает время перезарядки на 1 секунду', 1.0, 1, 0, '{}', '⏱️'),

-- Warrior skill nodes
((SELECT id FROM skills WHERE name = 'Мощный удар'), 'Сокрушительный удар', 'Увеличивает урон на 40% и игнорирует 25% защиты', 1.4, 0, 0, '{"armor_penetration_25"}', '🔨'),
((SELECT id FROM skills WHERE name = 'Мощный удар'), 'Кровотечение', 'Вызывает кровотечение, наносящее урон в течение времени', 1.0, 0, 0, '{"bleeding_damage_20", "bleeding_duration_5"}', '🩸'),

-- Archer skill nodes
((SELECT id FROM skills WHERE name = 'Точный выстрел'), 'Пробивание брони', 'Игнорирует 50% защиты цели', 1.0, 0, 0, '{"armor_penetration_50"}', '🔓'),
((SELECT id FROM skills WHERE name = 'Точный выстрел'), 'Мультивыстрел', 'Выпускает 3 стрелы одновременно', 0.7, 0, 0, '{"projectile_count_3"}', '🏹');

-- Locations
INSERT INTO locations (name, description, min_level, max_level, experience_bonus, gold_bonus, image) VALUES
('Новичковый лес', 'Спокойный лес для начинающих приключенцев. Здесь обитают слабые монстры, идеальные для изучения основ боя.', 1, 10, 1.0, 1.0, '🌲'),
('Темная пещера', 'Мрачная пещера, полная опасностей. Враги здесь сильнее, но и награды больше.', 8, 20, 1.2, 1.1, '🕳️'),
('Заброшенные руины', 'Древние руины, кишащие нежитью и темной магией. Высокий риск, но отличные награды.', 15, 30, 1.3, 1.2, '🏛️'),
('Огненные земли', 'Выжженная пустошь с огненными элементалями и демонами. Только для опытных воинов.', 25, 45, 1.4, 1.3, '🔥'),
('Ледяные вершины', 'Холодные горы со льдом и снегом. Ледяные монстры и суровые условия.', 30, 50, 1.5, 1.4, '🏔️'),
('Кристальные шахты', 'Глубокие шахты с кристальными монстрами. Редкие материалы и мощные враги.', 40, 60, 1.6, 1.5, '💎'),
('Теневое измерение', 'Альтернативное измерение, полное теневых существ. Максимальный риск и награды.', 55, 80, 1.8, 1.7, '🌑'),
('Божественный храм', 'Священное место для самых сильных героев. Ангелы и божественные существа.', 70, 100, 2.0, 2.0, '⛪');

-- Farming spots for each location
INSERT INTO farming_spots (location_id, name, description, max_occupancy, drop_rate_bonus, rare_drop_bonus, coordinates) VALUES
-- Новичковый лес
((SELECT id FROM locations WHERE name = 'Новичковый лес'), 'Поляна слаймов', 'Открытая поляна, где часто появляются слаймы. Идеально для новичков.', 3, 1.0, 1.0, '{"x": 100, "y": 150}'),
((SELECT id FROM locations WHERE name = 'Новичковый лес'), 'Волчье логово', 'Логово диких волков. Немного опаснее, но лучше добыча.', 2, 1.1, 1.0, '{"x": 200, "y": 100}'),
((SELECT id FROM locations WHERE name = 'Новичковый лес'), 'Паучье гнездо', 'Скопление пауков под старым деревом.', 2, 1.0, 1.1, '{"x": 50, "y": 200}'),

-- Темная пещера
((SELECT id FROM locations WHERE name = 'Темная пещера'), 'Входная камера', 'Первая камера пещеры с летучими мышами и крысами.', 4, 1.1, 1.0, '{"x": 300, "y": 250}'),
((SELECT id FROM locations WHERE name = 'Темная пещера'), 'Глубокий туннель', 'Узкий туннель с более опасными монстрами.', 2, 1.2, 1.2, '{"x": 350, "y": 300}'),
((SELECT id FROM locations WHERE name = 'Темная пещера'), 'Подземное озеро', 'Темное озеро с водными монстрами.', 3, 1.3, 1.1, '{"x": 400, "y": 280}'),

-- Заброшенные руины
((SELECT id FROM locations WHERE name = 'Заброшенные руины'), 'Двор скелетов', 'Центральный двор, кишащий скелетами-воинами.', 3, 1.2, 1.2, '{"x": 150, "y": 350}'),
((SELECT id FROM locations WHERE name = 'Заброшенные руины'), 'Башня мага', 'Высокая башня с магическими созданиями.', 1, 1.4, 1.4, '{"x": 120, "y": 400}'),
((SELECT id FROM locations WHERE name = 'Заброшенные руины'), 'Склеп нежити', 'Древний склеп с могущественной нежитью.', 2, 1.3, 1.5, '{"x": 180, "y": 380}');

-- Mobs
INSERT INTO mobs (name, description, level, health, attack_damage, defense, magic_resistance, aggressive, respawn_time, experience_reward, gold_reward, image) VALUES
-- Level 1-5 mobs (сбалансированные награды)
('Лесной слайм', 'Маленькое желеобразное существо, безобидное для опытных воинов.', 1, 50, 8, 2, 1, false, 30, 7, 5, '🟢'),
('Дикий кролик', 'Быстрый пушистый зверек.', 2, 60, 12, 3, 1, false, 25, 9, 8, '🐰'),
('Дикий волк', 'Агрессивный лесной хищник с острыми клыками.', 3, 120, 18, 5, 2, true, 45, 12, 12, '🐺'),
('Гигантский паук', 'Ядовитый паук размером с собаку.', 5, 180, 25, 8, 3, true, 60, 15, 18, '🕷️'),
('Лесной страж', 'Древесный голем-защитник.', 6, 150, 22, 12, 4, false, 75, 18, 25, '🌳'),
('Лесной орк', 'Грубый орк-разбойник, вооруженный дубинкой.', 8, 300, 40, 15, 5, true, 90, 26, 30, '👹'),

-- Level 8-15 mobs
('Пещерная летучая мышь', 'Быстрая летучая мышь с острыми когтями.', 10, 220, 35, 10, 8, true, 40, 38, 22, '🦇'),
('Каменный голем', 'Медленный, но очень прочный каменный страж.', 15, 800, 60, 35, 15, false, 120, 58, 50, '🗿'),
('Теневой убийца', 'Быстрый и смертоносный убийца из теней.', 18, 400, 80, 20, 25, true, 100, 70, 65, '🥷'),

-- Level 15-30 mobs
('Скелет-воин', 'Восставший из мертвых древний воин.', 20, 600, 75, 25, 30, true, 80, 78, 70, '💀'),
('Некромант', 'Темный маг, воскрешающий мертвых.', 25, 500, 90, 15, 45, false, 150, 90, 95, '🧙‍♂️'),
('Древний лич', 'Могущественный маг-нежить с разрушительной магией.', 30, 1200, 120, 30, 60, true, 200, 110, 150, '👑'),

-- Level 25-45 mobs
('Огненный элементаль', 'Существо из чистого огня, наносящее магический урон.', 35, 1000, 110, 20, 40, true, 120, 130, 160, '🔥'),
('Лавовый голем', 'Массивный голем из расплавленной лавы.', 40, 1800, 140, 50, 30, false, 180, 150, 200, '🌋'),
('Огненный дракон', 'Молодой дракон с огненным дыханием.', 45, 2500, 180, 40, 35, true, 300, 750, 300, '🐉');

-- Assign mobs to farming spots
INSERT INTO mob_spawns (spot_id, mob_id, spawn_rate, max_concurrent) VALUES
-- Новичковый лес - Поляна слаймов
((SELECT id FROM farming_spots WHERE name = 'Поляна слаймов'), (SELECT id FROM mobs WHERE name = 'Лесной слайм'), 2.0, 3),
((SELECT id FROM farming_spots WHERE name = 'Поляна слаймов'), (SELECT id FROM mobs WHERE name = 'Дикий кролик'), 1.5, 2),

-- Новичковый лес - Волчье логово  
((SELECT id FROM farming_spots WHERE name = 'Волчье логово'), (SELECT id FROM mobs WHERE name = 'Дикий волк'), 1.5, 2),
((SELECT id FROM farming_spots WHERE name = 'Волчье логово'), (SELECT id FROM mobs WHERE name = 'Лесной слайм'), 1.0, 1),
((SELECT id FROM farming_spots WHERE name = 'Волчье логово'), (SELECT id FROM mobs WHERE name = 'Дикий кролик'), 0.8, 1),

-- Новичковый лес - Паучье гнездо
((SELECT id FROM farming_spots WHERE name = 'Паучье гнездо'), (SELECT id FROM mobs WHERE name = 'Гигантский паук'), 1.2, 2),
((SELECT id FROM farming_spots WHERE name = 'Паучье гнездо'), (SELECT id FROM mobs WHERE name = 'Лесной страж'), 0.5, 1),

-- Темная пещера - Входная камера
((SELECT id FROM farming_spots WHERE name = 'Входная камера'), (SELECT id FROM mobs WHERE name = 'Пещерная летучая мышь'), 2.5, 4),
((SELECT id FROM farming_spots WHERE name = 'Входная камера'), (SELECT id FROM mobs WHERE name = 'Лесной орк'), 0.8, 1),

-- Темная пещера - Глубокий туннель
((SELECT id FROM farming_spots WHERE name = 'Глубокий туннель'), (SELECT id FROM mobs WHERE name = 'Каменный голем'), 0.8, 1),
((SELECT id FROM farming_spots WHERE name = 'Глубокий туннель'), (SELECT id FROM mobs WHERE name = 'Теневой убийца'), 1.0, 2),

-- Заброшенные руины - Двор скелетов
((SELECT id FROM farming_spots WHERE name = 'Двор скелетов'), (SELECT id FROM mobs WHERE name = 'Скелет-воин'), 1.8, 3),

-- Заброшенные руины - Башня мага
((SELECT id FROM farming_spots WHERE name = 'Башня мага'), (SELECT id FROM mobs WHERE name = 'Некромант'), 0.6, 1),
((SELECT id FROM farming_spots WHERE name = 'Башня мага'), (SELECT id FROM mobs WHERE name = 'Древний лич'), 0.3, 1);

-- Items - УДАЛЕНЫ, будем создавать заново

-- Create loot tables
INSERT INTO loot_tables (name) VALUES
('Слайм лут'),
('Волк лут'),
('Паук лут'),
('Орк лут'),
('Летучая мышь лут'),
('Голем лут'),
('Убийца лут'),
('Скелет лут'),
('Некромант лут'),
('Лич лут');

-- Assign loot tables to mobs
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Слайм лут') WHERE name = 'Лесной слайм';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Волк лут') WHERE name = 'Дикий волк';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Паук лут') WHERE name = 'Гигантский паук';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Орк лут') WHERE name = 'Лесной орк';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Летучая мышь лут') WHERE name = 'Пещерная летучая мышь';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Голем лут') WHERE name = 'Каменный голем';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Убийца лут') WHERE name = 'Теневой убийца';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Скелет лут') WHERE name = 'Скелет-воин';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Некромант лут') WHERE name = 'Некромант';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Лич лут') WHERE name = 'Древний лич';

-- Loot drops - УДАЛЕНЫ, будем создавать заново
