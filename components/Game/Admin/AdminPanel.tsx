'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateCharacterStats } from '@/lib/characterStats';
import { syncCharacterStats } from '@/lib/characterSync';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  character: any;
  onCharacterUpdate: () => void;
}

interface GameItem {
  id: string;
  item_key: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  type: string;
  subtype?: string;
  level_requirement: number;
  class_requirement?: string;
  base_value: number;
  stackable: boolean;
  max_stack: number;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, character, onCharacterUpdate }) => {
  const [availableItems, setAvailableItems] = useState<GameItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  // Загружаем доступные предметы
  useEffect(() => {
    if (isOpen) {
      loadAvailableItems();
    }
  }, [isOpen]);

  const loadAvailableItems = async () => {
    try {
      console.log('🔍 Загружаем доступные предметы...');
      
      const { data, error } = await (supabase as any)
        .from('items')
        .select('id, item_key, name, description, icon, rarity, type, subtype, level_requirement, class_requirement, base_value, stackable, max_stack')
        .order('name');

      if (error) {
        console.error('❌ Ошибка загрузки предметов:', error);
        throw error;
      }

      console.log('📦 Загружено предметов:', data?.length || 0, data);
      setAvailableItems(data || []);
    } catch (error) {
      console.error('❌ Ошибка загрузки предметов:', error);
      setMessage('Ошибка загрузки предметов');
    }
  };

  const addItemToInventory = async () => {
    if (!selectedItem || !character) {
      console.log('❌ Нет выбранного предмета или персонажа:', { selectedItem, character: character?.id });
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      console.log('🔍 Начинаем добавление предмета:', { 
        characterId: character.id, 
        itemId: selectedItem
      });

      // Находим свободный слот
      const { data: inventory, error: inventoryError } = await (supabase as any)
        .from('character_inventory')
        .select('slot_position')
        .eq('character_id', character.id)
        .order('slot_position');

      if (inventoryError) {
        console.error('❌ Ошибка получения инвентаря:', inventoryError);
        throw inventoryError;
      }

      console.log('📦 Текущий инвентарь:', inventory);

      const usedSlots = inventory?.map((item: any) => item.slot_position) || [];
      let freeSlot = 1;
      while (usedSlots.includes(freeSlot)) {
        freeSlot++;
      }

      console.log('🎯 Свободный слот:', freeSlot);

      // Добавляем предмет
      const insertData = {
        character_id: character.id,
        item_id: selectedItem,
        slot_position: freeSlot,
        quantity: 1
      };

      console.log('💾 Данные для вставки:', insertData);

      const { data: insertResult, error } = await (supabase as any)
        .from('character_inventory')
        .insert(insertData)
        .select();

      if (error) {
        console.error('❌ Ошибка вставки предмета:', error);
        throw error;
      }

      console.log('✅ Предмет успешно добавлен:', insertResult);

      setMessage(`✅ Предмет добавлен в слот ${freeSlot}`);
      onCharacterUpdate();
    } catch (error) {
      console.error('❌ Ошибка добавления предмета:', error);
      setMessage(`❌ Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const restoreHealth = async () => {
    if (!character) return;

    setIsLoading(true);
    setMessage('');

    try {
      const calculatedStats = calculateCharacterStats(character);
      
      const { error } = await (supabase as any)
        .from('characters')
        .update({ 
          health: calculatedStats.max_health,
          mana: calculatedStats.max_mana
        })
        .eq('id', character.id);

      if (error) throw error;

      setMessage('✅ HP/MP восстановлены');
      onCharacterUpdate();
    } catch (error) {
      console.error('Ошибка восстановления:', error);
      setMessage('❌ Ошибка восстановления');
    } finally {
      setIsLoading(false);
    }
  };

  const addGold = async (amount: number) => {
    if (!character) return;

    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await (supabase as any)
        .from('characters')
        .update({ gold: character.gold + amount })
        .eq('id', character.id);

      if (error) throw error;

      setMessage(`✅ Добавлено ${amount} золота`);
      onCharacterUpdate();
    } catch (error) {
      console.error('Ошибка добавления золота:', error);
      setMessage('❌ Ошибка добавления золота');
    } finally {
      setIsLoading(false);
    }
  };

  const addExperience = async (amount: number) => {
    if (!character) return;

    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await (supabase as any)
        .from('characters')
        .update({ experience: character.experience + amount })
        .eq('id', character.id);

      if (error) throw error;

      setMessage(`✅ Добавлено ${amount} опыта`);
      onCharacterUpdate();
    } catch (error) {
      console.error('Ошибка добавления опыта:', error);
      setMessage('❌ Ошибка добавления опыта');
    } finally {
      setIsLoading(false);
    }
  };

  const modifyStat = async (statName: string, amount: number) => {
    if (!character) return;

    setIsLoading(true);
    setMessage('');

    try {
      const currentValue = character[statName] || 0;
      const newValue = Math.max(0, currentValue + amount);

      const { error } = await (supabase as any)
        .from('characters')
        .update({ [statName]: newValue })
        .eq('id', character.id);

      if (error) throw error;

      // Синхронизируем статы
      const updatedCharacter = { ...character, [statName]: newValue };
      await syncCharacterStats(updatedCharacter);

      setMessage(`✅ ${statName}: ${currentValue} → ${newValue}`);
      onCharacterUpdate();
    } catch (error) {
      console.error('Ошибка изменения стата:', error);
      setMessage('❌ Ошибка изменения стата');
    } finally {
      setIsLoading(false);
    }
  };

  const changeLevel = async (newLevel: number) => {
    if (!character || newLevel < 1 || newLevel > 100) return;

    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await (supabase as any)
        .from('characters')
        .update({ level: newLevel })
        .eq('id', character.id);

      if (error) throw error;

      setMessage(`✅ Уровень изменен на ${newLevel}`);
      onCharacterUpdate();
    } catch (error) {
      console.error('Ошибка изменения уровня:', error);
      setMessage('❌ Ошибка изменения уровня');
    } finally {
      setIsLoading(false);
    }
  };

  const resetCharacter = async () => {
    if (!character) return;

    const confirmReset = window.confirm(
      `⚠️ ВНИМАНИЕ! Это действие полностью обнулит персонажа "${character.name}".\n\n` +
      `Будут удалены:\n` +
      `• Все предметы из инвентаря\n` +
      `• Вся экипировка\n` +
      `• Уровень и опыт\n` +
      `• Все очки характеристик\n` +
      `• Золото (останется только базовое)\n\n` +
      `Это действие НЕОБРАТИМО! Продолжить?`
    );

    if (!confirmReset) return;

    setIsLoading(true);
    setMessage('');

    try {
      console.log('🔄 Начинаем полное обнуление персонажа...');

      // 1. Удаляем все предметы из инвентаря
      const { error: inventoryError } = await (supabase as any)
        .from('character_inventory')
        .delete()
        .eq('character_id', character.id);

      if (inventoryError) throw inventoryError;
      console.log('✅ Инвентарь очищен');

      // 2. Удаляем всю экипировку
      const { error: equipmentError } = await (supabase as any)
        .from('character_equipment')
        .delete()
        .eq('character_id', character.id);

      if (equipmentError) throw equipmentError;
      console.log('✅ Экипировка удалена');

      // 3. Сбрасываем персонажа к начальному состоянию
      const { error: characterError } = await (supabase as any)
        .from('characters')
        .update({
          // Уровень и опыт
          level: 1,
          experience: 0,
          experience_to_next: 230, // XP для 2 уровня по новой формуле
          
          // Все статы к базовым значениям
          agility: 10,
          precision: 10,
          evasion: 10,
          intelligence: 10,
          spell_power: 10,
          resistance: 10,
          strength: 10,
          endurance: 10,
          armor: 10,
          stealth: 10,
          
          // Очки характеристик
          stat_points: 0,
          
          // Ресурсы
          health: 100,
          max_health: 100,
          mana: 50,
          max_mana: 50,
          
          // Золото
          gold: 100,
          
          // Сбрасываем рассчитанные статы
          attack_damage: 0,
          magic_damage: 0,
          defense: 0,
          magic_resistance: 0,
          critical_chance: 5.0,
          critical_damage: 150.0,
          attack_speed: 100.0,
          accuracy: 85.0,
          dodge_chance: 5.0,
          stealth_bonus: 0.0,
          health_regen: 1.0,
          mana_regen: 1.0
        })
        .eq('id', character.id);

      if (characterError) throw characterError;
      console.log('✅ Персонаж сброшен к начальному состоянию');

      // 4. Синхронизируем статы
      const resetCharacter = {
        ...character,
        level: 1,
        experience: 0,
        experience_to_next: 230,
        agility: 10,
        precision: 10,
        evasion: 10,
        intelligence: 10,
        spell_power: 10,
        resistance: 10,
        strength: 10,
        endurance: 10,
        armor: 10,
        stealth: 10,
        stat_points: 0,
        health: 100,
        max_health: 100,
        mana: 50,
        max_mana: 50,
        gold: 100
      };
      
      await syncCharacterStats(resetCharacter);
      console.log('✅ Статы синхронизированы');

      setMessage('✅ Персонаж полностью обнулен! Теперь он как новый.');
      onCharacterUpdate();
    } catch (error) {
      console.error('Ошибка обнуления персонажа:', error);
      setMessage('❌ Ошибка обнуления персонажа');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">🔧 Админ Панель</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-blue-900 border border-blue-700 rounded text-blue-200">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Добавление предметов */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">📦 Добавить предмет</h3>
              <button
                onClick={loadAvailableItems}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm"
              >
                🔄 Обновить
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="text-sm text-gray-400">
                Доступно предметов: {availableItems.length}
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Предмет:</label>
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="">Выберите предмет</option>
                  {availableItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.icon} {item.name} ({item.rarity}) - Ур.{item.level_requirement} - {item.base_value}💰
                    </option>
                  ))}
                </select>
              </div>


              <button
                onClick={addItemToInventory}
                disabled={!selectedItem || isLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded"
              >
                {isLoading ? 'Добавление...' : 'Добавить предмет'}
              </button>
            </div>
          </div>

          {/* Восстановление ресурсов */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">❤️ Восстановление</h3>
            
            <div className="space-y-3">
              <button
                onClick={restoreHealth}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 px-4 rounded"
              >
                {isLoading ? 'Восстановление...' : 'Восстановить HP/MP'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addGold(1000)}
                  disabled={isLoading}
                  className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white py-2 px-3 rounded text-sm"
                >
                  +1000 золота
                </button>
                <button
                  onClick={() => addGold(10000)}
                  disabled={isLoading}
                  className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white py-2 px-3 rounded text-sm"
                >
                  +10000 золота
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addExperience(1000)}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 px-3 rounded text-sm"
                >
                  +1000 опыта
                </button>
                <button
                  onClick={() => addExperience(10000)}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 px-3 rounded text-sm"
                >
                  +10000 опыта
                </button>
              </div>
            </div>
          </div>

          {/* Изменение статов */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">⚡ Статы</h3>
            
            <div className="space-y-2">
              {['agility', 'precision', 'evasion', 'intelligence', 'spell_power', 'resistance', 'strength', 'endurance', 'armor', 'stealth'].map(stat => (
                <div key={stat} className="flex items-center gap-2">
                  <span className="text-gray-300 w-20 text-sm capitalize">{stat}:</span>
                  <span className="text-white w-8">{character[stat] || 0}</span>
                  <button
                    onClick={() => modifyStat(stat, -1)}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-2 py-1 rounded text-sm"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => modifyStat(stat, 1)}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-2 py-1 rounded text-sm"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => modifyStat(stat, 10)}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-2 py-1 rounded text-sm"
                  >
                    +10
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Изменение уровня */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">📈 Уровень</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-300">Текущий уровень:</span>
                <span className="text-white font-semibold">{character.level}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => changeLevel(character.level - 1)}
                  disabled={isLoading || character.level <= 1}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 px-3 rounded text-sm"
                >
                  -1
                </button>
                <button
                  onClick={() => changeLevel(character.level + 1)}
                  disabled={isLoading || character.level >= 100}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-3 rounded text-sm"
                >
                  +1
                </button>
                <button
                  onClick={() => changeLevel(50)}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-3 rounded text-sm"
                >
                  Ур. 50
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => changeLevel(1)}
                  disabled={isLoading}
                  className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white py-2 px-3 rounded text-sm"
                >
                  Ур. 1
                </button>
                <button
                  onClick={() => changeLevel(100)}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-2 px-3 rounded text-sm"
                >
                  Ур. 100
                </button>
              </div>
            </div>
          </div>

          {/* Кнопка обнуления */}
          <div className="bg-red-900/50 border border-red-600 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-400 mb-4">⚠️ ОПАСНАЯ ЗОНА</h3>
            
            <div className="space-y-3">
              <p className="text-red-300 text-sm">
                Полностью обнуляет персонажа, удаляя все предметы, уровень и статы.
              </p>
              
              <button
                onClick={resetCharacter}
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-3 px-4 rounded font-semibold transition-colors"
              >
                {isLoading ? '⏳ Обнуляем...' : '💀 ОБНУЛИТЬ ПЕРСОНАЖА'}
              </button>
              
              <p className="text-red-400 text-xs text-center">
                Это действие НЕОБРАТИМО!
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-gray-800 rounded text-sm text-gray-400">
          <strong>Горячие клавиши:</strong> Ctrl+Shift+A - открыть/закрыть админ панель
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
