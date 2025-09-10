-- Настройка лута мобов для новой системы предметов
-- Этот скрипт создает лут-таблицы для мобов с предметами из items_new

-- Создаем лут-таблицы для мобов (если не существуют)
INSERT INTO mob_loot (mob_id, item_id, drop_rate, quantity_min, quantity_max) VALUES

-- Лесной Слизень (уровень 1) - базовые предметы
((SELECT id FROM mobs WHERE name = 'Лесной Слизень'), 'health_potion', 30.0, 1, 2),
((SELECT id FROM mobs WHERE name = 'Лесной Слизень'), 'iron_ore', 20.0, 1, 3),
((SELECT id FROM mobs WHERE name = 'Лесной Слизень'), 'cotton_cloth', 15.0, 1, 2),

-- Дикий Волк (уровень 2) - немного лучше
((SELECT id FROM mobs WHERE name = 'Дикий Волк'), 'health_potion', 25.0, 1, 2),
((SELECT id FROM mobs WHERE name = 'Дикий Волк'), 'leather_boots', 10.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Дикий Волк'), 'iron_ore', 35.0, 2, 4),
((SELECT id FROM mobs WHERE name = 'Дикий Волк'), 'cotton_cloth', 15.0, 1, 2),

-- Гигантский Паук (уровень 3) - зелья маны
((SELECT id FROM mobs WHERE name = 'Гигантский Паук'), 'mana_potion', 20.0, 1, 2),
((SELECT id FROM mobs WHERE name = 'Гигантский Паук'), 'iron_sword', 8.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Гигантский Паук'), 'silk_cloth', 25.0, 1, 3),
((SELECT id FROM mobs WHERE name = 'Гигантский Паук'), 'health_potion', 30.0, 1, 1),

-- Лесной Орк (уровень 4) - хорошая добыча для новичков
((SELECT id FROM mobs WHERE name = 'Лесной Орк'), 'iron_sword', 8.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Лесной Орк'), 'leather_armor', 5.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Лесной Орк'), 'health_potion', 40.0, 2, 3),
((SELECT id FROM mobs WHERE name = 'Лесной Орк'), 'iron_ore', 50.0, 3, 6),
((SELECT id FROM mobs WHERE name = 'Лесной Орк'), 'copper_ring', 3.0, 1, 1),

-- Пещерная Летучая Мышь (уровень 5) - редкие предметы
((SELECT id FROM mobs WHERE name = 'Пещерная Летучая Мышь'), 'greater_health_potion', 12.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Пещерная Летучая Мышь'), 'mana_potion', 35.0, 1, 2),
((SELECT id FROM mobs WHERE name = 'Пещерная Летучая Мышь'), 'silk_cloth', 20.0, 1, 2),

-- Каменный Голем (уровень 6) - прочная броня
((SELECT id FROM mobs WHERE name = 'Каменный Голем'), 'iron_armor', 6.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Каменный Голем'), 'iron_ore', 60.0, 4, 8),
((SELECT id FROM mobs WHERE name = 'Каменный Голем'), 'steel_ore', 30.0, 2, 4),
((SELECT id FROM mobs WHERE name = 'Каменный Голем'), 'health_potion', 25.0, 1, 2),

-- Теневой Убийца (уровень 7) - оружие и аксессуары
((SELECT id FROM mobs WHERE name = 'Теневой Убийца'), 'steel_sword', 7.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Теневой Убийца'), 'iron_helmet', 4.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Теневой Убийца'), 'silver_ring', 5.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Теневой Убийца'), 'mana_potion', 30.0, 1, 2),

-- Скелет-Воин (уровень 8) - костяная броня
((SELECT id FROM mobs WHERE name = 'Скелет-Воин'), 'iron_armor', 6.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Скелет-Воин'), 'steel_sword', 8.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Скелет-Воин'), 'steel_ore', 40.0, 2, 5),
((SELECT id FROM mobs WHERE name = 'Скелет-Воин'), 'health_potion', 35.0, 1, 2),

-- Некромант (уровень 9) - магические предметы
((SELECT id FROM mobs WHERE name = 'Некромант'), 'mage_staff', 5.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Некромант'), 'iron_armor', 4.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Некромант'), 'mithril_ore', 25.0, 1, 2),
((SELECT id FROM mobs WHERE name = 'Некромант'), 'mana_potion', 40.0, 2, 3),

-- Древний Лич (уровень 10) - легендарные предметы
((SELECT id FROM mobs WHERE name = 'Древний Лич'), 'mithril_sword', 2.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Древний Лич'), 'mithril_helmet', 1.5, 1, 1),
((SELECT id FROM mobs WHERE name = 'Древний Лич'), 'gold_amulet', 3.0, 1, 1),
((SELECT id FROM mobs WHERE name = 'Древний Лич'), 'mithril_ore', 50.0, 2, 4),
((SELECT id FROM mobs WHERE name = 'Древний Лич'), 'greater_mana_potion', 60.0, 3, 5);

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
