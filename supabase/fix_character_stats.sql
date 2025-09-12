-- ================================================
-- ИСПРАВЛЕНИЕ СТАТОВ СУЩЕСТВУЮЩИХ ПЕРСОНАЖЕЙ
-- ================================================

-- Обновляем статы существующих персонажей на основе их класса
UPDATE characters 
SET 
    agility = cc.base_agility,
    precision = cc.base_precision,
    evasion = cc.base_evasion,
    intelligence = cc.base_intelligence,
    spell_power = cc.base_spell_power,
    resistance = cc.base_resistance,
    strength = cc.base_strength,
    endurance = cc.base_endurance,
    armor = cc.base_armor,
    stealth = cc.base_stealth
FROM character_classes cc
WHERE characters.class_id = cc.id;

-- Принудительно обновляем рассчитанные статы для всех персонажей
UPDATE characters SET level = level WHERE id IN (SELECT id FROM characters);

-- Показываем результат
SELECT 
    c.name,
    cc.name as class_name,
    c.agility,
    c.precision,
    c.evasion,
    c.intelligence,
    c.spell_power,
    c.resistance,
    c.strength,
    c.endurance,
    c.armor,
    c.stealth
FROM characters c
JOIN character_classes cc ON c.class_id = cc.id
ORDER BY c.name;
