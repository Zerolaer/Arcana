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
    
    -- Base stats
    base_strength INTEGER DEFAULT 10,
    base_dexterity INTEGER DEFAULT 10,
    base_intelligence INTEGER DEFAULT 10,
    base_vitality INTEGER DEFAULT 10,
    base_energy INTEGER DEFAULT 10,
    base_luck INTEGER DEFAULT 10,
    
    -- Stat growth per level
    strength_per_level DECIMAL(3,1) DEFAULT 1.0,
    dexterity_per_level DECIMAL(3,1) DEFAULT 1.0,
    intelligence_per_level DECIMAL(3,1) DEFAULT 1.0,
    vitality_per_level DECIMAL(3,1) DEFAULT 1.0,
    energy_per_level DECIMAL(3,1) DEFAULT 1.0,
    luck_per_level DECIMAL(3,1) DEFAULT 1.0,
    
    -- Starting skills
    starting_skills TEXT[] DEFAULT '{}',
    
    -- UI
    icon TEXT NOT NULL,
    primary_stat TEXT NOT NULL CHECK (primary_stat IN ('strength', 'dexterity', 'intelligence', 'vitality', 'energy')),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subclasses table
CREATE TABLE IF NOT EXISTS subclasses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_id UUID REFERENCES character_classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    required_level INTEGER DEFAULT 100,
    
    -- Additional stat bonuses
    bonus_strength INTEGER DEFAULT 0,
    bonus_dexterity INTEGER DEFAULT 0,
    bonus_intelligence INTEGER DEFAULT 0,
    bonus_vitality INTEGER DEFAULT 0,
    bonus_energy INTEGER DEFAULT 0,
    bonus_luck INTEGER DEFAULT 0,
    
    -- Unique skills
    unique_skills TEXT[] DEFAULT '{}',
    
    -- UI
    icon TEXT NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(class_id, name)
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    skill_type TEXT NOT NULL CHECK (skill_type IN ('active', 'passive', 'aoe')),
    
    -- Requirements
    required_level INTEGER DEFAULT 1,
    required_class TEXT[],
    
    -- Resource costs
    mana_cost INTEGER DEFAULT 0,
    stamina_cost INTEGER DEFAULT 0,
    cooldown INTEGER DEFAULT 0, -- in seconds
    
    -- Base damage/effects
    base_damage INTEGER DEFAULT 0,
    damage_type TEXT NOT NULL CHECK (damage_type IN ('physical', 'magical', 'true')),
    scaling_stat TEXT NOT NULL CHECK (scaling_stat IN ('strength', 'dexterity', 'intelligence')),
    scaling_ratio DECIMAL(4,2) DEFAULT 1.0,
    
    -- Available nodes
    available_nodes TEXT[] DEFAULT '{}',
    
    -- UI
    icon TEXT NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Skill nodes table
CREATE TABLE IF NOT EXISTS skill_nodes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Effects
    damage_multiplier DECIMAL(4,2) DEFAULT 1.0,
    cooldown_reduction INTEGER DEFAULT 0,
    mana_cost_reduction INTEGER DEFAULT 0,
    additional_effects TEXT[] DEFAULT '{}',
    
    -- UI
    icon TEXT NOT NULL,
    
    UNIQUE(skill_id, name)
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    
    -- Level requirements
    min_level INTEGER DEFAULT 1,
    max_level INTEGER,
    
    -- Environment effects
    experience_bonus DECIMAL(4,2) DEFAULT 1.0,
    gold_bonus DECIMAL(4,2) DEFAULT 1.0,
    
    -- UI
    image TEXT NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mobs table
CREATE TABLE IF NOT EXISTS mobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Stats
    level INTEGER NOT NULL,
    health INTEGER NOT NULL,
    attack_damage INTEGER NOT NULL,
    defense INTEGER DEFAULT 0,
    magic_resistance INTEGER DEFAULT 0,
    
    -- Behavior
    aggressive BOOLEAN DEFAULT true,
    respawn_time INTEGER DEFAULT 30, -- in seconds
    
    -- Rewards
    experience_reward INTEGER NOT NULL,
    gold_reward INTEGER NOT NULL,
    
    -- Loot
    loot_table_id UUID,
    
    -- UI
    image TEXT NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farming spots table
