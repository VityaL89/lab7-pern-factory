let editingRoomId = null;
let allRooms = [];
let allFeedback = [];
let allOrders = [];
let allUsers = [];

function checkAdminAccess() {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        document.getElementById('access-denied').style.display = 'block';
        document.getElementById('admin-panels').style.display = 'none';
        return false;
    }
    document.getElementById('access-denied').style.display = 'none';
    document.getElementById('admin-panels').style.display = 'block';
    return true;
}

async function loadRooms() {
    try {
        const response = await fetch(`${API_BASE}/rooms`);
        allRooms = await response.json();
        displayRoomsList();
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
}

function displayRoomsList() {
    const container = document.getElementById('rooms-list');
    if (!container) return;
    
    container.innerHTML = allRooms.map(room => `
        <div class="room-admin-card">
            <img src="${room.imageUrl}" alt="${room.name}" onerror="this.src='img/LuxRoom.svg'">
            <div class="room-admin-card-content">
                <h4>${escapeHtml(room.name)}</h4>
                <p>Категория: ${room.category}</p>
                <p>Цена: $${room.price}/ночь</p>
                <p>Рейтинг: ★ ${room.rating}</p>
                <div class="room-admin-card-actions">
                    <button class="btn-edit" onclick="editRoom(${room.id})">Редактировать</button>
                    <button class="btn-danger" onclick="deleteRoomHandler(${room.id})">Удалить</button>
                </div>
            </div>
        </div>
    `).join('');
}

function editRoom(roomId) {
    const room = allRooms.find(r => r.id === roomId);
    if (!room) return;
    
    editingRoomId = roomId;
    document.getElementById('room-form-title').textContent = 'Редактировать номер';
    document.getElementById('room-name').value = room.name;
    document.getElementById('room-category').value = room.category;
    document.getElementById('room-price').value = room.price;
    document.getElementById('room-rating').value = room.rating;
    document.getElementById('room-image').value = room.imageUrl;
    document.getElementById('room-size').value = room.size || '';
    document.getElementById('room-description').value = room.description;
    document.getElementById('room-amenities').value = room.amenities ? room.amenities.join(', ') : '';
    document.getElementById('edit-room-id').value = roomId;
    
    document.getElementById('submit-room').textContent = 'Обновить номер';
    document.getElementById('cancel-edit').style.display = 'inline-block';
}

function cancelEdit() {
    editingRoomId = null;
    document.getElementById('room-form-title').textContent = 'Добавить новый номер';
    document.getElementById('submit-room').textContent = 'Добавить номер';
    document.getElementById('cancel-edit').style.display = 'none';
    
    document.getElementById('room-name').value = '';
    document.getElementById('room-category').value = 'Luxury';
    document.getElementById('room-price').value = '';
    document.getElementById('room-rating').value = '';
    document.getElementById('room-image').value = '';
    document.getElementById('room-size').value = '';
    document.getElementById('room-description').value = '';
    document.getElementById('room-amenities').value = '';
    document.getElementById('edit-room-id').value = '';
    
    document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
}

function validateRoomForm() {
    let isValid = true;
    
    const name = document.getElementById('room-name').value.trim();
    if (!name) {
        showError('room-name-error', 'Введите название номера');
        isValid = false;
    } else {
        hideError('room-name-error');
    }
    
    const price = document.getElementById('room-price').value;
    if (!price || price <= 0) {
        showError('room-price-error', 'Введите корректную цену');
        isValid = false;
    } else {
        hideError('room-price-error');
    }
    
    const rating = document.getElementById('room-rating').value;
    if (!rating || rating < 0 || rating > 5) {
        showError('room-rating-error', 'Рейтинг должен быть от 0 до 5');
        isValid = false;
    } else {
        hideError('room-rating-error');
    }
    
    const image = document.getElementById('room-image').value.trim();
    if (!image) {
        showError('room-image-error', 'Введите URL изображения');
        isValid = false;
    } else {
        hideError('room-image-error');
    }
    
    const size = document.getElementById('room-size').value.trim();
    if (!size) {
        showError('room-size-error', 'Введите размер номера');
        isValid = false;
    } else {
        hideError('room-size-error');
    }
    
    const description = document.getElementById('room-description').value.trim();
    if (!description || description.length < 20) {
        showError('room-description-error', 'Описание должно содержать минимум 20 символов');
        isValid = false;
    } else {
        hideError('room-description-error');
    }
    
    const amenities = document.getElementById('room-amenities').value.trim();
    if (!amenities) {
        showError('room-amenities-error', 'Введите удобства');
        isValid = false;
    } else {
        hideError('room-amenities-error');
    }
    
    return isValid;
}

function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
    }
}

function hideError(elementId) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.classList.remove('show');
    }
}

async function submitRoom() {
    if (!validateRoomForm()) return;
    
    const roomData = {
        name: document.getElementById('room-name').value.trim(),
        category: document.getElementById('room-category').value,
        price: parseFloat(document.getElementById('room-price').value),
        rating: parseFloat(document.getElementById('room-rating').value),
        imageUrl: document.getElementById('room-image').value.trim(),
        size: document.getElementById('room-size').value.trim(),
        description: document.getElementById('room-description').value.trim(),
        amenities: document.getElementById('room-amenities').value.split(',').map(a => a.trim())
    };
    
    try {
        if (editingRoomId) {
            await updateRoom(editingRoomId, { ...roomData, id: editingRoomId });
            alert('Номер успешно обновлен');
        } else {
            await addRoom(roomData);
            alert('Номер успешно добавлен');
        }
        cancelEdit();
        await loadRooms();
        await updateRoomSelectors();
    } catch (error) {
        alert('Ошибка: ' + error.message);
    }
}

