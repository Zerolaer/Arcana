import { Continent, Zone, FarmSpot, Mob } from '@/types/world'

// Уникальные мобы для каждой зоны
const getZoneMobs = (zoneId: string, baseLevel: number): Mob[] => {
  const zoneMobTemplates: Record<string, Array<{
    name: string
    icon: string
    rarity: 'common' | 'uncommon' | 'rare' | 'elite' | 'boss'
    healthMultiplier: number
    attackMultiplier: number
    defenseMultiplier: number
    expMultiplier: number
    goldMultiplier: number
  }>> = {
    // ЗОНА 1: Мирные Луга (1-5 уровень)
    'peaceful_meadows': [
      { name: 'Лесной Слизень', icon: '🟢', rarity: 'common', healthMultiplier: 15, attackMultiplier: 2, defenseMultiplier: 1, expMultiplier: 0.8, goldMultiplier: 1.5 },
      { name: 'Дикий Кролик', icon: '🐰', rarity: 'common', healthMultiplier: 12, attackMultiplier: 1.5, defenseMultiplier: 0.5, expMultiplier: 0.6, goldMultiplier: 1 },
      { name: 'Лесная Пчела', icon: '🐝', rarity: 'common', healthMultiplier: 10, attackMultiplier: 1.8, defenseMultiplier: 0.3, expMultiplier: 0.7, goldMultiplier: 1.2 },
      { name: 'Мирный Олень', icon: '🦌', rarity: 'uncommon', healthMultiplier: 25, attackMultiplier: 2.5, defenseMultiplier: 1.5, expMultiplier: 1.2, goldMultiplier: 2 }
    ],
    
    // ЗОНА 2: Темный Лес (6-12 уровень)
    'dark_forest': [
      { name: 'Дикий Волк', icon: '🐺', rarity: 'common', healthMultiplier: 20, attackMultiplier: 3, defenseMultiplier: 2, expMultiplier: 1.2, goldMultiplier: 2 },
      { name: 'Лесной Паук', icon: '🕷️', rarity: 'common', healthMultiplier: 18, attackMultiplier: 2.8, defenseMultiplier: 1.8, expMultiplier: 1.1, goldMultiplier: 1.8 },
      { name: 'Темный Медведь', icon: '🐻', rarity: 'uncommon', healthMultiplier: 35, attackMultiplier: 4.5, defenseMultiplier: 3, expMultiplier: 1.8, goldMultiplier: 3.5 },
      { name: 'Лесной Тролль', icon: '🧌', rarity: 'rare', healthMultiplier: 50, attackMultiplier: 6, defenseMultiplier: 4, expMultiplier: 2.5, goldMultiplier: 5 }
    ],
    
    // ЗОНА 3: Пещеры Гоблинов (13-20 уровень)
    'goblin_caves': [
      { name: 'Гоблин-Разведчик', icon: '👹', rarity: 'common', healthMultiplier: 25, attackMultiplier: 3.5, defenseMultiplier: 2, expMultiplier: 1.5, goldMultiplier: 2.5 },
      { name: 'Гоблин-Воин', icon: '⚔️', rarity: 'uncommon', healthMultiplier: 35, attackMultiplier: 4.5, defenseMultiplier: 3, expMultiplier: 2.0, goldMultiplier: 3.5 },
      { name: 'Гоблин-Шаман', icon: '🧙', rarity: 'uncommon', healthMultiplier: 30, attackMultiplier: 5, defenseMultiplier: 1.5, expMultiplier: 2.2, goldMultiplier: 4 },
      { name: 'Гоблин-Вожак', icon: '👑', rarity: 'rare', healthMultiplier: 60, attackMultiplier: 7, defenseMultiplier: 5, expMultiplier: 3.5, goldMultiplier: 7 }
    ],
    
    // ЗОНА 4: Пылающая Пустыня (21-28 уровень)
    'burning_desert': [
      { name: 'Песчаный Скорпион', icon: '🦂', rarity: 'common', healthMultiplier: 30, attackMultiplier: 4, defenseMultiplier: 2.5, expMultiplier: 2.0, goldMultiplier: 3 },
      { name: 'Огненная Ящерица', icon: '🦎', rarity: 'common', healthMultiplier: 25, attackMultiplier: 3.5, defenseMultiplier: 1.8, expMultiplier: 1.8, goldMultiplier: 2.8 },
      { name: 'Пустынный Джинн', icon: '🧞', rarity: 'uncommon', healthMultiplier: 45, attackMultiplier: 6, defenseMultiplier: 3, expMultiplier: 3.0, goldMultiplier: 5 },
      { name: 'Огненный Элементаль', icon: '🔥', rarity: 'rare', healthMultiplier: 70, attackMultiplier: 8, defenseMultiplier: 4, expMultiplier: 4.5, goldMultiplier: 8 }
    ],
    
    // ЗОНА 5: Ледяные Пики (29-35 уровень)
    'frozen_peaks': [
      { name: 'Ледяной Волк', icon: '🐺', rarity: 'common', healthMultiplier: 35, attackMultiplier: 4.5, defenseMultiplier: 3, expMultiplier: 2.5, goldMultiplier: 4 },
      { name: 'Снежный Йети', icon: '🦍', rarity: 'uncommon', healthMultiplier: 55, attackMultiplier: 6.5, defenseMultiplier: 4.5, expMultiplier: 3.5, goldMultiplier: 6 },
      { name: 'Ледяной Голем', icon: '🗿', rarity: 'rare', healthMultiplier: 80, attackMultiplier: 7, defenseMultiplier: 8, expMultiplier: 4.8, goldMultiplier: 9 },
      { name: 'Ледяной Дракон', icon: '🐉', rarity: 'elite', healthMultiplier: 120, attackMultiplier: 10, defenseMultiplier: 6, expMultiplier: 6.5, goldMultiplier: 12 }
    ],
    
    // ЗОНА 6: Проклятые Болота (36-40 уровень)
    'cursed_swamp': [
      { name: 'Болотная Лягушка', icon: '🐸', rarity: 'common', healthMultiplier: 40, attackMultiplier: 5, defenseMultiplier: 2, expMultiplier: 3.0, goldMultiplier: 4.5 },
      { name: 'Теневой Дух', icon: '👻', rarity: 'uncommon', healthMultiplier: 35, attackMultiplier: 6, defenseMultiplier: 1, expMultiplier: 3.5, goldMultiplier: 5.5 },
      { name: 'Болотный Тролль', icon: '🧌', rarity: 'uncommon', healthMultiplier: 65, attackMultiplier: 7.5, defenseMultiplier: 5, expMultiplier: 4.2, goldMultiplier: 7.5 },
      { name: 'Некромант', icon: '🧙‍♂️', rarity: 'rare', healthMultiplier: 80, attackMultiplier: 9, defenseMultiplier: 3, expMultiplier: 5.5, goldMultiplier: 10 }
    ],
    
    // ЗОНА 7: Вулканический Кратер (41-50 уровень)
    'volcanic_crater': [
      { name: 'Лавовый Слизень', icon: '🟠', rarity: 'common', healthMultiplier: 50, attackMultiplier: 6, defenseMultiplier: 3, expMultiplier: 4.0, goldMultiplier: 6 },
      { name: 'Огненный Демон', icon: '👹', rarity: 'uncommon', healthMultiplier: 70, attackMultiplier: 8, defenseMultiplier: 4, expMultiplier: 5.5, goldMultiplier: 8.5 },
      { name: 'Магма Голем', icon: '🌋', rarity: 'rare', healthMultiplier: 100, attackMultiplier: 10, defenseMultiplier: 8, expMultiplier: 7.0, goldMultiplier: 12 },
      { name: 'Вулканический Дракон', icon: '🐉', rarity: 'elite', healthMultiplier: 150, attackMultiplier: 12, defenseMultiplier: 6, expMultiplier: 9.0, goldMultiplier: 18 }
    ],
    
    // ЗОНА 8: Кристальные Пещеры (51-60 уровень)
    'crystal_caverns': [
      { name: 'Кристальный Паук', icon: '🕷️', rarity: 'common', healthMultiplier: 60, attackMultiplier: 7, defenseMultiplier: 4, expMultiplier: 5.5, goldMultiplier: 8 },
      { name: 'Кристальный Голем', icon: '💎', rarity: 'uncommon', healthMultiplier: 90, attackMultiplier: 9, defenseMultiplier: 10, expMultiplier: 7.5, goldMultiplier: 12 },
      { name: 'Кристальный Дракон', icon: '🐉', rarity: 'rare', healthMultiplier: 130, attackMultiplier: 11, defenseMultiplier: 7, expMultiplier: 9.5, goldMultiplier: 16 },
      { name: 'Древний Лич', icon: '👑', rarity: 'elite', healthMultiplier: 180, attackMultiplier: 14, defenseMultiplier: 8, expMultiplier: 12.0, goldMultiplier: 22 }
    ],
    
    // ЗОНА 9: Трон Драконов (61-75 уровень)
    'dragon_throne': [
      { name: 'Драконий Слуга', icon: '🐲', rarity: 'uncommon', healthMultiplier: 100, attackMultiplier: 10, defenseMultiplier: 6, expMultiplier: 8.0, goldMultiplier: 14 },
      { name: 'Древний Дракон', icon: '🐉', rarity: 'rare', healthMultiplier: 200, attackMultiplier: 15, defenseMultiplier: 10, expMultiplier: 15.0, goldMultiplier: 25 },
      { name: 'Повелитель Драконов', icon: '👑', rarity: 'elite', healthMultiplier: 300, attackMultiplier: 20, defenseMultiplier: 12, expMultiplier: 20.0, goldMultiplier: 35 },
      { name: 'Бог Драконов', icon: '🐉', rarity: 'boss', healthMultiplier: 500, attackMultiplier: 25, defenseMultiplier: 15, expMultiplier: 30.0, goldMultiplier: 50 }
    ]
  }

  const templates = zoneMobTemplates[zoneId] || zoneMobTemplates['peaceful_meadows']
  
  return templates.map((template, index) => {
    const level = baseLevel + index
    const health = Math.floor(template.healthMultiplier * level)
    const attack = Math.floor(template.attackMultiplier * level)
    const defense = Math.floor(template.defenseMultiplier * level)
    
    // Сбалансированные награды опыта (8-12 мобов для повышения уровня)
    const experience_reward = Math.max(7, Math.floor(template.expMultiplier * level * 0.8))
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
      loot_table: [] // Нет предметов в игре
    }
  })
}

