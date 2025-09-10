-- ===============================================
-- ПОЛНОЕ ОБНОВЛЕНИЕ СИСТЕМЫ ПРЕДМЕТОВ
-- ===============================================

-- Сначала создадим новые таблицы для упорядоченной системы предметов

-- 1. КАТЕГОРИИ ПРЕДМЕТОВ
DROP TABLE IF EXISTS item_categories CASCADE;
CREATE TABLE item_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10) DEFAULT '📦',
    sort_order INTEGER DEFAULT 0
);

-- 2. ПОДКАТЕГОРИИ ПРЕДМЕТОВ
DROP TABLE IF EXISTS item_subcategories CASCADE;
CREATE TABLE item_subcategories (
    id VARCHAR(50) PRIMARY KEY,
    category_id VARCHAR(50) REFERENCES item_categories(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10) DEFAULT '📦',
    sort_order INTEGER DEFAULT 0
);

-- 3. ГРЕЙДЫ ПРЕДМЕТОВ
DROP TABLE IF EXISTS item_grades CASCADE;
CREATE TABLE item_grades (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) NOT NULL, -- CSS цвет для отображения
    min_stats_multiplier DECIMAL(5,2) DEFAULT 1.00, -- минимальный множитель статов
    max_stats_multiplier DECIMAL(5,2) DEFAULT 1.50, -- максимальный множитель статов
    base_value_multiplier DECIMAL(5,2) DEFAULT 1.00, -- множитель базовой стоимости
    sort_order INTEGER DEFAULT 0
);

-- 4. ОБНОВЛЕННАЯ ТАБЛИЦА ПРЕДМЕТОВ
DROP TABLE IF EXISTS items_new CASCADE;
CREATE TABLE items_new (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category_id VARCHAR(50) REFERENCES item_categories(id),
    subcategory_id VARCHAR(50) REFERENCES item_subcategories(id),
    grade_id VARCHAR(50) REFERENCES item_grades(id),
    
    -- Тип предмета (для экипировки)
    equipment_slot VARCHAR(20), -- 'weapon', 'armor', 'helmet', 'boots', etc.
    
    -- Базовые характеристики
    base_attack INTEGER DEFAULT 0,
    base_defense INTEGER DEFAULT 0,
    base_health INTEGER DEFAULT 0,
    base_mana INTEGER DEFAULT 0,
    base_strength INTEGER DEFAULT 0,
    base_dexterity INTEGER DEFAULT 0,
    base_intelligence INTEGER DEFAULT 0,
    base_vitality INTEGER DEFAULT 0,
    
    -- Экономические характеристики
    base_value INTEGER NOT NULL DEFAULT 1, -- базовая стоимость
    stack_size INTEGER DEFAULT 1, -- максимальный размер стака
    
    -- Визуальные характеристики
    icon VARCHAR(10) DEFAULT '📦',
    image VARCHAR(100),
    
    -- Системные поля
    is_tradeable BOOLEAN DEFAULT true,
    is_consumable BOOLEAN DEFAULT false,
    is_equipment BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. ЭКЗЕМПЛЯРЫ ПРЕДМЕТОВ В ИНВЕНТАРЕ (с качеством)
DROP TABLE IF EXISTS character_inventory_new CASCADE;
CREATE TABLE character_inventory_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    item_id VARCHAR(50) REFERENCES items_new(id),
    slot_position INTEGER NOT NULL,
    stack_size INTEGER DEFAULT 1,
    
    -- СИСТЕМА КАЧЕСТВА (вместо прочности)
    quality INTEGER NOT NULL DEFAULT 50 CHECK (quality >= 1 AND quality <= 100),
    
    -- Рассчитанные статы (на основе базовых статов + качество + грейд)
    actual_attack INTEGER DEFAULT 0,
    actual_defense INTEGER DEFAULT 0,
    actual_health INTEGER DEFAULT 0,
    actual_mana INTEGER DEFAULT 0,
    actual_strength INTEGER DEFAULT 0,
    actual_dexterity INTEGER DEFAULT 0,
    actual_intelligence INTEGER DEFAULT 0,
    actual_vitality INTEGER DEFAULT 0,
    
    -- Рассчитанная стоимость
    actual_value INTEGER DEFAULT 1,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(character_id, slot_position)
);

