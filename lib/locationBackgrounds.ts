// Утилиты для фонов локаций
export interface LocationBackground {
  name: string
  background: string // CSS градиент или цвет
  overlay: string // Дополнительный слой для атмосферы
  icon: string
  description: string
}

// Фоны для всех локаций
export const LOCATION_BACKGROUNDS: Record<string, LocationBackground> = {
  // Новичковый лес
  'Новичковый лес': {
    name: 'Новичковый лес',
    background: 'linear-gradient(135deg, #2d5a27 0%, #1a3d1a 50%, #0f2810 100%)',
    overlay: 'radial-gradient(circle at center, rgba(76, 175, 80, 0.1) 0%, transparent 70%)',
    icon: '🌲',
    description: 'Спокойный лес для начинающих приключенцев'
  },

  // Темная пещера
  'Темная пещера': {
    name: 'Темная пещера',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 50%, #000000 100%)',
    overlay: 'radial-gradient(circle at center, rgba(156, 39, 176, 0.2) 0%, transparent 60%)',
    icon: '🕳️',
    description: 'Мрачная пещера, полная опасностей'
  },

  // Заброшенные руины
  'Заброшенные руины': {
    name: 'Заброшенные руины',
    background: 'linear-gradient(135deg, #8d6e63 0%, #5d4037 50%, #3e2723 100%)',
    overlay: 'radial-gradient(circle at center, rgba(255, 193, 7, 0.15) 0%, transparent 70%)',
    icon: '🏛️',
    description: 'Древние руины, кишащие нежитью'
  },

  // Огненные земли
  'Огненные земли': {
    name: 'Огненные земли',
    background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 50%, #8b0000 100%)',
    overlay: 'radial-gradient(circle at center, rgba(255, 152, 0, 0.3) 0%, transparent 60%)',
    icon: '🔥',
    description: 'Выжженная пустошь с огненными элементалями'
  },

  // Ледяные вершины
  'Ледяные вершины': {
    name: 'Ледяные вершины',
    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
    overlay: 'radial-gradient(circle at center, rgba(33, 150, 243, 0.2) 0%, transparent 70%)',
    icon: '🏔️',
    description: 'Холодные горы со льдом и снегом'
  },

  // Кристальные шахты
  'Кристальные шахты': {
    name: 'Кристальные шахты',
    background: 'linear-gradient(135deg, #4a148c 0%, #311b92 50%, #1a0d36 100%)',
    overlay: 'radial-gradient(circle at center, rgba(156, 39, 176, 0.3) 0%, transparent 60%)',
    icon: '💎',
    description: 'Глубокие шахты с кристальными монстрами'
  },

  // Теневое измерение
  'Теневое измерение': {
    name: 'Теневое измерение',
    background: 'linear-gradient(135deg, #424242 0%, #212121 50%, #000000 100%)',
    overlay: 'radial-gradient(circle at center, rgba(103, 58, 183, 0.4) 0%, transparent 50%)',
    icon: '🌑',
    description: 'Альтернативное измерение, полное теневых существ'
  },

  // Божественный храм
  'Божественный храм': {
    name: 'Божественный храм',
    background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 50%, #ffc107 100%)',
    overlay: 'radial-gradient(circle at center, rgba(255, 235, 59, 0.4) 0%, transparent 60%)',
    icon: '⛪',
    description: 'Священное место для самых сильных героев'
  }
}

// Функция для получения фона локации
export function getLocationBackground(locationName: string): LocationBackground {
  return LOCATION_BACKGROUNDS[locationName] || LOCATION_BACKGROUNDS['Новичковый лес']
}

// Функция для получения CSS стилей локации
export function getLocationStyles(locationName: string): React.CSSProperties {
  const bg = getLocationBackground(locationName)
  
  return {
    background: bg.background,
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
