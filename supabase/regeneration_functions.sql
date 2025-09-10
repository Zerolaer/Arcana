-- ============================================
-- ФУНКЦИИ ДЛЯ СИСТЕМЫ РЕГЕНЕРАЦИИ
-- ============================================

-- Функция для расчета регенерации персонажа
CREATE OR REPLACE FUNCTION calculate_character_regeneration(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_character characters%ROWTYPE;
    v_equipment JSON;
    v_base_health_regen DECIMAL(5,2);
    v_base_mana_regen DECIMAL(5,2);
    v_base_stamina_regen DECIMAL(5,2);
    v_equipment_health_regen DECIMAL(5,2) := 0;
    v_equipment_mana_regen DECIMAL(5,2) := 0;
    v_equipment_stamina_regen DECIMAL(5,2) := 0;
    v_final_health_regen DECIMAL(5,2);
    v_final_mana_regen DECIMAL(5,2);
    v_final_stamina_regen DECIMAL(5,2);
BEGIN
    -- Получаем данные персонажа
    SELECT * INTO v_character FROM characters WHERE id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Character not found'
        );
    END IF;

    -- Базовая регенерация: 1.0 в секунду + бонусы от характеристик
    -- HP регенерация: 1.0 + (vitality * 0.05) + (level * 0.02)
    v_base_health_regen := 1.0 + (v_character.vitality * 0.05) + (v_character.level * 0.02);
    
    -- MP регенерация: 1.0 + (energy * 0.05) + (intelligence * 0.02) + (level * 0.01)
    v_base_mana_regen := 1.0 + (v_character.energy * 0.05) + (v_character.intelligence * 0.02) + (v_character.level * 0.01);
    
    -- Stamina регенерация: 1.0 + (dexterity * 0.08) + (vitality * 0.03) + (level * 0.02)
    v_base_stamina_regen := 1.0 + (v_character.dexterity * 0.08) + (v_character.vitality * 0.03) + (v_character.level * 0.02);

    -- Получаем бонусы от экипировки
    SELECT get_character_equipment(p_character_id) INTO v_equipment;
    
    -- Считаем бонусы от экипированных предметов
    IF v_equipment IS NOT NULL AND jsonb_typeof(v_equipment) = 'array' THEN
        SELECT 
            COALESCE(SUM((item->>'stats')::jsonb->>'health')::DECIMAL(5,2), 0),
            COALESCE(SUM((item->>'stats')::jsonb->>'mana')::DECIMAL(5,2), 0),
            COALESCE(SUM((item->>'stats')::jsonb->>'speed')::DECIMAL(5,2), 0)
        INTO 
            v_equipment_health_regen,
            v_equipment_mana_regen,
            v_equipment_stamina_regen
        FROM jsonb_array_elements(v_equipment) AS equipment_item,
             jsonb_array_elements(equipment_item->'item') AS item;
    END IF;

    -- Итоговая регенерация (базовая + экипировка)
    v_final_health_regen := v_base_health_regen + (v_equipment_health_regen * 0.1);
    v_final_mana_regen := v_base_mana_regen + (v_equipment_mana_regen * 0.1);
    v_final_stamina_regen := v_base_stamina_regen + (v_equipment_stamina_regen * 0.1);

    -- Обновляем регенерацию в базе данных
    UPDATE characters 
    SET 
        health_regen = v_final_health_regen,
        mana_regen = v_final_mana_regen,
        stamina_regen = v_final_stamina_regen,
        updated_at = NOW()
    WHERE id = p_character_id;

    RETURN json_build_object(
        'success', true,
        'health_regen', v_final_health_regen,
        'mana_regen', v_final_mana_regen,
        'stamina_regen', v_final_stamina_regen,
        'base_health_regen', v_base_health_regen,
        'base_mana_regen', v_base_mana_regen,
        'base_stamina_regen', v_base_stamina_regen,
        'equipment_bonus_health', v_equipment_health_regen * 0.1,
        'equipment_bonus_mana', v_equipment_mana_regen * 0.1,
        'equipment_bonus_stamina', v_equipment_stamina_regen * 0.1
    );
END;
$$ LANGUAGE plpgsql;

-- Функция для применения регенерации
CREATE OR REPLACE FUNCTION apply_regeneration(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_character characters%ROWTYPE;
    v_new_health INTEGER;
    v_new_mana INTEGER;
    v_new_stamina INTEGER;
    v_health_restored INTEGER := 0;
    v_mana_restored INTEGER := 0;
    v_stamina_restored INTEGER := 0;
BEGIN
    -- Получаем данные персонажа
    SELECT * INTO v_character FROM characters WHERE id = p_character_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Character not found'
        );
    END IF;

    -- Применяем регенерацию только если персонаж не в бою
    IF v_character.is_in_combat THEN
        RETURN json_build_object(
            'success', true,
            'message', 'No regeneration in combat',
            'health_restored', 0,
            'mana_restored', 0,
            'stamina_restored', 0
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

    -- Рассчитываем новую выносливость
    v_new_stamina := LEAST(
        v_character.stamina + CEIL(v_character.stamina_regen),
        v_character.max_stamina
    );
    v_stamina_restored := v_new_stamina - v_character.stamina;

    -- Обновляем ресурсы персонажа
    UPDATE characters 
    SET 
        health = v_new_health,
        mana = v_new_mana,
        stamina = v_new_stamina,
        updated_at = NOW()
    WHERE id = p_character_id;

    RETURN json_build_object(
        'success', true,
        'health_restored', v_health_restored,
        'mana_restored', v_mana_restored,
        'stamina_restored', v_stamina_restored,
        'new_health', v_new_health,
        'new_mana', v_new_mana,
        'new_stamina', v_new_stamina,
        'health_regen_rate', v_character.health_regen,
        'mana_regen_rate', v_character.mana_regen,
        'stamina_regen_rate', v_character.stamina_regen
    );
END;
$$ LANGUAGE plpgsql;

-- Функция для обновления регенерации при изменении характеристик
CREATE OR REPLACE FUNCTION update_character_regeneration()
RETURNS TRIGGER AS $$
BEGIN
    -- Пересчитываем регенерацию при изменении характеристик
    PERFORM calculate_character_regeneration(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического обновления регенерации
DROP TRIGGER IF EXISTS trigger_update_regeneration ON characters;
CREATE TRIGGER trigger_update_regeneration
    AFTER UPDATE OF strength, dexterity, intelligence, vitality, energy, level ON characters
    FOR EACH ROW
    EXECUTE FUNCTION update_character_regeneration();

SELECT '✅ Функции регенерации созданы!' as status;
