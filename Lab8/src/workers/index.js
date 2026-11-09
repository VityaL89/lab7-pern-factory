const { Worker } = require('worker_threads');
const path = require('path');
const fs = require('fs');

const BIG_FILE = path.join(__dirname, '../../data/big-rooms.json');

function calculateStats(rooms) {
  let totalPrice = 0;
  let maxRating = 0;
  for (const room of rooms) {
    totalPrice += room.price;
    if (room.rating > maxRating) maxRating = room.rating;
  }
  return {
    count: rooms.length,
    avgPrice: (totalPrice / rooms.length).toFixed(2),
    maxRating,
  };
}

function statsInMainThread() {
  const start = Date.now();
  const rooms = JSON.parse(fs.readFileSync(BIG_FILE, 'utf-8'));
  const stats = calculateStats(rooms);
  const time = Date.now() - start;
  console.log(`🧠 Main thread: ${time}ms`);
  console.log('   ', stats);
}

function statsInWorker() {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const rooms = JSON.parse(fs.readFileSync(BIG_FILE, 'utf-8'));

    const worker = new Worker(
      path.join(__dirname, 'statsWorker.js'),
      { workerData: rooms }
    );

    worker.on('message', (stats) => {
      const time = Date.now() - start;
      console.log(`⚙️  Worker: ${time}ms`);
      console.log('   ', stats);
      resolve();
    });

    worker.on('error', reject);
  });
}

async function compare() {
  console.log('Сравнение Worker vs Main:\n');
  statsInMainThread();
  await statsInWorker();
}

compare();