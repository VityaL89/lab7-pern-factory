const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');

async function deleteRoom(params) {
  if (params.length < 1) {
    throw new Error('Недостаточно аргументов. Использование: delete <id>');
  }

  const id = params[0];
  const roomFile = path.join(DATA_DIR, 'rooms', `${id}.json`);

  try {
    await fs.access(roomFile); 
  } catch {
    throw new Error(`Номер ${id} не найден`);
  }

  await fs.unlink(roomFile);

  const index = JSON.parse(await fs.readFile(INDEX_FILE, 'utf-8'));
  const newIndex = index.filter(r => r.id !== id);
  await fs.writeFile(INDEX_FILE, JSON.stringify(newIndex, null, 2), 'utf-8');

  console.log(`🗑️  Номер ${id} удалён`);
}

module.exports = deleteRoom;