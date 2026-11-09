let allRooms = [];
let allFeedbacks = [];
let currentRatingFilter = 'all';

async function loadFeedbackPage() {
    const user = getCurrentUser();
    const container = document.getElementById('feedback-form-container');
    const listContainer = document.getElementById('feedback-list');
    
    if (!container || !listContainer) return;
    
    try {
        const roomsResponse = await fetch(`${API_BASE}/rooms`);
        allRooms = await roomsResponse.json();
    } catch (error) {
        console.error('Error loading rooms:', error);
    }
    
    await loadAllFeedback();
    
    if (user) {
        if (user.role === 'admin') {
            container.innerHTML = `
                <div class="feedback-form" style="text-align: center;">
                    <div class="icon" style="font-size: 48px;">👑</div>
                    <h3>Admin Account</h3>
                    <p style="color: #6E7A8A;">Администраторы могут просматривать отзывы, но не могут их оставлять.</p>
                </div>
            `;
        } else {
            const orders = await getUserOrders(user.id);
            const userPurchasedRooms = orders.map(order => ({
                id: order.roomId,
                name: order.roomName
            }));
            
            const userFeedbacks = allFeedbacks.filter(f => f.userId === user.id);
            const purchasedRoomIds = userPurchasedRooms.map(r => r.id);
            const reviewedRoomIds = userFeedbacks.map(f => f.roomId);
            const availableRooms = userPurchasedRooms.filter(r => !reviewedRoomIds.includes(r.id));
            
            if (availableRooms.length === 0 && userPurchasedRooms.length > 0) {
                container.innerHTML = `
                    <div class="feedback-form" style="text-align: center;">
                        <div class="icon" style="font-size: 48px;">✅</div>
                        <h3>Thank You!</h3>
                        <p style="color: #6E7A8A;">Вы уже оставили отзывы на все забронированные номера.</p>
                    </div>
                `;
            } else if (userPurchasedRooms.length === 0) {
                container.innerHTML = `
                    <div class="feedback-form" style="text-align: center;">
                        <div class="icon" style="font-size: 48px;">📝</div>
                        <h3>No bookings yet</h3>
                        <p style="color: #6E7A8A;">Вы можете оставить отзыв только после бронирования номера.</p>
                        <a href="catalog.html" class="btn-primary" style="display: inline-block; margin-top: 15px;">Browse Rooms</a>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="feedback-form">
                        <h3>✍️ Share Your Experience</h3>
                        <p class="subtitle">Your feedback helps other guests make better choices</p>
                        
                        <div class="form-group">
                            <label>🏨 Select Room</label>
                            <select id="feedback-room">
                                <option value="">-- Choose a room --</option>
                                ${availableRooms.map(room => `
                                    <option value="${room.id}">${escapeHtml(room.name)}</option>
                                `).join('')}
                            </select>
                            <div class="error-message" id="room-error"></div>
                        </div>
                        
                        <div class="form-group">
                            <label>⭐ Your Rating</label>
                            <div class="rating-stars" id="rating-stars">
                                <span data-rating="1">★</span>
                                <span data-rating="2">★</span>
                                <span data-rating="3">★</span>
                                <span data-rating="4">★</span>
                                <span data-rating="5">★</span>
                            </div>
                            <input type="hidden" id="feedback-rating" value="0">
                        </div>
                        
                        <div class="form-group">
                            <label>💬 Your Review</label>
                            <textarea id="feedback-comment" rows="4" placeholder="Tell us about your experience... (minimum 10 characters)"></textarea>
                            <div class="error-message" id="comment-error"></div>
                        </div>
                        
                        <button class="btn-primary" id="submit-feedback">✉️ Submit Review</button>
                    </div>
                `;
                
                initRatingStars();
                document.getElementById('submit-feedback').addEventListener('click', submitFeedback);
            }
        }
    } else {
        container.innerHTML = `
            <div class="login-prompt">
                <div class="icon">🔐</div>
                <h3>Login to Leave a Review</h3>
                <p>Only guests who have booked a room can leave reviews.</p>
                <a href="auth.html" class="btn-primary" style="display: inline-block; margin-top: 20px;">Sign In / Register</a>
            </div>
        `;
    }
}

function initRatingStars() {
    const stars = document.querySelectorAll('#rating-stars span');
    const ratingInput = document.getElementById('feedback-rating');
    
    stars.forEach(star => {
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.dataset.rating);
            stars.forEach((s, i) => {
                s.style.color = i < rating ? '#FFB800' : '#ddd';
            });
        });
        
        star.addEventListener('mouseleave', () => {
            const currentRating = parseInt(ratingInput.value);
            stars.forEach((s, i) => {
                s.style.color = i < currentRating ? '#FFB800' : '#ddd';
            });
        });
        
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            ratingInput.value = rating;
            stars.forEach((s, i) => {
                if (i < rating) {
                    s.classList.add('active');
                    s.style.color = '#FFB800';
                } else {
                    s.classList.remove('active');
                    s.style.color = '#ddd';
                }
            });
        });
    });
}