CREATE TABLE IF NOT EXISTS farming_spots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Occupancy
    max_occupancy INTEGER DEFAULT 1,
    current_occupancy INTEGER DEFAULT 0,
    occupied_by TEXT[] DEFAULT '{}',
    
    -- Drop bonuses
    drop_rate_bonus DECIMAL(4,2) DEFAULT 1.0,
    rare_drop_bonus DECIMAL(4,2) DEFAULT 1.0,
    
    -- Position
    coordinates JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(location_id, name)
);

-- Mob spawns table (junction table for spots and mobs)
CREATE TABLE IF NOT EXISTS mob_spawns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    spot_id UUID REFERENCES farming_spots(id) ON DELETE CASCADE,
    mob_id UUID REFERENCES mobs(id) ON DELETE CASCADE,
    spawn_rate DECIMAL(4,2) DEFAULT 1.0, -- mobs per minute
    max_concurrent INTEGER DEFAULT 1,
    
    UNIQUE(spot_id, mob_id)
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    
    -- Basic properties
    item_type TEXT NOT NULL CHECK (item_type IN ('weapon', 'armor', 'accessory', 'consumable', 'material', 'quest')),
    slot TEXT CHECK (slot IN ('weapon', 'helmet', 'chest', 'legs', 'boots', 'gloves', 'ring', 'amulet')),
    
    -- Rarity and requirements
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic')),
    level_requirement INTEGER DEFAULT 1,
    class_requirement TEXT[],
    
    -- Stat bonuses
    strength_bonus INTEGER DEFAULT 0,
    dexterity_bonus INTEGER DEFAULT 0,
    intelligence_bonus INTEGER DEFAULT 0,
    vitality_bonus INTEGER DEFAULT 0,
    energy_bonus INTEGER DEFAULT 0,
    luck_bonus INTEGER DEFAULT 0,
    
    -- Combat stats
    attack_damage INTEGER DEFAULT 0,
    magic_damage INTEGER DEFAULT 0,
    defense INTEGER DEFAULT 0,
    magic_resistance INTEGER DEFAULT 0,
    
    -- Special effects
    special_effects TEXT[] DEFAULT '{}',
    
    -- Economy
    vendor_price INTEGER DEFAULT 0,
    stack_size INTEGER DEFAULT 1,
    
    -- UI
    icon TEXT NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loot tables
CREATE TABLE IF NOT EXISTS loot_tables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loot drops
CREATE TABLE IF NOT EXISTS loot_drops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    loot_table_id UUID REFERENCES loot_tables(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    drop_rate DECIMAL(5,2) NOT NULL CHECK (drop_rate >= 0 AND drop_rate <= 100),
    quantity_min INTEGER DEFAULT 1,
    quantity_max INTEGER DEFAULT 1,
    level_requirement INTEGER,
    
    UNIQUE(loot_table_id, item_id)
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    class_id UUID REFERENCES character_classes(id),
    subclass_id UUID REFERENCES subclasses(id),
    
    -- Level and experience
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    experience_to_next BIGINT DEFAULT 100,
    
    -- Base stats
    strength INTEGER DEFAULT 10,
    dexterity INTEGER DEFAULT 10,
    intelligence INTEGER DEFAULT 10,
    vitality INTEGER DEFAULT 10,
    energy INTEGER DEFAULT 10,
    luck INTEGER DEFAULT 10,
    
    -- Available points
    stat_points INTEGER DEFAULT 0,
    skill_points INTEGER DEFAULT 1,
    
    -- Current resources
    health INTEGER DEFAULT 100,
    max_health INTEGER DEFAULT 100,
    mana INTEGER DEFAULT 50,
    max_mana INTEGER DEFAULT 50,
    stamina INTEGER DEFAULT 100,
    max_stamina INTEGER DEFAULT 100,
    
    -- Calculated combat stats
    attack_damage INTEGER DEFAULT 0,
    magic_damage INTEGER DEFAULT 0,
    defense INTEGER DEFAULT 0,
    magic_resistance INTEGER DEFAULT 0,
    critical_chance DECIMAL(5,2) DEFAULT 5.0,
    critical_damage DECIMAL(5,2) DEFAULT 150.0,
    attack_speed DECIMAL(5,2) DEFAULT 100.0,
    movement_speed DECIMAL(5,2) DEFAULT 100.0,
    
    -- Economy
    gold BIGINT DEFAULT 100,
    
    -- Location
    current_location_id UUID REFERENCES locations(id),
    current_spot_id UUID REFERENCES farming_spots(id),
    
    -- Status
    is_online BOOLEAN DEFAULT true,
    is_in_combat BOOLEAN DEFAULT false,
    is_afk_farming BOOLEAN DEFAULT false,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(player_id, name)
);

