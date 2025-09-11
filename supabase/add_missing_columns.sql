-- Добавление недостающих колонок в таблицы навыков
-- Безопасное добавление только тех колонок, которых нет

-- 1. Добавляем stat_bonuses в passive_skills
ALTER TABLE passive_skills 
ADD COLUMN IF NOT EXISTS stat_bonuses JSONB DEFAULT '{}';

-- 2. Добавляем недостающие колонки в active_skills
ALTER TABLE active_skills 
ADD COLUMN IF NOT EXISTS stat_bonuses JSONB DEFAULT '{}';

ALTER TABLE active_skills 
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '⚔️';

ALTER TABLE active_skills 
ADD COLUMN IF NOT EXISTS skill_type TEXT DEFAULT 'attack';

ALTER TABLE active_skills 
ADD COLUMN IF NOT EXISTS damage_type TEXT DEFAULT 'physical';

ALTER TABLE active_skills 
ADD COLUMN IF NOT EXISTS base_damage INTEGER DEFAULT 0;

ALTER TABLE active_skills 
ADD COLUMN IF NOT EXISTS mana_cost INTEGER DEFAULT 0;

ALTER TABLE active_skills 
ADD COLUMN IF NOT EXISTS cooldown INTEGER DEFAULT 0;

ALTER TABLE active_skills 
ADD COLUMN IF NOT EXISTS scaling_stat TEXT DEFAULT 'strength';

ALTER TABLE active_skills 
ADD COLUMN IF NOT EXISTS scaling_ratio DECIMAL(3,2) DEFAULT 1.0;

-- 3. Обновляем существующие записи
UPDATE passive_skills SET stat_bonuses = '{}' WHERE stat_bonuses IS NULL;
UPDATE active_skills SET stat_bonuses = '{}' WHERE stat_bonuses IS NULL;

-- 4. Проверяем результат
SELECT 'РЕЗУЛЬТАТ ДОБАВЛЕНИЯ КОЛОНОК:' as info;

SELECT 'passive_skills колонки:' as table_name;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'passive_skills'
ORDER BY ordinal_position;

SELECT 'active_skills колонки:' as table_name;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'active_skills'
ORDER BY ordinal_position;

SELECT '✅ КОЛОНКИ ДОБАВЛЕНЫ!' as result;
