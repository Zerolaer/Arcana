-- Исправление типов данных для статов
-- Проблема: система пытается записать десятичные числа в INTEGER поля

-- 1. Проверяем текущие типы колонок в таблице characters
SELECT 'ТИПЫ КОЛОНОК В characters:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'characters'
AND column_name IN (
    'strength', 'agility', 'intelligence', 'endurance', 'spell_power',
    'precision', 'evasion', 'stealth', 'dodge_chance', 'stealth_bonus'
)
ORDER BY ordinal_position;

-- 2. Изменяем типы колонок на DECIMAL для поддержки десятичных значений
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

-- 3. Устанавливаем значения по умолчанию
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

-- 4. Обновляем существующие записи (если есть NULL значения)
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
    stealth_bonus = COALESCE(stealth_bonus, 0.0);

-- 5. Проверяем результат
SELECT 'ПРОВЕРКА ИЗМЕНЕНИЙ:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'characters'
AND column_name IN (
    'strength', 'agility', 'intelligence', 'endurance', 'spell_power',
    'precision', 'evasion', 'stealth', 'dodge_chance', 'stealth_bonus'
)
ORDER BY ordinal_position;

-- 6. Показываем текущие значения статов
SELECT 'ТЕКУЩИЕ ЗНАЧЕНИЯ СТАТОВ:' as info;

SELECT 
    name,
    level,
    strength,
    agility,
    intelligence,
    endurance,
    spell_power,
    precision,
    evasion,
    stealth,
    dodge_chance,
    stealth_bonus
FROM characters
ORDER BY name;

SELECT '✅ ТИПЫ СТАТОВ ИСПРАВЛЕНЫ!' as result;
