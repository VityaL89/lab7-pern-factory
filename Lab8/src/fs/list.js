const fs = require('fs').promises;
const path = require('path');

const INDEX_FILE = path.join(__dirname, '../../data/index.json');

async function listRooms() {
  try {
    const data = await fs.readFile(INDEX_FILE, 'utf-8');
    const index = JSON.parse(data);

    if (index.length === 0) {
      console.log('📭 Номеров пока нет');
      return;
    }

    console.log(`\n🏨 Всего номеров: ${index.length}\n`);
    console.log('ID'.padEnd(15) + 'Название'.padEnd(25) + 'Цена'.padEnd(10) + 'Рейтинг');
    console.log('─'.repeat(65));

    index.forEach(room => {
      console.log(
        String(room.id).padEnd(15) + // padend - добавление пробелов или же проще выравнивание по ширине
        room.name.padEnd(25) +
        `$${room.price}`.padEnd(10) +
        `★ ${room.rating}`
      );
    });
    console.log('');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('📭 Номеров пока нет');
      return;
    }
    throw new Error(`Ошибка чтения списка: ${err.message}`);
  }
}

module.exports = listRooms;