-- ============================================
-- НАЧАЛЬНЫЕ ПРЕДМЕТЫ ДЛЯ СИСТЕМЫ ИНВЕНТАРЯ
-- ============================================

-- Очищаем существующие данные (осторожно!)
-- DELETE FROM character_inventory;
-- DELETE FROM items;

-- ОРУЖИЕ
INSERT INTO items (item_key, name, description, rarity, type, subtype, icon, level_requirement, base_damage, base_crit_chance, base_value, max_durability) VALUES
('wooden_sword', 'Деревянный меч', 'Простой тренировочный меч из дуба. Подходит для новичков.', 'common', 'weapon', 'Одноручный меч', '🗡️', 1, 15, 2.0, 25, 50),
('iron_sword', 'Железный меч', 'Надежный клинок из закаленной стали. Излюбленное оружие начинающих воинов.', 'common', 'weapon', 'Одноручный меч', '⚔️', 5, 45, 5.0, 150, 100),
('silver_blade', 'Серебряный клинок', 'Элегантное оружие из чистого серебра. Эффективно против нежити.', 'uncommon', 'weapon', 'Одноручный меч', '🗡️', 10, 75, 8.0, 400, 120),
('enchanted_staff', 'Зачарованный посох', 'Посох пульсирует магической энергией. Увеличивает силу заклинаний.', 'rare', 'weapon', 'Посох', '🪄', 15, 35, 3.0, 800, 80),
('dragons_claw', 'Коготь дракона', 'Легендарное оружие, выкованное из когтя древнего дракона.', 'legendary', 'weapon', 'Кинжал', '🗡️', 25, 120, 25.0, 3000, 200),
('shadowbane', 'Теневой бич', 'Мифическое оружие, способное разрезать саму тьму.', 'mythic', 'weapon', 'Двуручный меч', '⚔️', 35, 200, 35.0, 15000, 300);

-- БРОНЯ
INSERT INTO items (item_key, name, description, rarity, type, subtype, icon, level_requirement, base_defense, base_health, base_value, max_durability) VALUES
('leather_armor', 'Кожаная броня', 'Легкая броня из обработанной кожи. Обеспечивает базовую защиту.', 'common', 'armor', 'Легкая броня', '🦺', 1, 25, 50, 100, 80),
('chain_mail', 'Кольчуга', 'Кольчужный доспех из стальных колец. Хороший баланс защиты и мобильности.', 'uncommon', 'armor', 'Средняя броня', '🛡️', 8, 60, 100, 350, 120),
('plate_armor', 'Латные доспехи', 'Тяжелые стальные доспехи. Максимальная защита для воинов.', 'rare', 'armor', 'Тяжелая броня', '🛡️', 15, 150, 200, 1200, 200),
('dragon_scale_armor', 'Доспех из чешуи дракона', 'Легендарный доспех, выкованный из чешуи древнего красного дракона. Дарует защиту от огня.', 'legendary', 'armor', 'Тяжелая броня', '🛡️', 25, 120, 200, 5000, 150);

-- АКСЕССУАРЫ
INSERT INTO items (item_key, name, description, rarity, type, subtype, icon, level_requirement, base_mana, base_crit_chance, base_speed, base_value, max_durability, set_name) VALUES
('mystic_ring', 'Кольцо мистика', 'Таинственное кольцо пульсирует магической энергией.', 'epic', 'accessory', 'Кольцо', '💍', 15, 100, 12.0, 8.0, 800, NULL, NULL),
('amulet_of_power', 'Амулет силы', 'Древний амулет, дарующий своему владельцу невероятную мощь.', 'legendary', 'accessory', 'Амулет', '📿', 20, 80, 15.0, 5.0, 2000, NULL, 'Комплект Архимага'),
('shadow_cloak', 'Плащ теней', 'Мистический плащ делает своего владельца почти невидимым.', 'mythic', 'accessory', 'Плащ', '🦹', 30, 50, 20.0, 25.0, 8000, NULL, NULL);

-- РАСХОДНИКИ
INSERT INTO items (item_key, name, description, rarity, type, subtype, icon, level_requirement, base_health, base_mana, base_value, stackable, max_stack) VALUES
('health_potion_small', 'Малое зелье здоровья', 'Простое лечебное зелье красного цвета.', 'common', 'consumable', 'Зелье', '🧪', 1, 50, 0, 15, true, 10),
('health_potion_large', 'Большое зелье лечения', 'Мощное зелье исцеления с приятным мятным вкусом.', 'rare', 'consumable', 'Зелье', '🍶', 10, 150, 0, 75, true, 5),
('mana_potion', 'Зелье маны', 'Светящаяся синяя жидкость восстанавливает магическую энергию.', 'uncommon', 'consumable', 'Зелье', '🧪', 1, 0, 50, 25, true, 8),
('elixir_of_strength', 'Эликсир силы', 'Редкий эликсир временно увеличивает физическую силу.', 'epic', 'consumable', 'Эликсир', '⚗️', 15, 0, 0, 200, true, 3);

