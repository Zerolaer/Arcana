-- ДОБАВЛЕНИЕ НОВЫХ ХАРАКТЕРИСТИК В ТАБЛИЦУ CHARACTERS
-- Добавляем dodge_chance и stealth_bonus

-- 1. Добавляем новые колонки в таблицу characters
ALTER TABLE characters 
ADD COLUMN IF NOT EXISTS dodge_chance DECIMAL(5,2) DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS stealth_bonus DECIMAL(5,2) DEFAULT 0.0;

-- 2. Обновляем существующих персонажей базовыми значениями
UPDATE characters 
SET 
    dodge_chance = 5.0,
    stealth_bonus = 0.0
WHERE dodge_chance IS NULL OR stealth_bonus IS NULL;

-- 3. Проверяем что колонки добавлены
SELECT '=== НОВЫЕ КОЛОНКИ В CHARACTERS ===' as info;
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'characters' 
AND column_name IN ('dodge_chance', 'stealth_bonus')
ORDER BY column_name;

-- 4. Проверяем данные
SELECT '=== ДАННЫЕ ПЕРСОНАЖЕЙ ===' as info;
SELECT 
    name,
    level,
    evasion,
    stealth,
    dodge_chance,
    stealth_bonus
FROM characters 
ORDER BY name;
