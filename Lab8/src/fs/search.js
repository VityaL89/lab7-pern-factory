const readline = require('readline');// модуль для работы с 
// командной строкой (интерактивный ввод).
const fs = require('fs').promises;
const path = require('path');

const INDEX_FILE = path.join(__dirname, '../../data/index.json');

async function searchRooms() {
  const index = JSON.parse(await fs.readFile(INDEX_FILE, 'utf-8'));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('🔍 Введите поисковый запрос: ', (query) => {
    const results = index.filter(room =>
      room.name.toLowerCase().includes(query.toLowerCase())
    );

    if (results.length === 0) {
      console.log('❌ Ничего не найдено');
    } else {
      console.log(`\n✅ Найдено: ${results.length}\n`);
      results.forEach(room => {
        console.log(`  ${room.id} — ${room.name} ($${room.price})`);
      });
    }

    rl.close();
  });
}

module.exports = searchRooms;