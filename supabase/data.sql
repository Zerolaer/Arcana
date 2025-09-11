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
-- Level 1-10 mobs
('Лесной слайм', 'Маленькое желеобразное существо, безобидное для опытных воинов.', 1, 50, 8, 2, 1, false, 30, 15, 5, '🟢'),
('Дикий волк', 'Агрессивный лесной хищник с острыми клыками.', 3, 120, 18, 5, 2, true, 45, 35, 12, '🐺'),
('Гигантский паук', 'Ядовитый паук размером с собаку.', 5, 180, 25, 8, 3, true, 60, 55, 18, '🕷️'),
('Лесной орк', 'Грубый орк-разбойник, вооруженный дубинкой.', 8, 300, 40, 15, 5, true, 90, 85, 30, '👹'),

-- Level 8-20 mobs
('Пещерная летучая мышь', 'Быстрая летучая мышь с острыми когтями.', 10, 220, 35, 10, 8, true, 40, 65, 22, '🦇'),
('Каменный голем', 'Медленный, но очень прочный каменный страж.', 15, 800, 60, 35, 15, false, 120, 150, 50, '🗿'),
('Теневой убийца', 'Быстрый и смертоносный убийца из теней.', 18, 400, 80, 20, 25, true, 100, 180, 65, '🥷'),

-- Level 15-30 mobs
('Скелет-воин', 'Восставший из мертвых древний воин.', 20, 600, 75, 25, 30, true, 80, 200, 70, '💀'),
('Некромант', 'Темный маг, воскрешающий мертвых.', 25, 500, 90, 15, 45, false, 150, 280, 95, '🧙‍♂️'),
('Древний лич', 'Могущественный маг-нежить с разрушительной магией.', 30, 1200, 120, 30, 60, true, 200, 400, 150, '👑'),

-- Level 25-45 mobs
('Огненный элементаль', 'Существо из чистого огня, наносящее магический урон.', 35, 1000, 110, 20, 40, true, 120, 450, 160, '🔥'),
('Лавовый голем', 'Массивный голем из расплавленной лавы.', 40, 1800, 140, 50, 30, false, 180, 550, 200, '🌋'),
('Огненный дракон', 'Молодой дракон с огненным дыханием.', 45, 2500, 180, 40, 35, true, 300, 750, 300, '🐉');

-- Assign mobs to farming spots
INSERT INTO mob_spawns (spot_id, mob_id, spawn_rate, max_concurrent) VALUES
-- Новичковый лес - Поляна слаймов
((SELECT id FROM farming_spots WHERE name = 'Поляна слаймов'), (SELECT id FROM mobs WHERE name = 'Лесной слайм'), 2.0, 3),

-- Новичковый лес - Волчье логово  
((SELECT id FROM farming_spots WHERE name = 'Волчье логово'), (SELECT id FROM mobs WHERE name = 'Дикий волк'), 1.5, 2),
((SELECT id FROM farming_spots WHERE name = 'Волчье логово'), (SELECT id FROM mobs WHERE name = 'Лесной слайм'), 1.0, 1),

-- Новичковый лес - Паучье гнездо
((SELECT id FROM farming_spots WHERE name = 'Паучье гнездо'), (SELECT id FROM mobs WHERE name = 'Гигантский паук'), 1.2, 2),

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

-- Items
INSERT INTO items (name, description, item_type, slot, rarity, level_requirement, strength_bonus, dexterity_bonus, intelligence_bonus, vitality_bonus, energy_bonus, luck_bonus, attack_damage, defense, vendor_price, stack_size, icon) VALUES
-- Common weapons
('Деревянный меч', 'Простой меч для начинающих воинов', 'weapon', 'weapon', 'common', 1, 2, 0, 0, 0, 0, 0, 15, 0, 50, 1, '🗡️'),
('Охотничий лук', 'Базовый лук для лучников', 'weapon', 'weapon', 'common', 1, 0, 3, 0, 0, 0, 1, 12, 0, 60, 1, '🏹'),
('Посох новичка', 'Простой посох для магов', 'weapon', 'weapon', 'common', 1, 0, 0, 4, 0, 2, 0, 8, 0, 70, 1, '🪄'),

