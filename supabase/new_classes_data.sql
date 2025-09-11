-- Данные для новых классов

-- 1. Лучник
INSERT INTO character_classes (
    name, description,
    base_agility, base_precision, base_evasion, base_intelligence, base_spell_power, base_resistance, base_strength, base_endurance, base_armor, base_stealth,
    agility_per_level, precision_per_level, evasion_per_level, intelligence_per_level, spell_power_per_level, resistance_per_level, strength_per_level, endurance_per_level, armor_per_level, stealth_per_level,
    starting_skills, icon, primary_stats
) VALUES (
    'Лучник',
    'Быстрый и точный боец дальнего боя. Высокая скорость атаки и критический урон.',
    25, 20, 18, 8, 5, 8, 12, 15, 10, 5,
    2.5, 2.0, 1.8, 0.8, 0.5, 0.8, 1.2, 1.5, 1.0, 0.5,
    '{"Выстрел с натяжкой", "Двойной выстрел", "Град стрел", "Инстинкты охотника", "Танец ветра", "Смертоносный шквал"}',
    '🏹',
    '{"agility", "precision", "evasion"}'
);

-- 2. Маг
INSERT INTO character_classes (
    name, description,
    base_agility, base_precision, base_evasion, base_intelligence, base_spell_power, base_resistance, base_strength, base_endurance, base_armor, base_stealth,
    agility_per_level, precision_per_level, evasion_per_level, intelligence_per_level, spell_power_per_level, resistance_per_level, strength_per_level, endurance_per_level, armor_per_level, stealth_per_level,
    starting_skills, icon, primary_stats
) VALUES (
    'Маг',
    'Мастер магических искусств с разрушительными заклинаниями и высоким магическим уроном.',
    8, 10, 12, 25, 22, 18, 6, 12, 8, 5,
    0.8, 1.0, 1.2, 2.5, 2.2, 1.8, 0.6, 1.2, 0.8, 0.5,
    '{"Искра", "Чародейский залп", "Взрывная волна", "Сила маны", "Магический щит", "Поглощающее пламя"}',
    '🪄',
    '{"intelligence", "spell_power", "resistance"}'
);

-- 3. Берсерк
INSERT INTO character_classes (
    name, description,
    base_agility, base_precision, base_evasion, base_intelligence, base_spell_power, base_resistance, base_strength, base_endurance, base_armor, base_stealth,
    agility_per_level, precision_per_level, evasion_per_level, intelligence_per_level, spell_power_per_level, resistance_per_level, strength_per_level, endurance_per_level, armor_per_level, stealth_per_level,
    starting_skills, icon, primary_stats
) VALUES (
    'Берсерк',
    'Дикий воин, жертвующий защитой ради огромного урона. Высокая скорость атаки и выносливость.',
    15, 12, 8, 5, 3, 6, 25, 22, 18, 3,
    1.5, 1.2, 0.8, 0.5, 0.3, 0.6, 2.5, 2.2, 1.8, 0.3,
    '{"Мощный удар", "Рассекающий взмах", "Вихрь ярости", "Гнев берсерка", "Кожа камня", "Кровавый шторм"}',
    '⚔️',
    '{"strength", "endurance", "armor"}'
);

-- 4. Ассасин
INSERT INTO character_classes (
    name, description,
    base_agility, base_precision, base_evasion, base_intelligence, base_spell_power, base_resistance, base_strength, base_endurance, base_armor, base_stealth,
    agility_per_level, precision_per_level, evasion_per_level, intelligence_per_level, spell_power_per_level, resistance_per_level, strength_per_level, endurance_per_level, armor_per_level, stealth_per_level,
    starting_skills, icon, primary_stats
) VALUES (
    'Ассасин',
    'Мастер скрытности и критических ударов. Высокая скорость и шанс критического урона.',
    22, 18, 20, 10, 8, 8, 15, 12, 10, 25,
    2.2, 1.8, 2.0, 1.0, 0.8, 0.8, 1.5, 1.2, 1.0, 2.5,
    '{"Удар в сердце", "Теневая вспышка", "Танец клинков", "Тень охотника", "Дымовая завеса", "Ритуал крови"}',
    '🗡️',
    '{"agility", "stealth", "precision"}'
);

-- Создаем скиллы для всех классов

-- Скиллы Лучника
INSERT INTO skills (name, description, skill_type, required_class, mana_cost, cooldown, base_damage, damage_type, scaling_stat, scaling_ratio, special_effects, icon) VALUES
('Выстрел с натяжкой', 'Быстрый выстрел одной стрелой, базовый физический урон.', 'standard', '{"Лучник"}', 0, 0, 100, 'physical', 'agility', 1.5, '{}', '🏹'),
('Двойной выстрел', 'Выпускает две стрелы подряд с повышенным уроном по одной цели.', 'enhanced', '{"Лучник"}', 15, 8, 180, 'physical', 'agility', 2.0, '{}', '🏹🏹'),
('Град стрел', 'Осаждает выбранную область дождём стрел, нанося урон всем врагам в радиусе.', 'aoe', '{"Лучник"}', 30, 15, 120, 'physical', 'precision', 1.8, '{}', '🌧️'),
('Инстинкты охотника', 'Увеличивает скорость атаки и шанс критического удара на короткое время.', 'buff', '{"Лучник"}', 25, 30, 0, 'true', 'agility', 1.0, '{"attack_speed_boost", "crit_chance_boost"}', '👁️'),
('Танец ветра', 'Создаёт вихрь вокруг себя, повышая уклонение и уменьшая входящий урон.', 'barrier', '{"Лучник"}', 35, 45, 0, 'true', 'evasion', 1.0, '{"evasion_boost", "damage_reduction"}', '🌪️'),
('Смертоносный шквал', 'Мощный залп в широком секторе, наносит урон и восстанавливает здоровье пропорционально нанесённому.', 'lifesteal', '{"Лучник"}', 50, 60, 200, 'physical', 'agility', 2.5, '{"lifesteal"}', '💀');

