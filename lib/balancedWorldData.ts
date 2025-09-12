import { Continent, Zone, FarmSpot, Mob } from '@/types/world'

// Уникальные мобы для каждой зоны с балансировкой для группового боя
const getZoneMobs = (zoneId: string, baseLevel: number): Mob[] => {
  const zoneMobTemplates: Record<string, Array<{
    name: string
    icon: string
    rarity: 'common' | 'uncommon' | 'rare' | 'elite' | 'boss'
    // Уменьшенные множители для группового боя
    healthMultiplier: number
    attackMultiplier: number
    defenseMultiplier: number
    expMultiplier: number
    goldMultiplier: number
    // Новые параметры для группового боя
    groupSize: number // Рекомендуемый размер группы
    speed: number // Скорость атаки
  }>> = {
    // ЗОНА 1: Мирные Луга (1-5 уровень)
    'peaceful_meadows': [
      { name: 'Лесной Слизень', icon: '🟢', rarity: 'common', healthMultiplier: 8, attackMultiplier: 1.2, defenseMultiplier: 0.8, expMultiplier: 0.6, goldMultiplier: 1.2, groupSize: 3, speed: 80 },
      { name: 'Дикий Кролик', icon: '🐰', rarity: 'common', healthMultiplier: 6, attackMultiplier: 1.0, defenseMultiplier: 0.4, expMultiplier: 0.5, goldMultiplier: 0.8, groupSize: 4, speed: 120 },
      { name: 'Лесная Пчела', icon: '🐝', rarity: 'common', healthMultiplier: 5, attackMultiplier: 1.1, defenseMultiplier: 0.2, expMultiplier: 0.4, goldMultiplier: 0.9, groupSize: 4, speed: 150 },
      { name: 'Мирный Олень', icon: '🦌', rarity: 'uncommon', healthMultiplier: 15, attackMultiplier: 1.8, defenseMultiplier: 1.2, expMultiplier: 1.0, goldMultiplier: 1.8, groupSize: 2, speed: 90 }
    ],
    
    // ЗОНА 2: Темный Лес (6-12 уровень)
    'dark_forest': [
      { name: 'Дикий Волк', icon: '🐺', rarity: 'common', healthMultiplier: 12, attackMultiplier: 2.0, defenseMultiplier: 1.5, expMultiplier: 1.0, goldMultiplier: 1.6, groupSize: 3, speed: 100 },
      { name: 'Лесной Паук', icon: '🕷️', rarity: 'common', healthMultiplier: 10, attackMultiplier: 1.8, defenseMultiplier: 1.2, expMultiplier: 0.9, goldMultiplier: 1.4, groupSize: 4, speed: 110 },
      { name: 'Темный Медведь', icon: '🐻', rarity: 'uncommon', healthMultiplier: 20, attackMultiplier: 3.0, defenseMultiplier: 2.5, expMultiplier: 1.5, goldMultiplier: 2.8, groupSize: 2, speed: 70 },
      { name: 'Лесной Тролль', icon: '🧌', rarity: 'rare', healthMultiplier: 30, attackMultiplier: 4.0, defenseMultiplier: 3.0, expMultiplier: 2.0, goldMultiplier: 4.0, groupSize: 1, speed: 60 }
    ],
    
    // ЗОНА 3: Пещеры Гоблинов (13-20 уровень)
    'goblin_caves': [
      { name: 'Гоблин-Разведчик', icon: '👹', rarity: 'common', healthMultiplier: 15, attackMultiplier: 2.5, defenseMultiplier: 1.5, expMultiplier: 1.2, goldMultiplier: 2.0, groupSize: 4, speed: 90 },
      { name: 'Гоблин-Воин', icon: '⚔️', rarity: 'uncommon', healthMultiplier: 20, attackMultiplier: 3.0, defenseMultiplier: 2.0, expMultiplier: 1.5, goldMultiplier: 2.8, groupSize: 3, speed: 80 },
      { name: 'Гоблин-Шаман', icon: '🧙', rarity: 'uncommon', healthMultiplier: 18, attackMultiplier: 3.5, defenseMultiplier: 1.0, expMultiplier: 1.6, goldMultiplier: 3.2, groupSize: 3, speed: 85 },
      { name: 'Гоблин-Вожак', icon: '👑', rarity: 'rare', healthMultiplier: 35, attackMultiplier: 4.5, defenseMultiplier: 3.5, expMultiplier: 2.5, goldMultiplier: 5.5, groupSize: 1, speed: 70 }
    ],
    
    // ЗОНА 4: Пылающая Пустыня (21-28 уровень)
    'burning_desert': [
      { name: 'Песчаный Скорпион', icon: '🦂', rarity: 'common', healthMultiplier: 18, attackMultiplier: 2.8, defenseMultiplier: 2.0, expMultiplier: 1.5, goldMultiplier: 2.4, groupSize: 3, speed: 95 },
      { name: 'Огненная Ящерица', icon: '🦎', rarity: 'common', healthMultiplier: 15, attackMultiplier: 2.5, defenseMultiplier: 1.5, expMultiplier: 1.3, goldMultiplier: 2.2, groupSize: 4, speed: 105 },
      { name: 'Пустынный Джинн', icon: '🧞', rarity: 'uncommon', healthMultiplier: 25, attackMultiplier: 4.0, defenseMultiplier: 2.5, expMultiplier: 2.0, goldMultiplier: 4.0, groupSize: 2, speed: 75 },
      { name: 'Огненный Элементаль', icon: '🔥', rarity: 'rare', healthMultiplier: 40, attackMultiplier: 5.5, defenseMultiplier: 3.0, expMultiplier: 3.0, goldMultiplier: 6.0, groupSize: 1, speed: 65 }
    ],
    
    // ЗОНА 5: Ледяные Пики (29-35 уровень)
    'frozen_peaks': [
      { name: 'Ледяной Волк', icon: '🐺', rarity: 'common', healthMultiplier: 20, attackMultiplier: 3.2, defenseMultiplier: 2.2, expMultiplier: 1.8, goldMultiplier: 3.2, groupSize: 3, speed: 85 },
      { name: 'Снежный Йети', icon: '🦍', rarity: 'uncommon', healthMultiplier: 30, attackMultiplier: 4.5, defenseMultiplier: 3.5, expMultiplier: 2.5, goldMultiplier: 4.8, groupSize: 2, speed: 70 },
      { name: 'Ледяной Элементаль', icon: '❄️', rarity: 'uncommon', healthMultiplier: 25, attackMultiplier: 4.0, defenseMultiplier: 2.8, expMultiplier: 2.2, goldMultiplier: 4.2, groupSize: 2, speed: 75 },
      { name: 'Ледяной Дракон', icon: '🐉', rarity: 'rare', healthMultiplier: 50, attackMultiplier: 6.0, defenseMultiplier: 4.5, expMultiplier: 3.5, goldMultiplier: 7.0, groupSize: 1, speed: 60 }
    ],
    
    // ЗОНА 6: Забытые Руины (36-42 уровень)
    'forgotten_ruins': [
      { name: 'Скелет-Воин', icon: '💀', rarity: 'common', healthMultiplier: 22, attackMultiplier: 3.5, defenseMultiplier: 2.5, expMultiplier: 2.0, goldMultiplier: 3.6, groupSize: 3, speed: 80 },
      { name: 'Призрачный Страж', icon: '👻', rarity: 'uncommon', healthMultiplier: 28, attackMultiplier: 4.2, defenseMultiplier: 3.0, expMultiplier: 2.5, goldMultiplier: 4.5, groupSize: 2, speed: 75 },
      { name: 'Древний Лич', icon: '🧙', rarity: 'uncommon', healthMultiplier: 35, attackMultiplier: 5.0, defenseMultiplier: 3.5, expMultiplier: 3.0, goldMultiplier: 5.5, groupSize: 2, speed: 70 },
      { name: 'Король Мертвых', icon: '👑', rarity: 'rare', healthMultiplier: 60, attackMultiplier: 7.0, defenseMultiplier: 5.0, expMultiplier: 4.0, goldMultiplier: 8.0, groupSize: 1, speed: 55 }
    ],
    
    // ЗОНА 7: Адские Врата (43-50 уровень)
    'hell_gates': [
      { name: 'Демон-Слуга', icon: '😈', rarity: 'common', healthMultiplier: 25, attackMultiplier: 4.0, defenseMultiplier: 3.0, expMultiplier: 2.5, goldMultiplier: 4.0, groupSize: 3, speed: 85 },
      { name: 'Адский Пес', icon: '🐕', rarity: 'uncommon', healthMultiplier: 32, attackMultiplier: 4.8, defenseMultiplier: 3.5, expMultiplier: 3.0, goldMultiplier: 5.0, groupSize: 2, speed: 90 },
      { name: 'Демон-Воин', icon: '⚔️', rarity: 'uncommon', healthMultiplier: 40, attackMultiplier: 5.5, defenseMultiplier: 4.0, expMultiplier: 3.5, goldMultiplier: 6.0, groupSize: 2, speed: 75 },
      { name: 'Повелитель Демонов', icon: '👑', rarity: 'rare', healthMultiplier: 70, attackMultiplier: 8.0, defenseMultiplier: 6.0, expMultiplier: 5.0, goldMultiplier: 10.0, groupSize: 1, speed: 60 }
    ],
    
    // ЗОНА 8: Кристальные Пещеры (51-60 уровень)
    'crystal_caverns': [
      { name: 'Кристальный Паук', icon: '🕷️', rarity: 'common', healthMultiplier: 30, attackMultiplier: 4.5, defenseMultiplier: 3.5, expMultiplier: 3.0, goldMultiplier: 5.0, groupSize: 3, speed: 80 },
      { name: 'Кристальный Голем', icon: '💎', rarity: 'uncommon', healthMultiplier: 45, attackMultiplier: 6.0, defenseMultiplier: 6.0, expMultiplier: 4.0, goldMultiplier: 7.5, groupSize: 2, speed: 65 },
      { name: 'Кристальный Дракон', icon: '🐉', rarity: 'rare', healthMultiplier: 65, attackMultiplier: 7.5, defenseMultiplier: 5.0, expMultiplier: 5.5, goldMultiplier: 10.0, groupSize: 1, speed: 70 },
      { name: 'Древний Лич', icon: '👑', rarity: 'elite', healthMultiplier: 90, attackMultiplier: 9.0, defenseMultiplier: 6.5, expMultiplier: 7.0, goldMultiplier: 14.0, groupSize: 1, speed: 55 }
    ],
    
    // ЗОНА 9: Трон Драконов (61-75 уровень)
    'dragon_throne': [
      { name: 'Драконий Слуга', icon: '🐲', rarity: 'uncommon', healthMultiplier: 50, attackMultiplier: 6.5, defenseMultiplier: 4.5, expMultiplier: 5.0, goldMultiplier: 8.0, groupSize: 2, speed: 75 },
      { name: 'Древний Дракон', icon: '🐉', rarity: 'rare', healthMultiplier: 100, attackMultiplier: 10.0, defenseMultiplier: 7.0, expMultiplier: 8.0, goldMultiplier: 15.0, groupSize: 1, speed: 60 },
      { name: 'Повелитель Драконов', icon: '👑', rarity: 'elite', healthMultiplier: 150, attackMultiplier: 12.0, defenseMultiplier: 8.0, expMultiplier: 10.0, goldMultiplier: 20.0, groupSize: 1, speed: 50 },
      { name: 'Бог Драконов', icon: '🐉', rarity: 'boss', healthMultiplier: 250, attackMultiplier: 15.0, defenseMultiplier: 10.0, expMultiplier: 15.0, goldMultiplier: 30.0, groupSize: 1, speed: 45 }
    ]
  }

  const templates = zoneMobTemplates[zoneId] || zoneMobTemplates['peaceful_meadows']
  
  return templates.map((template, index) => {
    const level = baseLevel + index
    const health = Math.floor(template.healthMultiplier * level)
    const attack = Math.floor(template.attackMultiplier * level)
    const defense = Math.floor(template.defenseMultiplier * level)
    
    // Сбалансированные награды для группового боя
    const experience_reward = Math.max(5, Math.floor(template.expMultiplier * level * 0.6))
    const gold_reward = Math.floor(template.goldMultiplier * level)

    return {
      id: `${template.name.toLowerCase().replace(/\s+/g, '_')}_${zoneId}_${level}`,
      name: template.name,
      level,
      health,
      attack,
      defense,
      experience_reward,
      gold_reward,
      icon: template.icon,
      rarity: template.rarity,
      speed: template.speed,
      loot_table: [] // Нет предметов в игре
    }
  })
}

