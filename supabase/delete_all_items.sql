-- Полная очистка всех предметов из игры
-- Удаляем все данные из таблицы items

-- Отключаем проверки внешних ключей временно
SET session_replication_role = replica;

-- Удаляем все предметы
DELETE FROM items;

-- Включаем обратно проверки внешних ключей
SET session_replication_role = DEFAULT;

-- Проверяем что таблица пустая
SELECT COUNT(*) as remaining_items FROM items;
