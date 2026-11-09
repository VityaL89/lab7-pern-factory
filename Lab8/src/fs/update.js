const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');

async function updateRoom(params) { 
  if (params.length < 2) {
    throw new Error('Недостаточно аргументов. Использование: update <id> <поле>=<значение>');
  }

  const id = params[0];
  const updates = params.slice(1);
  const roomFile = path.join(DATA_DIR, 'rooms', `${id}.json`);

  let room;
  try {
    const data = await fs.readFile(roomFile, 'utf-8');
    room = JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error(`Номер ${id} не найден`);
    throw new Error(`Ошибка чтения: ${err.message}`);
  }

  const updatedFields = [];
  updates.forEach(update => {
    const [field, value] = update.split('=');
    if (!field || value === undefined) throw new Error(`Неверный формат: ${update}`);
    room[field] = isNaN(value) ? value : parseFloat(value);
    updatedFields.push(field);
  });

  await fs.writeFile(roomFile, JSON.stringify(room, null, 2), 'utf-8');

  const index = JSON.parse(await fs.readFile(INDEX_FILE, 'utf-8'));
  const indexItem = index.find(r => r.id === id);
  if (indexItem) {
    updatedFields.forEach(field => { indexItem[field] = room[field]; });
    await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
  }

  console.log(`✅ Номер ${id} обновлён: ${updatedFields.join(', ')}`);
}

module.exports = updateRoom;