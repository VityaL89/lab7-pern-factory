console.log('A');

setTimeout(() => console.log('B'), 0);

Promise.resolve().then(() => console.log('C'));

console.log('D');

// ПРЕДСКАЗАНИЕ (до запуска):
// Порядок: A, D, C, B
//
// Объяснение:
// 1. A — синхронный
// 2. D — синхронный
// 3. C — Promise (microtask)
// 4. B — setTimeout (macrotask)