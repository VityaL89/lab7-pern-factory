const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');

async function renameRoom(params) {
  if (params.length < 2) {
    throw new Error('Недостаточно аргументов. Использование: rename <id> "<новое_имя>"');
  }

  const [id, newName] = params;
  const roomFile = path.join(DATA_DIR, 'rooms', `${id}.json`);

  let room;
  try {
    const data = await fs.readFile(roomFile, 'utf-8');
    room = JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error(`Номер ${id} не найден`);
    throw new Error(`Ошибка чтения: ${err.message}`);
  }

  const oldName = room.name;
  room.name = newName;
  await fs.writeFile(roomFile, JSON.stringify(room, null, 2), 'utf-8');

  const index = JSON.parse(await fs.readFile(INDEX_FILE, 'utf-8'));
  const item = index.find(r => r.id === id);
  if (item) {
    item.name = newName;
    await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
  }

  console.log(`✅ Переименовано: "${oldName}" → "${newName}"`);
}

module.exports = renameRoom;