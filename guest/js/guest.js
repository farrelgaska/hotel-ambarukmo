document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.querySelector('.transition-overlay');
    const navBookBtn = document.querySelector('.main-navbar .btn-book-now');
    const btnLoginNav = document.querySelector('.main-navbar .btn-login');

    if (btnLoginNav) {
        if (typeof TokenService !== 'undefined' && TokenService.isLoggedIn()) {
            const user = TokenService.getUserData();
            const displayName = user?.name || user?.username || 'Tamu';
            btnLoginNav.innerHTML = `<i class="fas fa-user-circle" style="color:#f3c356;margin-right:6px;"></i> ${displayName.toUpperCase()}`;
            btnLoginNav.href = '#';
            btnLoginNav.addEventListener('click', async (e) => {
                e.preventDefault();
                if (confirm('Keluar dari Portal Guest?')) {
                    await AuthService.logout();
                    window.location.href = 'login/login.html';
                }
            });
        } else {
            btnLoginNav.href = 'login/login.html';
        }
    }

    document.body.addEventListener('click', (e) => {
        const button = e.target.closest('.btn-card-action:not(.btn-unavailable)');
        if (!button) return;
        e.preventDefault();

        if (typeof TokenService === 'undefined' || !TokenService.isLoggedIn()) {
            window.location.href = 'login/login.html?redirect=' + encodeURIComponent('dashboard.html');
            return;
        }

        const roomCard = button.closest('.room-premium-card');
        const roomName = roomCard.querySelector('h3').textContent;
        const roomPrice = roomCard.querySelector('.card-price').textContent.split('/')[0].trim();
        const roomId = roomCard.getAttribute('data-room-id') || '';

        if (overlay) overlay.classList.add('active');
        setTimeout(() => {
            let url = `booking.html?room=${encodeURIComponent(roomName)}&price=${encodeURIComponent(roomPrice)}`;
            if (roomId) url += `&roomId=${roomId}`;
            window.location.href = url;
        }, 400);
    });

    if (navBookBtn) {
        navBookBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.accommodations-section')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    loadAvailableRooms();
});

function formatRoomPrice(price) {
    if (price == null) return 'IDR 0';
    if (price >= 1000000) return `IDR ${(price / 1000000).toFixed(1)}M`;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
}

function getCardImageClass(roomType) {
    const type = (roomType || '').toLowerCase();
    if (type.includes('suite') && type.includes('presidential')) return 'img-presidential-suite';
    if (type.includes('suite')) return 'img-executive-suite';
    return 'img-deluxe-king';
}

async function loadAvailableRooms() {
    const grid = document.querySelector('.rooms-grid');
    if (!grid || typeof RoomService === 'undefined') return;

    grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#888;">
            <i class="fas fa-circle-notch fa-spin" style="color:#f3c356;font-size:28px;display:block;margin-bottom:16px;"></i>
            Memuat kamar tersedia...
        </div>
    `;

    try {
        const rooms = await RoomService.getAvailable();
        if (!Array.isArray(rooms) || rooms.length === 0) {
            grid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#888;">
                    Tidak ada kamar tersedia saat ini.
                </div>
            `;
            return;
        }

        grid.innerHTML = '';
        rooms.forEach(room => {
            const roomType = room.roomType || 'Standard Room';
            const card = document.createElement('div');
            card.className = 'room-premium-card';
            card.setAttribute('data-room-id', room.id);

            card.innerHTML = `
                <div class="card-image-area ${getCardImageClass(roomType)}">
                    <span class="room-badge badge-available">AVAILABLE</span>
                </div>
                <div class="card-content-area">
                    <div class="card-main-info">
                        <h3>${roomType}</h3>
                        <div class="floor-text">ROOM ${room.roomNumber || '-'} · FLOOR ${room.floor ?? '-'}</div>
                    </div>
                    <div class="card-price">${formatRoomPrice(room.basePrice)} <span class="per-night">/NIGHT</span></div>
                    <ul class="card-features">
                        <li><i class="fas fa-bed"></i> ${roomType}</li>
                        <li><i class="fas fa-door-open"></i> Premium Comfort</li>
                        <li><i class="fas fa-concierge-bell"></i> 24/7 Service</li>
                    </ul>
                    <button class="btn-card-action">BOOK NOW</button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (err) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#f44336;">
                Gagal memuat kamar: ${err.message || 'Server error'}
            </div>
        `;
    }
}
