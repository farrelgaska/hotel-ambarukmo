document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.querySelector('.transition-overlay');
    const bookButtons = document.querySelectorAll('.btn-card-action:not(.btn-unavailable)');
    const navBookBtn = document.querySelector('.main-navbar .btn-book-now');
    
    // --- LOGIKA UTAMA: CEK SESSION GUEST ---
    const btnLoginNav = document.querySelector('.main-navbar .btn-login');
    const savedGuestName = localStorage.getItem('guestName');

    if (savedGuestName && btnLoginNav) {
        btnLoginNav.innerHTML = `<i class="fas fa-user-circle" style="color: #f3c356; margin-right: 6px;"></i> ${savedGuestName.toUpperCase()}`;
        btnLoginNav.href = "#"; 
        btnLoginNav.style.color = "#141311"; 
        btnLoginNav.title = "Klik untuk Logout dari Portal";

        // --- PREMIUM LOGOUT MODAL INTERACTION ---
        btnLoginNav.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (document.getElementById('customLogoutModal')) return;

            // Suntik struktur modal mewah ke dalam DOM
            const modalHTML = `
            <div id="customLogoutModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 9, 8, 0.7); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); z-index: 99999; display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s ease;">
                <div style="background: #141311; border: 1px solid #2a2a2a; border-top: 3px solid #f3c356; padding: 35px 30px; width: 100%; max-width: 380px; border-radius: 4px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.3); transform: translateY(-20px); transition: transform 0.3s ease;" id="logoutModalCard">
                    <div style="margin-bottom: 20px;">
                        <i class="fas fa-sign-out-alt" style="color: #f3c356; font-size: 36px;"></i>
                    </div>
                    <h3 style="font-family: 'Playfair Display', serif; color: #fff; font-size: 20px; margin-bottom: 10px; font-weight: 500; letter-spacing: 0.5px;">LOGOUT PORTAL</h3>
                    <p style="color: #aaa; font-size: 12.5px; line-height: 1.6; margin-bottom: 30px; font-family: 'Inter', sans-serif;">Apakah Anda yakin ingin keluar dari Portal Guest Hotel Ambarukmo?</p>
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button id="btnConfirmLogout" style="background: #f3c356; color: #000; border: none; padding: 12px 24px; font-size: 11px; font-weight: 700; letter-spacing: 1px; cursor: pointer; border-radius: 2px; flex: 1; font-family: 'Inter', sans-serif; transition: background 0.2s;">YA, KELUAR</button>
                        <button id="btnCancelLogout" style="background: transparent; color: #fff; border: 1px solid #444; padding: 12px 24px; font-size: 11px; font-weight: 700; letter-spacing: 1px; cursor: pointer; border-radius: 2px; flex: 1; font-family: 'Inter', sans-serif; transition: all 0.2s;">BATAL</button>
                    </div>
                </div>
            </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            const modal = document.getElementById('customLogoutModal');
            const card = document.getElementById('logoutModalCard');
            const btnConfirm = document.getElementById('btnConfirmLogout');
            const btnCancel = document.getElementById('btnCancelLogout');
            
            // Animasi transisi masuk
            setTimeout(() => {
                modal.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
            
            // Efek hover tombol dinamis via JS
            btnConfirm.addEventListener('mouseover', () => btnConfirm.style.background = '#e5b645');
            btnConfirm.addEventListener('mouseout', () => btnConfirm.style.background = '#f3c356');
            
            btnCancel.addEventListener('mouseover', () => {
                btnCancel.style.background = '#fff';
                btnCancel.style.color = '#000';
                btnCancel.style.borderColor = '#fff';
            });
            btnCancel.addEventListener('mouseout', () => {
                btnCancel.style.background = 'transparent';
                btnCancel.style.color = '#fff';
                btnCancel.style.borderColor = '#444';
            });

            // Eksekusi Hapus Session saat klik Ya
            btnConfirm.addEventListener('click', () => {
                localStorage.removeItem('guestName');
                window.location.reload();
            });
            
            // Fungsi tutup modal
            const closeModal = () => {
                modal.style.opacity = '0';
                card.style.transform = 'translateY(-20px)';
                setTimeout(() => modal.remove(), 300);
            };
            
            btnCancel.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        });
    }

    // --- LOGIKA PERPINDAHAN HALAMAN BOOKING ---
    bookButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            const roomCard = button.closest('.room-premium-card');
            const roomName = roomCard.querySelector('h3').textContent;
            const roomPrice = roomCard.querySelector('.card-price').textContent.split('/')[0].trim();

            if (overlay) {
                overlay.classList.add('active');
            }

            setTimeout(() => {
                window.location.href = `booking.html?room=${encodeURIComponent(roomName)}&price=${encodeURIComponent(roomPrice)}`;
            }, 400);
        });
    });

    // --- LOGIKA SMOOTH SCROLL NAVBAR ---
    if (navBookBtn) {
        navBookBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = document.querySelector('.accommodations-section');
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});