-- 6. ЭКИПИРОВАННЫЕ ПРЕДМЕТЫ (с качеством)
DROP TABLE IF EXISTS character_equipment_new CASCADE;
CREATE TABLE character_equipment_new (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    item_id VARCHAR(50) REFERENCES items_new(id),
    slot_type VARCHAR(20) NOT NULL,
    
    -- СИСТЕМА КАЧЕСТВА
    quality INTEGER NOT NULL DEFAULT 50 CHECK (quality >= 1 AND quality <= 100),
    
    -- Рассчитанные статы
    actual_attack INTEGER DEFAULT 0,
    actual_defense INTEGER DEFAULT 0,
    actual_health INTEGER DEFAULT 0,
    actual_mana INTEGER DEFAULT 0,
    actual_strength INTEGER DEFAULT 0,
    actual_dexterity INTEGER DEFAULT 0,
    actual_intelligence INTEGER DEFAULT 0,
    actual_vitality INTEGER DEFAULT 0,
    
    equipped_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(character_id, slot_type)
);

-- ===============================================
-- ЗАПОЛНЕНИЕ СПРАВОЧНЫХ ДАННЫХ
-- ===============================================

-- КАТЕГОРИИ
INSERT INTO item_categories (id, name, description, icon, sort_order) VALUES
('weapons', 'Оружие', 'Мечи, топоры, луки и другое оружие', '⚔️', 1),
('armor', 'Броня', 'Доспехи, шлемы, щиты', '🛡️', 2),
('accessories', 'Аксессуары', 'Кольца, амулеты, серьги', '💍', 3),
('consumables', 'Расходники', 'Зелья, свитки, еда', '🧪', 4),
('materials', 'Материалы', 'Руды, ткани, компоненты для крафта', '⚒️', 5),
('quest_items', 'Квестовые предметы', 'Особые предметы для заданий', '📜', 6),
('misc', 'Разное', 'Прочие предметы', '📦', 7);

-- ПОДКАТЕГОРИИ
INSERT INTO item_subcategories (id, category_id, name, description, icon, sort_order) VALUES
-- Оружие
('swords', 'weapons', 'Мечи', 'Одноручные и двуручные мечи', '⚔️', 1),
('axes', 'weapons', 'Топоры', 'Боевые топоры', '🪓', 2),
('bows', 'weapons', 'Луки', 'Дальнобойное оружие', '🏹', 3),
('staves', 'weapons', 'Посохи', 'Магическое оружие', '🪄', 4),
('daggers', 'weapons', 'Кинжалы', 'Быстрое оружие', '🗡️', 5),

-- Броня
('heavy_armor', 'armor', 'Тяжелая броня', 'Пластинчатые доспехи', '🛡️', 1),
('medium_armor', 'armor', 'Средняя броня', 'Кольчуги и кожаная броня', '🦺', 2),
('light_armor', 'armor', 'Легкая броня', 'Тканевая и легкая кожаная броня', '👕', 3),
('helmets', 'armor', 'Шлемы', 'Защита головы', '🪖', 4),
('shields', 'armor', 'Щиты', 'Защитное снаряжение', '🛡️', 5),
('boots', 'armor', 'Обувь', 'Ботинки и сапоги', '👢', 6),
('gloves', 'armor', 'Перчатки', 'Защита рук', '🧤', 7),

-- Аксессуары
('rings', 'accessories', 'Кольца', 'Магические кольца', '💍', 1),
('amulets', 'accessories', 'Амулеты', 'Защитные амулеты', '📿', 2),
('earrings', 'accessories', 'Серьги', 'Украшения', '💎', 3),

