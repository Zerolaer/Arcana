-- Настройка лута мобов для новой системы предметов
-- Этот скрипт создает лут-таблицы для мобов с предметами из items_new

-- Сначала посмотрим, какие мобы у нас есть
SELECT id, name, level FROM mobs ORDER BY level, name;

-- Создаем лут-таблицы для мобов (если не существуют)
-- Используем LIMIT 1 для избежания ошибки "more than one row returned"

INSERT INTO mob_loot (mob_id, item_id, drop_rate, quantity_min, quantity_max) VALUES

-- Лесной Слизень (уровень 1) - базовые предметы
((SELECT id FROM mobs WHERE name = 'Лесной Слизень' LIMIT 1), 'health_potion', 30.0, 1, 2),
((SELECT id FROM mobs WHERE name = 'Лесной Слизень' LIMIT 1), 'iron_ore', 20.0, 1, 3),
((SELECT id FROM mobs WHERE name = 'Лесной Слизень' LIMIT 1), 'cotton_cloth', 15.0, 1, 2),

-- Дикий Волк (уровень 2) - немного лучше
((SELECT id FROM mobs WHERE name = 'Дикий Волк' LIMIT 1), 'health_potion', 25.0, 1, 2),
((SELECT id FROM mobs WHERE name = 'Дикий Волк' LIMIT 1), 'leather_boots', 10.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Дикий Волк' LIMIT 1), 'iron_ore', 35.0, 2, 4),
((SELECT id FROM mobs WHERE name = 'Дикий Волк' LIMIT 1), 'cotton_cloth', 15.0, 1, 2),

-- Гигантский Паук (уровень 3) - зелья маны
((SELECT id FROM mobs WHERE name = 'Гигантский Паук' LIMIT 1), 'mana_potion', 20.0, 1, 2),
((SELECT id FROM mobs WHERE name = 'Гигантский Паук' LIMIT 1), 'iron_sword', 8.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Гигантский Паук' LIMIT 1), 'silk_cloth', 25.0, 1, 3),
((SELECT id FROM mobs WHERE name = 'Гигантский Паук' LIMIT 1), 'health_potion', 30.0, 1, 1),

-- Лесной Орк (уровень 4) - хорошая добыча для новичков
((SELECT id FROM mobs WHERE name = 'Лесной Орк' LIMIT 1), 'iron_sword', 8.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Лесной Орк' LIMIT 1), 'leather_armor', 5.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Лесной Орк' LIMIT 1), 'health_potion', 40.0, 2, 3),
((SELECT id FROM mobs WHERE name = 'Лесной Орк' LIMIT 1), 'iron_ore', 50.0, 3, 6),
((SELECT id FROM mobs WHERE name = 'Лесной Орк' LIMIT 1), 'copper_ring', 3.0, 1, 1),

-- Пещерная Летучая Мышь (уровень 5) - редкие предметы
((SELECT id FROM mobs WHERE name = 'Пещерная Летучая Мышь' LIMIT 1), 'greater_health_potion', 12.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Пещерная Летучая Мышь' LIMIT 1), 'mana_potion', 35.0, 1, 2),
((SELECT id FROM mobs WHERE name = 'Пещерная Летучая Мышь' LIMIT 1), 'silk_cloth', 20.0, 1, 2),

-- Каменный Голем (уровень 6) - прочная броня
((SELECT id FROM mobs WHERE name = 'Каменный Голем' LIMIT 1), 'iron_armor', 6.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Каменный Голем' LIMIT 1), 'iron_ore', 60.0, 4, 8),
((SELECT id FROM mobs WHERE name = 'Каменный Голем' LIMIT 1), 'steel_ore', 30.0, 2, 4),
((SELECT id FROM mobs WHERE name = 'Каменный Голем' LIMIT 1), 'health_potion', 25.0, 1, 2),

-- Теневой Убийца (уровень 7) - оружие и аксессуары
((SELECT id FROM mobs WHERE name = 'Теневой Убийца' LIMIT 1), 'steel_sword', 7.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Теневой Убийца' LIMIT 1), 'iron_helmet', 4.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Теневой Убийца' LIMIT 1), 'silver_ring', 5.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Теневой Убийца' LIMIT 1), 'mana_potion', 30.0, 1, 2),

-- Скелет-Воин (уровень 8) - костяная броня
((SELECT id FROM mobs WHERE name = 'Скелет-Воин' LIMIT 1), 'iron_armor', 6.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Скелет-Воин' LIMIT 1), 'steel_sword', 8.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Скелет-Воин' LIMIT 1), 'steel_ore', 40.0, 2, 5),
((SELECT id FROM mobs WHERE name = 'Скелет-Воин' LIMIT 1), 'health_potion', 35.0, 1, 2),

-- Некромант (уровень 9) - магические предметы
((SELECT id FROM mobs WHERE name = 'Некромант' LIMIT 1), 'mage_staff', 5.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Некромант' LIMIT 1), 'iron_armor', 4.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Некромант' LIMIT 1), 'mithril_ore', 25.0, 1, 2),
((SELECT id FROM mobs WHERE name = 'Некромант' LIMIT 1), 'mana_potion', 40.0, 2, 3),

-- Древний Лич (уровень 10) - легендарные предметы
((SELECT id FROM mobs WHERE name = 'Древний Лич' LIMIT 1), 'mithril_sword', 2.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Древний Лич' LIMIT 1), 'mithril_helmet', 1.5, 1, 1),
((SELECT id FROM mobs WHERE name = 'Древний Лич' LIMIT 1), 'gold_amulet', 3.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Древний Лич' LIMIT 1), 'mithril_ore', 50.0, 2, 4),
((SELECT id FROM mobs WHERE name = 'Древний Лич' LIMIT 1), 'greater_mana_potion', 60.0, 3, 5);

-- Проверяем результат
SELECT 
    m.name as mob_name,
    m.level as mob_level,
    i.name as item_name,
    i.icon as item_icon,
    ml.drop_rate,
    ml.quantity_min,
    ml.quantity_max
FROM mob_loot ml
JOIN mobs m ON ml.mob_id = m.id
JOIN items_new i ON ml.item_id = i.id
ORDER BY m.level, ml.drop_rate DESC;