-- Скиллы Мага
INSERT INTO skills (name, description, skill_type, required_class, mana_cost, cooldown, base_damage, damage_type, scaling_stat, scaling_ratio, special_effects, icon) VALUES
('Искра', 'Быстрое магическое снаряжение, базовый урон стихией.', 'standard', '{"Маг"}', 5, 0, 80, 'magical', 'spell_power', 1.2, '{}', '✨'),
('Чародейский залп', 'Выпускает усиленный сгусток магической энергии с повышенным уроном.', 'enhanced', '{"Маг"}', 20, 10, 150, 'magical', 'spell_power', 2.2, '{}', '💥'),
('Взрывная волна', 'Создаёт магическую волну вокруг себя, наносящую урон нескольким врагам.', 'aoe', '{"Маг"}', 40, 20, 100, 'magical', 'intelligence', 1.5, '{}', '💢'),
('Сила маны', 'Повышает магическую мощь и скорость восстановления маны на время.', 'buff', '{"Маг"}', 30, 35, 0, 'true', 'intelligence', 1.0, '{"spell_power_boost", "mana_regen_boost"}', '🔮'),
('Магический щит', 'Создаёт щит, поглощающий часть входящего урона.', 'barrier', '{"Маг"}', 45, 50, 0, 'true', 'resistance', 1.0, '{"damage_absorption"}', '🛡️'),
('Поглощающее пламя', 'Огненный взрыв, наносящий большой урон по площади и возвращающий часть нанесённого урона в здоровье мага.', 'lifesteal', '{"Маг"}', 60, 70, 250, 'magical', 'spell_power', 3.0, '{"lifesteal"}', '🔥');

-- Скиллы Берсерка
INSERT INTO skills (name, description, skill_type, required_class, mana_cost, cooldown, base_damage, damage_type, scaling_stat, scaling_ratio, special_effects, icon) VALUES
('Мощный удар', 'Сильный удар оружием по одной цели.', 'standard', '{"Берсерк"}', 0, 0, 120, 'physical', 'strength', 2.0, '{}', '⚔️'),
('Рассекающий взмах', 'Удар по дуге с повышенным уроном, наносимый одной цели с шансом критического урона.', 'enhanced', '{"Берсерк"}', 15, 8, 200, 'physical', 'strength', 2.5, '{"crit_chance_boost"}', '⚡'),
('Вихрь ярости', 'Берсерк вращается, нанося урон всем врагам вокруг себя.', 'aoe', '{"Берсерк"}', 25, 15, 140, 'physical', 'strength', 2.0, '{}', '🌪️'),
('Гнев берсерка', 'Увеличивает физическую силу и скорость атаки, но снижает защиту.', 'buff', '{"Берсерк"}', 20, 25, 0, 'true', 'strength', 1.0, '{"strength_boost", "attack_speed_boost", "defense_reduction"}', '😡'),
('Кожа камня', 'Увеличивает броню и уменьшает получаемый урон на короткое время.', 'barrier', '{"Берсерк"}', 30, 40, 0, 'true', 'armor', 1.0, '{"armor_boost", "damage_reduction"}', '🗿'),
('Кровавый шторм', 'Серия мощных ударов по площади, наносящая урон и восстанавливающая здоровье в зависимости от нанесённого урона.', 'lifesteal', '{"Берсерк"}', 40, 50, 300, 'physical', 'strength', 3.0, '{"lifesteal"}', '🌩️');

-- Скиллы Ассасина
INSERT INTO skills (name, description, skill_type, required_class, mana_cost, cooldown, base_damage, damage_type, scaling_stat, scaling_ratio, special_effects, icon) VALUES
('Удар в сердце', 'Быстрая атака кинжалом по одной цели.', 'standard', '{"Ассасин"}', 0, 0, 90, 'physical', 'stealth', 1.8, '{}', '🗡️'),
('Теневая вспышка', 'Телепортируется к врагу и наносит усиленный урон.', 'enhanced', '{"Ассасин"}', 20, 12, 160, 'physical', 'stealth', 2.2, '{"teleport"}', '💨'),
('Танец клинков', 'Ассасин стремительно вращается, поражая всех врагов вокруг себя.', 'aoe', '{"Ассасин"}', 35, 18, 110, 'physical', 'agility', 1.6, '{}', '🌀'),
('Тень охотника', 'Повышает скорость передвижения, шанс критического удара и скрытность.', 'buff', '{"Ассасин"}', 25, 30, 0, 'true', 'stealth', 1.0, '{"movement_speed_boost", "crit_chance_boost", "stealth_boost"}', '👤'),
('Дымовая завеса', 'Создаёт дым, уменьшающий точность врагов и шанс попасть по ассасину.', 'barrier', '{"Ассасин"}', 40, 45, 0, 'true', 'evasion', 1.0, '{"evasion_boost", "accuracy_reduction"}', '💨'),
('Ритуал крови', 'Серия ударов по площади с возвратом здоровья за нанесённый урон.', 'lifesteal', '{"Ассасин"}', 45, 55, 180, 'physical', 'stealth', 2.8, '{"lifesteal"}', '🩸');

