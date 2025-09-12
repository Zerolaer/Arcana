-- ================================================
-- ФУНКЦИЯ ДЛЯ СБРОСА НАВЫКОВ ПЕРСОНАЖА
-- ================================================

-- Функция для сброса всех навыков персонажа
CREATE OR REPLACE FUNCTION reset_character_skills(p_character_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Удаляем все изученные навыки персонажа
    DELETE FROM character_skills 
    WHERE character_id = p_character_id;
    
    -- Возвращаем успешный результат
    v_result := json_build_object(
        'success', true,
        'message', 'Все навыки персонажа сброшены'
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;