-- Расходники
('health_potions', 'consumables', 'Зелья здоровья', 'Восстанавливают HP', '❤️', 1),
('mana_potions', 'consumables', 'Зелья маны', 'Восстанавливают MP', '💙', 2),
('buff_potions', 'consumables', 'Зелья усиления', 'Временные бафы', '🟢', 3),
('food', 'consumables', 'Еда', 'Пища для восстановления', '🍖', 4),
('scrolls', 'consumables', 'Свитки', 'Магические свитки', '📜', 5),

-- Материалы
('ores', 'materials', 'Руды', 'Металлические руды', '⛏️', 1),
('gems', 'materials', 'Самоцветы', 'Драгоценные камни', '💎', 2),
('fabrics', 'materials', 'Ткани', 'Материалы для одежды', '🧵', 3),
('leather', 'materials', 'Кожа', 'Кожаные материалы', '🦌', 4),
('herbs', 'materials', 'Травы', 'Алхимические компоненты', '🌿', 5);

-- ГРЕЙДЫ
INSERT INTO item_grades (id, name, color, min_stats_multiplier, max_stats_multiplier, base_value_multiplier, sort_order) VALUES
('common', 'Обычный', '#9CA3AF', 0.80, 1.00, 1.00, 1),      -- Серый
('uncommon', 'Необычный', '#10B981', 0.90, 1.20, 1.50, 2),   -- Зеленый
('rare', 'Редкий', '#3B82F6', 1.00, 1.40, 2.50, 3),         -- Синий
('epic', 'Эпический', '#8B5CF6', 1.20, 1.70, 4.00, 4),      -- Фиолетовый
('legendary', 'Легендарный', '#F59E0B', 1.50, 2.00, 6.00, 5), -- Оранжевый
('mythic', 'Мифический', '#EF4444', 1.80, 2.50, 10.00, 6);   -- Красный

-- ===============================================
-- ПРЕДМЕТЫ ПО КАТЕГОРИЯМ
-- ===============================================

-- ОРУЖИЕ - МЕЧИ
INSERT INTO items_new (id, name, description, category_id, subcategory_id, grade_id, equipment_slot, base_attack, base_defense, base_strength, base_value, is_equipment, icon, image) VALUES
('rusty_sword', 'Ржавый меч', 'Старый меч, покрытый ржавчиной', 'weapons', 'swords', 'common', 'weapon', 15, 0, 5, 50, true, '⚔️', 'rusty_sword.png'),
('iron_sword', 'Железный меч', 'Надежный железный клинок', 'weapons', 'swords', 'uncommon', 'weapon', 25, 0, 8, 150, true, '⚔️', 'iron_sword.png'),
('steel_sword', 'Стальной меч', 'Качественный стальной меч', 'weapons', 'swords', 'rare', 'weapon', 40, 0, 12, 400, true, '⚔️', 'steel_sword.png'),
('enchanted_blade', 'Зачарованный клинок', 'Меч с магическими свойствами', 'weapons', 'swords', 'epic', 'weapon', 60, 5, 18, 1000, true, '⚔️', 'enchanted_blade.png'),
('dragonslayer', 'Драконобой', 'Легендарный меч драконоборцев', 'weapons', 'swords', 'legendary', 'weapon', 90, 10, 25, 5000, true, '⚔️', 'dragonslayer.png'),

-- ОРУЖИЕ - ТОПОРЫ
('wood_axe', 'Деревянный топор', 'Простой топор дровосека', 'weapons', 'axes', 'common', 'weapon', 18, 0, 8, 60, true, '🪓', 'wood_axe.png'),
('battle_axe', 'Боевой топор', 'Тяжелый боевой топор', 'weapons', 'axes', 'uncommon', 'weapon', 35, 0, 15, 200, true, '🪓', 'battle_axe.png'),
('giant_cleaver', 'Гигантский секач', 'Огромный двуручный топор', 'weapons', 'axes', 'rare', 'weapon', 55, 0, 20, 600, true, '🪓', 'giant_cleaver.png'),

