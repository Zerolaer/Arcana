-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players table (connected to auth.users)
CREATE TABLE IF NOT EXISTS players (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character classes table
CREATE TABLE IF NOT EXISTS character_classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    
    -- Base stats for new system
    base_agility INTEGER DEFAULT 10,
    base_precision INTEGER DEFAULT 10,
    base_evasion INTEGER DEFAULT 10,
    base_intelligence INTEGER DEFAULT 10,
    base_spell_power INTEGER DEFAULT 10,
    base_resistance INTEGER DEFAULT 10,
    base_strength INTEGER DEFAULT 10,
    base_endurance INTEGER DEFAULT 10,
    base_armor INTEGER DEFAULT 10,
    base_stealth INTEGER DEFAULT 10,
    
    -- Stat growth per level for new system
    agility_per_level DECIMAL(3,1) DEFAULT 1.0,
    precision_per_level DECIMAL(3,1) DEFAULT 1.0,
    evasion_per_level DECIMAL(3,1) DEFAULT 1.0,
    intelligence_per_level DECIMAL(3,1) DEFAULT 1.0,
    spell_power_per_level DECIMAL(3,1) DEFAULT 1.0,
    resistance_per_level DECIMAL(3,1) DEFAULT 1.0,
    strength_per_level DECIMAL(3,1) DEFAULT 1.0,
    endurance_per_level DECIMAL(3,1) DEFAULT 1.0,
    armor_per_level DECIMAL(3,1) DEFAULT 1.0,
    stealth_per_level DECIMAL(3,1) DEFAULT 1.0,
    
    starting_skills TEXT[] DEFAULT '{}',
    icon TEXT NOT NULL,
    primary_stats TEXT[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skills table (simplified)
CREATE TABLE IF NOT EXISTS skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    skill_type TEXT NOT NULL CHECK (skill_type IN ('standard', 'enhanced', 'aoe', 'buff', 'barrier', 'lifesteal')),
    
    required_level INTEGER DEFAULT 1,
    required_class TEXT[] DEFAULT '{}',
    
    mana_cost INTEGER DEFAULT 0,
    cooldown INTEGER DEFAULT 0,
    
    base_damage INTEGER DEFAULT 0,
    damage_type TEXT NOT NULL CHECK (damage_type IN ('physical', 'magical', 'true')),
    scaling_stat TEXT NOT NULL CHECK (scaling_stat IN ('agility', 'precision', 'evasion', 'intelligence', 'spell_power', 'strength', 'endurance', 'armor', 'stealth', 'resistance')),
    scaling_ratio DECIMAL(3,2) DEFAULT 1.0,
    
    special_effects TEXT[] DEFAULT '{}',
    
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    class_id UUID REFERENCES character_classes(id),
    
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    experience_to_next BIGINT DEFAULT 100,
    
    -- Base stats (new system)
    agility INTEGER DEFAULT 10,
    precision INTEGER DEFAULT 10,
    evasion INTEGER DEFAULT 10,
    intelligence INTEGER DEFAULT 10,
    spell_power INTEGER DEFAULT 10,
    resistance INTEGER DEFAULT 10,
    strength INTEGER DEFAULT 10,
    endurance INTEGER DEFAULT 10,
    armor INTEGER DEFAULT 10,
    stealth INTEGER DEFAULT 10,
    
    stat_points INTEGER DEFAULT 0,
    
    -- Current resources (simplified)
    health INTEGER DEFAULT 100,
    max_health INTEGER DEFAULT 100,
    mana INTEGER DEFAULT 50,
    max_mana INTEGER DEFAULT 50,
    
    -- Calculated combat stats (new system)
    attack_damage INTEGER DEFAULT 0,
    magic_damage INTEGER DEFAULT 0,
    defense INTEGER DEFAULT 0,
    magic_resistance INTEGER DEFAULT 0,
    critical_chance DECIMAL(5,2) DEFAULT 5.0,
    critical_damage DECIMAL(5,2) DEFAULT 150.0,
    attack_speed DECIMAL(5,2) DEFAULT 100.0,
    accuracy DECIMAL(5,2) DEFAULT 85.0,
    
    -- Regeneration stats (simplified)
    health_regen DECIMAL(5,2) DEFAULT 1.0,
    mana_regen DECIMAL(5,2) DEFAULT 1.0,
    
    gold BIGINT DEFAULT 100,
    
    current_location_id UUID REFERENCES locations(id),
    current_spot_id UUID REFERENCES farming_spots(id),
    
    is_online BOOLEAN DEFAULT true,
    is_in_combat BOOLEAN DEFAULT false,
    is_afk_farming BOOLEAN DEFAULT false,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Character skills table (simplified)
CREATE TABLE IF NOT EXISTS character_skills (
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    
    -- Calculated values
    damage INTEGER DEFAULT 0,
    cooldown INTEGER DEFAULT 0,
    mana_cost INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (character_id, skill_id)
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
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
    
    -- Base stats
    base_damage INTEGER DEFAULT 0,
    base_defense INTEGER DEFAULT 0,
    base_health INTEGER DEFAULT 0,
    base_mana INTEGER DEFAULT 0,
    base_crit_chance DECIMAL(5,2) DEFAULT 0,
    base_crit_damage DECIMAL(5,2) DEFAULT 0,
    base_speed DECIMAL(5,2) DEFAULT 0,
    
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

-- Character inventory table
CREATE TABLE IF NOT EXISTS character_inventory (
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    slot_position INTEGER,
    is_equipped BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (character_id, item_id, slot_position)
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    level_requirement INTEGER DEFAULT 1,
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farming spots table
CREATE TABLE IF NOT EXISTS farming_spots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES locations(id),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    level_requirement INTEGER DEFAULT 1,
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Combat logs table
CREATE TABLE IF NOT EXISTS combat_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('mob', 'player')),
    target_id UUID,
    action_type TEXT NOT NULL CHECK (action_type IN ('attack', 'skill', 'defend', 'dodge')),
    damage_dealt INTEGER DEFAULT 0,
    damage_taken INTEGER DEFAULT 0,
    is_critical BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_characters_player_id ON characters(player_id);
CREATE INDEX IF NOT EXISTS idx_characters_class_id ON characters(class_id);
CREATE INDEX IF NOT EXISTS idx_character_inventory_character_id ON character_inventory(character_id);
CREATE INDEX IF NOT EXISTS idx_character_inventory_item_id ON character_inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_character_skills_character_id ON character_skills(character_id);
CREATE INDEX IF NOT EXISTS idx_character_skills_skill_id ON character_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_combat_logs_character_id ON combat_logs(character_id);
CREATE INDEX IF NOT EXISTS idx_combat_logs_created_at ON combat_logs(created_at);

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_character_skills_updated_at BEFORE UPDATE ON character_skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_character_inventory_updated_at BEFORE UPDATE ON character_inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate character stats
CREATE OR REPLACE FUNCTION update_character_calculated_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate derived stats based on base stats
    NEW.max_health = 100 + (NEW.endurance * 15);
    NEW.max_mana = 50 + (NEW.intelligence * 8);
    
    NEW.attack_damage = (NEW.strength * 2.5) + (NEW.agility * 1.5);
    NEW.magic_damage = (NEW.spell_power * 3.0) + (NEW.intelligence * 1.0);
    NEW.defense = (NEW.armor * 2.0) + (NEW.endurance * 1.0);
    NEW.magic_resistance = NEW.resistance * 2.5;
    
    NEW.critical_chance = 5.0 + (NEW.agility * 0.15);
    NEW.critical_damage = 150.0 + (NEW.strength * 0.8);
    NEW.attack_speed = 100.0 + (NEW.agility * 1.2);
    NEW.accuracy = 85.0 + (NEW.precision * 1.0);
    
    -- Регенерация с правильным округлением
    NEW.health_regen = ROUND(1.0 + (NEW.endurance * 0.1));
    NEW.mana_regen = ROUND(1.0 + (NEW.intelligence * 0.1));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic stat calculation
CREATE TRIGGER trigger_update_character_calculated_stats
    BEFORE INSERT OR UPDATE ON characters
    FOR EACH ROW
    EXECUTE FUNCTION update_character_calculated_stats();

-- Insert basic data
INSERT INTO character_classes (
    name, description,
    base_agility, base_precision, base_evasion, base_intelligence, base_spell_power, base_resistance, base_strength, base_endurance, base_armor, base_stealth,
    agility_per_level, precision_per_level, evasion_per_level, intelligence_per_level, spell_power_per_level, resistance_per_level, strength_per_level, endurance_per_level, armor_per_level, stealth_per_level,
    starting_skills, icon, primary_stats
) VALUES 
-- Лучник
('Лучник', 'Быстрый и точный боец дальнего боя. Высокая скорость атаки и критический урон.',
    25, 20, 18, 8, 5, 8, 12, 15, 10, 5,
    2.5, 2.0, 1.8, 0.8, 0.5, 0.8, 1.2, 1.5, 1.0, 0.5,
    '{"Выстрел с натяжкой", "Двойной выстрел", "Град стрел", "Инстинкты охотника", "Танец ветра", "Смертоносный шквал"}',
    '🏹',
    '{"agility", "precision", "evasion"}'),

-- Маг
('Маг', 'Мастер магических искусств с разрушительными заклинаниями и высоким магическим уроном.',
    8, 10, 12, 25, 22, 18, 6, 12, 8, 5,
    0.8, 1.0, 1.2, 2.5, 2.2, 1.8, 0.6, 1.2, 0.8, 0.5,
    '{"Искра", "Чародейский залп", "Взрывная волна", "Сила маны", "Магический щит", "Поглощающее пламя"}',
    '🔮',
    '{"intelligence", "spell_power", "resistance"}'),

-- Берсерк
('Берсерк', 'Мощный воин ближнего боя с огромной силой и выносливостью.',
    15, 12, 10, 6, 8, 15, 25, 22, 18, 8,
    1.5, 1.2, 1.0, 0.6, 0.8, 1.5, 2.5, 2.2, 1.8, 0.8,
    '{"Мощный удар", "Рассекающий взмах", "Вихрь ярости", "Гнев берсерка", "Кожа камня", "Кровавый шторм"}',
    '🪓',
    '{"strength", "endurance", "armor"}'),

-- Ассасин
('Ассасин', 'Быстрый и скрытный убийца с высоким уроном из невидимости.',
    22, 18, 20, 10, 12, 10, 15, 12, 8, 25,
    2.2, 1.8, 2.0, 1.0, 1.2, 1.0, 1.5, 1.2, 0.8, 2.5,
    '{"Удар в сердце", "Теневая вспышка", "Танец клинков", "Тень охотника", "Дымовая завеса", "Ритуал крови"}',
    '🗡️',
    '{"agility", "stealth", "precision"}');

-- Insert basic skills
INSERT INTO skills (name, description, skill_type, required_class, mana_cost, cooldown, base_damage, damage_type, scaling_stat, scaling_ratio, special_effects, icon) VALUES
-- Скиллы Лучника
('Выстрел с натяжкой', 'Быстрый выстрел одной стрелой, базовый физический урон.', 'standard', '{"Лучник"}', 0, 0, 100, 'physical', 'agility', 1.5, '{}', '🏹'),
('Двойной выстрел', 'Выпускает две стрелы подряд с повышенным уроном по одной цели.', 'enhanced', '{"Лучник"}', 15, 8, 180, 'physical', 'agility', 2.0, '{}', '🏹🏹'),
('Град стрел', 'Осаждает выбранную область дождём стрел, нанося урон всем врагам в радиусе.', 'aoe', '{"Лучник"}', 30, 15, 120, 'physical', 'precision', 1.8, '{}', '🌧️'),
('Инстинкты охотника', 'Увеличивает скорость атаки и шанс критического удара на короткое время.', 'buff', '{"Лучник"}', 25, 30, 0, 'true', 'agility', 1.0, '{"attack_speed_boost", "crit_chance_boost"}', '👁️'),
('Танец ветра', 'Создаёт вихрь вокруг себя, повышая уклонение и уменьшая входящий урон.', 'barrier', '{"Лучник"}', 35, 45, 0, 'true', 'agility', 1.0, '{"evasion_boost", "damage_reduction"}', '🌪️'),
('Смертоносный шквал', 'Мощный залп в широком секторе, наносит урон и восстанавливает здоровье пропорционально нанесённому.', 'lifesteal', '{"Лучник"}', 50, 60, 200, 'physical', 'agility', 2.5, '{"lifesteal"}', '💀'),

-- Скиллы Мага
('Искра', 'Быстрое магическое снаряжение, базовый урон стихией.', 'standard', '{"Маг"}', 5, 0, 80, 'magical', 'spell_power', 1.2, '{}', '✨'),
('Чародейский залп', 'Выпускает усиленный сгусток магической энергии с повышенным уроном.', 'enhanced', '{"Маг"}', 20, 10, 150, 'magical', 'spell_power', 2.2, '{}', '💥'),
('Взрывная волна', 'Создаёт магическую волну вокруг себя, наносящую урон нескольким врагам.', 'aoe', '{"Маг"}', 40, 20, 100, 'magical', 'intelligence', 1.5, '{}', '💢'),
('Сила маны', 'Повышает магическую мощь и скорость восстановления маны на время.', 'buff', '{"Маг"}', 30, 35, 0, 'true', 'intelligence', 1.0, '{"spell_power_boost", "mana_regen_boost"}', '🔮'),
('Магический щит', 'Создаёт щит, поглощающий часть входящего урона.', 'barrier', '{"Маг"}', 45, 50, 0, 'true', 'intelligence', 1.0, '{"damage_absorption"}', '🛡️'),
('Поглощающее пламя', 'Огненный взрыв, наносящий большой урон по площади и возвращающий часть нанесённого урона в здоровье мага.', 'lifesteal', '{"Маг"}', 60, 70, 250, 'magical', 'spell_power', 3.0, '{"lifesteal"}', '🔥'),

-- Скиллы Берсерка
('Мощный удар', 'Сильный удар оружием по одной цели.', 'standard', '{"Берсерк"}', 0, 0, 120, 'physical', 'strength', 2.0, '{}', '⚔️'),
('Рассекающий взмах', 'Удар по дуге с повышенным уроном, наносимый одной цели с шансом критического урона.', 'enhanced', '{"Берсерк"}', 15, 8, 200, 'physical', 'strength', 2.5, '{"crit_chance_boost"}', '⚡'),
('Вихрь ярости', 'Берсерк вращается, нанося урон всем врагам вокруг себя.', 'aoe', '{"Берсерк"}', 25, 15, 140, 'physical', 'strength', 2.0, '{}', '🌪️'),
('Гнев берсерка', 'Увеличивает физическую силу и скорость атаки, но снижает защиту.', 'buff', '{"Берсерк"}', 20, 25, 0, 'true', 'strength', 1.0, '{"strength_boost", "attack_speed_boost", "defense_reduction"}', '😡'),
('Кожа камня', 'Увеличивает броню и уменьшает получаемый урон на короткое время.', 'barrier', '{"Берсерк"}', 30, 40, 0, 'true', 'strength', 1.0, '{"armor_boost", "damage_reduction"}', '🗿'),
('Кровавый шторм', 'Серия мощных ударов по площади, наносящая урон и восстанавливающая здоровье в зависимости от нанесённого урона.', 'lifesteal', '{"Берсерк"}', 40, 50, 300, 'physical', 'strength', 3.0, '{"lifesteal"}', '🌩️'),

-- Скиллы Ассасина
('Удар в сердце', 'Быстрая атака кинжалом по одной цели.', 'standard', '{"Ассасин"}', 0, 0, 90, 'physical', 'stealth', 1.8, '{}', '🗡️'),
('Теневая вспышка', 'Телепортируется к врагу и наносит усиленный урон.', 'enhanced', '{"Ассасин"}', 20, 12, 160, 'physical', 'stealth', 2.2, '{"teleport"}', '💨'),
('Танец клинков', 'Ассасин стремительно вращается, поражая всех врагов вокруг себя.', 'aoe', '{"Ассасин"}', 35, 18, 110, 'physical', 'agility', 1.6, '{}', '🌀'),
('Тень охотника', 'Повышает скорость передвижения, шанс критического удара и скрытность.', 'buff', '{"Ассасин"}', 25, 30, 0, 'true', 'stealth', 1.0, '{"movement_speed_boost", "crit_chance_boost", "stealth_boost"}', '👤'),
('Дымовая завеса', 'Создаёт дым, уменьшающий точность врагов и шанс попасть по ассасину.', 'barrier', '{"Ассасин"}', 40, 45, 0, 'true', 'stealth', 1.0, '{"evasion_boost", "accuracy_reduction"}', '💨'),
('Ритуал крови', 'Серия ударов по площади с возвратом здоровья за нанесённый урон.', 'lifesteal', '{"Ассасин"}', 45, 55, 180, 'physical', 'stealth', 2.8, '{"lifesteal"}', '🩸');

-- Insert basic locations
INSERT INTO locations (name, description, level_requirement, icon) VALUES
('Новобранский лагерь', 'Тихий лагерь для начинающих искателей приключений.', 1, '🏕️'),
('Лес теней', 'Мрачный лес, полный опасных существ.', 5, '🌲'),
('Пещеры дракона', 'Глубокие пещеры, где обитают древние драконы.', 10, '🐉'),
('Замок тьмы', 'Проклятый замок, полный нежити.', 15, '🏰');

-- Insert basic farming spots
INSERT INTO farming_spots (location_id, name, description, level_requirement, icon) VALUES
((SELECT id FROM locations WHERE name = 'Новобранский лагерь'), 'Тренировочные манекены', 'Безопасное место для отработки навыков.', 1, '🥅'),
((SELECT id FROM locations WHERE name = 'Лес теней'), 'Логово волков', 'Опасные волки-оборотни.', 5, '🐺'),
((SELECT id FROM locations WHERE name = 'Лес теней'), 'Роща эльфов', 'Загадочные лесные эльфы.', 7, '🧝'),
((SELECT id FROM locations WHERE name = 'Пещеры дракона'), 'Молодые драконы', 'Молодые, но все еще опасные драконы.', 10, '🐲'),
((SELECT id FROM locations WHERE name = 'Замок тьмы'), 'Палаты нежити', 'Комнаты, полные скелетов и зомби.', 15, '💀');
