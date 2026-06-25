/**
 * room-status.js — Admin Room Status Grid
 * Data kamar real-time dari API. Update status via PUT.
 */
document.addEventListener('DOMContentLoaded', async () => {

    const roomGrid        = document.getElementById('roomGrid');
    const filterBtns      = document.querySelectorAll('.btn-filter');
    const searchRoom      = document.getElementById('searchRoom');
    const modalRoomStatus = document.getElementById('modalRoomStatus');
    const formRoomStatus  = document.getElementById('formRoomStatus');

    let allRooms             = [];
    let currentFilter        = 'all';
    let currentSearch        = '';
    let currentClickedRoomId = null;

    // ==========================================
    // --- LOAD ROOMS ---
    // ==========================================
    async function loadRooms() {
        if (!roomGrid) return;

        roomGrid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#555;">
                <i class="fas fa-circle-notch fa-spin" style="color:#f3c356;font-size:28px;display:block;margin-bottom:16px;"></i>
                Memuat status kamar...
            </div>
        `;

        try {
            const response = await RoomService.getAll({ limit: 100 });
            allRooms = Array.isArray(response) ? response : (response.data || []);
            renderRooms();
        } catch (err) {
            roomGrid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#f44336;">
                    <i class="fas fa-exclamation-triangle" style="font-size:28px;display:block;margin-bottom:16px;"></i>
                    ${err.message || 'Gagal memuat data kamar.'}
                    <br><button type="button" class="btn-retry-rooms" style="margin-top:16px;background:#f3c356;color:#000;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-size:12px;">
                        <i class="fas fa-redo"></i> Coba Lagi
                    </button>
                </div>
            `;
        }
    }

    // ==========================================
    // --- RENDER GRID ---
    // ==========================================
    function renderRooms() {
        if (!roomGrid) return;

        const filtered = allRooms.filter(room => {
            const status = (room.status || 'available').toLowerCase();
            const number = String(room.number || room.roomNumber || '');
            const type   = (room.type || room.roomType || '').toLowerCase();

            if (currentFilter !== 'all' && status !== currentFilter) return false;
            if (currentSearch && !number.includes(currentSearch) && !type.includes(currentSearch)) return false;
            return true;
        });

        if (filtered.length === 0) {
            roomGrid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#555;">
                    <i class="fas fa-search" style="font-size:28px;display:block;margin-bottom:16px;"></i>
                    Tidak ada kamar yang cocok.
                </div>
            `;
            return;
        }

        roomGrid.innerHTML = '';
        filtered.forEach(room => {
            const status     = (room.status || 'available').toLowerCase();
            const number     = room.number || room.roomNumber;
            const type       = room.type || room.roomType;
            const statusLabel = status.toUpperCase();
            const cardStatus = status === 'booked' ? 'occupied' : status;

            const iconMap = {
                available:   'fa-check-circle',
                occupied:    'fa-user',
                booked:      'fa-calendar-check',
                dirty:       'fa-broom',
                maintenance: 'fa-tools',
            };
            const iconClass = iconMap[status] || 'fa-check-circle';

            let guestHtml = '';
            if (status === 'occupied' && (room.guestName || room.guest?.name)) {
                guestHtml = `
                    <div class="room-guest-info">
                        <div><i class="fas fa-id-badge"></i> <span>${room.guestName || room.guest?.name}</span></div>
                        <div><i class="fas fa-sign-out-alt"></i> Out: ${formatDate(room.checkOut || room.checkout)}</div>
                    </div>
                `;
            }

            const card = document.createElement('div');
            card.className = `room-card ${cardStatus}`;
            card.setAttribute('data-id', room.id);
            card.innerHTML = `
                <div class="room-header">
                    <h3>${number}</h3>
                    <i class="fas ${iconClass} room-icon"></i>
                </div>
                <div class="room-type-text">${type}</div>
                <span class="status ${status}">• ${statusLabel}</span>
                ${guestHtml}
            `;

            card.addEventListener('click', () => {
                currentClickedRoomId = room.id;
                const displayNum = document.getElementById('displayRoomNumber');
                const displayType = document.getElementById('displayRoomType');
                const updateStatus = document.getElementById('updateRoomStatus');

                if (displayNum)  displayNum.textContent = number;
                if (displayType) displayType.value = type;
                if (updateStatus) updateStatus.value = status;

                if (modalRoomStatus) modalRoomStatus.classList.remove('hidden');
            });

            roomGrid.appendChild(card);
        });
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return `${d.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${d.getFullYear()}`;
    }

    // ==========================================
    // --- SEARCH & FILTER ---
    // ==========================================
    if (searchRoom) {
        searchRoom.addEventListener('input', (e) => {
            currentSearch = e.target.value.trim();
            renderRooms();
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentFilter = e.currentTarget.dataset.filter || 'all';
            renderRooms();
        });
    });

    // ==========================================
    // --- UPDATE STATUS ---
    // ==========================================
    if (formRoomStatus) {
        formRoomStatus.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newStatus = document.getElementById('updateRoomStatus').value;

            const submitBtn = formRoomStatus.querySelector('button[type="submit"]');
            const origText  = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Updating...';

            try {
                await RoomService.updateStatus(currentClickedRoomId, newStatus);

                // Update data lokal
                const roomIdx = allRooms.findIndex(r => r.id === currentClickedRoomId);
                if (roomIdx !== -1) allRooms[roomIdx].status = newStatus;

                renderRooms();
                if (modalRoomStatus) modalRoomStatus.classList.add('hidden');

                const room = allRooms.find(r => r.id === currentClickedRoomId);
                Toast.success(`Status Kamar ${room?.number || room?.roomNumber} diupdate!`);

            } catch (err) {
                Toast.error(err.message || 'Gagal mengupdate status kamar.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = origText;
            }
        });
    }

    // Close modal
    const closeBtn = document.querySelector('.close-modal-room');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (modalRoomStatus) modalRoomStatus.classList.add('hidden');
        });
    }

    // ==========================================
    // --- INIT ---
    // ==========================================
    if (roomGrid) {
        roomGrid.addEventListener('click', (e) => {
            if (e.target.closest('.btn-retry-rooms')) loadRooms();
        });
    }

    loadRooms();
});