-- Complete Schema Update
-- This file contains all necessary tables and fixes

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. MOBS TABLE (Missing from main schema)
CREATE TABLE IF NOT EXISTS mobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 1,
    health INTEGER NOT NULL DEFAULT 100,
    attack_damage INTEGER NOT NULL DEFAULT 10,
    defense INTEGER NOT NULL DEFAULT 5,
    magic_resistance INTEGER NOT NULL DEFAULT 0,
    aggressive BOOLEAN DEFAULT true,
    respawn_time INTEGER DEFAULT 60, -- in seconds
    experience_reward INTEGER NOT NULL DEFAULT 50,
    gold_reward INTEGER NOT NULL DEFAULT 25,
    loot_table_id UUID,
    image VARCHAR(10) DEFAULT '👹',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. MOB SPAWNS TABLE (Missing from main schema)
CREATE TABLE IF NOT EXISTS mob_spawns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spot_id UUID REFERENCES farming_spots(id) ON DELETE CASCADE,
    mob_id UUID REFERENCES mobs(id) ON DELETE CASCADE,
    spawn_rate DECIMAL(5,2) DEFAULT 1.0, -- mobs per minute
    max_concurrent INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(spot_id, mob_id)
);

-- 3. LOOT TABLES (Missing from main schema)
CREATE TABLE IF NOT EXISTS loot_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. LOOT TABLE ITEMS (Missing from main schema)
CREATE TABLE IF NOT EXISTS loot_table_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loot_table_id UUID REFERENCES loot_tables(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    drop_rate DECIMAL(5,2) NOT NULL DEFAULT 1.0, -- percentage (0-100)
    min_quantity INTEGER DEFAULT 1,
    max_quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. FIX FARMING SPOTS TABLE (Add missing columns)
ALTER TABLE farming_spots 
ADD COLUMN IF NOT EXISTS current_occupancy INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_occupancy INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS difficulty_multiplier DECIMAL(3,1) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS experience_multiplier DECIMAL(3,1) DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS position JSONB DEFAULT '{"x": 0, "y": 0}';

-- 6. CREATE INDEXES FOR NEW TABLES
CREATE INDEX IF NOT EXISTS idx_mobs_level ON mobs(level);
CREATE INDEX IF NOT EXISTS idx_mobs_active ON mobs(is_active);
CREATE INDEX IF NOT EXISTS idx_mob_spawns_spot_id ON mob_spawns(spot_id);
CREATE INDEX IF NOT EXISTS idx_mob_spawns_mob_id ON mob_spawns(mob_id);
CREATE INDEX IF NOT EXISTS idx_loot_table_items_loot_table_id ON loot_table_items(loot_table_id);
CREATE INDEX IF NOT EXISTS idx_loot_table_items_item_id ON loot_table_items(item_id);

-- 7. INSERT BASIC MOBS DATA
INSERT INTO mobs (name, description, level, health, attack_damage, defense, magic_resistance, aggressive, respawn_time, experience_reward, gold_reward, image) VALUES
-- Level 1-5 mobs
('Лесной слайм', 'Мягкий и медленный слайм из леса.', 1, 50, 8, 2, 0, false, 30, 15, 10, '🟢'),
('Дикий кролик', 'Быстрый и пугливый кролик.', 2, 35, 12, 1, 0, false, 45, 20, 15, '🐰'),
('Лесной волк', 'Опасный хищник леса.', 3, 80, 18, 5, 0, true, 60, 35, 25, '🐺'),
('Гигантский паук', 'Большой ядовитый паук.', 4, 65, 22, 3, 0, true, 90, 45, 30, '🕷️'),
('Лесной страж', 'Древний защитник леса.', 5, 120, 25, 8, 5, true, 120, 60, 40, '🌳'),

-- Level 6-15 mobs
('Пещерная летучая мышь', 'Агрессивная летучая мышь из пещеры.', 6, 45, 20, 2, 0, true, 40, 25, 20, '🦇'),
('Лесной орк', 'Примитивный воин-орк.', 8, 100, 30, 6, 0, true, 80, 50, 35, '👹'),
('Каменный голем', 'Массивный голем из камня.', 12, 200, 40, 15, 10, false, 180, 100, 75, '🗿'),
('Теневой убийца', 'Быстрый и смертоносный убийца из теней.', 18, 150, 50, 8, 5, true, 120, 80, 60, '🥷'),

-- Level 15-30 mobs
('Скелет-воин', 'Восставший из мертвых древний воин.', 20, 180, 45, 12, 0, true, 150, 90, 70, '💀'),
('Некромант', 'Темный маг, воскрешающий мертвых.', 25, 160, 55, 8, 20, false, 200, 120, 90, '🧙‍♂️'),
('Древний лич', 'Могущественный маг-нежить с разрушительной магией.', 30, 300, 70, 15, 30, true, 300, 180, 150, '👑'),

-- Level 25-45 mobs
('Огненный элементаль', 'Существо из чистого огня, наносящее магический урон.', 35, 250, 60, 10, 25, true, 180, 150, 120, '🔥'),
('Лавовый голем', 'Массивный голем из расплавленной лавы.', 40, 400, 80, 25, 15, false, 240, 200, 180, '🌋'),
('Огненный дракон', 'Молодой дракон с огненным дыханием.', 45, 500, 100, 20, 20, true, 360, 300, 250, '🐉')
ON CONFLICT (name) DO NOTHING;

-- 8. CREATE LOOT TABLES
INSERT INTO loot_tables (name) VALUES
('Слайм лут'),
('Волк лут'),
('Паук лут'),
('Орк лут'),
('Летучая мышь лут'),
('Голем лут'),
('Убийца лут'),
('Скелет лут'),
('Некромант лут'),
('Лич лут'),
('Элементаль лут'),
('Дракон лут')
ON CONFLICT (name) DO NOTHING;

-- 9. UPDATE MOBS WITH LOOT TABLE REFERENCES
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Слайм лут') WHERE name = 'Лесной слайм';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Волк лут') WHERE name = 'Лесной волк';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Паук лут') WHERE name = 'Гигантский паук';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Орк лут') WHERE name = 'Лесной орк';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Летучая мышь лут') WHERE name = 'Пещерная летучая мышь';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Голем лут') WHERE name = 'Каменный голем';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Убийца лут') WHERE name = 'Теневой убийца';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Скелет лут') WHERE name = 'Скелет-воин';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Некромант лут') WHERE name = 'Некромант';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Лич лут') WHERE name = 'Древний лич';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Элементаль лут') WHERE name = 'Огненный элементаль';
UPDATE mobs SET loot_table_id = (SELECT id FROM loot_tables WHERE name = 'Дракон лут') WHERE name = 'Огненный дракон';

