const fs = require('fs');
const path = require('path');

const BIG_FILE = path.join(__dirname, '../../data/big-rooms.json');

const rooms = [];
for (let i = 0; i < 100000; i++) {
  rooms.push({
    id: String(i),
    name: `Room ${i}`,
    category: ['Luxury', 'Deluxe', 'Standard', 'Family', 'Economy'][i % 5],
    price: 50 + (i % 200),
    rating: 3 + (i % 20) / 10,
  });
}

fs.writeFileSync(BIG_FILE, JSON.stringify(rooms, null, 2));
console.log(`✅ Создан файл с ${rooms.length} записями`);