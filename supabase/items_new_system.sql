-- ============================================
-- НОВАЯ СИСТЕМА ПРЕДМЕТОВ С ПРАВИЛЬНЫМИ СТАТАМИ
-- ============================================
-- Исправляем предметы под новую систему из 10 характеристик

-- Сначала обновляем схему таблицы items для новых статов
ALTER TABLE items 
DROP COLUMN IF EXISTS strength_bonus,
DROP COLUMN IF EXISTS dexterity_bonus,
DROP COLUMN IF EXISTS intelligence_bonus,
DROP COLUMN IF EXISTS vitality_bonus,
DROP COLUMN IF EXISTS energy_bonus,
DROP COLUMN IF EXISTS luck_bonus;

-- Добавляем новые поля для 10 характеристик
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS agility_bonus INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS precision_bonus INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS evasion_bonus INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS intelligence_bonus INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS spell_power_bonus INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS resistance_bonus INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS strength_bonus INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS endurance_bonus INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS armor_bonus INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stealth_bonus INTEGER DEFAULT 0;

-- Очищаем старые предметы
DELETE FROM items;

-- Вставляем новые предметы с правильными статами
INSERT INTO items (
    name, description, item_type, slot, rarity, level_requirement,
    agility_bonus, precision_bonus, evasion_bonus, intelligence_bonus, spell_power_bonus, resistance_bonus,
    strength_bonus, endurance_bonus, armor_bonus, stealth_bonus,
    attack_damage, defense, vendor_price, stack_size, icon
) VALUES 

-- ============================================
-- ОРУЖИЕ ДЛЯ ЛУЧНИКА
-- ============================================
('Деревянный лук', 'Простой лук для начинающих лучников', 'weapon', 'weapon', 'common', 1,
    3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 15, 0, 60, 1, '🏹'),

('Охотничий лук', 'Надежный лук для охоты', 'weapon', 'weapon', 'uncommon', 5,
    5, 4, 2, 0, 0, 0, 0, 0, 0, 0, 25, 0, 150, 1, '🏹'),

('Эльфийский лук', 'Элегантный лук эльфийской работы', 'weapon', 'weapon', 'rare', 15,
    8, 6, 4, 2, 0, 2, 0, 0, 0, 1, 40, 0, 400, 1, '🏹'),

('Лунный лук', 'Мистический лук, светящийся лунным светом', 'weapon', 'weapon', 'epic', 30,
    12, 10, 6, 4, 3, 4, 0, 0, 0, 3, 65, 0, 800, 1, '🌙'),

-- ============================================
-- ОРУЖИЕ ДЛЯ МАГА
-- ============================================
('Посох новичка', 'Простой посох для начинающих магов', 'weapon', 'weapon', 'common', 1,
    0, 1, 0, 3, 2, 1, 0, 0, 0, 0, 8, 0, 70, 1, '🪄'),

('Магический жезл', 'Жезл с магическими кристаллами', 'weapon', 'weapon', 'uncommon', 8,
    1, 2, 1, 5, 4, 3, 0, 0, 0, 0, 15, 0, 200, 1, '🔮'),

('Посох архимага', 'Мощный посох для опытных магов', 'weapon', 'weapon', 'rare', 20,
    2, 3, 2, 8, 7, 6, 0, 0, 0, 1, 30, 0, 600, 1, '🧙‍♂️'),

('Жезл дракона', 'Легендарный жезл из драконьей кости', 'weapon', 'weapon', 'epic', 40,
    3, 4, 3, 12, 10, 8, 0, 0, 0, 2, 50, 0, 1200, 1, '🐉'),

-- ============================================
-- ОРУЖИЕ ДЛЯ БЕРСЕРКА
-- ============================================
('Деревянный топор', 'Простой топор для начинающих воинов', 'weapon', 'weapon', 'common', 1,
    1, 0, 0, 0, 0, 0, 4, 2, 1, 0, 20, 0, 80, 1, '🪓'),

('Стальной топор', 'Тяжелый топор из закаленной стали', 'weapon', 'weapon', 'uncommon', 10,
    2, 1, 0, 0, 0, 0, 8, 5, 3, 0, 40, 0, 300, 1, '⚔️'),

('Боевой молот', 'Мощный молот для ближнего боя', 'weapon', 'weapon', 'rare', 25,
    3, 2, 1, 0, 0, 0, 12, 8, 5, 0, 70, 0, 700, 1, '🔨'),

('Драконий топор', 'Легендарный топор из драконьих зубов', 'weapon', 'weapon', 'epic', 45,
    5, 3, 2, 0, 0, 0, 18, 12, 8, 0, 110, 0, 1500, 1, '🐲'),

-- ============================================
-- ОРУЖИЕ ДЛЯ АССАСИНА
-- ============================================
('Кинжал новичка', 'Простой кинжал для начинающих убийц', 'weapon', 'weapon', 'common', 1,
    2, 1, 1, 0, 0, 0, 1, 0, 0, 3, 12, 0, 90, 1, '🗡️'),

('Когти теней', 'Острые когти, покрытые тенью', 'weapon', 'weapon', 'uncommon', 12,
    4, 3, 3, 1, 0, 0, 2, 1, 0, 6, 25, 0, 350, 1, '🖤'),

('Клинки убийцы', 'Пара заточенных клинков убийцы', 'weapon', 'weapon', 'rare', 28,
    6, 5, 5, 2, 0, 1, 3, 2, 0, 10, 45, 0, 800, 1, '⚔️'),