// Создание фарм спотов для зоны с балансировкой для группового боя
const createFarmSpots = (zoneId: string, baseLevel: number, gridSize: number = 4): FarmSpot[] => {
  const spots: FarmSpot[] = []
  const allZoneMobs = getZoneMobs(zoneId, baseLevel)
  
  // Создаем уникальные имена для спотов
  const spotNames = [
    'Тихая Поляна', 'Заросший Угол', 'Теневой Участок', 'Солнечная Лужайка',
    'Каменная Гряда', 'Ручейковый Берег', 'Старый Дуб', 'Мшистая Тропа',
    'Ветреный Холм', 'Тихий Овраг', 'Цветущий Луг', 'Темная Чаща',
    'Скалистый Уступ', 'Песчаная Дюна', 'Ледяная Расщелина', 'Огненная Яма'
  ]
  
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const spotIndex = x * gridSize + y
      const spotName = spotNames[spotIndex] || `Участок ${x + 1}-${y + 1}`
      
      // Создаем сбалансированную группу мобов для каждого спота
      const spotMobs: Mob[] = []
      
      // Выбираем случайного моба как основу
      const baseMob = allZoneMobs[Math.floor(Math.random() * allZoneMobs.length)]
      const groupSize = Math.min((baseMob as any).groupSize || 2, 4) // Максимум 4 моба в группе
      
      // Создаем группу мобов
      for (let i = 0; i < groupSize; i++) {
        const levelVariation = Math.floor(Math.random() * 3) - 1 // -1, 0, или +1
        const mobLevel = Math.max(1, baseLevel + levelVariation)
        
        spotMobs.push({
          ...baseMob,
          id: `${baseMob.id}_spot_${spotIndex}_${i}`,
          level: mobLevel,
          health: Math.floor(baseMob.health * (mobLevel / baseLevel)),
          attack: Math.floor(baseMob.attack * (mobLevel / baseLevel)),
          defense: Math.floor(baseMob.defense * (mobLevel / baseLevel)),
          experience_reward: Math.floor(baseMob.experience_reward * (mobLevel / baseLevel)),
          gold_reward: Math.floor(baseMob.gold_reward * (mobLevel / baseLevel))
        })
      }
      
      spots.push({
        id: `${zoneId}_spot_${x}_${y}`,
        name: spotName,
        position: { x, y },
        mobs: spotMobs,
        level_range: { min: baseLevel - 1, max: baseLevel + 3 },
        zone_id: zoneId
      })
    }
  }
  
  return spots
}

