const fs = require('fs').promises;
const path = require('path'); 

const DATA_DIR = path.join(__dirname, '../../data'); 

async function readRoom(params) {
  if (params.length < 1) {
    throw new Error('Недостаточно аргументов. Использование: read <id>');
  }

  const id = params[0];
  const roomFile = path.join(DATA_DIR, 'rooms', `${id}.json`);

  try {
    const data = await fs.readFile(roomFile, 'utf-8');
    const room = JSON.parse(data);
    
    console.log('\n📄 Номер:');
    console.log('─'.repeat(40));
    console.log(`ID:        ${room.id}`);
    console.log(`Название:  ${room.name}`);
    console.log(`Категория: ${room.category}`);
    console.log(`Цена:      $${room.price}`);
    console.log(`Рейтинг:   ★ ${room.rating}`);
    console.log('─'.repeat(40));
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error(`Номер с id ${id} не найден`);
    if (err instanceof SyntaxError) throw new Error(`Повреждённый JSON в файле ${id}.json`);
    throw new Error(`Ошибка чтения: ${err.message}`);
  }
}

module.exports = readRoom; // получение функции readRoom app.js