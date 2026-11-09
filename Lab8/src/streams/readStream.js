const fs = require('fs');
const path = require('path');

const BIG_FILE = path.join(__dirname, '../../data/big-rooms.json');

async function readFileNormal() {
  const start = Date.now();
  const data = await fs.promises.readFile(BIG_FILE, 'utf-8');
  const parsed = JSON.parse(data);
  const time = Date.now() - start;
  console.log(`📖 fs.readFile: ${time}ms, записей: ${parsed.length}`);
  return time;
}

function readFileStream() {
  return new Promise((resolve) => {
    const start = Date.now();
    let buffer = '';

    const stream = fs.createReadStream(BIG_FILE, { encoding: 'utf-8' });

    stream.on('data', (chunk) => { buffer += chunk; });
    stream.on('end', () => {
      const parsed = JSON.parse(buffer);
      const time = Date.now() - start;
      console.log(`🌊 Stream: ${time}ms, записей: ${parsed.length}`);
      resolve(time);
    });
  });
}

async function compare() {
  console.log('Сравнение методов чтения:\n');
  await readFileNormal();
  await readFileStream();
}

compare();