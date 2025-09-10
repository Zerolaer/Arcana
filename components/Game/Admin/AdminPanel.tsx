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
  name: string;
  icon: string;
  grade_id: string;
  equipment_slot?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, character, onCharacterUpdate }) => {
  const [availableItems, setAvailableItems] = useState<GameItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [itemQuality, setItemQuality] = useState<number>(75);
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
        .from('items_new')
        .select('id, name, icon, grade_id, equipment_slot')
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
        itemId: selectedItem, 
        quality: itemQuality 
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
        quality: itemQuality,
        stack_size: 1
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
          mana: calculatedStats.max_mana,
          stamina: calculatedStats.max_stamina
        })
        .eq('id', character.id);

      if (error) throw error;

      setMessage('✅ HP/MP/Stamina восстановлены');
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
            <h3 className="text-lg font-semibold text-white mb-4">📦 Добавить предмет</h3>
            
            <div className="space-y-3">
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
                      {item.icon} {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Качество: {itemQuality}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={itemQuality}
                  onChange={(e) => setItemQuality(Number(e.target.value))}
                  className="w-full"
                />
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
                {isLoading ? 'Восстановление...' : 'Восстановить HP/MP/Stamina'}
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
              {['strength', 'agility', 'intelligence', 'vitality', 'luck'].map(stat => (
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
        </div>

        <div className="mt-6 p-3 bg-gray-800 rounded text-sm text-gray-400">
          <strong>Горячие клавиши:</strong> Ctrl+Shift+A - открыть/закрыть админ панель
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
