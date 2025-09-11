-- ИСПРАВЛЕНИЕ СИСТЕМЫ РЕГЕНЕРАЦИИ
-- Обновляем функции для работы с новой системой статов

-- 1. Удаляем старые функции
DROP FUNCTION IF EXISTS calculate_character_regeneration(UUID);
DROP FUNCTION IF EXISTS apply_regeneration(UUID);
DROP FUNCTION IF EXISTS update_character_regeneration();

-- 2. Создаем новые функции для регенерации
CREATE OR REPLACE FUNCTION calculate_character_regeneration(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_character characters%ROWTYPE;
    v_health_regen DECIMAL(5,2);
    v_mana_regen DECIMAL(5,2);
BEGIN
    -- Получаем данные персонажа
    SELECT * INTO v_character FROM characters WHERE id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Character not found'
        );
    END IF;

    -- Базовая регенерация с новыми статами
    -- HP регенерация: 1.0 + (endurance * 0.05) + (level * 0.02)
    v_health_regen := 1.0 + (v_character.endurance * 0.05) + (v_character.level * 0.02);
    
    -- MP регенерация: 1.0 + (intelligence * 0.05) + (level * 0.01)
    v_mana_regen := 1.0 + (v_character.intelligence * 0.05) + (v_character.level * 0.01);

    -- Обновляем значения в базе данных
    UPDATE characters 
    SET 
        health_regen = v_health_regen,
        mana_regen = v_mana_regen
    WHERE id = p_character_id;

    RETURN json_build_object(
        'success', true,
        'health_regen', v_health_regen,
        'mana_regen', v_mana_regen
    );
END;
$$ LANGUAGE plpgsql;

-- 3. Создаем функцию для применения регенерации
CREATE OR REPLACE FUNCTION apply_regeneration(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_character characters%ROWTYPE;
    v_new_health INTEGER;
    v_new_mana INTEGER;
    v_health_restored INTEGER := 0;
    v_mana_restored INTEGER := 0;
BEGIN
    -- Получаем данные персонажа
    SELECT * INTO v_character FROM characters WHERE id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Character not found'
        );
    END IF;

    -- Не регенерируем в бою
    IF v_character.is_in_combat THEN
        RETURN json_build_object(
            'success', true,
            'message', 'No regeneration in combat',
            'health_restored', 0,
            'mana_restored', 0
        );
    END IF;

    -- Рассчитываем новое здоровье
    v_new_health := LEAST(
        v_character.health + CEIL(v_character.health_regen),
        v_character.max_health
    );
    v_health_restored := v_new_health - v_character.health;

    -- Рассчитываем новую ману
    v_new_mana := LEAST(
        v_character.mana + CEIL(v_character.mana_regen),
        v_character.max_mana
    );
    v_mana_restored := v_new_mana - v_character.mana;

    -- Обновляем ресурсы персонажа
    UPDATE characters 
    SET 
        health = v_new_health,
        mana = v_new_mana,
        updated_at = NOW()
    WHERE id = p_character_id;

    RETURN json_build_object(
        'success', true,
        'health_restored', v_health_restored,
        'mana_restored', v_mana_restored,
        'new_health', v_new_health,
        'new_mana', v_new_mana,
        'health_regen_rate', v_character.health_regen,
        'mana_regen_rate', v_character.mana_regen
    );
END;
$$ LANGUAGE plpgsql;

-- 4. Обновляем регенерацию для всех персонажей
UPDATE characters 
SET 
    health_regen = 1.0 + (endurance * 0.05) + (level * 0.02),
    mana_regen = 1.0 + (intelligence * 0.05) + (level * 0.01);

-- 5. Проверяем результат
SELECT 
    '=== ОБНОВЛЕННАЯ РЕГЕНЕРАЦИЯ ===' as info;

SELECT 
    name,
    level,
    endurance,
    intelligence,
    health_regen,
    mana_regen,
    health,
    max_health,
    mana,
    max_mana
FROM characters 
ORDER BY name;

SELECT '✅ СИСТЕМА РЕГЕНЕРАЦИИ ИСПРАВЛЕНА!' as result;