-- МАТЕРИАЛЫ ДЛЯ КРАФТИНГА
INSERT INTO items (item_key, name, description, rarity, type, subtype, icon, level_requirement, base_value, stackable, max_stack) VALUES
('iron_ore', 'Железная руда', 'Базовый материал для кузнечного дела.', 'common', 'material', 'Руда', '⛏️', 1, 5, true, 50),
('silver_ore', 'Серебряная руда', 'Редкая руда с магическими свойствами.', 'uncommon', 'material', 'Руда', '⛏️', 10, 25, true, 30),
('dragon_scale', 'Чешуя дракона', 'Прочная чешуя, содержащая остатки драконьей магии.', 'legendary', 'material', 'Чешуя', '🐲', 25, 500, true, 10),
('phoenix_feather', 'Перо феникса', 'Редкий материал для крафтинга, пылающий вечным огнем.', 'mythic', 'material', 'Перо', '🪶', 30, 10000, true, 1),
('magic_crystal', 'Магический кристалл', 'Кристалл концентрирует магическую энергию.', 'rare', 'material', 'Кристалл', '💎', 15, 150, true, 20),
('ancient_scroll', 'Древний свиток', 'Старинный свиток с забытыми заклинаниями.', 'epic', 'material', 'Свиток', '📜', 20, 800, true, 5);

-- СЕТОВЫЕ ПРЕДМЕТЫ
INSERT INTO items (item_key, name, description, rarity, type, subtype, icon, level_requirement, base_defense, base_mana, base_crit_chance, base_value, max_durability, set_name, set_bonus) VALUES
('archmage_robe', 'Роба архимага', 'Часть легендарного комплекта величайшего мага.', 'legendary', 'armor', 'Роба', '🧙', 25, 80, 150, 10.0, 4000, 120, 'Комплект Архимага', '2 предмета: +50 мана, 4 предмета: Телепортация'),
('archmage_hat', 'Шляпа архимага', 'Остроконечная шляпа с магическими рунами.', 'legendary', 'accessory', 'Шляпа', '🎩', 25, 40, 100, 15.0, 3000, 80, 'Комплект Архимага', '2 предмета: +50 мана, 4 предмета: Телепортация');

-- Обновляем некоторые предметы с требованиями по статам и классам
UPDATE items SET class_requirement = 'Воин', requirements_stats = '{"defense": 20}' WHERE item_key IN ('plate_armor', 'dragon_scale_armor');
UPDATE items SET class_requirement = 'Маг', requirements_stats = '{"mana": 100}' WHERE item_key IN ('enchanted_staff', 'archmage_robe', 'archmage_hat');
UPDATE items SET requirements_stats = '{"level": 30, "crit_chance": 15}' WHERE item_key = 'shadowbane';

-- Создаем представление (VIEW) для удобного просмотра полных характеристик предметов
CREATE OR REPLACE VIEW items_full AS
SELECT 
    i.*,
    -- Вычисляемые поля для общих характеристик
    (base_damage + COALESCE(inv.bonus_damage, 0)) as total_damage,
    (base_defense + COALESCE(inv.bonus_defense, 0)) as total_defense,
    (base_health + COALESCE(inv.bonus_health, 0)) as total_health,
    (base_mana + COALESCE(inv.bonus_mana, 0)) as total_mana,
    (base_crit_chance + COALESCE(inv.bonus_crit_chance, 0)) as total_crit_chance,
    (base_crit_damage + COALESCE(inv.bonus_crit_damage, 0)) as total_crit_damage,
    (base_speed + COALESCE(inv.bonus_speed, 0)) as total_speed,
    
    -- Информация об инвентаре (если запрашивается для конкретного персонажа)
    inv.character_id,
    inv.slot_position,
    inv.stack_size,
    inv.current_durability,
    inv.upgrade_level,
    inv.obtained_at
FROM items i
LEFT JOIN character_inventory inv ON i.id = inv.item_id;

COMMENT ON VIEW items_full IS 'Полное представление предметов с учетом модификаторов из инвентаря';
