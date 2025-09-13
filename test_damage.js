// Тест урона
console.log('🧪 Тест урона...')

let damage = 50
let mobHealth = 100
let mobDefense = 5

console.log('📊 Исходные данные:')
console.log('Урон скилла:', damage)
console.log('HP моба:', mobHealth)
console.log('Защита моба:', mobDefense)

for (let turn = 1; turn <= 5; turn++) {
  const finalDamage = Math.max(1, damage - mobDefense)
  const newHealth = Math.max(0, mobHealth - finalDamage)
  
  console.log(`\n🎯 Ход ${turn}:`)
  console.log(`Урон: ${damage} - ${mobDefense} = ${finalDamage}`)
  console.log(`HP: ${mobHealth} - ${finalDamage} = ${newHealth}`)
  
  if (newHealth <= 0) {
    console.log('💀 Моб убит!')
    break
  }
  
  mobHealth = newHealth
}

// Тест с большим уроном
console.log('\n\n🧪 Тест с большим уроном (100):')
damage = 100
mobHealth = 100
mobDefense = 5

for (let turn = 1; turn <= 3; turn++) {
  const finalDamage = Math.max(1, damage - mobDefense)
  const newHealth = Math.max(0, mobHealth - finalDamage)
  
  console.log(`\n🎯 Ход ${turn}:`)
  console.log(`Урон: ${damage} - ${mobDefense} = ${finalDamage}`)
  console.log(`HP: ${mobHealth} - ${finalDamage} = ${newHealth}`)
  
  if (newHealth <= 0) {
    console.log('💀 Моб убит!')
    break
  }
  
  mobHealth = newHealth
}
