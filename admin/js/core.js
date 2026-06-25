// core.js - Menangani Sidebar dan Logout Global
document.addEventListener('DOMContentLoaded', () => {
    
    document.addEventListener('DOMContentLoaded', () => {
    // ... KODE LU YANG LAIN (JANGAN DIHAPUS) ...

    // ==========================================
    // --- GLOBAL CUSTOM LOGOUT MODAL (ANTI-BYPASS) ---
    // ==========================================
    
    // 1. Suntikkan HTML Modal ke dalam Body secara otomatis
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

    // 2. Gunakan Event Delegation Global pada document body
    document.body.addEventListener('click', (e) => {
        // Cari tahu apakah yang diklik adalah tombol logout atau elemen di dalamnya
        const isLogoutBtn = e.target.closest('a[href="../login.html"]');
        
        if (isLogoutBtn) {
            e.preventDefault(); // KUNCI! Jangan biarkan browser langsung redirect
            if (modalConfirmLogout) {
                modalConfirmLogout.classList.remove('hidden'); // Munculkan modal custom
            }
            return;
        }

        // Jika klik tombol Batal di dalam modal logout
        if (e.target.closest('#btnCancelLogout')) {
            if (modalConfirmLogout) {
                modalConfirmLogout.classList.add('hidden');
            }
            return;
        }

        // Jika klik tombol Keluar beneran di dalam modal logout
        if (e.target.closest('#btnConfirmLogout')) {
            window.location.href = '../login.html'; // Baru pindah halaman di sini
            return;
        }
    });
});

    // ==========================================
    // --- GLOBAL NEW BOOKING MODAL LOGIC ---
    // ==========================================
    const btnNewBooking = document.querySelector('.sidebar-action .btn-gold-full');
    const modalNewBooking = document.getElementById('modalNewBooking');
    const formNewBooking = document.getElementById('formNewBooking');

    // 1. Buka Modal
    if (btnNewBooking && modalNewBooking) {
        btnNewBooking.addEventListener('click', () => {
            modalNewBooking.classList.remove('hidden');
        });
    }

    // 2. Tutup Modal pake tombol X
    if (modalNewBooking) {
        const closeBtn = modalNewBooking.querySelector('.close-modal-booking');
        if(closeBtn) {
            closeBtn.addEventListener('click', () => {
                modalNewBooking.classList.add('hidden');
            });
        }
    }

    // Fungsi format tanggal global
    function formatDateString(dateString) {
        const d = new Date(dateString);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    }

    // 3. Logika Submit Global
    if (formNewBooking) {
        formNewBooking.addEventListener('submit', (e) => {
            e.preventDefault();

            // Ambil data
            const guestName = document.getElementById('newGuestName').value;
            const checkinRaw = document.getElementById('newCheckin').value;
            const checkoutRaw = document.getElementById('newCheckout').value;

            // Generate ID
            const randomId = Math.floor(Math.random() * 900) + 100;
            const bookingId = `#RES-${randomId}`;
            const checkinFormatted = formatDateString(checkinRaw);
            const checkoutFormatted = formatDateString(checkoutRaw);

            // CEK HALAMAN: Apakah kita lagi di halaman Reservations yang punya tabel?
            const tableBody = document.getElementById('resTableBody');
            
            if (tableBody) {
                // Kalau ada tabelnya (lagi di halaman reservation.html), tambahin baris baru!
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td class="gold-text bold">${bookingId}</td>
                    <td>${guestName}</td>
                    <td>${checkinFormatted}</td>
                    <td>${checkoutFormatted}</td>
                    <td><span class="status available">• CONFIRMED</span></td>
                    <td>
                        <button class="btn-action btn-checkin" data-action="checkin">Check-in</button>
                        <button class="btn-action-edit" data-action="edit" title="Edit Booking"><i class="fas fa-edit"></i></button>
                    </td>
                `;
                tableBody.appendChild(newRow);
            } else {
                // Kalau lagi di dashboard/halaman lain, kita pura-pura datanya udah kesimpan ke database di background
                console.log(`Booking baru dari luar halaman reservasi: ${guestName} (${bookingId})`);
            }

            // Tutup modal, reset form, munculin Toast Notif
            modalNewBooking.classList.add('hidden');
            formNewBooking.reset();
            
            if (typeof showToast === "function") {
                showToast("Booking baru berhasil dibuat!");
            }
        });
    }

    // Penanda Menu Aktif Otomatis Berdasarkan URL
    const currentLocation = location.href;
    const menuItems = document.querySelectorAll('.sidebar-menu li a');
    
    menuItems.forEach(link => {
        if(link.href === currentLocation){
            // Hapus class active dari semua li
            document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
            // Tambahkan class active ke parent li yang link-nya cocok
            link.parentElement.classList.add('active');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.querySelector('.transition-overlay');

    // Pas halaman load, overlay hilang
    setTimeout(() => overlay.style.opacity = '0', 100);

    // Pas link diklik, overlay muncul dulu baru pindah
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.getAttribute('href');
            if (target && target.startsWith('http') === false && target !== '#') {
                e.preventDefault();
                overlay.style.opacity = '1';
                setTimeout(() => window.location.href = target, 500);
            }
        });
    });
});

// --- CUSTOM TOAST FUNCTION ---
function showToast(message) {
    // Cek apakah elemen toast udah ada di halaman
    let toast = document.getElementById('customToast');
    
    // Kalau belum ada, bikin elemennya
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'customToast';
        toast.innerHTML = `<i class="fas fa-check-circle"></i> <span id="toastMessage"></span>`;
        document.body.appendChild(toast);
    }

    // Set pesannya
    document.getElementById('toastMessage').textContent = message;

    // Tampilkan toast
    toast.classList.add('show');

    // Sembunyikan otomatis setelah 3 detik
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}