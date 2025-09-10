-- ============================================
-- ТЕСТОВЫЕ ДАННЫЕ ДЛЯ MMORPG GAME
-- ============================================

-- Вставка тестовых классов персонажей
INSERT INTO character_classes (id, name, description, base_strength, base_dexterity, base_intelligence, base_vitality, base_energy, base_luck, strength_per_level, dexterity_per_level, intelligence_per_level, vitality_per_level, energy_per_level, luck_per_level, starting_skills, icon, primary_stat) VALUES
('warrior', 'Воин', 'Мастер ближнего боя с высокой защитой', 15, 10, 8, 12, 8, 10, 2.0, 1.0, 0.5, 2.5, 0.5, 1.0, '{"basic_attack", "shield_bash"}', '⚔️', 'strength'),
('mage', 'Маг', 'Повелитель магии с высоким уроном', 8, 10, 15, 8, 12, 10, 0.5, 1.0, 2.5, 1.0, 2.0, 1.0, '{"fireball", "mana_shield"}', '🔮', 'intelligence'),
('rogue', 'Разбойник', 'Быстрый и ловкий боец', 10, 15, 10, 10, 10, 12, 1.0, 2.5, 1.0, 1.0, 1.0, 1.5, '{"stealth", "backstab"}', '🗡️', 'dexterity'),
('priest', 'Жрец', 'Исцеляющий и поддерживающий класс', 8, 10, 12, 10, 15, 10, 0.5, 1.0, 2.0, 1.5, 2.5, 1.0, '{"heal", "blessing"}', '⛪', 'energy'),
('paladin', 'Паладин', 'Святой воин с магическими способностями', 12, 8, 10, 15, 10, 8, 1.5, 0.5, 1.0, 2.5, 1.5, 0.5, '{"holy_strike", "divine_protection"}', '🛡️', 'vitality'),
('hunter', 'Охотник', 'Дальнобойный боец с питомцами', 10, 15, 8, 10, 8, 12, 1.0, 2.5, 0.5, 1.0, 0.5, 1.5, '{"aimed_shot", "tame_beast"}', '🏹', 'dexterity'),
('warlock', 'Варлок', 'Темный маг с демонами', 8, 10, 15, 8, 12, 10, 0.5, 1.0, 2.5, 1.0, 2.0, 1.0, '{"shadow_bolt", "summon_demon"}', '👹', 'intelligence'),
('death_knight', 'Рыцарь Смерти', 'Нежить с темной силой', 15, 8, 10, 12, 10, 8, 2.0, 0.5, 1.0, 2.0, 1.0, 0.5, '{"death_strike", "unholy_aura"}', '💀', 'strength'),
('shaman', 'Шаман', 'Духовный воин с элементальной магией', 10, 10, 12, 12, 12, 10, 1.0, 1.0, 2.0, 2.0, 2.0, 1.0, '{"lightning_bolt", "spirit_wolf"}', '🌩️', 'intelligence'),
('druid', 'Друид', 'Повелитель природы с трансформациями', 8, 12, 12, 10, 12, 10, 0.5, 1.5, 2.0, 1.5, 2.0, 1.0, '{"moonfire", "bear_form"}', '🌿', 'intelligence'),
('monk', 'Монах', 'Боец с внутренней силой', 10, 15, 10, 12, 10, 10, 1.0, 2.5, 1.0, 2.0, 1.0, 1.0, '{"fist_of_fury", "meditation"}', '🥋', 'dexterity'),
('demon_hunter', 'Охотник на демонов', 'Элитный боец с темной силой', 12, 15, 8, 10, 8, 12, 1.5, 2.5, 0.5, 1.0, 0.5, 1.5, '{"chaos_strike", "metamorphosis"}', '😈', 'dexterity');

