-- ============================================
-- ПРОСТАЯ УСТАНОВКА ИНВЕНТАРЯ (БЕЗ RLS)
-- ============================================

-- ОЧИСТКА
DROP TABLE IF EXISTS character_inventory CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP FUNCTION IF EXISTS get_character_inventory(UUID);
DROP FUNCTION IF EXISTS add_item_to_inventory(UUID, VARCHAR, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS move_inventory_item(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS remove_item_from_inventory(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS sort_inventory(UUID);
DROP FUNCTION IF EXISTS give_starting_items(UUID);
DROP VIEW IF EXISTS items_full;

-- СОЗДАНИЕ ТАБЛИЦ
CREATE TABLE items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rarity VARCHAR(20) CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic')) DEFAULT 'common',
    type VARCHAR(50) CHECK (type IN ('weapon', 'armor', 'accessory', 'consumable', 'material')) NOT NULL,
    subtype VARCHAR(100),
    icon VARCHAR(10) DEFAULT '📦',
    level_requirement INTEGER DEFAULT 1,
    class_requirement VARCHAR(50),
    
    -- Характеристики
    base_damage INTEGER DEFAULT 0,
    base_defense INTEGER DEFAULT 0,
    base_health INTEGER DEFAULT 0,
    base_mana INTEGER DEFAULT 0,
    base_crit_chance DECIMAL(5,2) DEFAULT 0,
    base_crit_damage DECIMAL(5,2) DEFAULT 0,
    base_speed DECIMAL(5,2) DEFAULT 0,
    
    -- Системные характеристики
    base_value INTEGER DEFAULT 0,
    max_durability INTEGER DEFAULT 100,
    stackable BOOLEAN DEFAULT false,
    max_stack INTEGER DEFAULT 1,
    
    -- Дополнительная информация
    set_name VARCHAR(255),
    set_bonus TEXT,
    requirements_stats JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE character_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    character_id UUID NOT NULL, -- убираем REFERENCES пока
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    
    slot_position INTEGER NOT NULL CHECK (slot_position >= 0 AND slot_position < 48),
    stack_size INTEGER DEFAULT 1 CHECK (stack_size > 0),
    current_durability INTEGER DEFAULT NULL,
    
    -- Модификаторы
    bonus_damage INTEGER DEFAULT 0,
    bonus_defense INTEGER DEFAULT 0,
    bonus_health INTEGER DEFAULT 0,
    bonus_mana INTEGER DEFAULT 0,
    bonus_crit_chance DECIMAL(5,2) DEFAULT 0,
    bonus_crit_damage DECIMAL(5,2) DEFAULT 0,
    bonus_speed DECIMAL(5,2) DEFAULT 0,
    
    -- Улучшения
    enchantments JSONB DEFAULT '[]',
    upgrade_level INTEGER DEFAULT 0 CHECK (upgrade_level >= 0 AND upgrade_level <= 15),
    
    obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(character_id, slot_position)
);

-- ИНДЕКСЫ
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_rarity ON items(rarity);
CREATE INDEX idx_items_level ON items(level_requirement);
CREATE INDEX idx_character_inventory_character_id ON character_inventory(character_id);
CREATE INDEX idx_character_inventory_item_id ON character_inventory(item_id);

-- ТРИГГЕР ОБНОВЛЕНИЯ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ОТКЛЮЧАЕМ RLS (временно)
ALTER TABLE items DISABLE ROW LEVEL SECURITY;
ALTER TABLE character_inventory DISABLE ROW LEVEL SECURITY;

-- УСПЕХ!
SELECT '✅ Таблицы созданы без RLS! Теперь добавляй предметы!' as status;

-- ============================================
-- ДОБАВЛЯЕМ ПРЕДМЕТЫ СРАЗУ
-- ============================================

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
INSERT INTO items (item_key, name, description, rarity, type, subtype, icon, level_requirement, base_mana, base_crit_chance, base_speed, base_value, max_durability) VALUES
('mystic_ring', 'Кольцо мистика', 'Таинственное кольцо пульсирует магической энергией.', 'epic', 'accessory', 'Кольцо', '💍', 15, 100, 12.0, 8.0, 800, NULL),
('amulet_of_power', 'Амулет силы', 'Древний амулет, дарующий своему владельцу невероятную мощь.', 'legendary', 'accessory', 'Амулет', '📿', 20, 80, 15.0, 5.0, 2000, NULL),
('shadow_cloak', 'Плащ теней', 'Мистический плащ делает своего владельца почти невидимым.', 'mythic', 'accessory', 'Плащ', '🦹', 30, 50, 20.0, 25.0, 8000, NULL);

-- РАСХОДНИКИ
INSERT INTO items (item_key, name, description, rarity, type, subtype, icon, level_requirement, base_health, base_mana, base_value, stackable, max_stack) VALUES
('health_potion_small', 'Малое зелье здоровья', 'Простое лечебное зелье красного цвета.', 'common', 'consumable', 'Зелье', '🧪', 1, 50, 0, 15, true, 10),
('health_potion_large', 'Большое зелье лечения', 'Мощное зелье исцеления с приятным мятным вкусом.', 'rare', 'consumable', 'Зелье', '🍶', 10, 150, 0, 75, true, 5),
('mana_potion', 'Зелье маны', 'Светящаяся синяя жидкость восстанавливает магическую энергию.', 'uncommon', 'consumable', 'Зелье', '🧪', 1, 0, 50, 25, true, 8),
('elixir_of_strength', 'Эликсир силы', 'Редкий эликсир временно увеличивает физическую силу.', 'epic', 'consumable', 'Эликсир', '⚗️', 15, 0, 0, 200, true, 3);

-- МАТЕРИАЛЫ
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

SELECT '✅ Предметы добавлены! Система готова!' as final_status;
