const ROOMS_URL = 'http://localhost:3000/rooms';
let currentRooms = [];
let originalRooms = [];

async function loadRoomsFromServer() {
    const container = document.getElementById('catalog-container');
    container.innerHTML = '<div class="loading">Loading rooms...</div>';
    
    try {
        const response = await fetch(ROOMS_URL);
        const rooms = await response.json();
        originalRooms = [...rooms];
        currentRooms = [...rooms];
        await displayRooms(currentRooms);
    } catch (error) {
        container.innerHTML = `<div class="no-results"><h3>❌ Error: ${error.message}</h3></div>`;
    }
}

async function displayRooms(rooms) {
    const container = document.getElementById('catalog-container');
    const favorites = await getFavorites();
    
    if (!rooms || rooms.length === 0) {
        container.innerHTML = '<div class="no-results"><h3>No rooms found</h3></div>';
        return;
    }

    container.innerHTML = rooms.map(room => `
        <div class="room-card" data-id="${room.id}">
            <img src="${room.imageUrl}" class="room-card__image" alt="${room.name}" onerror="this.src='img/LuxRoom.svg'">
            <div class="room-card__body">
                <div class="room-card__header">
                    <h3>${escapeHtml(room.name)}</h3>
                    <div class="room-card__price">$${room.price}<span>/night</span></div>
                </div>
                <div class="room-card__meta">
                    <span class="room-card__category">${room.category}</span>
                    <span class="room-card__rating">★ ${room.rating}</span>
                </div>
                <p class="room-card__description">${escapeHtml(room.description)}</p>
                <div class="room-card__amenities">
                    ${room.amenities?.slice(0, 3).map(a => `<span class="amenity-tag">${a}</span>`).join('') || ''}
                </div>
                <div class="room-card__buttons">
                    <button class="btn-fav ${favorites.includes(room.id) ? 'active' : ''}" data-id="${room.id}">
                        ${favorites.includes(room.id) ? '❤️' : '🤍'}
                    </button>
                    <button class="btn-cart" data-id="${room.id}">🛒 Cart</button>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.btn-fav').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const roomId = parseInt(btn.dataset.id);
            const isFav = btn.classList.contains('active');
            
            if (isFav) {
                btn.classList.remove('active');
                btn.innerHTML = '🤍';
            } else {
                btn.classList.add('active');
                btn.innerHTML = '❤️';
            }
            
            try {
                if (isFav) {
                    await removeFromFavorites(roomId);
                    showNotification('Removed from favorites', 'info');
                } else {
                    await addToFavorites(roomId);
                    showNotification('Added to favorites', 'success');
                }
                await updateFavCount();
            } catch (error) {

                if (isFav) {
                    btn.classList.add('active');
                    btn.innerHTML = '❤️';
                } else {
                    btn.classList.remove('active');
                    btn.innerHTML = '🤍';
                }
                showNotification('Error', 'error');
            }
        });
    });
    
    document.querySelectorAll('.btn-cart').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const roomId = parseInt(btn.dataset.id);
            const originalText = btn.innerHTML;
            btn.innerHTML = '⏳...';
            
            const success = await addToCart(roomId);
            btn.innerHTML = originalText;
            
            if (success) {
                showNotification('Added to cart', 'success');
                await updateCartCount();
            } else {
                showNotification('Please login first', 'error');
            }
        });
    });
}

async function updateFavCount() {
    const favs = await getFavorites();
    const span = document.getElementById('fav-count');
    if (span) span.textContent = `(${favs.length})`;
}

async function updateCartCount() {
    const cart = await getCart();
    const span = document.getElementById('cart-count');
    if (span) span.textContent = `(${cart.length})`;
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; padding: 12px 24px;
        border-radius: 8px; color: white; z-index: 10000;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#ff4444' : '#1B75BB'};
        animation: fadeInOut 2s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

const style = document.createElement('style');
style.textContent = `@keyframes fadeInOut { 0% { opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; } }`;
document.head.appendChild(style);

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function setupSearch() {
    const input = document.getElementById('search-input');
    let timer;
    input?.addEventListener('input', (e) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            const term = e.target.value.toLowerCase();
            currentRooms = originalRooms.filter(r => 
                r.name.toLowerCase().includes(term) || r.description.toLowerCase().includes(term)
            );
            displayRooms(currentRooms);
        }, 300);
    });
}

function setupSort() {
    document.getElementById('sort-select')?.addEventListener('change', (e) => {
        let sorted = [...currentRooms];
        switch(e.target.value) {
            case 'price-asc': sorted.sort((a, b) => a.price - b.price); break;
            case 'price-desc': sorted.sort((a, b) => b.price - a.price); break;
            case 'rating-desc': sorted.sort((a, b) => b.rating - a.rating); break;
            case 'name-asc': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
        }
        displayRooms(sorted);
    });
}

function setupCategoryFilters() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.category;
            currentRooms = cat === 'all' ? [...originalRooms] : originalRooms.filter(r => r.category === cat);
            displayRooms(currentRooms);
        });
    });
}

function resetFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('sort-select').value = 'default';
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.category-btn[data-category="all"]')?.classList.add('active');
    currentRooms = [...originalRooms];
    displayRooms(currentRooms);
}

function updateInfo(msg) {
    const badge = document.getElementById('info-badge');
    if (badge) badge.textContent = msg;
    setTimeout(() => { if (badge) badge.textContent = 'Click any button to apply array method'; }, 2000);
}

function applyMap() { displayRooms(currentRooms.map(r => ({ ...r, price: Math.round(r.price * 0.9) }))); updateInfo('MAP: 10% discount'); }
function applyFilter() { displayRooms(currentRooms.filter(r => r.price > 80)); updateInfo('FILTER: price > $80'); }
function sortByPrice() { displayRooms([...currentRooms].sort((a, b) => a.price - b.price)); updateInfo('SORT: price'); }
function sortByRating() { displayRooms([...currentRooms].sort((a, b) => b.rating - a.rating)); updateInfo('SORT: rating'); }
function sortByName() { displayRooms([...currentRooms].sort((a, b) => a.name.localeCompare(b.name))); updateInfo('SORT: name'); }
function applyForEach() { currentRooms.forEach((r, i) => console.log(`${i+1}. ${r.name}`)); updateInfo('forEach: check console'); }
function applyFind() { const f = currentRooms.find(r => r.name.includes('Luxury')); updateInfo(f ? `FIND: ${f.name}` : 'FIND: not found'); displayRooms(currentRooms); }
function applySome() { updateInfo(`SOME: ${currentRooms.some(r => r.rating === 5) ? 'YES' : 'NO'} 5.0 rating`); }
function applyEvery() { updateInfo(`EVERY: ${currentRooms.every(r => r.price > 40) ? 'YES' : 'NO'} > $40`); }
function applyReduce() { const total = currentRooms.reduce((s, r) => s + r.price, 0); updateInfo(`REDUCE: total $${total}`); }
function applySlice() { displayRooms(currentRooms.slice(0, 3)); updateInfo('SLICE: first 3'); }
function applyConcat() { const l = currentRooms.filter(r => r.category === 'Luxury'); const f = currentRooms.filter(r => r.category === 'Family'); displayRooms([...l, ...f]); updateInfo(`CONCAT: Luxury(${l.length}) + Family(${f.length})`); }
function resetCatalog() { loadRoomsFromServer(); updateInfo('RESET'); }

function setupMethodButtons() {
    const methods = { map: applyMap, filter: applyFilter, sortPrice: sortByPrice, sortRating: sortByRating, sortName: sortByName, forEach: applyForEach, find: applyFind, some: applySome, every: applyEvery, reduce: applyReduce, slice: applySlice, concat: applyConcat, reset: resetCatalog };
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.addEventListener('click', () => { if (methods[btn.dataset.method]) methods[btn.dataset.method](); });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadRoomsFromServer();
    setupMethodButtons();
    setupSearch();
    setupSort();
    setupCategoryFilters();
    document.getElementById('reset-filters')?.addEventListener('click', resetFilters);
    await updateFavCount();
    await updateCartCount();
});