// Создание фарм спотов для зоны с уникальными мобами в каждой ячейке
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
      
      // Создаем уникальный набор мобов для каждого спота
      const spotMobs: Mob[] = []
      const numMobs = Math.floor(Math.random() * 3) + 1 // 1-3 моба на спот
      
      // Выбираем случайных мобов из зоны
      const shuffledMobs = [...allZoneMobs].sort(() => Math.random() - 0.5)
      
      for (let i = 0; i < numMobs && i < shuffledMobs.length; i++) {
        const baseMob = shuffledMobs[i]
        // Создаем вариацию моба с небольшими изменениями уровня
        const levelVariation = Math.floor(Math.random() * 3) - 1 // -1, 0, или +1
        const mobLevel = Math.max(1, baseLevel + levelVariation)
        
        spotMobs.push({
          ...baseMob,
          id: `${baseMob.id}_spot_${spotIndex}`,
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

// КОНТИНЕНТ 1: Начальные земли (1-20 уровень)
const beginnerContinent: Continent = {
  id: 'beginner_lands',
  name: 'Начальные Земли',
  description: 'Мирные земли для новичков, где можно изучить основы боя',
  level_range: { min: 1, max: 20 },
  map_position: { x: 0, y: 1 },
  color_theme: 'green',
  zones: [
    {
      id: 'peaceful_meadows',
      name: 'Мирные Луга',
      description: 'Спокойные луга с простыми противниками',
      level_range: { min: 1, max: 5 },
      continent_id: 'beginner_lands',
      farm_spots: createFarmSpots('peaceful_meadows', 1)
    },
    {
      id: 'dark_forest',
      name: 'Темный Лес',
      description: 'Густой лес, полный опасностей',
      level_range: { min: 6, max: 12 },
      continent_id: 'beginner_lands',
      farm_spots: createFarmSpots('dark_forest', 6)
    },
    {
      id: 'goblin_caves',
      name: 'Пещеры Гоблинов',
      description: 'Подземные пещеры, кишащие гоблинами',
      level_range: { min: 13, max: 20 },
      continent_id: 'beginner_lands',
      farm_spots: createFarmSpots('goblin_caves', 13)
    }
  ]
}

// КОНТИНЕНТ 2: Дикие Земли (21-40 уровень)
const wildContinent: Continent = {
  id: 'wild_lands',
  name: 'Дикие Земли',
  description: 'Суровые земли с сильными противниками',
  level_range: { min: 21, max: 40 },
  map_position: { x: 1, y: 0 },
  color_theme: 'orange',
  unlock_requirements: {
    level: 21
  },
  zones: [
    {
      id: 'burning_desert',
      name: 'Пылающая Пустыня',
      description: 'Жаркая пустыня с огненными существами',
      level_range: { min: 21, max: 28 },
      continent_id: 'wild_lands',
      farm_spots: createFarmSpots('burning_desert', 21)
    },
    {
      id: 'frozen_peaks',
      name: 'Ледяные Пики',
      description: 'Заснеженные горы с ледяными монстрами',
      level_range: { min: 29, max: 35 },
      continent_id: 'wild_lands',
      farm_spots: createFarmSpots('frozen_peaks', 29)
    },
    {
      id: 'cursed_swamp',
      name: 'Проклятые Болота',
      description: 'Мрачные болота с нежитью',
      level_range: { min: 36, max: 40 },
      continent_id: 'wild_lands',
      farm_spots: createFarmSpots('cursed_swamp', 36)
    }
  ]
}

// КОНТИНЕНТ 3: Драконьи Земли (41-75 уровень)
const dragonContinent: Continent = {
  id: 'dragon_lands',
  name: 'Драконьи Земли',
  description: 'Легендарные земли, где правят драконы',
  level_range: { min: 41, max: 75 },
  map_position: { x: 2, y: 1 },
  color_theme: 'red',
  unlock_requirements: {
    level: 41
  },
  zones: [
    {
      id: 'volcanic_crater',
      name: 'Вулканический Кратер',
      description: 'Активный вулкан с лавовыми элементалями',
      level_range: { min: 41, max: 50 },
      continent_id: 'dragon_lands',
      farm_spots: createFarmSpots('volcanic_crater', 41)
    },
    {
      id: 'crystal_caverns',
      name: 'Кристальные Пещеры',
      description: 'Пещеры, полные магических кристаллов',
      level_range: { min: 51, max: 60 },
      continent_id: 'dragon_lands',
      farm_spots: createFarmSpots('crystal_caverns', 51)
    },
    {
      id: 'dragon_throne',
      name: 'Трон Драконов',
      description: 'Логово древних драконов',
      level_range: { min: 61, max: 75 },
      continent_id: 'dragon_lands',
      farm_spots: createFarmSpots('dragon_throne', 61)
    }
  ]
}

export const WORLD_DATA: Continent[] = [
  beginnerContinent,
  wildContinent,
  dragonContinent
]

// Функция для получения доступных континентов для игрока
export const getAvailableContinents = (playerLevel: number): Continent[] => {
  return WORLD_DATA.filter(continent => {
    if (!continent.unlock_requirements) return true
    return playerLevel >= (continent.unlock_requirements.level || 1)
  })
}

// Функция для получения доступных зон континента
export const getAvailableZones = (continentId: string, playerLevel: number): Zone[] => {
  const continent = WORLD_DATA.find(c => c.id === continentId)
  if (!continent) return []
  
  return continent.zones.filter(zone => {
    if (!zone.unlock_requirements) return true
    return playerLevel >= (zone.unlock_requirements.level || 1)
  })
}
