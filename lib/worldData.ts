import { Continent, Zone, FarmSpot, Mob } from '@/types/world'

// Разнообразные мобы для разных уровней
const createMobs = (baseLevel: number): Mob[] => {
  const mobTemplates: Array<{
    name: string
    icon: string
    rarity: 'common' | 'uncommon' | 'rare' | 'elite' | 'boss'
    healthMultiplier: number
    attackMultiplier: number
    defenseMultiplier: number
    expMultiplier: number
    goldMultiplier: number
  }> = [
    // Начальные мобы (1-20 уровень)
    {
      name: 'Лесной Слизень',
      icon: '🟢',
      rarity: 'common',
      healthMultiplier: 15,
      attackMultiplier: 2,
      defenseMultiplier: 1,
      expMultiplier: 0.8,
      goldMultiplier: 1.5
    },
    {
      name: 'Дикий Кролик',
      icon: '🐰',
      rarity: 'common',
      healthMultiplier: 12,
      attackMultiplier: 1.5,
      defenseMultiplier: 0.5,
      expMultiplier: 0.6,
      goldMultiplier: 1
    },
    {
      name: 'Дикий Волк',
      icon: '🐺',
      rarity: 'common',
      healthMultiplier: 20,
      attackMultiplier: 3,
      defenseMultiplier: 2,
      expMultiplier: 1.2,
      goldMultiplier: 2
    },
    {
      name: 'Гигантский Паук',
      icon: '🕷️',
      rarity: 'uncommon',
      healthMultiplier: 25,
      attackMultiplier: 4,
      defenseMultiplier: 3,
      expMultiplier: 1.5,
      goldMultiplier: 2.5
    },
    {
      name: 'Лесной Страж',
      icon: '🌳',
      rarity: 'uncommon',
      healthMultiplier: 30,
      attackMultiplier: 3.5,
      defenseMultiplier: 4,
      expMultiplier: 1.8,
      goldMultiplier: 3
    },
    {
      name: 'Лесной Орк',
      icon: '👹',
      rarity: 'uncommon',
      healthMultiplier: 35,
      attackMultiplier: 5,
      defenseMultiplier: 3,
      expMultiplier: 2.2,
      goldMultiplier: 4
    },
    // Средние мобы (21-40 уровень)
    {
      name: 'Пещерная Летучая Мышь',
      icon: '🦇',
      rarity: 'common',
      healthMultiplier: 22,
      attackMultiplier: 4,
      defenseMultiplier: 2,
      expMultiplier: 1.8,
      goldMultiplier: 2.5
    },
    {
      name: 'Каменный Голем',
      icon: '🗿',
      rarity: 'rare',
      healthMultiplier: 60,
      attackMultiplier: 6,
      defenseMultiplier: 8,
      expMultiplier: 3.5,
      goldMultiplier: 6
    },
    {
      name: 'Теневой Убийца',
      icon: '🥷',
      rarity: 'rare',
      healthMultiplier: 40,
      attackMultiplier: 8,
      defenseMultiplier: 4,
      expMultiplier: 4.2,
      goldMultiplier: 7
    },
    // Высокие мобы (41+ уровень)
    {
      name: 'Скелет-Воин',
      icon: '💀',
      rarity: 'uncommon',
      healthMultiplier: 45,
      attackMultiplier: 7,
      defenseMultiplier: 5,
      expMultiplier: 3.8,
      goldMultiplier: 6.5
    },
    {
      name: 'Некромант',
      icon: '🧙‍♂️',
      rarity: 'rare',
      healthMultiplier: 50,
      attackMultiplier: 9,
      defenseMultiplier: 3,
      expMultiplier: 4.5,
      goldMultiplier: 8
    },
    {
      name: 'Древний Лич',
      icon: '👑',
      rarity: 'elite',
      healthMultiplier: 80,
      attackMultiplier: 12,
      defenseMultiplier: 6,
      expMultiplier: 6.5,
      goldMultiplier: 12
    },
    {
      name: 'Огненный Элементаль',
      icon: '🔥',
      rarity: 'elite',
      healthMultiplier: 70,
      attackMultiplier: 11,
      defenseMultiplier: 4,
      expMultiplier: 6.0,
      goldMultiplier: 10
    },
    {
      name: 'Лавовый Голем',
      icon: '🌋',
      rarity: 'elite',
      healthMultiplier: 100,
      attackMultiplier: 14,
      defenseMultiplier: 10,
      expMultiplier: 7.5,
      goldMultiplier: 15
    },
    {
      name: 'Огненный Дракон',
      icon: '🐉',
      rarity: 'boss',
      healthMultiplier: 150,
      attackMultiplier: 18,
      defenseMultiplier: 8,
      expMultiplier: 10.0,
      goldMultiplier: 25
    }
  ]

  // Выбираем мобов в зависимости от уровня
  let selectedMobs = []
  
  if (baseLevel <= 20) {
    // Начальные мобы
    selectedMobs = mobTemplates.slice(0, 6)
  } else if (baseLevel <= 40) {
    // Средние мобы
    selectedMobs = mobTemplates.slice(3, 9)
  } else {
    // Высокие мобы
    selectedMobs = mobTemplates.slice(6)
  }

  return selectedMobs.map((template, index) => {
    const level = baseLevel + index
    const health = Math.floor(template.healthMultiplier * level)
    const attack = Math.floor(template.attackMultiplier * level)
    const defense = Math.floor(template.defenseMultiplier * level)
    
    // Сбалансированные награды опыта (8-12 мобов для повышения уровня)
    const experience_reward = Math.max(7, Math.floor(template.expMultiplier * level * 0.8))
    const gold_reward = Math.floor(template.goldMultiplier * level)

    return {
      id: `${template.name.toLowerCase().replace(/\s+/g, '_')}_${level}`,
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

// Создание фарм спотов для зоны
const createFarmSpots = (zoneId: string, baseLevel: number, gridSize: number = 4): FarmSpot[] => {
  const spots: FarmSpot[] = []
  const mobs = createMobs(baseLevel)
  
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      spots.push({
        id: `${zoneId}_spot_${x}_${y}`,
        name: `Участок ${x + 1}-${y + 1}`,
        position: { x, y },
        mobs: mobs.slice(0, Math.floor(Math.random() * 2) + 1), // 1-2 моба на спот
        level_range: { min: baseLevel, max: baseLevel + 5 },
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