-- 10. ASSIGN MOBS TO FARMING SPOTS
INSERT INTO mob_spawns (spot_id, mob_id, spawn_rate, max_concurrent) VALUES
-- Новичковый лес - Поляна слаймов
((SELECT id FROM farming_spots WHERE name = 'Поляна слаймов'), (SELECT id FROM mobs WHERE name = 'Лесной слайм'), 2.0, 3),
((SELECT id FROM farming_spots WHERE name = 'Поляна слаймов'), (SELECT id FROM mobs WHERE name = 'Дикий кролик'), 1.5, 2),

-- Новичковый лес - Волчье логово  
((SELECT id FROM farming_spots WHERE name = 'Волчье логово'), (SELECT id FROM mobs WHERE name = 'Лесной волк'), 1.5, 2),
((SELECT id FROM farming_spots WHERE name = 'Волчье логово'), (SELECT id FROM mobs WHERE name = 'Лесной слайм'), 1.0, 1),
((SELECT id FROM farming_spots WHERE name = 'Волчье логово'), (SELECT id FROM mobs WHERE name = 'Дикий кролик'), 0.8, 1),

-- Новичковый лес - Паучье гнездо
((SELECT id FROM farming_spots WHERE name = 'Паучье гнездо'), (SELECT id FROM mobs WHERE name = 'Гигантский паук'), 1.2, 2),
((SELECT id FROM farming_spots WHERE name = 'Паучье гнездо'), (SELECT id FROM mobs WHERE name = 'Лесной страж'), 0.5, 1),

-- Темная пещера - Входная камера
((SELECT id FROM farming_spots WHERE name = 'Входная камера'), (SELECT id FROM mobs WHERE name = 'Пещерная летучая мышь'), 2.5, 4),
((SELECT id FROM farming_spots WHERE name = 'Входная камера'), (SELECT id FROM mobs WHERE name = 'Лесной орк'), 0.8, 1),

-- Темная пещера - Глубокий туннель
((SELECT id FROM farming_spots WHERE name = 'Глубокий туннель'), (SELECT id FROM mobs WHERE name = 'Каменный голем'), 0.8, 1),
((SELECT id FROM farming_spots WHERE name = 'Глубокий туннель'), (SELECT id FROM mobs WHERE name = 'Теневой убийца'), 1.0, 2),

-- Заброшенные руины - Двор скелетов
((SELECT id FROM farming_spots WHERE name = 'Двор скелетов'), (SELECT id FROM mobs WHERE name = 'Скелет-воин'), 1.8, 3),

