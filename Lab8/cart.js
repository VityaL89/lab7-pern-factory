const ROOMS_URL = 'http://localhost:3000/rooms';

async function loadCart() {
    const container = document.getElementById('cart-container');
    
    const cartIds = await getCart();
    console.log('Cart IDs from server:', cartIds);
    
    await updateHeaderCounts();
    
    if (cartIds.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <h3>🛒 Your cart is empty</h3>
                <p>Browse our catalog and add rooms to your cart!</p>
                <a href="catalog.html" class="back-to-catalog">Browse Catalog</a>
            </div>`;
        return;
    }
    
    try {
        const response = await fetch(ROOMS_URL);
        if (!response.ok) throw new Error('HTTP error: ' + response.status);
        
        const allRooms = await response.json();
        const cartRooms = allRooms.filter(room => cartIds.includes(Number(room.id)));
        
        if (cartRooms.length === 0) {
            container.innerHTML = `
                <div class="empty-cart">
                    <h3>Cart items not found</h3>
                    <p>The rooms you added might have been removed.</p>
                    <button onclick="clearCartHandler()" class="book-btn" style="margin-top:10px;">Clear Cart</button>
                </div>`;
            return;
        }
        
        displayCart(cartRooms);
        
    } catch (error) {
        console.error('Error loading cart:', error);
        container.innerHTML = `
            <div class="empty-cart">
                <h3>Error loading data</h3>
                <p>${error.message}</p>
                <p>Make sure JSON Server is running on port 3000.</p>
                <button onclick="loadCart()" class="book-btn" style="margin-top:10px;">Try Again</button>
            </div>`;
    }
}

function displayCart(rooms) {
    const container = document.getElementById('cart-container');
    const totalPrice = rooms.reduce((sum, room) => sum + room.price, 0);
    
    container.innerHTML = `
        <div class="cart-items">
            ${rooms.map(room => `
                <div class="cart-item" data-id="${room.id}">
                    <img src="${room.imageUrl}" class="cart-item__image" alt="${room.name}" onerror="this.src='img/LuxRoom.svg'">
                    <div class="cart-item__body">
                        <div class="cart-item__header">
                            <h3>${escapeHtml(room.name)}</h3>
                            <div class="cart-item__price">$${room.price}<span>/night</span></div>
                        </div>
                        
                        <div class="cart-item__meta">
                            <span class="cart-item__category">${room.category}</span>
                            <span class="cart-item__rating">★ ${room.rating}</span>
                        </div>
                        
                        <p class="cart-item__description">${escapeHtml(room.description)}</p>
                        
                        <div class="cart-item__amenities">
                            ${room.amenities?.slice(0, 3).map(a => `<span class="amenity-tag">${a}</span>`).join('') || ''}
                        </div>
                        
                        <div class="cart-item__buttons">
                            <button class="remove-btn" data-id="${room.id}">Remove from Cart</button>
                            <button class="book-now-btn" data-id="${room.id}">Book Now</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="cart-summary">
            <h3>Order Summary</h3>
            <div class="total-price">$${totalPrice}<span> total for ${rooms.length} night(s)</span></div>
            <button class="checkout-btn" onclick="checkout()">Proceed to Checkout</button>
        </div>
    `;
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = parseInt(btn.dataset.id);
            await removeFromCart(id);
            showNotification('Removed from cart', 'info');
            await loadCart();
            await updateHeaderCounts();
        });
    });
    
    document.querySelectorAll('.book-now-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const room = rooms.find(r => r.id === parseInt(btn.dataset.id));
            if (room) {
                alert(`Thank you for booking ${room.name}!\nPrice: $${room.price}/night\nWe'll contact you shortly.`);
            }
        });
    });
}

async function clearCartHandler() {
    if (confirm('Are you sure you want to clear your entire cart?')) {
        await clearCart();
        showNotification('Cart cleared', 'info');
        await loadCart();
        await updateHeaderCounts();
    }
}

async function checkout() {
    const user = getCurrentUser();
    if (!user) {
        alert('Для оформления бронирования необходимо войти в аккаунт');
        window.location.href = 'auth.html';
        return;
    }
    
    const cart = await getCart();
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'info');
        return;
    }
    
    const response = await fetch(ROOMS_URL);
    const allRooms = await response.json();
    const cartRooms = allRooms.filter(room => cart.includes(room.id));
    
    for (const room of cartRooms) {
        await createOrder({
            userId: user.id,
            roomId: room.id,
            roomName: room.name,
            price: room.price,
            checkIn: new Date().toISOString().split('T')[0],
            checkOut: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
            status: 'confirmed'
        });
    }
    
    const total = cartRooms.reduce((sum, room) => sum + room.price, 0);
    alert(`Бронирование оформлено!\nКоличество номеров: ${cartRooms.length}\nОбщая сумма: $${total}\nМы свяжемся с вами для подтверждения.`);
    
    await clearCart();
    await loadCart();
    await updateHeaderCounts();
}

async function updateHeaderCounts() {
    const favorites = await getFavorites();
    const cart = await getCart();
    
    const favSpan = document.getElementById('fav-count');
    const cartSpan = document.getElementById('cart-count');
    
    if (favSpan) favSpan.textContent = `(${favorites.length})`;
    if (cartSpan) cartSpan.textContent = `(${cart.length})`;
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    const old = document.querySelector('.notification');
    if (old) old.remove();
    const container = document.querySelector('.container');

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    let rightPosition = 20;
    if (container) {
        const containerRect = container.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        rightPosition = windowWidth - containerRect.right + 20;
    }

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: ${rightPosition}px;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        font-size: 14px;
        z-index: 10000;
        background: ${type === 'success' ? '#4CAF50' : '#1B75BB'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    `;

    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `@keyframes slideIn {
            from { transform: translateX(100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }`;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', loadCart);