-- ОРУЖИЕ - ЛУКИ
('hunting_bow', 'Охотничий лук', 'Простой лук для охоты', 'weapons', 'bows', 'common', 'weapon', 20, 0, 0, 80, true, '🏹', 'hunting_bow.png'),
('elven_bow', 'Эльфийский лук', 'Изящный эльфийский лук', 'weapons', 'bows', 'rare', 'weapon', 45, 0, 5, 500, true, '🏹', 'elven_bow.png'),

-- ОРУЖИЕ - ПОСОХИ
('wooden_staff', 'Деревянный посох', 'Простой магический посох', 'weapons', 'staves', 'common', 'weapon', 12, 0, 0, 70, true, '🪄', 'wooden_staff.png'),
('crystal_staff', 'Кристальный посох', 'Посох с магическим кристаллом', 'weapons', 'staves', 'epic', 'weapon', 30, 5, 0, 1200, true, '🪄', 'crystal_staff.png'),

-- БРОНЯ - ТЯЖЕЛАЯ
('leather_armor', 'Кожаная броня', 'Простая кожаная защита', 'armor', 'medium_armor', 'common', 'armor', 0, 20, 0, 100, true, '🦺', 'leather_armor.png'),
('chainmail', 'Кольчуга', 'Кольчужная броня', 'armor', 'heavy_armor', 'uncommon', 'armor', 0, 35, 5, 300, true, '🛡️', 'chainmail.png'),
('plate_armor', 'Пластинчатая броня', 'Тяжелая пластинчатая защита', 'armor', 'heavy_armor', 'rare', 'armor', 0, 60, 10, 800, true, '🛡️', 'plate_armor.png'),
('dragon_scale_armor', 'Броня из драконьей чешуи', 'Легендарная защита из чешуи дракона', 'armor', 'heavy_armor', 'legendary', 'armor', 0, 100, 20, 8000, true, '🛡️', 'dragon_scale_armor.png'),

-- БРОНЯ - ШЛЕМЫ
('leather_cap', 'Кожаная шапка', 'Простая кожаная защита головы', 'armor', 'helmets', 'common', 'helmet', 0, 8, 0, 40, true, '🪖', 'leather_cap.png'),
('iron_helmet', 'Железный шлем', 'Надежная защита головы', 'armor', 'helmets', 'uncommon', 'helmet', 0, 15, 3, 120, true, '🪖', 'iron_helmet.png'),
('steel_helm', 'Стальной шлем', 'Качественный боевой шлем', 'armor', 'helmets', 'rare', 'helmet', 0, 25, 5, 350, true, '🪖', 'steel_helm.png'),

-- БРОНЯ - ЩИТЫ
('wooden_shield', 'Деревянный щит', 'Простой деревянный щит', 'armor', 'shields', 'common', 'shield', 0, 12, 3, 50, true, '🛡️', 'wooden_shield.png'),
('iron_shield', 'Железный щит', 'Крепкий железный щит', 'armor', 'shields', 'uncommon', 'shield', 0, 22, 6, 180, true, '🛡️', 'iron_shield.png'),
('tower_shield', 'Башенный щит', 'Массивный защитный щит', 'armor', 'shields', 'rare', 'shield', 0, 40, 12, 500, true, '🛡️', 'tower_shield.png'),

-- БРОНЯ - ОБУВЬ
('leather_boots', 'Кожаные ботинки', 'Простая кожаная обувь', 'armor', 'boots', 'common', 'boots', 0, 6, 0, 30, true, '👢', 'leather_boots.png'),
('iron_boots', 'Железные сапоги', 'Тяжелые металлические сапоги', 'armor', 'boots', 'uncommon', 'boots', 0, 12, 4, 100, true, '👢', 'iron_boots.png'),
('speed_boots', 'Сапоги скорости', 'Магические сапоги, увеличивающие скорость', 'armor', 'boots', 'epic', 'boots', 0, 18, 0, 1500, true, '👢', 'speed_boots.png'),

