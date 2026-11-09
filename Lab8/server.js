const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(jsonServer.bodyParser);
server.use(middlewares);

server.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url}`);
    next();
});

server.put('/favorites/:id', (req, res) => {
    const db = router.db;
    const id = parseInt(req.params.id);
    const data = req.body;
    
    const favorites = db.get('favorites').value();
    const index = favorites.findIndex(f => f.id === id);
    
    if (index !== -1) {
        db.get('favorites').set(index, data).write();
        res.json(data);
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

server.put('/cart/:id', (req, res) => {
    const db = router.db;
    const id = parseInt(req.params.id);
    const data = req.body;
    
    const cart = db.get('cart').value();
    const index = cart.findIndex(c => c.id === id);
    
    if (index !== -1) {
        db.get('cart').set(index, data).write();
        res.json(data);
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

server.use(router);

server.listen(3000, () => {
    console.log('✅ Сервер запущен на http://localhost:3000');
    console.log('📍 Доступные эндпоинты:');
    console.log('   - GET /users, /rooms, /favorites, /cart, /orders, /feedback');
    console.log('   - POST /users, /orders, /feedback');
    console.log('   - PUT /favorites/:id, /cart/:id');
    console.log('   - DELETE /feedback/:id');
});