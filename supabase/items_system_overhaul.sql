-- Система предметов с качеством
-- Создание таблиц для новой системы предметов

-- Таблица категорий предметов
CREATE TABLE IF NOT EXISTS item_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица подкатегорий предметов
CREATE TABLE IF NOT EXISTS item_subcategories (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES item_categories(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category_id, name)
);

-- Таблица грейдов предметов
CREATE TABLE IF NOT EXISTS item_grades (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL, -- hex цвет
    min_stats_multiplier DECIMAL(5,2) NOT NULL DEFAULT 0.50,
    max_stats_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.50,
    base_value_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица предметов (новая)
CREATE TABLE IF NOT EXISTS items_new (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category_id INTEGER REFERENCES item_categories(id) ON DELETE CASCADE,
    subcategory_id INTEGER REFERENCES item_subcategories(id) ON DELETE CASCADE,
    grade_id INTEGER REFERENCES item_grades(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1,
    icon VARCHAR(10) NOT NULL DEFAULT '❓',
    equipment_slot VARCHAR(20),
    stackable BOOLEAN DEFAULT false,
    max_stack_size INTEGER DEFAULT 1,
    base_value INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица статов предметов
CREATE TABLE IF NOT EXISTS item_stats (
    id SERIAL PRIMARY KEY,
    item_id VARCHAR(50) REFERENCES items_new(id) ON DELETE CASCADE,
    stat_name VARCHAR(30) NOT NULL,
    base_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(item_id, stat_name)
);

-- Таблица лута (для дропа с мобов)
CREATE TABLE IF NOT EXISTS item_loot_pools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблица предметов в луте
CREATE TABLE IF NOT EXISTS item_loot_pool_items (
    id SERIAL PRIMARY KEY,
    loot_pool_id INTEGER REFERENCES item_loot_pools(id) ON DELETE CASCADE,
    item_id VARCHAR(50) REFERENCES items_new(id) ON DELETE CASCADE,
    drop_chance DECIMAL(5,2) NOT NULL DEFAULT 1.00, -- процент от 0 до 100
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Функция для расчета актуальных статов предмета на основе качества
CREATE OR REPLACE FUNCTION calculate_item_actual_stats(
    p_item_id VARCHAR(50),
    p_quality DECIMAL(5,2)
) RETURNS JSONB AS $$
DECLARE
    v_grade_multiplier DECIMAL(5,2);
    v_quality_multiplier DECIMAL(5,2);
    v_actual_stats JSONB := '{}';
    v_stat RECORD;
BEGIN
    -- Получаем множитель грейда
    SELECT 
        (ig.min_stats_multiplier + (ig.max_stats_multiplier - ig.min_stats_multiplier) * (p_quality / 100.0))
    INTO v_grade_multiplier
    FROM items_new i
    JOIN item_grades ig ON i.grade_id = ig.id
    WHERE i.id = p_item_id;
    
    -- Рассчитываем актуальные статы
    FOR v_stat IN 
        SELECT stat_name, base_value 
        FROM item_stats 
        WHERE item_id = p_item_id
    LOOP
        v_actual_stats := v_actual_stats || jsonb_build_object(
            v_stat.stat_name, 
            ROUND(v_stat.base_value * v_grade_multiplier, 2)
        );
    END LOOP;
    
    RETURN v_actual_stats;
END;
$$ LANGUAGE plpgsql;

-- Функция для расчета ценности предмета
CREATE OR REPLACE FUNCTION calculate_item_value(
    p_item_id VARCHAR(50),
    p_quality DECIMAL(5,2)
) RETURNS INTEGER AS $$
DECLARE
    v_base_value INTEGER;
    v_grade_multiplier DECIMAL(5,2);
    v_quality_multiplier DECIMAL(5,2);
    v_final_value INTEGER;
BEGIN
    -- Получаем базовую ценность и множитель грейда
    SELECT 
        i.base_value,
        ig.base_value_multiplier
    INTO v_base_value, v_grade_multiplier
    FROM items_new i
    JOIN item_grades ig ON i.grade_id = ig.id
    WHERE i.id = p_item_id;
    
    -- Рассчитываем финальную ценность
    v_quality_multiplier := 0.5 + (p_quality / 100.0) * 1.5; -- от 0.5 до 2.0
    v_final_value := ROUND(v_base_value * v_grade_multiplier * v_quality_multiplier);
    
    RETURN GREATEST(v_final_value, 1); -- минимум 1 золота
END;
$$ LANGUAGE plpgsql;

-- Заполнение базовых данных

-- Категории предметов
INSERT INTO item_categories (id, name, description, icon) VALUES
(1, 'Оружие', 'Различные виды оружия для боя', '⚔️'),
(2, 'Броня', 'Защитное снаряжение', '🛡️'),
(3, 'Аксессуары', 'Кольца, амулеты и другие аксессуары', '💍'),
(4, 'Потребляемые', 'Зелья, еда и другие расходники', '🧪'),
(5, 'Материалы', 'Ресурсы для крафта', '📦'),
(6, 'Особые', 'Уникальные и легендарные предметы', '✨')
;

-- Подкатегории
INSERT INTO item_subcategories (id, category_id, name, description) VALUES
(1, 1, 'Мечи', 'Одноручные и двуручные мечи'),
(2, 1, 'Луки', 'Дальнобойное оружие'),
(3, 1, 'Посохи', 'Магическое оружие'),
(4, 2, 'Шлемы', 'Защита головы'),
(5, 2, 'Доспехи', 'Защита тела'),
(6, 2, 'Поножи', 'Защита ног'),
(7, 2, 'Ботинки', 'Защита стоп'),
(8, 3, 'Кольца', 'Магические кольца'),
(9, 3, 'Амулеты', 'Защитные амулеты'),
(10, 4, 'Зелья', 'Восстанавливающие зелья'),
(11, 5, 'Руда', 'Металлические ресурсы'),
(12, 5, 'Ткань', 'Текстильные ресурсы')
;

-- Грейды предметов
INSERT INTO item_grades (id, name, color, min_stats_multiplier, max_stats_multiplier, base_value_multiplier) VALUES
(1, 'common', '#9CA3AF', 0.50, 1.00, 1.00),
(2, 'uncommon', '#10B981', 0.75, 1.25, 1.50),
(3, 'rare', '#3B82F6', 1.00, 1.50, 2.00),
(4, 'epic', '#8B5CF6', 1.25, 1.75, 3.00),
(5, 'legendary', '#F59E0B', 1.50, 2.00, 5.00)
;

-- Предметы
INSERT INTO items_new (id, name, description, category_id, subcategory_id, grade_id, icon, equipment_slot) VALUES
-- Оружие
('iron_sword', 'Железный меч', 'Простой железный меч', 1, 1, 1, '⚔️', 'main_hand'),
('steel_sword', 'Стальной меч', 'Качественный стальной меч', 1, 1, 2, '⚔️', 'main_hand'),
('mithril_sword', 'Мифриловый меч', 'Редкий мифриловый меч', 1, 1, 3, '⚔️', 'main_hand'),
('dragon_sword', 'Драконий меч', 'Легендарный меч из драконьей стали', 1, 1, 5, '⚔️', 'main_hand'),
('wooden_bow', 'Деревянный лук', 'Простой деревянный лук', 1, 2, 1, '🏹', 'main_hand'),
('steel_bow', 'Стальной лук', 'Мощный стальной лук', 1, 2, 2, '🏹', 'main_hand'),
('elf_bow', 'Эльфийский лук', 'Элегантный эльфийский лук', 1, 2, 3, '🏹', 'main_hand'),
('novice_staff', 'Посох новичка', 'Простой магический посох', 1, 3, 1, '🪄', 'main_hand'),
('mage_staff', 'Посох мага', 'Мощный магический посох', 1, 3, 2, '🪄', 'main_hand'),
('archmage_staff', 'Посох архимага', 'Легендарный посох архимага', 1, 3, 4, '🪄', 'main_hand'),

-- Броня
('leather_helmet', 'Кожаный шлем', 'Простой кожаный шлем', 2, 4, 1, '⛑️', 'head'),
('iron_helmet', 'Железный шлем', 'Надежный железный шлем', 2, 4, 2, '⛑️', 'head'),
('mithril_helmet', 'Мифриловый шлем', 'Редкий мифриловый шлем', 2, 4, 3, '⛑️', 'head'),
('leather_armor', 'Кожаная броня', 'Простая кожаная броня', 2, 5, 1, '🦺', 'chest'),
('iron_armor', 'Железная броня', 'Надежная железная броня', 2, 5, 2, '🦺', 'chest'),
('mithril_armor', 'Мифриловая броня', 'Редкая мифриловая броня', 2, 5, 3, '🦺', 'chest'),
('leather_pants', 'Кожаные поножи', 'Простые кожаные поножи', 2, 6, 1, '👖', 'legs'),
('iron_pants', 'Железные поножи', 'Надежные железные поножи', 2, 6, 2, '👖', 'legs'),
('mithril_pants', 'Мифриловые поножи', 'Редкие мифриловые поножи', 2, 6, 3, '👖', 'legs'),
('leather_boots', 'Кожаные ботинки', 'Простые кожаные ботинки', 2, 7, 1, '👢', 'feet'),
('iron_boots', 'Железные ботинки', 'Надежные железные ботинки', 2, 7, 2, '👢', 'feet'),
('mithril_boots', 'Мифриловые ботинки', 'Редкие мифриловые ботинки', 2, 7, 3, '👢', 'feet'),

-- Аксессуары
('copper_ring', 'Медное кольцо', 'Простое медное кольцо', 3, 8, 1, '💍', 'ring_1'),
('silver_ring', 'Серебряное кольцо', 'Качественное серебряное кольцо', 3, 8, 2, '💍', 'ring_1'),
('gold_ring', 'Золотое кольцо', 'Редкое золотое кольцо', 3, 8, 3, '💍', 'ring_1'),
('wooden_amulet', 'Деревянный амулет', 'Простой деревянный амулет', 3, 9, 1, '🔮', 'necklace'),
('silver_amulet', 'Серебряный амулет', 'Качественный серебряный амулет', 3, 9, 2, '🔮', 'necklace'),
('gold_amulet', 'Золотой амулет', 'Редкий золотой амулет', 3, 9, 3, '🔮', 'necklace'),

-- Потребляемые
('health_potion', 'Зелье лечения', 'Восстанавливает здоровье', 4, 10, 1, '🧪', null),
('mana_potion', 'Зелье маны', 'Восстанавливает ману', 4, 10, 1, '🧪', null),
('greater_health_potion', 'Большое зелье лечения', 'Сильно восстанавливает здоровье', 4, 10, 2, '🧪', null),
('greater_mana_potion', 'Большое зелье маны', 'Сильно восстанавливает ману', 4, 10, 2, '🧪', null),

-- Материалы
('iron_ore', 'Железная руда', 'Базовая металлическая руда', 5, 11, 1, '⛏️', null),
('steel_ore', 'Стальная руда', 'Качественная металлическая руда', 5, 11, 2, '⛏️', null),
('mithril_ore', 'Мифриловая руда', 'Редкая металлическая руда', 5, 11, 3, '⛏️', null),
('cotton_cloth', 'Хлопковая ткань', 'Базовая текстильная ткань', 5, 12, 1, '🧵', null),
('silk_cloth', 'Шелковая ткань', 'Качественная текстильная ткань', 5, 12, 2, '🧵', null),
('mithril_cloth', 'Мифриловая ткань', 'Редкая текстильная ткань', 5, 12, 3, '🧵', null)
ON CONFLICT (id) DO NOTHING;

-- Статы предметов
INSERT INTO item_stats (item_id, stat_name, base_value) VALUES
-- Оружие - статы
('iron_sword', 'attack_damage', 15), ('iron_sword', 'critical_chance', 2),
('steel_sword', 'attack_damage', 25), ('steel_sword', 'critical_chance', 3),
('mithril_sword', 'attack_damage', 40), ('mithril_sword', 'critical_chance', 5), ('mithril_sword', 'critical_multiplier', 10),
('dragon_sword', 'attack_damage', 80), ('dragon_sword', 'critical_chance', 8), ('dragon_sword', 'critical_multiplier', 20), ('dragon_sword', 'strength', 5),
('wooden_bow', 'attack_damage', 12), ('wooden_bow', 'agility', 3),
('steel_bow', 'attack_damage', 22), ('steel_bow', 'agility', 5),
('elf_bow', 'attack_damage', 35), ('elf_bow', 'agility', 8), ('elf_bow', 'critical_chance', 4),
('novice_staff', 'attack_damage', 10), ('novice_staff', 'intelligence', 4), ('novice_staff', 'mana', 20),
('mage_staff', 'attack_damage', 18), ('mage_staff', 'intelligence', 7), ('mage_staff', 'mana', 40),
('archmage_staff', 'attack_damage', 45), ('archmage_staff', 'intelligence', 15), ('archmage_staff', 'mana', 100), ('archmage_staff', 'mana_regen', 2),

-- Броня - статы
('leather_helmet', 'defense', 5), ('leather_helmet', 'health', 10),
('iron_helmet', 'defense', 12), ('iron_helmet', 'health', 25),
('mithril_helmet', 'defense', 25), ('mithril_helmet', 'health', 50), ('mithril_helmet', 'vitality', 3),
('leather_armor', 'defense', 8), ('leather_armor', 'health', 20),
('iron_armor', 'defense', 18), ('iron_armor', 'health', 45),
('mithril_armor', 'defense', 35), ('mithril_armor', 'health', 80), ('mithril_armor', 'vitality', 5),
('leather_pants', 'defense', 6), ('leather_pants', 'health', 15),
('iron_pants', 'defense', 14), ('iron_pants', 'health', 35),
('mithril_pants', 'defense', 28), ('mithril_pants', 'health', 65), ('mithril_pants', 'vitality', 4),
('leather_boots', 'defense', 4), ('leather_boots', 'agility', 2),
('iron_boots', 'defense', 10), ('iron_boots', 'agility', 4),
('mithril_boots', 'defense', 20), ('mithril_boots', 'agility', 7), ('mithril_boots', 'movement_speed', 5),

-- Аксессуары - статы
('copper_ring', 'strength', 2), ('copper_ring', 'health', 5),
('silver_ring', 'strength', 4), ('silver_ring', 'health', 15), ('silver_ring', 'critical_chance', 1),
('gold_ring', 'strength', 8), ('gold_ring', 'health', 30), ('gold_ring', 'critical_chance', 2), ('gold_ring', 'critical_multiplier', 5),
('wooden_amulet', 'intelligence', 3), ('wooden_amulet', 'mana', 10),
('silver_amulet', 'intelligence', 6), ('silver_amulet', 'mana', 25), ('silver_amulet', 'mana_regen', 1),
('gold_amulet', 'intelligence', 12), ('gold_amulet', 'mana', 50), ('gold_amulet', 'mana_regen', 2), ('gold_amulet', 'spell_power', 10)
ON CONFLICT (item_id, stat_name) DO NOTHING;

-- Триггеры для автоматического расчета статов и ценности
CREATE OR REPLACE FUNCTION update_item_actual_stats_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actual_stats := calculate_item_actual_stats(NEW.item_id, NEW.quality);
    NEW.value := calculate_item_value(NEW.item_id, NEW.quality);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_item_actual_stats_on_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.quality != NEW.quality THEN
        NEW.actual_stats := calculate_item_actual_stats(NEW.item_id, NEW.quality);
        NEW.value := calculate_item_value(NEW.item_id, NEW.quality);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание триггеров (если таблица character_inventory существует)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'character_inventory') THEN
        -- Добавляем колонки если их нет
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'character_inventory' AND column_name = 'quality') THEN
            ALTER TABLE character_inventory ADD COLUMN quality DECIMAL(5,2) DEFAULT 50.00;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'character_inventory' AND column_name = 'actual_stats') THEN
            ALTER TABLE character_inventory ADD COLUMN actual_stats JSONB;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'character_inventory' AND column_name = 'value') THEN
            ALTER TABLE character_inventory ADD COLUMN value INTEGER;
        END IF;
        
        -- Создаем триггеры
        DROP TRIGGER IF EXISTS trigger_update_item_stats_insert ON character_inventory;
        CREATE TRIGGER trigger_update_item_stats_insert
            BEFORE INSERT ON character_inventory
            FOR EACH ROW
            EXECUTE FUNCTION update_item_actual_stats_on_insert();
            
        DROP TRIGGER IF EXISTS trigger_update_item_stats_update ON character_inventory;
        CREATE TRIGGER trigger_update_item_stats_update
            BEFORE UPDATE ON character_inventory
            FOR EACH ROW
            EXECUTE FUNCTION update_item_actual_stats_on_update();
    END IF;
END $$;