-- Заброшенные руины - Башня мага
((SELECT id FROM farming_spots WHERE name = 'Башня мага'), (SELECT id FROM mobs WHERE name = 'Некромант'), 0.6, 1),
((SELECT id FROM farming_spots WHERE name = 'Башня мага'), (SELECT id FROM mobs WHERE name = 'Древний лич'), 0.3, 1)
ON CONFLICT (spot_id, mob_id) DO NOTHING;

-- 11. ADD MISSING COLUMNS TO FARMING_SPOTS IF THEY DON'T EXIST
DO $$ 
BEGIN
    -- Add current_occupancy column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farming_spots' AND column_name = 'current_occupancy') THEN
        ALTER TABLE farming_spots ADD COLUMN current_occupancy INTEGER DEFAULT 0;
    END IF;
    
    -- Add max_occupancy column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farming_spots' AND column_name = 'max_occupancy') THEN
        ALTER TABLE farming_spots ADD COLUMN max_occupancy INTEGER DEFAULT 1;
    END IF;
    
    -- Add difficulty_multiplier column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farming_spots' AND column_name = 'difficulty_multiplier') THEN
        ALTER TABLE farming_spots ADD COLUMN difficulty_multiplier DECIMAL(3,1) DEFAULT 1.0;
    END IF;
    
    -- Add experience_multiplier column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farming_spots' AND column_name = 'experience_multiplier') THEN
        ALTER TABLE farming_spots ADD COLUMN experience_multiplier DECIMAL(3,1) DEFAULT 1.0;
    END IF;
    
    -- Add position column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farming_spots' AND column_name = 'position') THEN
        ALTER TABLE farming_spots ADD COLUMN position JSONB DEFAULT '{"x": 0, "y": 0}';
    END IF;
END $$;

-- 12. UPDATE FARMING SPOTS WITH PROPER OCCUPANCY DATA
UPDATE farming_spots SET 
    current_occupancy = 0,
    max_occupancy = CASE 
        WHEN name = 'Поляна слаймов' THEN 5
        WHEN name = 'Волчье логово' THEN 4
        WHEN name = 'Паучье гнездо' THEN 3
        WHEN name = 'Входная камера' THEN 6
        WHEN name = 'Глубокий туннель' THEN 3
        WHEN name = 'Двор скелетов' THEN 4
        WHEN name = 'Башня мага' THEN 2
        ELSE 1
    END
WHERE current_occupancy IS NULL OR max_occupancy IS NULL;

-- 13. CREATE FUNCTIONS FOR OCCUPYING/LEAVING SPOTS
CREATE OR REPLACE FUNCTION occupy_farming_spot(spot_id UUID, character_id UUID)
RETURNS JSON AS $$
DECLARE
    spot_record RECORD;
    result JSON;
BEGIN
    -- Get spot information
    SELECT * INTO spot_record FROM farming_spots WHERE id = spot_id;
    
    -- Check if spot exists
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Spot not found');
    END IF;
    
    -- Check if spot has available space
    IF spot_record.current_occupancy >= spot_record.max_occupancy THEN
        RETURN json_build_object('success', false, 'error', 'Spot is full');
    END IF;
    
    -- Update spot occupancy
    UPDATE farming_spots 
    SET current_occupancy = current_occupancy + 1 
    WHERE id = spot_id;
    
    -- Update character location
    UPDATE characters 
    SET current_spot_id = spot_id, current_location_id = spot_record.location_id
    WHERE id = character_id;
    
    RETURN json_build_object('success', true, 'message', 'Successfully occupied spot');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION leave_farming_spot(spot_id UUID, character_id UUID)
RETURNS JSON AS $$
DECLARE
    spot_record RECORD;
    result JSON;
BEGIN
    -- Get spot information
    SELECT * INTO spot_record FROM farming_spots WHERE id = spot_id;
    
    -- Check if spot exists
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Spot not found');
    END IF;
    
    -- Update spot occupancy
    UPDATE farming_spots 
    SET current_occupancy = GREATEST(0, current_occupancy - 1) 
    WHERE id = spot_id;
    
    -- Update character location
    UPDATE characters 
    SET current_spot_id = NULL
    WHERE id = character_id;
    
    RETURN json_build_object('success', true, 'message', 'Successfully left spot');
END;
$$ LANGUAGE plpgsql;

-- 14. GRANT PERMISSIONS
GRANT ALL ON mobs TO authenticated;
GRANT ALL ON mob_spawns TO authenticated;
GRANT ALL ON loot_tables TO authenticated;
GRANT ALL ON loot_table_items TO authenticated;
GRANT EXECUTE ON FUNCTION occupy_farming_spot TO authenticated;
GRANT EXECUTE ON FUNCTION leave_farming_spot TO authenticated;
