-- ДАННЫЕ ДЛЯ СИСТЕМЫ НАВЫКОВ
-- Заполняем таблицы пассивных и активных навыков

-- 1. Пассивные навыки (едины для всех классов)
INSERT INTO passive_skills (skill_key, name, description, level_requirement, icon, strength_bonus, endurance_bonus) VALUES
('physical_power', 'Физическая Мощь', 'Увеличивает физическую силу и выносливость', 1, '💪', 5, 3);

INSERT INTO passive_skills (skill_key, name, description, level_requirement, icon, intelligence_bonus, precision_bonus) VALUES
('mental_clarity', 'Ментальная Ясность', 'Улучшает интеллект и концентрацию', 5, '🧠', 8, 4);

INSERT INTO passive_skills (skill_key, name, description, level_requirement, icon, agility_bonus, evasion_bonus) VALUES
('agile_reflexes', 'Проворные Рефлексы', 'Повышает ловкость и скорость реакции', 10, '⚡', 10, 6);

INSERT INTO passive_skills (skill_key, name, description, level_requirement, icon, spell_power_bonus, resistance_bonus) VALUES
('mystical_affinity', 'Мистическое Сродство', 'Усиливает магическую силу и сопротивление', 15, '🔮', 12, 8);

INSERT INTO passive_skills (skill_key, name, description, level_requirement, icon, stealth_bonus, armor_bonus) VALUES
('master_of_shadows', 'Повелитель Теней', 'Развивает скрытность и защиту', 20, '🌑', 15, 10);

-- 2. Активные навыки для Лучника
INSERT INTO active_skills (skill_key, name, description, level_requirement, icon, skill_type, damage_type, base_damage, mana_cost, cooldown, scaling_stat, scaling_ratio, class_requirements, cost_to_learn) VALUES
('archer_basic_shot', 'Точный Выстрел', 'Базовый выстрел из лука с умеренным уроном', 1, '🏹', 'active', 'physical', 80, 0, 1, 'agility', 1.2, '{"Лучник"}', 0),
('archer_power_shot', 'Мощный Выстрел', 'Заряженный выстрел с повышенным уроном', 5, '🎯', 'active', 'physical', 150, 15, 3, 'agility', 1.5, '{"Лучник"}', 100),
('archer_arrow_rain', 'Дождь Стрел', 'Обстреливает область несколькими стрелами', 10, '☔', 'aoe', 'physical', 120, 25, 8, 'agility', 1.3, '{"Лучник"}', 500),
('archer_hawk_eye', 'Глаз Ястреба', 'Увеличивает точность и критический урон', 15, '👁️', 'buff', 'physical', 0, 30, 15, 'agility', 0, '{"Лучник"}', 1000),
('archer_warding_barrier', 'Защитный Барьер', 'Создает барьер, поглощающий урон', 20, '🛡️', 'barrier', 'physical', 0, 40, 20, 'agility', 0, '{"Лучник"}', 2000),
('archer_storm_volley', 'Штормовой Залп', 'Массивная атака с множественными выстрелами и лечением', 25, '⛈️', 'ultimate', 'physical', 300, 60, 30, 'agility', 2.0, '{"Лучник"}', 5000);

-- 3. Активные навыки для Мага
INSERT INTO active_skills (skill_key, name, description, level_requirement, icon, skill_type, damage_type, base_damage, mana_cost, cooldown, scaling_stat, scaling_ratio, class_requirements, cost_to_learn) VALUES
('mage_basic_bolt', 'Магическая Стрела', 'Базовая магическая атака', 1, '🔮', 'active', 'magical', 70, 5, 1, 'intelligence', 1.3, '{"Маг"}', 0),
('mage_fireball', 'Огненный Шар', 'Мощный огненный снаряд с поджогом', 5, '🔥', 'active', 'magical', 140, 20, 3, 'spell_power', 1.6, '{"Маг"}', 100),
('mage_chain_lightning', 'Цепная Молния', 'Молния, перескакивающая между врагами', 10, '⚡', 'aoe', 'magical', 110, 30, 8, 'spell_power', 1.4, '{"Маг"}', 500),
('mage_arcane_empowerment', 'Чародейское Усиление', 'Увеличивает магический урон и регенерацию маны', 15, '✨', 'buff', 'magical', 0, 35, 15, 'intelligence', 0, '{"Маг"}', 1000),
('mage_mana_shield', 'Мана-Щит', 'Создает щит, поглощающий урон за счет маны', 20, '🔵', 'barrier', 'magical', 0, 45, 20, 'intelligence', 0, '{"Маг"}', 2000),
('mage_meteor_shower', 'Метеоритный Дождь', 'Призывает метеориты на область с лечением', 25, '☄️', 'ultimate', 'magical', 280, 70, 30, 'spell_power', 2.2, '{"Маг"}', 5000);

