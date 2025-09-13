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
    image: 'linear-gradient(135deg, #2d5a27 0%, #1a3d1a 50%, #0f2810 100%)',
    icon: '🌿',
    description: 'Спокойные луга с мирными существами'
  },

  // Темный Лес
  'Темный Лес': {
    name: 'Темный Лес',
    image: 'linear-gradient(135deg, #1a3d1a 0%, #0f2810 50%, #0a1f0a 100%)',
    icon: '🌲',
    description: 'Густой лес с опасными хищниками'
  },

  // Пещеры Гоблинов
  'Пещеры Гоблинов': {
    name: 'Пещеры Гоблинов',
    image: 'linear-gradient(135deg, #8d6e63 0%, #5d4037 50%, #3e2723 100%)',
    icon: '🕳️',
    description: 'Подземные туннели, населенные гоблинами'
  },

  // Пылающая Пустыня
  'Пылающая Пустыня': {
    name: 'Пылающая Пустыня',
    image: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 50%, #8b0000 100%)',
    icon: '🔥',
    description: 'Раскаленная пустыня с огненными существами'
  },

  // Ледяные Пики
  'Ледяные Пики': {
    name: 'Ледяные Пики',
    image: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
    icon: '🏔️',
    description: 'Замерзшие горы с ледяными монстрами'
  },

  // Забытые Руины
  'Забытые Руины': {
    name: 'Забытые Руины',
    image: 'linear-gradient(135deg, #5d4037 0%, #3e2723 50%, #2e1b1b 100%)',
    icon: '🏛️',
    description: 'Древние руины с нежитью'
  },

  // Адские Врата
  'Адские Врата': {
    name: 'Адские Врата',
    image: 'linear-gradient(135deg, #b71c1c 0%, #8b0000 50%, #660000 100%)',
    icon: '🔥',
    description: 'Портал в ад с демонами'
  },

  // Кристальные Пещеры
  'Кристальные Пещеры': {
    name: 'Кристальные Пещеры',
    image: 'linear-gradient(135deg, #4a148c 0%, #311b92 50%, #1a0d36 100%)',
    icon: '💎',
    description: 'Пещеры, полные кристальных существ'
  },

  // Трон Драконов
  'Трон Драконов': {
    name: 'Трон Драконов',
    image: 'linear-gradient(135deg, #311b92 0%, #1a0d36 50%, #0d0623 100%)',
    icon: '🐉',
    description: 'Обитель древних драконов'
  }
}

// Фоны для всех континентов
export const CONTINENT_BACKGROUNDS: Record<string, ContinentBackground> = {
  'continent_1': {
    id: 'continent_1',
    name: 'Мирные Земли',
    image: 'linear-gradient(135deg, #2d5a27 0%, #1a3d1a 50%, #0f2810 100%)',
    description: 'Безопасные территории для начинающих искателей приключений'
  },
  'continent_2': {
    id: 'continent_2',
    name: 'Опасные Территории',
    image: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 50%, #8b0000 100%)',
    description: 'Земли, полные опасностей и сокровищ'
  },
  'continent_3': {
    id: 'continent_3',
    name: 'Эпические Земли',
    image: 'linear-gradient(135deg, #4a148c 0%, #311b92 50%, #1a0d36 100%)',
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

// Функция для получения CSS стилей локации
export function getLocationStyles(locationName: string): React.CSSProperties {
  const bg = getLocationBackground(locationName)
  
  return {
    background: bg.image,
    position: 'relative' as const,
    overflow: 'hidden' as const
  }
}

// Функция для получения CSS стилей континента
export function getContinentStyles(continentId: string): React.CSSProperties {
  const bg = getContinentBackground(continentId)
  
  return {
    background: bg.image,
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
