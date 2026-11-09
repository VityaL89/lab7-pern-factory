# Лабораторная работа №7 (PERN Stack: PostgreSQL, Express, React, Node.js)

**Вариант 5:** Проект ФАБРИКА.

## Описание проекта
Многоуровневое веб-приложение для учета готовой продукции фабрики по пошиву одежды. 
Реализованы 3 таблицы БД: Товары (Products), Модели (Models) и Поступления на склад (Deliveries).

## Стек технологий
* **БД:** PostgreSQL, ORM Sequelize
* **Бэкенд:** Node.js, Express, Axios
* **Фронтенд:** React, Redux Toolkit, React Router, Bootstrap

## Как запустить
1. Восстановить базу данных `factory_db` в PostgreSQL.
2. Запустить бэкенд:
   ```bash
   cd lab7-backend
   npm install
   node seed.js    # Заполняет БД 58 записями
   node server.js  # Запускает сервер на порту 5000