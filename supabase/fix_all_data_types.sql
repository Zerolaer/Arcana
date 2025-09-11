-- Полное исправление типов данных
-- Исправляет все проблемы с типами INTEGER/DECIMAL

-- 1. Исправляем все статы на DECIMAL
ALTER TABLE characters 
ALTER COLUMN strength TYPE DECIMAL(10,2),
ALTER COLUMN agility TYPE DECIMAL(10,2),
ALTER COLUMN intelligence TYPE DECIMAL(10,2),
ALTER COLUMN endurance TYPE DECIMAL(10,2),
ALTER COLUMN spell_power TYPE DECIMAL(10,2),
ALTER COLUMN precision TYPE DECIMAL(10,2),
ALTER COLUMN evasion TYPE DECIMAL(10,2),
ALTER COLUMN stealth TYPE DECIMAL(10,2),
ALTER COLUMN dodge_chance TYPE DECIMAL(10,2),
ALTER COLUMN stealth_bonus TYPE DECIMAL(10,2);

-- 2. Исправляем HP/MP на DECIMAL
ALTER TABLE characters 
ALTER COLUMN health TYPE DECIMAL(10,2),
ALTER COLUMN max_health TYPE DECIMAL(10,2),
ALTER COLUMN mana TYPE DECIMAL(10,2),
ALTER COLUMN max_mana TYPE DECIMAL(10,2),
ALTER COLUMN health_regen TYPE DECIMAL(10,2),
ALTER COLUMN mana_regen TYPE DECIMAL(10,2);

-- 3. Исправляем другие числовые поля
ALTER TABLE characters 
ALTER COLUMN experience TYPE DECIMAL(15,2),
ALTER COLUMN experience_to_next TYPE DECIMAL(15,2),
ALTER COLUMN gold TYPE DECIMAL(15,2);

-- 4. Устанавливаем значения по умолчанию для статов
ALTER TABLE characters 
ALTER COLUMN strength SET DEFAULT 0.0,
ALTER COLUMN agility SET DEFAULT 0.0,
ALTER COLUMN intelligence SET DEFAULT 0.0,
ALTER COLUMN endurance SET DEFAULT 0.0,
ALTER COLUMN spell_power SET DEFAULT 0.0,
ALTER COLUMN precision SET DEFAULT 0.0,
ALTER COLUMN evasion SET DEFAULT 0.0,
ALTER COLUMN stealth SET DEFAULT 0.0,
ALTER COLUMN dodge_chance SET DEFAULT 0.0,
ALTER COLUMN stealth_bonus SET DEFAULT 0.0;

-- 5. Устанавливаем значения по умолчанию для HP/MP
ALTER TABLE characters 
ALTER COLUMN health SET DEFAULT 100.0,
ALTER COLUMN max_health SET DEFAULT 100.0,
ALTER COLUMN mana SET DEFAULT 50.0,
ALTER COLUMN max_mana SET DEFAULT 50.0,
ALTER COLUMN health_regen SET DEFAULT 1.0,
ALTER COLUMN mana_regen SET DEFAULT 1.0;

-- 6. Устанавливаем значения по умолчанию для опыта и золота
ALTER TABLE characters 
ALTER COLUMN experience SET DEFAULT 0.0,
ALTER COLUMN experience_to_next SET DEFAULT 55.0,
ALTER COLUMN gold SET DEFAULT 100.0;

-- 7. Обновляем существующие записи
UPDATE characters SET 
    strength = COALESCE(strength, 0.0),
    agility = COALESCE(agility, 0.0),
    intelligence = COALESCE(intelligence, 0.0),
    endurance = COALESCE(endurance, 0.0),
    spell_power = COALESCE(spell_power, 0.0),
    precision = COALESCE(precision, 0.0),
    evasion = COALESCE(evasion, 0.0),
    stealth = COALESCE(stealth, 0.0),
    dodge_chance = COALESCE(dodge_chance, 0.0),
    stealth_bonus = COALESCE(stealth_bonus, 0.0),
    health = COALESCE(health, 100.0),
    max_health = COALESCE(max_health, 100.0),
    mana = COALESCE(mana, 50.0),
    max_mana = COALESCE(max_mana, 50.0),
    health_regen = COALESCE(health_regen, 1.0),
    mana_regen = COALESCE(mana_regen, 1.0),
    experience = COALESCE(experience, 0.0),
    experience_to_next = COALESCE(experience_to_next, 55.0),
    gold = COALESCE(gold, 100.0);

-- 8. Проверяем результат
SELECT 'ПРОВЕРКА ВСЕХ ТИПОВ:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'characters'
AND column_name IN (
    'strength', 'agility', 'intelligence', 'endurance', 'spell_power',
    'precision', 'evasion', 'stealth', 'dodge_chance', 'stealth_bonus',
    'health', 'max_health', 'mana', 'max_mana', 
    'health_regen', 'mana_regen', 'experience', 'experience_to_next', 'gold'
)
ORDER BY ordinal_position;

-- 9. Показываем текущие значения
SELECT 'ТЕКУЩИЕ ЗНАЧЕНИЯ:' as info;

SELECT 
    name,
    level,
    health,
    max_health,
    mana,
    max_mana,
    health_regen,
    mana_regen,
    gold
FROM characters
ORDER BY name;

SELECT '✅ ВСЕ ТИПЫ ДАННЫХ ИСПРАВЛЕНЫ!' as result;