// Остальной код остается таким же...
export const WORLD_DATA: Continent[] = [
  {
    id: 'continent_1',
    name: 'Мирные Земли',
    description: 'Безопасные территории для начинающих искателей приключений',
    level_range: { min: 1, max: 20 },
    map_position: { x: 0, y: 0 },
    color_theme: 'green',
    zones: [
      {
        id: 'peaceful_meadows',
        name: 'Мирные Луга',
        description: 'Спокойные луга с мирными существами',
        level_range: { min: 1, max: 5 },
        farm_spots: createFarmSpots('peaceful_meadows', 1),
        continent_id: 'continent_1'
      },
      {
        id: 'dark_forest',
        name: 'Темный Лес',
        description: 'Густой лес с опасными хищниками',
        level_range: { min: 6, max: 12 },
        farm_spots: createFarmSpots('dark_forest', 6),
        continent_id: 'continent_1'
      },
      {
        id: 'goblin_caves',
        name: 'Пещеры Гоблинов',
        description: 'Подземные туннели, населенные гоблинами',
        level_range: { min: 13, max: 20 },
        farm_spots: createFarmSpots('goblin_caves', 13),
        continent_id: 'continent_1'
      }
    ]
  },
  {
    id: 'continent_2',
    name: 'Опасные Территории',
    description: 'Земли, полные опасностей и сокровищ',
    level_range: { min: 21, max: 50 },
    map_position: { x: 1, y: 0 },
    color_theme: 'red',
    zones: [
      {
        id: 'burning_desert',
        name: 'Пылающая Пустыня',
        description: 'Раскаленная пустыня с огненными существами',
        level_range: { min: 21, max: 28 },
        farm_spots: createFarmSpots('burning_desert', 21),
        continent_id: 'continent_2'
      },
      {
        id: 'frozen_peaks',
        name: 'Ледяные Пики',
        description: 'Замерзшие горы с ледяными монстрами',
        level_range: { min: 29, max: 35 },
        farm_spots: createFarmSpots('frozen_peaks', 29),
        continent_id: 'continent_2'
      },
      {
        id: 'forgotten_ruins',
        name: 'Забытые Руины',
        description: 'Древние руины с нежитью',
        level_range: { min: 36, max: 42 },
        farm_spots: createFarmSpots('forgotten_ruins', 36),
        continent_id: 'continent_2'
      },
      {
        id: 'hell_gates',
        name: 'Адские Врата',
        description: 'Портал в ад с демонами',
        level_range: { min: 43, max: 50 },
        farm_spots: createFarmSpots('hell_gates', 43),
        continent_id: 'continent_2'
      }
    ]
  },
  {
    id: 'continent_3',
    name: 'Эпические Земли',
    description: 'Самые опасные территории для опытных героев',
    level_range: { min: 51, max: 75 },
    map_position: { x: 2, y: 0 },
    color_theme: 'purple',
    zones: [
      {
        id: 'crystal_caverns',
        name: 'Кристальные Пещеры',
        description: 'Пещеры, полные кристальных существ',
        level_range: { min: 51, max: 60 },
        farm_spots: createFarmSpots('crystal_caverns', 51),
        continent_id: 'continent_3'
      },
      {
        id: 'dragon_throne',
        name: 'Трон Драконов',
        description: 'Обитель древних драконов',
        level_range: { min: 61, max: 75 },
        farm_spots: createFarmSpots('dragon_throne', 61),
        continent_id: 'continent_3'
      }
    ]
  }
]

export function getAvailableContinents(level: number): Continent[] {
  return WORLD_DATA.filter(continent => level >= continent.level_range.min && level <= continent.level_range.max)
}

export function getAvailableZones(level: number): Zone[] {
  const availableContinents = getAvailableContinents(level)
  const allZones: Zone[] = []
  
  availableContinents.forEach(continent => {
    allZones.push(...continent.zones)
  })
  
  return allZones.filter(zone => level >= zone.level_range.min && level <= zone.level_range.max)
}