-- Character inventory table
CREATE TABLE IF NOT EXISTS character_inventory (
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    item_id UUID REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    slot_position INTEGER, -- for equipped items
    is_equipped BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (character_id, item_id)
);

-- Character skills table
CREATE TABLE IF NOT EXISTS character_skills (
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    selected_nodes TEXT[] DEFAULT '{}',
    
    -- Calculated values (updated by triggers)
    damage INTEGER DEFAULT 0,
    cooldown INTEGER DEFAULT 0,
    mana_cost INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (character_id, skill_id)
);

-- Combat logs table
CREATE TABLE IF NOT EXISTS combat_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    mob_id UUID REFERENCES mobs(id),
    
    -- Combat details
    damage_dealt INTEGER DEFAULT 0,
    damage_taken INTEGER DEFAULT 0,
    critical_hits INTEGER DEFAULT 0,
    skills_used TEXT[] DEFAULT '{}',
    
    -- Results
    victory BOOLEAN NOT NULL,
    experience_gained INTEGER DEFAULT 0,
    gold_gained INTEGER DEFAULT 0,
    items_dropped TEXT[] DEFAULT '{}',
    
    duration INTEGER DEFAULT 0, -- in seconds
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Game events table (for real-time notifications)
CREATE TABLE IF NOT EXISTS game_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('level_up', 'item_drop', 'death', 'pvp_challenge', 'spot_occupied', 'spot_freed')),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    data JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_character_inventory_updated_at BEFORE UPDATE ON character_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_character_skills_updated_at BEFORE UPDATE ON character_skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to occupy a farming spot
CREATE OR REPLACE FUNCTION occupy_farming_spot(spot_id UUID, character_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    spot_record farming_spots;
    current_chars TEXT[];
BEGIN
    -- Get current spot data
    SELECT * INTO spot_record FROM farming_spots WHERE id = spot_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if spot has space
    IF spot_record.current_occupancy >= spot_record.max_occupancy THEN
        RETURN FALSE;
    END IF;
    
    -- Check if character is already occupying the spot
    IF character_id::TEXT = ANY(spot_record.occupied_by) THEN
        RETURN FALSE;
    END IF;
    
    -- Add character to spot
    current_chars := spot_record.occupied_by || character_id::TEXT;
    
    UPDATE farming_spots 
    SET 
        current_occupancy = current_occupancy + 1,
        occupied_by = current_chars
    WHERE id = spot_id;
    
    -- Update character location
    UPDATE characters 
    SET 
        current_spot_id = spot_id,
        updated_at = NOW()
    WHERE characters.id = character_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to leave a farming spot
CREATE OR REPLACE FUNCTION leave_farming_spot(spot_id UUID, character_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    spot_record farming_spots;
    current_chars TEXT[];
BEGIN
    -- Get current spot data
    SELECT * INTO spot_record FROM farming_spots WHERE id = spot_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if character is occupying the spot
    IF NOT (character_id::TEXT = ANY(spot_record.occupied_by)) THEN
        RETURN FALSE;
    END IF;
    
    -- Remove character from spot
    current_chars := array_remove(spot_record.occupied_by, character_id::TEXT);
    
    UPDATE farming_spots 
    SET 
        current_occupancy = current_occupancy - 1,
        occupied_by = current_chars
    WHERE id = spot_id;
    
    -- Update character location
    UPDATE characters 
    SET 
        current_spot_id = NULL,
        updated_at = NOW()
    WHERE characters.id = character_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate experience needed for next level
CREATE OR REPLACE FUNCTION calculate_experience_to_next(current_level INTEGER)
RETURNS BIGINT AS $$
BEGIN
    -- Exponential growth formula: 100 * level^2.2
    RETURN FLOOR(100 * POWER(current_level + 1, 2.2));
END;
$$ LANGUAGE plpgsql;

-- Function to level up character
CREATE OR REPLACE FUNCTION level_up_character(character_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    char_record characters;
    new_level INTEGER;
    stats_per_level INTEGER := 5;
    skill_points_per_level INTEGER := 1;
BEGIN
    -- Get character data
    SELECT * INTO char_record FROM characters WHERE id = character_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check if character has enough experience
    IF char_record.experience < char_record.experience_to_next THEN
        RETURN FALSE;
    END IF;
    
    new_level := char_record.level + 1;
    
    -- Update character
    UPDATE characters 
    SET 
        level = new_level,
        experience = experience - experience_to_next,
        experience_to_next = calculate_experience_to_next(new_level),
        stat_points = stat_points + stats_per_level,
        skill_points = skill_points + skill_points_per_level,
        updated_at = NOW()
    WHERE id = character_id;
    
    -- Create level up event
    INSERT INTO game_events (type, character_id, data)
    VALUES ('level_up', character_id, json_build_object('new_level', new_level));
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) Policies
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE combat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- Players can only access their own data
CREATE POLICY "Users can view own player data" ON players
    FOR ALL USING (auth.uid() = id);

-- Characters can only be accessed by their owners
CREATE POLICY "Users can view own characters" ON characters
    FOR ALL USING (auth.uid() = player_id);

-- Inventory can only be accessed by character owner
CREATE POLICY "Users can view own character inventory" ON character_inventory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM characters 
            WHERE characters.id = character_inventory.character_id 
            AND characters.player_id = auth.uid()
        )
    );

