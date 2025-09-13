// Авто-тест логики боя
console.log('🧪 Начинаем авто-тест логики боя...')

// Симуляция состояния боя
let combatState = {
  currentMobs: [
    { id: 1, name: 'Гоблин 1', health: 100, maxHealth: 100, attack: 20, defense: 5 },
    { id: 2, name: 'Гоблин 2', health: 80, maxHealth: 80, attack: 18, defense: 4 }
  ],
  isPlayerTurn: true,
  currentHealth: 200,
  currentMana: 100
}

let selectedSkillId = 'basic_attack'
let battleStarted = true
let damage = 50

console.log('🎯 Начальное состояние:')
console.log('Мобы:', combatState.currentMobs.map(m => `${m.name}: ${m.health}/${m.maxHealth}`))
console.log('Ход игрока:', combatState.isPlayerTurn)

// Тест 1: Атака первого моба
console.log('\n📝 ТЕСТ 1: Атака первого моба')
console.log('Проверка условий:', {
  battleStarted,
  selectedSkillId,
  isPlayerTurn: combatState.isPlayerTurn
})

if (!battleStarted || !selectedSkillId || !combatState.isPlayerTurn) {
  console.log('❌ Условия не выполнены!')
} else {
  console.log('✅ Условия выполнены, выполняем атаку')
  
  // Находим первого живого моба
  let targetIndex = -1
  for (let i = 0; i < combatState.currentMobs.length; i++) {
    if (combatState.currentMobs[i].health > 0) {
      targetIndex = i
      break
    }
  }
  
  console.log('🎯 Индекс цели:', targetIndex)
  
  if (targetIndex === -1) {
    console.log('❌ Нет живых мобов!')
  } else {
    const target = combatState.currentMobs[targetIndex]
    console.log('🎯 Цель:', target.name, 'HP:', target.health)
    
    const finalDamage = Math.max(1, damage - target.defense)
    console.log('💥 Урон:', finalDamage)
    
    // Обновляем HP моба
    const newMobs = [...combatState.currentMobs]
    newMobs[targetIndex] = {
      ...newMobs[targetIndex],
      health: Math.max(0, newMobs[targetIndex].health - finalDamage)
    }
    
    combatState.currentMobs = newMobs
    combatState.isPlayerTurn = false
    
    console.log('✅ После атаки:')
    console.log('Мобы:', combatState.currentMobs.map(m => `${m.name}: ${m.health}/${m.maxHealth}`))
    console.log('Ход игрока:', combatState.isPlayerTurn)
  }
}

// Тест 2: Попытка атаки когда не ход игрока
console.log('\n📝 ТЕСТ 2: Попытка атаки когда не ход игрока')
console.log('Проверка условий:', {
  battleStarted,
  selectedSkillId,
  isPlayerTurn: combatState.isPlayerTurn
})

if (!battleStarted || !selectedSkillId || !combatState.isPlayerTurn) {
  console.log('❌ Атака заблокирована - не ход игрока!')
} else {
  console.log('✅ Условия выполнены')
}

// Тест 3: Ход мобов
console.log('\n📝 ТЕСТ 3: Ход мобов')
setTimeout(() => {
  const aliveMobs = combatState.currentMobs.filter(mob => mob.health > 0)
  console.log('🔍 Живые мобы:', aliveMobs.length)
  
  if (aliveMobs.length > 0) {
    let totalMobDamage = 0
    aliveMobs.forEach(mob => {
      const mobDamage = Math.max(1, Math.ceil(mob.attack - (10 * 0.5))) // character.defense = 10
      totalMobDamage += mobDamage
    })
    
    console.log('💥 Урон мобов:', totalMobDamage)
    
    combatState.currentHealth = Math.max(0, combatState.currentHealth - totalMobDamage)
    combatState.isPlayerTurn = true
    
    console.log('✅ После хода мобов:')
    console.log('HP игрока:', combatState.currentHealth)
    console.log('Ход игрока:', combatState.isPlayerTurn)
  }
}, 100)

// Тест 4: Вторая атака игрока
setTimeout(() => {
  console.log('\n📝 ТЕСТ 4: Вторая атака игрока')
  console.log('Проверка условий:', {
    battleStarted,
    selectedSkillId,
    isPlayerTurn: combatState.isPlayerTurn
  })
  
  if (!battleStarted || !selectedSkillId || !combatState.isPlayerTurn) {
    console.log('❌ Условия не выполнены!')
  } else {
    console.log('✅ Условия выполнены, выполняем вторую атаку')
    
    // Находим первого живого моба
    let targetIndex = -1
    for (let i = 0; i < combatState.currentMobs.length; i++) {
      if (combatState.currentMobs[i].health > 0) {
        targetIndex = i
        break
      }
    }
    
    console.log('🎯 Индекс цели:', targetIndex)
    
    if (targetIndex === -1) {
      console.log('❌ Нет живых мобов!')
    } else {
      const target = combatState.currentMobs[targetIndex]
      console.log('🎯 Цель:', target.name, 'HP:', target.health)
      
      const finalDamage = Math.max(1, damage - target.defense)
      console.log('💥 Урон:', finalDamage)
      
      // Обновляем HP моба
      const newMobs = [...combatState.currentMobs]
      newMobs[targetIndex] = {
        ...newMobs[targetIndex],
        health: Math.max(0, newMobs[targetIndex].health - finalDamage)
      }
      
      combatState.currentMobs = newMobs
      combatState.isPlayerTurn = false
      
      console.log('✅ После второй атаки:')
      console.log('Мобы:', combatState.currentMobs.map(m => `${m.name}: ${m.health}/${m.maxHealth}`))
      console.log('Ход игрока:', combatState.isPlayerTurn)
      
      // Проверяем окончание боя
      const aliveMobs = combatState.currentMobs.filter(mob => mob.health > 0)
      console.log('🔍 Живые мобы:', aliveMobs.length)
      
      if (aliveMobs.length === 0) {
        console.log('🎉 ПОБЕДА! Все мобы убиты!')
      } else {
        console.log('⚔️ Бой продолжается...')
      }
    }
  }
}, 200)