('Когти дракона', 'Легендарные когти из драконьих когтей', 'weapon', 'weapon', 'epic', 50,
    10, 8, 8, 3, 0, 2, 5, 3, 0, 15, 80, 0, 1800, 1, '🐉'),

-- ============================================
-- БРОНЯ ДЛЯ ВСЕХ КЛАССОВ
-- ============================================
-- Легкая броня (лучник, ассасин)
('Кожаная куртка', 'Легкая броня из кожи', 'armor', 'chest', 'common', 1,
    2, 1, 2, 0, 0, 0, 0, 1, 3, 1, 0, 8, 100, 1, '🦺'),

('Кожаные штаны', 'Удобные штаны из кожи', 'armor', 'legs', 'common', 1,
    1, 1, 1, 0, 0, 0, 0, 1, 2, 0, 0, 5, 60, 1, '👖'),

('Кожаные сапоги', 'Легкие сапоги для быстрого движения', 'armor', 'boots', 'common', 1,
    2, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 3, 40, 1, '🥾'),

-- Средняя броня (маг)
('Магическая мантия', 'Мантия, усиливающая магические способности', 'armor', 'chest', 'common', 1,
    0, 1, 1, 2, 1, 2, 0, 0, 2, 0, 0, 6, 120, 1, '🧙‍♂️'),

('Магические штаны', 'Штаны с магическими рунами', 'armor', 'legs', 'common', 1,
    0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 4, 80, 1, '👖'),

('Магические сапоги', 'Сапоги с магическими чарами', 'armor', 'boots', 'common', 1,
    1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 3, 50, 1, '👢'),

-- Тяжелая броня (берсерк)
('Кольчужная рубаха', 'Прочная кольчужная броня', 'armor', 'chest', 'common', 1,
    0, 0, 0, 0, 0, 0, 3, 2, 8, 0, 0, 15, 150, 1, '🛡️'),

('Кольчужные штаны', 'Тяжелые штаны из кольчуги', 'armor', 'legs', 'common', 1,
    0, 0, 0, 0, 0, 0, 2, 1, 5, 0, 0, 10, 100, 1, '👖'),

('Кольчужные сапоги', 'Тяжелые сапоги из кольчуги', 'armor', 'boots', 'common', 1,
    0, 0, 0, 0, 0, 0, 1, 1, 3, 0, 0, 6, 70, 1, '🥾'),

-- ============================================
-- АКСЕССУАРЫ
-- ============================================
('Кольцо силы', 'Кольцо, увеличивающее физическую силу', 'accessory', 'ring', 'uncommon', 5,
    0, 0, 0, 0, 0, 0, 3, 2, 1, 0, 0, 0, 200, 1, '💍'),

('Амулет ловкости', 'Амулет, повышающий ловкость', 'accessory', 'amulet', 'uncommon', 8,
    4, 2, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 250, 1, '🔮'),

('Браслет магии', 'Браслет, усиливающий магические способности', 'accessory', 'bracelet', 'uncommon', 10,
    0, 1, 1, 3, 2, 3, 0, 0, 0, 0, 0, 0, 300, 1, '📿'),

-- ============================================
-- ЗЕЛЬЯ И ПРЕДМЕТЫ
-- ============================================
('Зелье здоровья', 'Восстанавливает 100 здоровья', 'consumable', NULL, 'common', 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 50, '🧪'),

('Зелье маны', 'Восстанавливает 50 маны', 'consumable', NULL, 'common', 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 50, '💙'),

('Свиток телепорта', 'Мгновенно переносит в город', 'consumable', NULL, 'uncommon', 5,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 10, '📜'),

-- ============================================
-- МАТЕРИАЛЫ
-- ============================================
('Железная руда', 'Базовый материал для крафта', 'material', NULL, 'common', 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 100, '⛏️'),

('Драгоценный камень', 'Редкий материал для улучшений', 'material', NULL, 'rare', 20,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200, 20, '💎'),

('Сущность тьмы', 'Мистический материал темной магии', 'material', NULL, 'epic', 50,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1000, 5, '🌑');

-- ============================================
-- ФУНКЦИЯ ДЛЯ РАСЧЕТА СТАТОВ ОТ ПРЕДМЕТОВ
-- ============================================
CREATE OR REPLACE FUNCTION get_equipment_bonuses(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'agility', COALESCE(SUM(i.agility_bonus), 0),
        'precision', COALESCE(SUM(i.precision_bonus), 0),
        'evasion', COALESCE(SUM(i.evasion_bonus), 0),
        'intelligence', COALESCE(SUM(i.intelligence_bonus), 0),
        'spell_power', COALESCE(SUM(i.spell_power_bonus), 0),
        'resistance', COALESCE(SUM(i.resistance_bonus), 0),
        'strength', COALESCE(SUM(i.strength_bonus), 0),
        'endurance', COALESCE(SUM(i.endurance_bonus), 0),
        'armor', COALESCE(SUM(i.armor_bonus), 0),
        'stealth', COALESCE(SUM(i.stealth_bonus), 0),
        'attack_damage', COALESCE(SUM(i.attack_damage), 0),
        'defense', COALESCE(SUM(i.defense), 0)
    ) INTO v_result
    FROM character_equipment ce
    JOIN items i ON ce.item_id = i.id
    WHERE ce.character_id = p_character_id;
    
    RETURN COALESCE(v_result, '{}'::json);
END;
$$ LANGUAGE plpgsql;
