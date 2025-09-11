# SQL Файлы проекта Arcana

## 📁 Структура файлов

### 🏗️ **Основные схемы**
- `schema.sql` - Основная схема базы данных (таблицы, индексы, триггеры)
- `complete_classes_overhaul.sql` - Новая система классов (4 класса + скиллы)
- `world_combat_schema.sql` - Боевая система и мир (локации, мобы, бой)

### 📊 **Данные**
- `data.sql` - Основные данные игры (локации, мобы, предметы, луты)

### ⚙️ **Системы**
- `items_system_overhaul.sql` - Система предметов с качеством
- `complete_equipment_setup.sql` - Система экипировки
- `inventory_schema.sql` - Схема инвентаря
- `inventory_functions.sql` - Функции для работы с инвентарем
- `inventory_data.sql` - Данные инвентаря
- `inventory_simple.sql` - Упрощенная версия инвентаря
- `equipment_schema.sql` - Схема экипировки
- `equipment_functions.sql` - Функции экипировки
- `regeneration_functions.sql` - Система регенерации

### 🛠️ **Утилиты**
- `clean_install.sql` - Чистая установка системы инвентаря
- `add_drop_functions.sql` - Функции добавления/удаления предметов
- `drop_loot_functions.sql` - Функции дропа лута
- `mob_loot_setup.sql` - Настройка лута мобов
- `check_inventory.sql` - Проверка инвентаря
- `check_items_structure.sql` - Проверка структуры предметов

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

4. **Система предметов:**
   ```sql
   \i items_system_overhaul.sql
   ```

5. **Инвентарь и экипировка:**
   ```sql
   \i inventory_schema.sql
   \i equipment_schema.sql
   \i inventory_functions.sql
   \i equipment_functions.sql
   ```

6. **Данные:**
   ```sql
   \i data.sql
   \i inventory_data.sql
   ```

## 📝 **Примечания**

- Все тестовые, отладочные и устаревшие файлы удалены
- Дубликаты схем и функций очищены
- Оставлены только актуальные и необходимые файлы
- Система классов упрощена до 4 основных классов
