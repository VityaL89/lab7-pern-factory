const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const xml2js = require('xml2js');   

const app = express();
const PORT = 3000;

app.use(express.json());                        
app.use(express.text({ type: ['application/xml', 'text/xml'] }));
app.use(express.static('public'));

const DATA_DIR = path.join(__dirname, 'data');
const INDEX_FILE = path.join(DATA_DIR, 'index.json');
const ROOMS_DIR = path.join(DATA_DIR, 'rooms');


async function readJson(file) {
  try {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
}

app.get('/page', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/rooms', async (req, res) => {
  try {
    const index = await readJson(INDEX_FILE);
    res.json(index);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms/list', async (req, res) => {
  try {
    const index = await readJson(INDEX_FILE);
    res.json(index);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const { name, category, price, rating } = req.body;

    if (!name || !category || price === undefined || rating === undefined) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    const priceNum = parseFloat(price);
    const ratingNum = parseFloat(rating);

    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ error: 'Цена должна быть числом > 0' });
    }
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      return res.status(400).json({ error: 'Рейтинг должен быть от 0 до 5' });
    }
    if (name.trim().length < 3) {
      return res.status(400).json({ error: 'Название минимум 3 символа' });
    }

    const id = Date.now().toString();
    const room = {
      id,
      name: name.trim(),
      category: category.trim(),
      price: priceNum,
      rating: ratingNum,
      createdAt: new Date().toISOString()
    };

    await writeJson(path.join(ROOMS_DIR, `${id}.json`), room);

    const index = await readJson(INDEX_FILE);
    index.push({ id, name: room.name, category: room.category, price: room.price, rating: room.rating });
    await writeJson(INDEX_FILE, index);

    res.status(201).json({ message: 'Номер создан', room, index });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rooms/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const roomFile = path.join(ROOMS_DIR, `${id}.json`);

    try {
      await fs.access(roomFile);
    } catch {
      return res.status(404).json({ error: `Номер ${id} не найден` });
    }

    await fs.unlink(roomFile);

    const index = await readJson(INDEX_FILE);
    const newIndex = index.filter(r => r.id !== id);
    await writeJson(INDEX_FILE, newIndex);

    res.json({ message: `Номер ${id} удалён`, index: newIndex });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rooms/export', async (req, res) => {
  try {
    const index = await readJson(INDEX_FILE);

    res.format({
      'application/json': () => {
        res.json(index);
      },
      'application/xml': () => {

        const xmlObject = {
          rooms: {
            room: index.map(r => ({
              id: r.id,
              name: r.name,
              category: r.category,
              price: r.price,
              rating: r.rating
            }))
          }
        };

        const builder = new xml2js.Builder({
          rootName: 'rooms',
          xmldec: { version: '1.0', encoding: 'UTF-8' }
        });

        const xml = builder.buildObject(xmlObject);
        res.type('application/xml').send(xml);
      },
      'text/html': () => {
        const html = `<html><body><h1>Номера отеля</h1><table border="1">
<tr><th>ID</th><th>Название</th><th>Категория</th><th>Цена</th><th>Рейтинг</th></tr>
${index.map(r => `<tr><td>${r.id}</td><td>${r.name}</td><td>${r.category}</td><td>$${r.price}</td><td>★ ${r.rating}</td></tr>`).join('')}
</table></body></html>`;
        res.type('text/html').send(html);
      },
      default: () => {
        res.status(406).json({ error: 'Формат не поддерживается. Используйте JSON, XML или HTML' });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rooms/xml', async (req, res) => {
  try {
    const parsed = await xml2js.parseStringPromise(req.body, {
      explicitArray: false
    });
    res.json({ message: 'XML успешно распарсен', data: parsed });
  } catch (err) {
    res.status(400).json({ error: 'Невалидный XML: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}/page`);
});














//Invoke-RestMethod -Uri http://localhost:3000/api/rooms/list -Method POST