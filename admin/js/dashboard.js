/**
 * dashboard.js — Admin Room Inventory + Dashboard Stats
 *
 * FIX [N4]: Kolom harga tabel kamar selalu kosong karena frontend mengakses room.price
 *           tapi backend mengembalikan field room.basePrice.
 *           Diperbaiki dengan: room.basePrice || room.price (backward-compatible).
 *
 * FIX [N7]: Floor parsing dari roomNumber.charAt(0) tidak reliable.
 *           Sekarang floor dikirim sebagai integer dari awal.
 *
 * FIX [M10]: Logout redirect path dihandle oleh core.js — tidak ada hardcode di sini.
 */
document.addEventListener('DOMContentLoaded', async () => {

    // ==========================================
    // --- LOAD DASHBOARD STATS ---
    // ==========================================
    async function loadDashboardStats() {
        const statCards = document.querySelectorAll('.stat-card h3');
        if (statCards.length === 0) return;

        try {
            const stats = await DashboardService.getStats();

            const revenue   = document.querySelector('[data-stat="revenue"] h3')   || statCards[0];
            const occupancy = document.querySelector('[data-stat="occupancy"] h3') || statCards[1];
            const rooms     = document.querySelector('[data-stat="rooms"] h3')     || statCards[2];
            const guests    = document.querySelector('[data-stat="guests"] h3')    || statCards[3];

            if (revenue && stats.totalRevenue !== undefined) {
                const formatted = new Intl.NumberFormat('id-ID', {
                    style: 'currency', currency: 'IDR', maximumFractionDigits: 0
                }).format(stats.totalRevenue);
                revenue.textContent = formatted;
            }
            if (occupancy && stats.occupancyRate !== undefined) {
                occupancy.innerHTML = `${stats.occupancyRate}%`;
            }
            if (rooms && stats.activeRooms !== undefined) {
                rooms.innerHTML = `${stats.activeRooms}<span class="muted">/${stats.totalRooms || 0}</span>`;
            }
            if (guests && stats.guestsInHouse !== undefined) {
                guests.textContent = stats.guestsInHouse;
            }

            if (stats.revenueTrend !== undefined) {
                const trendEl = document.querySelector('[data-stat="revenue"] .trend');
                if (trendEl) {
                    const isUp = stats.revenueTrend >= 0;
                    trendEl.className = `trend ${isUp ? 'up' : 'down'}`;
                    trendEl.innerHTML = `<i class="fas fa-arrow-${isUp ? 'up' : 'down'}"></i> ${isUp ? '+' : ''}${stats.revenueTrend}% vs bulan lalu`;
                }
            }
        } catch (err) {
            console.warn('[Dashboard] Stats API tidak tersedia, menggunakan data statis:', err.message);
        }
    }

    // ==========================================
    // --- LOAD ROOM INVENTORY ---
    // ==========================================
    const tableBody = document.querySelector('.dark-table tbody');
    let allRooms = [];

    async function loadRooms(page = 1, search = '') {
        if (!tableBody) return;

        tableBody.innerHTML = `
            <tr><td colspan="6" style="text-align:center;padding:40px;color:#555;">
                <i class="fas fa-circle-notch fa-spin" style="color:#f3c356;margin-right:10px;"></i>
                Memuat data kamar...
            </td></tr>
        `;

        try {
            const params = { page, limit: 10 };
            if (search) params.search = search;

            const response = await RoomService.getAll(params);
            const rooms = Array.isArray(response) ? response : (response.data || []);
            const total = response.total || rooms.length;
            const totalPages = response.totalPages || 1;

            allRooms = rooms;
            renderRoomTable(rooms);
            updatePagination(page, totalPages, total);

        } catch (err) {
            tableBody.innerHTML = `
                <tr><td colspan="6" style="text-align:center;padding:40px;color:#f44336;">
                    <i class="fas fa-exclamation-triangle" style="margin-right:8px;"></i>
                    Gagal memuat data: ${err.message}
                    <br><button onclick="loadRooms()" style="margin-top:12px;background:#f3c356;color:#000;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:12px;">
                        <i class="fas fa-redo"></i> Coba Lagi
                    </button>
                </td></tr>
            `;
        }
    }

    function renderRoomTable(rooms) {
        if (!tableBody) return;
        if (rooms.length === 0) {
            tableBody.innerHTML = `
                <tr><td colspan="6" style="text-align:center;padding:40px;color:#555;">
                    <i class="fas fa-inbox" style="font-size:32px;display:block;margin-bottom:10px;"></i>
                    Tidak ada kamar ditemukan.
                </td></tr>
            `;
            return;
        }

        tableBody.innerHTML = '';
        rooms.forEach(room => {
            const statusClass = (room.status || 'available').toLowerCase();
            const statusLabel = (room.status || 'AVAILABLE').toUpperCase();

            // FIX [N4]: Backend mengembalikan basePrice, bukan price.
            // Gunakan basePrice sebagai prioritas, fallback ke price untuk backward compat.
            const priceValue = room.basePrice || room.price;
            const price = typeof priceValue === 'number'
                ? new Intl.NumberFormat('id-ID').format(priceValue)
                : (priceValue || '-');

            const roomNumber = room.roomNumber || room.number;
            const roomType   = room.roomType   || room.type;

            const row = document.createElement('tr');
            if (statusClass === 'maintenance') row.classList.add('row-maintenance');
            row.setAttribute('data-id', room.id);
            row.innerHTML = `
                <td class="gold-text bold">${roomNumber}</td>
                <td>${roomType}</td>
                <td><span class="status ${statusClass}">• ${statusLabel}</span></td>
                <td class="muted">Floor ${room.floor || roomNumber?.charAt(0) || '-'}</td>
                <td>${price}</td>
                <td>
                    <button class="btn-detail"
                        data-id="${room.id}"
                        data-room="${roomNumber}"
                        data-type="${roomType}"
                        data-status="${statusLabel}"
                        data-price="${priceValue || ''}">
                        <i class="fas fa-pen" style="font-size:10px;margin-right:3px;"></i> Edit
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    function updatePagination(page, totalPages, total) {
        const showingEl = document.querySelector('.showing-text');
        if (showingEl) {
            showingEl.textContent = `Menampilkan halaman ${page} dari ${totalPages} (${total} kamar)`;
        }
    }

    // ==========================================
    // --- SEARCH ROOMS ---
    // ==========================================
    const searchInput = document.getElementById('searchRoom');
    let searchDebounce;
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(() => {
                loadRooms(1, e.target.value.trim());
            }, 400);
        });
    }

    // ==========================================
    // --- MODAL ADD ROOM ---
    // ==========================================
    const btnAddRoom   = document.getElementById('btnAddRoom');
    const modalAddRoom = document.getElementById('modalAddRoom');
    const formAddRoom  = document.getElementById('formAddRoom');

    if (btnAddRoom) {
        btnAddRoom.addEventListener('click', () => modalAddRoom.classList.remove('hidden'));
    }

    if (formAddRoom) {
        formAddRoom.addEventListener('submit', async (e) => {
            e.preventDefault();

            const inputs     = formAddRoom.querySelectorAll('input, select');
            const roomNumber = inputs[0].value.trim();
            const roomType   = inputs[1].value;

            let price = 2500000;
            if (roomType === 'Executive Suite')    price = 5800000;
            if (roomType === 'Presidential Suite') price = 15000000;

            // FIX [N4]: Kirim floor sebagai integer, ambil dari digit pertama nomor kamar
            const floorNumber = parseInt(roomNumber.replace(/\D/g, '').charAt(0) || '1', 10);

            const submitBtn = formAddRoom.querySelector('button[type="submit"]');
            const origText  = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            try {
                await RoomService.create({
                    number: roomNumber,
                    type:   roomType,
                    status: 'AVAILABLE',
                    price,
                    // FIX [N4]: floor sebagai integer, bukan string charAt(0)
                    floor: floorNumber,
                });

                Toast.success('Kamar baru berhasil ditambahkan!');
                modalAddRoom.classList.add('hidden');
                formAddRoom.reset();
                loadRooms();

            } catch (err) {
                Toast.error(err.message || 'Gagal menambahkan kamar.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = origText;
            }
        });
    }

    // ==========================================
    // --- MODAL EDIT ROOM ---
    // ==========================================
    const modalRoomDetail = document.getElementById('modalRoomDetail');
    const formEditRoom    = document.getElementById('formEditRoom');
    let currentEditRoomId = null;

    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-detail');
            if (!btn || !modalRoomDetail) return;

            currentEditRoomId = btn.getAttribute('data-id');
            document.getElementById('editRoomNo').value     = btn.getAttribute('data-room');
            document.getElementById('editRoomType').value   = btn.getAttribute('data-type');
            document.getElementById('editRoomStatus').value = btn.getAttribute('data-status');
            document.getElementById('editRoomPrice').value  = btn.getAttribute('data-price');

            modalRoomDetail.classList.remove('hidden');
        });
    }

    if (formEditRoom) {
        formEditRoom.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newType   = document.getElementById('editRoomType').value;
            const newStatus = document.getElementById('editRoomStatus').value;
            const newPrice  = document.getElementById('editRoomPrice').value;

            const submitBtn = formEditRoom.querySelector('button[type="submit"]');
            const origText  = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            try {
                await RoomService.update(currentEditRoomId, {
                    type:   newType,
                    status: newStatus,
                    // FIX [N4]: Kirim sebagai number, bukan string
                    price: parseFloat(newPrice.replace(/[^0-9.]/g, '')) || 0,
                });

                Toast.success('Detail kamar berhasil diupdate!');
                modalRoomDetail.classList.add('hidden');
                loadRooms();

            } catch (err) {
                Toast.error(err.message || 'Gagal mengupdate kamar.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = origText;
            }
        });
    }

    // ==========================================
    // --- CLOSE MODALS ---
    // ==========================================
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
        });
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.add('hidden');
        });
    });

    // ==========================================
    // --- INIT ---
    // ==========================================
    loadDashboardStats();
    loadRooms();
});