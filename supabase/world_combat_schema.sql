-- ===============================================
-- СХЕМА БАЗЫ ДАННЫХ ДЛЯ НОВОЙ БОЕВОЙ СИСТЕМЫ
-- ===============================================

-- ПРОВЕРЯЕМ И ДОБАВЛЯЕМ НЕДОСТАЮЩИЕ КОЛОНКИ В СУЩЕСТВУЮЩИЕ ТАБЛИЦЫ
DO $$ 
BEGIN
    -- Добавляем колонку attack в таблицу mobs, если её нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mobs' AND column_name = 'attack') THEN
        ALTER TABLE mobs ADD COLUMN attack INTEGER NOT NULL DEFAULT 10;
    END IF;
    
    -- Добавляем колонку max_health в таблицу mobs, если её нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mobs' AND column_name = 'max_health') THEN
        ALTER TABLE mobs ADD COLUMN max_health INTEGER NOT NULL DEFAULT 100;
        -- Обновляем существующие записи
        UPDATE mobs SET max_health = health WHERE max_health IS NULL;
    END IF;
    
    -- Добавляем колонку defense в таблицу mobs, если её нет  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mobs' AND column_name = 'defense') THEN
        ALTER TABLE mobs ADD COLUMN defense INTEGER NOT NULL DEFAULT 5;
    END IF;
    
    -- Добавляем колонку experience_reward в таблицу mobs, если её нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mobs' AND column_name = 'experience_reward') THEN
        ALTER TABLE mobs ADD COLUMN experience_reward INTEGER NOT NULL DEFAULT 50;
    END IF;
    
    -- Добавляем колонку gold_reward в таблицу mobs, если её нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mobs' AND column_name = 'gold_reward') THEN
        ALTER TABLE mobs ADD COLUMN gold_reward INTEGER NOT NULL DEFAULT 25;
    END IF;
    
    -- Добавляем колонку rarity в таблицу mobs, если её нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mobs' AND column_name = 'rarity') THEN
        ALTER TABLE mobs ADD COLUMN rarity VARCHAR(20) DEFAULT 'common';
    END IF;
    
    -- Добавляем колонку mob_type в таблицу mobs, если её нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mobs' AND column_name = 'mob_type') THEN
        ALTER TABLE mobs ADD COLUMN mob_type VARCHAR(30) DEFAULT 'monster';
    END IF;
    
    -- Добавляем колонку icon в таблицу mobs, если её нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mobs' AND column_name = 'icon') THEN
        ALTER TABLE mobs ADD COLUMN icon VARCHAR(10) DEFAULT '👹';
    END IF;
    
    -- Добавляем колонку is_active в таблицу mobs, если её нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mobs' AND column_name = 'is_active') THEN
        ALTER TABLE mobs ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Добавляем колонку created_at в таблицу mobs, если её нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'mobs' AND column_name = 'created_at') THEN
        ALTER TABLE mobs ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
    
    -- Проверяем, есть ли колонка attack_damage, и если есть, то используем её
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'mobs' AND column_name = 'attack_damage') THEN
        -- Если есть attack_damage, убеждаемся что у неё есть значение по умолчанию
        ALTER TABLE mobs ALTER COLUMN attack_damage SET DEFAULT 10;
        -- Обновляем NULL значения
        UPDATE mobs SET attack_damage = 10 WHERE attack_damage IS NULL;
    END IF;
    
    -- Проверяем, есть ли колонка image, и если есть, то устанавливаем значение по умолчанию
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'mobs' AND column_name = 'image') THEN
        -- Если есть image, убеждаемся что у неё есть значение по умолчанию
        ALTER TABLE mobs ALTER COLUMN image SET DEFAULT 'default_mob.png';
        -- Обновляем NULL значения
        UPDATE mobs SET image = 'default_mob.png' WHERE image IS NULL;
    END IF;
END $$;