-- Вставка тестовых локаций
INSERT INTO locations (id, name, description, min_level, max_level, experience_bonus, gold_bonus, image) VALUES
('starting_zone', 'Начальная зона', 'Безопасное место для новичков', 1, 10, 0, 0, '/images/locations/starting_zone.jpg'),
('dark_forest', 'Темный лес', 'Опасный лес с дикими зверями', 5, 15, 10, 5, '/images/locations/dark_forest.jpg'),
('mountain_peaks', 'Горные вершины', 'Высокие горы с драконами', 10, 25, 20, 15, '/images/locations/mountain_peaks.jpg'),
('cursed_swamp', 'Проклятое болото', 'Токсичное болото с нежитью', 15, 30, 25, 20, '/images/locations/cursed_swamp.jpg'),
('volcanic_caverns', 'Вулканические пещеры', 'Горячие пещеры с элементалями', 20, 40, 30, 25, '/images/locations/volcanic_caverns.jpg'),
('crystal_desert', 'Кристальная пустыня', 'Пустыня с кристальными монстрами', 25, 50, 35, 30, '/images/locations/crystal_desert.jpg'),
('shadow_realm', 'Теневая реальность', 'Альтернативная реальность с тенями', 35, 60, 40, 35, '/images/locations/shadow_realm.jpg'),
('celestial_plane', 'Небесная плоскость', 'Божественная плоскость с ангелами', 50, 100, 50, 40, '/images/locations/celestial_plane.jpg');

-- Вставка тестовых мобов
INSERT INTO mobs (id, name, description, level, health, attack_damage, defense, magic_resistance, aggressive, respawn_time, experience_reward, gold_reward, loot_table_id, image) VALUES
('goblin', 'Гоблин', 'Маленький зеленый гоблин', 1, 50, 10, 5, 2, true, 30, 25, 5, 'goblin_loot', '/images/mobs/goblin.jpg'),
('orc', 'Орк', 'Сильный орк-воин', 3, 120, 25, 15, 5, true, 60, 75, 15, 'orc_loot', '/images/mobs/orc.jpg'),
('skeleton', 'Скелет', 'Нежить-скелет', 5, 80, 20, 10, 15, true, 45, 100, 20, 'skeleton_loot', '/images/mobs/skeleton.jpg'),
('troll', 'Тролль', 'Большой тролль-регенератор', 8, 200, 40, 25, 10, true, 120, 200, 40, 'troll_loot', '/images/mobs/troll.jpg'),
('dragon', 'Дракон', 'Древний огненный дракон', 20, 1000, 100, 50, 80, true, 300, 1000, 200, 'dragon_loot', '/images/mobs/dragon.jpg'),
('lich', 'Лич', 'Могущественный нежить-маг', 25, 800, 80, 30, 100, true, 240, 1500, 300, 'lich_loot', '/images/mobs/lich.jpg'),
('demon_lord', 'Повелитель демонов', 'Владыка демонов', 40, 2000, 150, 80, 120, true, 600, 5000, 1000, 'demon_lord_loot', '/images/mobs/demon_lord.jpg'),
('angel', 'Ангел', 'Небесный ангел-хранитель', 50, 1500, 120, 100, 150, false, 480, 8000, 1500, 'angel_loot', '/images/mobs/angel.jpg');

