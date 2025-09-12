import { PassiveSkill } from '@/types/skills'

// Пассивные навыки по классам
export const CLASS_PASSIVE_SKILLS: { [className: string]: PassiveSkill[] } = {
  'Лучник': [
    {
      id: 'archer_precision',
      name: 'Точность Стрелка',
      description: 'Увеличивает точность и дальность атаки',
      level_requirement: 1,
      icon: '🎯',
      stat_bonuses: {
        precision: 8,
        agility: 5
      },
      is_learned: true,
      class_requirements: ['Лучник']
    },
    {
      id: 'wind_dance',
      name: 'Танец Ветра',
      description: 'Повышает скорость атаки и уклонение',
      level_requirement: 5,
      icon: '💨',
      stat_bonuses: {
        agility: 10,
        evasion: 8
      },
      is_learned: false,
      class_requirements: ['Лучник']
    },
    {
      id: 'hunter_instincts',
      name: 'Инстинкты Охотника',
      description: 'Улучшает критический урон и скрытность',
      level_requirement: 10,
      icon: '🦅',
      stat_bonuses: {
        precision: 12,
        stealth: 6
      },
      is_learned: false,
      class_requirements: ['Лучник']
    },
    {
      id: 'eagle_eye',
      name: 'Орлиный Глаз',
      description: 'Максимально увеличивает точность и дальность',
      level_requirement: 15,
      icon: '👁️',
      stat_bonuses: {
        precision: 15,
        agility: 8
      },
      is_learned: false,
      class_requirements: ['Лучник']
    },
    {
      id: 'storm_archer',
      name: 'Стрелок Бури',
      description: 'Легендарная точность и скорость',
      level_requirement: 20,
      icon: '⚡',
      stat_bonuses: {
        precision: 20,
        agility: 15,
        evasion: 10
      },
      is_learned: false,
      class_requirements: ['Лучник']
    }
  ],
  
  'Маг': [
    {
      id: 'arcane_knowledge',
      name: 'Арканные Знания',
      description: 'Увеличивает магическую силу и интеллект',
      level_requirement: 1,
      icon: '📚',
      stat_bonuses: {
        intelligence: 10,
        spell_power: 8
      },
      is_learned: true,
      class_requirements: ['Маг']
    },
    {
      id: 'mana_mastery',
      name: 'Владение Маной',
      description: 'Улучшает регенерацию маны и сопротивление',
      level_requirement: 5,
      icon: '💙',
      stat_bonuses: {
        intelligence: 12,
        resistance: 10
      },
      is_learned: false,
      class_requirements: ['Маг']
    },
    {
      id: 'elemental_affinity',
      name: 'Стихийное Сродство',
      description: 'Усиливает магический урон и точность',
      level_requirement: 10,
      icon: '🔥',
      stat_bonuses: {
        spell_power: 15,
        precision: 8
      },
      is_learned: false,
      class_requirements: ['Маг']
    },
    {
      id: 'arcane_shield',
      name: 'Арканный Щит',
      description: 'Создает магическую защиту',
      level_requirement: 15,
      icon: '🛡️',
      stat_bonuses: {
        resistance: 15,
        intelligence: 10
      },
      is_learned: false,
      class_requirements: ['Маг']
    },
    {
      id: 'archmage_power',
      name: 'Сила Архимага',
      description: 'Максимальная магическая мощь',
      level_requirement: 20,
      icon: '👑',
      stat_bonuses: {
        intelligence: 20,
        spell_power: 18,
        resistance: 12
      },
      is_learned: false,
      class_requirements: ['Маг']
    }
  ],
  
  'Берсерк': [
    {
      id: 'berserker_rage',
      name: 'Ярость Берсерка',
      description: 'Увеличивает силу и выносливость',
      level_requirement: 1,
      icon: '😡',
      stat_bonuses: {
        strength: 12,
        endurance: 8
      },
      is_learned: true,
      class_requirements: ['Берсерк']
    },
    {
      id: 'iron_skin',
      name: 'Железная Кожа',
      description: 'Повышает броню и здоровье',
      level_requirement: 5,
      icon: '🛡️',
      stat_bonuses: {
        armor: 12,
        endurance: 10
      },
      is_learned: false,
      class_requirements: ['Берсерк']
    },
    {
      id: 'bloodthirst',
      name: 'Кровожадность',
      description: 'Увеличивает урон и скорость атаки',
      level_requirement: 10,
      icon: '🩸',
      stat_bonuses: {
        strength: 15,
        agility: 8
      },
      is_learned: false,
      class_requirements: ['Берсерк']
    },
    {
      id: 'unstoppable_force',
      name: 'Неудержимая Сила',
      description: 'Максимальная физическая мощь',
      level_requirement: 15,
      icon: '💥',
      stat_bonuses: {
        strength: 18,
        endurance: 12
      },
      is_learned: false,
      class_requirements: ['Берсерк']
    },
    {
      id: 'legendary_berserker',
      name: 'Легендарный Берсерк',
      description: 'Абсолютная ярость и разрушение',
      level_requirement: 20,
      icon: '⚔️',
      stat_bonuses: {
        strength: 25,
        endurance: 18,
        armor: 15
      },
      is_learned: false,
      class_requirements: ['Берсерк']
    }
  ],
  
  'Ассасин': [
    {
      id: 'shadow_step',
      name: 'Теневой Шаг',
      description: 'Увеличивает скрытность и ловкость',
      level_requirement: 1,
      icon: '🌑',
      stat_bonuses: {
        stealth: 12,
        agility: 8
      },
      is_learned: true,
      class_requirements: ['Ассасин']
    },
    {
      id: 'deadly_precision',
      name: 'Смертоносная Точность',
      description: 'Улучшает точность и критический урон',
      level_requirement: 5,
      icon: '🎯',
      stat_bonuses: {
        precision: 10,
        stealth: 8
      },
      is_learned: false,
      class_requirements: ['Ассасин']
    },
    {
      id: 'shadow_mastery',
      name: 'Владение Тенями',
      description: 'Максимальная скрытность и уклонение',
      level_requirement: 10,
      icon: '👤',
      stat_bonuses: {
        stealth: 15,
        evasion: 10
      },
      is_learned: false,
      class_requirements: ['Ассасин']
    },
    {
      id: 'assassin_blade',
      name: 'Клинок Ассасина',
      description: 'Увеличивает урон из невидимости',
      level_requirement: 15,
      icon: '🗡️',
      stat_bonuses: {
        stealth: 18,
        precision: 12
      },
      is_learned: false,
      class_requirements: ['Ассасин']
    },
    {
      id: 'shadow_lord',
      name: 'Повелитель Теней',
      description: 'Абсолютное владение скрытностью',
      level_requirement: 20,
      icon: '👑',
      stat_bonuses: {
        stealth: 25,
        agility: 15,
        precision: 15
      },
      is_learned: false,
      class_requirements: ['Ассасин']
    }
  ]
}

