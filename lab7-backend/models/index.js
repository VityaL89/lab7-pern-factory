const { DataTypes } = require('sequelize');
const sequelize = require('../db');

// 1. Модель Товары (Виды одежды)
const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: { args: [3, 255], msg: "Название должно быть от 3 до 255 символов" },
      notEmpty: { msg: "Название не может быть пустым" }
    }
  },
  image_url: {
    type: DataTypes.STRING,
    validate: { isUrl: { msg: "Некорректный URL фото" } }
  }
});

// 2. Модель Модели одежды
const Model = sequelize.define('Model', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0.01], msg: "Цена должна быть больше нуля" },
      isDecimal: true
    }
  },
  image_url: {
    type: DataTypes.STRING,
    validate: { isUrl: true }
  }
});

// 3. Модель Поступления
const Delivery = sequelize.define('Delivery', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: "Количество не может быть меньше 1" },
      isInt: true
    }
  },
  accepted_by: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

// Связи (1:М)
Product.hasMany(Model, { foreignKey: 'product_id' });
Model.belongsTo(Product, { foreignKey: 'product_id' });

Model.hasMany(Delivery, { foreignKey: 'model_id' });
Delivery.belongsTo(Model, { foreignKey: 'model_id' });

module.exports = { Product, Model, Delivery, sequelize };