-- ============================================
-- СИСТЕМА ИНВЕНТАРЯ ДЛЯ MMORPG
-- ============================================

-- Таблица всех предметов в игре (шаблоны предметов)
CREATE TABLE IF NOT EXISTS items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_key VARCHAR(100) UNIQUE NOT NULL, -- уникальный ключ предмета (например: iron_sword_1)
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rarity VARCHAR(20) CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic')) DEFAULT 'common',
    type VARCHAR(50) CHECK (type IN ('weapon', 'armor', 'accessory', 'consumable', 'material')) NOT NULL,
    subtype VARCHAR(100), -- подтип (например: "Одноручный меч", "Тяжелый доспех")
    icon VARCHAR(10) DEFAULT '📦', -- эмодзи иконка
    level_requirement INTEGER DEFAULT 1,
    class_requirement VARCHAR(50), -- требование по классу
    
    -- Базовые характеристики предмета
    base_damage INTEGER DEFAULT 0,
    base_defense INTEGER DEFAULT 0,
    base_health INTEGER DEFAULT 0,
    base_mana INTEGER DEFAULT 0,
    base_crit_chance DECIMAL(5,2) DEFAULT 0, -- процент крита
    base_crit_damage DECIMAL(5,2) DEFAULT 0, -- урон крита
    base_speed DECIMAL(5,2) DEFAULT 0, -- скорость
    
    -- Системные характеристики
    base_value INTEGER DEFAULT 0, -- базовая стоимость
    max_durability INTEGER DEFAULT 100, -- максимальная прочность
    stackable BOOLEAN DEFAULT false, -- можно ли складывать в стопки
    max_stack INTEGER DEFAULT 1, -- максимальный размер стопки
    
    -- Дополнительная информация
    set_name VARCHAR(255), -- название сета (если предмет из сета)
    set_bonus TEXT, -- бонус сета
    requirements_stats JSONB DEFAULT '{}', -- требования по характеристикам
    
    -- Метаданные
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица инвентарей персонажей (связь персонажей с предметами)
CREATE TABLE IF NOT EXISTS character_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    
    -- Позиция в инвентаре (слот)
    slot_position INTEGER NOT NULL CHECK (slot_position >= 0 AND slot_position < 48),
    
    -- Индивидуальные характеристики конкретного экземпляра предмета
    stack_size INTEGER DEFAULT 1 CHECK (stack_size > 0),
    current_durability INTEGER DEFAULT NULL, -- текущая прочность (NULL = не изнашивается)
    
    -- Случайные модификаторы (для rare+ предметов)
    bonus_damage INTEGER DEFAULT 0,
    bonus_defense INTEGER DEFAULT 0,
    bonus_health INTEGER DEFAULT 0,
    bonus_mana INTEGER DEFAULT 0,
    bonus_crit_chance DECIMAL(5,2) DEFAULT 0,
    bonus_crit_damage DECIMAL(5,2) DEFAULT 0,
    bonus_speed DECIMAL(5,2) DEFAULT 0,
    
    -- Зачарования и улучшения
    enchantments JSONB DEFAULT '[]', -- массив зачарований
    upgrade_level INTEGER DEFAULT 0 CHECK (upgrade_level >= 0 AND upgrade_level <= 15),
    
    -- Время получения
    obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Уникальность: один персонаж не может иметь два предмета в одном слоте
    UNIQUE(character_id, slot_position)
);

-- Создаем индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_items_rarity ON items(rarity);
CREATE INDEX IF NOT EXISTS idx_items_level ON items(level_requirement);
CREATE INDEX IF NOT EXISTS idx_character_inventory_character_id ON character_inventory(character_id);
CREATE INDEX IF NOT EXISTS idx_character_inventory_item_id ON character_inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_character_inventory_slot ON character_inventory(character_id, slot_position);

-- Функция для автообновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автообновления времени изменения
CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) политики
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_inventory ENABLE ROW LEVEL SECURITY;

-- Все могут читать предметы (они общие для всех)
CREATE POLICY "Items are viewable by everyone" ON items FOR SELECT USING (true);

-- Инвентарь персонажа доступен только владельцу
CREATE POLICY "Users can view own inventory" ON character_inventory FOR SELECT 
    USING (character_id IN (
        SELECT id FROM characters WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can manage own inventory" ON character_inventory FOR ALL
    USING (character_id IN (
        SELECT id FROM characters WHERE user_id = auth.uid()
    ));

-- Комментарии к таблицам
COMMENT ON TABLE items IS 'Шаблоны всех предметов в игре';
COMMENT ON TABLE character_inventory IS 'Инвентари персонажей - связывает персонажей с предметами';
COMMENT ON COLUMN character_inventory.slot_position IS 'Позиция предмета в сетке инвентаря (0-47 для сетки 6x8)';
COMMENT ON COLUMN character_inventory.current_durability IS 'Текущая прочность предмета, NULL если не изнашивается';
COMMENT ON COLUMN character_inventory.upgrade_level IS 'Уровень улучшения предмета (0-15)';