-- Common armor
('Кожаная броня', 'Легкая броня из кожи', 'armor', 'chest', 'common', 1, 0, 1, 0, 2, 0, 0, 0, 8, 80, 1, '🦺'),
('Тканевые штаны', 'Простые штаны из ткани', 'armor', 'legs', 'common', 1, 0, 0, 1, 1, 1, 0, 0, 3, 30, 1, '👖'),
('Кожаные сапоги', 'Удобные сапоги для путешествий', 'armor', 'boots', 'common', 1, 0, 2, 0, 0, 0, 1, 0, 2, 25, 1, '🥾'),

-- Uncommon items
('Стальной меч', 'Прочный меч из закаленной стали', 'weapon', 'weapon', 'uncommon', 10, 8, 2, 0, 0, 0, 0, 35, 0, 200, 1, '⚔️'),
('Эльфийский лук', 'Элегантный лук эльфийской работы', 'weapon', 'weapon', 'uncommon', 12, 2, 10, 0, 0, 0, 3, 28, 0, 250, 1, '🏹'),
('Кольчуга', 'Прочная кольчужная броня', 'armor', 'chest', 'uncommon', 8, 3, 0, 0, 5, 0, 0, 0, 18, 180, 1, '🛡️'),

-- Rare items
('Пламенный клинок', 'Меч, пылающий магическим огнем', 'weapon', 'weapon', 'rare', 20, 15, 5, 3, 0, 0, 0, 55, 0, 500, 1, '🔥'),
('Лунный лук', 'Мистический лук, светящийся лунным светом', 'weapon', 'weapon', 'rare', 22, 3, 18, 5, 0, 0, 8, 48, 0, 600, 1, '🌙'),
('Мантия архимага', 'Роскошная мантия с мощными чарами', 'armor', 'chest', 'rare', 25, 0, 2, 20, 8, 15, 5, 0, 15, 750, 1, '🧙‍♂️'),

-- Epic items
('Драконий клинок', 'Легендарный меч, выкованный из драконьей кости', 'weapon', 'weapon', 'epic', 40, 25, 8, 5, 5, 0, 5, 85, 0, 1500, 1, '🐉'),
('Коготь теней', 'Мистическое оружие убийц', 'weapon', 'weapon', 'epic', 35, 8, 30, 10, 0, 5, 15, 70, 0, 1200, 1, '🖤'),

-- Consumables
('Зелье здоровья', 'Восстанавливает 100 здоровья', 'consumable', NULL, 'common', 1, 0, 0, 0, 0, 0, 0, 0, 0, 20, 50, '🧪'),
('Зелье маны', 'Восстанавливает 50 маны', 'consumable', NULL, 'common', 1, 0, 0, 0, 0, 0, 0, 0, 0, 15, 50, '💙'),
('Свиток телепорта', 'Мгновенно переносит в город', 'consumable', NULL, 'uncommon', 5, 0, 0, 0, 0, 0, 0, 0, 0, 100, 10, '📜'),

-- Materials
('Железная руда', 'Базовый материал для крафта', 'material', NULL, 'common', 1, 0, 0, 0, 0, 0, 0, 0, 0, 5, 100, '⛏️'),
('Драгоценный камень', 'Редкий материал для улучшений', 'material', NULL, 'rare', 20, 0, 0, 0, 0, 0, 0, 0, 0, 200, 20, '💎'),
('Сущность тьмы', 'Мистический материал темной магии', 'material', NULL, 'epic', 50, 0, 0, 0, 0, 0, 0, 0, 0, 1000, 5, '🌑');

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

-- Loot drops
INSERT INTO loot_drops (loot_table_id, item_id, drop_rate, quantity_min, quantity_max) VALUES
-- Слайм лут (низкий уровень)
((SELECT id FROM loot_tables WHERE name = 'Слайм лут'), (SELECT id FROM items WHERE name = 'Зелье здоровья'), 30.0, 1, 2),
((SELECT id FROM loot_tables WHERE name = 'Слайм лут'), (SELECT id FROM items WHERE name = 'Железная руда'), 20.0, 1, 3),

-- Волк лут
((SELECT id FROM loot_tables WHERE name = 'Волк лут'), (SELECT id FROM items WHERE name = 'Зелье здоровья'), 25.0, 1, 1),
((SELECT id FROM loot_tables WHERE name = 'Волк лут'), (SELECT id FROM items WHERE name = 'Кожаные сапоги'), 15.0, 1, 1),
((SELECT id FROM loot_tables WHERE name = 'Волк лут'), (SELECT id FROM items WHERE name = 'Железная руда'), 35.0, 2, 4),