// Функция для получения доступных пассивных навыков по классу и уровню
export function getAvailablePassiveSkills(className: string, level: number): PassiveSkill[] {
  const classSkills = CLASS_PASSIVE_SKILLS[className] || []
  return classSkills.map(skill => ({
    ...skill,
    is_learned: skill.level_requirement <= level
  }))
}

// Функция для получения изученных пассивных навыков по классу и уровню
export function getLearnedPassiveSkills(className: string, level: number): PassiveSkill[] {
  const classSkills = CLASS_PASSIVE_SKILLS[className] || []
  return classSkills.filter(skill => skill.level_requirement <= level)
}

// Функция для расчета бонусов от всех изученных пассивных навыков
export function calculatePassiveSkillBonuses(className: string, level: number) {
  const learnedSkills = getLearnedPassiveSkills(className, level)
  
  return learnedSkills.reduce((bonuses, skill) => {
    Object.entries(skill.stat_bonuses).forEach(([stat, value]) => {
      if (value) {
        bonuses[stat as keyof typeof bonuses] = (bonuses[stat as keyof typeof bonuses] || 0) + value
      }
    })
    return bonuses
  }, {} as Record<string, number>)
}

// Функция для получения имени класса по ID
export function getClassNameById(classId: string): string {
  const classMap: { [key: string]: string } = {
    'archer': 'Лучник',
    'mage': 'Маг', 
    'berserker': 'Берсерк',
    'assassin': 'Ассасин'
  }
  return classMap[classId] || 'Лучник'
}
