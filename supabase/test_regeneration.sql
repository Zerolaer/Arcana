-- ============================================
-- ТЕСТ СИСТЕМЫ РЕГЕНЕРАЦИИ
-- ============================================

-- Показываем текущие значения регенерации
SELECT 
    name,
    level,
    vitality,
    energy,
    intelligence,
    dexterity,
    health_regen,
    mana_regen,
    stamina_regen,
    health,
    max_health,
    mana,
    max_mana,
    stamina,
    max_stamina
FROM characters 
ORDER BY created_at DESC 
LIMIT 3;

-- Тестируем функцию расчета регенерации
SELECT '=== ТЕСТ РАСЧЕТА РЕГЕНЕРАЦИИ ===' as info;

-- Получаем ID первого персонажа для теста
DO $$
DECLARE
    test_character_id UUID;
    regen_result JSON;
BEGIN
    -- Получаем ID первого персонажа
    SELECT id INTO test_character_id FROM characters LIMIT 1;
    
    IF test_character_id IS NOT NULL THEN
        -- Тестируем расчет регенерации
        SELECT calculate_character_regeneration(test_character_id) INTO regen_result;
        RAISE NOTICE 'Результат расчета регенерации: %', regen_result;
        
        -- Тестируем применение регенерации
        SELECT apply_regeneration(test_character_id) INTO regen_result;
        RAISE NOTICE 'Результат применения регенерации: %', regen_result;
    ELSE
        RAISE NOTICE 'Персонажи не найдены';
    END IF;
END $$;

SELECT '✅ Тест регенерации завершен!' as status;