-- 4. Активные навыки для Берсерка
INSERT INTO active_skills (skill_key, name, description, level_requirement, icon, skill_type, damage_type, base_damage, mana_cost, cooldown, scaling_stat, scaling_ratio, class_requirements, cost_to_learn) VALUES
('berserker_basic_strike', 'Мощный Удар', 'Базовый физический удар', 1, '🪓', 'active', 'physical', 90, 0, 1, 'strength', 1.4, '{"Берсерк"}', 0),
('berserker_devastating_blow', 'Опустошающий Удар', 'Сокрушительная атака с высоким уроном', 5, '💥', 'active', 'physical', 180, 15, 4, 'strength', 1.8, '{"Берсерк"}', 100),
('berserker_whirlwind', 'Смерч', 'Вращательная атака, поражающая всех вокруг', 10, '🌪️', 'aoe', 'physical', 130, 25, 8, 'strength', 1.5, '{"Берсерк"}', 500),
('berserker_bloodlust', 'Кровожадность', 'Увеличивает физический урон и скорость атаки', 15, '🩸', 'buff', 'physical', 0, 30, 15, 'strength', 0, '{"Берсерк"}', 1000),
('berserker_iron_skin', 'Железная Кожа', 'Временно увеличивает броню и сопротивление', 20, '🛡️', 'barrier', 'physical', 0, 40, 20, 'endurance', 0, '{"Берсерк"}', 2000),
('berserker_apocalypse', 'Апокалипсис', 'Массивная атака с восстановлением здоровья', 25, '💀', 'ultimate', 'physical', 350, 60, 30, 'strength', 2.5, '{"Берсерк"}', 5000);

-- 5. Активные навыки для Ассасина
INSERT INTO active_skills (skill_key, name, description, level_requirement, icon, skill_type, damage_type, base_damage, mana_cost, cooldown, scaling_stat, scaling_ratio, class_requirements, cost_to_learn) VALUES
('assassin_basic_stab', 'Быстрый Укол', 'Быстрая атака с высокой скоростью', 1, '🗡️', 'active', 'physical', 75, 0, 0.8, 'agility', 1.3, '{"Ассасин"}', 0),
('assassin_backstab', 'Удар в Спину', 'Скрытая атака с критическим уроном', 5, '🗡️', 'active', 'physical', 160, 20, 4, 'stealth', 1.7, '{"Ассасин"}', 100),
('assassin_poison_dart', 'Ядовитая Стрела', 'Атака с ядом, поражающая нескольких врагов', 10, '🟢', 'aoe', 'magical', 100, 25, 8, 'stealth', 1.4, '{"Ассасин"}', 500),
('assassin_shadow_cloak', 'Теневой Плащ', 'Увеличивает скрытность и критический урон', 15, '👤', 'buff', 'physical', 0, 30, 15, 'stealth', 0, '{"Ассасин"}', 1000),
('assassin_smoke_bomb', 'Дымовая Бомба', 'Создает дымовую завесу для защиты', 20, '💨', 'barrier', 'physical', 0, 40, 20, 'stealth', 0, '{"Ассасин"}', 2000),
('assassin_death_mark', 'Метка Смерти', 'Массивная атака с восстановлением при убийстве', 25, '💀', 'ultimate', 'physical', 320, 60, 30, 'stealth', 2.3, '{"Ассасин"}', 5000);

-- 6. Автоматически изучаем первый пассивный навык для всех персонажей
INSERT INTO character_passive_skills (character_id, skill_id, is_learned)
SELECT c.id, ps.id, true
FROM characters c
CROSS JOIN passive_skills ps
WHERE ps.skill_key = 'physical_power'
AND NOT EXISTS (
    SELECT 1 FROM character_passive_skills cps 
    WHERE cps.character_id = c.id AND cps.skill_id = ps.id
);

-- 7. Автоматически изучаем первый активный навык для всех персонажей
INSERT INTO character_active_skills (character_id, skill_id, is_learned)
SELECT c.id, a_skills.id, true
FROM characters c
JOIN character_classes cc ON c.class_id = cc.id
JOIN active_skills a_skills ON a_skills.class_requirements @> ARRAY[cc.name]
WHERE a_skills.level_requirement = 1
AND NOT EXISTS (
    SELECT 1 FROM character_active_skills cas 
    WHERE cas.character_id = c.id AND cas.skill_id = a_skills.id
);

-- 8. Проверяем результат
SELECT 
    '=== ПАССИВНЫЕ НАВЫКИ ===' as info;

SELECT 
    skill_key,
    name,
    level_requirement,
    strength_bonus + agility_bonus + intelligence_bonus + precision_bonus + evasion_bonus + 
    spell_power_bonus + resistance_bonus + endurance_bonus + armor_bonus + stealth_bonus as total_bonus
FROM passive_skills 
ORDER BY level_requirement;

SELECT 
    '=== АКТИВНЫЕ НАВЫКИ ПО КЛАССАМ ===' as info;

SELECT 
    a_skills.skill_key,
    a_skills.name,
    a_skills.level_requirement,
    a_skills.base_damage,
    a_skills.mana_cost,
    a_skills.cost_to_learn,
    a_skills.class_requirements
FROM active_skills a_skills
ORDER BY a_skills.class_requirements, a_skills.level_requirement;

SELECT '✅ ДАННЫЕ НАВЫКОВ ЗАГРУЖЕНЫ!' as result;