-- Вставка тестовых предметов
INSERT INTO items (id, name, description, type, subtype, rarity, level_requirement, class_requirement, strength_bonus, dexterity_bonus, intelligence_bonus, vitality_bonus, energy_bonus, luck_bonus, attack_damage, magic_damage, defense, magic_resistance, special_effects, vendor_price, stack_size, icon) VALUES
('iron_sword', 'Железный меч', 'Простой железный меч', 'weapon', 'sword', 'common', 1, '{"warrior", "paladin", "death_knight"}', 5, 0, 0, 0, 0, 0, 15, 0, 0, 0, '{}', 50, 1, '/images/items/iron_sword.jpg'),
('magic_staff', 'Магический посох', 'Посох для заклинаний', 'weapon', 'staff', 'common', 1, '{"mage", "priest", "warlock", "shaman", "druid"}', 0, 0, 5, 0, 0, 0, 0, 20, 0, 0, '{}', 60, 1, '/images/items/magic_staff.jpg'),
('leather_armor', 'Кожаная броня', 'Легкая кожаная броня', 'armor', 'chest', 'common', 1, '{}', 0, 2, 0, 3, 0, 0, 0, 0, 10, 0, '{}', 40, 1, '/images/items/leather_armor.jpg'),
('health_potion', 'Зелье здоровья', 'Восстанавливает здоровье', 'consumable', 'potion', 'common', 1, '{}', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '{"heal": 50}', 25, 10, '/images/items/health_potion.jpg'),
('mana_potion', 'Зелье маны', 'Восстанавливает ману', 'consumable', 'potion', 'common', 1, '{}', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '{"mana": 30}', 30, 10, '/images/items/mana_potion.jpg'),
('iron_ore', 'Железная руда', 'Руда для крафта', 'material', 'ore', 'common', 1, '{}', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '{}', 5, 50, '/images/items/iron_ore.jpg'),
('steel_sword', 'Стальной меч', 'Улучшенный стальной меч', 'weapon', 'sword', 'uncommon', 5, '{"warrior", "paladin", "death_knight"}', 8, 0, 0, 0, 0, 0, 25, 0, 0, 0, '{}', 150, 1, '/images/items/steel_sword.jpg'),
('enchanted_ring', 'Зачарованное кольцо', 'Кольцо с магическими свойствами', 'accessory', 'ring', 'rare', 10, '{}', 0, 0, 3, 0, 3, 2, 0, 0, 0, 5, '{}', 300, 1, '/images/items/enchanted_ring.jpg'),
('dragon_scale_armor', 'Броня из чешуи дракона', 'Мощная броня из чешуи дракона', 'armor', 'chest', 'epic', 20, '{"warrior", "paladin"}', 10, 0, 0, 15, 0, 0, 0, 0, 50, 30, '{"fire_resistance": 25}', 2000, 1, '/images/items/dragon_scale_armor.jpg'),
('phoenix_feather', 'Перо феникса', 'Редкое перо феникса', 'material', 'feather', 'legendary', 30, '{}', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '{"resurrection": true}', 5000, 1, '/images/items/phoenix_feather.jpg');

-- Вставка тестовых навыков
INSERT INTO skills (id, name, description, skill_type, required_level, required_class, mana_cost, stamina_cost, cooldown, base_damage, damage_type, scaling_stat, scaling_ratio, available_nodes, icon) VALUES
('basic_attack', 'Базовая атака', 'Простая физическая атака', 'active', 1, '{}', 0, 10, 0, 100, 'physical', 'strength', 1.0, '{}', '/images/skills/basic_attack.jpg'),
('fireball', 'Огненный шар', 'Магический огненный шар', 'active', 1, '{"mage", "warlock"}', 20, 0, 3, 150, 'magical', 'intelligence', 1.5, '{}', '/images/skills/fireball.jpg'),
('heal', 'Исцеление', 'Восстанавливает здоровье союзника', 'active', 1, '{"priest", "paladin", "druid"}', 25, 0, 5, 0, 'magical', 'intelligence', 2.0, '{}', '/images/skills/heal.jpg'),
('stealth', 'Скрытность', 'Делает персонажа невидимым', 'active', 3, '{"rogue", "hunter"}', 0, 30, 10, 0, 'magical', 'dexterity', 0.0, '{}', '/images/skills/stealth.jpg'),
('shield_bash', 'Удар щитом', 'Оглушает противника', 'active', 5, '{"warrior", "paladin"}', 0, 20, 8, 80, 'physical', 'strength', 0.8, '{}', '/images/skills/shield_bash.jpg'),
('lightning_bolt', 'Молния', 'Электрическая атака', 'active', 8, '{"mage", "shaman"}', 30, 0, 4, 200, 'magical', 'intelligence', 2.0, '{}', '/images/skills/lightning_bolt.jpg'),
('berserker_rage', 'Ярость берсерка', 'Увеличивает урон и скорость атаки', 'active', 15, '{"warrior", "death_knight"}', 0, 50, 60, 0, 'magical', 'strength', 0.0, '{}', '/images/skills/berserker_rage.jpg'),
('meteor', 'Метеор', 'Призывает метеор с неба', 'aoe', 25, '{"mage", "warlock"}', 100, 0, 30, 500, 'magical', 'intelligence', 3.0, '{}', '/images/skills/meteor.jpg');

