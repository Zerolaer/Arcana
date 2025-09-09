-- ============================================
-- ТЕСТОВЫЕ ПРЕДМЕТЫ ДЛЯ ИНВЕНТАРЯ
-- ============================================

-- Сначала найди ID своего персонажа
SELECT id, name FROM characters ORDER BY created_at DESC LIMIT 5;

-- Даем стартовые предметы персонажу
SELECT give_starting_items('66b45795-cef1-4ac6-8462-d3acd7729692');

-- Добавляем дополнительные предметы для тестирования
SELECT add_item_to_inventory('66b45795-cef1-4ac6-8462-d3acd7729692', 'iron_sword', 1, 4);
SELECT add_item_to_inventory('66b45795-cef1-4ac6-8462-d3acd7729692', 'chain_mail', 1, 5);
SELECT add_item_to_inventory('66b45795-cef1-4ac6-8462-d3acd7729692', 'mystic_ring', 1, 6);
SELECT add_item_to_inventory('66b45795-cef1-4ac6-8462-d3acd7729692', 'health_potion_large', 3, 7);
SELECT add_item_to_inventory('66b45795-cef1-4ac6-8462-d3acd7729692', 'mana_potion', 5, 8);
SELECT add_item_to_inventory('66b45795-cef1-4ac6-8462-d3acd7729692', 'dragon_scale', 2, 9);
SELECT add_item_to_inventory('66b45795-cef1-4ac6-8462-d3acd7729692', 'phoenix_feather', 1, 10);
SELECT add_item_to_inventory('66b45795-cef1-4ac6-8462-d3acd7729692', 'archmage_robe', 1, 11);
SELECT add_item_to_inventory('66b45795-cef1-4ac6-8462-d3acd7729692', 'shadowbane', 1, 12);

-- Проверяем результат
SELECT * FROM character_inventory WHERE character_id = '66b45795-cef1-4ac6-8462-d3acd7729692' ORDER BY slot_position;
