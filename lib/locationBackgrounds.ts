// Утилиты для фонов локаций
export interface LocationBackground {
  name: string
  image: string // Путь к изображению
  icon: string
  description: string
}

// Утилиты для фонов континентов
export interface ContinentBackground {
  id: string
  name: string
  image: string // Путь к изображению
  description: string
}

// Фоны для всех локаций
export const LOCATION_BACKGROUNDS: Record<string, LocationBackground> = {
  // Мирные Луга
  'Мирные Луга': {
    name: 'Мирные Луга',
    image: '/locations/peaceful_meadows.png',
    icon: '🌿',
    description: 'Спокойные луга с мирными существами'
  },

  // Темный Лес
  'Темный Лес': {
    name: 'Темный Лес',
    image: '/locations/dark_forest.png',
    icon: '🌲',
    description: 'Густой лес с опасными хищниками'
  },

  // Пещеры Гоблинов
  'Пещеры Гоблинов': {
    name: 'Пещеры Гоблинов',
    image: '/locations/goblin_caves.png',
    icon: '🕳️',
    description: 'Подземные туннели, населенные гоблинами'
  },

  // Пылающая Пустыня
  'Пылающая Пустыня': {
    name: 'Пылающая Пустыня',
    image: '/locations/burning_desert.png',
    icon: '🔥',
    description: 'Раскаленная пустыня с огненными существами'
  },

  // Ледяные Пики
  'Ледяные Пики': {
    name: 'Ледяные Пики',
    image: '/locations/frozen_peaks.png',
    icon: '🏔️',
    description: 'Замерзшие горы с ледяными монстрами'
  },

  // Забытые Руины
  'Забытые Руины': {
    name: 'Забытые Руины',
    image: '/locations/forgotten_ruins.png',
    icon: '🏛️',
    description: 'Древние руины с нежитью'
  },

  // Адские Врата
  'Адские Врата': {
    name: 'Адские Врата',
    image: '/locations/hell_gates.png',
    icon: '🔥',
    description: 'Портал в ад с демонами'
  },

  // Кристальные Пещеры
  'Кристальные Пещеры': {
    name: 'Кристальные Пещеры',
    image: '/locations/crystal_caverns.png',
    icon: '💎',
    description: 'Пещеры, полные кристальных существ'
  },

  // Трон Драконов
  'Трон Драконов': {
    name: 'Трон Драконов',
    image: '/locations/dragon_throne.png',
    icon: '🐉',
    description: 'Обитель древних драконов'
  }
}

// Фоны для всех континентов
export const CONTINENT_BACKGROUNDS: Record<string, ContinentBackground> = {
  'continent_1': {
    id: 'continent_1',
    name: 'Мирные Земли',
    image: '/continents/continent_1.png',
    description: 'Безопасные территории для начинающих искателей приключений'
  },
  'continent_2': {
    id: 'continent_2',
    name: 'Опасные Территории',
    image: '/continents/continent_2.png',
    description: 'Земли, полные опасностей и сокровищ'
  },
  'continent_3': {
    id: 'continent_3',
    name: 'Эпические Земли',
    image: '/continents/continent_3.png',
    description: 'Самые опасные территории для опытных героев'
  }
}

// Функция для получения фона локации
export function getLocationBackground(locationName: string): LocationBackground {
  return LOCATION_BACKGROUNDS[locationName] || LOCATION_BACKGROUNDS['Мирные Луга']
}

// Функция для получения фона континента
export function getContinentBackground(continentId: string): ContinentBackground {
  return CONTINENT_BACKGROUNDS[continentId] || CONTINENT_BACKGROUNDS['continent_1']
}

// Функция для получения CSS класса локации
export function getLocationClassName(locationName: string): string {
  const classMap: Record<string, string> = {
    'Мирные Луга': 'location-bg-peaceful-meadows',
    'Темный Лес': 'location-bg-dark-forest',
    'Пещеры Гоблинов': 'location-bg-goblin-caves',
    'Пылающая Пустыня': 'location-bg-burning-desert',
    'Ледяные Пики': 'location-bg-frozen-peaks',
    'Забытые Руины': 'location-bg-forgotten-ruins',
    'Адские Врата': 'location-bg-hell-gates',
    'Кристальные Пещеры': 'location-bg-crystal-caverns',
    'Трон Драконов': 'location-bg-dragon-throne'
  }
  
  return classMap[locationName] || 'location-bg-peaceful-meadows'
}

// Функция для получения CSS класса континента
export function getContinentClassName(continentId: string): string {
  const classMap: Record<string, string> = {
    'continent_1': 'continent-bg-peaceful-lands',
    'continent_2': 'continent-bg-dangerous-territories',
    'continent_3': 'continent-bg-epic-lands'
  }
  
  return classMap[continentId] || 'continent-bg-peaceful-lands'
}

// Функция для получения CSS стилей локации (для картинок)
export function getLocationStyles(locationName: string): React.CSSProperties {
  const bg = getLocationBackground(locationName)
  
  return {
    backgroundImage: `url(${bg.image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative' as const,
    overflow: 'hidden' as const
  }
}

// Функция для получения CSS стилей континента (для картинок)
export function getContinentStyles(continentId: string): React.CSSProperties {
  const bg = getContinentBackground(continentId)
  
  return {
    backgroundImage: `url(${bg.image})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative' as const,
    overflow: 'hidden' as const
  }
}

// Компонент для создания фона локации (только для React компонентов)
// export function LocationBackgroundComponent({ 
//   locationName, 
//   children, 
//   className = '' 
// }: { 
//   locationName: string
//   children: React.ReactNode
//   className?: string 
// }) {
//   const bg = getLocationBackground(locationName)
//   
//   return (
//     <div 
//       className={`relative overflow-hidden ${className}`}
//       style={{ background: bg.background }}
//     >
//       {/* Overlay */}
//       <div 
//         className="absolute inset-0 pointer-events-none"
//         style={{ background: bg.overlay }}
//       />
//       
//       {/* Content */}
//       <div className="relative z-10">
//         {children}
//       </div>
//     </div>
//   )
// }