-- Вставка тестовых спотов фарминга
INSERT INTO farming_spots (id, location_id, name, description, max_occupancy, current_occupancy, occupied_by, mob_spawns, drop_rate_bonus, rare_drop_bonus, coordinates) VALUES
('goblin_camp', 'starting_zone', 'Лагерь гоблинов', 'Небольшой лагерь гоблинов', 5, 0, '{}', '{"goblin": {"spawn_rate": 2, "max_concurrent": 3}}', 0, 0, '{"x": 100, "y": 200}'),
('orc_village', 'dark_forest', 'Деревня орков', 'Деревня орков в лесу', 3, 0, '{}', '{"orc": {"spawn_rate": 1, "max_concurrent": 2}}', 10, 5, '{"x": 300, "y": 150}'),
('skeleton_crypt', 'dark_forest', 'Склеп скелетов', 'Древний склеп с нежитью', 2, 0, '{}', '{"skeleton": {"spawn_rate": 1.5, "max_concurrent": 2}}', 15, 10, '{"x": 250, "y": 300}'),
('troll_cave', 'mountain_peaks', 'Пещера троллей', 'Глубокая пещера с троллями', 1, 0, '{}', '{"troll": {"spawn_rate": 0.5, "max_concurrent": 1}}', 25, 20, '{"x": 500, "y": 100}'),
('dragon_lair', 'mountain_peaks', 'Логово дракона', 'Логово древнего дракона', 1, 0, '{}', '{"dragon": {"spawn_rate": 0.1, "max_concurrent": 1}}', 50, 40, '{"x": 600, "y": 50}'),
('lich_tower', 'cursed_swamp', 'Башня лича', 'Высокая башня лича', 1, 0, '{}', '{"lich": {"spawn_rate": 0.2, "max_concurrent": 1}}', 40, 35, '{"x": 400, "y": 400}'),
('demon_portal', 'shadow_realm', 'Портал демонов', 'Портал в мир демонов', 1, 0, '{}', '{"demon_lord": {"spawn_rate": 0.05, "max_concurrent": 1}}', 75, 60, '{"x": 800, "y": 200}'),
('celestial_garden', 'celestial_plane', 'Небесный сад', 'Сад с ангелами', 1, 0, '{}', '{"angel": {"spawn_rate": 0.1, "max_concurrent": 1}}', 100, 80, '{"x": 1000, "y": 100}');

-- Вставка тестовых таблиц лута
INSERT INTO loot_tables (id, name, drops) VALUES
('goblin_loot', 'Лут гоблинов', '[{"item_id": "iron_ore", "drop_rate": 30, "quantity_min": 1, "quantity_max": 3}, {"item_id": "health_potion", "drop_rate": 15, "quantity_min": 1, "quantity_max": 2}]'),
('orc_loot', 'Лут орков', '[{"item_id": "iron_sword", "drop_rate": 10, "quantity_min": 1, "quantity_max": 1}, {"item_id": "leather_armor", "drop_rate": 20, "quantity_min": 1, "quantity_max": 1}]'),
('skeleton_loot', 'Лут скелетов', '[{"item_id": "mana_potion", "drop_rate": 25, "quantity_min": 1, "quantity_max": 2}, {"item_id": "enchanted_ring", "drop_rate": 5, "quantity_min": 1, "quantity_max": 1}]'),
('troll_loot', 'Лут троллей', '[{"item_id": "steel_sword", "drop_rate": 15, "quantity_min": 1, "quantity_max": 1}, {"item_id": "health_potion", "drop_rate": 40, "quantity_min": 2, "quantity_max": 5}]'),
('dragon_loot', 'Лут драконов', '[{"item_id": "dragon_scale_armor", "drop_rate": 5, "quantity_min": 1, "quantity_max": 1}, {"item_id": "phoenix_feather", "drop_rate": 1, "quantity_min": 1, "quantity_max": 1}]'),
('lich_loot', 'Лут лича', '[{"item_id": "enchanted_ring", "drop_rate": 20, "quantity_min": 1, "quantity_max": 1}, {"item_id": "mana_potion", "drop_rate": 50, "quantity_min": 3, "quantity_max": 8}]'),
('demon_lord_loot', 'Лут повелителя демонов', '[{"item_id": "dragon_scale_armor", "drop_rate": 25, "quantity_min": 1, "quantity_max": 1}, {"item_id": "phoenix_feather", "drop_rate": 10, "quantity_min": 1, "quantity_max": 2}]'),
('angel_loot', 'Лут ангелов', '[{"item_id": "phoenix_feather", "drop_rate": 50, "quantity_min": 1, "quantity_max": 3}, {"item_id": "enchanted_ring", "drop_rate": 30, "quantity_min": 1, "quantity_max": 2}]');