-- БРОНЯ - ПЕРЧАТКИ
('leather_gloves', 'Кожаные перчатки', 'Простые кожаные перчатки', 'armor', 'gloves', 'common', 'gloves', 0, 4, 2, 25, true, '🧤', 'leather_gloves.png'),
('iron_gauntlets', 'Железные перчатки', 'Тяжелые боевые перчатки', 'armor', 'gloves', 'uncommon', 'gloves', 0, 8, 4, 80, true, '🧤', 'iron_gauntlets.png'),

-- АКСЕССУАРЫ - КОЛЬЦА
('copper_ring', 'Медное кольцо', 'Простое медное кольцо', 'accessories', 'rings', 'common', 'ring1', 0, 0, 3, 40, true, '💍', 'copper_ring.png'),
('silver_ring', 'Серебряное кольцо', 'Изящное серебряное кольцо', 'accessories', 'rings', 'uncommon', 'ring1', 0, 0, 6, 150, true, '💍', 'silver_ring.png'),
('gold_ring', 'Золотое кольцо', 'Дорогое золотое кольцо', 'accessories', 'rings', 'rare', 'ring1', 0, 0, 10, 400, true, '💍', 'gold_ring.png'),
('ring_of_power', 'Кольцо силы', 'Магическое кольцо, увеличивающее силу', 'accessories', 'rings', 'epic', 'ring1', 5, 0, 15, 2000, true, '💍', 'ring_of_power.png'),

-- АКСЕССУАРЫ - АМУЛЕТЫ
('wooden_amulet', 'Деревянный амулет', 'Простой защитный амулет', 'accessories', 'amulets', 'common', 'amulet', 0, 5, 0, 60, true, '📿', 'wooden_amulet.png'),
('crystal_pendant', 'Кристальный кулон', 'Магический кристальный амулет', 'accessories', 'amulets', 'rare', 'amulet', 0, 15, 8, 600, true, '📿', 'crystal_pendant.png'),
('phoenix_amulet', 'Амулет феникса', 'Легендарный амулет с силой феникса', 'accessories', 'amulets', 'legendary', 'amulet', 10, 25, 20, 10000, true, '📿', 'phoenix_amulet.png'),

-- РАСХОДНИКИ - ЗЕЛЬЯ ЗДОРОВЬЯ
('small_health_potion', 'Малое зелье здоровья', 'Восстанавливает 50 HP', 'consumables', 'health_potions', 'common', null, 0, 0, 0, 20, false, '❤️', 'small_health_potion.png'),
('health_potion', 'Зелье здоровья', 'Восстанавливает 150 HP', 'consumables', 'health_potions', 'uncommon', null, 0, 0, 0, 60, false, '❤️', 'health_potion.png'),
('greater_health_potion', 'Большое зелье здоровья', 'Восстанавливает 400 HP', 'consumables', 'health_potions', 'rare', null, 0, 0, 0, 180, false, '❤️', 'greater_health_potion.png'),

-- РАСХОДНИКИ - ЗЕЛЬЯ МАНЫ
('small_mana_potion', 'Малое зелье маны', 'Восстанавливает 30 MP', 'consumables', 'mana_potions', 'common', null, 0, 0, 0, 25, false, '💙', 'small_mana_potion.png'),
('mana_potion', 'Зелье маны', 'Восстанавливает 100 MP', 'consumables', 'mana_potions', 'uncommon', null, 0, 0, 0, 75, false, '💙', 'mana_potion.png'),

-- РАСХОДНИКИ - ЗЕЛЬЯ УСИЛЕНИЯ
('strength_potion', 'Зелье силы', 'Временно увеличивает силу на 30 минут', 'consumables', 'buff_potions', 'uncommon', null, 0, 0, 0, 100, false, '🟢', 'strength_potion.png'),
('defense_potion', 'Зелье защиты', 'Временно увеличивает защиту на 30 минут', 'consumables', 'buff_potions', 'uncommon', null, 0, 0, 0, 100, false, '🟢', 'defense_potion.png'),

