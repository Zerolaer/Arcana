-- =====================================================
-- МИГРАЦИЯ К СИСТЕМЕ ПРЕДМЕТОВ С КАЧЕСТВОМ
-- =====================================================
-- Этот скрипт полностью переводит систему на новую архитектуру
-- ВНИМАНИЕ: Все данные будут удалены!

-- =====================================================
-- ШАГ 1: СОЗДАНИЕ РЕЗЕРВНОЙ КОПИИ (опционально)
-- =====================================================

-- Создаем резервные таблицы (если нужно)
-- CREATE TABLE character_inventory_backup AS SELECT * FROM character_inventory;
-- CREATE TABLE character_equipment_backup AS SELECT * FROM character_equipment;
-- CREATE TABLE items_backup AS SELECT * FROM items;

-- =====================================================
-- ШАГ 2: ОЧИСТКА СТАРЫХ ДАННЫХ
-- =====================================================

-- Удаляем все старые данные
DELETE FROM character_inventory;
DELETE FROM character_equipment;
DELETE FROM items;

-- =====================================================
-- ШАГ 3: ОБНОВЛЕНИЕ СТРУКТУРЫ ТАБЛИЦ
-- =====================================================

-- Удаляем старые ограничения
ALTER TABLE character_inventory 
DROP CONSTRAINT IF EXISTS character_inventory_item_id_fkey;

-- Изменяем тип item_id с UUID на VARCHAR(50)
ALTER TABLE character_inventory 
ALTER COLUMN item_id TYPE VARCHAR(50) USING item_id::text;

-- Добавляем поля для новой системы качества
ALTER TABLE character_inventory 
ADD COLUMN IF NOT EXISTS quality DECIMAL(5,2) DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS actual_stats JSONB,
ADD COLUMN IF NOT EXISTS value INTEGER;

-- Обновляем character_equipment аналогично
ALTER TABLE character_equipment 
DROP CONSTRAINT IF EXISTS character_equipment_item_id_fkey;

ALTER TABLE character_equipment 
ALTER COLUMN item_id TYPE VARCHAR(50) USING item_id::text;

ALTER TABLE character_equipment 
ADD COLUMN IF NOT EXISTS quality DECIMAL(5,2) DEFAULT 50.00,
ADD COLUMN IF NOT EXISTS actual_stats JSONB,
ADD COLUMN IF NOT EXISTS value INTEGER;

-- =====================================================
-- ШАГ 4: ВОССТАНОВЛЕНИЕ СВЯЗЕЙ
-- =====================================================

-- Создаем новые внешние ключи
ALTER TABLE character_inventory 
ADD CONSTRAINT character_inventory_item_id_fkey 
FOREIGN KEY (item_id) REFERENCES items_new(id) ON DELETE CASCADE;

ALTER TABLE character_equipment 
ADD CONSTRAINT character_equipment_item_id_fkey 
FOREIGN KEY (item_id) REFERENCES items_new(id) ON DELETE CASCADE;

-- =====================================================
-- ШАГ 5: СОЗДАНИЕ ТРИГГЕРОВ
-- =====================================================

-- Удаляем старые триггеры если есть
DROP TRIGGER IF EXISTS trigger_update_item_stats_insert ON character_inventory;
DROP TRIGGER IF EXISTS trigger_update_item_stats_update ON character_inventory;
DROP TRIGGER IF EXISTS trigger_update_item_stats_insert ON character_equipment;
DROP TRIGGER IF EXISTS trigger_update_item_stats_update ON character_equipment;

-- Создаем триггеры для character_inventory
CREATE TRIGGER trigger_update_item_stats_insert
    BEFORE INSERT ON character_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_item_actual_stats_on_insert();
    
CREATE TRIGGER trigger_update_item_stats_update
    BEFORE UPDATE ON character_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_item_actual_stats_on_update();

-- Создаем триггеры для character_equipment
CREATE TRIGGER trigger_update_item_stats_insert_equipment
    BEFORE INSERT ON character_equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_item_actual_stats_on_insert();
    
CREATE TRIGGER trigger_update_item_stats_update_equipment
    BEFORE UPDATE ON character_equipment
    FOR EACH ROW
    EXECUTE FUNCTION update_item_actual_stats_on_update();

-- =====================================================
-- ШАГ 6: ТЕСТОВЫЕ ДАННЫЕ
-- =====================================================

-- Получаем ID существующего персонажа или создаем тестового
DO $$
DECLARE
    test_char_id UUID;
