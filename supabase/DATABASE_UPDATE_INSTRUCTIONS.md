# Инструкция по обновлению базы данных

## Проблемы, которые нужно исправить:

1. **Отсутствует таблица `mobs`** - основная таблица с мобами
2. **Отсутствует таблица `mob_spawns`** - связь мобов с местами для фарма
3. **Отсутствуют таблицы лут-системы** - `loot_tables` и `loot_table_items`
4. **Недостающие колонки в `farming_spots`** - `current_occupancy`, `max_occupancy`, etc.
5. **Отсутствуют функции** для занятия/покидания мест для фарма

## Как применить обновления:

### Вариант 1: Через Supabase Dashboard
1. Откройте Supabase Dashboard
2. Перейдите в раздел "SQL Editor"
3. Скопируйте и выполните содержимое файла `complete_schema_update.sql`

### Вариант 2: Через psql (если у вас есть доступ к базе)
```bash
psql -h your-db-host -U postgres -d your-db-name -f complete_schema_update.sql
```

### Вариант 3: По частям (если есть проблемы с правами)
Выполните SQL команды по порядку:

1. Сначала создайте таблицы:
```sql
-- Выполните CREATE TABLE команды из файла
```

2. Затем добавьте данные:
```sql
-- Выполните INSERT команды из файла
```

3. Наконец, создайте функции:
```sql
-- Выполните CREATE FUNCTION команды из файла
```

## Что будет добавлено:

### Новые таблицы:
- `mobs` - основная таблица с мобами
- `mob_spawns` - связь мобов с местами для фарма
- `loot_tables` - таблицы лута
- `loot_table_items` - предметы в таблицах лута

### Новые колонки в `farming_spots`:
- `current_occupancy` - текущее количество игроков
- `max_occupancy` - максимальное количество игроков
- `difficulty_multiplier` - множитель сложности
- `experience_multiplier` - множитель опыта
- `position` - позиция на карте (JSON)

### Новые функции:
- `occupy_farming_spot(spot_id, character_id)` - занять место для фарма
- `leave_farming_spot(spot_id, character_id)` - покинуть место для фарма

### Данные:
- 12 различных мобов с уровнями от 1 до 45
- 12 таблиц лута
- Связи мобов с местами для фарма
- Настройки занятости для всех мест

## Проверка после обновления:

1. Убедитесь, что все таблицы созданы:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('mobs', 'mob_spawns', 'loot_tables', 'loot_table_items');
```

2. Проверьте данные мобов:
```sql
SELECT COUNT(*) FROM mobs;
SELECT name, level, health FROM mobs ORDER BY level;
```

3. Проверьте связи мобов с местами:
```sql
SELECT fs.name as spot_name, m.name as mob_name, ms.spawn_rate 
FROM farming_spots fs
JOIN mob_spawns ms ON fs.id = ms.spot_id
JOIN mobs m ON ms.mob_id = m.id
ORDER BY fs.name, m.level;
```

4. Проверьте функции:
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('occupy_farming_spot', 'leave_farming_spot');
```

## Важные замечания:

- Обновление безопасно - использует `IF NOT EXISTS` и `ON CONFLICT DO NOTHING`
- Не удаляет существующие данные
- Добавляет только недостающие элементы
- Совместимо с существующей структурой

После применения обновлений игра должна работать корректно с системой мобов и мест для фарма!