-- МАТЕРИАЛЫ - РУДЫ
('copper_ore', 'Медная руда', 'Базовая металлическая руда', 'materials', 'ores', 'common', null, 0, 0, 0, 10, false, '⛏️', 'copper_ore.png'),
('iron_ore', 'Железная руда', 'Прочная железная руда', 'materials', 'ores', 'uncommon', null, 0, 0, 0, 25, false, '⛏️', 'iron_ore.png'),
('steel_ore', 'Стальная руда', 'Редкая стальная руда', 'materials', 'ores', 'rare', null, 0, 0, 0, 60, false, '⛏️', 'steel_ore.png'),
('mithril_ore', 'Мифриловая руда', 'Легендарная мифриловая руда', 'materials', 'ores', 'legendary', null, 0, 0, 0, 500, false, '⛏️', 'mithril_ore.png'),

-- МАТЕРИАЛЫ - САМОЦВЕТЫ
('rough_ruby', 'Необработанный рубин', 'Красный драгоценный камень', 'materials', 'gems', 'rare', null, 0, 0, 0, 200, false, '💎', 'rough_ruby.png'),
('sapphire', 'Сапфир', 'Синий драгоценный камень', 'materials', 'gems', 'epic', null, 0, 0, 0, 800, false, '💎', 'sapphire.png'),
('diamond', 'Алмаз', 'Самый твердый драгоценный камень', 'materials', 'gems', 'legendary', null, 0, 0, 0, 2000, false, '💎', 'diamond.png'),

-- МАТЕРИАЛЫ - ТКАНИ
('cotton_fabric', 'Хлопковая ткань', 'Простая ткань для одежды', 'materials', 'fabrics', 'common', null, 0, 0, 0, 5, false, '🧵', 'cotton_fabric.png'),
('silk_fabric', 'Шелковая ткань', 'Дорогая шелковая ткань', 'materials', 'fabrics', 'uncommon', null, 0, 0, 0, 20, false, '🧵', 'silk_fabric.png'),
('enchanted_silk', 'Зачарованный шелк', 'Магическая ткань с особыми свойствами', 'materials', 'fabrics', 'epic', null, 0, 0, 0, 300, false, '🧵', 'enchanted_silk.png'),

-- МАТЕРИАЛЫ - КОЖА
('wolf_pelt', 'Волчья шкура', 'Шкура убитого волка', 'materials', 'leather', 'common', null, 0, 0, 0, 15, false, '🦌', 'wolf_pelt.png'),
('bear_hide', 'Медвежья шкура', 'Толстая шкура медведя', 'materials', 'leather', 'uncommon', null, 0, 0, 0, 40, false, '🦌', 'bear_hide.png'),
('dragon_leather', 'Драконья кожа', 'Редкая кожа дракона', 'materials', 'leather', 'legendary', null, 0, 0, 0, 1000, false, '🦌', 'dragon_leather.png'),

-- МАТЕРИАЛЫ - ТРАВЫ
('healing_herb', 'Лечебная трава', 'Основа для зелий лечения', 'materials', 'herbs', 'common', null, 0, 0, 0, 8, false, '🌿', 'healing_herb.png'),
('mana_flower', 'Цветок маны', 'Редкий цветок для зелий маны', 'materials', 'herbs', 'uncommon', null, 0, 0, 0, 25, false, '🌿', 'mana_flower.png'),
('phoenix_feather', 'Перо феникса', 'Мифическое перо для мощных зелий', 'materials', 'herbs', 'mythic', null, 0, 0, 0, 5000, false, '🌿', 'phoenix_feather.png');

-- ===============================================
-- ФУНКЦИИ ДЛЯ РАБОТЫ С КАЧЕСТВОМ И СТАТАМИ
-- ===============================================

