/**
 * reservation.js — Admin Reservation Management
 * Full CRUD via API: load, create, edit, check-in, check-out, cancel.
 */
document.addEventListener('DOMContentLoaded', async () => {

    const tableBody    = document.getElementById('resTableBody');
    const modalEditRes = document.getElementById('modalEditRes');
    const formEditRes  = document.getElementById('formEditRes');
    let currentResId   = null;
    let allReservations = [];

    // ==========================================
    // --- LOAD RESERVATIONS ---
    // ==========================================
    async function loadReservations(search = '') {
        if (!tableBody) return;

        tableBody.innerHTML = `
            <tr><td colspan="6" style="text-align:center;padding:40px;color:#555;">
                <i class="fas fa-circle-notch fa-spin" style="color:#f3c356;margin-right:10px;"></i>
                Memuat data reservasi...
            </td></tr>
        `;

        try {
            const params = {};
            if (search) params.search = search;
            const response = await ReservationService.getAll(params);
            allReservations = Array.isArray(response) ? response : (response.data || []);
            renderTable(allReservations);
        } catch (err) {
            tableBody.innerHTML = `
                <tr><td colspan="6" style="text-align:center;padding:40px;color:#f44336;">
                    <i class="fas fa-exclamation-triangle" style="margin-right:8px;"></i>
                    ${err.message || 'Gagal memuat reservasi.'}
                    <br><button type="button" class="btn-retry-reservations" style="margin-top:12px;background:#f3c356;color:#000;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-size:12px;">
                        <i class="fas fa-redo"></i> Coba Lagi
                    </button>
                </td></tr>
            `;
        }
    }

    function formatDateDisplay(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    function getStatusClass(status) {
        const s = (status || '').toUpperCase();
        if (s === 'CONFIRMED') return 'available';
        if (s === 'CHECKED_IN' || s === 'OCCUPIED') return 'occupied';
        if (s === 'CHECKED_OUT') return 'maintenance';
        if (s === 'CANCELLED') return 'maintenance';
        return 'available';
    }

    function getActionButton(reservation) {
        const status = (reservation.status || '').toUpperCase();
        if (status === 'CONFIRMED') {
            return `<button class="btn-action btn-checkin" data-id="${reservation.id}">Check-in</button>`;
        }
        if (status === 'CHECKED_IN' || status === 'OCCUPIED') {
            return `<button class="btn-action btn-checkout" data-id="${reservation.id}">Check-out</button>`;
        }
        return '';
    }

    function renderTable(reservations) {
        if (!tableBody) return;
        if (reservations.length === 0) {
            tableBody.innerHTML = `
                <tr><td colspan="6" style="text-align:center;padding:40px;color:#555;">
                    <i class="far fa-calendar-times" style="font-size:32px;display:block;margin-bottom:10px;"></i>
                    Tidak ada reservasi.
                </td></tr>
            `;
            return;
        }

        tableBody.innerHTML = '';
        reservations.forEach(res => {
            const row = document.createElement('tr');
            row.setAttribute('data-id', res.id);
            row.innerHTML = `
                <td class="gold-text bold">${res.bookingCode || res.id}</td>
                <td>${res.guestName || res.guest?.name || '-'}</td>
                <td>${formatDateDisplay(res.checkIn)}</td>
                <td>${formatDateDisplay(res.checkOut)}</td>
                <td><span class="status ${getStatusClass(res.status)}">• ${(res.status || 'CONFIRMED').toUpperCase()}</span></td>
                <td>
                    ${getActionButton(res)}
                    <button class="btn-action-edit" data-id="${res.id}" title="Edit Booking">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // ==========================================
    // --- SEARCH ---
    // ==========================================
    const searchInput = document.getElementById('searchRes');
    let searchDebounce;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchDebounce);
            searchDebounce = setTimeout(() => {
                loadReservations(e.target.value.trim());
            }, 400);
        });
    }

    // ==========================================
    // --- TABLE CLICK DELEGATION ---
    // ==========================================
    if (tableBody) {
        tableBody.addEventListener('click', async (e) => {
            if (e.target.closest('.btn-retry-reservations')) {
                loadReservations();
                return;
            }
            const row = e.target.closest('tr');
            if (!row) return;
            const resId = row.getAttribute('data-id');

            // --- A. EDIT BUTTON ---
            if (e.target.closest('.btn-action-edit')) {
                currentResId = resId;
                const res = allReservations.find(r => String(r.id) === String(resId));
                if (res && modalEditRes) {
                    document.getElementById('editGuestName').value = res.guestName || res.guest?.name || '';
                    document.getElementById('editCheckin').value    = res.checkIn ? res.checkIn.split('T')[0] : '';
                    document.getElementById('editCheckout').value   = res.checkOut ? res.checkOut.split('T')[0] : '';
                    const statusEl = document.getElementById('editResStatus');
                    if (statusEl) statusEl.value = (res.status || 'CONFIRMED').toUpperCase();
                    modalEditRes.classList.remove('hidden');
                }
                return;
            }

            // --- B. CHECK-IN ---
            if (e.target.closest('.btn-checkin')) {
                const btn = e.target.closest('.btn-checkin');
                const id  = btn.getAttribute('data-id');
                const res = allReservations.find(r => String(r.id) === String(id));
                const name = res?.guestName || res?.guest?.name || 'tamu';

                if (!confirm(`Konfirmasi Check-in untuk: ${name}?`)) return;

                btn.disabled = true;
                btn.textContent = 'Processing...';
                try {
                    await ReservationService.checkIn(id);
                    Toast.success(`Check-in ${name} berhasil!`);
                    loadReservations();
                } catch (err) {
                    Toast.error(err.message || 'Gagal melakukan check-in.');
                    btn.disabled = false;
                    btn.textContent = 'Check-in';
                }
                return;
            }

            // --- C. CHECK-OUT ---
            if (e.target.closest('.btn-checkout')) {
                const btn = e.target.closest('.btn-checkout');
                const id  = btn.getAttribute('data-id');
                const res = allReservations.find(r => String(r.id) === String(id));
                const name = res?.guestName || res?.guest?.name || 'tamu';

                if (!confirm(`Konfirmasi Check-out untuk: ${name}?`)) return;

                btn.disabled = true;
                btn.textContent = 'Processing...';
                try {
                    await ReservationService.checkOut(id);
                    Toast.success(`Check-out ${name} berhasil!`);
                    loadReservations();
                } catch (err) {
                    Toast.error(err.message || 'Gagal melakukan check-out.');
                    btn.disabled = false;
                    btn.textContent = 'Check-out';
                }
            }
        });
    }

    // ==========================================
    // --- SAVE EDIT RESERVATION ---
    // ==========================================
    if (formEditRes) {
        formEditRes.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newName    = document.getElementById('editGuestName').value.trim();
            const newCheckin = document.getElementById('editCheckin').value;
            const newCheckout = document.getElementById('editCheckout').value;
            const newStatus  = document.getElementById('editResStatus').value;

            // Validasi tanggal
            if (newCheckin && newCheckout && new Date(newCheckout) <= new Date(newCheckin)) {
                Toast.error('Tanggal check-out harus setelah check-in.');
                return;
            }

            const submitBtn = formEditRes.querySelector('button[type="submit"]');
            const origText  = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';

            try {
                await ReservationService.update(currentResId, {
                    guestName: newName,
                    checkIn:   newCheckin,
                    checkOut:  newCheckout,
                    status:    newStatus,
                });

                Toast.success('Data reservasi berhasil diupdate!');
                modalEditRes.classList.add('hidden');
                loadReservations();

            } catch (err) {
                Toast.error(err.message || 'Gagal mengupdate reservasi.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = origText;
            }
        });
    }

    // ==========================================
    // --- CLOSE MODAL ---
    // ==========================================
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            if (modalEditRes) modalEditRes.classList.add('hidden');
        });
    });

    // ==========================================
    // --- INIT ---
    // ==========================================
    loadReservations();
});