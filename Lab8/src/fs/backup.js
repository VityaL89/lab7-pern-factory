const fs = require('fs').promises;
const path = require('path');

async function backupData(params) {
  if (params.length < 2) {
    throw new Error('Недостаточно аргументов. Использование: backup <источник> <назначение>');
  }

  const [source, destination] = params; // source - что копировать
  // destination - куда копировать

  try {
    const stat = await fs.stat(source);
    if (!stat.isDirectory()) throw new Error('Источник не является каталогом');
  } catch (err) {
    if (err.code === 'ENOENT') throw new Error(`Источник ${source} не найден`);
    throw err;
  }

  await fs.mkdir(destination, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(destination, timestamp);
  await copyDir(source, backupDir);

  console.log(`✅ Резервная копия: ${backupDir}`);
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) await copyDir(srcPath, destPath);
    else await fs.copyFile(srcPath, destPath);
  }
}

module.exports = backupData;