-- Функция расчета актуальных статов на основе качества и грейда
CREATE OR REPLACE FUNCTION calculate_item_stats(
    p_base_attack INTEGER,
    p_base_defense INTEGER,
    p_base_health INTEGER,
    p_base_mana INTEGER,
    p_base_strength INTEGER,
    p_base_dexterity INTEGER,
    p_base_intelligence INTEGER,
    p_base_vitality INTEGER,
    p_quality INTEGER,
    p_grade_id VARCHAR(50)
) RETURNS TABLE(
    actual_attack INTEGER,
    actual_defense INTEGER,
    actual_health INTEGER,
    actual_mana INTEGER,
    actual_strength INTEGER,
    actual_dexterity INTEGER,
    actual_intelligence INTEGER,
    actual_vitality INTEGER
) AS $$
DECLARE
    quality_multiplier DECIMAL(5,2);
    grade_min_mult DECIMAL(5,2);
    grade_max_mult DECIMAL(5,2);
    final_multiplier DECIMAL(5,2);
BEGIN
    -- Получаем множители грейда
    SELECT min_stats_multiplier, max_stats_multiplier 
    INTO grade_min_mult, grade_max_mult
    FROM item_grades 
    WHERE id = p_grade_id;
    
    -- Если грейд не найден, используем базовые значения
    IF grade_min_mult IS NULL THEN
        grade_min_mult := 0.80;
        grade_max_mult := 1.00;
    END IF;
    
    -- Рассчитываем множитель качества (от 0.01 до 1.00)
    quality_multiplier := p_quality::DECIMAL / 100.0;
    
    -- Финальный множитель: качество влияет на диапазон между мин и макс грейда
    final_multiplier := grade_min_mult + (grade_max_mult - grade_min_mult) * quality_multiplier;
    
    -- Рассчитываем финальные статы (минимум 1 для ненулевых базовых статов)
    RETURN QUERY SELECT
        CASE WHEN p_base_attack > 0 THEN GREATEST(1, FLOOR(p_base_attack * final_multiplier)) ELSE 0 END,
        CASE WHEN p_base_defense > 0 THEN GREATEST(1, FLOOR(p_base_defense * final_multiplier)) ELSE 0 END,
        CASE WHEN p_base_health > 0 THEN GREATEST(1, FLOOR(p_base_health * final_multiplier)) ELSE 0 END,
        CASE WHEN p_base_mana > 0 THEN GREATEST(1, FLOOR(p_base_mana * final_multiplier)) ELSE 0 END,
        CASE WHEN p_base_strength > 0 THEN GREATEST(1, FLOOR(p_base_strength * final_multiplier)) ELSE 0 END,
        CASE WHEN p_base_dexterity > 0 THEN GREATEST(1, FLOOR(p_base_dexterity * final_multiplier)) ELSE 0 END,
        CASE WHEN p_base_intelligence > 0 THEN GREATEST(1, FLOOR(p_base_intelligence * final_multiplier)) ELSE 0 END,
        CASE WHEN p_base_vitality > 0 THEN GREATEST(1, FLOOR(p_base_vitality * final_multiplier)) ELSE 0 END;
END;
$$ LANGUAGE plpgsql;

-- Функция расчета стоимости предмета
CREATE OR REPLACE FUNCTION calculate_item_value(
    p_base_value INTEGER,
    p_quality INTEGER,
    p_grade_id VARCHAR(50)
) RETURNS INTEGER AS $$
DECLARE
    quality_multiplier DECIMAL(5,2);
    grade_multiplier DECIMAL(5,2);
    final_value INTEGER;
BEGIN
    -- Получаем множитель грейда
    SELECT base_value_multiplier 
    INTO grade_multiplier
    FROM item_grades 
    WHERE id = p_grade_id;
    
    -- Если грейд не найден, используем базовое значение
    IF grade_multiplier IS NULL THEN
        grade_multiplier := 1.00;
    END IF;
    
    -- Рассчитываем множитель качества (от 0.5 до 1.5)
    quality_multiplier := 0.5 + (p_quality::DECIMAL / 100.0);
    
    -- Финальная стоимость
    final_value := FLOOR(p_base_value * grade_multiplier * quality_multiplier);
    
    RETURN GREATEST(1, final_value);
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- ТРИГГЕРЫ ДЛЯ АВТОМАТИЧЕСКОГО РАСЧЕТА СТАТОВ
-- ===============================================

