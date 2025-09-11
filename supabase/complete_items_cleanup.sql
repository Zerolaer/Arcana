-- ПОЛНАЯ ОЧИСТКА И ПЕРЕСОЗДАНИЕ ТАБЛИЦЫ ITEMS
-- Удаляем все предметы и пересоздаем таблицу с новой схемой

-- 1. Удаляем все связанные таблицы и данные
DROP TABLE IF EXISTS character_inventory CASCADE;
DROP TABLE IF EXISTS character_equipment CASCADE;
DROP TABLE IF EXISTS loot_drops CASCADE;
DROP TABLE IF EXISTS items CASCADE;

-- 2. Создаем новую таблицу items с 10 новыми статами
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
    
    -- NEW 10 STATS SYSTEM
    agility_bonus INTEGER DEFAULT 0,
    precision_bonus INTEGER DEFAULT 0,
    evasion_bonus INTEGER DEFAULT 0,
    intelligence_bonus INTEGER DEFAULT 0,
    spell_power_bonus INTEGER DEFAULT 0,
    resistance_bonus INTEGER DEFAULT 0,
    strength_bonus INTEGER DEFAULT 0,
    endurance_bonus INTEGER DEFAULT 0,
    armor_bonus INTEGER DEFAULT 0,
    stealth_bonus INTEGER DEFAULT 0,
    
    -- Derived stats
    attack_damage INTEGER DEFAULT 0,
    defense INTEGER DEFAULT 0,
    health INTEGER DEFAULT 0,
    mana INTEGER DEFAULT 0,
    magic_damage INTEGER DEFAULT 0,
    magic_resistance INTEGER DEFAULT 0,
    critical_chance DECIMAL(5,2) DEFAULT 0,
    critical_damage DECIMAL(5,2) DEFAULT 0,
    attack_speed DECIMAL(5,2) DEFAULT 0,
    accuracy INTEGER DEFAULT 0,
    health_regen INTEGER DEFAULT 0,
    mana_regen INTEGER DEFAULT 0,
    
    -- System stats
    base_value INTEGER DEFAULT 0,
    max_durability INTEGER DEFAULT 100,
    stackable BOOLEAN DEFAULT false,
    max_stack INTEGER DEFAULT 1,
    
    -- Additional info
    set_name VARCHAR(255),
    set_bonus TEXT,
    requirements_stats JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Восстанавливаем связанные таблицы
CREATE TABLE character_inventory (
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    slot_position INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (character_id, item_id, slot_position)
);

CREATE TABLE character_equipment (
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    slot VARCHAR(50) NOT NULL,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    equipped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (character_id, slot)
);

CREATE TABLE loot_drops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    loot_table_id UUID REFERENCES loot_tables(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    drop_rate DECIMAL(5,2) DEFAULT 0,
    quantity_min INTEGER DEFAULT 1,
    quantity_max INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Создаем индексы
CREATE INDEX idx_items_type ON items(type);
CREATE INDEX idx_items_rarity ON items(rarity);
CREATE INDEX idx_items_level ON items(level_requirement);
CREATE INDEX idx_items_item_key ON items(item_key);

-- 5. Проверяем что таблица пустая
SELECT COUNT(*) as remaining_items FROM items;
