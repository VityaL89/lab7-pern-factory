const { parentPort, workerData } = require('worker_threads');

function calculateStats(rooms) {
  let totalPrice = 0;
  let maxRating = 0;
  let minPrice = Infinity;
  let maxPrice = 0;

  for (const room of rooms) {
    totalPrice += room.price;
    if (room.rating > maxRating) maxRating = room.rating;
    if (room.price < minPrice) minPrice = room.price;
    if (room.price > maxPrice) maxPrice = room.price;
  }

  return {
    count: rooms.length,
    avgPrice: (totalPrice / rooms.length).toFixed(2),
    minPrice,
    maxPrice,
    maxRating,
  };
}

const stats = calculateStats(workerData);
parentPort.postMessage(stats);