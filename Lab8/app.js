#!/usr/bin/env node

const createRoom = require('./src/fs/create');
const readRoom = require('./src/fs/read');
const updateRoom = require('./src/fs/update');
const deleteRoom = require('./src/fs/delete');
const listRooms = require('./src/fs/list');
const backupData = require('./src/fs/backup');
const renameRoom = require('./src/fs/rename');
const searchRooms = require('./src/fs/search');

const args = process.argv.slice(2);

const command = args[0];
const params = args.slice(1);

async function main() {
  if (!command) {
    printHelp();
    process.exit(1);
  }

  try {
    switch (command) {
      case 'create':
        await createRoom(params);
        break;
      case 'read':
        await readRoom(params);
        break;
      case 'update':
        await updateRoom(params);
        break;
      case 'delete':
        await deleteRoom(params);
        break;
      case 'list':
        await listRooms();
        break;
      case 'search':
        await searchRooms();
        break;
      case 'backup':
        await backupData(params);
        break;
      case 'rename':
        await renameRoom(params);
        break;
      case 'help':
      default:
        printHelp();
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
🏨 Rayal Park CLI — управление номерами отеля

Использование:
  node app.js <команда> [аргументы]

Команды:
  create "<название>" "<категория>" <цена> <рейтинг>
  read <id>
  update <id> <поле>=<значение>
  delete <id>
  list
  search
  backup <источник> <назначение>
  rename <id> "<новое_имя>"

Примеры:
  node app.js create "Luxury Suite" "Luxury" 130 4.9
  node app.js read 1
  node app.js list
  node app.js delete 1
  `);
}

main();