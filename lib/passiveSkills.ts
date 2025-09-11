import { PassiveSkill } from '@/types/skills'

// Пассивные навыки - едины для всех классов
export const PASSIVE_SKILLS: PassiveSkill[] = [
  {
    id: 'physical_power',
    name: 'Физическая Мощь',
    description: 'Увеличивает физическую силу и выносливость',
    level_requirement: 1,
    icon: '💪',
    stat_bonuses: {
      strength: 5,
      endurance: 3
    },
    is_learned: true // Автоматически изучен на 1 уровне
  },
  {
    id: 'mental_clarity',
    name: 'Ментальная Ясность',
    description: 'Улучшает интеллект и концентрацию',
    level_requirement: 5,
    icon: '🧠',
    stat_bonuses: {
      intelligence: 8,
      precision: 4
    },
    is_learned: false
  },
  {
    id: 'agile_reflexes',
    name: 'Проворные Рефлексы',
    description: 'Повышает ловкость и скорость реакции',
    level_requirement: 10,
    icon: '⚡',
    stat_bonuses: {
      agility: 10,
      evasion: 6
    },
    is_learned: false
  },
  {
    id: 'mystical_affinity',
    name: 'Мистическое Сродство',
    description: 'Усиливает магическую силу и сопротивление',
    level_requirement: 15,
    icon: '🔮',
    stat_bonuses: {
      spell_power: 12,
      resistance: 8
    },
    is_learned: false
  },
  {
    id: 'master_of_shadows',
    name: 'Повелитель Теней',
    description: 'Развивает скрытность и защиту',
    level_requirement: 20,
    icon: '🌑',
    stat_bonuses: {
      stealth: 15,
      armor: 10
    },
    is_learned: false
  }
]

// Функция для получения доступных пассивных навыков по уровню
export function getAvailablePassiveSkills(level: number): PassiveSkill[] {
  return PASSIVE_SKILLS.map(skill => ({
    ...skill,
    is_learned: skill.level_requirement <= level
  }))
}

// Функция для получения изученных пассивных навыков
export function getLearnedPassiveSkills(level: number): PassiveSkill[] {
  return PASSIVE_SKILLS.filter(skill => skill.level_requirement <= level)
}

// Функция для расчета бонусов от всех изученных пассивных навыков
export function calculatePassiveSkillBonuses(level: number) {
  const learnedSkills = getLearnedPassiveSkills(level)
  
  return learnedSkills.reduce((bonuses, skill) => {
    Object.entries(skill.stat_bonuses).forEach(([stat, value]) => {
      if (value) {
        bonuses[stat as keyof typeof bonuses] = (bonuses[stat as keyof typeof bonuses] || 0) + value
      }
    })
    return bonuses
  }, {} as Record<string, number>)
}
