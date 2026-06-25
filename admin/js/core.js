/**
 * core.js — Sidebar, Logout, Page Transition (Admin Panel)
 */
const ADMIN_ROOM_TYPE_MAP = {
    'Deluxe King': 'Standard Room',
    'Deluxe Twin': 'Standard Room',
    'Executive Suite': 'Executive Suite',
    'Presidential Suite': 'Executive Suite',
};

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // --- LOGOUT MODAL (ANTI-BYPASS) ---
    // ==========================================
    const logoutModalHTML = `
    <div id="modalConfirmLogout" class="modal-overlay hidden">
        <div class="modal-box" style="width: 350px; text-align: center; padding: 40px 20px;">
            <div style="font-size: 50px; color: var(--gold); margin-bottom: 15px;">
                <i class="fas fa-sign-out-alt"></i>
            </div>
            <h3 style="margin-bottom: 10px;">Konfirmasi Logout</h3>
            <p style="color: var(--text-muted); margin-bottom: 25px;">Yakin ingin keluar dari sistem Management?</p>
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button id="btnCancelLogout" class="btn-outline-gold" style="width: 120px; padding: 10px;">Batal</button>
                <button id="btnConfirmLogout" class="btn-gold-full" style="width: 120px; color: #000; border: none; font-weight: 600;">Keluar</button>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', logoutModalHTML);

    const modalConfirmLogout = document.getElementById('modalConfirmLogout');

    // Event delegation pada body untuk menangkap klik logout dari mana saja
    document.body.addEventListener('click', async (e) => {
        // Cek klik pada tombol logout
        const isLogoutBtn = e.target.closest('.logout-btn') || e.target.closest('a[href*="login.html"]');

        if (isLogoutBtn && modalConfirmLogout) {
            e.preventDefault();
            modalConfirmLogout.classList.remove('hidden');
            return;
        }

        if (e.target.closest('#btnCancelLogout')) {
            modalConfirmLogout.classList.add('hidden');
            return;
        }

        if (e.target.closest('#btnConfirmLogout')) {
            const confirmBtn = document.getElementById('btnConfirmLogout');
            confirmBtn.textContent = 'Logging out...';
            confirmBtn.disabled = true;

            try {
                // Panggil API logout (invalidate token di server)
                if (typeof AuthService !== 'undefined') {
                    await AuthService.logout();
                } else {
                    // Fallback: hapus token manual
                    if (typeof TokenService !== 'undefined') TokenService.clear();
                }
            } catch (_) {
                // Tetap logout meskipun API gagal
                if (typeof TokenService !== 'undefined') TokenService.clear();
            }

            window.location.href = '../login.html';
        }
    });

    // ==========================================
    // --- NEW BOOKING MODAL LOGIC ---
    // ==========================================
    const btnNewBooking = document.querySelector('.sidebar-action .btn-gold-full');
    const modalNewBooking = document.getElementById('modalNewBooking');
    const formNewBooking = document.getElementById('formNewBooking');

    if (btnNewBooking && modalNewBooking) {
        btnNewBooking.addEventListener('click', () => {
            modalNewBooking.classList.remove('hidden');
        });
    }

    if (modalNewBooking) {
        const closeBtn = modalNewBooking.querySelector('.close-modal-booking');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modalNewBooking.classList.add('hidden');
            });
        }
    }

    function formatDateDisplay(dateString) {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    if (formNewBooking) {
        formNewBooking.addEventListener('submit', async (e) => {
            e.preventDefault();

            const guestName  = document.getElementById('newGuestName').value.trim();
            const checkinRaw = document.getElementById('newCheckin').value;
            const checkoutRaw = document.getElementById('newCheckout').value;
            const roomTypeEl = document.getElementById('newRoomType');
            const roomType   = roomTypeEl ? roomTypeEl.value : '';

            // Validasi tanggal
            if (checkinRaw && checkoutRaw && new Date(checkoutRaw) <= new Date(checkinRaw)) {
                if (typeof Toast !== 'undefined') Toast.error('Tanggal check-out harus setelah check-in.');
                return;
            }

            const submitBtn = formNewBooking.querySelector('button[type="submit"]');
            const origText  = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating...';

            try {
                // Kirim ke API
                const booking = await ReservationService.create({
                    guestName,
                    checkIn:  checkinRaw,
                    checkOut: checkoutRaw,
                    roomType: ADMIN_ROOM_TYPE_MAP[roomType] || roomType,
                });

                // Update tabel di halaman reservasi jika ada
                const tableBody = document.getElementById('resTableBody');
                if (tableBody && booking) {
                    const newRow = document.createElement('tr');
                    newRow.setAttribute('data-id', booking.id);
                    newRow.innerHTML = `
                        <td class="gold-text bold">${booking.bookingCode || '#RES-???'}</td>
                        <td>${guestName}</td>
                        <td>${formatDateDisplay(checkinRaw)}</td>
                        <td>${formatDateDisplay(checkoutRaw)}</td>
                        <td><span class="status available">• CONFIRMED</span></td>
                        <td>
                            <button class="btn-action btn-checkin" data-id="${booking.id}">Check-in</button>
                            <button class="btn-action-edit" data-id="${booking.id}" title="Edit Booking"><i class="fas fa-edit"></i></button>
                        </td>
                    `;
                    tableBody.appendChild(newRow);
                }

                modalNewBooking.classList.add('hidden');
                formNewBooking.reset();
                if (typeof Toast !== 'undefined') Toast.success('Booking baru berhasil dibuat!');

            } catch (err) {
                if (typeof Toast !== 'undefined') Toast.error(err.message || 'Gagal membuat booking. Coba lagi.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = origText;
            }
        });
    }

    // ==========================================
    // --- PENANDA MENU AKTIF BERDASARKAN URL ---
    // ==========================================
    const currentLocation = location.pathname;
    const menuItems = document.querySelectorAll('.sidebar-menu li a');

    menuItems.forEach(link => {
        const linkPath = new URL(link.href, window.location.origin).pathname;
        if (linkPath === currentLocation) {
            document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
            link.parentElement.classList.add('active');
        }
    });

    // ==========================================
    // --- GLOBAL CLOSE MODAL (Klik di luar / tombol X) ---
    // ==========================================
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.add('hidden');
        });
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
        });
    });

});

// ==========================================
// --- PAGE TRANSITION (Smooth Fade) ---
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.querySelector('.transition-overlay');
    if (!overlay) return;

    // Fade out overlay saat halaman dimuat
    setTimeout(() => { overlay.style.opacity = '0'; }, 100);

    // Intercept klik link — fade in sebelum navigate
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('href');
            // Hanya intercept link internal non-anchor
            if (target && !target.startsWith('http') && target !== '#' && !target.startsWith('mailto') && !target.startsWith('javascript')) {
                // Jangan intercept logout (sudah dihandle modal)
                if (link.classList.contains('logout-btn') || link.closest('.logout-btn')) return;
                e.preventDefault();
                overlay.style.opacity = '1';
                setTimeout(() => { window.location.href = target; }, 400);
            }
        });
    });
});