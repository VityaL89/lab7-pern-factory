const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');

async function createRoom(params) {
  if (params.length < 4) {
    throw new Error('Недостаточно аргументов. Использование: create "<название>" "<категория>" <цена> <рейтинг>');
  }

  const [name, category, priceStr, ratingStr] = params;
  const price = parseFloat(priceStr);
  const rating = parseFloat(ratingStr);

  if (isNaN(price) || price <= 0) throw new Error('Цена должна быть числом > 0');
  if (isNaN(rating) || rating < 0 || rating > 5) throw new Error('Рейтинг должен быть от 0 до 5');
  if (!name || name.trim().length < 3) throw new Error('Название минимум 3 символа');

  const id = Date.now().toString();
  const roomFile = path.join(DATA_DIR, 'rooms', `${id}.json`);

  try {
    await fs.access(roomFile);
    throw new Error(`Файл с id ${id} уже существует`);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  const room = {
    id,
    name,
    category,
    price,
    rating,
    createdAt: new Date().toISOString(),
  };

  await fs.mkdir(path.dirname(roomFile), { recursive: true });
  await fs.writeFile(roomFile, JSON.stringify(room, null, 2), 'utf-8');

  const index = await loadIndex();
  index.push({ id, name, category, price, rating });
  await saveIndex(index);

  console.log(`✅ Создан номер: ${name} (id: ${id})`);
}

async function loadIndex() {
  try {
    const data = await fs.readFile(INDEX_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(path.dirname(INDEX_FILE), { recursive: true });
      await fs.writeFile(INDEX_FILE, '[]', 'utf-8');
      return [];
    }
    throw new Error(`Ошибка чтения индекса: ${err.message}`);
  }
}

async function saveIndex(index) {
  await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
}

module.exports = createRoom;