-- Паук лут
((SELECT id FROM loot_tables WHERE name = 'Паук лут'), (SELECT id FROM items WHERE name = 'Зелье маны'), 20.0, 1, 2),
((SELECT id FROM loot_tables WHERE name = 'Паук лут'), (SELECT id FROM items WHERE name = 'Деревянный меч'), 10.0, 1, 1),

-- Орк лут (лучшая добыча для новичков)
((SELECT id FROM loot_tables WHERE name = 'Орк лут'), (SELECT id FROM items WHERE name = 'Стальной меч'), 8.0, 1, 1),
((SELECT id FROM loot_tables WHERE name = 'Орк лут'), (SELECT id FROM items WHERE name = 'Кольчуга'), 5.0, 1, 1),
((SELECT id FROM loot_tables WHERE name = 'Орк лут'), (SELECT id FROM items WHERE name = 'Зелье здоровья'), 40.0, 2, 5),
((SELECT id FROM loot_tables WHERE name = 'Орк лут'), (SELECT id FROM items WHERE name = 'Железная руда'), 50.0, 3, 8),

-- Летучая мышь лут
((SELECT id FROM loot_tables WHERE name = 'Летучая мышь лут'), (SELECT id FROM items WHERE name = 'Свиток телепорта'), 12.0, 1, 1),
((SELECT id FROM loot_tables WHERE name = 'Летучая мышь лут'), (SELECT id FROM items WHERE name = 'Зелье маны'), 30.0, 1, 3),

-- Голем лут (хорошие материалы)
((SELECT id FROM loot_tables WHERE name = 'Голем лут'), (SELECT id FROM items WHERE name = 'Драгоценный камень'), 15.0, 1, 2),
((SELECT id FROM loot_tables WHERE name = 'Голем лут'), (SELECT id FROM items WHERE name = 'Железная руда'), 70.0, 5, 15),
((SELECT id FROM loot_tables WHERE name = 'Голем лут'), (SELECT id FROM items WHERE name = 'Эльфийский лук'), 3.0, 1, 1),

-- Убийца лут (редкое оружие)
((SELECT id FROM loot_tables WHERE name = 'Убийца лут'), (SELECT id FROM items WHERE name = 'Коготь теней'), 2.0, 1, 1),
((SELECT id FROM loot_tables WHERE name = 'Убийца лут'), (SELECT id FROM items WHERE name = 'Сущность тьмы'), 8.0, 1, 2),
((SELECT id FROM loot_tables WHERE name = 'Убийца лут'), (SELECT id FROM items WHERE name = 'Зелье здоровья'), 45.0, 3, 6),

-- Скелет лут
((SELECT id FROM loot_tables WHERE name = 'Скелет лут'), (SELECT id FROM items WHERE name = 'Пламенный клинок'), 4.0, 1, 1),
((SELECT id FROM loot_tables WHERE name = 'Скелет лут'), (SELECT id FROM items WHERE name = 'Драгоценный камень'), 25.0, 1, 3),
((SELECT id FROM loot_tables WHERE name = 'Скелет лут'), (SELECT id FROM items WHERE name = 'Сущность тьмы'), 15.0, 1, 2),

-- Некромант лут (магические предметы)
((SELECT id FROM loot_tables WHERE name = 'Некромант лут'), (SELECT id FROM items WHERE name = 'Мантия архимага'), 6.0, 1, 1),
((SELECT id FROM loot_tables WHERE name = 'Некромант лут'), (SELECT id FROM items WHERE name = 'Сущность тьмы'), 40.0, 2, 5),
((SELECT id FROM loot_tables WHERE name = 'Некромант лут'), (SELECT id FROM items WHERE name = 'Зелье маны'), 60.0, 5, 10),

-- Лич лут (лучшие награды)
((SELECT id FROM loot_tables WHERE name = 'Лич лут'), (SELECT id FROM items WHERE name = 'Драконий клинок'), 1.0, 1, 1),
((SELECT id FROM loot_tables WHERE name = 'Лич лут'), (SELECT id FROM items WHERE name = 'Мантия архимага'), 8.0, 1, 1),
((SELECT id FROM loot_tables WHERE name = 'Лич лут'), (SELECT id FROM items WHERE name = 'Сущность тьмы'), 60.0, 3, 8),
((SELECT id FROM loot_tables WHERE name = 'Лич лут'), (SELECT id FROM items WHERE name = 'Драгоценный камень'), 45.0, 2, 6);
