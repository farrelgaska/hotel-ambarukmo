document.addEventListener('DOMContentLoaded', () => {

    function triggerToast(message, type = 'success') {
        const borderColor = type === 'success' ? '#f3c356' : '#e74c3c';
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        const iconColor = type === 'success' ? '#4caf50' : '#e74c3c';

        const toastHTML = `
        <div id="authToast" style="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background-color: #141311; border: 1px solid ${borderColor}; color: #fff; padding: 15px 25px; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); z-index: 10000; display: flex; align-items: center; gap: 12px; font-family: 'Inter', sans-serif; transition: all 0.3s ease; opacity: 0; transform: translateX(-50%) translateY(-20px);">
            <i class="fas ${icon}" style="color: ${iconColor}; font-size: 18px;"></i> 
            <span style="font-weight: 500; font-size: 13px; letter-spacing: 0.5px;">${message}</span>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', toastHTML);
        
        const authToast = document.getElementById('authToast');
        setTimeout(() => { 
            authToast.style.opacity = '1'; 
            authToast.style.transform = 'translateX(-50%) translateY(0)';
        }, 50);
    }

    // --- LOGIKA LOGIN ---
    const formLogin = document.getElementById('formGuestLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();
            const userRaw = document.getElementById('loginUser').value;
            
            // Trik ambil nama depan sebelum karakter '@' kalau semisal inputnya email
            const displayName = userRaw.split('@')[0]; 
            
            // Kunci nama ke dalam storage browser
            localStorage.setItem('guestName', displayName);

            triggerToast(`Login Berhasil! Selamat datang kembali, ${displayName}.`);
            document.body.style.cursor = "wait";
            
            setTimeout(() => {
                window.location.href = '../dashboard.html'; 
            }, 1500);
        });
    }

    // --- LOGIKA REGISTER ---
    const formRegister = document.getElementById('formGuestRegister');
    if (formRegister) {
        formRegister.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value;

            triggerToast(`Registrasi Sukses! Akun ${name} berhasil dibuat.`, 'success');
            document.body.style.cursor = "wait";

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        });
    }

    // --- LOGIKA FORGOT PASSWORD ---
    const formForgot = document.getElementById('formGuestForgot');
    if (formForgot) {
        formForgot.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('forgotEmail').value;

            triggerToast(`Link pemulihan telah dikirim ke ${email}. Silakan cek inbox Anda.`, 'success');
            document.body.style.cursor = "wait";

            // Cari blok formLogin.addEventListener di file JS lu, ubah bagian redirect-nya:
            setTimeout(() => {
                window.location.href = '../dashboard.html'; // Ditambahkan ../ biar keluar folder login
            }, 1500);
        });
    }
});