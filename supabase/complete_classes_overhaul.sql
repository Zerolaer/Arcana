-- Полный пересбор системы классов
-- ВНИМАНИЕ: Этот скрипт удалит все данные о персонажах и классах!

-- Отключаем проверки внешних ключей временно
SET session_replication_role = replica;

-- Удаляем все старые данные и таблицы
DROP TABLE IF EXISTS character_skills CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS subclasses CASCADE;
DROP TABLE IF EXISTS character_classes CASCADE;

-- Удаляем старые колонки из characters
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

-- Включаем проверки внешних ключей обратно
SET session_replication_role = DEFAULT;

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
    primary_stats TEXT[] NOT NULL,
    
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
    scaling_stat TEXT NOT NULL CHECK (scaling_stat IN ('agility', 'precision', 'evasion', 'intelligence', 'spell_power', 'strength', 'endurance', 'armor', 'stealth', 'resistance')),
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

-- Добавляем новые колонки в characters
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

-- Обновляем значения по умолчанию для существующих колонок
ALTER TABLE characters 
ALTER COLUMN strength SET DEFAULT 10,
ALTER COLUMN intelligence SET DEFAULT 10;

-- Вставляем новые классы
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
    '🪄',
    '{"intelligence", "spell_power", "resistance"}'),

-- Берсерк
('Берсерк', 'Дикий воин, жертвующий защитой ради огромного урона. Высокая скорость атаки и выносливость.',
    15, 12, 8, 5, 3, 6, 25, 22, 18, 3,
    1.5, 1.2, 0.8, 0.5, 0.3, 0.6, 2.5, 2.2, 1.8, 0.3,
    '{"Мощный удар", "Рассекающий взмах", "Вихрь ярости", "Гнев берсерка", "Кожа камня", "Кровавый шторм"}',
    '⚔️',
    '{"strength", "endurance", "armor"}'),

-- Ассасин
('Ассасин', 'Мастер скрытности и критических ударов. Высокая скорость и шанс критического урона.',
    22, 18, 20, 10, 8, 8, 15, 12, 10, 25,
    2.2, 1.8, 2.0, 1.0, 0.8, 0.8, 1.5, 1.2, 1.0, 2.5,
    '{"Удар в сердце", "Теневая вспышка", "Танец клинков", "Тень охотника", "Дымовая завеса", "Ритуал крови"}',
    '🗡️',
    '{"agility", "stealth", "precision"}');

-- Вставляем скиллы для всех классов

-- Скиллы Лучника
INSERT INTO skills (name, description, skill_type, required_class, mana_cost, cooldown, base_damage, damage_type, scaling_stat, scaling_ratio, special_effects, icon) VALUES
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

-- Обновляем существующих персонажей (устанавливаем базовые значения для новых характеристик)
UPDATE characters SET 
    agility = 10,
    precision = 10,
    evasion = 10,
    spell_power = 10,
    resistance = 10,
    endurance = 10,
    armor = 10,
    stealth = 10,
    accuracy = 85.0
WHERE agility IS NULL;

-- Функция для обновления характеристик персонажа при создании
CREATE OR REPLACE FUNCTION update_character_stats_on_create()
RETURNS TRIGGER AS $$
DECLARE
    class_data character_classes%ROWTYPE;
BEGIN
    -- Получаем данные класса
    SELECT * INTO class_data FROM character_classes WHERE id = NEW.class_id;
    
    -- Устанавливаем базовые характеристики класса
    NEW.agility = class_data.base_agility;
    NEW.precision = class_data.base_precision;
    NEW.evasion = class_data.base_evasion;
    NEW.intelligence = class_data.base_intelligence;
    NEW.spell_power = class_data.base_spell_power;
    NEW.resistance = class_data.base_resistance;
    NEW.strength = class_data.base_strength;
    NEW.endurance = class_data.base_endurance;
    NEW.armor = class_data.base_armor;
    NEW.stealth = class_data.base_stealth;
    
    -- Устанавливаем базовое здоровье и ману
    NEW.max_health = 100 + (NEW.endurance * 15);
    NEW.max_mana = 50 + (NEW.intelligence * 8);
    NEW.health = NEW.max_health;
    NEW.mana = NEW.max_mana;
    
    -- Рассчитываем боевые характеристики
    NEW.attack_damage = (NEW.strength * 2.5) + (NEW.agility * 1.5);
    NEW.magic_damage = (NEW.spell_power * 3.0) + (NEW.intelligence * 1.0);
    NEW.defense = (NEW.armor * 2.0) + (NEW.endurance * 1.0);
    NEW.magic_resistance = NEW.resistance * 2.5;
    NEW.critical_chance = 5.0 + (NEW.agility * 0.15);
    NEW.critical_damage = 150.0 + (NEW.strength * 0.8);
    NEW.attack_speed = 100.0 + (NEW.agility * 1.2);
    NEW.accuracy = 85.0 + (NEW.precision * 1.0);
    NEW.health_regen = 1.0 + (NEW.endurance * 0.1);
    NEW.mana_regen = 1.0 + (NEW.intelligence * 0.1);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического обновления характеристик при создании персонажа
DROP TRIGGER IF EXISTS character_stats_update_trigger ON characters;
CREATE TRIGGER character_stats_update_trigger
    BEFORE INSERT ON characters
    FOR EACH ROW
    EXECUTE FUNCTION update_character_stats_on_create();