async function deleteRoomHandler(roomId) {
    if (confirm('Вы уверены, что хотите удалить этот номер?')) {
        try {
            await deleteRoom(roomId);
            alert('Номер удален');
            await loadRooms();
            await updateRoomSelectors();
        } catch (error) {
            alert('Ошибка удаления: ' + error.message);
        }
    }
}

async function loadFeedback() {
    try {
        const response = await fetch(`${API_BASE}/feedback?_expand=room&_sort=createdAt&_order=desc`);
        allFeedback = await response.json();
        await updateSelectors();
        displayFeedback();
    } catch (error) {
        console.error('Error loading feedback:', error);
    }
}

async function updateSelectors() {
    const roomSelect = document.getElementById('filter-room');
    if (roomSelect) {
        roomSelect.innerHTML = '<option value="all">Все номера</option>';
        allRooms.forEach(room => {
            roomSelect.innerHTML += `<option value="${room.id}">${room.name}</option>`;
        });
    }
    
    const userSelect = document.getElementById('filter-user');
    if (userSelect) {
        userSelect.innerHTML = '<option value="all">Все пользователи</option>';
        allUsers.forEach(user => {
            userSelect.innerHTML += `<option value="${user.id}">${user.firstName} ${user.lastName} (${user.nickname})</option>`;
        });
    }
}

async function updateRoomSelectors() {
    const roomSelect = document.getElementById('filter-room');
    if (roomSelect) {
        roomSelect.innerHTML = '<option value="all">Все номера</option>';
        allRooms.forEach(room => {
            roomSelect.innerHTML += `<option value="${room.id}">${room.name}</option>`;
        });
    }
}

function displayFeedback() {
    const filterRoom = document.getElementById('filter-room')?.value || 'all';
    const filterUser = document.getElementById('filter-user')?.value || 'all';
    
    let filtered = [...allFeedback];
    
    if (filterRoom !== 'all') {
        filtered = filtered.filter(f => f.roomId == filterRoom);
    }
    if (filterUser !== 'all') {
        filtered = filtered.filter(f => f.userId == filterUser);
    }
    
    const tbody = document.getElementById('feedback-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = filtered.map(feedback => `
        <tr>
            <td>${feedback.room ? feedback.room.name : feedback.roomId}</td>
            <td>${escapeHtml(feedback.userName || 'Гость')}</td>
            <td>${'★'.repeat(Math.floor(feedback.rating))} (${feedback.rating})</td>
            <td>${escapeHtml(feedback.comment)}</td>
            <td>${new Date(feedback.createdAt).toLocaleDateString()}</td>
            <td><button class="btn-danger" onclick="deleteFeedbackHandler(${feedback.id})">Удалить</button></td>
        </tr>
    `).join('');
}

async function deleteFeedbackHandler(feedbackId) {
    if (confirm('Удалить этот отзыв?')) {
        await deleteFeedback(feedbackId);
        await loadFeedback();
    }
}

function applyFilters() {
    displayFeedback();
}

async function loadOrders() {
    try {
        const response = await fetch(`${API_BASE}/orders`);
        allOrders = await response.json();
        displayOrders();
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function displayOrders() {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = allOrders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>User #${order.userId}</td>
            <td>${escapeHtml(order.roomName)}</td>
            <td>$${order.price}</td>
            <td>${order.checkIn}</td>
            <td>${order.checkOut}</td>
            <td><span style="background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px;">${order.status}</span></td>
        </tr>
    `).join('');
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        allUsers = await response.json();
        displayUsers();
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function displayUsers() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = allUsers.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${escapeHtml(user.lastName)} ${escapeHtml(user.firstName)} ${escapeHtml(user.middleName || '')}</td>
            <td>${escapeHtml(user.email)}</td>
            <td>${user.phone}</td>
            <td>${escapeHtml(user.nickname)}</td>
            <td><span style="background: ${user.role === 'admin' ? '#ffc107' : '#4CAF50'}; color: ${user.role === 'admin' ? '#081F32' : 'white'}; padding: 4px 8px; border-radius: 4px;">${user.role}</span></td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAdminAccess()) return;
    
    await loadRooms();
    await loadFeedback();
    await loadOrders();
    await loadUsers();
    
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.panel}-panel`).classList.add('active');
        });
    });
    
    const submitBtn = document.getElementById('submit-room');
    if (submitBtn) submitBtn.addEventListener('click', submitRoom);
    
    const cancelBtn = document.getElementById('cancel-edit');
    if (cancelBtn) cancelBtn.addEventListener('click', cancelEdit);
    
    const applyBtn = document.getElementById('apply-filters');
    if (applyBtn) applyBtn.addEventListener('click', applyFilters);
    
    const roomInputs = ['room-name', 'room-price', 'room-rating', 'room-image', 'room-size', 'room-description', 'room-amenities'];
    roomInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => validateRoomForm());
    });
});