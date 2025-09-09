-- ============================================
-- СХЕМА ДЛЯ СИСТЕМЫ ЭКИПИРОВКИ
-- ============================================

-- Таблица для хранения экипированных предметов персонажа
CREATE TABLE IF NOT EXISTS character_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    slot_type VARCHAR(20) NOT NULL, -- 'weapon', 'helmet', 'armor', 'gloves', 'boots', 'ring1', 'ring2', 'amulet'
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    current_durability INTEGER,
    upgrade_level INTEGER DEFAULT 0,
    bonus_damage INTEGER DEFAULT 0,
    bonus_defense INTEGER DEFAULT 0,
    bonus_health INTEGER DEFAULT 0,
    bonus_mana INTEGER DEFAULT 0,
    bonus_crit_chance DECIMAL(5,2) DEFAULT 0,
    bonus_crit_damage DECIMAL(5,2) DEFAULT 0,
    bonus_speed DECIMAL(5,2) DEFAULT 0,
    equipped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ограничения
    CONSTRAINT valid_slot_type CHECK (slot_type IN (
        'weapon', 'helmet', 'armor', 'gloves', 'boots', 
        'ring1', 'ring2', 'amulet', 'shield'
    )),
    CONSTRAINT valid_durability CHECK (current_durability IS NULL OR current_durability >= 0),
    CONSTRAINT valid_upgrade_level CHECK (upgrade_level >= 0 AND upgrade_level <= 20),
    
    -- Уникальность: один предмет на слот
    UNIQUE(character_id, slot_type)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_character_equipment_character_id ON character_equipment(character_id);
CREATE INDEX IF NOT EXISTS idx_character_equipment_slot_type ON character_equipment(slot_type);
CREATE INDEX IF NOT EXISTS idx_character_equipment_item_id ON character_equipment(item_id);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_character_equipment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_character_equipment_updated_at
    BEFORE UPDATE ON character_equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_character_equipment_updated_at();

-- Добавляем колонку slot_type в таблицу items для определения типа слота экипировки
ALTER TABLE items ADD COLUMN IF NOT EXISTS equipment_slot VARCHAR(20);

-- Обновляем существующие предметы с правильными слотами экипировки
UPDATE items SET equipment_slot = 'weapon' WHERE type = 'weapon';
UPDATE items SET equipment_slot = 'helmet' WHERE type = 'armor' AND subtype = 'helmet';
UPDATE items SET equipment_slot = 'armor' WHERE type = 'armor' AND subtype = 'chest';
UPDATE items SET equipment_slot = 'gloves' WHERE type = 'armor' AND subtype = 'gloves';
UPDATE items SET equipment_slot = 'boots' WHERE type = 'armor' AND subtype = 'boots';
UPDATE items SET equipment_slot = 'shield' WHERE type = 'armor' AND subtype = 'shield';
UPDATE items SET equipment_slot = 'ring1' WHERE type = 'accessory' AND subtype = 'ring';
UPDATE items SET equipment_slot = 'amulet' WHERE type = 'accessory' AND subtype = 'amulet';

-- Добавляем ограничение для equipment_slot
ALTER TABLE items ADD CONSTRAINT valid_equipment_slot 
CHECK (equipment_slot IS NULL OR equipment_slot IN (
    'weapon', 'helmet', 'armor', 'gloves', 'boots', 
    'ring1', 'ring2', 'amulet', 'shield'
));

SELECT '✅ Схема экипировки создана!' as status;