-- 1. КОНТИНЕНТЫ
CREATE TABLE IF NOT EXISTS continents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    min_level INTEGER NOT NULL DEFAULT 1,
    max_level INTEGER NOT NULL DEFAULT 20,
    icon VARCHAR(10) DEFAULT '🌍',
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. ЗОНЫ (ГОРОДА, СПОТЫ)
CREATE TABLE IF NOT EXISTS zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    continent_id UUID REFERENCES continents(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    zone_type VARCHAR(20) DEFAULT 'farming', -- 'city', 'farming', 'dungeon'
    min_level INTEGER NOT NULL DEFAULT 1,
    max_level INTEGER NOT NULL DEFAULT 5,
    icon VARCHAR(10) DEFAULT '🏞️',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. ФАРМ СПОТЫ (КВАДРАТЫ НА КАРТЕ)
CREATE TABLE IF NOT EXISTS farm_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES zones(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    min_level INTEGER NOT NULL DEFAULT 1,
    max_level INTEGER NOT NULL DEFAULT 3,
    respawn_time INTEGER DEFAULT 300, -- секунды
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. МОБЫ
CREATE TABLE IF NOT EXISTS mobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    health INTEGER NOT NULL DEFAULT 100,
    max_health INTEGER NOT NULL DEFAULT 100,
    attack INTEGER NOT NULL DEFAULT 10,
    defense INTEGER NOT NULL DEFAULT 5,
    experience_reward INTEGER NOT NULL DEFAULT 50,
    gold_reward INTEGER NOT NULL DEFAULT 25,
    icon VARCHAR(10) DEFAULT '👹',
    rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'uncommon', 'rare', 'epic', 'legendary'
    mob_type VARCHAR(30) DEFAULT 'monster', -- 'monster', 'beast', 'undead', 'elemental'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. СВЯЗЬ МОБОВ С ФАРМ СПОТАМИ
CREATE TABLE IF NOT EXISTS farm_spot_mobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_spot_id UUID REFERENCES farm_spots(id) ON DELETE CASCADE,
    mob_id UUID REFERENCES mobs(id) ON DELETE CASCADE,
    spawn_rate DECIMAL(5,2) DEFAULT 100.00, -- процент появления (0-100)
    max_spawns INTEGER DEFAULT 1, -- максимум мобов этого типа в споте
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(farm_spot_id, mob_id)
);

-- 6. ТАБЛИЦА ЛУТА (ДОБЫЧИ)
CREATE TABLE IF NOT EXISTS mob_loot (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mob_id UUID REFERENCES mobs(id) ON DELETE CASCADE,
    item_id VARCHAR(50) NOT NULL, -- ссылка на items.id
    drop_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00, -- процент выпадения (0-100)
    quantity_min INTEGER DEFAULT 1,
    quantity_max INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. ИСТОРИЯ БОЕВ (ОПЦИОНАЛЬНО, ДЛЯ СТАТИСТИКИ)
CREATE TABLE IF NOT EXISTS combat_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    mob_id UUID REFERENCES mobs(id) ON DELETE CASCADE,
    farm_spot_id UUID REFERENCES farm_spots(id) ON DELETE CASCADE,
    result VARCHAR(10) NOT NULL, -- 'victory', 'defeat'
    experience_gained INTEGER DEFAULT 0,
    gold_gained INTEGER DEFAULT 0,
    items_gained JSONB DEFAULT '[]',
    combat_duration INTEGER DEFAULT 0, -- секунды
    player_health_before INTEGER DEFAULT 0,
    player_health_after INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===============================================
-- ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ
-- ===============================================

CREATE INDEX IF NOT EXISTS idx_zones_continent ON zones(continent_id);
CREATE INDEX IF NOT EXISTS idx_farm_spots_zone ON farm_spots(zone_id);
CREATE INDEX IF NOT EXISTS idx_farm_spot_mobs_spot ON farm_spot_mobs(farm_spot_id);
CREATE INDEX IF NOT EXISTS idx_farm_spot_mobs_mob ON farm_spot_mobs(mob_id);
CREATE INDEX IF NOT EXISTS idx_mob_loot_mob ON mob_loot(mob_id);
CREATE INDEX IF NOT EXISTS idx_combat_log_character ON combat_log(character_id);
CREATE INDEX IF NOT EXISTS idx_combat_log_created ON combat_log(created_at);

-- ===============================================
-- НАЧАЛЬНЫЕ ДАННЫЕ
-- ===============================================

-- КОНТИНЕНТЫ
INSERT INTO continents (name, description, min_level, max_level, icon, position_x, position_y) VALUES
('Королевство Элария', 'Мирные земли для начинающих искателей приключений', 1, 20, '🏰', 100, 150),
('Дикие Пустоши', 'Опасные земли с сильными монстрами', 21, 40, '🏜️', 300, 100),
('Проклятые Земли', 'Древние руины, полные могущественных существ', 41, 75, '💀', 500, 200)
ON CONFLICT DO NOTHING;

-- ЗОНЫ ДЛЯ КОРОЛЕВСТВА ЭЛАРИЯ (1-20 уровень)
INSERT INTO zones (continent_id, name, description, zone_type, min_level, max_level, icon) 
SELECT c.id, zone_name, zone_desc, zone_type, min_lvl, max_lvl, zone_icon
FROM continents c
CROSS JOIN (VALUES
    ('Зеленые Поля', 'Спокойные луга с мирными существами', 'farming', 1, 5, '🌾'),
    ('Темный Лес', 'Густой лес, полный диких зверей', 'farming', 6, 10, '🌲'),
    ('Горные Тропы', 'Каменистые горы с опасными хищниками', 'farming', 11, 15, '⛰️'),
    ('Заброшенные Руины', 'Древние развалины с нежитью', 'farming', 16, 20, '🏛️')
) AS zone_data(zone_name, zone_desc, zone_type, min_lvl, max_lvl, zone_icon)
WHERE c.name = 'Королевство Элария'
ON CONFLICT DO NOTHING;

-- ЗОНЫ ДЛЯ ДИКИХ ПУСТОШЕЙ (21-40 уровень)
INSERT INTO zones (continent_id, name, description, zone_type, min_level, max_level, icon) 
SELECT c.id, zone_name, zone_desc, zone_type, min_lvl, max_lvl, zone_icon
FROM continents c
CROSS JOIN (VALUES
    ('Песчаные Дюны', 'Бескрайние пески с пустынными хищниками', 'farming', 21, 25, '🏜️'),
    ('Оазис Смерти', 'Обманчиво мирный оазис с опасными существами', 'farming', 26, 30, '🌴'),
    ('Каньон Ветров', 'Глубокие ущелья с летающими монстрами', 'farming', 31, 35, '🪨'),
    ('Пылающие Пещеры', 'Вулканические пещеры с огненными демонами', 'farming', 36, 40, '🌋')
) AS zone_data(zone_name, zone_desc, zone_type, min_lvl, max_lvl, zone_icon)
WHERE c.name = 'Дикие Пустоши'
ON CONFLICT DO NOTHING;

-- ЗОНЫ ДЛЯ ПРОКЛЯТЫХ ЗЕМЕЛЬ (41-75 уровень)
INSERT INTO zones (continent_id, name, description, zone_type, min_level, max_level, icon) 
SELECT c.id, zone_name, zone_desc, zone_type, min_lvl, max_lvl, zone_icon
FROM continents c
CROSS JOIN (VALUES
    ('Кладбище Героев', 'Древнее кладбище с могущественной нежитью', 'farming', 41, 50, '⚰️'),
    ('Башня Магов', 'Разрушенная башня с магическими аномалиями', 'farming', 51, 60, '🗼'),
    ('Логово Дракона', 'Пещеры древних драконов', 'farming', 61, 70, '🐲'),
    ('Врата Хаоса', 'Портал в демонические миры', 'farming', 71, 75, '🌀')
) AS zone_data(zone_name, zone_desc, zone_type, min_lvl, max_lvl, zone_icon)
WHERE c.name = 'Проклятые Земли'
ON CONFLICT DO NOTHING;

-- МОБЫ ДЛЯ НАЧАЛЬНЫХ ЗОНОВ (СБАЛАНСИРОВАННЫЕ НАГРАДЫ)
INSERT INTO mobs (name, description, level, health, attack_damage, defense, experience_reward, gold_reward, icon, rarity, mob_type, image) VALUES
-- Зеленые Поля (1-5) - 8-12 мобов для повышения уровня
('Лесной Слизень', 'Мирное желеобразное существо', 1, 50, 8, 2, 7, 10, '🟢', 'common', 'monster', 'slime.png'),
('Дикий Кролик', 'Быстрый пушистый зверек', 2, 60, 12, 3, 9, 15, '🐰', 'common', 'beast', 'rabbit.png'),
('Молодой Волк', 'Неопытный хищник', 3, 80, 15, 5, 12, 20, '🐺', 'common', 'beast', 'wolf.png'),
('Гигантский Паук', 'Ядовитый паук размером с собаку', 4, 100, 18, 6, 15, 25, '🕷️', 'uncommon', 'monster', 'spider.png'),
('Лесной Страж', 'Древесный голем-защитник', 5, 150, 22, 12, 18, 35, '🌳', 'uncommon', 'elemental', 'treant.png'),

-- Темный Лес (6-10) - 6-8 мобов для повышения уровня
('Теневой Волк', 'Волк, пропитанный темной магией', 6, 180, 25, 8, 22, 45, '🐺', 'uncommon', 'beast', 'shadow_wolf.png'),
('Злобный Орк', 'Агрессивный зеленокожий воин', 7, 220, 30, 10, 26, 55, '👹', 'common', 'monster', 'orc.png'),
('Лесная Ведьма', 'Колдунья, живущая в чаще', 8, 200, 35, 12, 30, 65, '🧙‍♀️', 'rare', 'monster', 'witch.png'),
('Древний Ent', 'Могучее дерево-воин', 9, 300, 28, 20, 34, 75, '🌲', 'rare', 'elemental', 'ent.png'),
('Король Медведь', 'Огромный медведь-альфа', 10, 400, 40, 15, 38, 90, '🐻', 'rare', 'beast', 'bear_king.png'),

-- Горные Тропы (11-15) - 5-6 мобов для повышения уровня
('Горный Тролль', 'Массивный каменный великан', 11, 500, 45, 25, 42, 110, '👹', 'uncommon', 'monster', 'troll.png'),
('Ледяной Элементаль', 'Существо из льда и снега', 12, 450, 50, 20, 46, 130, '❄️', 'rare', 'elemental', 'ice_elemental.png'),
('Грифон', 'Гордая птица с телом льва', 13, 400, 60, 18, 50, 150, '🦅', 'rare', 'beast', 'griffin.png'),
('Каменный Голем', 'Ожившая скала', 14, 600, 55, 35, 54, 170, '🗿', 'rare', 'elemental', 'stone_golem.png'),
('Драконенок', 'Молодой дракон', 15, 550, 70, 25, 58, 200, '🐉', 'epic', 'monster', 'dragon_young.png'),

-- Заброшенные Руины (16-20) - 4-5 мобов для повышения уровня
('Скелет-Воин', 'Ожившие останки древнего воина', 16, 400, 65, 30, 62, 220, '💀', 'common', 'undead', 'skeleton_warrior.png'),
('Призрак', 'Душа, не нашедшая покоя', 17, 350, 75, 15, 66, 240, '👻', 'uncommon', 'undead', 'ghost.png'),
('Мумия', 'Забальзамированный древний правитель', 18, 650, 70, 40, 70, 260, '🧟‍♂️', 'rare', 'undead', 'mummy.png'),
('Лич', 'Могущественный маг-нежить', 19, 500, 90, 35, 74, 300, '☠️', 'epic', 'undead', 'lich.png'),
('Древний Дракон', 'Старый и мудрый дракон', 20, 800, 100, 45, 78, 400, '🐲', 'legendary', 'monster', 'ancient_dragon.png')
ON CONFLICT DO NOTHING;

-- СОЗДАНИЕ ФАРМ СПОТОВ И СВЯЗЕЙ С МОБАМИ будет в отдельном скрипте
-- Это базовая структура для начала работы

-- ===============================================
-- ФУНКЦИИ ДЛЯ РАБОТЫ С НОВОЙ СИСТЕМОЙ
-- ===============================================

-- Функция получения доступных континентов для уровня игрока
CREATE OR REPLACE FUNCTION get_available_continents(player_level INTEGER)
RETURNS TABLE(
    id UUID,
    name VARCHAR,
    description TEXT,
    min_level INTEGER,
    max_level INTEGER,
    icon VARCHAR,
    position_x INTEGER,
    position_y INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT c.id, c.name, c.description, c.min_level, c.max_level, c.icon, c.position_x, c.position_y
    FROM continents c
    WHERE c.is_active = true 
    AND player_level >= c.min_level
    ORDER BY c.min_level;
END;
$$ LANGUAGE plpgsql;

-- Функция получения зон континента для уровня игрока
CREATE OR REPLACE FUNCTION get_continent_zones(continent_id_param UUID, player_level INTEGER)
RETURNS TABLE(
    id UUID,
    name VARCHAR,
    description TEXT,
    zone_type VARCHAR,
    min_level INTEGER,
    max_level INTEGER,
    icon VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT z.id, z.name, z.description, z.zone_type, z.min_level, z.max_level, z.icon
    FROM zones z
    WHERE z.continent_id = continent_id_param
    AND z.is_active = true
    AND player_level >= z.min_level
    ORDER BY z.min_level;
END;
$$ LANGUAGE plpgsql;

-- Функция получения мобов фарм спота
CREATE OR REPLACE FUNCTION get_farm_spot_mobs(farm_spot_id_param UUID)
RETURNS TABLE(
    mob_id UUID,
    name VARCHAR,
    description TEXT,
    level INTEGER,
    health INTEGER,
    attack_damage INTEGER,
    defense INTEGER,
    experience_reward INTEGER,
    gold_reward INTEGER,
    icon VARCHAR,
    rarity VARCHAR,
    mob_type VARCHAR,
    spawn_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.name, m.description, m.level, m.health, 
           COALESCE(m.attack_damage, m.attack, 10) as attack_damage, m.defense, 
           m.experience_reward, m.gold_reward, m.icon, m.rarity, m.mob_type, fsm.spawn_rate
    FROM mobs m
    JOIN farm_spot_mobs fsm ON m.id = fsm.mob_id
    WHERE fsm.farm_spot_id = farm_spot_id_param
    AND m.is_active = true
    ORDER BY m.level;
END;
$$ LANGUAGE plpgsql;
