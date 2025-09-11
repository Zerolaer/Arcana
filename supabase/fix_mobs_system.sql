-- ИСПРАВЛЕНИЕ СИСТЕМЫ МОБОВ
-- 1. Убираем лут-таблицы (у нас нет предметов)
-- 2. Исправляем опыт мобов

-- 1. Удаляем все лут-таблицы и связанные данные
DELETE FROM loot_drops;
DELETE FROM loot_tables;

-- 2. Убираем ссылки на лут-таблицы у мобов
ALTER TABLE mobs DROP COLUMN IF EXISTS loot_table_id;

-- 3. Исправляем опыт мобов согласно новой системе уровней
-- Формула: базовый опыт = уровень * 8 + (уровень * уровень * 0.5)
-- Это даст разумные значения для новой системы опыта

UPDATE mobs SET 
    experience_reward = CASE 
        WHEN level = 1 THEN 12
        WHEN level = 2 THEN 18
        WHEN level = 3 THEN 26
        WHEN level = 4 THEN 36
        WHEN level = 5 THEN 48
        WHEN level = 6 THEN 62
        WHEN level = 7 THEN 78
        WHEN level = 8 THEN 96
        WHEN level = 9 THEN 116
        WHEN level = 10 THEN 138
        WHEN level = 11 THEN 162
        WHEN level = 12 THEN 188
        WHEN level = 13 THEN 216
        WHEN level = 14 THEN 246
        WHEN level = 15 THEN 278
        WHEN level = 16 THEN 312
        WHEN level = 17 THEN 348
        WHEN level = 18 THEN 386
        WHEN level = 19 THEN 426
        WHEN level = 20 THEN 468
        ELSE (level * 8) + (level * level * 0.5)
    END
WHERE id IS NOT NULL;

-- 4. Проверяем результат
SELECT 
    '=== ИСПРАВЛЕННЫЕ МОБЫ ===' as info;

SELECT 
    name,
    level,
    health,
    attack_damage,
    experience_reward,
    gold_reward,
    image
FROM mobs 
ORDER BY level, name;

-- 5. Проверяем что лут-таблицы удалены
SELECT 
    '=== ПРОВЕРКА УДАЛЕНИЯ ЛУТ-ТАБЛИЦ ===' as info;

SELECT COUNT(*) as loot_tables_count FROM loot_tables;
SELECT COUNT(*) as loot_drops_count FROM loot_drops;

SELECT '✅ СИСТЕМА МОБОВ ИСПРАВЛЕНА!' as result;