-- Skills can only be accessed by character owner
CREATE POLICY "Users can view own character skills" ON character_skills
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM characters 
            WHERE characters.id = character_skills.character_id 
            AND characters.player_id = auth.uid()
        )
    );

-- Combat logs can only be accessed by character owner
CREATE POLICY "Users can view own combat logs" ON combat_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM characters 
            WHERE characters.id = combat_logs.character_id 
            AND characters.player_id = auth.uid()
        )
    );

-- Game events can only be accessed by character owner
CREATE POLICY "Users can view own game events" ON game_events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM characters 
            WHERE characters.id = game_events.character_id 
            AND characters.player_id = auth.uid()
        )
    );

-- Create partial unique index for equipment slots
CREATE UNIQUE INDEX IF NOT EXISTS idx_character_inventory_equipped_slot 
ON character_inventory (character_id, slot_position) 
WHERE is_equipped = true AND slot_position IS NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_characters_player_id ON characters(player_id);
CREATE INDEX IF NOT EXISTS idx_characters_class_id ON characters(class_id);
CREATE INDEX IF NOT EXISTS idx_characters_location_id ON characters(current_location_id);
CREATE INDEX IF NOT EXISTS idx_characters_spot_id ON characters(current_spot_id);
CREATE INDEX IF NOT EXISTS idx_character_inventory_character_id ON character_inventory(character_id);
CREATE INDEX IF NOT EXISTS idx_character_inventory_item_id ON character_inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_character_skills_character_id ON character_skills(character_id);
CREATE INDEX IF NOT EXISTS idx_farming_spots_location_id ON farming_spots(location_id);
CREATE INDEX IF NOT EXISTS idx_mob_spawns_spot_id ON mob_spawns(spot_id);
CREATE INDEX IF NOT EXISTS idx_combat_logs_character_id ON combat_logs(character_id);
CREATE INDEX IF NOT EXISTS idx_game_events_character_id ON game_events(character_id);
CREATE INDEX IF NOT EXISTS idx_game_events_timestamp ON game_events(timestamp DESC);
