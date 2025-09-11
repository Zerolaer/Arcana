import { Continent, Zone, FarmSpot, Mob } from '@/types/world'

// Моковые мобы для разных уровней
const createMobs = (baseLevel: number): Mob[] => [
  {
    id: `goblin_${baseLevel}`,
    name: 'Гоблин',
    level: baseLevel,
    health: baseLevel * 20,
    attack: baseLevel * 3,
    defense: baseLevel * 2,
    experience_reward: Math.max(5, baseLevel * 2),
    gold_reward: baseLevel * 2,
    icon: '👹',
    rarity: 'common',
    loot_table: [
      { item_id: 'iron_ore', drop_rate: 30, quantity_min: 1, quantity_max: 3 },
      { item_id: 'health_potion', drop_rate: 15, quantity_min: 1, quantity_max: 2 }
    ]
  },
  {
    id: `orc_${baseLevel}`,
    name: 'Орк',
    level: baseLevel + 2,
    health: (baseLevel + 2) * 25,
    attack: (baseLevel + 2) * 4,
    defense: (baseLevel + 2) * 3,
    experience_reward: (baseLevel + 2) * 15,
    gold_reward: (baseLevel + 2) * 3,
    icon: '🧌',
    rarity: 'uncommon',
    loot_table: [
      { item_id: 'iron_sword', drop_rate: 10, quantity_min: 1, quantity_max: 1 },
      { item_id: 'leather_armor', drop_rate: 20, quantity_min: 1, quantity_max: 1 }
    ]
  },
  {
    id: `troll_${baseLevel}`,
    name: 'Тролль',
    level: baseLevel + 5,
    health: (baseLevel + 5) * 40,
    attack: (baseLevel + 5) * 6,
    defense: (baseLevel + 5) * 5,
    experience_reward: (baseLevel + 5) * 25,
    gold_reward: (baseLevel + 5) * 5,
    icon: '🧟',
    rarity: 'rare',
    loot_table: [
      { item_id: 'steel_sword', drop_rate: 15, quantity_min: 1, quantity_max: 1 },
      { item_id: 'health_potion', drop_rate: 40, quantity_min: 2, quantity_max: 5 }
    ]
  }
]

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