async function submitFeedback() {
    const roomId = document.getElementById('feedback-room').value;
    const rating = document.getElementById('feedback-rating').value;
    const comment = document.getElementById('feedback-comment').value;
    
    let isValid = true;
    
    if (!roomId) {
        showError('room-error', 'Please select a room');
        isValid = false;
    } else {
        hideError('room-error');
    }
    
    if (!rating || rating === '0') {
        showError('room-error', 'Please select a rating');
        isValid = false;
    } else {
        hideError('room-error');
    }
    
    if (!comment || comment.trim().length < 10) {
        showError('comment-error', 'Review must be at least 10 characters');
        isValid = false;
    } else {
        hideError('comment-error');
    }
    
    if (!isValid) return;
    
    try {
        await createFeedback({
            roomId: parseInt(roomId),
            rating: parseInt(rating),
            comment: comment.trim()
        });
        
        showNotification('✅ Thank you for your review!', 'success');
        
        document.getElementById('feedback-comment').value = '';
        document.getElementById('feedback-rating').value = '0';
        document.querySelectorAll('#rating-stars span').forEach(s => {
            s.classList.remove('active');
            s.style.color = '#ddd';
        });
        document.getElementById('feedback-room').value = '';
        
        await loadAllFeedback();
        
        await loadFeedbackPage();
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function loadAllFeedback() {
    try {
        const response = await fetch(`${API_BASE}/feedback?_expand=room&_sort=createdAt&_order=desc`);
        allFeedbacks = await response.json();
        
        displayFeedbackWithStats();
    } catch (error) {
        console.error('Error loading feedback:', error);
        const container = document.getElementById('feedback-list');
        if (container) {
            container.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>Error loading reviews</p></div>';
        }
    }
}

function displayFeedbackWithStats() {
    const container = document.getElementById('feedback-list');
    if (!container) return;
    
    let filtered = [...allFeedbacks];
    if (currentRatingFilter !== 'all') {
        filtered = filtered.filter(f => f.rating >= currentRatingFilter);
    }
    
    const totalReviews = allFeedbacks.length;
    const avgRating = totalReviews > 0 
        ? (allFeedbacks.reduce((sum, f) => sum + f.rating, 0) / totalReviews).toFixed(1)
        : 0;
    
    const ratingCounts = {5:0,4:0,3:0,2:0,1:0};
    allFeedbacks.forEach(f => {
        if (ratingCounts[f.rating]) ratingCounts[f.rating]++;
    });
    
    if (totalReviews === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">⭐</div>
                <h3>No Reviews Yet</h3>
                <p>Be the first to share your experience!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="stats-bar">
            <div class="avg-rating">
                <div class="big-rating">${avgRating}</div>
                <div class="stars">${getStarString(avgRating)}</div>
                <div class="count">Based on ${totalReviews} reviews</div>
            </div>
            <div class="rating-filter">
                <span class="filter-chip ${currentRatingFilter === 'all' ? 'active' : ''}" data-filter="all">All</span>
                <span class="filter-chip ${currentRatingFilter === 5 ? 'active' : ''}" data-filter="5">★★★★★ (${ratingCounts[5]})</span>
                <span class="filter-chip ${currentRatingFilter === 4 ? 'active' : ''}" data-filter="4">★★★★☆ (${ratingCounts[4]})</span>
                <span class="filter-chip ${currentRatingFilter === 3 ? 'active' : ''}" data-filter="3">★★★☆☆ (${ratingCounts[3]})</span>
                <span class="filter-chip ${currentRatingFilter === 2 ? 'active' : ''}" data-filter="2">★★☆☆☆ (${ratingCounts[2]})</span>
                <span class="filter-chip ${currentRatingFilter === 1 ? 'active' : ''}" data-filter="1">★☆☆☆☆ (${ratingCounts[1]})</span>
            </div>
        </div>
        <div class="feedback-list-inner">
            ${filtered.map(f => `
                <div class="feedback-card">
                    <div class="feedback-card-header">
                        <div class="feedback-user">
                            <div class="user-avatar">${getInitials(f.userName || 'G')}</div>
                            <div class="user-name">${escapeHtml(f.userName || 'Guest')}</div>
                        </div>
                        <div class="feedback-rating">${'★'.repeat(Math.floor(f.rating))}${f.rating % 1 ? '½' : ''}</div>
                    </div>
                    <div class="feedback-room">🏨 ${f.room ? f.room.name : 'Room'}</div>
                    <div class="feedback-comment">${escapeHtml(f.comment)}</div>
                    <div class="feedback-date">📅 ${new Date(f.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const filter = chip.dataset.filter;
            currentRatingFilter = filter === 'all' ? 'all' : parseInt(filter);
            displayFeedbackWithStats();
        });
    });
}

function getStarString(rating) {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '★'.repeat(full);
    if (hasHalf) stars += '½';
    stars += '☆'.repeat(5 - full - (hasHalf ? 1 : 0));
    return stars;
}

function getInitials(name) {
    if (!name) return 'G';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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

function showNotification(message, type = 'info') {
    const old = document.querySelector('.notification-toast');
    if (old) old.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        font-size: 14px;
        z-index: 10000;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#ff4444' : '#1B75BB'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100px); opacity: 0; }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', loadFeedbackPage);