-- Новая упрощенная система классов
-- Удаляем старые таблицы и создаем новые

-- Удаляем старые таблицы
DROP TABLE IF EXISTS character_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS subclasses CASCADE;
DROP TABLE IF EXISTS character_classes CASCADE;

-- Создаем новую таблицу классов
CREATE TABLE character_classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    
    -- Базовые характеристики класса
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
    
    -- Прирост характеристик за уровень
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
    
    -- Начальные скиллы
    starting_skills TEXT[] DEFAULT '{}',
    
    icon TEXT NOT NULL,
    primary_stats TEXT[] NOT NULL, -- Основные статы для класса
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создаем новую таблицу скиллов
CREATE TABLE skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    skill_type TEXT NOT NULL CHECK (skill_type IN ('standard', 'enhanced', 'aoe', 'buff', 'barrier', 'lifesteal')),
    
    -- Требования
    required_level INTEGER DEFAULT 1,
    required_class TEXT[] DEFAULT NULL,
    
    -- Стоимость ресурсов
    mana_cost INTEGER DEFAULT 0,
    cooldown INTEGER DEFAULT 0,
    
    -- Базовый урон/эффекты
    base_damage INTEGER DEFAULT 0,
    damage_type TEXT NOT NULL CHECK (damage_type IN ('physical', 'magical', 'true')),
    scaling_stat TEXT NOT NULL CHECK (scaling_stat IN ('agility', 'precision', 'intelligence', 'spell_power', 'strength', 'stealth')),
    scaling_ratio DECIMAL(3,2) DEFAULT 1.0,
    
    -- Специальные эффекты
    special_effects TEXT[] DEFAULT NULL,
    
    icon TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Создаем новую таблицу скиллов персонажей
CREATE TABLE character_skills (
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    
    -- Рассчитанные значения
    damage INTEGER DEFAULT 0,
    cooldown INTEGER DEFAULT 0,
    mana_cost INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (character_id, skill_id)
);

-- Обновляем таблицу персонажей под новую систему
ALTER TABLE characters 
DROP COLUMN IF EXISTS subclass_id,
DROP COLUMN IF EXISTS dexterity,
DROP COLUMN IF EXISTS vitality,
DROP COLUMN IF EXISTS energy,
DROP COLUMN IF EXISTS luck,
DROP COLUMN IF EXISTS stamina,
DROP COLUMN IF EXISTS max_stamina,
DROP COLUMN IF EXISTS movement_speed,
DROP COLUMN IF EXISTS stamina_regen,
DROP COLUMN IF EXISTS skill_points;

-- Добавляем новые колонки
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS agility INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS precision INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS evasion INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS spell_power INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS resistance INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS endurance INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS armor INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS stealth INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS accuracy DECIMAL(5,2) DEFAULT 85.0;

-- Обновляем ограничения
ALTER TABLE characters 
ALTER COLUMN strength SET DEFAULT 10,
ALTER COLUMN intelligence SET DEFAULT 10;

