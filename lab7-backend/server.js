const express = require('express');
const cors = require('cors');
const { Product, Model, Delivery, sequelize } = require('./models');
const { Op } = require('sequelize');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// CRUD для Моделей (Models)
app.get('/api/models', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;
    const sortField = req.query.sort || 'id';
    const sortOrder = req.query.order || 'ASC';

    const where = {};
    if (req.query.product_id) where.product_id = req.query.product_id;
    if (req.query.minPrice) where.price = { [Op.gte]: req.query.minPrice };
    if (req.query.search) where.name = { [Op.iLike]: `%${req.query.search}%` };

    const models = await Model.findAndCountAll({
      where, limit, offset,
      order: [[sortField, sortOrder]],
      include: [{ model: Product }]
    });

    res.json({
      totalItems: models.count,
      totalPages: Math.ceil(models.count / limit),
      currentPage: page,
      data: models.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/models/:id', async (req, res) => {
  try {
    const model = await Model.findByPk(req.params.id, { include: [Product, Delivery] });
    if (!model) return res.status(404).json({ error: 'Модель не найдена' });
    res.json(model);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/models', async (req, res) => {
  try {
    const newModel = await Model.create(req.body);
    res.status(201).json(newModel);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors.map(e => e.message) });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/models/:id', async (req, res) => {
  try {
    const model = await Model.findByPk(req.params.id);
    if (!model) return res.status(404).json({ error: 'Модель не найдена' });
    await model.update(req.body);
    res.json(model);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/models/:id', async (req, res) => {
  try {
    const model = await Model.findByPk(req.params.id, { include: [Delivery] });
    if (!model) return res.status(404).json({ error: 'Модель не найдена' });
    if (model.Deliveries && model.Deliveries.length > 0) {
      return res.status(400).json({ error: 'Нельзя удалить модель, по которой были поставки' });
    }
    await model.destroy();
    res.json({ message: 'Модель удалена' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log(`Сервер запущен на порту ${process.env.PORT}`);
  } catch (e) {
    console.error('Ошибка БД:', e);
  }
});