-- Триггер для инвентаря
CREATE OR REPLACE FUNCTION update_inventory_item_stats()
RETURNS TRIGGER AS $$
DECLARE
    item_data RECORD;
    calculated_stats RECORD;
BEGIN
    -- Получаем данные предмета
    SELECT i.*, g.id as grade_id 
    INTO item_data
    FROM items_new i
    LEFT JOIN item_grades g ON i.grade_id = g.id
    WHERE i.id = NEW.item_id;
    
    -- Рассчитываем статы
    SELECT * INTO calculated_stats
    FROM calculate_item_stats(
        item_data.base_attack,
        item_data.base_defense,
        item_data.base_health,
        item_data.base_mana,
        item_data.base_strength,
        item_data.base_dexterity,
        item_data.base_intelligence,
        item_data.base_vitality,
        NEW.quality,
        item_data.grade_id
    );
    
    -- Обновляем рассчитанные значения
    NEW.actual_attack := calculated_stats.actual_attack;
    NEW.actual_defense := calculated_stats.actual_defense;
    NEW.actual_health := calculated_stats.actual_health;
    NEW.actual_mana := calculated_stats.actual_mana;
    NEW.actual_strength := calculated_stats.actual_strength;
    NEW.actual_dexterity := calculated_stats.actual_dexterity;
    NEW.actual_intelligence := calculated_stats.actual_intelligence;
    NEW.actual_vitality := calculated_stats.actual_vitality;
    
    -- Рассчитываем стоимость
    NEW.actual_value := calculate_item_value(
        item_data.base_value,
        NEW.quality,
        item_data.grade_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_item_stats
    BEFORE INSERT OR UPDATE ON character_inventory_new
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_item_stats();

-- Триггер для экипировки
CREATE OR REPLACE FUNCTION update_equipment_item_stats()
RETURNS TRIGGER AS $$
DECLARE
    item_data RECORD;
    calculated_stats RECORD;
BEGIN
    -- Получаем данные предмета
    SELECT i.*, g.id as grade_id 
    INTO item_data
    FROM items_new i
    LEFT JOIN item_grades g ON i.grade_id = g.id
    WHERE i.id = NEW.item_id;
    
    -- Рассчитываем статы
    SELECT * INTO calculated_stats
    FROM calculate_item_stats(
        item_data.base_attack,
        item_data.base_defense,
        item_data.base_health,
        item_data.base_mana,
        item_data.base_strength,
        item_data.base_dexterity,
        item_data.base_intelligence,
        item_data.base_vitality,
        NEW.quality,
        item_data.grade_id
    );
    
    -- Обновляем рассчитанные значения
    NEW.actual_attack := calculated_stats.actual_attack;
    NEW.actual_defense := calculated_stats.actual_defense;
    NEW.actual_health := calculated_stats.actual_health;
    NEW.actual_mana := calculated_stats.actual_mana;
    NEW.actual_strength := calculated_stats.actual_strength;
    NEW.actual_dexterity := calculated_stats.actual_dexterity;
    NEW.actual_intelligence := calculated_stats.actual_intelligence;
    NEW.actual_vitality := calculated_stats.actual_vitality;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_equipment_item_stats
    BEFORE INSERT OR UPDATE ON character_equipment_new
    FOR EACH ROW
    EXECUTE FUNCTION update_equipment_item_stats();

-- ===============================================
-- ИНДЕКСЫ
-- ===============================================

CREATE INDEX idx_items_new_category ON items_new(category_id);
CREATE INDEX idx_items_new_subcategory ON items_new(subcategory_id);
CREATE INDEX idx_items_new_grade ON items_new(grade_id);
CREATE INDEX idx_items_new_equipment_slot ON items_new(equipment_slot);
CREATE INDEX idx_character_inventory_new_character ON character_inventory_new(character_id);
CREATE INDEX idx_character_inventory_new_item ON character_inventory_new(item_id);
CREATE INDEX idx_character_equipment_new_character ON character_equipment_new(character_id);
CREATE INDEX idx_character_equipment_new_item ON character_equipment_new(item_id);
