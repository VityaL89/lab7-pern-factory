const { Product, Model, Delivery, sequelize } = require('./models');

async function seed() {
  try {
    await sequelize.sync({ force: true }); // Очищает таблицы и создает заново

    const products = await Product.bulkCreate([
      { name: 'Пальто женское', image_url: 'https://example.com/coat.jpg' },
      { name: 'Костюм женский', image_url: 'https://example.com/suit.jpg' },
      { name: 'Платье вечернее', image_url: 'https://example.com/dress.jpg' }
    ]);

    const models = [];
    for (let i = 1; i <= 15; i++) {
      models.push(await Model.create({
        name: `Модель ${i}`,
        product_id: products[i % 3].id,
        price: 100 + i * 15,
        image_url: `https://picsum.photos/200/300?random=${i}` // Случайные фото для теста
      }));
    }

    for (let i = 1; i <= 40; i++) {
      await Delivery.create({
        model_id: models[i % 15].id,
        quantity: 10 + i,
        accepted_by: `Кладовщик ${i % 5 + 1}`,
        delivery_date: '2026-11-09'
      });
    }

    console.log('База данных успешно заполнена 58 записями!');
    process.exit();
  } catch (error) {
    console.error('Ошибка при заполнении:', error);
    process.exit(1);
  }
}

seed();