BEGIN
    -- Пытаемся найти существующего персонажа
    SELECT id INTO test_char_id FROM characters LIMIT 1;
    
    -- Если персонажей нет, создаем тестового
    IF test_char_id IS NULL THEN
        INSERT INTO characters (id, name, class, level) 
        VALUES (gen_random_uuid(), 'Тестовый персонаж', 'warrior', 1)
        RETURNING id INTO test_char_id;
    END IF;
    
    -- Добавляем тестовые предметы в инвентарь
    INSERT INTO character_inventory (character_id, item_id, slot_position, quality, stack_size) VALUES
    (test_char_id, 'leather_armor', 1, 75.0, 1),
    (test_char_id, 'iron_sword', 2, 60.0, 1),
    (test_char_id, 'health_potion', 3, 90.0, 5),
    (test_char_id, 'copper_ring', 4, 85.0, 1);

    -- Добавляем тестовую экипировку (используем правильные слоты)
    -- Проверяем, какие слоты разрешены в constraint valid_slot_type
    BEGIN
        INSERT INTO character_equipment (character_id, item_id, slot_type, quality) VALUES
        (test_char_id, 'leather_helmet', 'helmet', 70.0),
        (test_char_id, 'iron_boots', 'boots', 65.0);
    EXCEPTION
        WHEN check_violation THEN
            -- Если слоты не подходят, пробуем другие варианты
            BEGIN
                INSERT INTO character_equipment (character_id, item_id, slot_type, quality) VALUES
                (test_char_id, 'leather_helmet', 'armor', 70.0),
                (test_char_id, 'iron_boots', 'armor', 65.0);
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Не удалось добавить тестовую экипировку: %', SQLERRM;
            END;
        WHEN undefined_column THEN
            -- Если колонки slot_type нет, пропускаем экипировку
            RAISE NOTICE 'Колонка slot_type не найдена в character_equipment, пропускаем тестовую экипировку';
    END;
    
    -- Сохраняем ID для проверки
    CREATE TEMP TABLE IF NOT EXISTS test_character_id (id UUID);
    DELETE FROM test_character_id;
    INSERT INTO test_character_id VALUES (test_char_id);
END $$;

-- =====================================================
-- ШАГ 7: ПРОВЕРКА РЕЗУЛЬТАТОВ
-- =====================================================

-- Проверяем, что статы рассчитались автоматически
SELECT 
    'Инвентарь' as source,
    item_id, 
    quality, 
    actual_stats, 
    value 
FROM character_inventory 
WHERE character_id = (SELECT id FROM test_character_id)

UNION ALL

-- Проверяем экипировку (если таблица существует и имеет нужные колонки)
SELECT 
    'Экипировка' as source,
    item_id, 
    quality, 
    actual_stats, 
    value 
FROM character_equipment 
WHERE character_id = (SELECT id FROM test_character_id)
AND quality IS NOT NULL;

-- Проверяем функции расчета
SELECT 
    'Тест функции расчета статов' as test,
    calculate_item_actual_stats('iron_sword', 75.0) as stats_75,
    calculate_item_value('iron_sword', 75.0) as value_75;

-- =====================================================
-- ШАГ 8: ОБНОВЛЕНИЕ СТАТИСТИК
-- =====================================================

-- Обновляем статистики таблиц
ANALYZE character_inventory;
ANALYZE character_equipment;
ANALYZE items_new;
ANALYZE item_stats;

-- =====================================================
-- ЗАВЕРШЕНИЕ МИГРАЦИИ
-- =====================================================

-- Выводим информацию о завершении
SELECT 
    'МИГРАЦИЯ ЗАВЕРШЕНА УСПЕШНО!' as status,
    NOW() as completed_at,
    (SELECT COUNT(*) FROM items_new) as total_items,
    (SELECT COUNT(*) FROM item_stats) as total_stats,
    (SELECT COUNT(*) FROM character_inventory) as inventory_items,
    (SELECT COUNT(*) FROM character_equipment) as equipped_items;

-- =====================================================
-- ИНСТРУКЦИИ ПО ОТКАТУ (если нужно)
-- =====================================================

/*
-- Для отката миграции выполните:

-- 1. Восстановите резервные копии
-- INSERT INTO character_inventory SELECT * FROM character_inventory_backup;
-- INSERT INTO character_equipment SELECT * FROM character_equipment_backup;
-- INSERT INTO items SELECT * FROM items_backup;

-- 2. Верните старые типы данных
-- ALTER TABLE character_inventory ALTER COLUMN item_id TYPE UUID USING item_id::uuid;
-- ALTER TABLE character_equipment ALTER COLUMN item_id TYPE UUID USING item_id::uuid;

-- 3. Восстановите старые ограничения
-- ALTER TABLE character_inventory ADD CONSTRAINT character_inventory_item_id_fkey FOREIGN KEY (item_id) REFERENCES items(id);
-- ALTER TABLE character_equipment ADD CONSTRAINT character_equipment_item_id_fkey FOREIGN KEY (item_id) REFERENCES items(id);

-- 4. Удалите новые поля
-- ALTER TABLE character_inventory DROP COLUMN IF EXISTS quality, DROP COLUMN IF EXISTS actual_stats, DROP COLUMN IF EXISTS value;
-- ALTER TABLE character_equipment DROP COLUMN IF EXISTS quality, DROP COLUMN IF EXISTS actual_stats, DROP COLUMN IF EXISTS value;
*/
