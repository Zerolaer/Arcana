# SQL Файлы проекта Arcana

## 📁 Структура файлов

### 🏗️ **Основные схемы**
- `schema.sql` - Основная схема базы данных (таблицы, индексы, триггеры)
- `complete_classes_overhaul.sql` - Новая система классов (4 класса + скиллы)
- `world_combat_schema.sql` - Боевая система и мир (локации, мобы, бой)
- `complete_equipment_setup.sql` - Система экипировки

### 📊 **Данные**
- `data.sql` - Основные данные игры (локации, мобы, предметы, луты)

### ⚙️ **Функции**
- `inventory_functions.sql` - Функции для работы с инвентарем
- `equipment_functions.sql` - Функции экипировки
- `regeneration_functions.sql` - Система регенерации
- `add_drop_functions.sql` - Функции добавления/удаления предметов
- `drop_loot_functions.sql` - Функции дропа лута

### 🛠️ **Утилиты**
- `complete_items_cleanup.sql` - Полная очистка и пересоздание таблицы items
- `delete_all_items.sql` - Удаление всех предметов из игры
- `cleanup_database.sql` - Очистка лишних таблиц из базы данных
- `fix_inventory_functions.sql` - Исправление функций инвентаря и экипировки

## 🚀 **Порядок установки**

1. **Базовая схема:**
   ```sql
   \i schema.sql
   ```

2. **Новая система классов:**
   ```sql
   \i complete_classes_overhaul.sql
   ```

3. **Боевая система:**
   ```sql
   \i world_combat_schema.sql
   ```

4. **Система экипировки:**
   ```sql
   \i complete_equipment_setup.sql
   ```

5. **Функции:**
   ```sql
   \i inventory_functions.sql
   \i equipment_functions.sql
   \i regeneration_functions.sql
   \i add_drop_functions.sql
   \i drop_loot_functions.sql
   ```

6. **Данные:**
   ```sql
   \i data.sql
   ```

## 🧹 **Очистка предметов**

Если нужно полностью очистить и пересоздать предметы:
```sql
\i complete_items_cleanup.sql
```

## 📝 **Примечания**

- ✅ Все дублирующиеся файлы удалены
- ✅ Отладочные и тестовые файлы очищены  
- ✅ Оставлены только актуальные файлы
- ✅ Система классов: 4 основных класса
- ✅ Новая система: 10 статов вместо 6
