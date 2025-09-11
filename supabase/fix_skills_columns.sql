-- Исправление колонок в таблицах навыков
-- Добавляем недостающие колонки

-- 1. Добавляем stat_bonuses в passive_skills если её нет
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'passive_skills' 
        AND column_name = 'stat_bonuses'
    ) THEN
        ALTER TABLE passive_skills ADD COLUMN stat_bonuses JSONB DEFAULT '{}';
    END IF;
END $$;

-- 2. Добавляем stat_bonuses в active_skills если её нет
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'active_skills' 
        AND column_name = 'stat_bonuses'
    ) THEN
        ALTER TABLE active_skills ADD COLUMN stat_bonuses JSONB DEFAULT '{}';
    END IF;
END $$;

-- 3. Добавляем недостающие колонки в active_skills
DO $$ 
BEGIN
    -- Добавляем icon если нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'active_skills' 
        AND column_name = 'icon'
    ) THEN
        ALTER TABLE active_skills ADD COLUMN icon TEXT DEFAULT '⚔️';
    END IF;
    
    -- Добавляем skill_type если нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'active_skills' 
        AND column_name = 'skill_type'
    ) THEN
        ALTER TABLE active_skills ADD COLUMN skill_type TEXT DEFAULT 'attack';
    END IF;
    
    -- Добавляем damage_type если нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'active_skills' 
        AND column_name = 'damage_type'
    ) THEN
        ALTER TABLE active_skills ADD COLUMN damage_type TEXT DEFAULT 'physical';
    END IF;
    
    -- Добавляем base_damage если нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'active_skills' 
        AND column_name = 'base_damage'
    ) THEN
        ALTER TABLE active_skills ADD COLUMN base_damage INTEGER DEFAULT 0;
    END IF;
    
    -- Добавляем mana_cost если нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'active_skills' 
        AND column_name = 'mana_cost'
    ) THEN
        ALTER TABLE active_skills ADD COLUMN mana_cost INTEGER DEFAULT 0;
    END IF;
    
    -- Добавляем cooldown если нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'active_skills' 
        AND column_name = 'cooldown'
    ) THEN
        ALTER TABLE active_skills ADD COLUMN cooldown INTEGER DEFAULT 0;
    END IF;
    
    -- Добавляем scaling_stat если нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'active_skills' 
        AND column_name = 'scaling_stat'
    ) THEN
        ALTER TABLE active_skills ADD COLUMN scaling_stat TEXT DEFAULT 'strength';
    END IF;
    
    -- Добавляем scaling_ratio если нет
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'active_skills' 
        AND column_name = 'scaling_ratio'
    ) THEN
        ALTER TABLE active_skills ADD COLUMN scaling_ratio DECIMAL(3,2) DEFAULT 1.0;
    END IF;
END $$;

-- 4. Обновляем существующие записи с дефолтными значениями
UPDATE passive_skills SET stat_bonuses = '{}' WHERE stat_bonuses IS NULL;
UPDATE active_skills SET stat_bonuses = '{}' WHERE stat_bonuses IS NULL;

-- 5. Проверяем что все колонки добавлены
SELECT 'ПРОВЕРКА КОЛОНОК:' as test_section;

SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('passive_skills', 'active_skills')
ORDER BY table_name, column_name;

SELECT '✅ КОЛОНКИ ИСПРАВЛЕНЫ!' as result;
