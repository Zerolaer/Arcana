-- Проверка системы регенерации
-- Проверяем что HP и MP восстанавливаются правильно

-- 1. Проверяем текущие значения HP/MP у персонажей
SELECT 'ТЕКУЩИЕ HP/MP:' as info;

SELECT 
    name,
    level,
    health,
    max_health,
    mana,
    max_mana,
    health_regen,
    mana_regen
FROM characters
ORDER BY name;

-- 2. Проверяем типы колонок HP/MP
SELECT 'ТИПЫ КОЛОНОК HP/MP:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'characters'
AND column_name IN (
    'health', 'max_health', 'mana', 'max_mana', 
    'health_regen', 'mana_regen'
)
ORDER BY ordinal_position;

-- 3. Исправляем типы колонок HP/MP на DECIMAL
ALTER TABLE characters 
ALTER COLUMN health TYPE DECIMAL(10,2),
ALTER COLUMN max_health TYPE DECIMAL(10,2),
ALTER COLUMN mana TYPE DECIMAL(10,2),
ALTER COLUMN max_mana TYPE DECIMAL(10,2),
ALTER COLUMN health_regen TYPE DECIMAL(10,2),
ALTER COLUMN mana_regen TYPE DECIMAL(10,2);

-- 4. Устанавливаем значения по умолчанию
ALTER TABLE characters 
ALTER COLUMN health SET DEFAULT 100.0,
ALTER COLUMN max_health SET DEFAULT 100.0,
ALTER COLUMN mana SET DEFAULT 50.0,
ALTER COLUMN max_mana SET DEFAULT 50.0,
ALTER COLUMN health_regen SET DEFAULT 1.0,
ALTER COLUMN mana_regen SET DEFAULT 1.0;

-- 5. Обновляем существующие записи
UPDATE characters SET 
    health = COALESCE(health, 100.0),
    max_health = COALESCE(max_health, 100.0),
    mana = COALESCE(mana, 50.0),
    max_mana = COALESCE(max_mana, 50.0),
    health_regen = COALESCE(health_regen, 1.0),
    mana_regen = COALESCE(mana_regen, 1.0);

-- 6. Проверяем результат
SELECT 'РЕЗУЛЬТАТ ИСПРАВЛЕНИЯ:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'characters'
AND column_name IN (
    'health', 'max_health', 'mana', 'max_mana', 
    'health_regen', 'mana_regen'
)
ORDER BY ordinal_position;

-- 7. Показываем обновленные значения
SELECT 'ОБНОВЛЕННЫЕ HP/MP:' as info;

SELECT 
    name,
    health,
    max_health,
    mana,
    max_mana,
    health_regen,
    mana_regen
FROM characters
ORDER BY name;

SELECT '✅ СИСТЕМА РЕГЕНЕРАЦИИ ИСПРАВЛЕНА!' as result;
